import { notFound } from "next/navigation";
import { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminRole([AdminRole.OWNER, AdminRole.STAFF]);
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { name: "asc" } },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { parent: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">تعديل المنتج</h1>
        <p className="text-xs text-neutral-400 mt-1">{product.name}</p>
      </div>
      <ProductForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          parentName: category.parent?.name ?? null,
        }))}
        product={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          categoryId: product.categoryId,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
          sku: product.sku,
          quantity: product.quantity,
          description: product.description,
          details: product.details,
          ingredients: product.ingredients,
          usageInstructions: product.usageInstructions,
          status: product.status,
          isNew: product.isNew,
          isBestseller: product.isBestseller,
          isFeatured: product.isFeatured,
          images: product.images.map((image) => ({ id: image.id, url: image.url })),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            colorCode: variant.colorCode,
            quantity: variant.quantity,
            price: variant.price != null ? Number(variant.price) : null,
          })),
        }}
      />
    </div>
  );
}
