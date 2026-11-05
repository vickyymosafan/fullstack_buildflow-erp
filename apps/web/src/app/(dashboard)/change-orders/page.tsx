"use client";

import { useState, useEffect } from "react";
import {
  FileSignature,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  RefreshCw,
  X,
  Check,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building,
  HardHat,
  Filter,
  CheckCircle2,
  FileCheck2,
  Scale,
  Sparkles,
} from "lucide-react";

interface ChangeOrderSummary {
  totalCcoCount: number;
  approvedCcoCount: number;
  reviewCcoCount: number;
  totalCostAddition: number;
  totalCostDeduction: number;
  netCostImpact: number;
  totalTimeImpactDays: number;
  totalClaimsCount: number;
  approvedClaimDays: number;
  approvedClaimCost: number;
  originalContractValue: number;
  revisedContractValue: number;
  deviationPercent: number;
  approvalRate: number;
}

interface ChangeOrderItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  type: string;
}

interface ChangeOrder {
  id: string;
  ccoNumber: string;
  title: string;
  changeType: string;
  requestedBy: string;
  originatorName: string;
  reason: string;
  costImpact: number;
  timeImpactDays: number;
  location: string;
  wbsElement: string;
  status: string;
  approvedCostImpact?: number | null;
  approvedTimeImpactDays?: number | null;
  reviewedBy?: string | null;
  reviewerNotes?: string | null;
  submittedDate: string;
  approvedDate?: string | null;
  items: ChangeOrderItem[];
  createdAt: string;
}

interface ConstructionClaim {
  id: string;
  claimNumber: string;
  title: string;
  claimCategory: string;
  submittedDate: string;
  requestedDays: number;
  requestedCost: number;
  status: string;
  approvedDays?: number | null;
  approvedCost?: number | null;
  evidenceDescription: string;
  verifiedBy?: string | null;
  notes?: string;
  createdAt: string;
}

export default function ChangeOrdersPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "items" | "claims" | "addendum">("orders");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [summary, setSummary] = useState<ChangeOrderSummary>({
    totalCcoCount: 4,
    approvedCcoCount: 2,
    reviewCcoCount: 2,
    totalCostAddition: 1035000000,
    totalCostDeduction: 120000000,
    netCostImpact: 915000000,
    totalTimeImpactDays: 31,
    totalClaimsCount: 3,
    approvedClaimDays: 25,
    approvedClaimCost: 65000000,
    originalContractValue: 28500000000,
    revisedContractValue: 29415000000,
    deviationPercent: 3.21,
    approvalRate: 50,
  });

  const [ordersList, setOrdersList] = useState<ChangeOrder[]>([]);
  const [claimsList, setClaimsList] = useState<ConstructionClaim[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal states
  const [showCcoModal, setShowCcoModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null);

  // Form states
  const [ccoForm, setCcoForm] = useState({
    ccoNumber: "",
    title: "",
    changeType: "SCOPE_ADDITION",
    requestedBy: "OWNER",
    originatorName: "Ir. Hendra Prasetyo (Konsultan MK)",
    reason: "",
    costImpact: 250000000,
    timeImpactDays: 14,
    location: "Zona Tower A",
    wbsElement: "STR-FND-01",
  });

  const [claimForm, setClaimForm] = useState({
    claimNumber: "",
    title: "",
    claimCategory: "RAIN_DELAY",
    submittedDate: new Date().toISOString().slice(0, 10),
    requestedDays: 14,
    requestedCost: 0,
    evidenceDescription: "Laporan harian BMKG stasiun cuaca maritim setempat",
  });

  const [statusForm, setStatusForm] = useState({
    status: "APPROVED_OWNER",
    reviewerNotes: "",
    approvedCostImpact: 0,
    approvedTimeImpactDays: 0,
    reviewedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, ordersRes, claimsRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/change-orders/summary"),
        fetch("http://localhost:4000/api/v1/change-orders"),
        fetch("http://localhost:4000/api/v1/change-orders/claims"),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (ordersRes.ok) setOrdersList(await ordersRes.json());
      if (claimsRes.ok) setClaimsList(await claimsRes.json());
    } catch (err) {
      console.error("Gagal memuat data CCO:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCco = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/change-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ccoForm),
      });
      if (res.ok) {
        showToast(`Tiket CCO ${ccoForm.ccoNumber} berhasil diajukan!`);
        setShowCcoModal(false);
        loadData();
      } else {
        showToast("Gagal menyimpan pengajuan CCO.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/change-orders/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimForm),
      });
      if (res.ok) {
        showToast(`Klaim konstruksi ${claimForm.claimNumber} berhasil diajukan!`);
        setShowClaimModal(false);
        loadData();
      } else {
        showToast("Gagal menyimpan klaim.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/change-orders/${selectedOrder.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statusForm),
        }
      );
      if (res.ok) {
        showToast(`Status CCO ${selectedOrder.ccoNumber} diperbarui ke ${statusForm.status}!`);
        setShowStatusModal(false);
        loadData();
      } else {
        showToast("Gagal memperbarui status CCO.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi API.");
    }
  };

  const formatRupiah = (val?: number) => {
    if (!val && val !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED_OWNER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Disetujui Owner
          </span>
        );
      case "EXECUTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Check className="w-3 h-3" />
            Terlaksana (MC)
          </span>
        );
      case "REVIEW_MK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Review Konsultan MK
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            <FileText className="w-3 h-3" />
            Diajukan
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <X className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "SCOPE_ADDITION":
        return "Pekerjaan Tambah";
      case "SCOPE_DEDUCTION":
        return "Pekerjaan Kurang";
      case "DESIGN_REVISION":
        return "Revisi Desain";
      case "MATERIAL_SUBSTITUTION":
        return "Substitusi Material";
      case "SITE_CONDITION":
        return "Kondisi Lapangan";
      default:
        return type;
    }
  };

  const getClaimCategoryLabel = (cat: string) => {
    switch (cat) {
      case "RAIN_DELAY":
        return "Hujan Ekstrim / Banjir";
      case "FORCE_MAJEURE":
        return "Keadaan Kahar / Bencana";
      case "SITE_CONDITION":
        return "Geoteknik / Kondisi Site";
      case "DELAY_OWNER_DRAWING":
        return "Keterlambatan Gambar Owner";
      case "PRICE_ESCALATION":
        return "Eskalasi Harga Material";
      default:
        return cat;
    }
  };

  const filteredOrders = ordersList.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && o.changeType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.ccoNumber.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.originatorName.toLowerCase().includes(q) ||
        o.reason.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Extract all items from change orders
  const allChangeItems = ordersList.flatMap((o) =>
    o.items.map((it) => ({
      ...it,
      ccoNumber: o.ccoNumber,
      ccoTitle: o.title,
      status: o.status,
    }))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Contract Change Orders (CCO) & Addendum
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
              CCO / VO
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen pekerjaan tambah/kurang, telaah teknis konsultan MK, justifikasi biaya & waktu (*EoT*), serta addendum kontrak resmi.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted/50 transition-colors"
            title="Muat ulang data"
            aria-label="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setClaimForm({
                claimNumber: `CLM-2026-00${claimsList.length + 1}`,
                title: "Klaim Kompensasi Keterlambatan Instruksi Site",
                claimCategory: "DELAY_OWNER_DRAWING",
                submittedDate: new Date().toISOString().slice(0, 10),
                requestedDays: 10,
                requestedCost: 35000000,
                evidenceDescription: "Surat permintaan klarifikasi gambar RFI No. 088 belum dijawab konsultan perencana",
              });
              setShowClaimModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span>Klaim Konstruksi (EoT)</span>
          </button>

          <button
            onClick={() => {
              setCcoForm({
                ccoNumber: `CCO-2026-00${ordersList.length + 1}`,
                title: "",
                changeType: "SCOPE_ADDITION",
                requestedBy: "OWNER",
                originatorName: "Ir. Hendra Prasetyo (Konsultan MK)",
                reason: "",
                costImpact: 150000000,
                timeImpactDays: 7,
                location: "Tower Utama",
                wbsElement: "ARS-FSD-01",
              });
              setShowCcoModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan CCO / VO</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Biaya Tambah/Kurang */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Dampak Biaya CCO
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(summary.netCostImpact)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{formatRupiah(summary.totalCostAddition)}
              </span>
              <span>• -{formatRupiah(summary.totalCostDeduction)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Tiket CCO */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tiket CCO & Variation
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <FileSignature className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.totalCcoCount} Berita Acara
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                {summary.approvedCcoCount} Disetujui
              </span>
              <span>• {summary.reviewCcoCount} Dalam Review</span>
            </div>
          </div>
        </div>

        {/* Card 3: Kompensasi Waktu (EoT) */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kompensasi Waktu (EoT)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              +{summary.totalTimeImpactDays + summary.approvedClaimDays} Hari Kalender
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                {summary.totalTimeImpactDays} Hari CCO
              </span>
              <span>• {summary.approvedClaimDays} Hari Klaim Lapangan</span>
            </div>
          </div>
        </div>

        {/* Card 4: Nilai Kontrak Akhir */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Plafon Kontrak Addendum
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(summary.revisedContractValue)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                Deviasi +{summary.deviationPercent}%
              </span>
              <span>• Baseline Rp 28.5M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-4 pb-px" role="tablist" aria-label="Tabs CCO & Variation Orders">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Daftar CCO & Variation</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              {ordersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "items"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Rincian Tambah / Kurang</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-600">
              {allChangeItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("claims")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "claims"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Klaim Konstruksi & EoT</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {claimsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("addendum")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "addendum"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Rekapitulasi Addendum Kontrak</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-blue-500/10 text-blue-600">
              Live
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: DAFTAR CCO & VARIATION ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nomor CCO, judul perubahan, pengusul, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Tipe Perubahan</option>
                <option value="SCOPE_ADDITION">Pekerjaan Tambah</option>
                <option value="SCOPE_DEDUCTION">Pekerjaan Kurang</option>
                <option value="SITE_CONDITION">Kondisi Lapangan</option>
                <option value="DESIGN_REVISION">Revisi Desain</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUBMITTED">Diajukan</option>
                <option value="REVIEW_MK">Review MK</option>
                <option value="APPROVED_OWNER">Disetujui Owner</option>
                <option value="EXECUTED">Terlaksana</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[24%]">No. CCO & Judul Perubahan</th>
                  <th className="py-3 px-4 w-[16%]">Tipe & Pengusul</th>
                  <th className="py-3 px-4 w-[18%]">Dasar Justifikasi & Lokasi</th>
                  <th className="py-3 px-4 w-[14%]">Dampak Biaya (Rp)</th>
                  <th className="py-3 px-4 w-[12%]">Waktu (EoT)</th>
                  <th className="py-3 px-4 w-[16%] text-right">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Tidak ada tiket CCO yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((cco) => (
                    <tr key={cco.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{cco.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="font-mono font-medium text-primary">{cco.ccoNumber}</span>
                          <span>•</span>
                          <span>{cco.submittedDate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate">{getChangeTypeLabel(cco.changeType)}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          Oleh: {cco.originatorName} ({cco.requestedBy})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-foreground truncate line-clamp-1" title={cco.reason}>
                          {cco.reason}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{cco.location} ({cco.wbsElement})</div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-mono font-bold ${
                            cco.costImpact >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {cco.costImpact >= 0 ? `+${formatRupiah(cco.costImpact)}` : formatRupiah(cco.costImpact)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {cco.approvedCostImpact ? `Disetujui: ${formatRupiah(cco.approvedCostImpact)}` : "Estimasi usulan"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground font-mono">
                          {cco.timeImpactDays > 0 ? `+${cco.timeImpactDays} Hari` : "0 Hari"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {cco.approvedTimeImpactDays !== null && cco.approvedTimeImpactDays !== undefined
                            ? `EoT Disetujui: +${cco.approvedTimeImpactDays} hr`
                            : "Menunggu telaah"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(cco.status)}
                          <button
                            onClick={() => {
                              setSelectedOrder(cco);
                              setStatusForm({
                                status: cco.status,
                                reviewerNotes: cco.reviewerNotes || "",
                                approvedCostImpact: cco.approvedCostImpact || cco.costImpact,
                                approvedTimeImpactDays: cco.approvedTimeImpactDays !== null && cco.approvedTimeImpactDays !== undefined ? cco.approvedTimeImpactDays : cco.timeImpactDays,
                                reviewedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
                              });
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Evaluasi status CCO"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {filteredOrders.map((cco) => (
              <div key={cco.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary">{cco.ccoNumber}</span>
                    <h3 className="font-semibold text-sm text-foreground leading-tight mt-0.5">{cco.title}</h3>
                    <p className="text-xs text-muted-foreground">{getChangeTypeLabel(cco.changeType)} • {cco.originatorName}</p>
                  </div>
                  <div>{getStatusBadge(cco.status)}</div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{cco.reason}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Dampak Biaya:</span>
                    <span
                      className={`font-mono font-bold ${
                        cco.costImpact >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {cco.costImpact >= 0 ? `+${formatRupiah(cco.costImpact)}` : formatRupiah(cco.costImpact)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Dampak Waktu:</span>
                    <span className="font-mono font-bold text-foreground">+{cco.timeImpactDays} Hari EoT</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{cco.location}</span>
                  <button
                    onClick={() => {
                      setSelectedOrder(cco);
                      setStatusForm({
                        status: cco.status,
                        reviewerNotes: cco.reviewerNotes || "",
                        approvedCostImpact: cco.approvedCostImpact || cco.costImpact,
                        approvedTimeImpactDays: cco.approvedTimeImpactDays !== null && cco.approvedTimeImpactDays !== undefined ? cco.approvedTimeImpactDays : cco.timeImpactDays,
                        reviewedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
                      });
                      setShowStatusModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Evaluasi CCO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RINCIAN TAMBAH / KURANG */}
      {activeTab === "items" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Rincian Item Pekerjaan Tambah / Kurang (WBS Breakdown)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar spesifik rincian kuantitas, harga satuan, dan kalkulasi tambah/kurang yang diajukan dalam paket CCO.
            </p>
          </div>

          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[16%]">No. CCO Terkait</th>
                  <th className="py-3 px-4 w-[34%]">Uraian Item Pekerjaan</th>
                  <th className="py-3 px-4 w-[12%]">Volume & Satuan</th>
                  <th className="py-3 px-4 w-[18%]">Harga Satuan (Rp)</th>
                  <th className="py-3 px-4 w-[20%] text-right">Total Nilai (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allChangeItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada rincian item pekerjaan tambah/kurang.
                    </td>
                  </tr>
                ) : (
                  allChangeItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-primary">{item.ccoNumber}</span>
                        <div className="text-[11px] text-muted-foreground truncate">{item.ccoTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate">{item.description}</div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.type === "ADDITION"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {item.type === "ADDITION" ? "+ Pekerjaan Tambah" : "- Pekerjaan Kurang"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-foreground">{item.qty} {item.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-muted-foreground">{formatRupiah(item.unitPrice)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.totalPrice >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.totalPrice >= 0 ? `+${formatRupiah(item.totalPrice)}` : formatRupiah(item.totalPrice)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {allChangeItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">{item.ccoNumber}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      item.type === "ADDITION" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.type === "ADDITION" ? "TAMBAH" : "KURANG"}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">{item.description}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">{item.qty} {item.unit} @ {formatRupiah(item.unitPrice)}</span>
                  <span className={`font-mono font-bold ${item.totalPrice >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KLAIM KONSTRUKSI & EXTENSION OF TIME (EOT) */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Daftar Klaim Konstruksi & Extension of Time (EoT)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Klaim perpanjangan waktu kerja akibat hujan/force majeure dan klaim kompensasi biaya hambatan site (*disruption costs*).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimsList.map((clm) => (
              <div key={clm.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-semibold text-primary">{clm.claimNumber}</span>
                    <h4 className="font-bold text-sm text-foreground leading-tight mt-0.5">{clm.title}</h4>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                      {getClaimCategoryLabel(clm.claimCategory)}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        clm.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {clm.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tuntutan Waktu:</span>
                    <span className="font-bold font-mono text-foreground">+{clm.requestedDays} Hari Kalender</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kompensasi Biaya:</span>
                    <span className="font-bold font-mono text-foreground">{formatRupiah(clm.requestedCost)}</span>
                  </div>
                  {clm.approvedDays !== null && clm.approvedDays !== undefined && (
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-emerald-600 font-semibold">Disetujui Konsultan MK:</span>
                      <span className="font-bold font-mono text-emerald-600">+{clm.approvedDays} Hari ({formatRupiah(clm.approvedCost || 0)})</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-[11px] line-clamp-2">
                  <span className="font-medium text-foreground">Bukti:</span> {clm.evidenceDescription}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Tanggal: {clm.submittedDate}</span>
                  <span>Verifikator: {clm.verifiedBy || "Sedang ditelaah"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REKAPITULASI ADDENDUM KONTRAK */}
      {activeTab === "addendum" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Rekapitulasi Addendum & Deviasi Kontrak Utama
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbandingan komparatif nilai kontrak awal (*baseline*) terhadap akumulasi CCO pekerjaan tambah/kurang dan proyeksi nilai akhir (*Revised Contract Value*).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">1. Kontrak Awal (Original Baseline)</span>
              <div className="text-xl font-bold font-mono text-foreground">{formatRupiah(summary.originalContractValue)}</div>
              <p className="text-xs text-muted-foreground">Sesuai Surat Perjanjian Kontrak Utama Pemborongan</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">2. Akumulasi CCO / Addendum Net</span>
              <div className="text-xl font-bold font-mono text-emerald-600">+{formatRupiah(summary.netCostImpact)}</div>
              <p className="text-xs text-muted-foreground">Deviasi +{summary.deviationPercent}% (Batas aman toleransi &lt; 10%)</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">3. Nilai Kontrak Akhir yang Direvisi</span>
              <div className="text-xl font-bold font-mono text-blue-600">{formatRupiah(summary.revisedContractValue)}</div>
              <p className="text-xs text-muted-foreground">Termasuk klausul perpanjangan waktu +{summary.totalTimeImpactDays + summary.approvedClaimDays} hari kerja</p>
            </div>
          </div>

          {/* Legal Addendum Checklist */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-foreground">Status Dokumen Berita Acara Perubahan Pekerjaan (BAPP)</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-foreground">BAPP No. 01/BAPP/PRJ-01/2026 - Upgrading Fasad Kaca Low-E</span>
                </div>
                <span className="font-mono font-bold text-foreground">Rp 485.000.000 (Addendum 01 Ditandatangani)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-foreground">BAPP No. 02/BAPP/PRJ-01/2026 - Relokasi Sanitair & Efisiensi Bekisting</span>
                </div>
                <span className="font-mono font-bold text-foreground">-Rp 120.000.000 (Addendum 02 Ditandatangani)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-foreground">Usulan BAPP No. 03 - Pondasi Bored Pile Lensa Pasir</span>
                </div>
                <span className="font-mono font-bold text-amber-600">Rp 340.000.000 (Menunggu Otorisasi Owner)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PENGAJUAN CCO / VO BARU */}
      {showCcoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                Pengajuan CCO / Variation Order Baru
              </h3>
              <button onClick={() => setShowCcoModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCco} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor CCO / VO *</label>
                  <input
                    type="text"
                    required
                    value={ccoForm.ccoNumber}
                    onChange={(e) => setCcoForm({ ...ccoForm, ccoNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tipe Perubahan *</label>
                  <select
                    value={ccoForm.changeType}
                    onChange={(e) => setCcoForm({ ...ccoForm, changeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="SCOPE_ADDITION">Pekerjaan Tambah</option>
                    <option value="SCOPE_DEDUCTION">Pekerjaan Kurang</option>
                    <option value="DESIGN_REVISION">Revisi Desain</option>
                    <option value="MATERIAL_SUBSTITUTION">Substitusi Material</option>
                    <option value="SITE_CONDITION">Kondisi Lapangan / Geoteknik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Judul Perubahan Pekerjaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penambahan Railing Kaca Tempered Void Atrium"
                  value={ccoForm.title}
                  onChange={(e) => setCcoForm({ ...ccoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Pihak Pengusul *</label>
                  <select
                    value={ccoForm.requestedBy}
                    onChange={(e) => setCcoForm({ ...ccoForm, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="OWNER">Owner / Pemberi Tugas</option>
                    <option value="CONSULTANT_MK">Konsultan MK / Pengawas</option>
                    <option value="CONTRACTOR">Kontraktor Utama</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nama Instansi / PIC *</label>
                  <input
                    type="text"
                    required
                    value={ccoForm.originatorName}
                    onChange={(e) => setCcoForm({ ...ccoForm, originatorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Dasar Alasan & Justifikasi Teknis *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jelaskan urgensi teknis, instruksi lapangan, atau revisi gambar arsitektur..."
                  value={ccoForm.reason}
                  onChange={(e) => setCcoForm({ ...ccoForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Estimasi Dampak Biaya (Rp) *</label>
                  <input
                    type="number"
                    step="1000000"
                    required
                    value={ccoForm.costImpact}
                    onChange={(e) => setCcoForm({ ...ccoForm, costImpact: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Estimasi Dampak Waktu (Hari EoT) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ccoForm.timeImpactDays}
                    onChange={(e) => setCcoForm({ ...ccoForm, timeImpactDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Lokasi Zona Pekerjaan *</label>
                  <input
                    type="text"
                    required
                    value={ccoForm.location}
                    onChange={(e) => setCcoForm({ ...ccoForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kode Elemen WBS</label>
                  <input
                    type="text"
                    value={ccoForm.wbsElement}
                    onChange={(e) => setCcoForm({ ...ccoForm, wbsElement: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCcoModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Ajukan CCO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PENGAJUAN KLAIM KONSTRUKSI (EOT) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pengajuan Klaim Konstruksi & Extension of Time (EoT)
              </h3>
              <button onClick={() => setShowClaimModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor Klaim *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.claimNumber}
                    onChange={(e) => setClaimForm({ ...claimForm, claimNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kategori Klaim *</label>
                  <select
                    value={claimForm.claimCategory}
                    onChange={(e) => setClaimForm({ ...claimForm, claimCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="RAIN_DELAY">Hujan Ekstrim / Banjir</option>
                    <option value="FORCE_MAJEURE">Keadaan Kahar / Bencana</option>
                    <option value="SITE_CONDITION">Geoteknik / Kondisi Site</option>
                    <option value="DELAY_OWNER_DRAWING">Keterlambatan Gambar Owner</option>
                    <option value="PRICE_ESCALATION">Eskalasi Harga Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Judul Klaim *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Klaim Perpanjangan Waktu Akibat Cuaca Hujan Ekstrim"
                  value={claimForm.title}
                  onChange={(e) => setClaimForm({ ...claimForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tuntutan Hari Kalender (Hari) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={claimForm.requestedDays}
                    onChange={(e) => setClaimForm({ ...claimForm, requestedDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tuntutan Biaya Kompensasi (Rp)</label>
                  <input
                    type="number"
                    value={claimForm.requestedCost}
                    onChange={(e) => setClaimForm({ ...claimForm, requestedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Deskripsi Bukti & Data Otentik *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Sebutkan rujukan laporan BMKG, Berita Acara Lapangan, atau catatan keterlambatan..."
                  value={claimForm.evidenceDescription}
                  onChange={(e) => setClaimForm({ ...claimForm, evidenceDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium transition-colors"
                >
                  Simpan Klaim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EVALUASI & PERSETUJUAN CCO */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                Evaluasi CCO: {selectedOrder.ccoNumber}
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Keputusan Status *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="REVIEW_MK">REVIEW KONSULTAN MK</option>
                  <option value="APPROVED_OWNER">APPROVED OLEH OWNER</option>
                  <option value="EXECUTED">EXECUTED (MASUK MC KONTRAK)</option>
                  <option value="REJECTED">DITOLAK (REJECTED)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Dampak Biaya Disetujui (Rp)</label>
                  <input
                    type="number"
                    value={statusForm.approvedCostImpact}
                    onChange={(e) => setStatusForm({ ...statusForm, approvedCostImpact: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Hari EoT Disetujui</label>
                  <input
                    type="number"
                    value={statusForm.approvedTimeImpactDays}
                    onChange={(e) => setStatusForm({ ...statusForm, approvedTimeImpactDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Catatan Evaluasi Teknis *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Dasar pertimbangan telaah teknis atau nomor Berita Acara..."
                  value={statusForm.reviewerNotes}
                  onChange={(e) => setStatusForm({ ...statusForm, reviewerNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Nama Reviewer / Approver</label>
                <input
                  type="text"
                  value={statusForm.reviewedBy}
                  onChange={(e) => setStatusForm({ ...statusForm, reviewedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Simpan Keputusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
