"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryLink {
  id: string;
  name: string;
  slug: string;
}

export function MobileNav({ categories }: { categories: CategoryLink[] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="store-header-action -mr-1"
        aria-label="فتح القائمة"
      >
        <Menu className="store-header-icon" strokeWidth={1.5} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-espresso/40 backdrop-blur-sm animate-fade-in"
            onClick={close}
            aria-hidden="true"
          />
          <nav
            className="absolute inset-y-0 right-0 w-[min(100%,320px)] max-w-[86vw] bg-ivory text-primary shadow-drawer flex flex-col animate-slide-in-right pt-[env(safe-area-inset-top)]"
            aria-label="قائمة التنقل"
          >
            <div className="flex items-center justify-between px-5 store-header-bar border-b border-outline-variant">
              <span className="store-logo">FATEKIT</span>
              <button
                type="button"
                onClick={close}
                className="p-2 text-primary/50 hover:text-primary transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-5 space-y-1">
              <MobileNavLink href="/" onClick={close}>
                الرئيسية
              </MobileNavLink>
              <MobileNavLink href="/shop" onClick={close}>
                المتجر الكامل
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={close}>
                عن المتجر
              </MobileNavLink>
              <div className="pt-6 pb-2 px-3">
                <span className="store-label">التصنيفات</span>
              </div>
              {categories.map((cat) => (
                <MobileNavLink key={cat.id} href={`/shop/${cat.slug}`} onClick={close}>
                  {cat.name}
                </MobileNavLink>
              ))}
              <div className="pt-4">
                <Link
                  href="/wishlist"
                  onClick={close}
                  className="flex items-center gap-2 px-3 py-3.5 text-sm font-medium text-primary/80 hover:text-rose hover:bg-blush/40 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4" strokeWidth={1.5} />
                  المفضلة
                </Link>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant text-xs text-on-surface-variant">
              <p>الدفع عند الاستلام · توصيل لكافة المدن</p>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block px-3 py-3.5 text-[15px] font-medium text-primary/90",
        "hover:text-secondary hover:bg-blush/40 rounded-lg transition-colors duration-200"
      )}
    >
      {children}
    </Link>
  );
}
