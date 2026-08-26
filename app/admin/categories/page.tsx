import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { CategoriesManager } from "./CategoriesManager";

export default async function AdminCategoriesPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const categories = await db.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    include: {
      parent: true,
      _count: { select: { products: true } },
    },
  });

  const parents = categories
    .filter((category) => category.parentId === null)
    .map((category) => ({ id: category.id, name: category.name }));

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">التصنيفات</h1>
        <p className="text-xs text-neutral-400 mt-1">
          التصنيفات الرئيسية تظهر في القائمة العلوية للمتجر، والفرعية تظهر في الفلاتر.
        </p>
      </div>

      <CategoriesManager
        parents={parents}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          imageUrl: category.imageUrl,
          parentId: category.parentId,
          parentName: category.parent?.name ?? null,
          productsCount: category._count.products,
        }))}
      />
    </div>
  );
}
