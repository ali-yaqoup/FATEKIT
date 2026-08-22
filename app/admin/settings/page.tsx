import { db } from "@/lib/db";
import { Settings, Truck, Phone, Mail, ShieldCheck } from "lucide-react";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminRole([AdminRole.OWNER]);

  const settings = await db.storeSettings.findUnique({
    where: { id: "main" },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">إعدادات المتجر العامة</h1>
        <p className="text-xs text-neutral-400 mt-1">
          إعدادات الشحن، العملة (₪)، وطرق الدفع
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Store info */}
        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>معلومات المتجر الأساسية</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">اسم المتجر:</span>
              <span className="font-semibold text-white">{settings?.storeName || "FATEKIT"}</span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">البريد الرسمي:</span>
              <span className="font-mono text-neutral-300 dir-ltr">{settings?.email || "contact@fatekit.com"}</span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">رقم الهاتف:</span>
              <span className="font-mono text-neutral-300 dir-ltr">{settings?.phone || "+970 599 000 000"}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment settings */}
        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-neutral-400" />
            <span>سياسة الشحن والدفع</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">رسوم التوصيل الافتراضية:</span>
              <span className="font-bold text-white">{Number(settings?.deliveryFee || 30).toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">الحد الأدنى للشحن المجاني:</span>
              <span className="font-bold text-emerald-400">{Number(settings?.freeShippingMinimum || 350).toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800">
              <span className="text-neutral-500">طريقة الدفع:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                الدفع عند الاستلام فقط (COD ₪)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
