"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Warehouse,
  Tag,
  Layers,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  UserCheck,
} from "lucide-react";
import { AdminRole } from "@prisma/client";
import { logoutAdminAction } from "@/lib/actions/auth";

interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      label: "لوحة التحكم",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "إدارة الطلبات",
      href: "/admin/orders",
      icon: ShoppingBag,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "المنتجات",
      href: "/admin/products",
      icon: Package,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "التصنيفات",
      href: "/admin/categories",
      icon: Layers,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "المخزون",
      href: "/admin/inventory",
      icon: Warehouse,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "سجل العملاء",
      href: "/admin/customers",
      icon: Users,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "كوبونات الخصم",
      href: "/admin/coupons",
      icon: Tag,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "التقارير والأرباح",
      href: "/admin/reports",
      icon: BarChart3,
      roles: ["OWNER"], // Owner only
      ownerBadge: true,
    },
    {
      label: "محتوى الرئيسية",
      href: "/admin/homepage",
      icon: Globe,
      roles: ["OWNER", "STAFF"],
    },
    {
      label: "إعدادات المتجر",
      href: "/admin/settings",
      icon: Settings,
      roles: ["OWNER"],
      ownerBadge: true,
    },
  ];

  return (
    <aside className="w-72 bg-[#0a0a0a] border-l border-neutral-800/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans z-30 select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-neutral-800/60 flex items-center justify-between bg-gradient-to-b from-neutral-900/50 to-transparent">
          <div>
            <Link
              href="/admin"
              className="font-serif text-3xl font-bold tracking-[0.3em] text-white hover:text-champagne transition-all duration-300 block relative group"
            >
              FATEKIT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-champagne group-hover:w-full transition-all duration-500 ease-luxury" />
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-champagne mt-2 block">
              لوحة الإدارة الفاخرة
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-400 hover:text-champagne hover:bg-neutral-800/50 transition-all duration-300 rounded-lg"
            title="زيارة واجهة المتجر"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>

        {/* User Card Summary */}
        <div className="px-5 py-5 border-b border-neutral-800/40 bg-gradient-to-r from-neutral-900/30 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-champagne/20 to-champagne/5 border border-champagne/30 text-champagne flex items-center justify-center font-serif font-bold text-lg shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {user.role === "OWNER" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-champagne/10 to-transparent border border-champagne/30 text-champagne text-[9px] font-bold tracking-wider uppercase">
                    <Shield className="w-3 h-3" strokeWidth={2} />
                    مالك المتجر
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-800/50 border border-neutral-700 text-neutral-300 text-[9px] font-bold tracking-wider uppercase">
                    <UserCheck className="w-3 h-3" strokeWidth={2} />
                    فريق العمل
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const isAllowed = item.roles.includes(user.role);

            if (!isAllowed) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between px-4 py-3 text-xs text-neutral-600 cursor-not-allowed opacity-40"
                  title="يتطلب صلاحية المالك (OWNER)"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] bg-neutral-900/50 border border-neutral-800 px-2 py-0.5 tracking-wider">
                    المالك فقط
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 text-xs font-medium transition-all duration-300 ease-luxury relative group ${
                  isActive
                    ? "bg-gradient-to-l from-white/5 to-transparent text-white border-r-2 border-champagne"
                    : "text-neutral-400 hover:bg-neutral-800/40 hover:text-white border-r-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-champagne" : ""}`} strokeWidth={1.5} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.ownerBadge && user.role === "OWNER" && (
                  <span className={`text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 font-bold rounded-sm ${
                    isActive 
                      ? "bg-champagne text-primary" 
                      : "bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-neutral-300"
                  }`}>
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-neutral-800/60 bg-gradient-to-t from-neutral-900/50 to-transparent">
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 border border-red-900/20 hover:border-red-900/40 transition-all duration-300 rounded-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
