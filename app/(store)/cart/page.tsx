"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, Truck, Tag, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { validateCouponAction } from "@/lib/actions/coupons";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    discount,
    total,
    appliedCoupon,
    setCoupon,
    freeShippingThreshold,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);

    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    const res = await validateCouponAction(couponInput, subtotal);
    setIsApplyingCoupon(false);

    if (res.success && res.coupon) {
      setCoupon({
        id: res.coupon.id,
        code: res.coupon.code,
        type: res.coupon.type as "PERCENTAGE" | "FIXED",
        value: res.coupon.value,
        discountAmount: res.coupon.discountAmount,
      });
      setCouponInput("");
    } else {
      setCouponError(res.error || "كود الكوبون غير صحيح");
    }
  };

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="bg-background text-on-background min-h-screen">
      <main className="max-w-container mx-auto px-6 md:px-16 py-12 md:py-20">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-10 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-sans text-neutral-500 mb-3">
            <Link href="/" className="hover:text-black transition">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition">
              المتجر
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">سلة المشتريات</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black">
            سلة المشتريات
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-neutral-200 bg-white max-w-md mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2 text-black">سلتكِ فارغة حالياً</h2>
            <p className="text-xs font-sans text-neutral-500 mb-6 leading-relaxed">
              استكشفي تشكيلاتنا الفاخرة وأضيفي منتجاتكِ المفضلة إلى السلة.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors duration-300 shadow-xs"
            >
              <span>تصفحي المتجر</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Cart Items Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Free Shipping Notification Banner */}
              <div className="bg-white border border-neutral-200 p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2 font-sans text-xs">
                  <Truck className="w-4 h-4 text-black shrink-0" />
                  {remainingForFreeShipping > 0 ? (
                    <span className="text-neutral-700">
                      أضيفي منتجات بقيمة{" "}
                      <strong className="font-bold text-black font-serif">
                        {remainingForFreeShipping.toFixed(2)} ₪
                      </strong>{" "}
                      للحصول على <span className="text-emerald-700 font-bold">توصيل مجاني</span> لطلبكِ!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      تهانينا! لقد حصلتِ على توصيل مجاني لطلبكِ.
                    </span>
                  )}
                </div>
                <div className="w-full bg-neutral-100 h-1.5 overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white border border-neutral-200 divide-y divide-neutral-200">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-32 relative bg-neutral-100 border border-neutral-200 shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1">
                      <h2 className="font-serif text-lg font-bold text-black">
                        {item.productName}
                      </h2>
                      {item.variantName && (
                        <p className="text-xs text-neutral-500 font-sans">
                          الدرجة / اللون: <span className="text-neutral-800 font-semibold">{item.variantName}</span>
                        </p>
                      )}
                      <p className="font-sans text-sm font-semibold text-neutral-900 pt-1">
                        سعر القطعة: {item.price.toFixed(2)} ₪
                      </p>
                    </div>

                    {/* Controls & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-black h-10 w-28">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-base"
                          aria-label="تقليل الكمية"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-sans text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-base"
                          aria-label="زيادة الكمية"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-left font-serif text-lg font-bold text-black min-w-[80px]">
                        {(item.price * item.quantity).toFixed(2)} ₪
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-400 hover:text-red-600 transition p-1"
                        aria-label="حذف المنتج"
                        title="حذف المنتج من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Form Box */}
              <div className="bg-white border border-neutral-200 p-6">
                <h3 className="font-serif text-base font-bold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-black" />
                  <span>كوبون الخصم</span>
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="أدخلي كود الكوبون (مثال: FATE10)"
                      className="w-full bg-white border border-neutral-300 px-4 py-3 text-xs font-sans focus:outline-none focus:border-black uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="bg-black text-white px-8 py-3 font-sans text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {isApplyingCoupon ? "جاري الفحص..." : "تطبيق الكوبون"}
                  </button>
                </form>

                {couponError && (
                  <p className="text-xs text-red-600 font-sans mt-2.5">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-4 flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans">
                    <span className="flex items-center gap-2 font-medium">
                      <Check className="w-4 h-4 text-emerald-600" />
                      تم تفعيل الكوبون <strong className="font-bold">({appliedCoupon.code})</strong> — خصم {appliedCoupon.type === "PERCENTAGE" ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ₪`}
                    </span>
                    <button
                      onClick={() => setCoupon(null)}
                      className="text-emerald-900 underline hover:text-black font-semibold text-xs"
                    >
                      إلغاء الكوبون
                    </button>
                  </div>
                )}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-neutral-600 hover:text-black transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>متابعة التسوق وإضافة منتجات أخرى</span>
                </Link>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-neutral-200 p-8 sticky top-28 space-y-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold border-b border-neutral-200 pb-4 text-black">
                  ملخص الطلب
                </h2>

                <div className="space-y-3.5 font-sans text-sm border-b border-neutral-200 pb-6 text-neutral-600">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span className="font-semibold text-black font-serif">{subtotal.toFixed(2)} ₪</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم التوصيل</span>
                    <span className="font-semibold text-black font-serif">
                      {shippingFee === 0 ? "مجاني" : `${shippingFee.toFixed(2)} ₪`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>الخصم ({appliedCoupon?.code})</span>
                      <span className="font-semibold font-serif">- {discount.toFixed(2)} ₪</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-serif text-lg font-bold text-black">المجموع الإجمالي</span>
                  <span className="font-serif text-3xl font-bold text-black">
                    {total.toFixed(2)} ₪
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-black text-white text-center py-4 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition block shadow-sm"
                >
                  الانتقال للدفع وتأكيد الطلب
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-sans pt-2 border-t border-neutral-100">
                  <Truck className="w-4 h-4 text-black" />
                  <span>الدفع نقداً عند الاستلام فقط (COD ₪)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
