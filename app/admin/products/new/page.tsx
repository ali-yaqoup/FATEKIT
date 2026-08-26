import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { parent: true },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">إضافة منتج</h1>
        <p className="text-xs text-neutral-400 mt-1">يظهر في المتجر فور الحفظ إذا كانت حالته «ظاهر».</p>
      </div>
      <ProductForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          parentName: category.parent?.name ?? null,
        }))}
      />
    </div>
  );
}
