import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Instagram } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";

export default async function HomePage() {
  const [content, featuredCategories, newProducts, bestsellerProducts, instagramImages] =
    await Promise.all([
      db.homepageContent.findUnique({ where: { id: "main" } }),
      db.featuredCategory.findMany({
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.product.findMany({
        where: { isNew: true, status: "ACTIVE", isArchived: false },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        take: 4,
      }),
      db.product.findMany({
        where: { isBestseller: true, status: "ACTIVE", isArchived: false },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        take: 4,
      }),
      db.instagramImage.findMany({
        orderBy: { sortOrder: "asc" },
        take: 4,
      }),
    ]);

  const faceCat = featuredCategories.find((fc) => fc.category.slug === "face") || featuredCategories[0];
  const eyesCat = featuredCategories.find((fc) => fc.category.slug === "eyes") || featuredCategories[1];
  const lipsCat = featuredCategories.find((fc) => fc.category.slug === "lips") || featuredCategories[2];
  const skinCat = featuredCategories.find((fc) => fc.category.slug === "skincare") || featuredCategories[3];

  return (
    <div className="bg-background text-on-background min-h-screen font-sans">
      <section className="relative w-full min-h-[78vh] md:min-h-[86vh] flex items-center overflow-hidden bg-blush">
        {content?.heroImageUrl ? (
          <Image
            src={content.heroImageUrl}
            alt="FATEKIT"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-l from-espresso/85 via-espresso/50 to-espresso/10 pointer-events-none" />
        <div className="relative z-10 store-container w-full py-20 md:py-28">
          <div className="max-w-xl animate-slide-up text-right">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-champagne mb-6">
              <span className="w-8 h-px bg-champagne" />
              مجموعة الجمال
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold mb-5 text-white leading-[1.15] text-balance">
              {content?.heroTitle || "جمالكِ... بطريقتكِ"}
            </h1>
            <p className="font-sans text-base sm:text-lg text-white/85 mb-10 max-w-md leading-relaxed text-balance">
              {content?.heroSubtitle || "مكياج وعناية فاخرة صُممت لتبرز إطلالتكِ، بتوصيل سريع والدفع عند الاستلام."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={content?.heroPrimaryUrl || "/shop"}
                className="store-btn-primary bg-ivory text-primary hover:bg-white px-9"
              >
                {content?.heroPrimaryLabel || "تسوّقي الآن"}
              </Link>
              <Link href="/shop" className="store-btn-secondary border-white/40 text-white hover:bg-white/10 hover:border-white">
                اكتشفي التشكيلة
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {content?.promoActive ? (
        <div className="bg-secondary text-white py-3 w-full text-center">
          <p className="font-sans text-xs sm:text-sm tracking-wide font-medium">
            {content.promoText}
          </p>
        </div>
      ) : null}

      <section className="store-section store-container">
        <SectionHeading label="تسوقي حسب احتياجكِ" title="مجموعات المكياج" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 h-auto md:h-[560px]">
          {faceCat ? (
            <CategoryTile
              href={`/shop/${faceCat.category.slug}`}
              imageUrl={faceCat.imageUrl}
              name={faceCat.category.name}
              subtitle="اكتشفي المزيد"
              className="md:col-span-2 md:row-span-2 h-[280px] md:h-full"
              titleClass="text-3xl md:text-4xl"
            />
          ) : null}
          {eyesCat ? (
            <CategoryTile
              href={`/shop/${eyesCat.category.slug}`}
              imageUrl={eyesCat.imageUrl}
              name={eyesCat.category.name}
              subtitle="اكتشفي التشكيلة"
              className="md:col-span-2 md:row-span-1 h-[220px] md:h-full"
              titleClass="text-2xl md:text-3xl"
            />
          ) : null}
          {lipsCat ? (
            <CategoryTile
              href={`/shop/${lipsCat.category.slug}`}
              imageUrl={lipsCat.imageUrl}
              name={lipsCat.category.name}
              className="md:col-span-1 md:row-span-1 h-[220px] md:h-full"
              titleClass="text-xl md:text-2xl"
            />
          ) : null}
          {skinCat ? (
            <CategoryTile
              href={`/shop/${skinCat.category.slug}`}
              imageUrl={skinCat.imageUrl}
              name={skinCat.category.name}
              className="md:col-span-1 md:row-span-1 h-[220px] md:h-full"
              titleClass="text-xl md:text-2xl"
            />
          ) : null}
        </div>
      </section>

      {newProducts.length > 0 ? (
        <section className="store-section bg-ivory">
          <div className="store-container">
            <div className="flex items-end justify-between mb-10 md:mb-12 gap-4">
              <div>
                <span className="store-label block mb-2">إصدارات جديدة</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">وصل حديثاً</h2>
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
              >
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {newProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined,
                  }}
                  priority={i < 2}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {content?.statementActive ? (
        <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-espresso text-ivory">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(circle_at_30%_20%,#C9A27A,transparent_45%),radial-gradient(circle_at_80%_80%,#B76E79,transparent_40%)]" />
          <div className="relative max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <span className="store-label text-champagne">فلسفة FATEKIT</span>
            <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-balance">
              &quot;{content.statementText || "نؤمن بأن الجمال الفاخر هو احتفاء بتميّزكِ، لا بتقليد أحد."}&quot;
            </p>
          </div>
        </section>
      ) : null}

      {bestsellerProducts.length > 0 ? (
        <section className="store-section store-container">
          <div className="flex items-end justify-between mb-10 md:mb-12 gap-4">
            <div>
              <span className="store-label block mb-2">اختيارات العميلات</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">الأكثر مبيعاً</h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {bestsellerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: Number(product.price),
                  compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {content?.instagramActive && instagramImages.length > 0 ? (
        <section className="store-section store-container text-center">
          <SectionHeading title={content.instagramTitle || "إطلالات العميلات"} />
          <p className="text-on-surface-variant text-sm -mt-8 mb-10 flex items-center justify-center gap-2">
            <Instagram className="w-4 h-4" strokeWidth={1.5} />
            شاركينا إطلالتكِ عبر #FATEKIT
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
            {instagramImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square bg-blush/40 group overflow-hidden rounded-xl"
              >
                <Image
                  src={img.imageUrl}
                  alt="إطلالة FATEKIT"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover image-zoom"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CategoryTile({
  href,
  imageUrl,
  name,
  subtitle,
  className,
  titleClass,
}: {
  href: string;
  imageUrl: string | null;
  name: string;
  subtitle?: string;
  className?: string;
  titleClass?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden bg-blush rounded-2xl ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover image-zoom"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/15 to-transparent group-hover:from-espresso/90 transition-colors duration-500" />
      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end text-right text-white">
        <h3 className={`font-serif font-bold mb-1 tracking-tight ${titleClass}`}>{name}</h3>
        {subtitle ? (
          <span className="font-sans text-xs text-champagne/90 flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            {subtitle} <ArrowLeft className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="font-sans text-xs text-white/70 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            تسوّقي الآن <ArrowLeft className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
