"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calculator,
  ShoppingCart,
  Boxes,
  Landmark,
  Users2,
  HardHat,
  FolderLock,
  ShieldCheck,
  ShieldAlert,
  Handshake,
  Truck,
  FileSignature,
  Award,
  Scale,
  FileCheck,
  Archive,
  BarChart3,
  TrendingUp,
  Leaf,
  Briefcase,
  Box,
  Gavel,
  Workflow,
  Settings,
  Store,
  WalletCards,
  DatabaseZap,
  X,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "UTAMA",
    items: [
      { title: "Executive Overview", href: "/overview", icon: LayoutDashboard },
      { title: "Executive Board BI", href: "/executive-bi", icon: TrendingUp, badge: "AI / BI" },
      { title: "Orkestrasi Alur Bisnis", href: "/orchestration", icon: Workflow, badge: "Auto" },
      { title: "CRM & Tender", href: "/crm", icon: Briefcase, badge: "Live" },
      { title: "Persetujuan & SoD", href: "/approvals", icon: ShieldCheck, badge: "Live" },
    ],
  },
  {
    title: "PROYEK & LAPANGAN",
    items: [
      { title: "Manajemen Proyek", href: "/projects", icon: Building2 },
      { title: "RAB & Anggaran", href: "/budget", icon: Calculator },
      { title: "Operasional Lapangan", href: "/site", icon: HardHat, badge: "PWA" },
      { title: "Quality & Safety (K3)", href: "/quality", icon: ShieldCheck },
      { title: "HSE & K3 Enterprise", href: "/hse", icon: ShieldAlert, badge: "ISO 45001" },
      { title: "Sustainability & ESG", href: "/sustainability", icon: Leaf, badge: "ESG" },
      { title: "Subkontraktor & Mandor", href: "/subcontractors", icon: Handshake, badge: "SPK / MC" },
      { title: "Alat Berat & Armada", href: "/equipment", icon: Truck, badge: "Fleet / HM" },
      { title: "CCO & Addendum Kontrak", href: "/change-orders", icon: FileSignature, badge: "CCO / VO" },
      { title: "Laporan PUPR & Kurva S", href: "/official-reports", icon: Award, badge: "PUPR / EVM" },
      { title: "Konsorsium KSO & Kas Bersama", href: "/joint-operations", icon: Scale, badge: "KSO / JO" },
      { title: "Serah Terima & BAST", href: "/handover", icon: FileCheck, badge: "PHO / FHO" },
      { title: "Penutupan & Audit Trail", href: "/closeout", icon: Archive, badge: "Closeout" },
      { title: "Dokumen & Gambar", href: "/documents", icon: FolderLock },
      { title: "BIM 4D/5D & Digital Twin", href: "/bim", icon: Box, badge: "WebGL" },
      { title: "AI Legal & Sengketa BANI", href: "/contracts", icon: Gavel, badge: "AI Legal" },
    ],
  },
  {
    title: "SUPPLY CHAIN & LOGISTIK",
    items: [
      { title: "Pengadaan (Procurement)", href: "/procurement", icon: ShoppingCart },
      { title: "Vendor & E-Procurement", href: "/vendor-portal", icon: Store, badge: "Portal" },
      { title: "Gudang & Inventaris", href: "/inventory", icon: Boxes },
    ],
  },
  {
    title: "KEUANGAN & SDM",
    items: [
      { title: "Finance & Accounting", href: "/finance", icon: Landmark },
      { title: "Treasury & Cash Pooling", href: "/treasury", icon: WalletCards, badge: "H2H" },
      { title: "Karyawan & Timesheet", href: "/hr", icon: Users2 },
      { title: "Analitik & Laporan", href: "/analytics", icon: BarChart3 },
      { title: "Disaster Recovery & HA", href: "/disaster-recovery", icon: DatabaseZap, badge: "DR / HA" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-primary text-white select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-action flex items-center justify-center font-bold text-lg text-white">
            B
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">BUILDFlow</span>
            <span className="text-[10px] text-white/60 uppercase tracking-widest block -mt-1 font-mono">ENTERPRISE ERP</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-2 font-mono">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/overview" && pathname?.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-action text-white shadow-sm"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / System Settings */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Sistem</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Pinned) */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-border/20 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
