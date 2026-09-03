import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { getActiveBrands } from "@/lib/brands";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata: Metadata = {
  title: "عن المتجر",
  description:
    "FATEKIT متجر فلسطيني يختار لكِ براندات المكياج والعناية العالمية الأصلية، مع توصيل والدفع عند الاستلام.",
};

export default async function AboutPage() {
  const [settings, brands] = await Promise.all([getStoreSettings(), getActiveBrands()]);

  const values = [
    {
      icon: Sparkles,
      title: "براندات عالمية مختارة",
      text: "ما منصنّع مكياج باسمنا. منختار لكِ ماركات معروفة ودرجات تناسب إطلالتكِ.",
    },
    {
      icon: ShieldCheck,
      title: "منتجات أصلية",
      text: "كل قطعة من مصدر موثوق. بتستلمي المنتج، بتشوفيه، وبعدين بتدفعي.",
    },
    {
      icon: Truck,
      title: "توصيل لكل المدن",
      text: "شحن سريع داخل فلسطين، والدفع نقداً عند الاستلام.",
    },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen">
      <div className="bg-blush/40 border-b border-outline-variant/70">
        <div className="store-container py-10 sm:py-14 md:py-20 text-center">
          <p className="store-label mb-3">قصتنا</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary text-balance">
            عن {settings.storeName}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-on-surface-variant leading-relaxed text-balance">
            متجر جمال فلسطيني يجمع لكِ أفضل براندات المكياج والعناية العالمية في مكان واحد.
          </p>
        </div>
      </div>

      <section className="store-container store-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="space-y-4">
            <span className="store-label">من نحن</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-balance">
              مش علامة مكياج. متجر يختار لكِ.
            </h2>
          </div>
          <div className="space-y-4 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            <p>
              {settings.storeName} اتأسس ليقرّب البراندات العالمية من العميلة الفلسطينية: فاونديشن، عيون، شفاه،
              وعناية، من ماركات تثقين فيها، من غير ما تضطري تبحثي في عشرات المواقع.
            </p>
            <p>
              كل منتج على الموقع تابع لبرنده الأصلي. إحنا الجهة اللي بتختار، بتجهّز، وبتوصل، وأنتِ بتدفعي عند الباب.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 md:mt-16">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-ivory border border-outline-variant/70 rounded-2xl p-5 sm:p-6">
              <span className="w-10 h-10 rounded-full bg-blush/70 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
              </span>
              <h3 className="font-serif text-lg font-bold text-primary mb-2">{title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {brands.length > 0 ? (
        <section className="bg-ivory border-y border-outline-variant/70">
          <div className="store-container py-12 sm:py-16 md:py-20 text-center">
            <span className="store-label block mb-3">في المتجر الآن</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 sm:mb-10">
              البراندات التي نختارها
            </h2>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-outline-variant bg-white text-sm font-medium text-primary hover:border-champagne hover:bg-blush/40 transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {settings.deliveryAreas.length > 0 ? (
        <section className="store-container py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="store-label block">نوصل إلى</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">مدن فلسطين</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              التوصيل خلال 2–4 أيام عمل. رسوم الشحن {settings.deliveryFee.toFixed(0)} ₪، ومجاني للطلبات فوق{" "}
              {settings.freeShippingMinimum.toFixed(0)} ₪.
            </p>
            <p className="text-sm text-primary/80 leading-relaxed">
              {settings.deliveryAreas.join(" · ")}
            </p>
          </div>
        </section>
      ) : null}

      <section className="store-container pb-14 sm:pb-20 text-center">
        <div className="bg-espresso text-ivory rounded-2xl px-6 py-10 sm:py-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">جاهزة تختاري إطلالتكِ؟</h2>
          <p className="text-sm text-ivory/70 max-w-md mx-auto mb-7 leading-relaxed">
            تصفّحي التشكيلة، أو تواصلي معنا عبر واتساب لأي استفسار عن الدرجة المناسبة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/shop" className="store-btn-primary bg-ivory text-primary hover:bg-white">
              تسوّقي البراندات
              <ArrowLeft className="w-4 h-4" />
            </Link>
            {settings.whatsapp ? (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                className="store-btn-secondary border-white/30 text-white hover:bg-white/10 hover:border-white"
                target="_blank"
                rel="noreferrer"
              >
                واتساب
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
