"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  X,
  FileCheck2,
  AlertOctagon,
  Award,
  Layers,
  FlaskConical,
  ClipboardList,
  Building2,
  Check,
} from "lucide-react";

interface WIRItem {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  location: string;
  inspectorName: string;
  score: number;
  notes: string;
  actionPlan: string;
  inspectedAt: string;
  project?: { projectCode: string; name: string };
}

interface NCRItem {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  location: string;
  inspectorName: string;
  ncrNumber: string;
  notes: string;
  actionPlan: string;
  inspectedAt: string;
  project?: { projectCode: string; name: string };
}

interface PunchItem {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  location: string;
  inspectorName: string;
  score: number;
  notes: string;
  actionPlan: string;
  inspectedAt: string;
  project?: { projectCode: string; name: string };
}

interface MaterialTestItem {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  location: string;
  inspectorName: string;
  score: number;
  notes: string;
  actionPlan: string;
  inspectedAt: string;
  project?: { projectCode: string; name: string };
}

interface QualitySummary {
  totalInspections: number;
  passedCount: number;
  passRate: number;
  wir: {
    total: number;
    approved: number;
    pending: number;
  };
  ncr: {
    active: number;
    resolved: number;
  };
  punchList: {
    total: number;
    closed: number;
    completionRate: number;
  };
  materialTesting: {
    total: number;
    passed: number;
    complianceRate: number;
  };
  zeroAccidentDays: number;
  safeManHours: number;
  ppeComplianceRate: number;
}

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<"wir" | "ncr" | "punch" | "lab">("wir");
  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [wirList, setWirList] = useState<WIRItem[]>([]);
  const [ncrList, setNcrList] = useState<NCRItem[]>([]);
  const [punchList, setPunchList] = useState<PunchItem[]>([]);
  const [materialTests, setMaterialTests] = useState<MaterialTestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [showWIRModal, setShowWIRModal] = useState<boolean>(false);
  const [showNCRModal, setShowNCRModal] = useState<boolean>(false);
  const [showPunchModal, setShowPunchModal] = useState<boolean>(false);
  const [showLabModal, setShowLabModal] = useState<boolean>(false);

  // Forms
  const [wirForm, setWirForm] = useState({
    projectCode: "PRJ-2026-IKN-PK3",
    title: "Inspeksi Pembesian & Bekisting Balok Lantai 5 Zona Utara",
    location: "Tower Utama Lt 5 Grid D-F",
    inspectorName: "Ahmad Fauzi (QC Civil Inspector)",
    drawingReference: "DWG-STR-BEAM-005 Rev C",
    subcontractorName: "PT Wira Baja Konstruksi",
    notes: "Pemeriksaan jumlah tulangan utama D22, sengkang D10-100, dan kebersihan bekisting.",
  });

  const [ncrForm, setNcrForm] = useState({
    projectCode: "PRJ-2026-IKN-PK3",
    title: "Deviasi Kerataan Plesteran Dinding R. Operasi Melebihi Toleransi RKS",
    location: "Gedung Rawat Inap Lt 3 R. 308",
    severity: "HIGH",
    inspectorName: "Bambang Kusuma, S.T. (QC Lead)",
    notes: "Toleransi kerataan bidang dinding terukur selisih 6mm pada mal jidar 2m (RKS maks 2mm).",
    actionPlan: "Kupas plesteran bergelombang, pasang kepala plesteran ulang dengan laser level jidar aluminium.",
  });

  const [punchForm, setPunchForm] = useState({
    projectCode: "PRJ-2026-IKN-PK3",
    title: "Cat Kusen Pintu Aluminium Baret & Karet Kedap Suara Terlepas",
    location: "Lantai 2 Koridor Ruang Manajemen",
    tradeCategory: "FINISHING_ARSI",
    severity: "LOW",
    subcontractorName: "PT Karya Kusen Mandiri",
    targetCloseDate: "2026-11-28",
    actionPlan: "Lakukan touch-up powder coating dan rekatkan seal karet pintu.",
  });

  const [labForm, setLabForm] = useState({
    projectCode: "PRJ-2026-IKN-PK3",
    materialType: "CONCRETE" as "CONCRETE" | "REBAR_STEEL" | "SOIL_COMPACTION",
    title: "Uji Tekan Beton Silinder fc 35 MPa - Umur 28 Hari (Batch B-11)",
    sampleAgeDays: 28,
    targetStrength: 35.0,
    actualStrength: 39.4,
    slumpValue: 12.0,
    batchNumber: "TM-11/SCM-20261102",
    supplierName: "PT Semen Prima Beton ReadyMix",
    labName: "Laboratorium Bahan Independen ITB",
    notes: "Hasil uji tekan silinder melampaui target desain fc 35 MPa dengan margin keamanan +12.5%.",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, wirRes, ncrRes, punchRes, labRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/quality/summary"),
        fetch("http://localhost:4000/api/v1/quality/wir"),
        fetch("http://localhost:4000/api/v1/quality/ncr"),
        fetch("http://localhost:4000/api/v1/quality/punch-list"),
        fetch("http://localhost:4000/api/v1/quality/material-tests"),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setSummary(sumJson.data || null);
      }
      if (wirRes.ok) {
        const wirJson = await wirRes.json();
        setWirList(wirJson.data || []);
      }
      if (ncrRes.ok) {
        const ncrJson = await ncrRes.json();
        setNcrList(ncrJson.data || []);
      }
      if (punchRes.ok) {
        const punchJson = await punchRes.json();
        setPunchList(punchJson.data || []);
      }
      if (labRes.ok) {
        const labJson = await labRes.json();
        setMaterialTests(labJson.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat data mutu:", e);
      setNotification({ type: "error", message: "Gagal terhubung ke service QA/QC backend." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWIR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/quality/wir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wirForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan WIR");
      setNotification({ type: "success", message: `Sukses! ${data.message} (${data.data.title})` });
      setShowWIRModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleApproveWIR = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/quality/wir/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED_TO_PROCEED",
          approverName: "Ir. Hendra Gunawan (MK)",
          approvalNotes: "Pengecekan fisik dan toleransi dimensi memenuhi syarat RKS. Disetujui izin cor.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyetujui WIR");
      setNotification({ type: "success", message: "WIR resmi disetujui! Izin pelaksanaan pekerjaan dibuka." });
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleCreateNCR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/quality/ncr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ncrForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menerbitkan NCR");
      setNotification({ type: "success", message: `Sukses! ${data.message}` });
      setShowNCRModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleResolveNCR = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/quality/ncr/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolverName: "Bambang Kusuma, S.T. (QC Lead)",
          notes: "Pekerjaan perbaikan telah dibongkar & diplester ulang dengan jidar aluminium. Toleransi terukur < 1.5mm (Lolos).",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menutup NCR");
      setNotification({ type: "success", message: "NCR resmi diverifikasi selesai dan ditutup (Closed)." });
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleCreatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/quality/punch-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(punchForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mencatat punch list");
      setNotification({ type: "success", message: `Sukses! ${data.message}` });
      setShowPunchModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleRectifyPunch = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/quality/punch-list/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "VERIFIED_CLOSED",
          verifiedBy: "Siti Rahma (QC Handover)",
          verificationNotes: "Cacat fisik telah diperbaiki oleh subkon dan diperiksa bersama pengawas.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui status punch list");
      setNotification({ type: "success", message: "Item punch list berhasil diverifikasi ditutup!" });
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleCreateLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/quality/material-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(labForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan hasil uji lab");
      setNotification({ type: "success", message: `Sukses! ${data.message}` });
      setShowLabModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const parseNotes = (notesStr: string) => {
    try {
      return JSON.parse(notesStr);
    } catch {
      return { notes: notesStr };
    }
  };

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
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono">
              MODUL 12 — QA/QC
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              ISO 9001:2015
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              PUNCH LIST & BAST
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pusat Kendali Mutu & Serah Terima (QA/QC)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pengawasan Izin Inspeksi Kerja (WIR), Laporan Ketidaksesuaian (NCR/CAPA), Daftar Cacat Serah Terima (Punch List), dan Uji Bahan Laboratorium.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-refresh-quality"
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            id="btn-open-wir-modal"
            onClick={() => setShowWIRModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan WIR</span>
          </button>
          <button
            id="btn-open-ncr-modal"
            onClick={() => setShowNCRModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Terbitkan NCR</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pass Rate */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tingkat Kelulusan Mutu
            </span>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{summary?.passRate ?? 0}%</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{summary?.passedCount ?? 0} dari {summary?.totalInspections ?? 0} audit lolos</span>
            </div>
          </div>
        </div>

        {/* Card 2: WIR Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Izin Kerja (WIR)
            </span>
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{summary?.wir.approved ?? 0} Disetujui</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-blue-700 font-semibold">{summary?.wir.pending ?? 0} menunggu MK</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active NCRs */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ketidaksesuaian (NCR)
            </span>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{summary?.ncr.active ?? 0} Temuan Aktif</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{summary?.ncr.resolved ?? 0} telah diselesaikan (CAPA)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Punch List Readiness */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kesiapan BAST (Punch List)
            </span>
            <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{summary?.punchList.completionRate ?? 0}% Selesai</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{summary?.punchList.closed ?? 0} dari {summary?.punchList.total ?? 0} defect ditutup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-2 sm:gap-6 pb-px" aria-label="Tabs QA/QC">
          <button
            id="tab-btn-wir"
            onClick={() => setActiveTab("wir")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "wir"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Izin Inspeksi Kerja (WIR)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {wirList.length}
            </span>
          </button>

          <button
            id="tab-btn-ncr"
            onClick={() => setActiveTab("ncr")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "ncr"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Laporan Ketidaksesuaian (NCR)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {ncrList.length}
            </span>
          </button>

          <button
            id="tab-btn-punch"
            onClick={() => setActiveTab("punch")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "punch"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Daftar Cacat & Punch List</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {punchList.length}
            </span>
          </button>

          <button
            id="tab-btn-lab"
            onClick={() => setActiveTab("lab")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "lab"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Uji Mutu Laboratorium (Beton & Baja)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {materialTests.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: WIR LIST */}
      {activeTab === "wir" && (
        <div id="tab-content-wir" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="heading-wir" className="text-base font-bold text-slate-900">
                Izin Inspeksi Kerja & Request For Inspection (WIR)
              </h2>
              <p className="text-xs text-slate-500">
                Pengawasan izin pelaksanaan sebelum pengecoran beton, penutupan plafon MEP, dan pekerjaan struktur utama.
              </p>
            </div>
            <button
              id="btn-trigger-add-wir"
              onClick={() => setShowWIRModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pengajuan WIR Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nomor & Judul WIR</th>
                    <th className="py-3 px-4">Lokasi Pekerjaan</th>
                    <th className="py-3 px-4">Gambar Acuan / Subkon</th>
                    <th className="py-3 px-4">Inspektor QC</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi MK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wirList.map((item) => {
                    const parsed = parseNotes(item.notes);
                    const isApproved = item.status === "APPROVED_TO_PROCEED";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {new Date(item.inspectedAt).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.location}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-blue-700 font-semibold">{parsed.drawingReference || "-"}</div>
                          <div className="text-[11px] text-slate-500">{parsed.subcontractorName || "-"}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.inspectorName}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isApproved ? "DISETUJUI COR" : "MENUNGGU VERIFIKASI"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApproveWIR(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui Izin</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">Closed & Verified</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {wirList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada data Izin Inspeksi Kerja (WIR) tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NCR LIST */}
      {activeTab === "ncr" && (
        <div id="tab-content-ncr" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="heading-ncr" className="text-base font-bold text-slate-900">
                Log Laporan Ketidaksesuaian Mutu & CAPA (NCR)
              </h2>
              <p className="text-xs text-slate-500">
                Pencatatan deviasi mutu fisik kritis, rencana tindakan perbaikan (Corrective Action), dan verifikasi sign-off penutupan.
              </p>
            </div>
            <button
              id="btn-trigger-add-ncr"
              onClick={() => setShowNCRModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Terbitkan NCR Resmi</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">No. Registrasi & Uraian Cacat</th>
                    <th className="py-3 px-4">Lokasi Fisik</th>
                    <th className="py-3 px-4 text-center">Tingkat Risiko</th>
                    <th className="py-3 px-4">Tindakan Korektif (CAPA)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Verifikasi Penutupan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ncrList.map((item) => {
                    const isClosed = item.status === "RESOLVED" || item.status === "CLOSED";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {item.ncrNumber || "NCR-NEW"}
                          </span>
                          <div className="font-semibold text-slate-900 mt-1">{item.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Auditor: {item.inspectorName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.location}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : item.severity === "HIGH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.actionPlan || item.notes}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isClosed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800 animate-pulse"
                            }`}
                          >
                            {isClosed ? "CLOSED & SIGNED" : "AKTIF (OPEN)"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isClosed ? (
                            <button
                              onClick={() => handleResolveNCR(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Tutup NCR</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">Terverifikasi Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {ncrList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Tidak ada laporan ketidaksesuaian (NCR) aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUNCH LIST */}
      {activeTab === "punch" && (
        <div id="tab-content-punch" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="heading-punch" className="text-base font-bold text-slate-900">
                Digital Punch List & Handover Defect Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Daftar perbaikan cacat fisik menjelang BAST 1 (PHO) dan BAST 2 (FHO) serah terima proyek.
              </p>
            </div>
            <button
              id="btn-trigger-add-punch"
              onClick={() => setShowPunchModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Punch Item Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Deskripsi Temuan Cacat</th>
                    <th className="py-3 px-4">Ruangan / Zona</th>
                    <th className="py-3 px-4">Disiplin / Subkon</th>
                    <th className="py-3 px-4">Target Close</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {punchList.map((item) => {
                    const parsed = parseNotes(item.notes);
                    const isRectified = item.status === "VERIFIED_CLOSED" || item.status === "RECTIFIED";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.title}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.location}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-purple-700 font-semibold">{parsed.tradeCategory || "ARSI"}</span>
                          <div className="text-[11px] text-slate-500">{parsed.subcontractorName || "-"}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{parsed.targetCloseDate || "2026-11-30"}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isRectified
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isRectified ? "RECTIFIED & CLOSED" : item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isRectified ? (
                            <button
                              onClick={() => handleRectifyPunch(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Tandai Selesai</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">Verified OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {punchList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada item punch list tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATERIAL TESTING */}
      {activeTab === "lab" && (
        <div id="tab-content-lab" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="heading-lab" className="text-base font-bold text-slate-900">
                Log Uji Mutu Bahan Konstruksi Independen (Laboratorium)
              </h2>
              <p className="text-xs text-slate-500">
                Pengujian kuat tekan beton (fc'), slump test ready-mix, dan uji kuat tarik/leleh baja tulangan (SNI 2052 / SNI 2847).
              </p>
            </div>
            <button
              id="btn-trigger-add-lab"
              onClick={() => setShowLabModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Hasil Uji Lab</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Pengujian Material</th>
                    <th className="py-3 px-4">Target Desain</th>
                    <th className="py-3 px-4">Kuat Aktual Lab</th>
                    <th className="py-3 px-4">Batch / Suplier</th>
                    <th className="py-3 px-4">Laboratorium Penguji</th>
                    <th className="py-3 px-4 text-center">Status Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materialTests.map((item) => {
                    const parsed = parseNotes(item.notes);
                    const isPassed = item.status === "PASSED";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Tipe: <span className="font-mono text-emerald-800 font-semibold">{parsed.materialType}</span>
                            {parsed.sampleAgeDays ? ` (Umur ${parsed.sampleAgeDays} hari)` : ""}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {parsed.targetStrength} {parsed.materialType === "CONCRETE" ? "MPa" : "MPa"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {parsed.actualStrength} {parsed.materialType === "CONCRETE" ? "MPa" : "MPa"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-700">{parsed.batchNumber || "-"}</div>
                          <div className="text-[11px] text-slate-500">{parsed.supplierName || "-"}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.location}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isPassed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isPassed ? "LOLOS SPESIFIKASI" : "GAGAL UJI (REJECT)"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {materialTests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada rekaman uji bahan laboratorium.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: WIR CREATION */}
      {showWIRModal && (
        <div id="modal-wir" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-wir-title" className="font-bold text-slate-900 text-base">
                Pengajuan Izin Inspeksi Kerja (WIR) Baru
              </h3>
              <button
                id="btn-close-wir"
                onClick={() => setShowWIRModal(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWIR} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Inspeksi Kerja</label>
                <input
                  type="text"
                  required
                  value={wirForm.title}
                  onChange={(e) => setWirForm({ ...wirForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Fisik</label>
                  <input
                    type="text"
                    required
                    value={wirForm.location}
                    onChange={(e) => setWirForm({ ...wirForm, location: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Gambar RKS</label>
                  <input
                    type="text"
                    value={wirForm.drawingReference}
                    onChange={(e) => setWirForm({ ...wirForm, drawingReference: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subkontraktor / Mandor</label>
                  <input
                    type="text"
                    value={wirForm.subcontractorName}
                    onChange={(e) => setWirForm({ ...wirForm, subcontractorName: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Inspector QC</label>
                  <input
                    type="text"
                    required
                    value={wirForm.inspectorName}
                    onChange={(e) => setWirForm({ ...wirForm, inspectorName: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Lingkup Pekerjaan</label>
                <textarea
                  rows={2}
                  value={wirForm.notes}
                  onChange={(e) => setWirForm({ ...wirForm, notes: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-wir"
                  type="button"
                  onClick={() => setShowWIRModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-wir"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-sm"
                >
                  Ajukan WIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NCR CREATION */}
      {showNCRModal && (
        <div id="modal-ncr" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-ncr-title" className="font-bold text-slate-900 text-base">
                Penerbitan Non-Conformance Report (NCR) Resmi
              </h3>
              <button
                id="btn-close-ncr"
                onClick={() => setShowNCRModal(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNCR} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ketidaksesuaian Mutu</label>
                <input
                  type="text"
                  required
                  value={ncrForm.title}
                  onChange={(e) => setNcrForm({ ...ncrForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Fisik</label>
                  <input
                    type="text"
                    required
                    value={ncrForm.location}
                    onChange={(e) => setNcrForm({ ...ncrForm, location: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Risiko</label>
                  <select
                    value={ncrForm.severity}
                    onChange={(e) => setNcrForm({ ...ncrForm, severity: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 bg-white"
                  >
                    <option value="CRITICAL">CRITICAL (Struktur / Beban)</option>
                    <option value="HIGH">HIGH (Arsitektur Utama)</option>
                    <option value="MEDIUM">MEDIUM (Finishing Lokal)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Detail Temuan Deviasi</label>
                <textarea
                  rows={2}
                  required
                  value={ncrForm.notes}
                  onChange={(e) => setNcrForm({ ...ncrForm, notes: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Tindakan Korektif (CAPA)</label>
                <textarea
                  rows={2}
                  required
                  value={ncrForm.actionPlan}
                  onChange={(e) => setNcrForm({ ...ncrForm, actionPlan: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-ncr"
                  type="button"
                  onClick={() => setShowNCRModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-ncr"
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold shadow-sm"
                >
                  Terbitkan Surat NCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PUNCH LIST CREATION */}
      {showPunchModal && (
        <div id="modal-punch" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-punch-title" className="font-bold text-slate-900 text-base">
                Pencatatan Defect & Punch List Serah Terima
              </h3>
              <button
                id="btn-close-punch"
                onClick={() => setShowPunchModal(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePunch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Temuan Cacat</label>
                <input
                  type="text"
                  required
                  value={punchForm.title}
                  onChange={(e) => setPunchForm({ ...punchForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan / Lokasi</label>
                  <input
                    type="text"
                    required
                    value={punchForm.location}
                    onChange={(e) => setPunchForm({ ...punchForm, location: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disiplin Pekerjaan</label>
                  <select
                    value={punchForm.tradeCategory}
                    onChange={(e) => setPunchForm({ ...punchForm, tradeCategory: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 bg-white"
                  >
                    <option value="FINISHING_ARSI">Finishing & Arsitektur</option>
                    <option value="MEP">Mekanikal & Elektrikal (MEP)</option>
                    <option value="STRUKTUR">Struktur Sipil</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subkon Bertanggung Jawab</label>
                  <input
                    type="text"
                    required
                    value={punchForm.subcontractorName}
                    onChange={(e) => setPunchForm({ ...punchForm, subcontractorName: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={punchForm.targetCloseDate}
                    onChange={(e) => setPunchForm({ ...punchForm, targetCloseDate: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Perbaikan</label>
                <textarea
                  rows={2}
                  value={punchForm.actionPlan}
                  onChange={(e) => setPunchForm({ ...punchForm, actionPlan: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-punch"
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-punch"
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold shadow-sm"
                >
                  Catat Punch Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MATERIAL TESTING CREATION */}
      {showLabModal && (
        <div id="modal-lab" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-lab-title" className="font-bold text-slate-900 text-base">
                Input Hasil Uji Mutu Bahan Konstruksi (Lab)
              </h3>
              <button
                id="btn-close-lab"
                onClick={() => setShowLabModal(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLabTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengujian Laboratorium</label>
                <input
                  type="text"
                  required
                  value={labForm.title}
                  onChange={(e) => setLabForm({ ...labForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Material</label>
                  <select
                    value={labForm.materialType}
                    onChange={(e: any) => setLabForm({ ...labForm, materialType: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 bg-white"
                  >
                    <option value="CONCRETE">Beton Ready-Mix</option>
                    <option value="REBAR_STEEL">Baja Tulangan Ulir</option>
                    <option value="SOIL_COMPACTION">Kepadatan Tanah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Umur Sampel (Hari)</label>
                  <input
                    type="number"
                    value={labForm.sampleAgeDays}
                    onChange={(e) => setLabForm({ ...labForm, sampleAgeDays: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Desain (MPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={labForm.targetStrength}
                    onChange={(e) => setLabForm({ ...labForm, targetStrength: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hasil Aktual Lab (MPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={labForm.actualStrength}
                    onChange={(e) => setLabForm({ ...labForm, actualStrength: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch / Delivery No.</label>
                  <input
                    type="text"
                    required
                    value={labForm.batchNumber}
                    onChange={(e) => setLabForm({ ...labForm, batchNumber: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Laboratorium</label>
                  <input
                    type="text"
                    required
                    value={labForm.labName}
                    onChange={(e) => setLabForm({ ...labForm, labName: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-lab"
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-lab"
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-sm"
                >
                  Simpan Hasil Uji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
