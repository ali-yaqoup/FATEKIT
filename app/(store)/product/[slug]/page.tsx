import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailsClient } from "@/components/store/ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
      isArchived: false,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!product) {
    return {
      title: "المنتج غير موجود",
    };
  }

  const imageUrl = product.images[0]?.url || "https://picsum.photos/seed/placeholder/800/800";
  const desc = product.description || `اشتري ${product.name} من FATEKIT بسعر ${Number(product.price).toFixed(2)} ₪. دفع عند الاستلام لجميع المدن.`;

  return {
    title: product.name,
    description: desc,
    openGraph: {
      title: `${product.name} | FATEKIT`,
      description: desc,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | FATEKIT`,
      description: desc,
      images: [imageUrl],
    },
  };
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
