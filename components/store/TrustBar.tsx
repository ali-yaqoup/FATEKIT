import { Truck, ShieldCheck, Sparkles } from "lucide-react";

export function TrustBar() {
  const items = [
    {
      icon: Truck,
      label: "توصيل سريع",
      detail: "خلال 2–4 أيام عمل",
    },
    {
      icon: ShieldCheck,
      label: "الدفع عند الاستلام",
      detail: "ادفعي بعد ما تشوفي الطلب",
    },
    {
      icon: Sparkles,
      label: "منتجات أصلية",
      detail: "جودة مضمونة 100%",
    },
  ];

  return (
    <div className="bg-blush/60 border-b border-outline-variant/70">
      <div className="store-container">
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-outline-variant/70">
          {items.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-2 sm:py-3 px-1.5 sm:px-2"
            >
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-ivory flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary" strokeWidth={1.5} />
              </span>
              <div className="text-center sm:text-right min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-primary leading-tight truncate">{label}</p>
                <p className="hidden sm:block text-2xs text-on-surface-variant mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
