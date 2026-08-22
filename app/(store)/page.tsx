import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";


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
    <div className="bg-background text-on-background min-h-screen font-sans">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[620px] flex items-center justify-center overflow-hidden bg-primary text-on-primary">
        {content?.heroImageUrl && (
          <Image
            src={content.heroImageUrl}
            alt="FATEKIT Luxury Hero"
            fill
            priority
            className="object-cover opacity-45 scale-100 transition-transform duration-1000 ease-out"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne font-semibold mb-4">
            FATEKIT HAUTE BEAUTÉ
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-white leading-[1.15] tracking-tight">
            {content?.heroTitle || "اكتشفي جمالكِ بطريقتك"}
          </h1>
          <p className="font-sans text-base sm:text-lg md:text-xl text-neutral-200 mb-10 max-w-xl leading-relaxed">
            {content?.heroSubtitle || "مكياج فاخر مصمم ليمنحكِ إطلالة لا تُنسى."}
          </p>
          <Link
            href={content?.heroPrimaryUrl || "/shop"}
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-black font-sans font-semibold text-xs tracking-widest uppercase hover:bg-champagne transition-colors duration-300 shadow-sm"
          >
            {content?.heroPrimaryLabel || "تسوقي الآن"}
          </Link>
        </div>
      </section>

      {/* 2. Promo Banner */}
      {content?.promoActive && (
        <div className="bg-primary text-on-primary py-3.5 w-full text-center border-b border-neutral-900">
          <p className="font-sans text-xs tracking-widest text-champagne uppercase font-medium">
            {content.promoText}
          </p>
        </div>
      )}

      {/* 3. Featured Categories (Bento Grid) */}
      <section className="py-20 md:py-28 px-6 md:px-16 max-w-container mx-auto">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold block">
            المجموعات والتشكيلات
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
            تسوقي حسب الفئة
          </h2>
        </div>
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-right">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                  {faceCat.category.name}
                </h3>
                <span className="font-sans text-xs uppercase tracking-wider text-champagne flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-1 tracking-tight">
                  {eyesCat.category.name}
                </h3>
                <span className="font-sans text-xs uppercase tracking-wider text-champagne flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-xl md:text-2xl font-bold tracking-tight">
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
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-right text-white">
                <h3 className="font-serif text-xl md:text-2xl font-bold tracking-tight">
                  {skinCat.category.name}
                </h3>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 4. New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-16 max-w-container mx-auto border-t border-neutral-200">
          <div className="flex items-end justify-between mb-12 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold block mb-1">
                إصدارات جديدة
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-black tracking-tight">
                وصل حديثاً
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-widest text-black hover:text-neutral-600 transition-colors duration-200 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Brand Statement Banner */}
      {content?.statementActive && (
        <section className="bg-primary text-on-primary py-24 md:py-32 px-6 border-y border-neutral-900 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne font-semibold">
              فلسفة FATEKIT
            </span>
            <p className="font-serif text-2xl sm:text-3xl md:text-5xl font-light leading-relaxed text-white">
              &quot;{content.statementText || "نؤمن في FATEKIT بأن الجمال الفاخر هو احتفاء بالتميز والفخامة الشديدة."}&quot;
            </p>
          </div>
        </section>
      )}

      {/* 6. Bestsellers Section */}
      {bestsellerProducts.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-16 max-w-container mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold block mb-1">
                الأكثر طلباً
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-black tracking-tight">
                الأكثر مبيعاً
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-widest text-black hover:text-neutral-600 transition-colors duration-200 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {bestsellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Instagram Feed */}
      {content?.instagramActive && instagramImages.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-16 max-w-container mx-auto text-center border-t border-neutral-200">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 tracking-tight">{content.instagramTitle}</h2>
          <p className="text-neutral-500 text-xs tracking-widest uppercase mb-12">شاركينا إطلالتكِ الفاخرة عبر #FATEKIT</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {instagramImages.map((img) => (
              <div key={img.id} className="relative aspect-square bg-neutral-100 group overflow-hidden border border-neutral-200">
                <Image
                  src={img.imageUrl}
                  alt="Instagram feed"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
  const imageUrl = product.images[0]?.url || "https://picsum.photos/seed/placeholder/800/800";

  return (
    <Link href={`/product/${product.slug}`} className="group block text-right font-sans">
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4 border border-neutral-200">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {product.discountPercent && (
          <span className="absolute top-3 right-3 bg-black text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
            خصم {product.discountPercent}%
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black text-white py-3.5 text-center text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          عرض التفاصيل
        </div>
      </div>
      <h3 className="font-serif text-base sm:text-lg font-medium text-neutral-900 group-hover:text-black transition-colors duration-200 line-clamp-1 mb-1">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 font-sans font-bold text-sm sm:text-base">
        <span className="text-black">{Number(product.price).toFixed(2)} ₪</span>
        {Boolean(product.compareAtPrice) && (
          <span className="text-xs text-neutral-400 line-through font-normal">
            {Number(product.compareAtPrice).toFixed(2)} ₪
          </span>
        )}
      </div>
    </Link>
  );
}
