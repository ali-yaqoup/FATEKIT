import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailsClient } from "@/components/store/ProductDetailsClient";


interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Search product by slug or id
  const product = await db.product.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
      isArchived: false,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  // Convert Decimals to Numbers for Client Component serialization
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    variants: product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
  };

  return <ProductDetailsClient product={serializedProduct} />;
}
