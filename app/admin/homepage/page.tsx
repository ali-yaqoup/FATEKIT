import { db } from "@/lib/db";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { HomepageAdminForm } from "./HomepageAdminForm";

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

      <HomepageAdminForm content={content} featured={featured} />
    </div>
  );
}
