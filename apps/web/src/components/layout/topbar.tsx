"use client";

import { Search, Bell, ChevronDown, Building, Briefcase, Menu } from "lucide-react";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-3 sm:px-6 shrink-0 z-10 w-full max-w-full overflow-hidden">
      {/* Left: Hamburger (Mobile) & Organization / Branch Scoping Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-surface-subtle text-content-main shrink-0"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Org & Branch Context */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-subtle px-2.5 sm:px-3 py-1.5 rounded-md border border-border/80 text-xs text-content-main min-w-0">
          <Building className="w-3.5 h-3.5 text-action shrink-0" />
          <span className="font-semibold truncate max-w-[110px] sm:max-w-[180px] md:max-w-none">
            PT Maju Konstruksi Perkasa
          </span>
          <span className="text-content-muted hidden md:inline shrink-0">/ Cabang Jakarta</span>
          <ChevronDown className="w-3 h-3 text-content-muted shrink-0 cursor-pointer" />
        </div>

        {/* Project Scope Context (Desktop only) */}
        <div className="hidden xl:flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-border text-xs text-content-main shrink-0">
          <Briefcase className="w-3.5 h-3.5 text-content-muted" />
          <span className="text-content-muted">Scope:</span>
          <span className="font-medium text-action cursor-pointer">Semua Proyek Aktif (12)</span>
          <ChevronDown className="w-3 h-3 text-content-muted cursor-pointer" />
        </div>
      </div>

      {/* Right: Search, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search (Desktop & Tablet) */}
        <div className="relative w-48 md:w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            placeholder="Cari PO, Proyek, RAB..."
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-xs text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-action"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md hover:bg-surface-subtle text-content-muted hover:text-content-main"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-status-danger absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile */}
        <a
          href="/login"
          className="flex items-center gap-2 pl-2 border-l border-border shrink-0 hover:opacity-80 transition-opacity"
          title="Klik untuk Masuk / Ganti Akun"
        >
          <div className="w-8 h-8 rounded-full bg-[#17324D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
            BS
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-content-main leading-tight">Bambang S.</div>
            <div className="text-[10px] text-content-muted">Direktur Utama</div>
          </div>
        </a>
      </div>
    </header>
  );
}
