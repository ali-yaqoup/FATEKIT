"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateHomepageContent(data: {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  promoText: string;
  heroImageUrl: string;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.homepageContent.upsert({
    where: { id: "main" },
    update: data,
    create: {
      id: "main",
      ...data,
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function updateFeaturedCategory(id: string, imageUrl: string) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.featuredCategory.update({
    where: { id },
    data: { imageUrl }
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
