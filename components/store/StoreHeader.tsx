"use client";

import Link from "next/link";
import { ShoppingBag, Search, User } from "lucide-react";
import { useCart } from "./CartContext";

interface CategoryLink {
  id: string;
  name: string;
  slug: string;
}

export function StoreHeader({ categories }: { categories: CategoryLink[] }) {
  const { items, openDrawer } = useCart();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-primary text-on-primary sticky top-0 z-40 border-b border-neutral-900 font-sans">
      <div className="max-w-container mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
        {/* Logo (Serif Monolith) */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl font-bold tracking-[0.25em] text-white hover:text-champagne transition-colors duration-300"
        >
          FATEKIT
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-neutral-300">
          <Link href="/" className="hover:text-champagne transition-colors duration-300 py-1 border-b border-transparent hover:border-champagne">
            الرئيسية
          </Link>
          <Link href="/shop" className="hover:text-champagne transition-colors duration-300 py-1 border-b border-transparent hover:border-champagne">
            المتجر الكامل
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="hover:text-champagne transition-colors duration-300 py-1 border-b border-transparent hover:border-champagne"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            className="text-neutral-300 hover:text-champagne transition-colors duration-300 p-1.5"
            aria-label="البحث في المتجر"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/admin/login"
            className="text-neutral-300 hover:text-champagne transition-colors duration-300 p-1.5"
            aria-label="حسابي / لوحة التحكم"
          >
            <User className="w-5 h-5" />
          </Link>
          <button
            onClick={openDrawer}
            className="text-neutral-300 hover:text-champagne transition-colors duration-300 relative p-1.5 focus:outline-none"
            aria-label="سلة المشتريات"
            type="button"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans shadow-xs animate-pulse">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
