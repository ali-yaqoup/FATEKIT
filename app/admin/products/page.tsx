import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Package, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { ProductRowForm } from "./ProductRowForm";


export default async function AdminProductsPage() {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);

  const products = await db.product.findMany({
    where: { isArchived: false },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">المنتجات والمخزون</h1>
          <p className="text-xs text-neutral-400 mt-1">
            إجمالي {products.length} منتج مسجل في المتجر
          </p>
        </div>
      </div>

      <div className="bg-[#141414] border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#181818] text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-4">المنتج</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الدرجات / الألوان</th>
                <th className="p-4">المخزون الإجمالي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">تحديث</th>
                <th className="p-4 text-center">المتجر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {products.map((product) => {
                const imageUrl = product.images[0]?.url || "https://picsum.photos/seed/placeholder/800/800";

                return (
                  <tr key={product.id} className="hover:bg-neutral-900/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 relative bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden">
                          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{product.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">{product.sku || "NO-SKU"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-300">
                      {product.category.name}
                    </td>
                    
                    <ProductRowForm product={product} />

                    <td className="p-4 text-center">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="inline-flex p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                        title="معاينة في المتجر"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
