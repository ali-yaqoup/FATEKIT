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
        "sticky top-0 z-40 font-sans transition-all duration-500 ease-luxury",
        isScrolled
          ? "bg-ivory/90 backdrop-blur-xl shadow-xs border-b border-outline-variant/80"
          : "bg-ivory border-b border-transparent"
      )}
    >
      {isSearchOpen && (
        <div className="absolute inset-0 bg-ivory/97 backdrop-blur-xl z-50 flex items-center px-4 border-b border-outline-variant">
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي عن أحمر شفاه، فاونديشن، عناية..."
              className="w-full bg-white border border-outline-variant text-primary text-base px-12 py-3.5 rounded-full focus:outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/20 placeholder:text-neutral-400"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-primary transition-colors"
              aria-label="إغلاق البحث"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      <div className="store-container h-[4.25rem] md:h-[5.25rem] flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 md:gap-0">
          <MobileNav categories={categories} />
          <Link href="/" className="group flex flex-col items-center">
            <span className="font-logo text-[1.65rem] sm:text-3xl md:text-[2.1rem] font-semibold tracking-[0.28em] text-primary leading-none">
              FATEKIT
            </span>
            <span className="hidden sm:block text-[9px] tracking-[0.38em] text-secondary/80 mt-1 uppercase">
              Beauty
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8 xl:gap-9 text-[13px] font-medium text-primary/80">
          <Link href="/" className="hover:text-secondary transition-colors duration-200 py-1">
            الرئيسية
          </Link>
          <Link href="/shop" className="hover:text-secondary transition-colors duration-200 py-1">
            المتجر
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

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-primary/70 hover:text-secondary transition-colors p-2.5 rounded-full hover:bg-blush/50"
            aria-label="البحث في المتجر"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/wishlist"
            className="hidden sm:flex text-primary/70 hover:text-rose transition-colors p-2.5 rounded-full hover:bg-blush/50 relative"
            aria-label="المفضلة"
          >
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 left-1 bg-rose text-white text-[9px] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full flex items-center justify-center font-bold">
                {wishlist.length > 9 ? "9+" : wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={openDrawer}
            className="text-primary/70 hover:text-secondary transition-colors relative p-2.5 rounded-full hover:bg-blush/50"
            aria-label={`سلة المشتريات${totalItemCount > 0 ? ` (${totalItemCount})` : ""}`}
            type="button"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {totalItemCount > 0 ? (
              <span className="absolute top-1 left-1 bg-primary text-ivory text-[9px] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full flex items-center justify-center font-bold">
                {totalItemCount > 9 ? "9+" : totalItemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
