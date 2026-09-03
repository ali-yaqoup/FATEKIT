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

function uniqueConstraintTarget(error: unknown): unknown {
  if (!error || typeof error !== "object" || !("meta" in error)) return undefined;
  return (error as { meta?: { target?: unknown } }).meta?.target;
}

function uniqueConstraintCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  return (error as { code?: string }).code;
}

function uniqueConstraintMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return "";
}

function targetIncludesField(target: unknown, field: string) {
  const needle = field.toLowerCase();
  if (Array.isArray(target)) {
    return target.some((item) => String(item).toLowerCase().includes(needle));
  }
  if (typeof target === "string") return target.toLowerCase().includes(needle);
  return false;
}

function isUniqueConstraint(error: unknown, field: string) {
  const message = uniqueConstraintMessage(error);
  const target = uniqueConstraintTarget(error);
  const isP2002 = uniqueConstraintCode(error) === "P2002";
  const mentionsUnique =
    isP2002 || message.includes("Unique constraint") || message.includes("القيد الفريد");
  if (!mentionsUnique) return false;
  if (targetIncludesField(target, field)) return true;
  return (
    message.includes(`('${field}')`) ||
    message.includes(`'${field}'`) ||
    message.includes(`\`${field}\``)
  );
}

function toSaveError(error: unknown): Error {
  if (error instanceof Error && !isUniqueConstraint(error, "sku") && !isUniqueConstraint(error, "slug")) {
    if (
      !error.message.startsWith("Invalid `prisma.") &&
      !error.message.includes("prisma.product") &&
      !error.message.startsWith("استدعاء 'prisma.")
    ) {
      return error;
    }
  }
  if (isUniqueConstraint(error, "sku")) {
    return new Error(
      "كود المنتج (SKU) مستخدم مسبقاً. اختاري كوداً آخر أو اتركيه فارغاً ليتم توليده تلقائياً."
    );
  }
  if (isUniqueConstraint(error, "slug")) {
    return new Error("يوجد منتج بنفس الاسم. غيّري الاسم قليلاً.");
  }
  return new Error("تعذر حفظ المنتج. حاول مرة أخرى.");
}

async function skuIsTaken(sku: string, excludeId?: string) {
  const existing = await db.product.findFirst({
    where: {
      sku: { equals: sku, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  return Boolean(existing);
}

async function uniqueGeneratedSku(excludeId?: string) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const sku = `FK-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    if (!(await skuIsTaken(sku, excludeId))) return sku;
  }
  throw new Error("تعذر توليد كود منتج فريد. حاولي مرة أخرى.");
}

async function resolveProductSku(raw: string, excludeId?: string) {
  const sku = raw.trim();
  if (!sku) return uniqueGeneratedSku(excludeId);
  if (await skuIsTaken(sku, excludeId)) {
    throw new Error(
      "كود المنتج (SKU) مستخدم مسبقاً. اختاري كوداً آخر أو اتركيه فارغاً ليتم توليده تلقائياً."
    );
  }
  return sku;
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
    const requestedSku = input.sku.trim();
    const sku = await resolveProductSku(requestedSku, input.id);
    const data = {
      name,
      brand: input.brand.trim() || null,
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
      await db.product.update({
        where: { id: productId },
        data,
      });
    } else {
      try {
        const created = await db.product.create({
          data: {
            ...data,
            slug: await uniqueProductSlug(name),
          },
        });
        productId = created.id;
      } catch (error) {
        if (!requestedSku && isUniqueConstraint(error, "sku")) {
          const created = await db.product.create({
            data: {
              ...data,
              sku: await uniqueGeneratedSku(),
              slug: await uniqueProductSlug(name),
            },
          });
          productId = created.id;
        } else {
          throw error;
        }
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
