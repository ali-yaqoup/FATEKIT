"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  addFeaturedCategoryAction,
  addInstagramImageAction,
  deleteInstagramImageAction,
  updateFeaturedCategory,
  updateHomepageContent,
} from "./actions";

async function uploadFile(file: File | null) {
  if (!file || file.size === 0) return null;
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) return null;
  const json = await res.json();
  return json.url as string;
}

export function HomepageAdminForm({
  content,
  featured,
  instagram,
  categories,
}: {
  content: {
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryLabel: string;
    heroPrimaryUrl: string;
    promoText: string;
    promoActive: boolean;
    statementText: string | null;
    statementActive: boolean;
    instagramTitle: string;
    instagramActive: boolean;
    heroImageUrl: string | null;
  } | null;
  featured: { id: string; imageUrl: string | null; category: { name: string } }[];
  instagram: { id: string; imageUrl: string; linkUrl: string | null }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const inputClass =
    "w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-white focus:outline-none focus:border-white";

  const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const uploaded = await uploadFile(formData.get("heroImageFile") as File);

    await updateHomepageContent({
      heroTitle: String(formData.get("heroTitle") || ""),
      heroSubtitle: String(formData.get("heroSubtitle") || ""),
      heroPrimaryLabel: String(formData.get("heroPrimaryLabel") || ""),
      heroPrimaryUrl: String(formData.get("heroPrimaryUrl") || "/shop"),
      promoText: String(formData.get("promoText") || ""),
      promoActive: formData.get("promoActive") === "on",
      statementText: String(formData.get("statementText") || ""),
      statementActive: formData.get("statementActive") === "on",
      instagramTitle: String(formData.get("instagramTitle") || ""),
      instagramActive: formData.get("instagramActive") === "on",
      heroImageUrl: uploaded || content?.heroImageUrl || "",
    });

    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] border border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-4 font-serif">القسم الرئيسي والرسائل</h2>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          {content?.heroImageUrl ? (
            <div className="relative w-full max-w-md h-36 overflow-hidden border border-neutral-800">
              <Image src={content.heroImageUrl} alt="Hero" fill className="object-cover" />
            </div>
          ) : null}
          <input type="file" name="heroImageFile" accept="image/*" className="text-sm" />
          <input name="heroTitle" defaultValue={content?.heroTitle} placeholder="العنوان" className={inputClass} />
          <input name="heroSubtitle" defaultValue={content?.heroSubtitle} placeholder="العنوان الفرعي" className={inputClass} />
          <input name="heroPrimaryLabel" defaultValue={content?.heroPrimaryLabel} placeholder="نص الزر" className={inputClass} />
          <input name="heroPrimaryUrl" defaultValue={content?.heroPrimaryUrl || "/shop"} placeholder="رابط الزر" className={inputClass} />
          <input name="promoText" defaultValue={content?.promoText} placeholder="شريط الإعلان" className={inputClass} />
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input type="checkbox" name="promoActive" defaultChecked={content?.promoActive} />
            إظهار شريط الإعلان
          </label>
          <textarea name="statementText" rows={3} defaultValue={content?.statementText || ""} placeholder="فلسفة العلامة" className={inputClass} />
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input type="checkbox" name="statementActive" defaultChecked={content?.statementActive} />
            إظهار فقرة الفلسفة
          </label>
          <input name="instagramTitle" defaultValue={content?.instagramTitle} placeholder="عنوان الإنستغرام" className={inputClass} />
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input type="checkbox" name="instagramActive" defaultChecked={content?.instagramActive} />
            إظهار قسم الإنستغرام
          </label>
          <button type="submit" disabled={isSaving} className="bg-white text-black px-6 py-2.5 text-xs font-semibold disabled:opacity-50">
            {isSaving ? "جاري الحفظ..." : "حفظ المحتوى"}
          </button>
        </form>
      </div>

      <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
        <h2 className="text-xl font-bold font-serif">التصنيفات المميزة</h2>
        {featured.length === 0 ? (
          <form
            className="flex gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const id = String(new FormData(e.currentTarget).get("categoryId") || "");
              if (!id) return;
              await addFeaturedCategoryAction(id);
              router.refresh();
            }}
          >
            <select name="categoryId" className={inputClass}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="bg-neutral-800 px-4 text-xs">إضافة</button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item, index) => (
              <form
                key={item.id}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const file = new FormData(e.currentTarget).get("imageFile") as File;
                  const url = (await uploadFile(file)) || item.imageUrl || "";
                  await updateFeaturedCategory(item.id, url);
                  router.refresh();
                }}
                className="bg-neutral-900 p-4 border border-neutral-800 space-y-3"
              >
                <h3 className="font-bold text-sm">
                  {index + 1}. {item.category.name}
                </h3>
                {item.imageUrl ? (
                  <div className="relative w-full h-32 overflow-hidden">
                    <Image src={item.imageUrl} alt="" fill className="object-cover" />
                  </div>
                ) : null}
                <input type="file" name="imageFile" accept="image/*" className="text-xs" />
                <button className="w-full bg-neutral-800 py-2 text-xs">تحديث الصورة</button>
              </form>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
        <h2 className="text-xl font-bold font-serif">صور إنستغرام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {instagram.map((image) => (
            <div key={image.id} className="relative aspect-square border border-neutral-800">
              <Image src={image.imageUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={async () => {
                  await deleteInstagramImageAction(image.id);
                  router.refresh();
                }}
                className="absolute top-2 left-2 bg-black/70 text-xs px-2 py-1"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const url = await uploadFile(form.get("image") as File);
            if (!url) return;
            await addInstagramImageAction(url, String(form.get("linkUrl") || ""));
            e.currentTarget.reset();
            router.refresh();
          }}
        >
          <input type="file" name="image" accept="image/*" required className="text-xs" />
          <input name="linkUrl" placeholder="رابط اختياري" className={inputClass} />
          <button className="bg-white text-black px-4 py-2 text-xs font-semibold">إضافة صورة</button>
        </form>
      </div>
    </div>
  );
}
