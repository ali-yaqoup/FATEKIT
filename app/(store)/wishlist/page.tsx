"use client";

import { useWishlist } from "@/components/store/WishlistContext";
import { ProductCard } from "@/components/store/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Header */}
      <div className="bg-blush/40 border-b border-outline-variant/70">
        <div className="store-container py-12 md:py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="store-label">قائمتكِ الخاصة</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
              المفضلة
            </h1>
            <nav className="flex justify-center items-center gap-3 font-sans text-xs text-on-surface-variant">
              <Link href="/" className="hover:text-secondary transition-colors">
                الرئيسية
              </Link>
              <span className="text-outline">/</span>
              <span className="text-primary font-medium">المفضلة</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="store-container py-16 md:py-20">
        {wishlist.length === 0 ? (
          <div className="py-20 text-center bg-ivory border border-outline-variant p-12 md:p-16 space-y-6 rounded-2xl">
            <div className="w-16 h-16 bg-blush flex items-center justify-center mx-auto text-rose rounded-full">
              <Heart className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="font-serif text-3xl font-bold text-primary">
                المفضلة فارغة
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                لسا ما أضفتي منتجات للمفضلة. ابدئي التسوّق واحفظي اللي يعجبكِ.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="store-btn-primary"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                تصفح المنتجات
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-neutral-200/60">
              <div className="space-y-1">
                <span className="font-medium text-sm text-neutral-700">
                  <span className="font-bold text-primary">{wishlist.length}</span> منتج في المفضلة
                </span>
                <p className="text-xs text-neutral-400">المنتجات التي تحبينها</p>
              </div>
              <button
                onClick={clearWishlist}
                className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium"
              >
                مسح الكل
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {wishlist.map((item) => (
                <div key={item.id} className="relative group">
                  <ProductCard
                    product={{
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      images: [{ url: item.imageUrl }],
                    }}
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-md border border-neutral-200 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 rounded-full shadow-lg z-10"
                    aria-label="إزالة من المفضلة"
                  >
                    <Heart className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
