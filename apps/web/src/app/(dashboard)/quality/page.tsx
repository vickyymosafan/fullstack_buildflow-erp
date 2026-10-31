"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HardHat,
  Clock,
  Search,
  Filter,
  Plus,
  RotateCcw,
  X,
  FileSpreadsheet,
  AlertOctagon,
  Award,
} from "lucide-react";

interface InspectionItem {
  id: string;
  projectCode: string;
  projectName: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  location: string;
  inspectorName: string;
  score: number;
  notes?: string;
  ncrNumber?: string;
  actionPlan?: string;
  inspectedAt: string;
}

interface QualitySummary {
  totalInspections: number;
  passedCount: number;
  activeNcrs: number;
  criticalCount: number;
  passRate: number;
  zeroAccidentDays: number;
  safeManHours: number;
  ppeComplianceRate: number;
}

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<"inspections" | "ncr" | "k3">("inspections");
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for NCR
  const [ncrTitle, setNcrTitle] = useState<string>("");
  const [ncrLocation, setNcrLocation] = useState<string>("");
  const [ncrSeverity, setNcrSeverity] = useState<string>("HIGH");
  const [ncrInspector, setNcrInspector] = useState<string>("Bambang Kusuma, S.T. (QC Lead)");
  const [ncrNotes, setNcrNotes] = useState<string>("");
  const [ncrActionPlan, setNcrActionPlan] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, inspRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/quality/summary"),
        fetch("http://localhost:4000/api/v1/quality/inspections?limit=50"),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setSummary(sumJson.data || null);
      }
      if (inspRes.ok) {
        const inspJson = await inspRes.json();
        setInspections(inspJson.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat data mutu & K3:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        projectCode: "PRJ-2026-LRT",
        title: ncrTitle,
        location: ncrLocation,
        severity: ncrSeverity,
        inspectorName: ncrInspector,
        notes: ncrNotes,
        actionPlan: ncrActionPlan,
      };

      const res = await fetch("http://localhost:4000/api/v1/quality/ncr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setSuccessMsg(
          json.message || "Laporan Ketidaksesuaian (NCR) resmi berhasil diterbitkan."
        );
        setShowModal(false);
        setNcrTitle("");
        setNcrLocation("");
        setNcrNotes("");
        setNcrActionPlan("");
        await loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errJson = await res.json();
        alert(`Gagal menerbitkan NCR: ${errJson.message || "Periksa data input"}`);
      }
    } catch (e) {
      alert("Terjadi kendala jaringan saat menerbitkan NCR");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Inspections
  const filteredInspections = inspections.filter((i) => {
    const matchesCat =
      selectedCategory === "ALL" || i.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "ALL" || i.status === selectedStatus;
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.ncrNumber && i.ncrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  // NCR Only List
  const ncrList = inspections.filter((i) => i.ncrNumber || i.status === "NCR_ISSUED");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] tracking-tight">
              Quality & Safety Management (K3 / HSE & QC)
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-emerald-200">
              ISO 9001 / ISO 45001
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengawasan Mutu Konstruksi, Checklist Inspeksi Lapangan, Laporan Ketidaksesuaian (NCR), dan Keselamatan Kerja
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-lg transition-colors shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terbitkan NCR Baru</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tingkat Kelulusan QC
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {summary ? `${summary.passRate}%` : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary ? `${summary.passedCount} dari ${summary.totalInspections} inspeksi lolos uji` : "..."}
          </div>
        </div>

        {/* Card 2: Zero Accident */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Status Zero Accident
            </span>
            <Award className="w-4 h-4 text-[#2F6B9A]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D] mt-1 font-mono">
            {summary ? `${summary.zeroAccidentDays} Hari` : "..."}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Nol Insiden Berakibat Hari Kerja Hilang (LTI)
          </div>
        </div>

        {/* Card 3: Safe Man Hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Jam Kerja Selamat (Safe Hours)
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            {summary ? `${summary.safeManHours.toLocaleString("id-ID")} Jam` : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kepatuhan APD: {summary ? `${summary.ppeComplianceRate}%` : "..."}
          </div>
        </div>

        {/* Card 4: Active NCRs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              NCR Aktif / Dalam Tindak Lanjut
            </span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">
            {summary ? `${summary.activeNcrs} Temuan` : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary && summary.criticalCount > 0
              ? `${summary.criticalCount} berkategori risiko tinggi`
              : "Seluruh deviasi terkendali"}
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("inspections")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "inspections"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Audit Mutu & Checklist QC
          </button>
          <button
            onClick={() => setActiveTab("ncr")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "ncr"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Log Ketidaksesuaian (NCR)
          </button>
          <button
            onClick={() => setActiveTab("k3")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "k3"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            K3 & Keselamatan Lapangan
          </button>
        </div>

        {activeTab === "inspections" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[180px]">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="QUALITY_QC">Mutu / QC</option>
                <option value="SAFETY_K3">K3 / Keselamatan</option>
                <option value="ENVIRONMENTAL">Lingkungan</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[160px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="ALL">Semua Status</option>
                <option value="PASSED">Lolos Uji (Passed)</option>
                <option value="NCR_ISSUED">NCR Diterbitkan</option>
                <option value="FAILED">Tidak Lolos (Failed)</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari lokasi, judul, inspektor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2F6B9A] w-48 sm:w-60"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Memuat data audit mutu dan rekaman K3...
        </div>
      ) : activeTab === "inspections" ? (
        /* TAB 1: QC & Inspections List */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View (>= 1280px) */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Aktivitas Inspeksi & Lokasi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Skor Uji</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Inspektor Penguji</th>
                  <th className="py-3 px-4">Catatan Teknis / NCR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada catatan inspeksi yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(item.inspectedAt).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{item.location}</span>
                          <span>•</span>
                          <span className="font-mono text-action font-semibold">{item.projectCode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            item.score >= 90
                              ? "text-emerald-700"
                              : item.score >= 70
                              ? "text-amber-700"
                              : "text-red-700"
                          }
                        >
                          {item.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === "PASSED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "NCR_ISSUED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">
                        {item.inspectorName}
                      </td>
                      <td className="py-3 px-4 text-[11px] max-w-xs">
                        {item.ncrNumber && (
                          <div className="font-mono font-bold text-amber-800 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded inline-block mb-1 border border-amber-200">
                            {item.ncrNumber}
                          </div>
                        )}
                        <div className="text-slate-600 truncate">{item.notes || "-"}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View (< 1280px) */}
          <div className="block xl:hidden p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredInspections.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Tidak ada catatan inspeksi yang sesuai.
              </div>
            ) : (
              filteredInspections.map((item) => (
                <div key={item.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(item.inspectedAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.status === "PASSED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "NCR_ISSUED"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.location} • {item.projectCode}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Skor Kesesuaian:</span>
                    <span className="font-mono font-bold text-slate-800">{item.score}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Inspektor:</span>
                    <span className="text-slate-700">{item.inspectorName}</span>
                  </div>
                  {item.ncrNumber && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded text-[11px] text-amber-900">
                      <span className="font-mono font-bold">{item.ncrNumber}:</span> {item.actionPlan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === "ncr" ? (
        /* TAB 2: NCR Specific Tracking Table & Cards */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nomor NCR</th>
                  <th className="py-3 px-4">Deskripsi Temuan Deviasi</th>
                  <th className="py-3 px-4">Lokasi Fisik</th>
                  <th className="py-3 px-4 text-center">Tingkat Keparahan</th>
                  <th className="py-3 px-4">Rencana Tindakan Korektif (CAP)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ncrList.map((ncr) => (
                  <tr key={ncr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-800">
                      {ncr.ncrNumber || "NCR-DRAFT"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ncr.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{ncr.notes}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{ncr.location}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          ncr.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : ncr.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ncr.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-700 max-w-sm">
                      {ncr.actionPlan || "Menunggu rekomendasi perbaikan dari QC/Site Engineer"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {ncr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block xl:hidden p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {ncrList.map((ncr) => (
              <div key={ncr.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-amber-800">
                    {ncr.ncrNumber || "NCR-DRAFT"}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {ncr.severity}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900">{ncr.title}</div>
                <div className="text-[11px] text-slate-500">{ncr.location}</div>
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800">Rencana Korektif:</span>{" "}
                  {ncr.actionPlan}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAB 3: K3 & Safety Protocols */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3>Golden Rules Keselamatan Proyek</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kepatuhan 100% pada Alat Pelindung Diri (APD/PPE), Surat Izin Kerja Aman (SIKA), izin bekerja di ketinggian (Working at Height Permit), dan isolasi energi LOTO.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Target: <span className="font-bold text-emerald-700">Zero Fatality & Zero LTI</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <HardHat className="w-5 h-5 text-blue-600" />
              <h3>Toolbox Meeting & Safety Induction</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pengarahan bahaya kerja harian setiap pukul 07.45 WIB bersama mandor dan seluruh tukang sebelum memasuki zona elevasi dan gantry crane.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Frekuensi: <span className="font-bold text-blue-700">Harian (100% Mandor Aktif)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5 text-[#2F6B9A]" />
              <h3>Kesiapsiagaan Tanggap Darurat (ERP)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Akses jalur evakuasi bebas rintangan, APAR tipe ABC terinspeksi bulanan, dan pos P3K siaga di dekat mess pekerja dan batching plant.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Status Kesiapan: <span className="font-bold text-emerald-700">Siaga Penuh (Level 1)</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Terbitkan NCR Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Penerbitan Non-Conformance Report (NCR)
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNCR} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Singkat Ketidaksesuaian Mutu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Deviasi Tebal Selimut Beton Pier Head P-13"
                  value={ncrTitle}
                  onChange={(e) => setNcrTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Fisik di Site
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Zona Pier P-13"
                    value={ncrLocation}
                    onChange={(e) => setNcrLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Keparahan
                  </label>
                  <select
                    value={ncrSeverity}
                    onChange={(e) => setNcrSeverity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A] bg-white cursor-pointer"
                  >
                    <option value="MEDIUM">MEDIUM (Dapat Diperbaiki)</option>
                    <option value="HIGH">HIGH (Menahan Progres)</option>
                    <option value="CRITICAL">CRITICAL (Struktural Cacat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auditor / Inspektor Pelapor
                </label>
                <input
                  type="text"
                  required
                  value={ncrInspector}
                  onChange={(e) => setNcrInspector(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detail Temuan & Toleransi yang Dilanggar
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan deviasi teknis terhadap gambar kerja atau RKS..."
                  value={ncrNotes}
                  onChange={(e) => setNcrNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rencana Tindakan Korektif (CAP)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Langkah perbaikan teknis yang harus dieksekusi kontraktor/mandor..."
                  value={ncrActionPlan}
                  onChange={(e) => setNcrActionPlan(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6B9A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Menerbitkan..." : "Terbitkan NCR Resmi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
