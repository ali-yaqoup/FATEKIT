import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { SortSelect } from "@/components/store/SortSelect";


interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategorySlug = params.category;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sort = params.sort || "newest";
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 12;

  // 1. Fetch categories
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: { children: true, parent: true },
    orderBy: { sortOrder: "asc" },
  });

  const parentCategories = categories.filter((c) => c.parentId === null);

  // 2. Build where filter for Products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
    isArchived: false,
  };

  if (selectedCategorySlug) {
    const matchedCategory = categories.find((c) => c.slug === selectedCategorySlug);
    if (matchedCategory) {
      if (matchedCategory.parentId === null) {
        // Top-level category selected -> include it and all subcategories
        const subCatIds = matchedCategory.children.map((child) => child.id);
        where.categoryId = { in: [matchedCategory.id, ...subCatIds] };
      } else {
        where.categoryId = matchedCategory.id;
      }
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !isNaN(minPrice)) where.price.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  // 3. Build orderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  // 4. Query total count & paginated products
  const totalCount = await db.product.count({ where });

  const products = await db.product.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Selected Category Title
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategorySlug);
  const pageTitle = activeCategoryObj ? activeCategoryObj.name : "المكياج";

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Header & Breadcrumbs matching fatekit_1 */}
      <div className="px-6 md:px-16 py-12 md:py-16 text-center border-b border-neutral-200 bg-white">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-black">
          {pageTitle}
        </h1>
        <nav className="flex justify-center items-center gap-2 font-sans text-xs text-neutral-500">
          <Link href="/" className="hover:text-black transition">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{pageTitle}</span>
        </nav>
      </div>

      <div className="px-6 md:px-16 py-16 max-w-container mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              {/* Category Filter */}
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4 text-black">
                  التصنيف
                </h3>
                <ul className="space-y-3 font-sans text-sm text-neutral-600">
                  <li>
                    <Link
                      href="/shop"
                      className={`block hover:text-black transition ${
                        !selectedCategorySlug ? "font-semibold text-black underline" : ""
                      }`}
                    >
                      الكل
                    </Link>
                  </li>
                  {parentCategories.map((parent) => (
                    <li key={parent.id} className="space-y-2">
                      <Link
                        href={`/shop/${parent.slug}`}
                        className={`block hover:text-black transition ${
                          selectedCategorySlug === parent.slug ? "font-semibold text-black underline" : ""
                        }`}
                      >
                        {parent.name}
                      </Link>
                      {parent.children.length > 0 && (
                        <ul className="pr-4 space-y-1.5 border-r border-neutral-200 text-xs text-neutral-500">
                          {parent.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop/${child.slug}`}
                                className={`hover:text-black transition ${
                                  selectedCategorySlug === child.slug ? "font-semibold text-black" : ""
                                }`}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand Filter */}
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4 text-black">
                  الماركة
                </h3>
                <ul className="space-y-3 font-sans text-sm text-neutral-600">
                  <li className="font-medium text-black">FATEKIT (الكل)</li>
                </ul>
              </div>

              {/* Price Filter */}
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4 text-black">
                  السعر (₪)
                </h3>
                <form action="/shop" method="GET" className="space-y-3">
                  {selectedCategorySlug && (
                    <input type="hidden" name="category" value={selectedCategorySlug} />
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      name="minPrice"
                      defaultValue={minPrice ?? ""}
                      placeholder="من"
                      type="number"
                      className="w-full bg-transparent border-0 border-b border-neutral-300 focus:ring-0 focus:border-black font-sans text-sm p-1.5 text-center"
                    />
                    <span className="text-neutral-400">-</span>
                    <input
                      name="maxPrice"
                      defaultValue={maxPrice ?? ""}
                      placeholder="إلى"
                      type="number"
                      className="w-full bg-transparent border-0 border-b border-neutral-300 focus:ring-0 focus:border-black font-sans text-sm p-1.5 text-center"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 text-xs uppercase font-medium tracking-wider hover:bg-neutral-800 transition"
                  >
                    تطبيق الفلتر
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Main Product Section */}
          <main className="flex-grow">
            {/* Top Bar: Count & Sorting */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-200 text-xs text-neutral-500">
              <span>
                عرض {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, totalCount)} من أصل {totalCount} منتج
              </span>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="hidden sm:inline">ترتيب حسب:</label>
                <SortSelect currentSort={sort} />
              </div>
            </div>

            {/* Product Grid matching fatekit_1 */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => {
                  const imageUrl =
                    product.images[0]?.url ||
                    "https://picsum.photos/seed/placeholder/800/800";

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group block"
                    >
                      <div className="relative w-full aspect-[3/4] mb-4 bg-neutral-100 overflow-hidden border border-neutral-200">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {product.discountPercent && (
                          <span className="absolute top-3 right-3 bg-black text-white text-[10px] uppercase font-bold px-2 py-1">
                            خصم {product.discountPercent}%
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black text-white py-3 text-center text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
                          عرض التفاصيل
                        </div>
                      </div>
                      <div className="text-right">
                        <h3 className="font-serif text-base font-medium text-neutral-900 group-hover:text-black transition mb-1">
                          {product.name}
                        </h3>
                        <p className="font-sans text-xs text-neutral-400 mb-2">
                          {product.brand || "FATEKIT"}
                        </p>
                        <div className="flex items-center gap-2 font-sans font-semibold text-sm text-neutral-900">
                          <span>{Number(product.price).toFixed(2)} ₪</span>
                          {Boolean(product.compareAtPrice) && (
                            <span className="text-xs text-neutral-400 line-through font-normal">
                              {Number(product.compareAtPrice).toFixed(2)} ₪
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-neutral-500 font-sans">
                لا توجد منتجات تطابق خيارات الفلترة المحددة.
              </div>
            )}

            {/* Pagination Controls matching fatekit_1 */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-3 border-t border-neutral-200 pt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/shop?page=${currentPage - 1}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-black hover:text-white transition"
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/shop?page=${pageNum}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className={`w-10 h-10 border flex items-center justify-center font-sans text-sm transition ${
                      pageNum === currentPage
                        ? "border-black bg-black text-white font-bold"
                        : "border-neutral-300 hover:border-black text-neutral-700"
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/shop?page=${currentPage + 1}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-black hover:text-white transition"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
