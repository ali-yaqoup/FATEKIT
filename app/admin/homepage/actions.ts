"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateHomepageContent(data: {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  promoText: string;
  promoActive: boolean;
  statementText: string;
  statementActive: boolean;
  instagramTitle: string;
  instagramActive: boolean;
  heroImageUrl: string;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.homepageContent.upsert({
    where: { id: "main" },
    update: data,
    create: {
      id: "main",
      ...data,
    },
  });

  revalidateHome();
}

export async function updateFeaturedCategory(id: string, imageUrl: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.featuredCategory.update({
    where: { id },
    data: { imageUrl },
  });

  revalidateHome();
}

export async function addFeaturedCategoryAction(categoryId: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const last = await db.featuredCategory.findFirst({ orderBy: { sortOrder: "desc" } });
  await db.featuredCategory.create({
    data: {
      categoryId,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidateHome();
}

export async function addInstagramImageAction(imageUrl: string, linkUrl?: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const last = await db.instagramImage.findFirst({ orderBy: { sortOrder: "desc" } });
  await db.instagramImage.create({
    data: {
      imageUrl,
      linkUrl: linkUrl || null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidateHome();
}

export async function deleteInstagramImageAction(id: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  await db.instagramImage.delete({ where: { id } });
  revalidateHome();
}
