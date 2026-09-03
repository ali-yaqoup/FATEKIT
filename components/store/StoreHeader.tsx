"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Heart, X } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CategoryLink {
  id: string;
  name: string;
  slug: string;
}

export function StoreHeader({ categories }: { categories: CategoryLink[] }) {
  const { items, openDrawer } = useCart();
  const { wishlist } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 font-sans pt-[env(safe-area-inset-top)] transition-all duration-500 ease-luxury",
        isScrolled
          ? "bg-ivory/90 backdrop-blur-xl shadow-xs border-b border-outline-variant/80"
          : "bg-ivory border-b border-transparent"
      )}
    >
      {isSearchOpen && (
        <div className="absolute inset-0 bg-ivory/97 backdrop-blur-xl z-50 flex items-center px-3 sm:px-4 border-b border-outline-variant">
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative">
            <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-secondary" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن أحمر شفاه، فاونديشن، عناية..."
              className="w-full bg-white border border-outline-variant text-primary text-sm sm:text-base px-10 sm:px-12 py-2.5 sm:py-3.5 rounded-full focus:outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/20 placeholder:text-neutral-400"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-primary transition-colors"
              aria-label="إغلاق البحث"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      <div className="store-container store-header-bar">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <MobileNav categories={categories} />
          <Link href="/" className="group flex flex-col items-center min-w-0">
            <span className="store-logo">FATEKIT</span>
            <span className="store-logo-tag">Beauty</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-[12px] xl:text-[13px] font-medium text-primary/80 min-w-0">
          <Link href="/" className="hover:text-secondary transition-colors duration-200 py-1">
            الرئيسية
          </Link>
          <Link href="/shop" className="hover:text-secondary transition-colors duration-200 py-1">
            المتجر
          </Link>
          <Link href="/about" className="hover:text-secondary transition-colors duration-200 py-1">
            عن المتجر
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="hover:text-secondary transition-colors duration-200 py-1 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="store-header-action"
            aria-label="البحث في المتجر"
          >
            <Search className="store-header-icon" strokeWidth={1.5} />
          </button>
          <Link
            href="/wishlist"
            className="store-header-action hidden sm:inline-flex relative hover:text-rose"
            aria-label="المفضلة"
          >
            <Heart className="store-header-icon" strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 left-0.5 bg-rose text-white text-[9px] min-w-[1rem] h-[1rem] px-1 rounded-full flex items-center justify-center font-bold">
                {wishlist.length > 9 ? "9+" : wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={openDrawer}
            className="store-header-action relative"
            aria-label={`سلة المشتريات${totalItemCount > 0 ? ` (${totalItemCount})` : ""}`}
            type="button"
          >
            <ShoppingBag className="store-header-icon" strokeWidth={1.5} />
            {totalItemCount > 0 ? (
              <span className="absolute top-0.5 left-0.5 bg-primary text-ivory text-[9px] min-w-[1rem] h-[1rem] px-1 rounded-full flex items-center justify-center font-bold">
                {totalItemCount > 9 ? "9+" : totalItemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
