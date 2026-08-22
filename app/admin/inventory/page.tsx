import { AdminRole } from "@prisma/client";
import { AlertTriangle, PackageSearch } from "lucide-react";
import { requireAdminRole } from "@/lib/actions/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

type InventoryItem = {
  id: string;
  productName: string;
  categoryName: string;
  sku: string | null;
  variantName: string | null;
  quantity: number;
  isActive: boolean;
};

export default async function AdminInventoryPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const products = await db.product.findMany({
    where: { isArchived: false },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      variants: { orderBy: { name: "asc" } },
    },
  });

  const inventory: InventoryItem[] = products
    .flatMap<InventoryItem>((product) => {
      if (product.variants.length === 0) {
        return [{
          id: product.id,
          productName: product.name,
          categoryName: product.category.name,
          sku: product.sku,
          variantName: null,
          quantity: product.quantity ?? 0,
          isActive: product.status === "ACTIVE",
        }];
      }

      return product.variants.map((variant) => ({
        id: variant.id,
        productName: product.name,
        categoryName: product.category.name,
        sku: variant.sku || product.sku,
        variantName: variant.name,
        quantity: variant.quantity,
        isActive: product.status === "ACTIVE",
      }));
    })
    .sort((first, second) => first.quantity - second.quantity);

  const lowStockCount = inventory.filter(
    (item) => item.quantity <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">المخزون</h1>
          <p className="text-xs text-neutral-400 mt-1">
            متابعة المخزون لكل منتج ودرجة. المنتجات ذات الدرجات تعتمد مخزون الدرجة فقط.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 border border-amber-800/60 bg-amber-950/50 px-3 py-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4" />
          <span>{lowStockCount} صنف منخفض أو نافد المخزون</span>
        </div>
      </div>

      <div className="bg-[#141414] border border-neutral-800 overflow-hidden">
        {inventory.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            لا توجد أصناف مخزون مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">الدرجة</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">المتاح</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {inventory.map((item) => {
                  const stockState = item.quantity === 0
                    ? "نافد المخزون"
                    : item.quantity <= LOW_STOCK_THRESHOLD
                      ? "مخزون منخفض"
                      : "متوفر";
                  const stockClass = item.quantity === 0
                    ? "text-neutral-400"
                    : item.quantity <= LOW_STOCK_THRESHOLD
                      ? "text-amber-300"
                      : "text-emerald-400";

                  return (
                    <tr key={item.id} className="hover:bg-neutral-900/60 transition">
                      <td className="p-4 font-semibold text-white">{item.productName}</td>
                      <td className="p-4 text-neutral-300">{item.categoryName}</td>
                      <td className="p-4 text-neutral-300">{item.variantName || "بدون درجة"}</td>
                      <td className="p-4 font-mono text-neutral-400">{item.sku || "—"}</td>
                      <td className={`p-4 font-mono font-bold ${stockClass}`}>{item.quantity}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] font-semibold ${stockClass} border-neutral-700`}>
                          <PackageSearch className="w-3 h-3" />
                          {item.isActive ? stockState : "المنتج معطل"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
