"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Truck, Lock, ShoppingBag, AlertCircle, Tag, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { createOrderAction } from "@/lib/actions/orders";
import { validateCouponAction } from "@/lib/actions/coupons";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shippingFee,
    discount,
    total,
    appliedCoupon,
    setCoupon,
    clearCart,
    deliveryAreas,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(deliveryAreas[0] || "رام الله والبيرة");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }>({});

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFields = () => {
    const errors: { name?: string; phone?: string; email?: string; address?: string } = {};

    if (!name.trim() || name.trim().length < 3) {
      errors.name = "الرجاء إدخال الاسم الكامل (3 أحرف على الأقل)";
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    const phoneRegex = /^(\+?97[02]|0)?5[0-9]{8}$/;
    if (!phone.trim()) {
      errors.phone = "الرجاء إدخال رقم الهاتف للتواصل والتسليم";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "صيغة رقم الهاتف غير صحيحة (مثال: 0599000000 أو 0569000000)";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "الرجاء إدخال عنوان بريد إلكتروني صحيح (مثال: name@mail.com)";
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = "الرجاء كتابة العنوان التفصيلي (الشارع، اسم العمارة، الطابق)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateFields()) {
      setError("يرجى تصحيح الأخطاء الموضحة في الحقول أدناه.");
      return;
    }

    if (items.length === 0) {
      setError("سلة المشتريات فارغة، لا يمكن إتمام الطلب.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createOrderAction({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email?.trim() || undefined,
        shippingAddress: address.trim(),
        shippingCity: city.trim(),
        deliveryNotes: deliveryNotes?.trim() || undefined,
        couponCode: appliedCoupon?.code,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      });

      if (res.success && res.orderNumber) {
        clearCart();
        router.push(`/order/${res.orderNumber}`);
      } else {
        setError(res.error || "حدث خطأ أثناء تنفيذ الطلب، يرجى المحاولة مرة أخرى.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Checkout submit error:", err);
      setError("حدث خطأ غير متوقع أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-10 border border-neutral-200 max-w-md w-full shadow-xs">
          <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">سلتكِ فارغة</h1>
          <p className="text-sm font-sans text-neutral-500 mb-6">
            لا توجد منتجات في السلة لإتمام عملية الشراء.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition"
          >
            الانتقال للمتجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen">
      <main className="max-w-container mx-auto px-6 md:px-16 py-12 md:py-20">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-sans text-neutral-500 mb-6">
          <Link href="/cart" className="hover:text-black transition flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للسلة</span>
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">إتمام الطلب</span>
        </div>

        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2 text-black">إتمام الطلب</h1>
          <p className="text-sm font-sans text-neutral-600">
            يرجى إدخال تفاصيل الشحن والتواصل. الدفع نقداً عند استلام الطلب فقط (COD).
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-sans flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Customer Info Section */}
              <section className="bg-white border border-neutral-200 p-8 space-y-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold flex items-center gap-3 border-b border-neutral-200 pb-4 text-black">
                  <User className="w-5 h-5 text-black" />
                  بيانات العميل
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-sm">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="مثال: ريم أحمد"
                      className={`w-full bg-neutral-50 border px-4 py-3 text-sm focus:outline-none focus:bg-white transition ${
                        fieldErrors.name ? "border-red-500 focus:border-red-600 bg-red-50/20" : "border-neutral-300 focus:border-black"
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-600 font-sans mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      رقم الهاتف (للتنسيق والتوصيل) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="0599000000"
                      className={`w-full bg-neutral-50 border px-4 py-3 text-sm focus:outline-none focus:bg-white transition dir-ltr text-right ${
                        fieldErrors.phone ? "border-red-500 focus:border-red-600 bg-red-50/20" : "border-neutral-300 focus:border-black"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-600 font-sans mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="example@mail.com"
                      className={`w-full bg-neutral-50 border px-4 py-3 text-sm focus:outline-none focus:bg-white transition dir-ltr text-right ${
                        fieldErrors.email ? "border-red-500 focus:border-red-600 bg-red-50/20" : "border-neutral-300 focus:border-black"
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 font-sans mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Shipping Address Section */}
              <section className="bg-white border border-neutral-200 p-8 space-y-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold flex items-center gap-3 border-b border-neutral-200 pb-4 text-black">
                  <MapPin className="w-5 h-5 text-black" />
                  عنوان الشحن والتسليم
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-sm">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      المدينة / المحافظة <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition"
                    >
                      {(deliveryAreas.length > 0 ? deliveryAreas : ["رام الله والبيرة"]).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      تفاصيل العنوان (الشارع، البناية، الطابق) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      placeholder="مثال: شارع الإرسال، عمارة الأمل، ط 3"
                      className={`w-full bg-neutral-50 border px-4 py-3 text-sm focus:outline-none focus:bg-white transition ${
                        fieldErrors.address ? "border-red-500 focus:border-red-600 bg-red-50/20" : "border-neutral-300 focus:border-black"
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-red-600 font-sans mt-1">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-neutral-700">
                      ملاحظات خاصة للمندوب (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="أي توجيهات إضافية بخصوص وقت التوصيل أو المكان..."
                      className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section className="bg-white border border-neutral-200 p-8 space-y-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold flex items-center gap-3 border-b border-neutral-200 pb-4 text-black">
                  <Truck className="w-5 h-5 text-black" />
                  طريقة الدفع
                </h2>
                <div className="border-2 border-black p-6 bg-neutral-50 flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center mt-0.5 shrink-0 bg-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-black mb-1">
                      الدفع نقداً عند الاستلام (Cash on Delivery)
                    </h3>
                    <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                      لن يتم خصم أو طلب أي بطاقة بنكية الآن. يتم تسليم المبلغ نقداً بالـ شيكل (₪) لمندوب شركة التوصيل عند استلام طلبيتكِ.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Order Summary Snapshot Column */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-neutral-200 p-8 sticky top-28 space-y-6 shadow-xs">
                <h2 className="font-serif text-2xl font-bold border-b border-neutral-200 pb-4 text-black">
                  ملخص الطلب ({items.length} منتج)
                </h2>

                {/* Items snapshot list */}
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 border-b border-neutral-200 pb-6 divide-y divide-neutral-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-4 items-center text-xs">
                      <div className="w-16 h-20 relative bg-neutral-100 border border-neutral-200 shrink-0">
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <h3 className="font-serif font-semibold text-neutral-900 line-clamp-1">
                          {item.productName}
                        </h3>
                        {item.variantName && (
                          <p className="text-neutral-500">الدرجة: {item.variantName}</p>
                        )}
                        <p className="text-neutral-500">الكمية: {item.quantity}</p>
                      </div>
                      <span className="font-serif font-bold text-neutral-900">
                        {(item.price * item.quantity).toFixed(2)} ₪
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon in Checkout */}
                <div className="border-b border-neutral-200 pb-5">
                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="كوبون الخصم"
                        className="flex-1 bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs uppercase focus:outline-none focus:border-black"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                      >
                        {isApplyingCoupon ? "..." : "تطبيق"}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        كوبون ({appliedCoupon.code})
                      </span>
                      <button
                        type="button"
                        onClick={() => setCoupon(null)}
                        className="text-emerald-900 underline text-[11px] hover:text-black font-semibold"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-sans mt-1.5">{couponError}</p>
                  )}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-3 font-sans text-sm border-b border-neutral-200 pb-6 text-neutral-600">
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

                {/* Final Total */}
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-serif text-lg font-bold text-black">المبلغ المطلوب عند الاستلام</span>
                  <span className="font-serif text-3xl font-bold text-black">
                    {total.toFixed(2)} ₪
                  </span>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-ivory py-4 font-sans text-sm font-semibold hover:bg-secondary transition disabled:opacity-50 rounded-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري حفظ وتأكيد الطلب...</span>
                    </>
                  ) : (
                    <span>تأكيد الطلب النهائي</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-sans pt-1">
                  <Lock className="w-4 h-4 text-black" />
                  <span>معلوماتكِ وبياناتكِ محمية ومؤمنة بالكامل</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
