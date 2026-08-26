"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Heart, Plus } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: unknown;
  compareAtPrice?: unknown;
  discountPercent?: number | null;
  brand?: string | null;
  images: { url: string }[];
  isNew?: boolean;
  isBestseller?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const imageUrl = product.images[0]?.url || "https://picsum.photos/seed/placeholder/800/800";
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: imageUrl,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      imageUrl: imageUrl,
    });
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <Link
      href={`/product/${product.slug}`}
      prefetch={true}
      className={cn("group block text-right font-sans", className)}
    >
      <div className="relative aspect-[3/4] bg-blush/30 overflow-hidden mb-4 rounded-xl">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover image-zoom"
        />

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          {product.discountPercent ? (
            <span className="bg-rose text-white text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full shadow-xs">
              خصم {product.discountPercent}%
            </span>
          ) : product.isNew ? (
            <span className="bg-ivory/95 text-primary text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full shadow-xs">
              جديد
            </span>
          ) : product.isBestseller ? (
            <span className="bg-primary/90 text-ivory text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full shadow-xs">
              الأكثر مبيعاً
            </span>
          ) : null}
        </div>

        <button
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-3 left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs",
            inWishlist
              ? "bg-rose text-white"
              : "bg-ivory/90 text-primary/70 hover:text-rose opacity-100 md:opacity-0 md:group-hover:opacity-100"
          )}
          aria-label="المفضلة"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <button
          onClick={handleAddToCart}
          className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-center gap-2 py-2.5 bg-ivory/95 text-primary text-xs font-medium rounded-full shadow-soft opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-luxury hover:bg-primary hover:text-ivory"
          aria-label="إضافة للسلة"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          أضيفي للسلة
        </button>
      </div>

      <div className="space-y-1.5 px-0.5">
        {product.brand ? (
          <p className="text-[11px] text-secondary tracking-wide">{product.brand}</p>
        ) : null}
        <h3 className="font-serif text-[15px] sm:text-base font-bold text-primary group-hover:text-secondary transition-colors duration-300 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 font-sans pt-0.5">
          <span className="text-primary font-semibold text-sm">
            {Number(product.price).toFixed(2)} ₪
          </span>
          {Boolean(product.compareAtPrice) ? (
            <span className="text-xs text-neutral-400 line-through">
              {Number(product.compareAtPrice).toFixed(2)} ₪
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
