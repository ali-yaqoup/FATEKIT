"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateHomepageContent, updateFeaturedCategory } from "./actions";

export function HomepageAdminForm({ content, featured }: { content: any, featured: any[] }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleContentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    // Check if there's a file upload for hero image
    const fileInput = formData.get("heroImageFile") as File;
    let heroImageUrl = content?.heroImageUrl || "";
    
    if (fileInput && fileInput.size > 0) {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", fileInput);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (res.ok) {
          const { url } = await res.json();
          heroImageUrl = url;
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
      setIsUploading(false);
    }

    await updateHomepageContent({
      heroTitle: formData.get("heroTitle") as string,
      heroSubtitle: formData.get("heroSubtitle") as string,
      heroPrimaryLabel: formData.get("heroPrimaryLabel") as string,
      promoText: formData.get("promoText") as string,
      heroImageUrl: heroImageUrl,
    });
    
    setIsSaving(false);
    router.refresh();
  };

  const handleFeaturedSubmit = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fileInput = formData.get("imageFile") as File;
    let imageUrl = formData.get("existingImageUrl") as string;

    if (fileInput && fileInput.size > 0) {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", fileInput);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (res.ok) {
          const { url } = await res.json();
          imageUrl = url;
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
      setIsUploading(false);
    }

    await updateFeaturedCategory(id, imageUrl);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] border border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-4 font-serif">إعدادات القسم الرئيسي (Hero)</h2>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">صورة الـ Hero الحالية (اختياري)</label>
            {content?.heroImageUrl && (
              <div className="relative w-full max-w-md h-36 mb-3 overflow-hidden border border-neutral-800 bg-neutral-900">
                <Image
                  src={content.heroImageUrl}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <input type="file" name="heroImageFile" accept="image/png, image/jpeg, image/webp" className="text-sm" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">العنوان الرئيسي</label>
            <input type="text" name="heroTitle" defaultValue={content?.heroTitle} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-white focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">العنوان الفرعي</label>
            <input type="text" name="heroSubtitle" defaultValue={content?.heroSubtitle} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-white focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">نص الزر الأساسي</label>
            <input type="text" name="heroPrimaryLabel" defaultValue={content?.heroPrimaryLabel} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-white focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">شريط الإعلانات (Promo Text)</label>
            <input type="text" name="promoText" defaultValue={content?.promoText} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-sm text-white focus:outline-none focus:border-white" />
          </div>
          <button type="submit" disabled={isSaving || isUploading} className="bg-white text-black px-6 py-2.5 font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50">
            {isUploading ? "جاري الرفع..." : isSaving ? "جاري الحفظ..." : "حفظ القسم الرئيسي"}
          </button>
        </form>
      </div>

      <div className="bg-[#141414] border border-neutral-800 p-6">
        <h2 className="text-xl font-bold mb-4 font-serif">التصنيفات المميزة (Featured Categories)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured.map((f, i) => (
            <div key={f.id} className="bg-neutral-900 p-4 border border-neutral-800">
              <h3 className="font-bold text-sm mb-3">التصنيف {i + 1}: {f.category.name}</h3>
              <form onSubmit={(e) => handleFeaturedSubmit(e, f.id)} className="space-y-3">
                <input type="hidden" name="existingImageUrl" value={f.imageUrl || ""} />
                {f.imageUrl && (
                  <div className="relative w-full h-32 mb-2 overflow-hidden border border-neutral-800 bg-neutral-950">
                    <Image
                      src={f.imageUrl}
                      alt={f.category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input type="file" name="imageFile" accept="image/png, image/jpeg, image/webp" className="text-xs w-full" />
                <button type="submit" disabled={isUploading} className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 text-xs font-medium transition-colors w-full">
                  رفع وتحديث الصورة
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
