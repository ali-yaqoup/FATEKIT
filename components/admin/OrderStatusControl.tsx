"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/lib/actions/orders";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.NEW, label: "جديد" },
  { value: OrderStatus.PROCESSING, label: "قيد التجهيز" },
  { value: OrderStatus.SHIPPED, label: "تم الشحن" },
  { value: OrderStatus.DELIVERED, label: "تم التوصيل" },
  { value: OrderStatus.CANCELLED, label: "ملغي (إرجاع المخزون)" },
];

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusControl({ orderId, currentStatus }: OrderStatusControlProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<OrderStatus>(currentStatus);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const hasChanged = selected !== currentStatus;

  const handleSave = () => {
    if (!hasChanged || isSaving) return;
    setFeedback(null);
    setIsSaving(true);

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, selected);
      setIsSaving(false);

      if (res.success) {
        setFeedback({
          type: "ok",
          message:
            selected === OrderStatus.CANCELLED
              ? "تم إلغاء الطلب وإرجاع الكميات للمخزون."
              : "تم تحديث حالة الطلب بنجاح.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "err", message: res.error || "فشل تحديث الحالة." });
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-semibold text-neutral-400 tracking-wider">
        حالة الطلب
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as OrderStatus)}
          disabled={isSaving || isPending}
          className="flex-1 bg-[#1c1c1c] border border-neutral-700 px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanged || isSaving || isPending}
          className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSaving || isPending ? "جاري الحفظ..." : "حفظ الحالة"}
        </button>
      </div>

      {feedback && (
        <p
          className={`flex items-center gap-2 text-xs font-medium ${
            feedback.type === "ok" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {feedback.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </p>
      )}
    </div>
  );
}
