import { db } from "@/lib/db";
import { BarChart3, TrendingUp, DollarSign, MapPin, ShoppingBag } from "lucide-react";
import { AdminRole, OrderStatus } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";


export default async function AdminReportsPage() {
  await requireAdminRole([AdminRole.OWNER]);

  const [orders, customers] = await Promise.all([
    db.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      include: { items: true },
    }),
    db.customer.findMany(),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // City breakdown
  const cityMap = new Map<string, { count: number; total: number }>();
  orders.forEach((o) => {
    const existing = cityMap.get(o.shippingCity) || { count: 0, total: 0 };
    cityMap.set(o.shippingCity, {
      count: existing.count + 1,
      total: existing.total + Number(o.total),
    });
  });

  const cityStats = Array.from(cityMap.entries()).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">التقارير والأرباح المالية</h1>
        <p className="text-xs text-neutral-400 mt-1">
          تقرير تحليلي لمؤشرات الأداء المالي، التوزيع الجغرافي للمبيعات، ومتوسط قيمة السلة
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-2">
          <span className="text-xs font-semibold text-neutral-400">إجمالي الإيرادات الفعلية</span>
          <p className="font-serif text-3xl font-bold text-emerald-400">{totalRevenue.toFixed(2)} ₪</p>
          <p className="text-[11px] text-neutral-500">لجميع الطلبات المؤكدة والمسلمة</p>
        </div>

        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-2">
          <span className="text-xs font-semibold text-neutral-400">متوسط قيمة الطلب (AOV)</span>
          <p className="font-serif text-3xl font-bold text-white">{avgOrderValue.toFixed(2)} ₪</p>
          <p className="text-[11px] text-neutral-500">لكل عملية شراء</p>
        </div>

        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-2">
          <span className="text-xs font-semibold text-neutral-400">إجمالي العمليات المنجزة</span>
          <p className="font-serif text-3xl font-bold text-white">{orders.length} طلب</p>
          <p className="text-[11px] text-neutral-500">من {customers.length} عميل فريد</p>
        </div>
      </div>

      {/* City Breakdown Table */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neutral-400" />
            <span>المبيعات حسب المحافظات والمدن</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-4">المدينة / المحافظة</th>
                <th className="p-4">عدد الطلبات</th>
                <th className="p-4">حصة الطلبات</th>
                <th className="p-4">إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {cityStats.map(([city, data]) => {
                const percentage = ((data.total / (totalRevenue || 1)) * 100).toFixed(1);
                return (
                  <tr key={city} className="hover:bg-neutral-900/60 transition">
                    <td className="p-4 font-bold text-white text-sm">{city}</td>
                    <td className="p-4 font-mono">{data.count} طلب</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-white h-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="font-mono text-neutral-400">{percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-serif font-bold text-emerald-400 text-sm">
                      {data.total.toFixed(2)} ₪
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
