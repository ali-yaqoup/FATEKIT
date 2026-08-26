"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { toSlug } from "@/lib/slug";

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

async function uniqueProductSlug(base: string, excludeId?: string) {
  let slug = toSlug(base);
  let n = 2;
  while (true) {
    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${toSlug(base)}-${n}`;
    n += 1;
  }
}

function isUniqueConstraint(error: unknown, field: string) {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  if ((error as { code?: string }).code !== "P2002") return false;
  const target = (error as { meta?: { target?: string[] } }).meta?.target ?? [];
  return target.includes(field);
}

function toSaveError(error: unknown): Error {
  if (isUniqueConstraint(error, "sku")) {
    return new Error("كود المنتج (SKU) مستخدم مسبقاً. غيّريه أو اتركيه فارغ.");
  }
  if (isUniqueConstraint(error, "slug")) {
    return new Error("يوجد منتج بنفس الاسم. غيّري الاسم قليلاً.");
  }
  if (error instanceof Error && !error.message.startsWith("Invalid `prisma.")) {
    return error;
  }
  return new Error("تعذر حفظ المنتج. حاول مرة أخرى.");
}

async function findProductBySku(sku: string | null) {
  if (!sku) return null;
  return db.product.findUnique({ where: { sku } });
}

export async function updateProductQuickAction(id: string, price: number, quantity: number) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.product.update({
    where: { id },
    data: {
      price,
      quantity,
    },
  });

  revalidateCatalog();
  revalidatePath("/product/[slug]", "page");
}

export async function deleteProductImageAction(imageId: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.productImage.delete({
    where: { id: imageId },
  });

  revalidateCatalog();
  revalidatePath("/product/[slug]", "page");
}

export async function addProductImageAction(productId: string, url: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const last = await db.productImage.findFirst({
    where: { productId },
    orderBy: { sortOrder: "desc" },
  });

  await db.productImage.create({
    data: {
      productId,
      url,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidateCatalog();
  revalidatePath("/product/[slug]", "page");
}

export async function archiveProductAction(id: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.product.update({
    where: { id },
    data: { isArchived: true, status: ProductStatus.INACTIVE },
  });

  revalidateCatalog();
}

export async function saveProductAction(input: {
  id?: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  quantity: number;
  description: string;
  details: string;
  ingredients: string;
  usageInstructions: string;
  status: ProductStatus;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  variants: {
    id?: string;
    name: string;
    colorCode?: string | null;
    quantity: number;
    price?: number | null;
  }[];
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const name = input.name.trim();
  if (!name) throw new Error("اسم المنتج مطلوب.");
  if (!input.categoryId) throw new Error("التصنيف مطلوب.");
  if (input.price < 0) throw new Error("السعر لا يمكن أن يكون سالباً.");

  const compareAtPrice =
    input.compareAtPrice != null && input.compareAtPrice > 0 ? input.compareAtPrice : null;
  const discountPercent =
    compareAtPrice && compareAtPrice > input.price
      ? Math.round(((compareAtPrice - input.price) / compareAtPrice) * 100)
      : null;

  try {
    const sku = input.sku.trim() || null;
    const data = {
      name,
      brand: input.brand.trim() || "FATEKIT",
      categoryId: input.categoryId,
      price: input.price,
      compareAtPrice,
      discountPercent,
      sku,
      quantity: input.quantity,
      description: input.description.trim() || null,
      details: input.details.trim() || null,
      ingredients: input.ingredients.trim() || null,
      usageInstructions: input.usageInstructions.trim() || null,
      status: input.status,
      isNew: input.isNew,
      isBestseller: input.isBestseller,
      isFeatured: input.isFeatured,
    };

    let productId = input.id;

    if (productId) {
      const skuOwner = await findProductBySku(sku);
      if (skuOwner && skuOwner.id !== productId) {
        throw new Error("كود المنتج (SKU) مستخدم مسبقاً. غيّريه أو اتركيه فارغ.");
      }
      await db.product.update({
        where: { id: productId },
        data,
      });
    } else {
      const skuOwner = await findProductBySku(sku);
      if (skuOwner && skuOwner.name === name) {
        productId = skuOwner.id;
        await db.product.update({ where: { id: productId }, data });
      } else if (skuOwner) {
        throw new Error("كود المنتج (SKU) مستخدم مسبقاً. غيّريه أو اتركيه فارغ.");
      } else {
        const created = await db.product.create({
          data: {
            ...data,
            slug: await uniqueProductSlug(name),
          },
        });
        productId = created.id;
      }
    }

    if (!productId) {
      throw new Error("تعذر حفظ المنتج. حاول مرة أخرى.");
    }

    const keepIds = input.variants.map((variant) => variant.id).filter((id): id is string => Boolean(id));
    if (keepIds.length === 0) {
      await db.productVariant.deleteMany({ where: { productId } });
    } else {
      await db.productVariant.deleteMany({
        where: { productId, id: { notIn: keepIds } },
      });
    }

    for (const variant of input.variants) {
      const variantName = variant.name.trim();
      if (!variantName) continue;
      const variantData = {
        name: variantName,
        colorCode: variant.colorCode?.trim() || null,
        quantity: Math.max(0, variant.quantity),
        price: variant.price != null && variant.price > 0 ? variant.price : null,
      };

      if (variant.id) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: variantData,
        });
      } else {
        await db.productVariant.create({
          data: { ...variantData, productId },
        });
      }
    }

    revalidateCatalog();
    revalidatePath(`/product/${toSlug(name)}`);
    return { id: productId };
  } catch (error) {
    throw toSaveError(error);
  }
}
