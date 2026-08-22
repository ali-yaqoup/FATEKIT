import Link from "next/link";
import { db } from "@/lib/db";
import { Eye, ShoppingBag } from "lucide-react";
import { AdminRole, OrderStatus } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";


const STATUS_BADGES: Record<OrderStatus, { label: string; classNames: string }> = {
  NEW: { label: "جديد", classNames: "bg-white text-black border-black" },
  PROCESSING: { label: "قيد التجهيز", classNames: "bg-[#F5E6DA] text-black border-[#F5E6DA]" },
  SHIPPED: { label: "تم الشحن", classNames: "bg-neutral-900 text-white border-neutral-900" },
  DELIVERED: { label: "تم التوصيل", classNames: "bg-neutral-100 text-neutral-800 border-neutral-400" },
  CANCELLED: { label: "ملغي", classNames: "bg-transparent text-neutral-500 border-neutral-400 line-through" },
};

const STATUS_TABS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "الكل" },
  { value: OrderStatus.NEW, label: "جديد" },
  { value: OrderStatus.PROCESSING, label: "قيد التجهيز" },
  { value: OrderStatus.SHIPPED, label: "تم الشحن" },
  { value: OrderStatus.DELIVERED, label: "تم التوصيل" },
  { value: OrderStatus.CANCELLED, label: "ملغي" },
];

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const params = await searchParams;
  const activeStatus = STATUS_TABS.find((t) => t.value === params.status)?.value ?? "ALL";

  const orders = await db.order.findMany({
    where:
      activeStatus === "ALL"
        ? undefined
        : { status: activeStatus as OrderStatus },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true,
    },
  });

  // Counts per tab for the filter chips
  const counts = await db.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = new Map<OrderStatus, number>(
    counts.map((c) => [c.status, c._count._all])
  );
  const totalCount = Array.from(countMap.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">إدارة الطلبات</h1>
          <p className="text-xs text-neutral-400 mt-1">
            متابعة وتجهيز طلبات الدفع عند الاستلام (COD) — إجمالي {totalCount} طلب
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          <ShoppingBag className="w-4 h-4 text-neutral-400" />
          <span>{orders.length} طلب معروض</span>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === activeStatus;
          const count =
            tab.value === "ALL" ? totalCount : (countMap.get(tab.value as OrderStatus) ?? 0);

          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? "/admin/orders" : `/admin/orders?status=${tab.value}`}
              scroll={false}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border transition ${
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-neutral-300 border-neutral-700 hover:border-neutral-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono ${
                  isActive ? "bg-black text-white" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-[#141414] border border-neutral-800 overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm text-neutral-300 font-semibold">لا توجد طلبات في هذه الحالة</p>
            <p className="text-xs text-neutral-500">جرّبي اختيار تبويب آخر من الأعلى</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">المدينة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">المنتجات</th>
                  <th className="p-4">المجموع</th>
                  <th className="p-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {orders.map((order) => {
                  const badge = STATUS_BADGES[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-neutral-900/60 transition group">
                      <td className="p-4 font-mono font-bold text-white dir-ltr text-right whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{order.customer.name}</p>
                        <p className="text-[11px] text-neutral-400 font-mono dir-ltr text-right">
                          {order.customer.phone}
                        </p>
                      </td>
                      <td className="p-4 text-neutral-300">{order.shippingCity}</td>
                      <td className="p-4 text-neutral-400 text-[11px] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-[10px] font-semibold border ${badge.classNames}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-300">{order.items.length} منتج</td>
                      <td className="p-4 font-serif font-bold text-white text-sm whitespace-nowrap">
                        {Number(order.total).toFixed(2)} ₪
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-neutral-200 text-[11px] font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
