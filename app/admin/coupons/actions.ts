"use server";

import { db } from "@/lib/db";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole, CouponType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCouponAction(data: {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const existing = await db.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) {
    throw new Error("هذا الكود موجود بالفعل.");
  }

  await db.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount || null,
      usageLimit: data.usageLimit || null,
      isActive: true,
    }
  });

  revalidatePath("/admin/coupons");
}
