import Link from "next/link";
import { db } from "@/lib/db";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Users,
  Package,
  ArrowUpRight,
  ChevronLeft,
  Tag,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_BADGES: Record<
  OrderStatus,
  { label: string; classNames: string }
> = {
  NEW: {
    label: "جديد",
    classNames: "bg-blue-950/80 text-blue-300 border-blue-800/60",
  },
  PROCESSING: {
    label: "قيد التجهيز",
    classNames: "bg-amber-950/80 text-amber-300 border-amber-800/60",
  },
  SHIPPED: {
    label: "تم الشحن",
    classNames: "bg-purple-950/80 text-purple-300 border-purple-800/60",
  },
  DELIVERED: {
    label: "تم التوصيل",
    classNames: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
  },
  CANCELLED: {
    label: "ملغي",
    classNames: "bg-red-950/80 text-red-300 border-red-800/60",
  },
};

export default async function AdminDashboardPage() {
  // Aggregate real store statistics in parallel
  const [
    totalOrdersCount,
    newOrdersCount,
    totalCustomersCount,
    totalProductsCount,
    recentOrders,
    completedOrdersTotal,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: OrderStatus.NEW } }),
    db.customer.count(),
    db.product.count({ where: { isArchived: false } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
      },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    }),
  ]);

  const totalRevenue = completedOrdersTotal._sum.total
    ? Number(completedOrdersTotal._sum.total)
    : 0;

  const statsCards = [
    {
      title: "إجمالي المبيعات",
      value: `${totalRevenue.toFixed(2)} ₪`,
      subtext: "الطلبات غير الملغية",
      icon: TrendingUp,
      accent: "text-emerald-400",
      bg: "bg-emerald-950/20 border-emerald-900/30",
    },
    {
      title: "الطلبات الجديدة",
      value: newOrdersCount,
      subtext: "بحاجة إلى معالجة وتجهيز",
      icon: Clock,
      accent: "text-amber-400",
      bg: "bg-amber-950/20 border-amber-900/30",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrdersCount,
      subtext: "كافة الطلبات المسجلة",
      icon: ShoppingBag,
      accent: "text-blue-400",
      bg: "bg-blue-950/20 border-blue-900/30",
    },
    {
      title: "قاعدة العملاء",
      value: totalCustomersCount,
      subtext: "عملاء مسجلين بالهاتف",
      icon: Users,
      accent: "text-purple-400",
      bg: "bg-purple-950/20 border-purple-900/30",
    },
  ];

  return (
    <div className="space-y-10 font-sans">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide">
            لوحة المراقبة والإدارة العامة
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            متابعة فورية للمبيعات، تجهيز الطلبات، ومخزون المنتجات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition flex items-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>عرض كافة الطلبات</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-6 border rounded-xs bg-[#141414] border-neutral-800 space-y-3 transition hover:border-neutral-700`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">{card.title}</span>
                <div className={`p-2 rounded-xs bg-neutral-900 border border-neutral-800 ${card.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/orders"
          className="p-6 bg-[#141414] border border-neutral-800 hover:border-neutral-600 rounded-xs transition group flex justify-between items-start"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition">
              إدارة وتجهيز الطلبات
            </h3>
            <p className="text-xs text-neutral-400">
              تغيير الحالات، طباعة البوليصات، ومتابعة التوصيل مع المندوب
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition" />
        </Link>

        <Link
          href="/admin/products"
          className="p-6 bg-[#141414] border border-neutral-800 hover:border-neutral-600 rounded-xs transition group flex justify-between items-start"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition">
              المنتجات والدرجات ({totalProductsCount})
            </h3>
            <p className="text-xs text-neutral-400">
              تعديل الأسعار، الكميات، وإضافة درجات وألوان جديدة
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition" />
        </Link>

        <Link
          href="/admin/coupons"
          className="p-6 bg-[#141414] border border-neutral-800 hover:border-neutral-600 rounded-xs transition group flex justify-between items-start"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition">
              كوبونات الخصم والعروض
            </h3>
            <p className="text-xs text-neutral-400">
              إنشاء أكواد ترويجية وتحديد نسب ومبالغ الخصم
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">
              أحدث الطلبات المسجلة
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              آخر عمليات الشراء عبر الدفع عند الاستلام (COD)
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1 transition"
          >
            <span>عرض السجل الكامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            لا توجد طلبات مسجلة بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">المدينة والعنوان</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">المنتجات</th>
                  <th className="p-4">المجموع</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {recentOrders.map((order) => {
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.NEW;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-900/60 transition">
                      <td className="p-4 font-mono font-bold text-white dir-ltr text-right">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{order.customer.name}</p>
                        <p className="text-[11px] text-neutral-400 font-mono dir-ltr text-right">
                          {order.customer.phone}
                        </p>
                      </td>
                      <td className="p-4 text-neutral-300">
                        <p className="font-medium text-white">{order.shippingCity}</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[180px]">
                          {order.shippingAddress}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold border rounded-xs ${badge.classNames}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-300">
                        {order.items.length} منتج
                      </td>
                      <td className="p-4 font-serif font-bold text-white text-sm">
                        {Number(order.total).toFixed(2)} ₪
                      </td>
                      <td className="p-4 text-neutral-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/order/${order.orderNumber}`}
                          target="_blank"
                          className="inline-flex p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xs transition"
                          title="معاينة تفاصيل الطلب"
                        >
                          <Eye className="w-4 h-4" />
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
