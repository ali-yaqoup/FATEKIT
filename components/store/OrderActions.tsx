"use client";

import { useState } from "react";
import { Printer, Copy, Check, MessageSquare } from "lucide-react";

interface OrderActionsProps {
  orderNumber: string;
  total: number;
}

export function OrderActions({ orderNumber, total }: OrderActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً FATEKIT، أود الاستفسار عن طلبي رقم: ${orderNumber} بمبلغ إجمالي ${total.toFixed(2)} ₪.`
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
      <button
        onClick={handleCopyOrderNumber}
        type="button"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 border border-neutral-200"
        title="نسخ رقم الطلب"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">تم نسخ الرقم!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ رقم الطلب</span>
          </>
        )}
      </button>

      <button
        onClick={handlePrint}
        type="button"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 border border-neutral-200"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>طباعة تفاصيل الطلب</span>
      </button>

      <a
        href={`https://wa.me/970599000000?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-neutral-50 text-emerald-800 border border-emerald-300 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
      >
        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
        <span>مساعدة عبر واتساب</span>
      </a>
    </div>
  );
}
