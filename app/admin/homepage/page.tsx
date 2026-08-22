import { db } from "@/lib/db";
import { Globe, Image as ImageIcon, Sparkles } from "lucide-react";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminHomepageCMSPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const content = await db.homepageContent.findUnique({
    where: { id: "main" },
  });

  const featured = await db.featuredCategory.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">إدارة محتوى الصفحة الرئيسية</h1>
        <p className="text-xs text-neutral-400 mt-1">
          التحكم في البانرات، النصوص الترويجية، والتصنيفات المميزة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hero Section Snapshot */}
        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="font-serif font-bold text-base text-white">القسم الرئيسي (Hero Section)</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-500 block mb-1">العنوان الرئيسي:</span>
              <p className="font-semibold text-white bg-neutral-900 p-3 rounded-xs border border-neutral-800">
                {content?.heroTitle || "—"}
              </p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">العنوان الفرعي:</span>
              <p className="text-neutral-300 bg-neutral-900 p-3 rounded-xs border border-neutral-800">
                {content?.heroSubtitle || "—"}
              </p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">النص الترويجي (Promo Banner):</span>
              <p className="text-neutral-300 bg-neutral-900 p-3 rounded-xs border border-neutral-800">
                {content?.promoText || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="p-6 bg-[#141414] border border-neutral-800 rounded-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <h2 className="font-serif font-bold text-base text-white">التصنيفات المميزة في الواجهة</h2>
          </div>
          <div className="space-y-2">
            {featured.map((f, idx) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded-xs border border-neutral-800 text-xs">
                <span className="font-semibold text-white">
                  {idx + 1}. {f.category.name}
                </span>
                <span className="text-neutral-500 font-mono text-[10px]">
                  الترتيب: {f.sortOrder}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
