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
    <aside className="w-64 bg-[#111111] border-l border-neutral-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans z-30 select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="font-serif text-2xl font-bold tracking-[0.2em] text-white hover:opacity-90 transition block"
            >
              FATEKIT
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-0.5 block">
              لوحة الإدارة الفاخرة
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="زيارة واجهة المتجر"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* User Card Summary */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center font-serif font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {user.role === "OWNER" ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-champagne text-[9px] font-bold">
                    <Shield className="w-2.5 h-2.5" />
                    مالك المتجر (OWNER)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-[9px] font-bold">
                    <UserCheck className="w-2.5 h-2.5" />
                    فريق العمل (STAFF)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
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
                  className="flex items-center justify-between px-3 py-2.5 text-xs text-neutral-600 cursor-not-allowed opacity-50"
                  title="يتطلب صلاحية المالك (OWNER)"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-1 py-0.5">
                    المالك فقط
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.ownerBadge && user.role === "OWNER" && (
                  <span className={`text-[8px] uppercase tracking-wider px-1 font-bold ${isActive ? "bg-black text-white" : "bg-neutral-800 text-neutral-400"}`}>
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-neutral-800 bg-[#0e0e0e]">
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-900/30 transition-colors duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
