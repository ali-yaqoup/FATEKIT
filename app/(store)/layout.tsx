import Link from "next/link";
import { db } from "@/lib/db";
import { CartProvider } from "@/components/store/CartContext";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CartDrawer } from "@/components/store/CartDrawer";

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
      <div className="min-h-screen flex flex-col bg-background text-on-background">
        {/* Global Black Header */}
        <StoreHeader categories={categories} />

        {/* Global Cart Drawer */}
        <CartDrawer />

        {/* Main Content */}
        <div className="flex-1">{children}</div>

        {/* Global Footer */}
        <footer className="bg-primary text-on-primary pt-16 pb-12 border-t border-neutral-900 mt-20">
          <div className="max-w-container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-right">
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-widest mb-4">FATEKIT</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                علامة تجارية فاخرة للمكياج والعناية بالبشرة، صممت خصيصاً لإبراز تميزكِ وإطلالتك الاستثنائية.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-champagne">التصنيفات</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/shop/${c.slug}`} className="hover:text-white transition">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-champagne">خدمة العملاء</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>الشحن والتوصيل (الدفع عند الاستلام ₪)</li>
                <li>سياسة الخصوصية</li>
                <li>الشروط والأحكام</li>
                <li>تواصل معنا</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-champagne">تواصل معنا</h4>
              <p className="text-sm text-neutral-300 mb-2">خدمة العملاء على مدار الساعة عبر الواتساب</p>
              <p className="text-sm font-semibold text-white dir-ltr text-right">+970 599 000 000</p>
            </div>
          </div>

          <div className="max-w-container mx-auto px-6 mt-12 pt-8 border-t border-neutral-900 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} FATEKIT. جميع الحقوق محفوظة.
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
