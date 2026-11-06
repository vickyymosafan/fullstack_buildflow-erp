"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Briefcase,
  Gauge,
  AlertOctagon,
  Activity,
  Coins,
  Cpu,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building2,
  DollarSign,
  ShieldAlert,
  Send,
  Zap,
} from "lucide-react";

interface ProjectEvmForecast {
  projectId: string;
  projectCode: string;
  projectName: string;
  sector: "INFRASTRUCTURE" | "COMMERCIAL_BUILDING" | "WATER_RESOURCES" | "INDUSTRIAL";
  contractValue: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  cpi: number;
  spi: number;
  eac: number;
  vac: number;
  forecastedMargin: number;
  targetMargin: number;
  scheduleSlipDays: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  aiRiskFactor: string;
  executiveActionRequired: string;
}

interface CashflowRunwayMonth {
  month: string;
  label: string;
  projectedInflow: number;
  projectedOutflow: number;
  netCashflow: number;
  cumulativeCashBalance: number;
  runwayStatus: "HEALTHY" | "MODERATE" | "DEFICIT_WARNING";
}

interface ExecutiveDirective {
  id: string;
  projectId: string;
  projectName: string;
  issueCategory: "COST_OVERRUN" | "SCHEDULE_SLIP" | "CASHFLOW_DEFICIT" | "SUB_CONTRACTOR_DEFAULT" | "PERMIT_DELAY";
  directive: string;
  assignedDirector: string;
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export default function ExecutiveBiPage() {
  const [activeTab, setActiveTab] = useState<"portfolio-evm" | "cashflow-runway" | "ai-risk-radar">("portfolio-evm");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [directiveStatusFilter, setDirectiveStatusFilter] = useState("ALL");

  // Summary State
  const [summary, setSummary] = useState({
    totalPortfolioValue: 485500000000,
    totalRevenueRealized: 335790000000,
    enterpriseBacklog: 149710000000,
    forecastedGrossMargin: 13.1,
    targetGrossMargin: 15.0,
    cashflowRunwayMonths: 8.4,
    totalProjects: 5,
    activeProjects: 5,
    highRiskProjects: 1,
  });

  // Data Lists State
  const [projectForecasts, setProjectForecasts] = useState<ProjectEvmForecast[]>([
    {
      projectId: "proj-001",
      projectCode: "PRJ-LRT-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      sector: "INFRASTRUCTURE",
      contractValue: 48500000000,
      plannedValue: 48500000000,
      earnedValue: 48500000000,
      actualCost: 40643000000,
      cpi: 1.19,
      spi: 1.00,
      eac: 40643000000,
      vac: 7857000000,
      forecastedMargin: 16.2,
      targetMargin: 15.0,
      scheduleSlipDays: 0,
      riskLevel: "LOW",
      aiRiskFactor: "Tahap penyelesaian BAST & pencairan retensi berjalan sesuai kontrak tanpa anomali biaya.",
      executiveActionRequired: "Pengawasan administrasi penagihan saldo sisa termin akhir.",
    },
    {
      projectId: "proj-002",
      projectCode: "PRJ-IKN-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      sector: "COMMERCIAL_BUILDING",
      contractValue: 66200000000,
      plannedValue: 56000000000,
      earnedValue: 53760000000,
      actualCost: 55900000000,
      cpi: 0.96,
      spi: 0.96,
      eac: 68958000000,
      vac: -2758000000,
      forecastedMargin: 13.8,
      targetMargin: 15.0,
      scheduleSlipDays: 14,
      riskLevel: "MEDIUM",
      aiRiskFactor: "Keterlambatan pasokan material modular & kenaikan tarif logistik darat Kalimantan Timur.",
      executiveActionRequired: "Negosiasi harga konsorsium KSO dengan supplier beton dan percepatan jadwal shift malam.",
    },
    {
      projectId: "proj-003",
      projectCode: "PRJ-TOL-003",
      projectName: "Pembangunan Jalan Tol Akses Patimban Paket 3",
      sector: "INFRASTRUCTURE",
      contractValue: 185000000000,
      plannedValue: 125000000000,
      earnedValue: 110000000000,
      actualCost: 120879000000,
      cpi: 0.91,
      spi: 0.88,
      eac: 203296000000,
      vac: -18296000000,
      forecastedMargin: 9.8,
      targetMargin: 15.0,
      scheduleSlipDays: 42,
      riskLevel: "HIGH",
      aiRiskFactor: "Pembebasan lahan trase frontage belum tuntas dan cuaca curah hujan tinggi memicu deviasi kritis.",
      executiveActionRequired: "Intervensi Direktur Operasional untuk rapat koordinasi lintas kementerian dengan PPK & BPN.",
    },
    {
      projectId: "proj-004",
      projectCode: "PRJ-SDA-004",
      projectName: "Pembangunan Bendungan Pengendali Banjir Citarum",
      sector: "WATER_RESOURCES",
      contractValue: 120800000000,
      plannedValue: 88000000000,
      earnedValue: 88880000000,
      actualCost: 87137000000,
      cpi: 1.02,
      spi: 1.01,
      eac: 118431000000,
      vac: 2369000000,
      forecastedMargin: 15.6,
      targetMargin: 15.0,
      scheduleSlipDays: -5,
      riskLevel: "LOW",
      aiRiskFactor: "Progres galian terowongan pengelak lebih cepat 5 hari dari baseline jadwal awal.",
      executiveActionRequired: "Pertahankan utilisasi alat berat excavator & dump truck pada siklus optimum.",
    },
    {
      projectId: "proj-005",
      projectCode: "PRJ-IND-005",
      projectName: "Kawasan Industri Terpadu Batang Phase 2",
      sector: "INDUSTRIAL",
      contractValue: 65000000000,
      plannedValue: 35000000000,
      earnedValue: 34650000000,
      actualCost: 35000000000,
      cpi: 0.99,
      spi: 0.99,
      eac: 65656000000,
      vac: -656000000,
      forecastedMargin: 14.7,
      targetMargin: 15.0,
      scheduleSlipDays: 4,
      riskLevel: "LOW",
      aiRiskFactor: "Pemadatan tanah dan rigid pavement berjalan stabil sesuai target bulanan MC.",
      executiveActionRequired: "Monitoring berkala tagihan uang muka subkontraktor mekanikal elektrikal.",
    },
  ]);

  const [cashflowProjections, setCashflowProjections] = useState<CashflowRunwayMonth[]>([
    {
      month: "2026-11",
      label: "Nov 2026",
      projectedInflow: 42500000000,
      projectedOutflow: 35200000000,
      netCashflow: 7300000000,
      cumulativeCashBalance: 88300000000,
      runwayStatus: "HEALTHY",
    },
    {
      month: "2026-12",
      label: "Des 2026",
      projectedInflow: 55000000000,
      projectedOutflow: 44000000000,
      netCashflow: 11000000000,
      cumulativeCashBalance: 99300000000,
      runwayStatus: "HEALTHY",
    },
    {
      month: "2027-01",
      label: "Jan 2027",
      projectedInflow: 28000000000,
      projectedOutflow: 31500000000,
      netCashflow: -3500000000,
      cumulativeCashBalance: 95800000000,
      runwayStatus: "HEALTHY",
    },
    {
      month: "2027-02",
      label: "Feb 2027",
      projectedInflow: 34200000000,
      projectedOutflow: 32000000000,
      netCashflow: 2200000000,
      cumulativeCashBalance: 98000000000,
      runwayStatus: "HEALTHY",
    },
    {
      month: "2027-03",
      label: "Mar 2027",
      projectedInflow: 39500000000,
      projectedOutflow: 36000000000,
      netCashflow: 3500000000,
      cumulativeCashBalance: 101500000000,
      runwayStatus: "HEALTHY",
    },
    {
      month: "2027-04",
      label: "Apr 2027",
      projectedInflow: 45000000000,
      projectedOutflow: 38500000000,
      netCashflow: 6500000000,
      cumulativeCashBalance: 108000000000,
      runwayStatus: "HEALTHY",
    },
  ]);

  const [directives, setDirectives] = useState<ExecutiveDirective[]>([
    {
      id: "dir-001",
      projectId: "proj-003",
      projectName: "Pembangunan Jalan Tol Akses Patimban Paket 3",
      issueCategory: "SCHEDULE_SLIP",
      directive:
        "Direktur Operasional menginstruksikan percepatan crash-schedule 2 shift dan pengadaan tanah percepatan bersama Satgas BPN.",
      assignedDirector: "Ir. Ahmad Zulkarnaen (Direktur Operasional I)",
      deadline: "2026-11-20T17:00:00.000Z",
      status: "IN_PROGRESS",
      createdAt: "2026-11-04T09:00:00.000Z",
      notes: "Rapat koordinasi dengan PPK dijadwalkan tanggal 10 November 2026.",
    },
    {
      id: "dir-002",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti IKN",
      issueCategory: "COST_OVERRUN",
      directive:
        "Direktur Keuangan meminta renegotiasi harga borongan material batching plant KSO untuk menekan margin variance.",
      assignedDirector: "Siti Rahmawati, SE, Ak, CA (Direktur Keuangan & Manajemen Risiko)",
      deadline: "2026-11-15T15:00:00.000Z",
      status: "PENDING",
      createdAt: "2026-11-05T14:30:00.000Z",
      notes: "Target efisiensi pengadaan material Rp 1,5 Miliar.",
    },
  ]);

  // Modals State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectEvmForecast | null>(null);

  // Simulation Form State
  const [simForm, setSimForm] = useState({
    scenarioName: "Skenario Resesi & Penundaan Pembayaran Proyek",
    paymentDelayDays: 30,
    materialInflationPercent: 5,
    crashScheduleMonths: 1,
  });

  const [simResult, setSimResult] = useState<any>(null);

  // New Directive Form State
  const [directiveForm, setDirectiveForm] = useState({
    projectId: "proj-003",
    issueCategory: "SCHEDULE_SLIP" as const,
    directive: "",
    assignedDirector: "Ir. Ahmad Zulkarnaen (Direktur Operasional I)",
    deadline: "2026-11-30T17:00:00.000Z",
    notes: "",
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      const resSum = await fetch("http://localhost:4000/api/v1/executive-bi/summary");
      if (resSum.ok) {
        const data = await resSum.json();
        setSummary(data);
      }
      const resFc = await fetch("http://localhost:4000/api/v1/executive-bi/forecasts");
      if (resFc.ok) {
        const data = await resFc.json();
        setProjectForecasts(data);
      }
      const resCw = await fetch("http://localhost:4000/api/v1/executive-bi/cashflow-runway");
      if (resCw.ok) {
        const data = await resCw.json();
        if (data.monthlyProjections) {
          setCashflowProjections(data.monthlyProjections);
        }
      }
      const resDir = await fetch("http://localhost:4000/api/v1/executive-bi/directives");
      if (resDir.ok) {
        const data = await resDir.json();
        setDirectives(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/executive-bi/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simForm),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch {
      // fallback calculation
      setSimResult({
        scenarioName: simForm.scenarioName,
        simulatedMetrics: {
          originalMargin: 14.8,
          simulatedMargin: 12.5,
          marginDelta: -2.3,
          originalRunwayMonths: 8.4,
          simulatedRunwayMonths: 7.2,
          runwayDeltaMonths: -1.2,
          riskStatus: "ACCEPTABLE",
          recommendedAction: "Struktur likuiditas tetap memadai untuk menopang percepatan operasional portofolio.",
        },
      });
    }
  };

  const handleCreateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/executive-bi/directives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(directiveForm),
      });
      if (res.ok) {
        setShowDirectiveModal(false);
        refreshData();
      }
    } catch {
      setShowDirectiveModal(false);
    }
  };

  const handleResolveDirective = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/v1/executive-bi/directives/${id}/resolve`, {
        method: "PATCH",
      });
      refreshData();
    } catch {
      // fallback
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProjects = projectForecasts.filter((p) => {
    const matchesSector = sectorFilter === "ALL" || p.sector === sectorFilter;
    const matchesRisk = riskFilter === "ALL" || p.riskLevel === riskFilter;
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.aiRiskFactor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesRisk && matchesSearch;
  });

  const filteredDirectives = directives.filter((d) => {
    const matchesStatus = directiveStatusFilter === "ALL" || d.status === directiveStatusFilter;
    const matchesSearch =
      d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.directive.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedDirector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              Executive Board BI & Multi-Project Forecasting
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80">
              Phase 21
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Analisis Portofolio Makro Korporat, Prediksi Laba Kotor, Proyeksi EVM & Runway Likuiditas Arus Kas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-700 bg-purple-950/50 hover:bg-purple-900/60 text-xs font-medium text-purple-300 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5" />
            Simulasi Skenario
          </button>
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Terbitkan Arahan BOD
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Enterprise Backlog</span>
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Rp {(summary.enterpriseBacklog / 1000000000).toFixed(2)} M
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Dari total portofolio Rp {(summary.totalPortfolioValue / 1000000000).toFixed(1)} M
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Forecasted Gross Margin</span>
            <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-bold text-blue-400 tracking-tight">
                {summary.forecastedGrossMargin}%
              </p>
              <span className="text-xs text-slate-400">Target: {summary.targetGrossMargin}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Proyeksi laba kotor portofolio aktif</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cashflow Runway Korporat</span>
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <Gauge className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
              {summary.cashflowRunwayMonths} Bulan
            </p>
            <p className="text-xs text-slate-400 mt-1">Ambang batas aman minimum 6.0 bulan</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Proyek Risiko Tinggi</span>
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight">
              {summary.highRiskProjects} / {summary.totalProjects} Proyek
            </p>
            <p className="text-xs text-slate-400 mt-1">Memerlukan intervensi jajaran direksi</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Responsive wrap to prevent overflow on mobile) */}
      <div className="border-b border-slate-800">
        <nav className="flex flex-wrap gap-1 sm:gap-3 pb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("portfolio-evm")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "portfolio-evm"
                ? "border-blue-500 text-blue-400 bg-blue-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Activity className="h-4 w-4" />
            Portfolio Performance & EVM
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {projectForecasts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cashflow-runway")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "cashflow-runway"
                ? "border-amber-500 text-amber-400 bg-amber-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Coins className="h-4 w-4" />
            Cashflow Runway & Liquidity
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              6 Bulan
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai-risk-radar")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "ai-risk-radar"
                ? "border-purple-500 text-purple-400 bg-purple-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Cpu className="h-4 w-4" />
            AI Risk Radar & Board Directives
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {directives.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama proyek, kode, atau faktor risiko..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {activeTab === "portfolio-evm" && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              aria-label="Filter Sektor Proyek"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Sektor Konstruksi</option>
              <option value="INFRASTRUCTURE">Infrastruktur Transportasi</option>
              <option value="COMMERCIAL_BUILDING">Gedung & Komersial</option>
              <option value="WATER_RESOURCES">Sumber Daya Air / Bendungan</option>
              <option value="INDUSTRIAL">Kawasan Industri</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter Tingkat Risiko"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tingkat Risiko</option>
              <option value="LOW">Rendah (LOW)</option>
              <option value="MEDIUM">Sedang (MEDIUM)</option>
              <option value="HIGH">Tinggi (HIGH)</option>
            </select>
          </div>
        )}

        {activeTab === "ai-risk-radar" && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={directiveStatusFilter}
              onChange={(e) => setDirectiveStatusFilter(e.target.value)}
              aria-label="Filter Status Arahan BOD"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="ALL">Semua Status Arahan</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Portfolio Performance & EVM */}
      {activeTab === "portfolio-evm" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                  <th className="p-3.5 font-medium">Proyek & Sektor</th>
                  <th className="p-3.5 font-medium">Nilai Kontrak</th>
                  <th className="p-3.5 font-medium">Earned Value (EV)</th>
                  <th className="p-3.5 font-medium">CPI (Cost)</th>
                  <th className="p-3.5 font-medium">SPI (Schedule)</th>
                  <th className="p-3.5 font-medium">Estimate at Comp (EAC)</th>
                  <th className="p-3.5 font-medium">Margin Proyeksi</th>
                  <th className="p-3.5 font-medium">Deviasi Jadwal</th>
                  <th className="p-3.5 font-medium">Tingkat Risiko</th>
                  <th className="p-3.5 font-medium text-right">Diagnostik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProjects.map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100">{p.projectName}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-blue-400">{p.projectCode}</span>
                        <span>•</span>
                        <span>{p.sector}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono">{formatCurrency(p.contractValue)}</td>
                    <td className="p-3.5 text-slate-300 font-mono">{formatCurrency(p.earnedValue)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          p.cpi >= 1.0
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                            : p.cpi >= 0.95
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                        }`}
                      >
                        {p.cpi.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          p.spi >= 1.0
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                            : p.spi >= 0.95
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                        }`}
                      >
                        {p.spi.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-200">{formatCurrency(p.eac)}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white">{p.forecastedMargin}%</span>
                    </td>
                    <td className="p-3.5 font-mono">
                      {p.scheduleSlipDays === 0 ? (
                        <span className="text-emerald-400">Tepat Waktu</span>
                      ) : p.scheduleSlipDays > 0 ? (
                        <span className="text-rose-400">+{p.scheduleSlipDays} hari</span>
                      ) : (
                        <span className="text-emerald-400">{p.scheduleSlipDays} hari (Lebih cepat)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          p.riskLevel === "LOW"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                            : p.riskLevel === "MEDIUM"
                            ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                            : "bg-rose-950/80 text-rose-400 border-rose-800/60"
                        }`}
                      >
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        Diagnostik AI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Cashflow Runway & Liquidity */}
      {activeTab === "cashflow-runway" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Cadangan Kas Likuiditas</span>
              <p className="text-2xl font-bold text-emerald-400 mt-2">Rp 88,30 Miliar</p>
              <p className="text-xs text-slate-400 mt-1">Saldo kas lancar awal periode berjalan</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Proyeksi Puncak Arus Kas (Peak Inflow)</span>
              <p className="text-2xl font-bold text-blue-400 mt-2">Rp 55,00 Miliar</p>
              <p className="text-xs text-slate-400 mt-1">Bulan Desember 2026 (Klaim termin akhir tahun)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Working Capital Buffer</span>
              <p className="text-2xl font-bold text-amber-400 mt-2">8.4 Bulan Aman</p>
              <p className="text-xs text-slate-400 mt-1">Daya tahan tanpa penambahan pinjaman bank</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              Proyeksi Arus Kas Korporat 6 Bulan Mendatang (Multi-Project Liquidity Model)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                    <th className="p-3 font-medium">Periode Bulan</th>
                    <th className="p-3 font-medium">Penerimaan Progres (Inflow)</th>
                    <th className="p-3 font-medium">Pengeluaran Operasional (Outflow)</th>
                    <th className="p-3 font-medium">Arus Kas Bersih (Net Cashflow)</th>
                    <th className="p-3 font-medium">Saldo Kas Kumulatif</th>
                    <th className="p-3 font-medium">Status Runway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {cashflowProjections.map((cw) => (
                    <tr key={cw.month} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-white">{cw.label}</td>
                      <td className="p-3 font-mono text-emerald-400">+{formatCurrency(cw.projectedInflow)}</td>
                      <td className="p-3 font-mono text-rose-400">-{formatCurrency(cw.projectedOutflow)}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={cw.netCashflow >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {cw.netCashflow >= 0 ? "+" : ""}
                          {formatCurrency(cw.netCashflow)}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">{formatCurrency(cw.cumulativeCashBalance)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                          {cw.runwayStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Risk Radar & Board Directives */}
      {activeTab === "ai-risk-radar" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDirectives.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                      {d.issueCategory}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        d.status === "RESOLVED"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                          : d.status === "IN_PROGRESS"
                          ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                          : "bg-amber-950/80 text-amber-400 border-amber-800/60"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-2.5">{d.projectName}</h3>
                  <p className="text-xs text-slate-300 mt-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 leading-relaxed">
                    "{d.directive}"
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="block text-slate-500">Direktur Penanggung Jawab:</span>
                      <span className="text-slate-200 font-medium">{d.assignedDirector}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Tenggat Waktu:</span>
                      <span className="text-amber-400 font-mono">
                        {new Date(d.deadline).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Diterbitkan: {new Date(d.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  {d.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolveDirective(d.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Simulasi Skenario Makro Finansial */}
      {showSimulateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-simulate-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-simulate-title" className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-500" />
                Simulasi Skenario Makro Finansial
              </h2>
              <button
                onClick={() => setShowSimulateModal(false)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nama Skenario</label>
                <input
                  type="text"
                  required
                  value={simForm.scenarioName}
                  onChange={(e) => setSimForm({ ...simForm, scenarioName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Penundaan Pembayaran Termin Proyek ({simForm.paymentDelayDays} Hari)
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={simForm.paymentDelayDays}
                  onChange={(e) => setSimForm({ ...simForm, paymentDelayDays: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tepat Waktu (0)</span>
                  <span>30 Hari</span>
                  <span>60 Hari</span>
                  <span>Kritis (90 Hari)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Kenaikan Inflasi Material Utama ({simForm.materialInflationPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={simForm.materialInflationPercent}
                  onChange={(e) => setSimForm({ ...simForm, materialInflationPercent: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>20% (Krisis Pasokan)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Akselerasi Crash Schedule ({simForm.crashScheduleMonths} Bulan)
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={simForm.crashScheduleMonths}
                  onChange={(e) => setSimForm({ ...simForm, crashScheduleMonths: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-4 w-4" />
                  Jalankan Simulasi AI
                </button>
              </div>
            </form>

            {simResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-850 border border-purple-800/60 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Hasil Prediksi Skenario: {simResult.scenarioName}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Simulated Gross Margin</span>
                    <span className="text-base font-bold text-blue-400">
                      {simResult.simulatedMetrics.simulatedMargin}%
                    </span>
                    <span className="text-[10px] text-rose-400 block">
                      ({simResult.simulatedMetrics.marginDelta}% dari baseline)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Simulated Cash Runway</span>
                    <span className="text-base font-bold text-amber-400">
                      {simResult.simulatedMetrics.simulatedRunwayMonths} Bulan
                    </span>
                    <span className="text-[10px] text-rose-400 block">
                      ({simResult.simulatedMetrics.runwayDeltaMonths} bulan dari baseline)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-purple-400 font-semibold block mb-0.5">Rekomendasi Strategis BOD:</span>
                  {simResult.simulatedMetrics.recommendedAction}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Diagnostik Proyek Risiko Tinggi */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-project-title" className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-500" />
                Diagnostik Eksekutif EVM Proyek
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedProject.projectName}</h3>
                <span className="text-slate-400 font-mono text-[11px]">{selectedProject.projectCode} • {selectedProject.sector}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-850 border border-slate-800">
                <div>
                  <span className="block text-slate-500">Nilai Kontrak:</span>
                  <span className="text-slate-200 font-mono font-semibold">{formatCurrency(selectedProject.contractValue)}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Perkiraan Akhir (EAC):</span>
                  <span className="text-rose-400 font-mono font-semibold">{formatCurrency(selectedProject.eac)}</span>
                </div>
                <div>
                  <span className="block text-slate-500">CPI (Efisiensi Biaya):</span>
                  <span className="text-slate-200 font-bold">{selectedProject.cpi.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-slate-500">SPI (Kinerja Waktu):</span>
                  <span className="text-slate-200 font-bold">{selectedProject.spi.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Analisis AI Faktor Risiko:</label>
                <p className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-200 leading-relaxed">
                  {selectedProject.aiRiskFactor}
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Rekomendasi Tindakan Direksi:</label>
                <p className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/60 text-blue-200 leading-relaxed">
                  {selectedProject.executiveActionRequired}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Terbitkan Arahan BOD Baru */}
      {showDirectiveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-directive-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-directive-title" className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Terbitkan Arahan Strategis Jajaran Direksi (BOD)
              </h2>
              <button
                onClick={() => setShowDirectiveModal(false)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirective} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Pilih Proyek Sasaran</label>
                <select
                  value={directiveForm.projectId}
                  onChange={(e) => setDirectiveForm({ ...directiveForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {projectForecasts.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName} ({p.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kategori Isu Risiko</label>
                  <select
                    value={directiveForm.issueCategory}
                    onChange={(e) =>
                      setDirectiveForm({
                        ...directiveForm,
                        issueCategory: e.target.value as "SCHEDULE_SLIP",
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="SCHEDULE_SLIP">SCHEDULE_SLIP</option>
                    <option value="COST_OVERRUN">COST_OVERRUN</option>
                    <option value="CASHFLOW_DEFICIT">CASHFLOW_DEFICIT</option>
                    <option value="SUB_CONTRACTOR_DEFAULT">SUB_CONTRACTOR_DEFAULT</option>
                    <option value="PERMIT_DELAY">PERMIT_DELAY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tenggat Waktu Tindak Lanjut</label>
                  <input
                    type="date"
                    required
                    onChange={(e) =>
                      setDirectiveForm({
                        ...directiveForm,
                        deadline: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Direktur Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={directiveForm.assignedDirector}
                  onChange={(e) => setDirectiveForm({ ...directiveForm, assignedDirector: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Instruksi & Arahan Khusus</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Instruksi spesifik percepatan atau mitigasi risiko biaya..."
                  value={directiveForm.directive}
                  onChange={(e) => setDirectiveForm({ ...directiveForm, directive: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDirectiveModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Terbitkan Arahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

