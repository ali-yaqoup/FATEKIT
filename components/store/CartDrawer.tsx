"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, ShoppingBag, ArrowLeft, Tag, Check, Truck } from "lucide-react";
import { useCart } from "./CartContext";
import { validateCouponAction } from "@/lib/actions/coupons";

export function CartDrawer() {
  const router = useRouter();
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
    isDrawerOpen,
    closeDrawer,
    freeShippingThreshold,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

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
      setShowCouponField(false);
    } else {
      setCouponError(res.error || "كود الكوبون غير صحيح");
    }
  };

  const handleCheckoutClick = () => {
    closeDrawer();
    router.push("/checkout");
  };

  const handleViewCartClick = () => {
    closeDrawer();
    router.push("/cart");
  };

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Container (Sliding in from Left/Right) */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 md:pl-10">
        <div className="w-screen max-w-md bg-ivory shadow-drawer flex flex-col justify-between h-full animate-slide-in-right">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="font-serif text-lg font-bold tracking-wide text-black">
                سلة المشتريات
              </h2>
              {totalItemCount > 0 && (
                <span className="bg-black text-white text-[11px] font-semibold px-2 py-0.5">
                  {totalItemCount}
                </span>
              )}
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors duration-200"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {items.length > 0 && (
            <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
              <div className="flex items-center gap-2 mb-1.5 font-medium text-neutral-800">
                <Truck className="w-4 h-4 text-black shrink-0" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    أضيفي منتجات بقيمة{" "}
                    <strong className="font-bold text-black font-serif">
                      {remainingForFreeShipping.toFixed(2)} ₪
                    </strong>{" "}
                    للحصول على <span className="text-emerald-700 font-bold">شحن مجاني</span>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    مبارك! لقد حصلتِ على شحن مجاني لطلبكِ.
                  </span>
                )}
              </div>
              <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drawer Body / Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">سلتكِ فارغة</h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6 leading-relaxed">
                  لم تقومي بإضافة أي منتجات بعد. تصفحي تشكيلتنا الفاخرة واختاري ما يناسب إطلالتكِ.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push("/shop");
                  }}
                  className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition"
                >
                  تصفحي المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  {/* Item Image */}
                  <div className="w-20 h-24 relative bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between min-h-[96px]">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-600 transition p-1"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantName && (
                        <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                          الدرجة: {item.variantName}
                        </p>
                      )}
                      <p className="font-serif text-xs font-bold text-black mt-1">
                        {item.price.toFixed(2)} ₪
                      </p>
                    </div>

                    {/* Quantity Selector & Item Subtotal */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center border border-neutral-300 h-7 w-24">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-xs text-neutral-700"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-sans text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-neutral-100 font-bold transition text-xs text-neutral-700"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif text-xs font-bold text-neutral-900">
                        {(item.price * item.quantity).toFixed(2)} ₪
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary & Actions (Only when cart has items) */}
          {items.length > 0 && (
            <div className="p-5 bg-neutral-50 border-t border-neutral-200 space-y-4">
              
              {/* Coupon Toggle / Form */}
              <div>
                {!appliedCoupon && !showCouponField && (
                  <button
                    onClick={() => setShowCouponField(true)}
                    className="text-xs text-neutral-700 hover:text-black font-semibold flex items-center gap-1.5 underline"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    هل لديكِ كوبون خصم؟
                  </button>
                )}

                {showCouponField && !appliedCoupon && (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="أدخلي الكود (مثال: FATE10)"
                        className="flex-1 bg-white border border-neutral-300 px-3 py-2 text-xs uppercase focus:outline-none focus:border-black"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="bg-black text-white px-3.5 py-2 text-xs font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                      >
                        {isApplyingCoupon ? "..." : "تطبيق"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCouponField(false);
                          setCouponError(null);
                        }}
                        className="text-neutral-400 hover:text-black text-xs"
                      >
                        إلغاء
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 font-sans">{couponError}</p>
                    )}
                  </form>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      كوبون ({appliedCoupon.code}) : خصم {appliedCoupon.type === "PERCENTAGE" ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ₪`}
                    </span>
                    <button
                      onClick={() => setCoupon(null)}
                      className="text-emerald-900 underline text-[11px] hover:text-black"
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-200 pt-3">
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
                    <span>قيمة الخصم</span>
                    <span className="font-serif">- {discount.toFixed(2)} ₪</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200 text-sm font-bold text-black">
                  <span className="font-serif text-base">الإجمالي المطلوب</span>
                  <span className="font-serif text-xl text-black">
                    {total.toFixed(2)} ₪
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-4 bg-primary text-ivory text-sm font-semibold hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2 rounded-full"
                >
                  <span>إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleViewCartClick}
                  className="w-full py-3 bg-transparent border border-primary/20 text-primary text-sm font-semibold hover:bg-blush/40 transition-colors duration-300 text-center block rounded-full"
                >
                  عرض سلة المشتريات بالتفصيل
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-400">
                الدفع نقداً عند الاستلام فقط (COD ₪)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
