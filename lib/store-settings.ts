import { db } from "@/lib/db";

export async function getStoreSettings() {
  const settings = await db.storeSettings.findUnique({ where: { id: "main" } });

  return {
    storeName: settings?.storeName || "FATEKIT",
    logoUrl: settings?.logoUrl || null,
    phone: settings?.phone || "+970 599 000 000",
    email: settings?.email || "",
    whatsapp: settings?.whatsapp || settings?.phone || "+970 599 000 000",
    deliveryFee: settings ? Number(settings.deliveryFee) : 30,
    freeShippingMinimum:
      settings?.freeShippingMinimum != null ? Number(settings.freeShippingMinimum) : 350,
    deliveryAreas: settings?.deliveryAreas ?? [],
  };
}
