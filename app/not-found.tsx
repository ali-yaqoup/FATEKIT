import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center px-6 py-24 text-center selection:bg-neutral-900 selection:text-white font-sans">
      <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
        {/* Monogram Brand Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 border border-neutral-300 rounded-full flex items-center justify-center mx-auto bg-neutral-50 shadow-xs">
            <Sparkles className="w-7 h-7 text-neutral-800" />
          </div>
          <span className="font-serif text-3xl md:text-4xl font-bold tracking-[0.2em] text-primary block">
            FATEKIT
          </span>
        </div>

        {/* 404 Error Display */}
        <div className="space-y-4">
          <span className="font-serif text-7xl md:text-9xl font-bold text-neutral-200 block select-none">
            404
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-neutral-900 leading-tight">
            الصفحة المطلوبة غير موجودة
          </h1>
          <p className="font-sans text-sm md:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            نعتذر، يبدو أن الرابط الذي حاولتِ الوصول إليه غير صحيح أو تم نقل هذه الصفحة إلى عنوان آخر.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تصفحي المتجر والمنتجات</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-neutral-300 text-neutral-900 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Additional Help Note */}
        <p className="text-xs text-neutral-400 pt-6">
          بحاجة إلى مساعدة؟ خدمة عملاء FATEKIT متاحة دائماً للإجابة على استفساراتكِ.
        </p>
      </div>
    </div>
  );
}
