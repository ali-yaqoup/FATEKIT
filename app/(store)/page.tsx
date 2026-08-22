import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

export const revalidate = 0;

export default async function HomePage() {
  const content = await db.homepageContent.findUnique({
    where: { id: "main" },
  });

  const featuredCategories = await db.featuredCategory.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  const newProducts = await db.product.findMany({
    where: { isNew: true, status: "ACTIVE", isArchived: false },
    include: { images: true },
    take: 4,
  });

  const bestsellerProducts = await db.product.findMany({
    where: { isBestseller: true, status: "ACTIVE", isArchived: false },
    include: { images: true },
    take: 4,
  });

  const instagramImages = await db.instagramImage.findMany({
    orderBy: { sortOrder: "asc" },
    take: 4,
  });

  // Map featured categories by slug for Bento Grid placement
  const faceCat = featuredCategories.find((fc) => fc.category.slug === "face") || featuredCategories[0];
  const eyesCat = featuredCategories.find((fc) => fc.category.slug === "eyes") || featuredCategories[1];
  const lipsCat = featuredCategories.find((fc) => fc.category.slug === "lips") || featuredCategories[2];
  const skinCat = featuredCategories.find((fc) => fc.category.slug === "skincare") || featuredCategories[3];

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary text-on-primary">
        {content?.heroImageUrl && (
          <Image
            src={content.heroImageUrl}
            alt="FATEKIT Hero"
            fill
            priority
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            {content?.heroTitle || "اكتشفي جمالكِ بطريقتك"}
          </h1>
          <p className="font-sans text-lg md:text-xl text-neutral-200 mb-10 max-w-xl leading-relaxed">
            {content?.heroSubtitle || "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى."}
          </p>
          <Link
            href={content?.heroPrimaryUrl || "/shop"}
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-black font-sans font-medium text-sm tracking-wider uppercase hover:bg-neutral-200 transition border border-white"
          >
            {content?.heroPrimaryLabel || "تسوقي الآن"}
          </Link>
        </div>
      </section>

      {/* 2. Promo Banner */}
      {content?.promoActive && (
        <div className="bg-primary text-on-primary py-3.5 w-full text-center border-b border-neutral-900">
          <p className="font-sans text-xs tracking-wide text-champagne">
            {content.promoText}
          </p>
        </div>
      )}

      {/* 3. Featured Categories (Bento Grid matching fatekit_3) */}
      <section className="py-24 px-6 md:px-16 max-w-container mx-auto">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-center mb-16 text-primary">
          تسوقي حسب الفئة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[600px]">
          {/* Large Feature (Face) */}
          {faceCat && (
            <Link
              href={`/shop/${faceCat.category.slug}`}
              className="group relative block md:col-span-2 md:row-span-2 overflow-hidden bg-neutral-100 border border-neutral-200 h-[320px] md:h-full"
            >
              {faceCat.imageUrl && (
                <Image
                  src={faceCat.imageUrl}
                  alt={faceCat.category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-right">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
                  {faceCat.category.name}
                </h3>
                <span className="font-sans text-xs text-champagne flex items-center gap-2 group-hover:gap-3 transition-all">
                  اكتشفي المزيد <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>
          )}

          {/* Medium (Eyes) */}
          {eyesCat && (
            <Link
              href={`/shop/${eyesCat.category.slug}`}
              className="group relative block md:col-span-2 md:row-span-1 overflow-hidden bg-neutral-100 border border-neutral-200 h-[260px] md:h-full"
            >
              {eyesCat.imageUrl && (
                <Image
                  src={eyesCat.imageUrl}
                  alt={eyesCat.category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-1">
                  {eyesCat.category.name}
                </h3>
                <span className="font-sans text-xs text-champagne flex items-center gap-2 group-hover:gap-3 transition-all">
                  اكتشفي التشكيلة <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}

          {/* Small (Lips) */}
          {lipsCat && (
            <Link
              href={`/shop/${lipsCat.category.slug}`}
              className="group relative block md:col-span-1 md:row-span-1 overflow-hidden bg-neutral-100 border border-neutral-200 h-[260px] md:h-full"
            >
              {lipsCat.imageUrl && (
                <Image
                  src={lipsCat.imageUrl}
                  alt={lipsCat.category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-xl md:text-2xl font-bold">
                  {lipsCat.category.name}
                </h3>
              </div>
            </Link>
          )}

          {/* Small (Skincare) */}
          {skinCat && (
            <Link
              href={`/shop/${skinCat.category.slug}`}
              className="group relative block md:col-span-1 md:row-span-1 overflow-hidden bg-neutral-100 border border-neutral-200 h-[260px] md:h-full"
            >
              {skinCat.imageUrl && (
                <Image
                  src={skinCat.imageUrl}
                  alt={skinCat.category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-xl md:text-2xl font-bold">
                  {skinCat.category.name}
                </h3>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 4. New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-16 px-6 md:px-16 max-w-container mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-neutral-200 pb-4">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-1">وصل حديثاً</h2>
              <p className="text-neutral-500 text-xs">أحدث الإبداعات في عالم التجميل الفاخر</p>
            </div>
            <Link href="/shop" className="text-xs font-semibold uppercase tracking-wider text-black hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Brand Statement Banner */}
      {content?.statementActive && (
        <section className="bg-primary text-on-primary py-24 px-6 border-y border-neutral-900">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">فلسفة FATEKIT</span>
            <p className="font-serif text-2xl md:text-4xl font-light leading-relaxed">
              &quot;{content.statementText || "نؤمن في FATEKIT بأن الجمال الفاخر هو احتفاء بالتميز والفخامة الشديدة."}&quot;
            </p>
          </div>
        </section>
      )}

      {/* 6. Bestsellers Section */}
      {bestsellerProducts.length > 0 && (
        <section className="py-20 px-6 md:px-16 max-w-container mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-neutral-200 pb-4">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-1">الأكثر مبيعاً</h2>
              <p className="text-neutral-500 text-xs">المنتجات الأكثر طلباً وإعجاباً</p>
            </div>
            <Link href="/shop" className="text-xs font-semibold uppercase tracking-wider text-black hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestsellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Instagram Feed */}
      {content?.instagramActive && instagramImages.length > 0 && (
        <section className="py-20 px-6 md:px-16 max-w-container mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-2">{content.instagramTitle}</h2>
          <p className="text-neutral-500 text-xs mb-10">شاركينا إطلالتكِ عبر #FATEKIT</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramImages.map((img) => (
              <div key={img.id} className="relative aspect-square bg-neutral-100 group overflow-hidden">
                <Image
                  src={img.imageUrl}
                  alt="Instagram feed"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: { id: string; name: string; slug: string; price: unknown; compareAtPrice?: unknown; discountPercent?: number | null; images: { url: string }[] } }) {
  const imageUrl = product.images[0]?.url || "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80";

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4 border border-neutral-200">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
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
      <h3 className="font-serif text-lg font-medium text-neutral-900 group-hover:text-black transition">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mt-1 font-sans font-semibold text-sm">
        <span className="text-neutral-900">{Number(product.price).toFixed(2)} ₪</span>
        {Boolean(product.compareAtPrice) && (
          <span className="text-xs text-neutral-400 line-through font-normal">
            {Number(product.compareAtPrice).toFixed(2)} ₪
          </span>
        )}
      </div>
    </Link>
  );
}
