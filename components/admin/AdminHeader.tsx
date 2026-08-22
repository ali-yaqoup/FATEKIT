"use client";

import { AdminRole } from "@prisma/client";
import { ExternalLink, ShieldCheck, UserCheck } from "lucide-react";

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const todayFormatted = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-[#111111] border-b border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      
      {/* Date & Store Mode Status */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-neutral-400 font-medium">
          {todayFormatted}
        </span>
        <span className="text-neutral-600">•</span>
        <span className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          المتجر نشط (₪ شيكل)
        </span>
      </div>

      {/* User Status & Storefront Link */}
      <div className="flex items-center gap-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xs border border-neutral-700 transition"
        >
          <span>معاينة المتجر</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
        </a>

        <div className="flex items-center gap-2.5 pl-2 border-r border-neutral-800 pr-4">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-neutral-400 font-mono">{user.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-serif font-bold text-xs">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
