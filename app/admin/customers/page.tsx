import { db } from "@/lib/db";
import { Users, Phone, Mail, ShoppingBag } from "lucide-react";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";


export default async function AdminCustomersPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const customers = await db.customer.findMany({
    orderBy: { totalSpent: "desc" },
    include: {
      orders: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">سجل العملاء</h1>
          <p className="text-xs text-neutral-400 mt-1">
            إجمالي {customers.length} عميل مسجل بالهاتف والمشتريات
          </p>
        </div>
      </div>

      <div className="bg-[#141414] border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-4">اسم العميل</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">عدد الطلبات</th>
                <th className="p-4">إجمالي الإنفاق</th>
                <th className="p-4">آخر طلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-900/60 transition">
                  <td className="p-4 font-semibold text-white">
                    {c.name}
                  </td>
                  <td className="p-4 font-mono text-neutral-300 dir-ltr text-right">
                    {c.phone}
                  </td>
                  <td className="p-4 font-mono text-neutral-400 dir-ltr text-right">
                    {c.email || "—"}
                  </td>
                  <td className="p-4 font-mono">
                    {c.ordersCount} طلب
                  </td>
                  <td className="p-4 font-serif font-bold text-white text-sm">
                    {Number(c.totalSpent).toFixed(2)} ₪
                  </td>
                  <td className="p-4 text-neutral-400 text-[11px]">
                    {c.lastOrderAt
                      ? new Date(c.lastOrderAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
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
