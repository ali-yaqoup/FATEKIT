"use client";

import { useState } from "react";
import { updateProductQuickAction } from "./actions";

export function ProductRowForm({ product }: { product: any }) {
  const [price, setPrice] = useState(Number(product.price));
  const [quantity, setQuantity] = useState(product.variants.length > 0
    ? product.variants.reduce((sum: any, v: any) => sum + v.quantity, 0)
    : (product.quantity ?? 0));
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    if (price < 0 || quantity < 0) {
      alert("لا يمكن أن يكون السعر أو المخزون رقماً سالباً.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProductQuickAction(product.id, Math.max(0, price), Math.max(0, quantity));
      setIsDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ تعديلات المنتج.");
    }
    setIsSaving(false);
  };

  const hasVariants = product.variants.length > 0;

  return (
    <>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            step="0.01" 
            value={price} 
            onChange={e => { setPrice(Number(e.target.value)); setIsDirty(true); }}
            className="w-20 bg-neutral-900 border border-neutral-700 p-1 text-white text-xs rounded"
          />
          <span className="text-neutral-500">₪</span>
        </div>
      </td>
      <td className="p-4 text-neutral-300">
        {hasVariants ? (
          <span className="text-[10px] text-neutral-500 bg-neutral-900 px-2 py-1 rounded">متعدد ({product.variants.length})</span>
        ) : (
          <span className="text-neutral-500">—</span>
        )}
      </td>
      <td className="p-4">
        {hasVariants ? (
          <span className="font-mono">{quantity}</span>
        ) : (
          <input 
            type="number" 
            value={quantity} 
            onChange={e => { setQuantity(Number(e.target.value)); setIsDirty(true); }}
            className="w-16 bg-neutral-900 border border-neutral-700 p-1 text-white text-xs rounded font-mono"
          />
        )}
      </td>
      <td className="p-4">
         {quantity > 0 ? (
           <span className="inline-flex items-center gap-1 text-emerald-400">
             نشط
           </span>
         ) : (
           <span className="inline-flex items-center gap-1 text-red-400">
             نفذ
           </span>
         )}
      </td>
      <td className="p-4 text-center">
        {savedSuccess && (
          <span className="text-emerald-400 text-[10px] font-semibold block mb-1 animate-fade-in">
            تم الحفظ ✓
          </span>
        )}
        {isDirty && (
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 text-[10px] rounded font-medium transition disabled:opacity-50"
          >
            {isSaving ? "..." : "حفظ"}
          </button>
        )}
      </td>
    </>
  );
}
