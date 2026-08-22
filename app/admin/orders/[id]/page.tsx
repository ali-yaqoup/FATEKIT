import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  ArrowRight,
  MapPin,
  Phone,
  User,
  StickyNote,
  Banknote,
  Tag,
  Package,
} from "lucide-react";
import { AdminRole, OrderStatus } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";

const STATUS_BADGES: Record<OrderStatus, { label: string; classNames: string }> = {
  NEW: { label: "جديد", classNames: "bg-white text-black border-black" },
  PROCESSING: { label: "قيد التجهيز", classNames: "bg-[#F5E6DA] text-black border-[#F5E6DA]" },
  SHIPPED: { label: "تم الشحن", classNames: "bg-neutral-900 text-white border-neutral-900" },
  DELIVERED: { label: "تم التوصيل", classNames: "bg-neutral-100 text-neutral-800 border-neutral-400" },
  CANCELLED: { label: "ملغي", classNames: "bg-transparent text-neutral-500 border-neutral-400 line-through" },
};

// Timeline order of statuses for the progress tracker
const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.NEW, label: "جديد" },
  { status: OrderStatus.PROCESSING, label: "قيد التجهيز" },
  { status: OrderStatus.SHIPPED, label: "تم الشحن" },
  { status: OrderStatus.DELIVERED, label: "تم التوصيل" },
];

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      coupon: true,
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const badge = STATUS_BADGES[order.status];
  const isCancelled = order.status === OrderStatus.CANCELLED;

  // Timeline position — cancelled orders show the tracker greyed out
  const currentStep = TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 border border-neutral-700 text-neutral-300 hover:bg-white hover:text-black hover:border-white transition"
            title="العودة لقائمة الطلبات"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white dir-ltr text-right">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              طلب دفع عند الاستلام (COD) —{" "}
              {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center self-start px-3 py-1.5 text-xs font-semibold border ${badge.classNames}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Status timeline (hidden when cancelled) */}
      {!isCancelled && (
        <div className="bg-[#141414] border border-neutral-800 p-6">
          <div className="flex items-center justify-between gap-1" dir="rtl">
            {TIMELINE.map((step, idx) => {
              const reached = currentStep >= idx;
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center gap-2 relative">
                  {/* connector */}
                  {idx > 0 && (
                    <span
                      className={`absolute top-[9px] right-1/2 w-full h-px ${
                        currentStep >= idx ? "bg-white" : "bg-neutral-700"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                      reached ? "bg-white border-white" : "bg-[#141414] border-neutral-600"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold whitespace-nowrap ${
                      reached ? "text-white" : "text-neutral-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right column (main in RTL): items + totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          <div className="bg-[#141414] border border-neutral-800 overflow-hidden">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-400" />
                <span>منتجات الطلب ({order.items.length})</span>
              </h2>
            </div>
            <table className="w-full text-right text-xs">
              <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">سعر الوحدة</th>
                  <th className="p-4">الكمية</th>
                  <th className="p-4">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <p className="font-semibold text-white">{item.productNameSnapshot}</p>
                      {item.variantNameSnapshot && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          الدرجة: {item.variantNameSnapshot}
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-mono">{Number(item.unitPrice).toFixed(2)} ₪</td>
                    <td className="p-4 font-mono">{item.quantity}</td>
                    <td className="p-4 font-serif font-bold text-white">
                      {Number(item.total).toFixed(2)} ₪
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-neutral-800 p-5 space-y-2.5 bg-[#101010]">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>المجموع الفرعي</span>
                <span className="font-mono">{Number(order.subtotal).toFixed(2)} ₪</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>رسوم التوصيل</span>
                <span className="font-mono">
                  {Number(order.shippingFee) === 0 ? "مجاني" : `${Number(order.shippingFee).toFixed(2)} ₪`}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    الخصم {order.coupon ? `(${order.coupon.code})` : ""}
                  </span>
                  <span className="font-mono">-{Number(order.discount).toFixed(2)} ₪</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-neutral-800">
                <span className="text-sm font-bold text-white">الإجمالي المطلوب تحصيله</span>
                <span className="font-serif text-xl font-bold text-white">
                  {Number(order.total).toFixed(2)} ₪
                </span>
              </div>
            </div>
          </div>

          {/* Status control */}
          <div className="bg-[#141414] border border-neutral-800 p-6">
            <OrderStatusControl orderId={order.id} currentStatus={order.status} />
          </div>
        </div>

        {/* Left column: customer + shipping + payment */}
        <div className="space-y-6">
          {/* Customer card */}
          <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <User className="w-4 h-4 text-neutral-400" />
              <span>بيانات العميل</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">الاسم:</span>
                <span className="font-semibold text-white">{order.customer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">الهاتف:</span>
                <a
                  href={`tel:${order.customer.phone}`}
                  className="font-mono text-neutral-200 dir-ltr hover:text-white transition"
                >
                  {order.customer.phone}
                </a>
              </div>
              {order.customer.email && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">البريد:</span>
                  <span className="font-mono text-neutral-300 dir-ltr">{order.customer.email}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">طلبات سابقة:</span>
                <span className="font-mono text-neutral-300">{order.customer.ordersCount}</span>
              </div>
            </div>
          </div>

          {/* Shipping card */}
          <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>عنوان التوصيل</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">المدينة:</span>
                <p className="font-semibold text-white">{order.shippingCity}</p>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">العنوان بالتفصيل:</span>
                <p className="text-neutral-200 leading-relaxed">{order.shippingAddress}</p>
              </div>
              {order.deliveryNotes && (
                <div className="pt-2 border-t border-neutral-800/60">
                  <span className="text-neutral-500 flex items-center gap-1.5 mb-1">
                    <StickyNote className="w-3.5 h-3.5" />
                    ملاحظات التوصيل:
                  </span>
                  <p className="text-neutral-200 leading-relaxed bg-neutral-900 p-3 border border-neutral-800">
                    {order.deliveryNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Banknote className="w-4 h-4 text-neutral-400" />
              <span>الدفع</span>
            </h2>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">طريقة الدفع:</span>
              <span className="font-bold text-white">نقداً عند الاستلام (COD)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">المبلغ المحصّل من العميل:</span>
              <span className="font-serif font-bold text-emerald-300 text-sm">
                {Number(order.total).toFixed(2)} ₪
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
