import Link from "next/link";
import { ChevronRight, ChevronLeft, Filter, X } from "lucide-react";
import { db } from "@/lib/db";
import { SortSelect } from "@/components/store/SortSelect";
import { ProductCard } from "@/components/store/ProductCard";


interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    search?: string;
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
  const searchQuery = params.search;

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

  // Add search filter
  if (searchQuery && searchQuery.trim()) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { brand: { contains: searchQuery, mode: "insensitive" } },
    ];
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
  const pageTitle = activeCategoryObj ? activeCategoryObj.name : (searchQuery ? `نتائج البحث: "${searchQuery}"` : "المكياج");

  return (
    <div className="bg-background text-on-background min-h-screen">
      <div className="bg-blush/40 border-b border-outline-variant/70">
        <div className="store-container py-12 md:py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="store-label">المتجر</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
              {pageTitle}
            </h1>
            <nav className="flex justify-center items-center gap-3 font-sans text-xs text-on-surface-variant">
              <Link href="/" className="hover:text-secondary transition-colors">
                الرئيسية
              </Link>
              <span className="text-outline">/</span>
              <span className="text-primary font-medium">{pageTitle}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="store-container py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Premium Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              {/* Category Filter */}
              <div className="border-b border-neutral-200/60 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    التصنيف
                  </h3>
                  <Filter className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                </div>
                <ul className="space-y-4 font-sans text-sm">
                  <li>
                    <Link
                      href={`/shop${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                      className={`block hover:text-primary transition-all duration-300 group ${
                        !selectedCategorySlug ? "font-semibold text-primary" : "text-neutral-600"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>الكل</span>
                        {!selectedCategorySlug && (
                          <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                        )}
                      </span>
                    </Link>
                  </li>
                  {parentCategories.map((parent) => (
                    <li key={parent.id} className="space-y-3">
                      <Link
                        href={`/shop/${parent.slug}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                        className={`block hover:text-primary transition-all duration-300 group ${
                          selectedCategorySlug === parent.slug ? "font-semibold text-primary" : "text-neutral-600"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{parent.name}</span>
                          {selectedCategorySlug === parent.slug && (
                            <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                          )}
                        </span>
                      </Link>
                      {parent.children.length > 0 && (
                        <ul className="pr-4 space-y-2 border-r border-neutral-200/60 text-xs">
                          {parent.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop/${child.slug}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                                className={`hover:text-primary transition-all duration-300 ${
                                  selectedCategorySlug === child.slug ? "font-semibold text-primary" : "text-neutral-500"
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
              <div className="border-b border-neutral-200/60 pb-8">
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">
                  الماركة
                </h3>
                <ul className="space-y-4 font-sans text-sm">
                  <li className="font-semibold text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                    FATEKIT (الكل)
                  </li>
                </ul>
              </div>

              {/* Price Filter */}
              <div className="border-b border-neutral-200/60 pb-8">
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">
                  السعر (₪)
                </h3>
                <form action="/shop" method="GET" className="space-y-4">
                  {selectedCategorySlug && (
                    <input type="hidden" name="category" value={selectedCategorySlug} />
                  )}
                  {searchQuery && (
                    <input type="hidden" name="search" value={searchQuery} />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        name="minPrice"
                        defaultValue={minPrice ?? ""}
                        placeholder="من"
                        type="number"
                        className="w-full bg-white border border-neutral-200/60 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 font-sans text-xs p-3 text-center transition-all duration-300"
                      />
                    </div>
                    <span className="text-neutral-400 font-light">—</span>
                    <div className="flex-1">
                      <input
                        name="maxPrice"
                        defaultValue={maxPrice ?? ""}
                        placeholder="إلى"
                        type="number"
                        className="w-full bg-white border border-neutral-200/60 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/20 font-sans text-xs p-3 text-center transition-all duration-300"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-ivory py-3 text-xs font-semibold tracking-wide rounded-full hover:bg-secondary transition-all duration-300"
                  >
                    تطبيق الفلتر
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Premium Main Product Section */}
          <main className="flex-grow font-sans">
            {/* Premium Top Bar: Count & Sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-neutral-200/60">
              <div className="space-y-1">
                <span className="font-medium text-sm text-neutral-700">
                  عرض {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                  {Math.min(currentPage * pageSize, totalCount)} من أصل <span className="font-bold text-primary">{totalCount}</span> منتج
                </span>
                <p className="text-xs text-neutral-400">تشكيلة فاخرة من أجود المنتجات</p>
                {searchQuery && (
                  <Link
                    href="/shop"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    مسح البحث
                  </Link>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-xs font-medium text-neutral-600">ترتيب حسب:</label>
                <SortSelect currentSort={sort} />
              </div>
            </div>

            {/* Premium Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard
                      product={{
                        ...product,
                        price: Number(product.price),
                        compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined,
                        brand: product.brand,
                        images: product.images,
                        isNew: product.isNew,
                        isBestseller: product.isBestseller,
                        discountPercent: product.discountPercent,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-ivory border border-outline-variant p-12 md:p-16 space-y-6 rounded-2xl">
                <div className="w-16 h-16 bg-blush flex items-center justify-center mx-auto text-secondary rounded-full">
                  <span className="font-serif text-2xl font-bold">∅</span>
                </div>
                <div className="space-y-3 max-w-md mx-auto">
                  <h3 className="font-serif text-3xl font-bold text-primary">
                    لا توجد منتجات مطابقة
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    ما لقينا منتجات تطابق الفلتر أو نطاق السعر. جرّبي إعادة تعيين الفلاتر أو تصفّحي كل التشكيلة.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="store-btn-primary"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                    إعادة تعيين كافة الفلاتر
                  </Link>
                </div>
              </div>
            )}

            {/* Premium Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-3 border-t border-neutral-200/60 pt-10">
                {currentPage > 1 && (
                  <Link
                    href={`/shop?page=${currentPage - 1}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="w-12 h-12 border border-neutral-300 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-sm"
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/shop?page=${pageNum}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                    className={`w-12 h-12 border flex items-center justify-center font-sans text-xs font-bold transition-all duration-300 rounded-sm ${
                      pageNum === currentPage
                        ? "border-primary bg-primary text-white shadow-lg"
                        : "border-neutral-300 hover:border-primary text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/shop?page=${currentPage + 1}${selectedCategorySlug ? `&category=${selectedCategorySlug}` : ""}${sort ? `&sort=${sort}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                    className="w-12 h-12 border border-neutral-300 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-sm"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
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
