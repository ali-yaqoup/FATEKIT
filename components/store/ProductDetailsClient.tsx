"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, ChevronDown, Truck, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useCart } from "./CartContext";

export interface ProductVariantData {
  id: string;
  name: string;
  colorCode: string | null;
  imageUrl: string | null;
  price: number | null;
  sku: string | null;
  quantity: number;
}

export interface ProductImageData {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    brand: string | null;
    price: number;
    compareAtPrice: number | null;
    discountPercent: number | null;
    ingredients: string | null;
    usageInstructions: string | null;
    details: string | null;
    status: string;
    isArchived: boolean;
    quantity: number | null;
    category: {
      name: string;
      slug: string;
    };
    images: ProductImageData[];
    variants: ProductVariantData[];
  };
}

export function ProductDetailsClient({ product }: ProductDetailsProps) {
  const { addItem } = useCart();
  const images = product.images.length > 0
    ? product.images
    : [{ id: "default", url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80", sortOrder: 0 }];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Derived price & stock
  const currentPrice = selectedVariant?.price !== null && selectedVariant?.price !== undefined
    ? Number(selectedVariant.price)
    : Number(product.price);

  const currentStock = selectedVariant
    ? selectedVariant.quantity
    : (product.quantity ?? 0);

  let stockLabel = "متوفر بالمخزون";
  let stockIcon = <CheckCircle className="w-4 h-4 text-emerald-700" />;
  let stockClass = "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (product.status === "INACTIVE" || product.isArchived || currentStock <= 0) {
    stockLabel = "نفد المخزون";
    stockIcon = <XCircle className="w-4 h-4 text-neutral-500" />;
    stockClass = "bg-neutral-100 text-neutral-700 border-neutral-300";
  } else if (currentStock <= 5) {
    stockLabel = `مخزون منخفض (متبقي ${currentStock} فقط)`;
    stockIcon = <AlertCircle className="w-4 h-4 text-amber-700" />;
    stockClass = "bg-amber-50 text-amber-900 border-amber-200";
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      productName: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      imageUrl: selectedVariant?.imageUrl || images[selectedImageIndex]?.url || images[0].url,
      quantity: quantity,
      sku: selectedVariant?.sku || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <main className="max-w-container mx-auto px-6 md:px-16 py-10 md:py-20">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-sans text-neutral-500 mb-10">
          <Link href="/" className="hover:text-black transition">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link href={`/shop/${product.category.slug}`} className="hover:text-black transition">
            {product.category.name}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-black font-medium">{product.name}</span>
        </nav>

        {/* Product Grid Layout matching fatekit_4 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery Column (Desktop: 7 cols) */}
          <div className="md:col-span-7 flex flex-col md:flex-row gap-4 h-[500px] md:h-[700px]">
            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-24 h-full overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-full aspect-[3/4] relative border transition ${
                      selectedImageIndex === idx ? "border-black border-2" : "border-neutral-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image */}
            <div className="flex-1 relative h-full border border-neutral-200 bg-neutral-100 overflow-hidden">
              <Image
                src={images[selectedImageIndex]?.url || images[0].url}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {product.discountPercent && (
                <span className="absolute top-4 right-4 bg-black text-white text-xs uppercase font-bold px-3 py-1">
                  خصم {product.discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Details & Purchasing Column (Desktop: 5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-start pt-2 md:pt-6">
            {/* Title & Brand */}
            <div className="mb-4">
              <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                {product.brand || "FATEKIT"}
              </span>
              <h1 className="font-serif text-3xl md:text-5xl font-bold mt-1 text-black leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-black">
                {currentPrice.toFixed(2)} ₪
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-neutral-400 line-through font-normal">
                  {Number(product.compareAtPrice).toFixed(2)} ₪
                </span>
              )}
              <span className="text-xs text-neutral-500 font-sans block">
                شامل ضريبة القيمة المضافة
              </span>
            </div>

            {/* Stock status badge */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-medium ${stockClass}`}>
                {stockIcon}
                <span>{stockLabel}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="font-sans text-sm text-neutral-600 mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Shade / Variant Selector */}
            {product.variants.length > 0 && (
              <div className="mb-8 border-t border-b border-neutral-200 py-6">
                <div className="flex justify-between items-center mb-3 text-sm font-medium">
                  <span>الدرجة / اللون:</span>
                  <span className="text-black font-semibold">
                    {selectedVariant?.name || "اختر اللون"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    const isOutOfStock = variant.quantity <= 0;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          if (variant.imageUrl) {
                            const foundImgIdx = images.findIndex((img) => img.url === variant.imageUrl);
                            if (foundImgIdx !== -1) setSelectedImageIndex(foundImgIdx);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-2.5 px-3.5 py-2 border text-xs transition ${
                          isSelected
                            ? "border-black border-2 bg-neutral-50 font-semibold"
                            : "border-neutral-300 hover:border-black"
                        } ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {variant.colorCode && (
                          <span
                            className="w-4 h-4 rounded-full border border-neutral-400 inline-block shrink-0"
                            style={{ backgroundColor: variant.colorCode }}
                          />
                        )}
                        <span>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase text-neutral-700">الكمية:</span>
              <div className="flex items-center border border-black h-11 w-32">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-lg"
                >
                  -
                </button>
                <span className="flex-1 text-center font-sans font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock || 99, q + 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-4 font-sans text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition ${
                  addedToCart
                    ? "bg-emerald-800 text-white"
                    : currentStock > 0
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedToCart ? "تمت الإضافة للسلة ✓" : "أضيفي إلى السلة"}</span>
              </button>

              <Link
                href="/cart"
                className="w-full text-center py-4 border border-black text-black font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition block"
              >
                عرض سلة المشتريات
              </Link>
            </div>

            {/* Cash on Delivery Badge */}
            <div className="flex items-center gap-3 p-4 bg-neutral-100 border border-neutral-200 mb-10 text-xs font-medium text-neutral-800">
              <Truck className="w-5 h-5 text-black shrink-0" />
              <span>الدفع عند الاستلام متوفر لجميع المدن (COD ₪)</span>
            </div>

            {/* Accordions Section */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200">
              {/* Accordion 1: Details & Ingredients */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                  className="w-full py-5 flex justify-between items-center text-right font-serif text-base font-semibold hover:text-neutral-700 transition"
                >
                  <span>التفاصيل والمكونات</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "details" ? "rotate-180" : ""}`} />
                </button>
                {activeAccordion === "details" && (
                  <div className="pb-5 font-sans text-xs text-neutral-600 leading-relaxed space-y-3">
                    {product.details && <p>{product.details}</p>}
                    {product.ingredients && (
                      <div>
                        <strong className="block text-black mb-1">المكونات الأساسية:</strong>
                        <p>{product.ingredients}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Delivery Info */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "delivery" ? null : "delivery")}
                  className="w-full py-5 flex justify-between items-center text-right font-serif text-base font-semibold hover:text-neutral-700 transition"
                >
                  <span>التوصيل والشحن</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "delivery" ? "rotate-180" : ""}`} />
                </button>
                {activeAccordion === "delivery" && (
                  <div className="pb-5 font-sans text-xs text-neutral-600 leading-relaxed space-y-2">
                    <p>• التوصيل السريع لكافة المدن (القدس، الضفة الغربية): 2 - 4 أيام عمل.</p>
                    <p>• رسوم التوصيل الثابتة: 30 ₪ (توصيل مجاني للطلبات فوق 350 ₪).</p>
                    <p>• الدفع نقداً عند الاستلام فقط (COD).</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Usage Instructions */}
              {product.usageInstructions && (
                <div>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === "usage" ? null : "usage")}
                    className="w-full py-5 flex justify-between items-center text-right font-serif text-base font-semibold hover:text-neutral-700 transition"
                  >
                    <span>طريقة الاستخدام</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "usage" ? "rotate-180" : ""}`} />
                  </button>
                  {activeAccordion === "usage" && (
                    <div className="pb-5 font-sans text-xs text-neutral-600 leading-relaxed">
                      <p>{product.usageInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
