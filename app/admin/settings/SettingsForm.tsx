"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStoreSettingsAction } from "./actions";

interface SettingsFormProps {
  settings: {
    storeName: string;
    phone: string;
    email: string;
    whatsapp: string;
    deliveryFee: number;
    freeShippingMinimum: number;
    deliveryAreas: string[];
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);

    await updateStoreSettingsAction({
      storeName: String(form.get("storeName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      whatsapp: String(form.get("whatsapp") || ""),
      deliveryFee: Number(form.get("deliveryFee") || 0),
      freeShippingMinimum: Number(form.get("freeShippingMinimum") || 0),
      deliveryAreas: String(form.get("deliveryAreas") || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });

    setIsSaving(false);
    setMessage("تم حفظ إعدادات المتجر.");
    router.refresh();
  };

  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-champagne";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5 text-xs text-neutral-400">
          اسم المتجر
          <input name="storeName" defaultValue={settings.storeName} className={inputClass} required />
        </label>
        <label className="space-y-1.5 text-xs text-neutral-400">
          البريد الإلكتروني
          <input name="email" type="email" defaultValue={settings.email} className={`${inputClass} dir-ltr text-right`} />
        </label>
        <label className="space-y-1.5 text-xs text-neutral-400">
          رقم الهاتف
          <input name="phone" defaultValue={settings.phone} className={`${inputClass} dir-ltr text-right`} />
        </label>
        <label className="space-y-1.5 text-xs text-neutral-400">
          واتساب
          <input name="whatsapp" defaultValue={settings.whatsapp} className={`${inputClass} dir-ltr text-right`} />
        </label>
        <label className="space-y-1.5 text-xs text-neutral-400">
          رسوم التوصيل (₪)
          <input name="deliveryFee" type="number" step="0.01" min="0" defaultValue={settings.deliveryFee} className={inputClass} />
        </label>
        <label className="space-y-1.5 text-xs text-neutral-400">
          الحد الأدنى للشحن المجاني (₪)
          <input
            name="freeShippingMinimum"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.freeShippingMinimum}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs text-neutral-400">
        مناطق التوصيل (سطر لكل مدينة)
        <textarea
          name="deliveryAreas"
          rows={8}
          defaultValue={settings.deliveryAreas.join("\n")}
          className={inputClass}
        />
      </label>

      {message ? <p className="text-xs text-emerald-400">{message}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="bg-white text-black px-6 py-2.5 text-xs font-bold tracking-wide hover:bg-neutral-200 disabled:opacity-50"
      >
        {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
