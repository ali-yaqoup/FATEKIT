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
    description: `تسوقي ${category.name} من براندات عالمية مختارة في FATEKIT. توصيل لجميع المدن ودفع عند الاستلام.`,
    openGraph: {
      title: `${category.name} | FATEKIT`,
      description: `تسوقي ${category.name} من براندات عالمية مختارة في متجر FATEKIT.`,
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
