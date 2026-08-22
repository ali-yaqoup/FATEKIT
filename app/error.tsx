"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center px-6 py-24 text-center font-sans">
      <div className="max-w-md mx-auto space-y-6 bg-white border border-neutral-200 p-10 shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-700 border border-red-200 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="font-serif text-2xl font-bold tracking-widest text-primary block">
            FATEKIT
          </span>
          <h1 className="font-serif text-xl md:text-2xl font-bold text-neutral-900">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
            تعذر إكمال طلبكِ في الوقت الحالي، قد يكون هناك انقطاع مؤقت في الاتصال بقاعدة البيانات أو الخادم.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-neutral-300 text-neutral-900 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>

        <p className="text-[11px] text-neutral-400 pt-2">
          رمز الخطأ: {error.digest || "ERR_SERVICE_INTERRUPTED"}
        </p>
      </div>
    </div>
  );
}
