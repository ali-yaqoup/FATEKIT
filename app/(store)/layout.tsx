import Link from "next/link";
import { db } from "@/lib/db";
import { CartProvider } from "@/components/store/CartContext";
import { WishlistProvider } from "@/components/store/WishlistContext";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { TrustBar } from "@/components/store/TrustBar";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await db.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-background text-on-background">
          <StoreHeader categories={categories} />
          <TrustBar />
          <CartDrawer />
          <div className="flex-1">{children}</div>

          <footer className="bg-espresso text-ivory pt-16 md:pt-20 pb-10 mt-16 md:mt-20">
            <div className="store-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 text-center sm:text-right">
              <div className="space-y-4">
                <h3 className="font-logo text-2xl font-semibold tracking-[0.22em]">FATEKIT</h3>
                <p className="text-sm text-ivory/65 leading-relaxed max-w-xs sm:max-w-none mx-auto sm:mx-0">
                  علامة فلسطينية للمكياج والعناية بالبشرة، صُممت لتبرز تميّزكِ بإطلالة ناعمة وواثقة.
                </p>
              </div>
              <div>
                <h4 className="text-xs tracking-wide font-semibold mb-4 text-champagne">التصنيفات</h4>
                <ul className="space-y-2.5 text-sm text-ivory/70">
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
                <h4 className="text-xs tracking-wide font-semibold mb-4 text-champagne">خدمة العميلات</h4>
                <ul className="space-y-2.5 text-sm text-ivory/70">
                  <li>الشحن والتوصيل</li>
                  <li>الدفع عند الاستلام</li>
                  <li>سياسة الخصوصية</li>
                  <li>الشروط والأحكام</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs tracking-wide font-semibold mb-4 text-champagne">تواصلي معنا</h4>
                <p className="text-sm text-ivory/70 mb-3 leading-relaxed">خدمة العميلات عبر واتساب طوال أيام الأسبوع</p>
                <p className="text-sm font-semibold text-ivory dir-ltr sm:text-right">+970 599 000 000</p>
              </div>
            </div>

            <div className="store-container mt-14 pt-8 border-t border-white/10 text-center text-xs text-ivory/40">
              © {new Date().getFullYear()} FATEKIT. جميع الحقوق محفوظة.
            </div>
          </footer>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
