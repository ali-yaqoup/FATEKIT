"use client";

import { useState } from "react";
import { createCouponAction } from "./actions";

export function CreateCouponForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    try {
      await createCouponAction({
        code: formData.get("code") as string,
        type: formData.get("type") as "PERCENTAGE" | "FIXED",
        value: Number(formData.get("value")),
        minOrderAmount: formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : undefined,
        usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined,
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-white text-black px-4 py-2 rounded-xs font-semibold text-xs hover:bg-neutral-200 transition">
        + إنشاء كوبون جديد
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] border border-neutral-800 p-4 rounded-xs mb-6 space-y-4">
      <h3 className="font-bold text-white mb-2">إضافة كوبون جديد</h3>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
        <div>
          <label className="block text-neutral-400 mb-1">كود الكوبون</label>
          <input required type="text" name="code" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white rounded uppercase" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">نوع الخصم</label>
          <select required name="type" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white rounded">
            <option value="PERCENTAGE">نسبة مئوية (%)</option>
            <option value="FIXED">مبلغ ثابت (₪)</option>
          </select>
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">قيمة الخصم</label>
          <input required type="number" step="0.01" name="value" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white rounded" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">الحد الأدنى للطلب (اختياري)</label>
          <input type="number" step="0.01" name="minOrderAmount" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white rounded" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">حد الاستخدام (اختياري)</label>
          <input type="number" name="usageLimit" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-semibold text-xs transition">
          {isSaving ? "جاري الحفظ..." : "حفظ الكوبون"}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="bg-neutral-800 text-white px-4 py-2 rounded text-xs">إلغاء</button>
      </div>
    </form>
  );
}
