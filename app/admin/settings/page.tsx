import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { getStoreSettings } from "@/lib/store-settings";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  await requireAdminRole([AdminRole.OWNER]);
  const settings = await getStoreSettings();

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">إعدادات المتجر</h1>
        <p className="text-xs text-neutral-400 mt-1">
          هذه البيانات تظهر في الفوتر، السلة، ورسوم التوصيل عند إتمام الطلب.
        </p>
      </div>

      <div className="p-6 bg-[#141414] border border-neutral-800">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
