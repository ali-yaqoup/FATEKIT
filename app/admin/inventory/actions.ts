"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateInventoryQuantityAction(input: {
  productId?: string;
  variantId?: string;
  quantity: number;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const quantity = Math.max(0, Number(input.quantity) || 0);

  if (input.variantId) {
    await db.productVariant.update({
      where: { id: input.variantId },
      data: { quantity },
    });
  } else if (input.productId) {
    await db.product.update({
      where: { id: input.productId },
      data: { quantity },
    });
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
