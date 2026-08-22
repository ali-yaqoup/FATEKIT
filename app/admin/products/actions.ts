"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateProductQuickAction(id: string, price: number, quantity: number) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  await db.product.update({
    where: { id },
    data: { 
      price,
      quantity 
    }
  });

  revalidatePath("/shop");
  revalidatePath(`/product/[slug]`, 'page');
  revalidatePath("/admin/products");
  revalidatePath("/");
}
