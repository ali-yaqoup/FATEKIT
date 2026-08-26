"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { toSlug } from "@/lib/slug";

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let slug = toSlug(base);
  let n = 2;
  while (true) {
    const existing = await db.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${toSlug(base)}-${n}`;
    n += 1;
  }
}

export async function createCategoryAction(data: {
  name: string;
  parentId?: string | null;
  imageUrl?: string | null;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const name = data.name.trim();
  if (!name) throw new Error("اسم التصنيف مطلوب.");

  await db.category.create({
    data: {
      name,
      slug: await uniqueCategorySlug(name),
      parentId: data.parentId || null,
      imageUrl: data.imageUrl || null,
      isActive: true,
      sortOrder: 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(id: string, data: {
  name: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string | null;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const name = data.name.trim();
  if (!name) throw new Error("اسم التصنيف مطلوب.");

  await db.category.update({
    where: { id },
    data: {
      name,
      isActive: data.isActive,
      sortOrder: Number(data.sortOrder) || 0,
      imageUrl: data.imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const productsCount = await db.product.count({ where: { categoryId: id, isArchived: false } });
  if (productsCount > 0) {
    throw new Error("لا يمكن حذف تصنيف مرتبط بمنتجات. انقلي المنتجات أولاً أو عطّلي التصنيف.");
  }

  await db.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}
