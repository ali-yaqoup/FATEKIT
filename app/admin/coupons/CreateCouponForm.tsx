"use client";

import { useState } from "react";
import { createCouponAction } from "./actions";

export function CreateCouponForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const code = (formData.get("code") as string)?.trim().toUpperCase();
    const type = formData.get("type") as "PERCENTAGE" | "FIXED";
    const value = Number(formData.get("value"));
    const minOrderAmount = formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : undefined;
    const usageLimit = formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined;

    if (!code || code.length < 3) {
      setError("كود الكوبون يجب أن يتكون من 3 أحرف/أرقام على الأقل.");
      return;
    }

    if (isNaN(value) || value <= 0) {
      setError("قيمة الخصم يجب أن تكون رقماً موجباً أكبر من الصفر.");
      return;
    }

    if (type === "PERCENTAGE" && value > 100) {
      setError("نسبة الخصم المئوية لا يمكن أن تتجاوز 100%.");
      return;
    }

    if (minOrderAmount !== undefined && minOrderAmount < 0) {
      setError("الحد الأدنى للطلب لا يمكن أن يكون سالباً.");
      return;
    }

    if (usageLimit !== undefined && usageLimit < 1) {
      setError("حد مرات الاستخدام يجب أن يكون 1 على الأقل.");
      return;
    }

    setIsSaving(true);
    try {
      await createCouponAction({
        code,
        type,
        value,
        minOrderAmount,
        usageLimit,
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ الكوبون.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-white text-black px-4 py-2.5 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors">
        + إنشاء كوبون جديد
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] border border-neutral-800 p-4 mb-6 space-y-4">
      <h3 className="font-serif font-bold text-white text-base mb-2">إضافة كوبون جديد</h3>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
        <div>
          <label className="block text-neutral-400 mb-1">كود الكوبون</label>
          <input required type="text" name="code" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white uppercase focus:outline-none focus:border-white transition-colors" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">نوع الخصم</label>
          <select required name="type" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white focus:outline-none focus:border-white transition-colors">
            <option value="PERCENTAGE">نسبة مئوية (%)</option>
            <option value="FIXED">مبلغ ثابت (₪)</option>
          </select>
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">قيمة الخصم</label>
          <input required type="number" step="0.01" name="value" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white focus:outline-none focus:border-white transition-colors" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">الحد الأدنى للطلب (اختياري)</label>
          <input type="number" step="0.01" name="minOrderAmount" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white focus:outline-none focus:border-white transition-colors" />
        </div>
        <div>
          <label className="block text-neutral-400 mb-1">حد الاستخدام (اختياري)</label>
          <input type="number" name="usageLimit" className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white focus:outline-none focus:border-white transition-colors" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="bg-white text-black px-4 py-2.5 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : "حفظ الكوبون"}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="bg-neutral-800 text-white px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors">إلغاء</button>
      </div>
    </form>
  );
}
