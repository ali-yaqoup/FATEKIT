import { db } from "@/lib/db";
import { Tag, Check, X, Calendar } from "lucide-react";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { CreateCouponForm } from "./CreateCouponForm";


export default async function AdminCouponsPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">كوبونات الخصم</h1>
          <p className="text-xs text-neutral-400 mt-1">
            إجمالي {coupons.length} كوبون ترويجي فعال ومسجل
          </p>
        </div>
        <CreateCouponForm />
      </div>

      <div className="bg-[#141414] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-4">كود الكوبون</th>
                <th className="p-4">نوع الخصم</th>
                <th className="p-4">قيمة الخصم</th>
                <th className="p-4">الحد الأدنى للطلب</th>
                <th className="p-4">مرات الاستخدام</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-neutral-900/60 transition">
                  <td className="p-4 font-mono font-bold text-white uppercase text-sm">
                    {coupon.code}
                  </td>
                  <td className="p-4 text-neutral-300">
                    {coupon.type === "PERCENTAGE" ? "نسبة مئوية (%)" : "مبلغ ثابت (₪)"}
                  </td>
                  <td className="p-4 font-bold text-emerald-400 font-mono text-sm">
                    {coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}%` : `${Number(coupon.value)} ₪`}
                  </td>
                  <td className="p-4 font-mono text-neutral-300">
                    {coupon.minOrderAmount ? `${Number(coupon.minOrderAmount)} ₪` : "بدون حد أدنى"}
                  </td>
                  <td className="p-4 font-mono">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "مرة"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-xs ${
                        coupon.isActive
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800"
                      }`}
                    >
                      {coupon.isActive ? "نشط ومتاح" : "معطل"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
