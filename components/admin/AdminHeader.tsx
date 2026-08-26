"use client";

import { AdminRole } from "@prisma/client";
import { ExternalLink, ShieldCheck, UserCheck, Bell, Search } from "lucide-react";

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
    <header className="h-20 bg-[#0a0a0a] border-b border-neutral-800/60 px-6 flex items-center justify-between sticky top-0 z-20 font-sans backdrop-blur-xl bg-opacity-95">
      
      {/* Date & Store Mode Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 font-medium text-sm tracking-wide">
            {todayFormatted}
          </span>
          <span className="text-neutral-700">|</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-emerald-950/30 to-emerald-950/10 border border-emerald-900/40 text-emerald-400 text-[10px] font-bold px-3 py-1.5 flex items-center gap-2 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            المتجر نشط
          </span>
          <span className="bg-gradient-to-r from-champagne/10 to-transparent border border-champagne/30 text-champagne text-[10px] font-bold px-3 py-1.5 tracking-wider uppercase">
            ₪ شيكل
          </span>
        </div>
      </div>

      {/* User Status & Storefront Link */}
      <div className="flex items-center gap-4">
        <button className="text-neutral-400 hover:text-champagne transition-all duration-300 p-2 hover:bg-neutral-800/50 rounded-lg">
          <Search className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button className="text-neutral-400 hover:text-champagne transition-all duration-300 p-2 hover:bg-neutral-800/50 rounded-lg relative">
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-champagne rounded-full" />
        </button>
        
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all duration-300 rounded-sm group"
        >
          <span>معاينة المتجر</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-champagne transition-colors" strokeWidth={1.5} />
        </a>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-800/60">
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-tight tracking-tight">{user.name}</p>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{user.email}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-champagne/20 to-champagne/5 border border-champagne/30 text-champagne flex items-center justify-center font-serif font-bold text-sm shadow-lg">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
