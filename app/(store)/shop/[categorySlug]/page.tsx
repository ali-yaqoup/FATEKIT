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
