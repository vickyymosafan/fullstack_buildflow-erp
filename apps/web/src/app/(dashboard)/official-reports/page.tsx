"use client";

import { useState, useEffect } from "react";
import {
  Award,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  Building2,
  FileCheck2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  ChevronRight,
  DollarSign,
  UserCheck,
} from "lucide-react";

interface EvmSummary {
  projectCode: string;
  projectName: string;
  contractValue: number;
  physicalProgressPercent: number;
  plannedProgressPercent: number;
  variancePercent: number;
  progressStatus: string;
  evm: {
    plannedValue: number;
    earnedValue: number;
    actualCost: number;
    costVariance: number;
    scheduleVariance: number;
    spi: number;
    cpi: number;
    eac: number;
    vac: number;
    costStatus: string;
    scheduleStatus: string;
  };
  totalReports: number;
  totalBastBap: number;
  activePhase: string;
  contractPeriod: string;
  leadContractor: string;
  mkConsultant: string;
}

interface SPoint {
  weekNumber: number;
  weekLabel: string;
  plannedCumulative: number;
  actualCumulative: number | null;
  variance: number | null;
  plannedValueRp: number;
  earnedValueRp: number | null;
  actualCostRp: number | null;
  status: string;
}

interface OfficialReport {
  id: string;
  reportNumber: string;
  reportType: string;
  periodNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  cumulativeProgressPercent: number;
  plannedProgressPercent: number;
  variancePercent: number;
  workSummary: string;
  weatherSummary: string;
  manpowerCount: number;
  issuesSummary?: string;
  contractorPic: string;
  mkPic: string;
  ownerPic: string;
  status: string;
  reviewerNotes?: string;
  approvedProgressPercent?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  keyActivities?: any[];
  createdAt: string;
}

interface BastBapDoc {
  id: string;
  docNumber: string;
  docType: string;
  title: string;
  terminNumber?: number;
  physicalProgressPercent: number;
  grossAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  netAmount: number;
  punchListItemsCount: number;
  inspectionDate: string;
  warrantyExpiryDate?: string;
  contractorRepresentative: string;
  mkRepresentative: string;
  ownerRepresentative: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function OfficialReportsPage() {
  const [activeTab, setActiveTab] = useState<"kurva-s" | "reports" | "bast-bap" | "print-preview">("kurva-s");
  const [loading, setLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState<EvmSummary | null>(null);
  const [kurvaSPoints, setKurvaSPoints] = useState<SPoint[]>([]);
  const [reportsList, setReportsList] = useState<OfficialReport[]>([]);
  const [bastBapList, setBastBapList] = useState<BastBapDoc[]>([]);
  const [selectedReport, setSelectedReport] = useState<OfficialReport | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBastBapModal, setShowBastBapModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Forms
  const [reportForm, setReportForm] = useState({
    reportType: "WEEKLY",
    periodNumber: 19,
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    title: "",
    cumulativeProgressPercent: 71.0,
    plannedProgressPercent: 68.0,
    workSummary: "",
    weatherSummary: "6 hari cerah normal, 1 hari hujan ringan",
    manpowerCount: 520,
    issuesSummary: "",
    contractorPic: "Ir. Agus Wijaya, M.T.",
    mkPic: "Ir. Hendra Prasetyo (Konsultan MK)",
  });

  const [bastBapForm, setBastBapForm] = useState({
    docType: "BAP_TERMIN",
    title: "",
    terminNumber: 4,
    physicalProgressPercent: 70.0,
    grossAmount: 5700000000,
    retentionPercent: 5.0,
    punchListItemsCount: 0,
    inspectionDate: "2026-03-10",
    warrantyExpiryDate: "",
    contractorRepresentative: "PT Adhi Megah Konstruksi",
    mkRepresentative: "PT Ciriajasa MK Mandiri",
    ownerRepresentative: "PPK Proyek Nusantara Tower",
  });

  const [approvalForm, setApprovalForm] = useState({
    status: "VERIFIED_MK",
    reviewerNotes: "",
    approvedProgressPercent: 68.5,
    verifiedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, sRes, repRes, baRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/official-reports/summary").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/official-reports/kurva-s").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/official-reports").then((r) => r.json()),
        fetch("http://localhost:4000/api/v1/official-reports/bast-bap").then((r) => r.json()),
      ]);

      if (sumRes) setSummary(sumRes);
      if (sRes && Array.isArray(sRes.dataPoints)) setKurvaSPoints(sRes.dataPoints);
      if (Array.isArray(repRes)) {
        setReportsList(repRes);
        if (repRes.length > 0) setSelectedReport(repRes[0]);
      }
      if (Array.isArray(baRes)) setBastBapList(baRes);
    } catch (err) {
      console.error("Gagal memuat data laporan & Kurva S:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/official-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });
      if (res.ok) {
        setShowReportModal(false);
        setReportForm({
          reportType: "WEEKLY",
          periodNumber: 19,
          startDate: "2026-03-02",
          endDate: "2026-03-08",
          title: "",
          cumulativeProgressPercent: 71.0,
          plannedProgressPercent: 68.0,
          workSummary: "",
          weatherSummary: "6 hari cerah normal, 1 hari hujan ringan",
          manpowerCount: 520,
          issuesSummary: "",
          contractorPic: "Ir. Agus Wijaya, M.T.",
          mkPic: "Ir. Hendra Prasetyo (Konsultan MK)",
        });
        fetchData();
      }
    } catch (err) {
      console.error("Error creating report:", err);
    }
  };

  const handleCreateBastBap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gross = Number(bastBapForm.grossAmount) || 0;
      const retPercent = Number(bastBapForm.retentionPercent) || 5.0;
      const retAmount = Math.round((gross * retPercent) / 100);
      const net = gross - retAmount;

      const payload = {
        ...bastBapForm,
        retentionAmount: retAmount,
        netAmount: net,
      };

      const res = await fetch("http://localhost:4000/api/v1/official-reports/bast-bap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowBastBapModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error creating BAP/BAST:", err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      const res = await fetch(`http://localhost:4000/api/v1/official-reports/${selectedReport.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvalForm),
      });
      if (res.ok) {
        setShowApprovalModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredReports = reportsList.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contractorPic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.workSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.reportType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Laporan Konstruksi & Kurva S (Format Standar PUPR)
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Mesin pelaporan resmi tata laksana Permen PUPR No. 1/2023, analisis EVM (*Earned Value*), dan Berita Acara BAP/BAST.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setActiveTab("print-preview");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Format Cetak PUPR</span>
          </button>

          <button
            onClick={() => setShowBastBapModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Terbitkan BAP / BAST</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Laporan Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Progres Fisik Kumulatif */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Progres Fisik Kumulatif
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? `${summary.physicalProgressPercent.toFixed(1)}%` : "68.5%"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{summary ? summary.variancePercent.toFixed(1) : "3.5"}% Deviasi
              </span>
              <span>• Rencana: {summary ? `${summary.plannedProgressPercent.toFixed(1)}%` : "65.0%"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Indeks Kinerja Jadwal (SPI) */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kinerja Jadwal (SPI)
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? summary.evm.spi.toFixed(2) : "1.05"} SPI
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                Schedule Ahead
              </span>
              <span>• SV: +{summary ? formatRupiah(summary.evm.scheduleVariance) : "Rp 350 Juta"}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Indeks Kinerja Biaya (CPI) */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Efisiensi Biaya (CPI)
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? summary.evm.cpi.toFixed(2) : "1.02"} CPI
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                Under Budget
              </span>
              <span>• CV: +{summary ? formatRupiah(summary.evm.costVariance) : "Rp 137.6 Juta"}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Berita Acara & BAST */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status Berita Acara
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {bastBapList.length} Berkas BAP/BAST
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                Termin 60% Disetujui
              </span>
              <span>• Retensi 5% Siap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-3 pb-px" role="tablist" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("kurva-s")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "kurva-s"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Kurva S & EVM</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              24 Mgg
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Laporan PUPR</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-600">
              {reportsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bast-bap")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "bast-bap"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>BAP & BAST</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {bastBapList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("print-preview")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "print-preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Cetak Standar PUPR</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-blue-500/10 text-blue-600">
              A4 Format
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: KURVA S & EVM TRACKING */}
      {activeTab === "kurva-s" && (
        <div className="space-y-6">
          {/* S-Curve Chart Visual Container */}
          <div className="p-4 sm:p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Grafik Kurva S Terintegrasi (Planned Baseline vs Actual Earned Value)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proyeksi deviasi progres kumulatif 24 minggu kalender pelaksanaan berdasarkan standar tata kelola proyek LPSE / PUPR.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 bg-blue-500 border-dashed inline-block"></span>
                  <span className="text-muted-foreground">Target Rencana (PV)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-foreground font-semibold">Realisasi Aktual (EV)</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG S-Curve */}
            <div className="w-full overflow-hidden">
              <div className="w-full h-56 sm:h-64 relative pt-2 pb-6 px-1 sm:px-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = 180 - (val / 100) * 160;
                    return (
                      <g key={val}>
                        <line x1="40" y1={y} x2="680" y2={y} stroke="currentColor" strokeDasharray="3,3" className="text-muted/30" />
                        <text x="10" y={y + 4} fontSize="10" fill="currentColor" className="text-muted-foreground">
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Planned Baseline Path (Blue Dashed) */}
                  {kurvaSPoints.length > 0 && (
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeDasharray="5,4"
                      points={kurvaSPoints
                        .map((pt, i) => {
                          const x = 50 + (i / 23) * 620;
                          const y = 180 - (pt.plannedCumulative / 100) * 160;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}

                  {/* Actual Earned Path (Emerald Solid) */}
                  {kurvaSPoints.length > 0 && (
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      points={kurvaSPoints
                        .filter((pt) => pt.actualCumulative !== null)
                        .map((pt, i) => {
                          const x = 50 + (i / 23) * 620;
                          const y = 180 - ((pt.actualCumulative || 0) / 100) * 160;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}

                  {/* Current Week Marker Line */}
                  <line x1={50 + (17 / 23) * 620} y1="20" x2={50 + (17 / 23) * 620} y2="180" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />
                  <text x={420} y="16" fontSize="10" fill="#f59e0b" fontWeight="bold">
                    Minggu 18 (Posisi Opname Saat Ini)
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* EVM Analysis Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-border bg-card text-xs">
              <span className="text-muted-foreground block text-[11px]">Planned Value (PV):</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {summary ? formatRupiah(summary.evm.plannedValue) : "Rp 6.500.000.000"}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card text-xs">
              <span className="text-muted-foreground block text-[11px]">Earned Value (EV):</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {summary ? formatRupiah(summary.evm.earnedValue) : "Rp 6.850.000.000"}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card text-xs">
              <span className="text-muted-foreground block text-[11px]">Actual Cost (AC):</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {summary ? formatRupiah(summary.evm.actualCost) : "Rp 6.713.000.000"}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card text-xs">
              <span className="text-muted-foreground block text-[11px]">Proyeksi Biaya Akhir (EAC):</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {summary ? formatRupiah(summary.evm.eac) : "Rp 9.803.921.569"}
              </span>
            </div>
          </div>

          {/* Weekly Ledger Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                Tabel Pembobotan & Rekapitulasi Progres Mingguan (W1 - W24)
              </h4>
              <span className="text-xs text-muted-foreground">Satuan: Persen (%) & Rupiah (Rp)</span>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Minggu</th>
                    <th className="py-2.5 px-3">Target Rencana (%)</th>
                    <th className="py-2.5 px-3">Realisasi Lapangan (%)</th>
                    <th className="py-2.5 px-3">Deviasi (%)</th>
                    <th className="py-2.5 px-3">Planned Value (PV)</th>
                    <th className="py-2.5 px-3">Earned Value (EV)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {kurvaSPoints.map((pt) => (
                    <tr key={pt.weekNumber} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-semibold text-foreground font-mono">{pt.weekLabel}</td>
                      <td className="py-2 px-3 font-mono">{pt.plannedCumulative.toFixed(1)}%</td>
                      <td className="py-2 px-3 font-mono font-bold text-foreground">
                        {pt.actualCumulative !== null ? `${pt.actualCumulative.toFixed(1)}%` : "-"}
                      </td>
                      <td className="py-2 px-3 font-mono">
                        {pt.variance !== null ? (
                          <span className={pt.variance >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                            {pt.variance >= 0 ? `+${pt.variance.toFixed(1)}%` : `${pt.variance.toFixed(1)}%`}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-muted-foreground">{formatRupiah(pt.plannedValueRp)}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-foreground">
                        {pt.earnedValueRp !== null ? formatRupiah(pt.earnedValueRp) : "-"}
                      </td>
                      <td className="py-2 px-3">
                        {pt.status === "AHEAD" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Ahead
                          </span>
                        )}
                        {pt.status === "BEHIND" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            Behind
                          </span>
                        )}
                        {pt.status === "PLANNED" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            Target
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="xl:hidden p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[480px] overflow-y-auto">
              {kurvaSPoints.map((pt) => (
                <div key={pt.weekNumber} className="p-3 rounded-lg border border-border bg-background text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">{pt.weekLabel}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted">
                      {pt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className="text-muted-foreground">Rencana: <span className="font-mono text-foreground font-medium">{pt.plannedCumulative.toFixed(1)}%</span></div>
                    <div className="text-muted-foreground">Realisasi: <span className="font-mono text-foreground font-bold">{pt.actualCumulative !== null ? `${pt.actualCumulative.toFixed(1)}%` : "-"}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border text-[11px]">
                    <span className="text-muted-foreground">Deviasi:</span>
                    <span className={pt.variance !== null && pt.variance >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {pt.variance !== null ? (pt.variance >= 0 ? `+${pt.variance.toFixed(1)}%` : `${pt.variance.toFixed(1)}%`) : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN BERKALA PUPR */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nomor laporan, judul, atau ringkasan pekerjaan..."
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
                <option value="ALL">Semua Jenis Laporan</option>
                <option value="DAILY">Laporan Harian</option>
                <option value="WEEKLY">Laporan Mingguan</option>
                <option value="MONTHLY">Laporan Bulanan</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUBMITTED">Diajukan</option>
                <option value="VERIFIED_MK">Diverifikasi MK</option>
                <option value="APPROVED_OWNER">Disahkan PPK</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[20%]">No. Laporan & Jenis</th>
                  <th className="py-3 px-4 w-[32%]">Judul & Ringkasan Pekerjaan</th>
                  <th className="py-3 px-4 w-[16%]">Periode Tanggal</th>
                  <th className="py-3 px-4 w-[14%]">Realisasi vs Rencana</th>
                  <th className="py-3 px-4 w-[10%]">Status</th>
                  <th className="py-3 px-4 w-[8%] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada laporan resmi yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-primary">{r.reportNumber}</span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                              r.reportType === "MONTHLY"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                : r.reportType === "WEEKLY"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r.reportType === "MONTHLY" ? "BULANAN" : r.reportType === "WEEKLY" ? "MINGGUAN" : "HARIAN"} (P{r.periodNumber})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground truncate">{r.title}</div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{r.workSummary}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-muted-foreground">{r.startDate} s/d {r.endDate}</span>
                        <div className="text-[11px] text-muted-foreground">{r.manpowerCount} Man-Days</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-foreground">{r.cumulativeProgressPercent.toFixed(1)}% Real</div>
                        <div className="text-[11px] text-muted-foreground">Target: {r.plannedProgressPercent.toFixed(1)}%</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                            r.status === "APPROVED_OWNER"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : r.status === "VERIFIED_MK"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {r.status === "APPROVED_OWNER" ? "Disahkan PPK" : r.status === "VERIFIED_MK" ? "Review MK" : "Diajukan"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setApprovalForm({
                              status: r.status,
                              reviewerNotes: r.reviewerNotes || "",
                              approvedProgressPercent: r.approvedProgressPercent || r.cumulativeProgressPercent,
                              verifiedBy: "Ir. Hendra Prasetyo (Konsultan MK)",
                            });
                            setShowApprovalModal(true);
                          }}
                          className="px-2.5 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                        >
                          Tinjau
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredReports.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">{r.reportNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                    {r.reportType}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{r.title}</h4>
                  <p className="text-muted-foreground line-clamp-2 mt-1">{r.workSummary}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Realisasi Fisik:</span>
                    <span className="font-mono font-bold text-foreground">{r.cumulativeProgressPercent.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Target Rencana:</span>
                    <span className="font-mono font-medium text-muted-foreground">{r.plannedProgressPercent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{r.startDate}</span>
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setShowApprovalModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-muted text-foreground font-medium"
                  >
                    Tinjau Dokumen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BERITA ACARA (BAP & BAST) */}
      {activeTab === "bast-bap" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Daftar Berita Acara Pembayaran (BAP) & Serah Terima (BAST PHO/FHO)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengesahan sah fisik lapangan untuk penarikan termin pembayaran dan serah terima pekerjaan sesuai kontrak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bastBapList.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{doc.docNumber}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      doc.docType.startsWith("BAST")
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {doc.docType}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">{doc.title}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Tanggal Opname: <span className="font-medium text-foreground">{doc.inspectionDate}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Progres Fisik:</span>
                    <span className="font-mono font-bold text-foreground">{doc.physicalProgressPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nilai Bruto:</span>
                    <span className="font-mono text-muted-foreground">{formatRupiah(doc.grossAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Potongan Retensi ({doc.retentionPercent}%):</span>
                    <span className="font-mono">-{formatRupiah(doc.retentionAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-1 border-t border-border">
                    <span className="text-foreground">Nilai Tagihan Neto:</span>
                    <span className="font-mono text-emerald-600">{formatRupiah(doc.netAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Punch list: {doc.punchListItemsCount} item</span>
                  <span className="font-semibold text-emerald-600">{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRATINJAU CETAK STANDAR PUPR (A4 OFFICIAL DOCUMENT) */}
      {activeTab === "print-preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Lembar Dokumen Resmi Format Standar Kementerian PUPR / LPSE
              </h3>
              <p className="text-xs text-muted-foreground">
                Tata letak siap cetak (*print-ready*) dokumen laporan kemajuan pekerjaan konstruksi.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:bg-primary/90"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen (A4)</span>
            </button>
          </div>

          {/* A4 Sheet Container */}
          <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-xl border border-border bg-card shadow-md space-y-6 text-foreground print:border-none print:shadow-none print:p-0">
            {/* Kop Kementerian / Satker */}
            <div className="border-b-2 border-foreground pb-4 text-center space-y-1">
              <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase">
                Kementerian Pekerjaan Umum dan Perumahan Rakyat
              </h2>
              <h3 className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
                Direktorat Jenderal Cipta Karya — Balai Prasarana Permukiman Wilayah
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Satuan Kerja Pelaksanaan Prasarana Permukiman Wilayah Metropolitan • Kontrak ID: {summary?.projectCode || "PRJ-NSI-2026"}
              </p>
            </div>

            {/* Document Header Details */}
            <div className="text-center py-2">
              <h4 className="text-base sm:text-lg font-bold tracking-tight uppercase">
                Laporan Mingguan Kemajuan Pekerjaan Fisik Konstruksi
              </h4>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">
                Nomor Registrasi: LAP-MG-2026-018 • Periode: Minggu Ke-18 (23 Feb 2026 s/d 01 Mar 2026)
              </div>
            </div>

            {/* Project Identity Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-muted/10 text-xs">
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Paket Pekerjaan:</span> <span className="font-semibold">{summary?.projectName || "Proyek Gedung Nusantara"}</span></div>
                <div><span className="text-muted-foreground">Kontraktor Pelaksana:</span> <span className="font-semibold">{summary?.leadContractor || "PT Adhi Megah Konstruksi"}</span></div>
                <div><span className="text-muted-foreground">Konsultan Pengawas (MK):</span> <span className="font-semibold">{summary?.mkConsultant || "PT Ciriajasa MK Mandiri"}</span></div>
              </div>
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Nilai Kontrak Utama:</span> <span className="font-mono font-bold">{summary ? formatRupiah(summary.contractValue) : "Rp 28.500.000.000"}</span></div>
                <div><span className="text-muted-foreground">Waktu Pelaksanaan:</span> <span className="font-semibold">{summary?.contractPeriod || "270 Hari Kalender"}</span></div>
                <div><span className="text-muted-foreground">Tahapan Berjalan:</span> <span className="font-semibold">{summary?.activePhase || "Struktur & Fasad"}</span></div>
              </div>
            </div>

            {/* Physical Achievement Table */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                I. Rekapitulasi Capaian Prestasi Fisik & Finansial (EVM)
              </h5>
              <table className="w-full text-left text-xs border border-border">
                <thead className="bg-muted/40 font-semibold border-b border-border">
                  <tr>
                    <th className="p-2.5">Uraian Prestasi</th>
                    <th className="p-2.5 text-right">Rencana (%)</th>
                    <th className="p-2.5 text-right">Realisasi (%)</th>
                    <th className="p-2.5 text-right">Deviasi (%)</th>
                    <th className="p-2.5 text-right">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  <tr>
                    <td className="p-2.5 font-sans">Prestasi Kumulatif s/d Minggu Lalu</td>
                    <td className="p-2.5 text-right">61.5%</td>
                    <td className="p-2.5 text-right">64.2%</td>
                    <td className="p-2.5 text-right text-emerald-600">+2.7%</td>
                    <td className="p-2.5 text-right font-sans">Ahead of Schedule</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Prestasi Fisik Minggu Ini</td>
                    <td className="p-2.5 text-right">3.5%</td>
                    <td className="p-2.5 text-right">4.3%</td>
                    <td className="p-2.5 text-right text-emerald-600">+0.8%</td>
                    <td className="p-2.5 text-right font-sans">Memenuhi Target</td>
                  </tr>
                  <tr className="font-bold bg-muted/20">
                    <td className="p-2.5 font-sans">Prestasi Kumulatif s/d Minggu Ini</td>
                    <td className="p-2.5 text-right">65.0%</td>
                    <td className="p-2.5 text-right">68.5%</td>
                    <td className="p-2.5 text-right text-emerald-600">+3.5%</td>
                    <td className="p-2.5 text-right font-sans text-emerald-600">Terpenuhi (Disahkan MK)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary of Work Activities */}
            <div className="space-y-1.5 text-xs">
              <h5 className="font-bold uppercase tracking-wider text-muted-foreground">
                II. Ringkasan Realisasi Item Pekerjaan Lapangan
              </h5>
              <p className="text-muted-foreground leading-relaxed">
                Pengecoran plat dan balok lantai 14 tuntas dengan volume beton ready-mix 145 m3. Instalasi panel curtain wall fasad utara lantai 8-10 telah terpasang 380 m2. Pemipaan chiller air dingin HVAC basement 2 selesai uji tekan 10 bar.
              </p>
            </div>

            {/* Tripartite Signatures */}
            <div className="pt-6 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center text-xs">
                {/* Signer 1: Contractor */}
                <div className="space-y-12">
                  <span className="text-muted-foreground block">Diajukan Oleh: <br /><strong className="text-foreground">KONTRAKTOR UTAMA</strong></span>
                  <div>
                    <span className="font-bold text-foreground block underline">Ir. Agus Wijaya, M.T.</span>
                    <span className="text-[11px] text-muted-foreground">Project Manager</span>
                  </div>
                </div>

                {/* Signer 2: MK Consultant */}
                <div className="space-y-12">
                  <span className="text-muted-foreground block">Diperiksa & Disetujui: <br /><strong className="text-foreground">KONSULTAN PENGAWAS (MK)</strong></span>
                  <div>
                    <span className="font-bold text-foreground block underline">Ir. Hendra Prasetyo</span>
                    <span className="text-[11px] text-muted-foreground">Team Leader MK</span>
                  </div>
                </div>

                {/* Signer 3: Owner / PPK */}
                <div className="space-y-12">
                  <span className="text-muted-foreground block">Disahkan Oleh: <br /><strong className="text-foreground">PEMILIK PROYEK (PPK)</strong></span>
                  <div>
                    <span className="font-bold text-foreground block underline">Dr. Ir. Bambang Sutrisno</span>
                    <span className="text-[11px] text-muted-foreground">Pejabat Pembuat Komitmen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: FORM BUAT LAPORAN BERKALA BARU */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Pengajuan Laporan Berkala Baru
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Jenis Laporan *</label>
                  <select
                    value={reportForm.reportType}
                    onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="DAILY">Laporan Harian Lapangan</option>
                    <option value="WEEKLY">Laporan Mingguan Standar</option>
                    <option value="MONTHLY">Laporan Bulanan Komprehensif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Periode Ke- *</label>
                  <input
                    type="number"
                    value={reportForm.periodNumber}
                    onChange={(e) => setReportForm({ ...reportForm, periodNumber: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Judul Laporan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Mingguan Progres Fisik Minggu Ke-19"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Realisasi Fisik Kumulatif (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportForm.cumulativeProgressPercent}
                    onChange={(e) => setReportForm({ ...reportForm, cumulativeProgressPercent: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Target Rencana Rencana (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportForm.plannedProgressPercent}
                    onChange={(e) => setReportForm({ ...reportForm, plannedProgressPercent: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Uraian Pekerjaan Utama *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Rincian item pekerjaan yang telah diselesaikan pada periode ini..."
                  value={reportForm.workSummary}
                  onChange={(e) => setReportForm({ ...reportForm, workSummary: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TERBITKAN BAP / BAST */}
      {showBastBapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Penerbitan Berita Acara (BAP / BAST)
              </h3>
              <button onClick={() => setShowBastBapModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBastBap} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Jenis Berita Acara *</label>
                  <select
                    value={bastBapForm.docType}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, docType: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="BAP_TERMIN">Berita Acara Pembayaran (BAP Termin)</option>
                    <option value="BAST_1_PHO">Serah Terima Pertama (BAST-1 / PHO)</option>
                    <option value="BAST_2_FHO">Serah Terima Akhir (BAST-2 / FHO)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor Termin (Jika BAP)</label>
                  <input
                    type="number"
                    value={bastBapForm.terminNumber}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, terminNumber: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Judul Dokumen *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Berita Acara Pembayaran (BAP) Termin Ke-4 Progres Fisik 70%"
                  value={bastBapForm.title}
                  onChange={(e) => setBastBapForm({ ...bastBapForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Progres Opname (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bastBapForm.physicalProgressPercent}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, physicalProgressPercent: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nilai Bruto Tagihan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={bastBapForm.grossAmount}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, grossAmount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Potongan Retensi (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bastBapForm.retentionPercent}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, retentionPercent: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tanggal Uji Opname *</label>
                  <input
                    type="date"
                    required
                    value={bastBapForm.inspectionDate}
                    onChange={(e) => setBastBapForm({ ...bastBapForm, inspectionDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBastBapModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
                >
                  Terbitkan Berita Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EVALUASI & PENGESAHAN DIGITAL MK/OWNER */}
      {showApprovalModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Pengesahan / Tinjauan Laporan Berkala
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-4 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <div className="font-semibold text-foreground">{selectedReport.title}</div>
                <div className="text-muted-foreground font-mono">{selectedReport.reportNumber} • {selectedReport.startDate} s/d {selectedReport.endDate}</div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Keputusan Status *</label>
                <select
                  value={approvalForm.status}
                  onChange={(e) => setApprovalForm({ ...approvalForm, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="SUBMITTED">Diajukan (Tahap Draft)</option>
                  <option value="VERIFIED_MK">Diverifikasi & Disetujui MK</option>
                  <option value="APPROVED_OWNER">Disahkan Oleh Pemilik Proyek (PPK)</option>
                  <option value="FINALIZED">Final & Ditutup</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Catatan Evaluasi Verifikator</label>
                <textarea
                  rows={3}
                  placeholder="Catatan hasil opname lapangan atau rekomendasi teknis..."
                  value={approvalForm.reviewerNotes}
                  onChange={(e) => setApprovalForm({ ...approvalForm, reviewerNotes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Nama Pejabat Penandatangan *</label>
                <input
                  type="text"
                  required
                  value={approvalForm.verifiedBy}
                  onChange={(e) => setApprovalForm({ ...approvalForm, verifiedBy: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-card hover:bg-muted text-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-sm"
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
