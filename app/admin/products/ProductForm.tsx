"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import {
  addProductImageAction,
  archiveProductAction,
  deleteProductImageAction,
  saveProductAction,
} from "./actions";

interface CategoryOption {
  id: string;
  name: string;
  parentName?: string | null;
}

type VariantRow = {
  id?: string;
  name: string;
  colorCode: string;
  quantity: number;
  price: string | number;
};

interface ProductFormProps {
  categories: CategoryOption[];
  product?: {
    id: string;
    name: string;
    brand: string | null;
    categoryId: string;
    price: number;
    compareAtPrice: number | null;
    sku: string | null;
    quantity: number | null;
    description: string | null;
    details: string | null;
    ingredients: string | null;
    usageInstructions: string | null;
    status: "ACTIVE" | "INACTIVE";
    isNew: boolean;
    isBestseller: boolean;
    isFeatured: boolean;
    images: { id: string; url: string }[];
    variants: {
      id: string;
      name: string;
      colorCode: string | null;
      quantity: number;
      price: number | null;
    }[];
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      colorCode: variant.colorCode || "",
      quantity: variant.quantity,
      price: variant.price ?? "",
    })) ?? []
  );

  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-champagne";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const result = await saveProductAction({
        id: product?.id,
        name: String(form.get("name") || ""),
        brand: String(form.get("brand") || ""),
        categoryId: String(form.get("categoryId") || ""),
        price: Number(form.get("price") || 0),
        compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : null,
        sku: String(form.get("sku") || ""),
        quantity: Number(form.get("quantity") || 0),
        description: String(form.get("description") || ""),
        details: String(form.get("details") || ""),
        ingredients: String(form.get("ingredients") || ""),
        usageInstructions: String(form.get("usageInstructions") || ""),
        status: form.get("status") === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        isNew: form.get("isNew") === "on",
        isBestseller: form.get("isBestseller") === "on",
        isFeatured: form.get("isFeatured") === "on",
        variants: variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          colorCode: variant.colorCode,
          quantity: Number(variant.quantity) || 0,
          price: variant.price === "" ? null : Number(variant.price),
        })),
      });

      const files = form.getAll("images") as File[];
      for (const file of files) {
        if (!file || file.size === 0) continue;
        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (res.ok) {
          const { url } = await res.json();
          await addProductImageAction(result.id, url);
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      submittingRef.current = false;
      setError(err instanceof Error ? err.message : "تعذر حفظ المنتج.");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-[#141414] border border-neutral-800">
        <label className="space-y-1 text-xs text-neutral-400 md:col-span-2">
          اسم المنتج
          <input name="name" required defaultValue={product?.name} className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          الماركة
          <input name="brand" defaultValue={product?.brand || ""} placeholder="مثال: Dior، MAC، Huda Beauty" className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          التصنيف
          <select name="categoryId" required defaultValue={product?.categoryId} className={inputClass}>
            <option value="">اختاري تصنيف</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentName ? `${category.parentName} / ${category.name}` : category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          السعر (₪)
          <input name="price" type="number" step="0.01" min="0" required defaultValue={product?.price ?? ""} className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          السعر قبل الخصم (اختياري)
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice ?? ""}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          SKU
          <span className="text-neutral-600"> — اختياري، يُولَّد تلقائياً إذا تُرك فارغاً</span>
          <input
            name="sku"
            defaultValue={product?.sku || ""}
            placeholder="يُولَّد تلقائياً"
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          المخزون (إذا ما في درجات)
          <input name="quantity" type="number" min="0" defaultValue={product?.quantity ?? 0} className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          الحالة
          <select name="status" defaultValue={product?.status || "ACTIVE"} className={inputClass}>
            <option value="ACTIVE">ظاهر في المتجر</option>
            <option value="INACTIVE">مخفي</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-4 items-center text-xs text-neutral-300 md:col-span-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isNew" defaultChecked={product?.isNew} />
            جديد
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isBestseller" defaultChecked={product?.isBestseller} />
            الأكثر مبيعاً
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} />
            مميز
          </label>
        </div>
      </div>

      <div className="p-6 bg-[#141414] border border-neutral-800 space-y-4">
        <label className="block space-y-1 text-xs text-neutral-400">
          الوصف
          <textarea name="description" rows={3} defaultValue={product?.description || ""} className={inputClass} />
        </label>
        <label className="block space-y-1 text-xs text-neutral-400">
          التفاصيل
          <textarea name="details" rows={3} defaultValue={product?.details || ""} className={inputClass} />
        </label>
        <label className="block space-y-1 text-xs text-neutral-400">
          المكونات
          <textarea name="ingredients" rows={2} defaultValue={product?.ingredients || ""} className={inputClass} />
        </label>
        <label className="block space-y-1 text-xs text-neutral-400">
          طريقة الاستخدام
          <textarea name="usageInstructions" rows={2} defaultValue={product?.usageInstructions || ""} className={inputClass} />
        </label>
      </div>

      <div className="p-6 bg-[#141414] border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-white">الدرجات / الألوان</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { name: "", colorCode: "#C9A27A", quantity: 0, price: "" }])}
            className="inline-flex items-center gap-1 text-xs text-champagne hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة درجة
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-xs text-neutral-500">بدون درجات — المخزون يُدار من حقل المنتج.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={variant.id || index} className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <input
                  value={variant.name}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))
                  }
                  placeholder="اسم الدرجة"
                  className={inputClass}
                />
                <input
                  type="color"
                  value={variant.colorCode || "#C9A27A"}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, colorCode: e.target.value } : row)))
                  }
                  className="h-10 bg-neutral-900 border border-neutral-800"
                />
                <input
                  type="number"
                  min="0"
                  value={variant.quantity}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, quantity: Number(e.target.value) } : row))
                    )
                  }
                  placeholder="المخزون"
                  className={inputClass}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, price: e.target.value } : row)))
                  }
                  placeholder="سعر خاص"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-300"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-[#141414] border border-neutral-800 space-y-4">
        <h2 className="font-serif text-lg text-white">الصور</h2>
        {product?.images.length ? (
          <div className="flex flex-wrap gap-3">
            {product.images.map((image) => (
              <div key={image.id} className="relative w-24 h-28 border border-neutral-800 overflow-hidden">
                <Image src={image.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={async () => {
                    await deleteProductImageAction(image.id);
                    router.refresh();
                  }}
                  className="absolute top-1 left-1 bg-black/70 text-white p-1"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <input name="images" type="file" accept="image/*" multiple className="text-xs text-neutral-300" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSaving} className="bg-white text-black px-6 py-2.5 text-xs font-bold disabled:opacity-50">
          {isSaving ? "جاري الحفظ..." : product ? "حفظ التعديلات" : "إنشاء المنتج"}
        </button>
        {product ? (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("إخفاء المنتج من المتجر؟")) return;
              await archiveProductAction(product.id);
              router.push("/admin/products");
              router.refresh();
            }}
            className="text-red-400 text-xs px-4 py-2.5 border border-red-900/40 hover:bg-red-950/30"
          >
            أرشفة المنتج
          </button>
        ) : null}
      </div>
    </form>
  );
}
