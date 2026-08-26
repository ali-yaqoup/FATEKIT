"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateStoreSettingsAction(data: {
  storeName: string;
  phone: string;
  email: string;
  whatsapp: string;
  deliveryFee: number;
  freeShippingMinimum: number;
  deliveryAreas: string[];
}) {
  await requireAdminRole([AdminRole.OWNER]);

  const storeName = data.storeName.trim() || "FATEKIT";
  const deliveryFee = Math.max(0, Number(data.deliveryFee) || 0);
  const freeShippingMinimum = Math.max(0, Number(data.freeShippingMinimum) || 0);

  await db.storeSettings.upsert({
    where: { id: "main" },
    update: {
      storeName,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      whatsapp: data.whatsapp.trim() || null,
      deliveryFee,
      freeShippingMinimum,
      deliveryAreas: data.deliveryAreas.map((area) => area.trim()).filter(Boolean),
    },
    create: {
      id: "main",
      storeName,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      whatsapp: data.whatsapp.trim() || null,
      deliveryFee,
      freeShippingMinimum,
      deliveryAreas: data.deliveryAreas.map((area) => area.trim()).filter(Boolean),
    },
  });

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
}
