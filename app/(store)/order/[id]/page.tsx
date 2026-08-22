import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  MapPin,
  User,
  Phone,
  Mail,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { OrderActions } from "@/components/store/OrderActions";


interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; step: number; colorClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  NEW: {
    label: "تم استلام الطلب",
    step: 1,
    colorClass: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Clock,
  },
  PROCESSING: {
    label: "قيد التجهيز والتغليف",
    step: 2,
    colorClass: "bg-amber-50 text-amber-900 border-amber-200",
    icon: Package,
  },
  SHIPPED: {
    label: "تم الشحن مع المندوب",
    step: 3,
    colorClass: "bg-purple-50 text-purple-800 border-purple-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "تم التسليم بنجاح",
    step: 4,
    colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCheck,
  },
  CANCELLED: {
    label: "ملغي",
    step: 0,
    colorClass: "bg-red-50 text-red-800 border-red-200",
    icon: XCircle,
  },
};

const ORDER_STEPS = [
  { step: 1, label: "استلام الطلب", desc: "تم تأكيد طلبك بنجاح" },
  { step: 2, label: "تجهيز وتغليف", desc: "جاري فحص وتعبئة المنتجات" },
  { step: 3, label: "جاري الشحن", desc: "الطلب في الطريق مع المندوب" },
  { step: 4, label: "تم التسليم", desc: "تم استلام الطلب والدفع" },
];

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();

  // Find by orderNumber (e.g. FK-6019) or by cuid id
  const order = await db.order.findFirst({
    where: {
      OR: [
        { orderNumber: decodedId },
        { id: decodedId },
      ],
    },
    include: {
      customer: true,
      coupon: true,
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <div className="bg-background text-on-background min-h-screen py-20 px-6 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 p-10 max-w-md w-full text-center space-y-4 shadow-sm">
          <XCircle className="w-12 h-12 text-neutral-400 mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-black">لم يتم العثور على الطلب</h1>
          <p className="text-xs font-sans text-neutral-500 leading-relaxed">
            الطلب برقم <span className="font-bold text-black dir-ltr">"{decodedId}"</span> غير مسجل في نظامنا أو قد تم حذفه.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
  const StatusIcon = currentStatusConfig.icon;
  const isCancelled = order.status === OrderStatus.CANCELLED;

  return (
    <div className="bg-background text-on-background min-h-screen py-12 md:py-20 px-6 md:px-16 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Top Header Card */}
        <div className="bg-white border border-neutral-200 p-8 md:p-12 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
              تأكيد الطلب الرسمي
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-black">
              تم تأكيد طلبكِ بنجاح!
            </h1>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed pt-1">
              شكراً لاختياركِ <strong className="font-semibold text-black">FATEKIT</strong>. لقد تم تسجيل تفاصيل طلبكِ في قاعدة البيانات، وسيقوم فريقنا بتجهيز المنتجات وشحنها لكِ بأسرع وقت.
            </p>
          </div>

          {/* Key Reference Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="bg-neutral-100 border border-neutral-200 px-4 py-2.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-600" />
              <span className="text-xs text-neutral-500">رقم الطلب:</span>
              <strong className="font-serif font-bold text-black text-sm dir-ltr tracking-wider">
                {order.orderNumber}
              </strong>
            </div>

            <div className={`border px-4 py-2.5 flex items-center gap-2 ${currentStatusConfig.colorClass}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-xs font-semibold">الحالة: {currentStatusConfig.label}</span>
            </div>

            <div className="bg-neutral-100 border border-neutral-200 px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-neutral-500">تاريخ التسجيل:</span>
              <span className="text-xs font-semibold text-black">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Quick Actions (Print, Copy, WhatsApp) */}
          <OrderActions orderNumber={order.orderNumber} total={Number(order.total)} />
        </div>

        {/* Order Progress Stepper */}
        {!isCancelled ? (
          <div className="bg-white border border-neutral-200 p-8 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-black mb-6 text-right">
              مراحل تنفيذ وتوصيل الطلب
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
              {ORDER_STEPS.map((s, idx) => {
                const isCompleted = s.step <= currentStatusConfig.step;
                const isCurrent = s.step === currentStatusConfig.step;

                return (
                  <div
                    key={s.step}
                    className={`relative flex flex-col items-center md:items-start text-center md:text-right p-4 border transition ${
                      isCurrent
                        ? "border-black bg-neutral-50"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-neutral-200 bg-white opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCompleted
                            ? "bg-black text-white"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {isCompleted ? "✓" : s.step}
                      </span>
                      <span className="text-[11px] font-sans text-neutral-400 font-medium">
                        المرحلة {s.step}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-black mb-1">
                      {s.label}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-snug">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-6 flex items-center gap-4 text-red-800 text-sm">
            <XCircle className="w-6 h-6 shrink-0 text-red-600" />
            <div>
              <h3 className="font-serif font-bold text-base">تم إلغاء هذا الطلب</h3>
              <p className="text-xs text-red-700 mt-0.5">
                إذا كان لديكِ أي استفسار حول سبب الإلغاء، يرجى التواصل مع فريق خدمة العملاء.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Ordered Products Section (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-neutral-200 p-8 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                <h2 className="font-serif text-xl font-bold text-black flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-black" />
                  <span>المنتجات المطلوبة ({order.items.length})</span>
                </h2>
                <span className="text-xs font-sans text-neutral-500">
                  لقطة أسعار الشراء الفاتورية
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {order.items.map((item) => {
                  const fallbackImage =
                    item.variant?.imageUrl ||
                    item.product?.images[0]?.url ||
                    "https://picsum.photos/seed/placeholder/800/800";

                  return (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-24 relative bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden">
                        <Image
                          src={fallbackImage}
                          alt={item.productNameSnapshot}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product & Variant Details */}
                      <div className="flex-1 space-y-1 text-right">
                        <h3 className="font-serif font-bold text-neutral-900 text-sm leading-snug">
                          {item.productNameSnapshot}
                        </h3>
                        {item.variantNameSnapshot && (
                          <p className="text-xs text-neutral-500">
                            الدرجة / اللون:{" "}
                            <span className="text-black font-semibold">
                              {item.variantNameSnapshot}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-neutral-600 pt-0.5">
                          الكمية: <strong className="font-bold text-black">{item.quantity}</strong> × {Number(item.unitPrice).toFixed(2)} ₪
                        </p>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-left font-serif font-bold text-base text-black min-w-[80px]">
                        {Number(item.total).toFixed(2)} ₪
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer & Delivery Information */}
            <div className="bg-white border border-neutral-200 p-8 shadow-xs space-y-6">
              <h2 className="font-serif text-xl font-bold text-black border-b border-neutral-200 pb-4 flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-black" />
                <span>بيانات الشحن والمستلم</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-right">
                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    اسم المستلم:
                  </span>
                  <p className="text-sm font-semibold text-black">{order.customer.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    رقم الهاتف للتواصل:
                  </span>
                  <p className="text-sm font-semibold text-black dir-ltr text-right">
                    {order.customer.phone}
                  </p>
                </div>

                {order.customer.email && (
                  <div className="space-y-1">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      البريد الإلكتروني:
                    </span>
                    <p className="text-sm font-semibold text-black dir-ltr text-right">
                      {order.customer.email}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    المدينة / المحافظة:
                  </span>
                  <p className="text-sm font-semibold text-black">{order.shippingCity}</p>
                </div>

                <div className="md:col-span-2 space-y-1 pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 font-medium">العنوان التفصيلي:</span>
                  <p className="text-sm font-semibold text-neutral-900 leading-relaxed">
                    {order.shippingCity} — {order.shippingAddress}
                  </p>
                </div>

                {order.deliveryNotes && (
                  <div className="md:col-span-2 space-y-1 bg-neutral-50 p-3.5 border border-neutral-200">
                    <span className="text-neutral-500 font-medium">ملاحظات موجهة للمندوب:</span>
                    <p className="text-xs text-neutral-800 mt-0.5">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Invoice Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Payment Method Notice */}
            <div className="bg-white border border-neutral-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-black">
                <Truck className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base">طريقة الدفع</h3>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  الدفع نقداً عند الاستلام (COD)
                </p>
                <p className="text-emerald-800 text-[11px] pt-1">
                  المبلغ المطلوب دفعه نقداً لمندوب شركة التوصيل عند استلام الطلبية هو المبلغ الإجمالي الموضح أدناه.
                </p>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="bg-white border border-neutral-200 p-8 shadow-xs space-y-5">
              <h2 className="font-serif text-xl font-bold text-black border-b border-neutral-200 pb-4">
                ملخص الفاتورة المالية
              </h2>

              <div className="space-y-3 font-sans text-sm text-neutral-600 border-b border-neutral-200 pb-5">
                <div className="flex justify-between items-center">
                  <span>المجموع الفرعي للمنتجات</span>
                  <span className="font-semibold text-black font-serif text-base">
                    {Number(order.subtotal).toFixed(2)} ₪
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>رسوم الشحن والتوصيل</span>
                  <span className="font-semibold text-black font-serif text-base">
                    {Number(order.shippingFee) === 0 ? (
                      <span className="text-emerald-700 font-bold">مجاني</span>
                    ) : (
                      `${Number(order.shippingFee).toFixed(2)} ₪`
                    )}
                  </span>
                </div>

                {Number(order.discount) > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span>
                      الخصم المطبق {order.coupon ? `(${order.coupon.code})` : ""}
                    </span>
                    <span className="font-semibold font-serif text-base">
                      - {Number(order.discount).toFixed(2)} ₪
                    </span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-black">
                    المبلغ الإجمالي المستحق:
                  </span>
                  <span className="font-serif text-3xl font-bold text-black">
                    {Number(order.total).toFixed(2)} ₪
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans mt-1">
                  شامل كافة الضرائب وتكاليف الشحن والتغليف الفاخر
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3">
                <Link
                  href="/shop"
                  className="w-full py-4 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition block text-center shadow-xs"
                >
                  متابعة التسوق في FATEKIT
                </Link>

                <Link
                  href="/"
                  className="w-full py-3 bg-neutral-100 text-neutral-800 text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة للصفحة الرئيسية</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
