"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building,
  FileText,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";

interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  clientName: string;
  clientId?: string;
  category: "INFRASTRUCTURE" | "BUILDING" | "INDUSTRIAL" | "COMMERCIAL";
  ownerType: "BUMN" | "PEMERINTAH" | "SWASTA";
  estimatedValue: number;
  bidBondAmount: number;
  submissionDeadline: string;
  stage: "AANWIJZING" | "PROPOSAL_SUBMITTED" | "NEGOTIATION" | "WON" | "LOST";
  winProbability: number;
  notes?: string;
  handoverProjectId?: string;
  createdAt: string;
}

interface ClientEntity {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  contractsCount: number;
  projectsCount: number;
  totalContractValue: number;
  projects: Array<{ id: string; projectCode: string; name: string; status: string; contractValue: string }>;
  createdAt: string;
}

interface ContractEntity {
  id: string;
  contractNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  clientLegalName: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: string;
  linkedProjects: Array<{ id: string; projectCode: string; name: string; status: string }>;
  createdAt: string;
}

interface CrmOverview {
  kpis: {
    totalTenderPipelineValue: number;
    activeBidsCount: number;
    totalContractsCount: number;
    activeContractsCount: number;
    totalContractValue: number;
    totalClientsCount: number;
    winRatePercentage: number;
  };
  stageBreakdown: Record<string, number>;
}

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "clients" | "contracts" | "analytics">("pipeline");
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<CrmOverview | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [contracts, setContracts] = useState<ContractEntity[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");

  // Modals
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [selectedTenderForHandover, setSelectedTenderForHandover] = useState<Tender | null>(null);

  // Form states
  const [newTender, setNewTender] = useState({
    title: "",
    clientName: "",
    category: "BUILDING",
    ownerType: "BUMN",
    estimatedValue: "",
    submissionDeadline: "2026-12-15",
    notes: "",
  });

  const [newClient, setNewClient] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [handoverData, setHandoverData] = useState({
    projectCode: "",
    projectName: "",
    plannedStart: "2026-11-15",
    plannedEnd: "2027-11-14",
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, tendersRes, clientsRes, contractsRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/crm/overview").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/crm/tenders").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/crm/clients").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/crm/contracts").then((r) => r.json()),
      ]);

      setOverview(overviewRes);
      setTenders(tendersRes);
      setClients(clientsRes);
      setContracts(contractsRes);
    } catch (err) {
      console.error("Gagal memuat data CRM:", err);
      setNotification({ type: "error", message: "Gagal terhubung ke API backend CRM." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000_000) {
      return `Rp ${(val / 1_000_000_000_000).toFixed(2)} Triliun`;
    }
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} Miliar`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(0)} Juta`;
    }
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTender.title || !newTender.clientName || !newTender.estimatedValue) {
      setNotification({ type: "error", message: "Lengkapi judul tender, nama klien, dan estimasi nilai." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/crm/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTender,
          estimatedValue: parseFloat(newTender.estimatedValue.replace(/\D/g, "")) || 0,
        }),
      });

      if (!res.ok) throw new Error("Gagal mendaftarkan tender.");

      setIsNewTenderModalOpen(false);
      setNewTender({
        title: "",
        clientName: "",
        category: "BUILDING",
        ownerType: "BUMN",
        estimatedValue: "",
        submissionDeadline: "2026-12-15",
        notes: "",
      });
      setNotification({ type: "success", message: "Tender baru berhasil didaftarkan ke pipeline." });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal mendaftarkan tender baru." });
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) {
      setNotification({ type: "error", message: "Nama klien wajib diisi." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data klien.");

      setIsNewClientModalOpen(false);
      setNewClient({ name: "", legalName: "", email: "", phone: "", address: "" });
      setNotification({ type: "success", message: "Klien baru berhasil didaftarkan." });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal mendaftarkan klien." });
    }
  };

  const handleUpdateStage = async (id: string, stage: Tender["stage"]) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/crm/tenders/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui tahap tender.");
      setNotification({ type: "success", message: `Tahap tender diperbarui menjadi ${stage}.` });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal memperbarui tahap." });
    }
  };

  const openHandoverModal = (tender: Tender) => {
    setSelectedTenderForHandover(tender);
    setHandoverData({
      projectCode: `PRJ-2026-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      projectName: tender.title,
      plannedStart: new Date().toISOString().split("T")[0],
      plannedEnd: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    });
    setIsHandoverModalOpen(true);
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderForHandover || !handoverData.projectCode || !handoverData.projectName) {
      setNotification({ type: "error", message: "Lengkapi kode proyek dan nama proyek." });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/crm/tenders/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: selectedTenderForHandover.id,
          projectCode: handoverData.projectCode,
          projectName: handoverData.projectName,
          plannedStart: handoverData.plannedStart,
          plannedEnd: handoverData.plannedEnd,
        }),
      });

      if (!res.ok) throw new Error("Gagal melakukan handover.");

      const result = await res.json();
      setIsHandoverModalOpen(false);
      setNotification({
        type: "success",
        message: `Tender ${selectedTenderForHandover.tenderNumber} sukses diserahterimakan ke Proyek ${result.project.projectCode}!`,
      });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal memproses serah terima proyek." });
    }
  };

  // Filtered tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchOwner = ownerFilter === "ALL" || t.ownerType === ownerFilter;
      return matchSearch && matchOwner;
    });
  }, [tenders, searchTerm, ownerFilter]);

  const stages: Array<{ id: Tender["stage"]; title: string; color: string; badgeBg: string }> = [
    { id: "AANWIJZING", title: "Aanwijzing & Klarifikasi", color: "border-sky-500", badgeBg: "bg-sky-100 text-sky-800" },
    { id: "PROPOSAL_SUBMITTED", title: "Penyiapan BOQ / Terkirim", color: "border-indigo-500", badgeBg: "bg-indigo-100 text-indigo-800" },
    { id: "NEGOTIATION", title: "Negosiasi & Evaluasi Teknis", color: "border-amber-500", badgeBg: "bg-amber-100 text-amber-800" },
    { id: "WON", title: "Menang (Awarded / SPPBJ)", color: "border-emerald-500", badgeBg: "bg-emerald-100 text-emerald-800" },
    { id: "LOST", title: "Gugur (Lost / Evaluasi)", color: "border-rose-500", badgeBg: "bg-rose-100 text-rose-800" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm shadow-md transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600" aria-label="Tutup notifikasi">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              MODUL 02 — SALES & TENDER
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              POSTGRESQL & PRISMA READY
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              LPSE / SPSE COMPLIANT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            CRM, Tender & Manajemen Kontrak
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pipeline akuisisi proyek, evaluasi penawaran, jaminan tender (bid bond), dan serah terima kontrak ke proyek aktif.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewTenderModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Tender</span>
          </button>
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Building className="w-4 h-4" />
            <span>Registrasi Klien</span>
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition-colors"
            title="Muat ulang data terbaru"
            aria-label="Muat ulang data CRM"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pipeline Tender</span>
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview ? formatIDR(overview.kpis.totalTenderPipelineValue) : "Rp 0"}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-blue-700">{overview?.kpis.activeBidsCount ?? 0} paket</span> dalam proses bidding aktif
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Win Rate (Tingkat Menang)</span>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.winRatePercentage ?? 0}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">{overview?.stageBreakdown.WON ?? 0} menang</span> dari {overview ? (overview.stageBreakdown.WON + overview.stageBreakdown.LOST) : 0} paket diputuskan
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Kontrak Sah</span>
            <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview ? formatIDR(overview.kpis.totalContractValue) : "Rp 0"}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-indigo-700">{overview?.kpis.activeContractsCount ?? 0} kontrak aktif</span> ditandatangani
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Klien Terdaftar</span>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {overview?.kpis.totalClientsCount ?? 0} Entitas
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>BUMN, Instansi Pemprov & Swasta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-px" aria-label="Tabs CRM">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "pipeline"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pipeline Tender & Bidding</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
              {tenders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "clients"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Direktori Klien (Owner)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "contracts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Register Kontrak & SPK</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-mono">
              {contracts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analisis Pasar & Win-Rate</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: PIPELINE TENDER (KANBAN & LIST) */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor tender, nama paket proyek, atau instansi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tipe Klien:</span>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="text-sm border border-slate-300 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="BUMN">BUMN</option>
                <option value="PEMERINTAH">Pemerintah (APBN/APBD)</option>
                <option value="SWASTA">Swasta</option>
              </select>
            </div>
          </div>

          {/* Kanban Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageTenders = filteredTenders.filter((t) => t.stage === stage.id);
              const totalVal = stageTenders.reduce((acc, t) => acc + t.estimatedValue, 0);

              return (
                <div key={stage.id} className="bg-slate-50 rounded-lg border border-slate-200 flex flex-col min-w-[260px]">
                  {/* Column Header */}
                  <div className={`p-3 border-t-4 ${stage.color} bg-white rounded-t-lg border-b border-slate-200`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${stage.badgeBg}`}>
                        {stageTenders.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">
                      Est: {formatIDR(totalVal)}
                    </div>
                  </div>

                  {/* Cards Area */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[620px]">
                    {stageTenders.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        Tidak ada tender di tahap ini
                      </div>
                    ) : (
                      stageTenders.map((tender) => (
                        <div
                          key={tender.id}
                          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-sm hover:shadow transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                              {tender.tenderNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                              {tender.ownerType}
                            </span>
                          </div>

                          <h2 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {tender.title}
                          </h2>

                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{tender.clientName}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Estimasi Nilai:</span>
                            <span className="font-bold text-slate-900 font-mono">{formatIDR(tender.estimatedValue)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Bid Bond (5%):</span>
                            <span className="font-semibold text-slate-700 font-mono">{formatIDR(tender.bidBondAmount)}</span>
                          </div>

                          {/* Probability Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                              <span>Peluang Menang</span>
                              <span className="font-bold text-slate-700">{tender.winProbability}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  tender.winProbability >= 70
                                    ? "bg-emerald-500"
                                    : tender.winProbability >= 40
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${tender.winProbability}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Batas: {tender.submissionDeadline}</span>
                          </div>

                          {/* Actions depending on stage */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {tender.stage === "AANWIJZING" && (
                              <button
                                onClick={() => handleUpdateStage(tender.id, "PROPOSAL_SUBMITTED")}
                                className="w-full text-center text-[10px] font-semibold py-1 px-2 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              >
                                Ajukan Penawaran &rarr;
                              </button>
                            )}

                            {tender.stage === "PROPOSAL_SUBMITTED" && (
                              <button
                                onClick={() => handleUpdateStage(tender.id, "NEGOTIATION")}
                                className="w-full text-center text-[10px] font-semibold py-1 px-2 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                              >
                                Masuk Negosiasi &rarr;
                              </button>
                            )}

                            {tender.stage === "NEGOTIATION" && (
                              <div className="grid grid-cols-2 gap-1 w-full">
                                <button
                                  onClick={() => handleUpdateStage(tender.id, "WON")}
                                  className="text-center text-[10px] font-bold py-1 px-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                >
                                  Menang (SPPBJ)
                                </button>
                                <button
                                  onClick={() => handleUpdateStage(tender.id, "LOST")}
                                  className="text-center text-[10px] font-medium py-1 px-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                >
                                  Gugur
                                </button>
                              </div>
                            )}

                            {tender.stage === "WON" && (
                              <button
                                onClick={() => openHandoverModal(tender)}
                                className="w-full flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 px-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Serah Terima ke Proyek</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT DIRECTORY */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Direktori Pemilik Proyek (Klien & Instansi)</h2>
              <p className="text-xs text-slate-500">Daftar entitas pemberi kerja yang terhubung dengan kontrak dan proyek aktif.</p>
            </div>
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Klien</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Entitas Klien</th>
                    <th className="py-3 px-4">Kontak & Alamat</th>
                    <th className="py-3 px-4 text-center">Jumlah Kontrak</th>
                    <th className="py-3 px-4 text-center">Proyek Berjalan</th>
                    <th className="py-3 px-4 text-right">Total Nilai Kontrak</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada data klien terdaftar
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{client.legalName}</div>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <div>{client.email}</div>
                          <div className="font-mono text-slate-500">{client.phone}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{client.address}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700">
                            {client.contractsCount} SPK
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-700">
                            {client.projectsCount} Proyek
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                          {formatIDR(client.totalContractValue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveTab("contracts");
                              setSearchTerm(client.name);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Lihat Kontrak &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRACT REGISTER */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Register Kontrak & Surat Perintah Kerja (SPK Induk)</h2>
              <p className="text-xs text-slate-500">Pengikatan hukum, nilai komitmen, dan penyerahan ke baseline proyek.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Kontrak / Judul</th>
                    <th className="py-3 px-4">Pemberi Kerja (Klien)</th>
                    <th className="py-3 px-4 text-right">Nilai Kontrak</th>
                    <th className="py-3 px-4">Masa Pelaksanaan</th>
                    <th className="py-3 px-4 text-center">Status Kontrak</th>
                    <th className="py-3 px-4 text-center">Status Proyek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada kontrak terdaftar
                      </td>
                    </tr>
                  ) : (
                    contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-blue-700">{c.contractNumber}</div>
                          <div className="font-medium text-slate-900 text-xs mt-0.5 max-w-sm">{c.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{c.clientName}</div>
                          <div className="text-[11px] text-slate-500">{c.clientLegalName}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatIDR(c.contractValue)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {c.startDate} s/d {c.endDate}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "SIGNED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {c.linkedProjects.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {c.linkedProjects[0].projectCode}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium">
                              Belum Dihubungkan
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKET ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Komposisi Portofolio Bidding per Kategori Klien</span>
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-semibold">BUMN (Kertajati, PLN, Wika)</span>
                  <span className="font-mono font-bold">Rp 260 M (40.8%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "40.8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-semibold">Pemerintah APBN/APBD (PUPR IKN, Pemprov Jabar)</span>
                  <span className="font-mono font-bold">Rp 318 M (50.0%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "50%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-semibold">Swasta Terpilih (Mega Logistik, Summarecon)</span>
                  <span className="font-mono font-bold">Rp 58 M (9.2%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "9.2%" }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 leading-relaxed">
              <strong>Rekomendasi Komersial:</strong> Diversifikasi portofolio mengarah kuat pada sektor infrastruktur strategis nasional (IKN & BUMN), dengan tingkat keberhasilan (win-rate) optimal pada paket berjaminan penawaran Bank Himbara.
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Ringkasan Risiko & Jaminan Penawaran (Bid Bond)</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[11px] text-slate-500 block uppercase font-medium">Total Eksposur Jaminan Bank</span>
                <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">Rp 31,8 Miliar</span>
                <span className="text-[10px] text-slate-500">5% dari total pipeline aktif</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[11px] text-slate-500 block uppercase font-medium">Rata-rata Margin Penawaran</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">14.2%</span>
                <span className="text-[10px] text-slate-500">Berdasarkan HPS terevaluasi</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-slate-900">Protokol Segregation of Duties (SoD):</div>
              <div>• Penawaran tender di atas Rp 50 Miliar wajib mendapatkan persetujuan Direktur Komersial.</div>
              <div>• Pengikatan kontrak bernilai di atas Rp 100 Miliar wajib melalui verifikasi legalitas & Direksi.</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH TENDER BARU */}
      {isNewTenderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Pendaftaran Tender Proyek Baru</h3>
              <button onClick={() => setIsNewTenderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTender} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Paket Tender / Proyek *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembangunan Jembatan Layang Tol Seksi 3"
                  value={newTender.title}
                  onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Instansi / Klien Pemberi Kerja *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinas Bina Marga Provinsi Jawa Timur"
                  value={newTender.clientName}
                  onChange={(e) => setNewTender({ ...newTender, clientName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pekerjaan</label>
                  <select
                    value={newTender.category}
                    onChange={(e) => setNewTender({ ...newTender, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="BUILDING">Gedung / High Rise</option>
                    <option value="INFRASTRUCTURE">Infrastruktur & Jalan</option>
                    <option value="INDUSTRIAL">Industri & Pabrik</option>
                    <option value="COMMERCIAL">Komersial & Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Pemilik / Owner</label>
                  <select
                    value={newTender.ownerType}
                    onChange={(e) => setNewTender({ ...newTender, ownerType: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="BUMN">BUMN</option>
                    <option value="PEMERINTAH">Pemerintah</option>
                    <option value="SWASTA">Swasta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Nilai HPS (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 75000000000"
                    value={newTender.estimatedValue}
                    onChange={(e) => setNewTender({ ...newTender, estimatedValue: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Akhir Penawaran</label>
                  <input
                    type="date"
                    value={newTender.submissionDeadline}
                    onChange={(e) => setNewTender({ ...newTender, submissionDeadline: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Aanwijzing</label>
                <textarea
                  rows={2}
                  placeholder="Catatan persyaratan khusus, jaminan penawaran, sertifikasi badan usaha..."
                  value={newTender.notes}
                  onChange={(e) => setNewTender({ ...newTender, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTenderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm"
                >
                  Simpan Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH KLIEN BARU */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Registrasi Klien / Pemberi Kerja</h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Populer Entitas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Kereta Api Indonesia (Persero)"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Legal / Badan Hukum Resmi</label>
                <input
                  type="text"
                  placeholder="Contoh: PT Kereta Api Indonesia (Persero) Daop 1 Jakarta"
                  value={newClient.legalName}
                  onChange={(e) => setNewClient({ ...newClient, legalName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Pengadaan</label>
                  <input
                    type="email"
                    placeholder="tender@kai.id"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="+62-21-..."
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor Pusat</label>
                <textarea
                  rows={2}
                  placeholder="Gedung / Jalan / Kota..."
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm"
                >
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HANDOVER KE PROYEK */}
      {isHandoverModalOpen && selectedTenderForHandover && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Serah Terima Tender ke Proyek Baru</h3>
              <button onClick={() => setIsHandoverModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Paket Menang: {selectedTenderForHandover.tenderNumber}</span>
              </div>
              <div>{selectedTenderForHandover.title}</div>
              <div className="font-mono font-semibold">Nilai: {formatIDR(selectedTenderForHandover.estimatedValue)}</div>
            </div>

            <form onSubmit={handleHandoverSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Proyek Unik (Project Code) *</label>
                <input
                  type="text"
                  required
                  value={handoverData.projectCode}
                  onChange={(e) => setHandoverData({ ...handoverData, projectCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Proyek Konstruksi *</label>
                <input
                  type="text"
                  required
                  value={handoverData.projectName}
                  onChange={(e) => setHandoverData({ ...handoverData, projectName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Mulai Pelaksanaan</label>
                  <input
                    type="date"
                    value={handoverData.plannedStart}
                    onChange={(e) => setHandoverData({ ...handoverData, plannedStart: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai (PHO)</label>
                  <input
                    type="date"
                    value={handoverData.plannedEnd}
                    onChange={(e) => setHandoverData({ ...handoverData, plannedEnd: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
                Sistem akan secara otomatis membuat rekaman Proyek baru di modul Manajemen Proyek, menerbitkan kontrak resmi status ACTIVE, dan menghubungkannya dengan profil Klien.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow-sm"
                >
                  Konfirmasi Serah Terima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

