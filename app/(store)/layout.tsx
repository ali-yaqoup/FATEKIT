import Link from "next/link";
import { db } from "@/lib/db";
import { CartProvider } from "@/components/store/CartContext";
import { WishlistProvider } from "@/components/store/WishlistContext";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { TrustBar } from "@/components/store/TrustBar";
import { getStoreSettings } from "@/lib/store-settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    db.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getStoreSettings(),
  ]);

  return (
    <CartProvider
      deliveryFee={settings.deliveryFee}
      freeShippingMinimum={settings.freeShippingMinimum}
      deliveryAreas={settings.deliveryAreas}
    >
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-background text-on-background">
          <StoreHeader categories={categories} />
          <TrustBar />
          <CartDrawer />
          <div className="flex-1">{children}</div>

          <footer className="bg-espresso text-ivory pt-8 sm:pt-12 md:pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] mt-8 sm:mt-12 md:mt-16">
            <div className="store-container grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-8 lg:gap-12 text-right">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <h3 className="font-logo text-xl sm:text-2xl font-semibold tracking-[0.18em] sm:tracking-[0.22em]">{settings.storeName}</h3>
                <p className="text-xs sm:text-sm text-ivory/65 leading-relaxed max-w-sm">
                  متجر فلسطيني لمكياج وعناية من براندات عالمية مختارة، مع توصيل والدفع عند الاستلام.
                </p>
                <Link href="/about" className="inline-block text-xs text-champagne hover:text-ivory transition-colors">
                  تعرّفي على المتجر
                </Link>
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs tracking-wide font-semibold mb-2.5 sm:mb-4 text-champagne">التصنيفات</h4>
                <ul className="space-y-1.5 sm:space-y-2.5 text-xs sm:text-sm text-ivory/70">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/shop/${c.slug}`} className="hover:text-ivory transition-colors duration-200">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs tracking-wide font-semibold mb-2.5 sm:mb-4 text-champagne">خدمة العميلات</h4>
                <ul className="space-y-1.5 sm:space-y-2.5 text-xs sm:text-sm text-ivory/70">
                  <li>
                    <Link href="/about" className="hover:text-ivory transition-colors duration-200">
                      عن المتجر
                    </Link>
                  </li>
                  <li>الشحن والتوصيل</li>
                  <li>الدفع عند الاستلام</li>
                  <li>سياسة الخصوصية</li>
                  <li>الشروط والأحكام</li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-[11px] sm:text-xs tracking-wide font-semibold mb-2.5 sm:mb-4 text-champagne">تواصلي معنا</h4>
                <p className="text-xs sm:text-sm text-ivory/70 mb-2 leading-relaxed">خدمة العميلات عبر واتساب طوال أيام الأسبوع</p>
                <p className="text-xs sm:text-sm font-semibold text-ivory dir-ltr">{settings.whatsapp || settings.phone}</p>
                {settings.email ? (
                  <p className="text-[11px] text-ivory/50 mt-1.5 dir-ltr">{settings.email}</p>
                ) : null}
              </div>
            </div>

            <div className="store-container mt-7 sm:mt-10 pt-5 border-t border-white/10 text-center text-[11px] sm:text-xs text-ivory/40 space-y-1">
              <p>© {new Date().getFullYear()} {settings.storeName}. جميع الحقوق محفوظة.</p>
              <p>
                <Link href="/admin/login" className="hover:text-ivory/70">
                  إدارة المتجر
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
