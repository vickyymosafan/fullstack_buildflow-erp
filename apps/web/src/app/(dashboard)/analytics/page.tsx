"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Building2,
  Target,
  PieChart,
  HelpCircle,
} from "lucide-react";

interface EVMMetrics {
  projectCode: string;
  projectName: string;
  contractValueBAC: number;
  plannedProgressPercentage: number;
  actualProgressPercentage: number;
  plannedValuePV: number;
  earnedValueEV: number;
  actualCostAC: number;
  costVarianceCV: number;
  scheduleVarianceSV: number;
  cpi: number;
  spi: number;
  eac: number;
  etc: number;
  tcpi: number;
  status: "HEALTHY" | "NEEDS_ATTENTION" | "CRITICAL";
  costStatus: "UNDER_BUDGET" | "ON_BUDGET" | "OVER_BUDGET";
  scheduleStatus: "AHEAD_OF_SCHEDULE" | "ON_SCHEDULE" | "BEHIND_SCHEDULE";
}

interface SCurveDataPoint {
  month: string;
  label: string;
  plannedCumulativePercentage: number;
  earnedCumulativePercentage: number | null;
  actualCostCumulativePercentage: number | null;
  plannedCumulativeAmount: number;
  earnedCumulativeAmount: number | null;
  actualCostCumulativeAmount: number | null;
}

interface SCurveData {
  projectCode: string;
  projectName: string;
  bac: number;
  timelineMonths: number;
  currentMonth: number;
  dataPoints: SCurveDataPoint[];
}

interface PortfolioProject {
  id: string;
  projectCode: string;
  name: string;
  clientName: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number;
  spi: number;
  eac: number;
  actualProgress: number;
  plannedProgress: number;
  status: "HEALTHY" | "NEEDS_ATTENTION" | "CRITICAL";
}

interface ExecutiveSummary {
  totalProjects: number;
  totalPortfolioBAC: number;
  totalPortfolioEV: number;
  totalPortfolioAC: number;
  portfolioCPI: number;
  portfolioSPI: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  projects: PortfolioProject[];
}

export default function AnalyticsPage() {
  const [selectedProject, setSelectedProject] = useState<string>("PRJ-2026-LRT");
  const [evmData, setEvmData] = useState<EVMMetrics | null>(null);
  const [scurveData, setScurveData] = useState<SCurveData | null>(null);
  const [summaryData, setSummaryData] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<SCurveDataPoint | null>(null);

  useEffect(() => {
    loadAllAnalytics(selectedProject);
  }, [selectedProject]);

  const loadAllAnalytics = async (projCode: string) => {
    setLoading(true);
    try {
      const [sumRes, evmRes, scRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/analytics/executive-summary"),
        fetch(`http://localhost:4000/api/v1/analytics/evm/${projCode}`),
        fetch(`http://localhost:4000/api/v1/analytics/s-curve/${projCode}`),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setSummaryData(sumJson.data);
      }
      if (evmRes.ok) {
        const evmJson = await evmRes.json();
        setEvmData(evmJson.data);
      }
      if (scRes.ok) {
        const scJson = await scRes.json();
        setScurveData(scJson.data);
      }
    } catch (err) {
      console.error("Gagal memuat data analitik:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortBillions = (val: number) => {
    const bill = val / 1000000000;
    return `Rp ${bill.toFixed(2)} M`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sehat (On Track)
          </span>
        );
      case "NEEDS_ATTENTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Perlu Perhatian
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Kritis (Lag/Over)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // SVG S-Curve Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Path generator for S-Curve lines
  const generatePath = (
    points: SCurveDataPoint[],
    key: "plannedCumulativePercentage" | "earnedCumulativePercentage" | "actualCostCumulativePercentage"
  ) => {
    if (!points || points.length === 0) return "";
    const validPoints = points
      .map((p, i) => {
        const val = p[key];
        if (val === null) return null;
        const x = padding.left + (i / (points.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - (val / 100) * innerHeight;
        return { x, y };
      })
      .filter((p): p is { x: number; y: number } => p !== null);

    if (validPoints.length === 0) return "";

    return validPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive Analytics & EVM
            </h1>
            <p className="text-sm text-slate-500">
              Earned Value Management, proyeksi Kurva-S, dan indeks performa biaya & jadwal proyek
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-semibold text-slate-800"
            >
              <option value="PRJ-2026-LRT">PRJ-2026-LRT (Stasiun LRT Dukuh Atas)</option>
              <option value="PRJ-2026-TOL">PRJ-2026-TOL (Tol Patimban Seksi 2)</option>
              <option value="PRJ-2025-HSP">PRJ-2025-HSP (RSUD Regional 8 Lantai)</option>
            </select>
          </div>

          <button
            onClick={() => loadAllAnalytics(selectedProject)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
            title="Refresh Analitik"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Rumus EVM
          </button>
        </div>
      </div>

      {/* 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: BAC */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nilai Kontrak (BAC)</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 block truncate">
              {evmData ? formatShortBillions(evmData.contractValueBAC) : "Rp 45,00 M"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Budget At Completion (Baseline Anggaran Disetujui)
          </p>
        </div>

        {/* KPI 2: Earned Value (EV) */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nilai Hasil (EV / BCWP)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 block truncate">
              {evmData ? formatShortBillions(evmData.earnedValueEV) : "Rp 30,78 M"}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {evmData ? `${evmData.actualProgressPercentage}% Fisik` : "68.4%"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Target Rencana: {evmData ? `${evmData.plannedProgressPercentage}%` : "70.0%"} (PV: {evmData ? formatShortBillions(evmData.plannedValuePV) : "Rp 31,50 M"})
          </p>
        </div>

        {/* KPI 3: CPI & Cost Variance */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cost Performance Index (CPI)</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {evmData ? evmData.cpi : "1.031"}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${(evmData?.cpi || 1) >= 1
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-rose-700 bg-rose-50 border border-rose-200"
                }`}
            >
              {(evmData?.cpi || 1) >= 1 ? "Under Budget" : "Over Budget"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">
              CV: +{evmData ? formatShortBillions(evmData.costVarianceCV) : "Rp 0,93 M"}
            </span>{" "}
            (Biaya Efisien)
          </p>
        </div>

        {/* KPI 4: SPI & Schedule Variance */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Schedule Performance Index (SPI)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {evmData ? evmData.spi : "0.977"}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${(evmData?.spi || 1) >= 1
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-amber-700 bg-amber-50 border border-amber-200"
                }`}
            >
              {(evmData?.spi || 1) >= 1 ? "Ahead Schedule" : "Minor Lag 1.6%"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-amber-600">
              SV: {evmData ? formatShortBillions(evmData.scheduleVarianceSV) : "-Rp 0,72 M"}
            </span>{" "}
            (Deviasi Terkendali)
          </p>
        </div>
      </div>

      {/* S-Curve & EVM Forecasting Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive S-Curve (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kurva-S Progres Fisik & Biaya Kumulatif
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan Kurva Rencana (Planned), Realisasi Fisik (Earned), dan Pengeluaran (Actual Cost)
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-500 rounded-full" />
                <span>Rencana (PV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 rounded-full" />
                <span>Realisasi (EV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-500 rounded-full" />
                <span>Biaya Aktual (AC)</span>
              </div>
            </div>
          </div>

          {/* SVG S-Curve Chart Container */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto block"
            >
              {/* Background horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((pct) => {
                const y = padding.top + innerHeight - (pct / 100) * innerHeight;
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {/* Vertical Cut-off Line (Month 8 / Current Progress) */}
              {scurveData && (
                <g>
                  <line
                    x1={
                      padding.left +
                      ((scurveData.currentMonth - 1) / (scurveData.timelineMonths - 1)) *
                      innerWidth
                    }
                    y1={padding.top}
                    x2={
                      padding.left +
                      ((scurveData.currentMonth - 1) / (scurveData.timelineMonths - 1)) *
                      innerWidth
                    }
                    y2={padding.top + innerHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={
                      padding.left +
                      ((scurveData.currentMonth - 1) / (scurveData.timelineMonths - 1)) *
                      innerWidth
                    }
                    y={padding.top - 6}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Cut-off (Bln 8)
                  </text>
                </g>
              )}

              {/* Month X-axis Labels */}
              {scurveData?.dataPoints.map((dp, i) => {
                const x =
                  padding.left +
                  (i / (scurveData.dataPoints.length - 1)) * innerWidth;
                return (
                  <text
                    key={dp.month}
                    x={x}
                    y={chartHeight - 10}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {dp.label}
                  </text>
                );
              })}

              {/* Planned Line (Blue) */}
              {scurveData && (
                <path
                  d={generatePath(scurveData.dataPoints, "plannedCumulativePercentage")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Earned Value Line (Emerald) */}
              {scurveData && (
                <path
                  d={generatePath(scurveData.dataPoints, "earnedCumulativePercentage")}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Actual Cost Line (Amber) */}
              {scurveData && (
                <path
                  d={generatePath(scurveData.dataPoints, "actualCostCumulativePercentage")}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Point Circles on Earned Line */}
              {scurveData?.dataPoints.map((dp, i) => {
                if (dp.earnedCumulativePercentage === null) return null;
                const x =
                  padding.left +
                  (i / (scurveData.dataPoints.length - 1)) * innerWidth;
                const y =
                  padding.top +
                  innerHeight -
                  (dp.earnedCumulativePercentage / 100) * innerHeight;

                return (
                  <circle
                    key={dp.month}
                    cx={x}
                    cy={y}
                    r={hoveredPoint?.month === dp.month ? "5" : "3.5"}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(dp)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between text-xs text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">
                {hoveredPoint ? `Bulan: ${hoveredPoint.label}` : "Posisi Saat Ini (Bln 8 / Agustus 2026):"}
              </span>
              <span className="ml-2 text-slate-500">
                {hoveredPoint
                  ? `Realisasi: ${hoveredPoint.earnedCumulativePercentage}% | Rencana: ${hoveredPoint.plannedCumulativePercentage}% | Biaya: ${hoveredPoint.actualCostCumulativePercentage}%`
                  : "Realisasi Fisik 68.4% vs Rencana 70.0% vs Pengeluaran Biaya 66.3%"}
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-700 font-bold">
              Deviasi: -1.6% Fisik | +Rp 930 Jt Efisiensi Biaya
            </div>
          </div>
        </div>

        {/* EVM Forecasting & Parameters (1 col) */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Peramalan Akhir Proyek (EVM)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Estimasi total biaya dan performa yang harus dipertahankan hingga serah terima (PHO)
            </p>

            <div className="space-y-3">
              {/* EAC */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Estimate At Completion (EAC)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {evmData ? formatShortBillions(evmData.eac) : "Rp 43,65 M"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-600">
                  Potensi Efisiensi: {evmData ? formatShortBillions(evmData.contractValueBAC - evmData.eac) : "Rp 1,35 M"}
                </p>
              </div>

              {/* ETC */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Estimate To Complete (ETC)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {evmData ? formatShortBillions(evmData.etc) : "Rp 13,80 M"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Sisa anggaran yang dibutuhkan untuk 31.6% pekerjaan sisa
                </p>
              </div>

              {/* TCPI */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    To-Complete Performance Index (TCPI)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {evmData ? evmData.tcpi : "0.938"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Indeks efisiensi kerja yang harus dijaga (&lt; 1.0 = Sangat Feasible)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status Rekomendasi:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Pertahankan Efisiensi & Percepat Lintasan Kritis
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Project Executive Health Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matriks Kesehatan Portofolio Seluruh Proyek
            </h2>
            <p className="text-xs text-slate-500">
              Peringkat indeks efisiensi biaya (CPI) dan deviasi jadwal (SPI) lintas portofolio aktif
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total Proyek Aktif: {summaryData ? summaryData.totalProjects : 3}
          </div>
        </div>

        {/* Card View (< 1280px / xl:hidden) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:hidden">
          {summaryData?.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {proj.projectCode}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{proj.name}</h3>
                  <p className="text-xs text-slate-500">{proj.clientName}</p>
                </div>
                {getStatusBadge(proj.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block">Nilai Kontrak:</span>
                  <span className="font-bold text-slate-900">{formatShortBillions(proj.bac)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Progres Fisik:</span>
                  <span className="font-bold text-slate-900">{proj.actualProgress}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CPI:</span>
                  <span className={`font-bold ${proj.cpi >= 1 ? "text-emerald-700" : "text-rose-700"}`}>
                    {proj.cpi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">SPI:</span>
                  <span className={`font-bold ${proj.spi >= 1 ? "text-emerald-700" : "text-amber-700"}`}>
                    {proj.spi}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Estimasi Selesai (EAC):</span>
                <span className="font-bold text-slate-800 font-mono">{formatShortBillions(proj.eac)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table View (>= 1280px / hidden xl:block) */}
        <div className="hidden xl:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-32">Kode Proyek</th>
                <th className="py-2.5 px-3">Nama Proyek & Klien</th>
                <th className="py-2.5 px-3 w-32 text-right">Nilai Kontrak (BAC)</th>
                <th className="py-2.5 px-3 w-36 text-center">Rencana vs Realisasi</th>
                <th className="py-2.5 px-3 w-32 text-right">Nilai Hasil (EV)</th>
                <th className="py-2.5 px-3 w-32 text-right">Biaya Aktual (AC)</th>
                <th className="py-2.5 px-2 text-center w-20">CPI</th>
                <th className="py-2.5 px-2 text-center w-20">SPI</th>
                <th className="py-2.5 px-3 text-center w-36">Status Kesehatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {summaryData?.projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 text-[11px]">
                    {proj.projectCode}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{proj.name}</div>
                    <div className="text-[10px] text-slate-500">{proj.clientName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                    {formatShortBillions(proj.bac)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-slate-500">{proj.plannedProgress}%</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-bold text-slate-900">{proj.actualProgress}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                    {formatShortBillions(proj.ev)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    {formatShortBillions(proj.ac)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`font-bold font-mono ${proj.cpi >= 1 ? "text-emerald-700" : "text-rose-700"
                        }`}
                    >
                      {proj.cpi}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`font-bold font-mono ${proj.spi >= 1 ? "text-emerald-700" : "text-amber-700"
                        }`}
                    >
                      {proj.spi}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {getStatusBadge(proj.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Rumus & Standar EVM PMI */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Standar Rumus Earned Value Management (EVM)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Project Management Institute (PMI) Standard for Construction
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                Tutup
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-700 block">Planned Value (PV / BCWS) = Rencana % × BAC</span>
                <p className="text-slate-500 mt-0.5">Nilai anggaran yang direncanakan harus tercapai pada titik waktu tertentu.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block">Earned Value (EV / BCWP) = Fisik Aktual % × BAC</span>
                <p className="text-slate-500 mt-0.5">Nilai hasil pekerjaan yang benar-benar telah diselesaikan secara fisik di lapangan.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-amber-700 block">Cost Performance Index (CPI) = EV ÷ AC</span>
                <p className="text-slate-500 mt-0.5">
                  &gt; 1.0 = Pengeluaran di bawah anggaran (Under Budget/Favorable). &lt; 1.0 = Pembengkakan biaya (Over Budget).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-indigo-700 block">Schedule Performance Index (SPI) = EV ÷ PV</span>
                <p className="text-slate-500 mt-0.5">
                  &gt; 1.0 = Lebih cepat dari jadwal (Ahead). &lt; 1.0 = Keterlambatan proyek (Behind schedule).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-purple-700 block">Estimate At Completion (EAC) = BAC ÷ CPI</span>
                <p className="text-slate-500 mt-0.5">
                  Perkiraan total biaya akhir proyek jika tren efisiensi biaya saat ini dipertahankan hingga akhir.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
