"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  productsCount: number;
}

export function CategoriesManager({
  categories,
  parents,
}: {
  categories: CategoryRow[];
  parents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File | null) => {
    if (!file || file.size === 0) return null;
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) throw new Error("فشل رفع الصورة.");
    const json = await res.json();
    return json.url as string;
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const imageUrl = await uploadImage(data.get("image") as File);
      await createCategoryAction({
        name: String(data.get("name") || ""),
        parentId: String(data.get("parentId") || "") || null,
        imageUrl,
      });
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء التصنيف.");
    }
  };

  const handleUpdate = async (id: string, form: HTMLFormElement) => {
    setError(null);
    const data = new FormData(form);
    try {
      const uploaded = await uploadImage(data.get("image") as File);
      await updateCategoryAction(id, {
        name: String(data.get("name") || ""),
        isActive: data.get("isActive") === "on",
        sortOrder: Number(data.get("sortOrder") || 0),
        imageUrl: uploaded || undefined,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التصنيف.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا التصنيف؟")) return;
    setError(null);
    try {
      await deleteCategoryAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الحذف.");
    }
  };

  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-champagne";

  return (
    <div className="space-y-8">
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <form onSubmit={handleCreate} className="p-5 bg-[#141414] border border-neutral-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <label className="space-y-1 text-xs text-neutral-400 md:col-span-1">
          اسم التصنيف
          <input name="name" required className={inputClass} placeholder="مثال: الشفاه" />
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          تابع لـ
          <select name="parentId" className={inputClass}>
            <option value="">تصنيف رئيسي</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-neutral-400">
          صورة (اختياري)
          <input name="image" type="file" accept="image/*" className="text-xs text-neutral-300" />
        </label>
        <button type="submit" className="bg-white text-black px-4 py-2.5 text-xs font-bold hover:bg-neutral-200">
          إضافة تصنيف
        </button>
      </form>

      <div className="bg-[#141414] border border-neutral-800 overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#181818] text-neutral-400">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الترتيب</th>
              <th className="p-4">منتجات</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">حفظ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="p-4" colSpan={6}>
                  <form
                    className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(category.id, e.currentTarget);
                    }}
                  >
                    <input name="name" defaultValue={category.name} className={inputClass} />
                    <span className="text-neutral-400">
                      {category.parentName ? `فرعي / ${category.parentName}` : "رئيسي"}
                    </span>
                    <input name="sortOrder" type="number" defaultValue={category.sortOrder} className={inputClass} />
                    <span className="text-neutral-300">{category.productsCount}</span>
                    <label className="flex items-center gap-2 text-neutral-300">
                      <input name="isActive" type="checkbox" defaultChecked={category.isActive} />
                      ظاهر
                    </label>
                    <div className="flex items-center gap-2">
                      <input name="image" type="file" accept="image/*" className="text-[10px] text-neutral-400 w-28" />
                      <button type="submit" className="bg-neutral-800 px-3 py-2 hover:bg-neutral-700">
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-300 px-2"
                      >
                        حذف
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
