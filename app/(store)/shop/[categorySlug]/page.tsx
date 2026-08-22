import type { Metadata } from "next";
import { db } from "@/lib/db";
import ShopPage from "../page";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await props.params;
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return {
      title: "التصنيف غير موجود",
    };
  }

  return {
    title: `مكياج ${category.name}`,
    description: `تسوقي أفضل منتجات ${category.name} الفاخرة من FATEKIT. توصيل لجميع المدن ودفع عند الاستلام.`,
    openGraph: {
      title: `مكياج ${category.name} | FATEKIT`,
      description: `تسوقي أفضل منتجات ${category.name} الفاخرة من FATEKIT.`,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { categorySlug } = await props.params;
  const sParams = await props.searchParams;

  return ShopPage({
    searchParams: Promise.resolve({
      ...sParams,
      category: categorySlug,
    }),
  });
}
