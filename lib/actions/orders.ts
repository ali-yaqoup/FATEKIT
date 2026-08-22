"use server";

import { db } from "@/lib/db";
import { OrderStatus, CouponType } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";

export interface CheckoutItemInput {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  deliveryNotes?: string;
  couponCode?: string;
  items: CheckoutItemInput[];
}

export async function createOrderAction(input: CheckoutInput) {
  try {
    if (!input.customerName || !input.customerName.trim()) {
      return { success: false, error: "الرجاء إدخال اسم العميل الكامل" };
    }
    if (!input.customerPhone || !input.customerPhone.trim()) {
      return { success: false, error: "الرجاء إدخال رقم هاتف العميل للتواصل" };
    }
    if (!input.shippingAddress || !input.shippingAddress.trim()) {
      return { success: false, error: "الرجاء إدخال عنوان التوصيل بالتفصيل" };
    }
    if (!input.shippingCity || !input.shippingCity.trim()) {
      return { success: false, error: "الرجاء تحديد مدينة التوصيل" };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "سلة المشتريات فارغة، لا يمكن إتمام الطلب" };
    }

    const cleanPhone = input.customerPhone.trim();
    const cleanName = input.customerName.trim();
    const cleanEmail = input.customerEmail?.trim() || null;

    // Calculate subtotal from line items
    const subtotal = input.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );

    if (subtotal <= 0) {
      return { success: false, error: "قيمة المشتريات غير صحيحة" };
    }

    // Calculate delivery fee based on store settings
    const settings = await db.storeSettings.findUnique({ where: { id: "main" } });
    const standardFee = settings ? Number(settings.deliveryFee) : 30;
    const freeShippingMin = settings?.freeShippingMinimum ? Number(settings.freeShippingMinimum) : 350;
    const shippingFee = subtotal >= freeShippingMin ? 0 : standardFee;

    // Validate coupon if provided
    let discount = 0;
    let couponId: string | null = null;

    if (input.couponCode && input.couponCode.trim()) {
      const coupon = await db.coupon.findUnique({
        where: { code: input.couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const validDates =
          (!coupon.startDate || coupon.startDate <= now) &&
          (!coupon.endDate || coupon.endDate >= now);
        const validUsage = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        const validMin = !coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount);

        if (validDates && validUsage && validMin) {
          couponId = coupon.id;
          const val = Number(coupon.value);
          if (coupon.type === CouponType.PERCENTAGE) {
            discount = (subtotal * val) / 100;
          } else {
            discount = val;
          }
          discount = Math.min(discount, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discount);

    // Generate unique order number (e.g. FK-8291)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FK-${randomSuffix}`;

    // Execute in Prisma Transaction with generous timeout for remote DB latency
    const result = await db.$transaction(
      async (tx) => {
        // 1. Customer Upsert by phone
        let customer = await tx.customer.findUnique({
          where: { phone: cleanPhone },
        });

        if (customer) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: cleanName,
              email: cleanEmail || customer.email,
              ordersCount: { increment: 1 },
              totalSpent: { increment: total },
              lastOrderAt: new Date(),
            },
          });
        } else {
          customer = await tx.customer.create({
            data: {
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              ordersCount: 1,
              totalSpent: total,
              lastOrderAt: new Date(),
            },
          });
        }

        // 2. Create Order record with line items
        const order = await tx.order.create({
          data: {
            orderNumber,
            status: OrderStatus.NEW,
            customerId: customer.id,
            shippingAddress: input.shippingAddress.trim(),
            shippingCity: input.shippingCity.trim(),
            deliveryNotes: input.deliveryNotes?.trim() || null,
            subtotal,
            shippingFee,
            discount,
            total,
            paymentMethod: "COD", // Always Cash on Delivery
            couponId,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId || null,
                productNameSnapshot: item.productName,
                variantNameSnapshot: item.variantName || null,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
                total: Number(item.unitPrice) * item.quantity,
              })),
            },
          },
        });

        // 3. Decrement Inventory per item
        for (const item of input.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          }
        }

        // 4. Increment Coupon usage if coupon used
        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: {
              usageCount: { increment: 1 },
            },
          });
        }

        return order;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      total: Number(result.total),
    };
  } catch (error) {
    console.error("Error creating order in DB:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إنشاء الطلب في قاعدة البيانات، يرجى المحاولة لاحقاً.",
    };
  }
}

/**
 * Admin: change an order's status.
 * Inventory rule (PROJECT_BRIEF §4.1): stock is decremented once at checkout.
 * Moving an order INTO CANCELLED restocks the items exactly once;
 * moving it OUT of CANCELLED re-decrements them again.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    // Only authenticated admins may mutate orders
    const session = await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

    if (!orderId || !Object.values(OrderStatus).includes(newStatus)) {
      return { success: false, error: "بيانات التحديث غير صالحة." };
    }

    const result = await db.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: {
              include: { variant: true, product: true },
            },
          },
        });

        if (!order) {
          return { ok: false as const, error: "الطلب غير موجود." };
        }

        if (order.status === newStatus) {
          return { ok: true as const };
        }

        const wasCancelled = order.status === OrderStatus.CANCELLED;
        const willBeCancelled = newStatus === OrderStatus.CANCELLED;

        if (!wasCancelled && willBeCancelled) {
          // Restock every line item exactly once
          for (const item of order.items) {
            if (item.variantId && item.variant) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { quantity: { increment: item.quantity } },
              });
            } else if (item.product) {
              await tx.product.update({
                where: { id: item.productId },
                data: { quantity: { increment: item.quantity } },
              });
            }
          }
        } else if (wasCancelled && !willBeCancelled) {
          // Re-activating a cancelled order → take the stock back out
          for (const item of order.items) {
            if (item.variantId && item.variant) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { quantity: { decrement: item.quantity } },
              });
            } else if (item.product) {
              await tx.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } },
              });
            }
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });

        return { ok: true as const };
      },
      { maxWait: 15000, timeout: 30000 }
    );

    if (!result.ok) {
      return { success: false, error: result.error };
    }

    console.log(
      `Admin ${session.email} changed order ${orderId} status to ${newStatus}`
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء تحديث حالة الطلب، يرجى المحاولة لاحقاً.",
    };
  }
}
