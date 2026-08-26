"use client";

import { useRouter } from "next/navigation";
import { toggleCouponAction } from "./actions";

export function CouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await toggleCouponAction(id, !isActive);
        router.refresh();
      }}
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border ${
        isActive
          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
          : "bg-neutral-900 text-neutral-500 border-neutral-800"
      }`}
    >
      {isActive ? "نشط — اضغطي للتعطيل" : "معطل — اضغطي للتفعيل"}
    </button>
  );
}
