"use client";

import { useState, useEffect } from "react";
import {
  Handshake,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  RefreshCw,
  X,
  Check,
  Building,
  UserCheck,
  ShieldCheck,
  Percent,
  Wallet,
  ArrowUpRight,
  Receipt,
  FileCheck2,
  Phone,
  Filter,
} from "lucide-react";

interface SubconSummary {
  totalSpkCount: number;
  activeSpkCount: number;
  totalContractValue: number;
  totalOpnameCount: number;
  totalMcCount: number;
  totalRetentionHeld: number;
  totalMcPayable: number;
  totalPaid: number;
}

interface SpkItem {
  id: string;
  spkNumber: string;
  title: string;
  subconName: string;
  category: string;
  scopeOfWork: string;
  contractValue: number;
  currentProgress: number;
  status: string;
  downPaymentPercent: number;
  retentionPercent: number;
  startDate: string;
  endDate: string;
  picName: string;
  picPhone: string;
  location?: string;
  createdAt: string;
}

interface OpnameItem {
  id: string;
  opnameNumber: string;
  title: string;
  spkNumber: string;
  subconName: string;
  period: string;
  previousProgress: number;
  currentProgress: number;
  progressDelta: number;
  verifiedBy: string;
  location?: string;
  status: string;
  notes: string;
  verifiedAt: string;
}

interface McItem {
  id: string;
  mcNumber: string;
  title: string;
  spkNumber: string;
  subconName: string;
  period: string;
  grossAmount: number;
  dpDeduction: number;
  retentionDeduction: number;
  pphFinalPercent: number;
  taxPphAmount: number;
  netPayable: number;
  status: string;
  verifiedBy?: string;
  notes: string;
  createdAt: string;
}

interface VendorItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  activeProjects: number;
  contactPerson: string;
  phone: string;
  legalStatus: string;
  npwp: string;
}

export default function SubcontractorsPage() {
  const [activeTab, setActiveTab] = useState<"spk" | "opname" | "mc" | "vendors">("spk");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [summary, setSummary] = useState<SubconSummary>({
    totalSpkCount: 3,
    activeSpkCount: 3,
    totalContractValue: 4280000000,
    totalOpnameCount: 3,
    totalMcCount: 3,
    totalRetentionHeld: 49450000,
    totalMcPayable: 646447500,
    totalPaid: 169830000,
  });

  const [spkList, setSpkList] = useState<SpkItem[]>([]);
  const [opnameList, setOpnameList] = useState<OpnameItem[]>([]);
  const [mcList, setMcList] = useState<McItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);

  // Modals
  const [showSpkModal, setShowSpkModal] = useState(false);
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [showMcModal, setShowMcModal] = useState(false);

  // Form States
  const [spkForm, setSpkForm] = useState({
    spkNumber: "",
    subconName: "",
    scopeOfWork: "",
    category: "STRUKTUR",
    contractValue: 500000000,
    downPaymentPercent: 10,
    retentionPercent: 5,
    startDate: "2026-04-01",
    endDate: "2026-10-31",
    picName: "",
    picPhone: "",
  });

  const [opnameForm, setOpnameForm] = useState({
    spkId: "",
    opnameNumber: "",
    period: "Maret 2026 (Minggu ke-4)",
    previousProgress: 50,
    currentProgress: 75,
    verifiedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
    notes: "",
  });

  const [mcForm, setMcForm] = useState({
    spkId: "",
    mcNumber: "",
    period: "Maret 2026",
    grossAmount: 250000000,
    dpDeduction: 25000000,
    retentionDeduction: 12500000,
    pphFinalPercent: 2.65,
    taxPphAmount: 6625000,
    netPayable: 205875000,
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, spkRes, opnRes, mcRes, venRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/subcontractors/summary").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/subcontractors/spk").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/subcontractors/opname").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/subcontractors/mc").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/subcontractors/vendors").then((r) => r.json()),
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(spkRes)) setSpkList(spkRes);
      if (Array.isArray(opnRes)) setOpnameList(opnRes);
      if (Array.isArray(mcRes)) setMcList(mcRes);
      if (Array.isArray(venRes)) setVendors(venRes);
    } catch {
      // Fallback if API is rebooting
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSpk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/subcontractors/spk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spkForm),
      });
      if (res.ok) {
        setShowSpkModal(false);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleCreateOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/subcontractors/opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opnameForm),
      });
      if (res.ok) {
        setShowOpnameModal(false);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleCreateMc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/subcontractors/mc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mcForm),
      });
      if (res.ok) {
        setShowMcModal(false);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateMcStatus = async (id: string, status: "APPROVED" | "PAID") => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/subcontractors/mc/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedBy: "Ir. Danang Wicaksono (Project Manager)" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Handshake className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Subkontraktor & Mandor Lapangan
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  SPK / MC Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pengelolaan Surat Perintah Kerja (SPK), Berita Acara Opname Fisik, Monthly Certificate (MC), dan Retensi Garansi 5%
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setSpkForm({
                spkNumber: `SPK-2026-STR-0${spkList.length + 1}`,
                subconName: "PT Adhi Bangun Persada",
                scopeOfWork: "Pekerjaan Bekisting & Pembesian Ramp Parkir",
                category: "STRUKTUR",
                contractValue: 750000000,
                downPaymentPercent: 10,
                retentionPercent: 5,
                startDate: "2026-04-01",
                endDate: "2026-09-30",
                picName: "Bambang Susilo",
                picPhone: "0812-9988-7711",
              });
              setShowSpkModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan SPK</span>
          </button>
          <button
            onClick={() => {
              setOpnameForm({
                spkId: spkList[0]?.spkNumber || "SPK-2026-STR-01",
                opnameNumber: `OPN-2026-04-0${opnameList.length + 1}`,
                period: "Maret 2026 (Minggu ke-4)",
                previousProgress: 60,
                currentProgress: 85,
                verifiedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
                notes: "Opname pekerjaan pembesian plat dan bekisting siap cor.",
              });
              setShowOpnameModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Opname</span>
          </button>
          <button
            onClick={() => {
              const gross = 300000000;
              const dp = gross * 0.1;
              const ret = gross * 0.05;
              const pphRate = 0.0265;
              const tax = (gross - dp) * pphRate;
              const net = gross - dp - ret - tax;

              setMcForm({
                spkId: spkList[0]?.spkNumber || "SPK-2026-STR-01",
                mcNumber: `MC-2026-04-0${mcList.length + 1}`,
                period: "Maret 2026",
                grossAmount: gross,
                dpDeduction: dp,
                retentionDeduction: ret,
                pphFinalPercent: 2.65,
                taxPphAmount: tax,
                netPayable: net,
                notes: "Pengajuan Monthly Certificate progres opname lapangan.",
              });
              setShowMcModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat MC</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kontrak SPK */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kontrak SPK
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(summary.totalContractValue)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {summary.activeSpkCount} SPK Aktif
              </span>
              <span>• Rata-rata DP 10%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Progres Opname */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Opname Terverifikasi
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.totalOpnameCount} Berita Acara
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                Konsultan MK Disetujui
              </span>
              <span>• Joint Inspection 100%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Retensi 5% Garansi */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Retensi Garansi (5%)
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(summary.totalRetentionHeld)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="text-purple-600 font-semibold">Dana Ditahan Aman</span>
              <span>• Rilis Pasca FHO</span>
            </div>
          </div>
        </div>

        {/* Card 4: MC Siap Bayar */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              MC Siap Bayar / Net
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(summary.totalMcPayable)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="text-emerald-600 font-semibold">Net Payable</span>
              <span>• Terpotong PPh 4(2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-4 pb-px" role="tablist" aria-label="Tabs Subkon">
          <button
            onClick={() => setActiveTab("spk")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "spk"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SPK Subkontraktor</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              {spkList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("opname")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "opname"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Opname Lapangan</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {opnameList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("mc")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "mc"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Monthly Certificate</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-600">
              {mcList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vendors")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "vendors"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Mitra Mandor & Subkon</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-muted text-muted-foreground">
              {vendors.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nomor SPK, nama subkon, atau lingkup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="STRUKTUR">Struktur & Beton</option>
            <option value="MEP">MEP & Plumbing</option>
            <option value="ARSITEKTUR">Arsitektur & Dinding</option>
            <option value="PONDASI">Pondasi Dalam</option>
          </select>
        </div>
      </div>

      {/* TAB 1: SPK Subkontraktor */}
      {activeTab === "spk" && (
        <div className="space-y-4">
          {/* Mobile Card View (< 1280px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {spkList
              .filter(
                (item) =>
                  (categoryFilter === "ALL" || item.category === categoryFilter) &&
                  (searchQuery === "" ||
                    item.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.subconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.scopeOfWork.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((spk) => (
                <div key={spk.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {spk.spkNumber}
                      </span>
                      <h3 className="text-base font-semibold text-foreground mt-1.5">{spk.subconName}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {spk.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{spk.scopeOfWork}</p>

                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Nilai Kontrak:</span>
                      <span className="font-semibold text-foreground">{formatRupiah(spk.contractValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progres Fisik:</span>
                      <span className="font-semibold text-primary">{spk.currentProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, spk.currentProgress)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                      <span>DP: {spk.downPaymentPercent}% | Retensi: {spk.retentionPercent}%</span>
                      <span>PIC: {spk.picName}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop Table View (>= 1280px) */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3 w-[12%]">No. SPK</th>
                  <th className="py-3 px-3 w-[18%]">Subkontraktor</th>
                  <th className="py-3 px-3 w-[22%]">Lingkup Pekerjaan</th>
                  <th className="py-3 px-3 w-[10%]">Kategori</th>
                  <th className="py-3 px-3 w-[14%] text-right">Nilai Kontrak</th>
                  <th className="py-3 px-3 w-[12%]">Progres Fisik</th>
                  <th className="py-3 px-3 w-[6%] text-center">Status</th>
                  <th className="py-3 px-3 w-[6%] text-center">PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {spkList
                  .filter(
                    (item) =>
                      (categoryFilter === "ALL" || item.category === categoryFilter) &&
                      (searchQuery === "" ||
                        item.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.subconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.scopeOfWork.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((spk) => (
                    <tr key={spk.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-primary truncate">
                        {spk.spkNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground truncate">{spk.subconName}</div>
                        <div className="text-[10px] text-muted-foreground">DP {spk.downPaymentPercent}% • Retensi {spk.retentionPercent}%</div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">
                        {spk.scopeOfWork}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-muted font-medium text-foreground">
                          {spk.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        {formatRupiah(spk.contractValue)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <span className="font-semibold text-primary">{spk.currentProgress}%</span>
                          <span className="text-[10px] text-muted-foreground">Kumulatif</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, spk.currentProgress)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {spk.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-xs truncate">
                        <div className="font-medium text-foreground truncate">{spk.picName}</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Opname Lapangan */}
      {activeTab === "opname" && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {opnameList
              .filter(
                (item) =>
                  searchQuery === "" ||
                  item.opnameNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.subconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.spkNumber.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((opn) => (
                <div key={opn.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-600 px-2 py-0.5 rounded bg-amber-50">
                        {opn.opnameNumber}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground mt-1.5">{opn.subconName}</h3>
                      <div className="text-xs text-muted-foreground">Ref: {opn.spkNumber}</div>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {opn.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">{opn.notes}</p>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                    <div>
                      <span className="text-muted-foreground">Progres: </span>
                      <span className="font-bold text-foreground">{opn.currentProgress}% </span>
                      <span className="text-emerald-600 font-semibold">(+{opn.progressDelta}%)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Verifikator: {opn.verifiedBy}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3 w-[12%]">No. Opname</th>
                  <th className="py-3 px-3 w-[12%]">Ref SPK</th>
                  <th className="py-3 px-3 w-[18%]">Subkontraktor</th>
                  <th className="py-3 px-3 w-[12%]">Periode</th>
                  <th className="py-3 px-3 w-[14%]">Progres</th>
                  <th className="py-3 px-3 w-[16%]">Catatan & Lokasi</th>
                  <th className="py-3 px-3 w-[10%]">Verifikator MK</th>
                  <th className="py-3 px-3 w-[6%] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {opnameList
                  .filter(
                    (item) =>
                      searchQuery === "" ||
                      item.opnameNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.subconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.spkNumber.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((opn) => (
                    <tr key={opn.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-amber-600 truncate">
                        {opn.opnameNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground truncate">
                        {opn.spkNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground truncate">
                        {opn.subconName}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">
                        {opn.period}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">{opn.previousProgress}%</span>
                          <span>&rarr;</span>
                          <span className="font-bold text-foreground">{opn.currentProgress}%</span>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                            +{opn.progressDelta}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">
                        {opn.notes}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground truncate">
                        {opn.verifiedBy}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {opn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Monthly Certificate (MC) */}
      {activeTab === "mc" && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {mcList
              .filter(
                (item) =>
                  searchQuery === "" ||
                  item.mcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.subconName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((mc) => (
                <div key={mc.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">
                        {mc.mcNumber}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground mt-1.5">{mc.subconName}</h3>
                      <div className="text-xs text-muted-foreground">{mc.period} • Ref: {mc.spkNumber}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                        mc.status === "PAID"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : mc.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {mc.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Klaim Bruto:</span>
                      <span className="font-medium text-foreground">{formatRupiah(mc.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Potongan DP (10%):</span>
                      <span className="text-red-500">-{formatRupiah(mc.dpDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Retensi Garansi (5%):</span>
                      <span className="text-purple-600">-{formatRupiah(mc.retentionDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>PPh Final 4(2) ({mc.pphFinalPercent}%):</span>
                      <span className="text-amber-600">-{formatRupiah(mc.taxPphAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
                      <span className="text-foreground">Net Siap Bayar:</span>
                      <span className="text-emerald-600">{formatRupiah(mc.netPayable)}</span>
                    </div>
                  </div>

                  {mc.status !== "PAID" && (
                    <div className="pt-2 flex justify-end gap-2">
                      {mc.status === "VERIFIED" && (
                        <button
                          onClick={() => handleUpdateMcStatus(mc.id, "APPROVED")}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Approve MC
                        </button>
                      )}
                      {mc.status === "APPROVED" && (
                        <button
                          onClick={() => handleUpdateMcStatus(mc.id, "PAID")}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3 w-[10%]">No. MC</th>
                  <th className="py-3 px-3 w-[15%]">Subkontraktor</th>
                  <th className="py-3 px-3 w-[8%]">Periode</th>
                  <th className="py-3 px-3 w-[12%] text-right">Klaim Bruto</th>
                  <th className="py-3 px-3 w-[10%] text-right">Potongan DP</th>
                  <th className="py-3 px-3 w-[10%] text-right">Retensi (5%)</th>
                  <th className="py-3 px-3 w-[10%] text-right">PPh Final 4(2)</th>
                  <th className="py-3 px-3 w-[13%] text-right">Net Payable</th>
                  <th className="py-3 px-3 w-[6%] text-center">Status</th>
                  <th className="py-3 px-3 w-[6%] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mcList
                  .filter(
                    (item) =>
                      searchQuery === "" ||
                      item.mcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.subconName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((mc) => (
                    <tr key={mc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-emerald-600 truncate">
                        {mc.mcNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground truncate">
                        <div className="truncate">{mc.subconName}</div>
                        <div className="text-[10px] text-muted-foreground truncate">Ref: {mc.spkNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground truncate">
                        {mc.period}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {formatRupiah(mc.grossAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-red-500 font-medium">
                        -{formatRupiah(mc.dpDeduction)}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-purple-600 font-semibold">
                        -{formatRupiah(mc.retentionDeduction)}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-amber-600 font-medium">
                        -{formatRupiah(mc.taxPphAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {formatRupiah(mc.netPayable)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                            mc.status === "PAID"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : mc.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {mc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {mc.status === "VERIFIED" && (
                          <button
                            onClick={() => handleUpdateMcStatus(mc.id, "APPROVED")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        {mc.status === "APPROVED" && (
                          <button
                            onClick={() => handleUpdateMcStatus(mc.id, "PAID")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          >
                            Bayar
                          </button>
                        )}
                        {mc.status === "PAID" && (
                          <span className="text-[11px] text-muted-foreground">Lunas</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Direktori Mitra Subkon & Mandor */}
      {activeTab === "vendors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((ven) => (
            <div key={ven.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">{ven.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary">
                    {ven.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg text-xs font-bold">
                  ★ {ven.rating}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-foreground">{ven.legalStatus}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>PIC: {ven.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Telepon: {ven.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>NPWP: {ven.npwp}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{ven.activeProjects} Proyek Berjalan</span>
                <span className="text-emerald-600 font-semibold">Akreditasi Terverifikasi</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Terbitkan SPK Baru */}
      {showSpkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Terbitkan SPK Subkontraktor Baru</h2>
              <button
                onClick={() => setShowSpkModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpk} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nomor SPK</label>
                  <input
                    type="text"
                    required
                    value={spkForm.spkNumber}
                    onChange={(e) => setSpkForm({ ...spkForm, spkNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Kategori Spesialisasi</label>
                  <select
                    value={spkForm.category}
                    onChange={(e) => setSpkForm({ ...spkForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="STRUKTUR">Struktur & Pembesian</option>
                    <option value="MEP">MEP & Plumbing</option>
                    <option value="ARSITEKTUR">Arsitektur & Dinding</option>
                    <option value="PONDASI">Pondasi Dalam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nama Subkontraktor / Mandor</label>
                <input
                  type="text"
                  required
                  value={spkForm.subconName}
                  onChange={(e) => setSpkForm({ ...spkForm, subconName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Lingkup Pekerjaan Utama</label>
                <textarea
                  rows={2}
                  required
                  value={spkForm.scopeOfWork}
                  onChange={(e) => setSpkForm({ ...spkForm, scopeOfWork: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nilai Kontrak (Rp)</label>
                  <input
                    type="number"
                    required
                    value={spkForm.contractValue}
                    onChange={(e) => setSpkForm({ ...spkForm, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Uang Muka (%)</label>
                  <input
                    type="number"
                    value={spkForm.downPaymentPercent}
                    onChange={(e) => setSpkForm({ ...spkForm, downPaymentPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Retensi Garansi (%)</label>
                  <input
                    type="number"
                    value={spkForm.retentionPercent}
                    onChange={(e) => setSpkForm({ ...spkForm, retentionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nama PIC Subkon</label>
                  <input
                    type="text"
                    required
                    value={spkForm.picName}
                    onChange={(e) => setSpkForm({ ...spkForm, picName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">No. HP PIC</label>
                  <input
                    type="text"
                    value={spkForm.picPhone}
                    onChange={(e) => setSpkForm({ ...spkForm, picPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowSpkModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  Terbitkan SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Catat Opname Lapangan */}
      {showOpnameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Catat Berita Acara Opname Fisik Lapangan</h2>
              <button
                onClick={() => setShowOpnameModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpname} className="space-y-4 mt-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pilih SPK Subkon Terkait</label>
                <select
                  value={opnameForm.spkId}
                  onChange={(e) => setOpnameForm({ ...opnameForm, spkId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  {spkList.map((s) => (
                    <option key={s.id} value={s.spkNumber}>
                      {s.spkNumber} - {s.subconName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nomor Berita Acara Opname</label>
                  <input
                    type="text"
                    required
                    value={opnameForm.opnameNumber}
                    onChange={(e) => setOpnameForm({ ...opnameForm, opnameNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Periode Opname</label>
                  <input
                    type="text"
                    required
                    value={opnameForm.period}
                    onChange={(e) => setOpnameForm({ ...opnameForm, period: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Progres Sebelumnya (%)</label>
                  <input
                    type="number"
                    value={opnameForm.previousProgress}
                    onChange={(e) => setOpnameForm({ ...opnameForm, previousProgress: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Progres Opname Saat Ini (%)</label>
                  <input
                    type="number"
                    required
                    value={opnameForm.currentProgress}
                    onChange={(e) => setOpnameForm({ ...opnameForm, currentProgress: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nama Verifikator / Konsultan MK</label>
                <input
                  type="text"
                  required
                  value={opnameForm.verifiedBy}
                  onChange={(e) => setOpnameForm({ ...opnameForm, verifiedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Catatan Hasil Pemeriksaan Lapangan</label>
                <textarea
                  rows={2}
                  value={opnameForm.notes}
                  onChange={(e) => setOpnameForm({ ...opnameForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium"
                >
                  Simpan Berita Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Pengajuan Monthly Certificate (MC) */}
      {showMcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Pengajuan Monthly Certificate (MC)</h2>
              <button
                onClick={() => setShowMcModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMc} className="space-y-4 mt-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pilih SPK Terkait</label>
                <select
                  value={mcForm.spkId}
                  onChange={(e) => setMcForm({ ...mcForm, spkId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  {spkList.map((s) => (
                    <option key={s.id} value={s.spkNumber}>
                      {s.spkNumber} - {s.subconName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nomor MC</label>
                  <input
                    type="text"
                    required
                    value={mcForm.mcNumber}
                    onChange={(e) => setMcForm({ ...mcForm, mcNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Periode Tagihan</label>
                  <input
                    type="text"
                    required
                    value={mcForm.period}
                    onChange={(e) => setMcForm({ ...mcForm, period: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nilai Klaim Bruto Opname (Rp)</label>
                <input
                  type="number"
                  required
                  value={mcForm.grossAmount}
                  onChange={(e) => {
                    const gross = Number(e.target.value);
                    const dp = gross * 0.1;
                    const ret = gross * 0.05;
                    const tax = (gross - dp) * (mcForm.pphFinalPercent / 100);
                    const net = gross - dp - ret - tax;
                    setMcForm({
                      ...mcForm,
                      grossAmount: gross,
                      dpDeduction: dp,
                      retentionDeduction: ret,
                      taxPphAmount: tax,
                      netPayable: net,
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potongan Pengembalian DP (10%):</span>
                  <span className="text-red-500 font-medium">-{formatRupiah(mcForm.dpDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potongan Retensi Garansi (5%):</span>
                  <span className="text-purple-600 font-semibold">-{formatRupiah(mcForm.retentionDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPh Final Jasa Konstruksi (2.65%):</span>
                  <span className="text-amber-600 font-medium">-{formatRupiah(mcForm.taxPphAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                  <span className="text-foreground">Net Tagihan Siap Cair:</span>
                  <span className="text-emerald-600">{formatRupiah(mcForm.netPayable)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowMcModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                >
                  Ajukan Monthly Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
