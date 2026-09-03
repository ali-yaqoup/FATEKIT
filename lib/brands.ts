import { db } from "@/lib/db";

export async function getActiveBrands() {
  const rows = await db.product.findMany({
    where: {
      status: "ACTIVE",
      isArchived: false,
      brand: { not: null },
    },
    distinct: ["brand"],
    select: { brand: true },
    orderBy: { brand: "asc" },
  });

  return rows
    .map((row) => row.brand?.trim())
    .filter((brand): brand is string => Boolean(brand));
}
