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


const STATUS_BADGES: Record<
  OrderStatus,
  { label: string; classNames: string }
> = {
  NEW: {
    label: "جديد",
    classNames: "bg-blue-950/50 text-blue-300 border-blue-800/40",
  },
  PROCESSING: {
    label: "قيد التجهيز",
    classNames: "bg-amber-950/50 text-amber-300 border-amber-800/40",
  },
  SHIPPED: {
    label: "تم الشحن",
    classNames: "bg-purple-950/50 text-purple-300 border-purple-800/40",
  },
  DELIVERED: {
    label: "تم التوصيل",
    classNames: "bg-emerald-950/50 text-emerald-300 border-emerald-800/40",
  },
  CANCELLED: {
    label: "ملغي",
    classNames: "bg-red-950/50 text-red-300 border-red-800/40",
  },
};

import { requireAdminRole } from "@/lib/actions/auth";
import { AdminRole } from "@prisma/client";

export default async function AdminDashboardPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
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
      bg: "bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border-emerald-900/40",
    },
    {
      title: "الطلبات الجديدة",
      value: newOrdersCount,
      subtext: "بحاجة إلى معالجة وتجهيز",
      icon: Clock,
      accent: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-950/30 to-amber-950/10 border-amber-900/40",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrdersCount,
      subtext: "كافة الطلبات المسجلة",
      icon: ShoppingBag,
      accent: "text-blue-400",
      bg: "bg-gradient-to-br from-blue-950/30 to-blue-950/10 border-blue-900/40",
    },
    {
      title: "قاعدة العملاء",
      value: totalCustomersCount,
      subtext: "عملاء مسجلين بالهاتف",
      icon: Users,
      accent: "text-purple-400",
      bg: "bg-gradient-to-br from-purple-950/30 to-purple-950/10 border-purple-900/40",
    },
  ];

  return (
    <div className="space-y-12 font-sans">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800/60 pb-8">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-wide">
            لوحة المراقبة والإدارة العامة
          </h1>
          <p className="text-sm text-neutral-400 tracking-wide">
            متابعة فورية للمبيعات، تجهيز الطلبات، ومخزون المنتجات
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="px-6 py-3 bg-gradient-to-r from-white to-neutral-200 text-black text-xs font-bold uppercase tracking-[0.2em] hover:from-neutral-100 hover:to-neutral-300 transition-all duration-300 flex items-center gap-2 shadow-lg group"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>عرض كافة الطلبات</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-6 border ${card.bg} space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg ${card.accent} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-neutral-500 mt-2 tracking-wide">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/orders"
          className="p-8 bg-gradient-to-br from-neutral-900/50 to-neutral-900/20 border border-neutral-800/60 hover:border-champagne/40 transition-all duration-300 group flex justify-between items-start hover:shadow-2xl hover:shadow-champagne/5"
        >
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-white group-hover:text-champagne transition-colors duration-300">
              إدارة وتجهيز الطلبات
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              تغيير الحالات، طباعة البوليصات، ومتابعة التوصيل مع المندوب
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-neutral-500 group-hover:text-champagne group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
        </Link>

        <Link
          href="/admin/products"
          className="p-8 bg-gradient-to-br from-neutral-900/50 to-neutral-900/20 border border-neutral-800/60 hover:border-champagne/40 transition-all duration-300 group flex justify-between items-start hover:shadow-2xl hover:shadow-champagne/5"
        >
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-white group-hover:text-champagne transition-colors duration-300">
              المنتجات والدرجات ({totalProductsCount})
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              تعديل الأسعار، الكميات، وإضافة درجات وألوان جديدة
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-neutral-500 group-hover:text-champagne group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
        </Link>

        <Link
          href="/admin/coupons"
          className="p-8 bg-gradient-to-br from-neutral-900/50 to-neutral-900/20 border border-neutral-800/60 hover:border-champagne/40 transition-all duration-300 group flex justify-between items-start hover:shadow-2xl hover:shadow-champagne/5"
        >
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-white group-hover:text-champagne transition-colors duration-300">
              كوبونات الخصم والعروض
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              إنشاء أكواد ترويجية وتحديد نسب ومبالغ الخصم
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-neutral-500 group-hover:text-champagne group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-900/20 border border-neutral-800/60 overflow-hidden hover:shadow-2xl hover:shadow-champagne/5 transition-all duration-300">
        <div className="p-8 border-b border-neutral-800/60 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-white">
              أحدث الطلبات المسجلة
            </h2>
            <p className="text-sm text-neutral-400">
              آخر عمليات الشراء عبر الدفع عند الاستلام (COD)
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm text-neutral-400 hover:text-champagne font-medium flex items-center gap-2 transition-all duration-300 group"
          >
            <span>عرض السجل الكامل</span>
            <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-500">
            لا توجد طلبات مسجلة بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-neutral-900/80 text-neutral-400 font-semibold border-b border-neutral-800/60">
                <tr>
                  <th className="p-5 uppercase tracking-wider text-xs">رقم الطلب</th>
                  <th className="p-5 uppercase tracking-wider text-xs">العميل</th>
                  <th className="p-5 uppercase tracking-wider text-xs">المدينة والعنوان</th>
                  <th className="p-5 uppercase tracking-wider text-xs">الحالة</th>
                  <th className="p-5 uppercase tracking-wider text-xs">المنتجات</th>
                  <th className="p-5 uppercase tracking-wider text-xs">المجموع</th>
                  <th className="p-5 uppercase tracking-wider text-xs">التاريخ</th>
                  <th className="p-5 text-center uppercase tracking-wider text-xs">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                {recentOrders.map((order) => {
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.NEW;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-800/40 transition-all duration-300 group">
                      <td className="p-5 font-mono font-bold text-white dir-ltr text-right">
                        {order.orderNumber}
                      </td>
                      <td className="p-5">
                        <p className="font-semibold text-white">{order.customer.name}</p>
                        <p className="text-xs text-neutral-400 font-mono dir-ltr text-right">
                          {order.customer.phone}
                        </p>
                      </td>
                      <td className="p-5 text-neutral-300">
                        <p className="font-medium text-white">{order.shippingCity}</p>
                        <p className="text-xs text-neutral-400 truncate max-w-[200px]">
                          {order.shippingAddress}
                        </p>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold border ${badge.classNames}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-5 text-neutral-300">
                        {order.items.length} منتج
                      </td>
                      <td className="p-5 font-serif font-bold text-white">
                        {Number(order.total).toFixed(2)} ₪
                      </td>
                      <td className="p-5 text-neutral-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-5 text-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          target="_blank"
                          className="inline-flex p-2 text-neutral-400 hover:text-champagne hover:bg-neutral-800/50 transition-all duration-300 rounded-lg"
                          title="معاينة تفاصيل الطلب"
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
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
