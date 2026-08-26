"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInventoryQuantityAction } from "./actions";

export function InventoryQtyForm({
  productId,
  variantId,
  quantity,
}: {
  productId?: string;
  variantId?: string;
  quantity: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(quantity);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await updateInventoryQuantityAction({ productId, variantId, quantity: value });
        setSaving(false);
        router.refresh();
      }}
    >
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-20 bg-neutral-900 border border-neutral-700 p-1 text-white font-mono"
      />
      <button type="submit" disabled={saving} className="text-[10px] text-champagne hover:text-white disabled:opacity-50">
        {saving ? "..." : "حفظ"}
      </button>
    </form>
  );
}
