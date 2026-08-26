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
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-outline-variant/70">
          {items.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 py-3 sm:py-3.5 px-2"
            >
              <span className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-secondary" strokeWidth={1.5} />
              </span>
              <div className="text-right">
                <p className="text-xs font-semibold text-primary leading-tight">{label}</p>
                <p className="text-2xs text-on-surface-variant mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
