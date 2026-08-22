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
    <header className="bg-primary text-on-primary sticky top-0 z-40 border-b border-neutral-900">
      <div className="max-w-container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-3xl font-bold tracking-widest text-on-primary hover:opacity-90 transition"
        >
          FATEKIT
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-8 space-x-reverse text-sm font-medium tracking-wide">
          <Link href="/" className="hover:text-champagne transition">
            الرئيسية
          </Link>
          <Link href="/shop" className="hover:text-champagne transition">
            الكل
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="hover:text-champagne transition"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-6 space-x-reverse">
          <Link href="/shop" className="hover:text-champagne transition" aria-label="البحث">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/admin/login" className="hover:text-champagne transition" aria-label="حسابي / الإدارة">
            <User className="w-5 h-5" />
          </Link>
          <button
            onClick={openDrawer}
            className="hover:text-champagne transition relative p-1"
            aria-label="سلة المشتريات"
            type="button"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
