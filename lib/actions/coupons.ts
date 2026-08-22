"use server";

import { db } from "@/lib/db";
import { CouponType } from "@prisma/client";

export async function validateCouponAction(code: string, subtotal: number) {
  try {
    if (!code || !code.trim()) {
      return { success: false, error: "الرجاء إدخال كود الكوبون" };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "كوبون الخصم غير صالح أو منتهي الصلاحية" };
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return { success: false, error: "كوبون الخصم لم يبدأ بعد" };
    }

    if (coupon.endDate && coupon.endDate < now) {
      return { success: false, error: "كوبون الخصم انتهت صلاحيته" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: "تم الوصول إلى الحد الأقصى لاستخدام الكوبون" };
    }

    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      return {
        success: false,
        error: `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${minAmount} ₪`,
      };
    }

    let discountAmount = 0;
    const value = Number(coupon.value);

    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (subtotal * value) / 100;
    } else {
      discountAmount = value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: value,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { success: false, error: "حدث خطأ أثناء فحص الكوبون" };
  }
}
