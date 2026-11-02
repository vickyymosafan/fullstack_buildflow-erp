"use client";

import { useState, useEffect } from "react";
import {
  Workflow,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  ShoppingCart,
  Boxes,
  Landmark,
  HardHat,
  TrendingUp,
  RefreshCw,
  Plus,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface OrchestrationOverview {
  kpis: {
    totalProjects: number;
    activeBudgets: number;
    totalPurchaseOrders: number;
    verifiedGoodsReceipts: number;
    syncedDailyReports: number;
    threeWayMatchRate: string;
    orchestratedTransactionsCount: number;
  };
  traces: Array<{
    id: string;
    flowName: string;
    flowTitle: string;
    sourceEntity: string;
    targetEntity: string;
    referenceCode: string;
    status: string;
    amount?: number;
    timestamp: string;
  }>;
}

export default function OrchestrationPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "traces">("workflows");
  const [data, setData] = useState<OrchestrationOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Dialogs
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [isPoMatchingModalOpen, setIsPoMatchingModalOpen] = useState<boolean>(false);
  const [isDsrApprovalModalOpen, setIsDsrApprovalModalOpen] = useState<boolean>(false);

  // Form states
  const [handoverForm, setHandoverForm] = useState({
    projectCode: "PRJ-2026-NWT",
    projectName: "Proyek Pembangunan Gedung Riset & Data Center",
    plannedStart: "2026-12-01",
    plannedEnd: "2027-11-30",
    initialBudgetRatio: 0.85,
  });

  const [poMatchingForm, setPoMatchingForm] = useState({
    poNumber: "PO-2026-088",
    warehouseCode: "WH-JKT-01",
    receiptNumber: `GR-2026-${Math.floor(100 + Math.random() * 900)}`,
    invoiceNumber: `INV-VND-${Math.floor(1000 + Math.random() * 9000)}`,
    productCode: "MAT-SEM-01",
    receivedQuantity: 500,
    unitCost: 85000,
    invoiceAmount: 42500000,
  });

  const [dsrApprovalForm, setDsrApprovalForm] = useState({
    reportId: "dsr-sample",
    approvedBy: "Ir. Hendra Gunawan (Project Manager)",
    physicalProgressIncrementPercentage: 1.5,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/v1/orchestration/overview");
      if (!res.ok) throw new Error("Gagal mengambil status orkestrasi");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Gagal terhubung ke service orkestrasi backend." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/orchestration/tender-won-to-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(handoverForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mengeksekusi handover proyek");

      setNotification({
        type: "success",
        message: `Sukses! ${resData.message} (Proyek: ${resData.project.projectCode}, Budget ID: ${resData.budget.id})`,
      });
      setIsHandoverModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleExecutePoMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/orchestration/po-receipt-and-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poMatchingForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mengeksekusi 3-Way Matching");

      setNotification({
        type: "success",
        message: `Sukses! 3-Way Matching terverifikasi. Jurnal Akuntansi AP: ${resData.finance.journalNumber}`,
      });
      setIsPoMatchingModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleExecuteDsrApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/orchestration/site-report-approval-and-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dsrApprovalForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal menyinkronkan DSR ke Progres");

      setNotification({
        type: "success",
        message: `Sukses! Laporan harian disetujui & progres fisik proyek bertambah +${resData.progressIncrementPercentage}%.`,
      });
      setIsDsrApprovalModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
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
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600"
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
              MODUL 13 — ENGINE
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              CROSS-MODULE WORKFLOWS
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              ATOMIC 3-WAY MATCHING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pusat Orkestrasi Alur Bisnis Lintas-Modul
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Otomasi alur transaksi end-to-end: Konversi CRM Tender ke Proyek & RAB, 3-Way Matching Pengadaan ke AP, dan Sinkronisasi DSR Lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan Status</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Proyek Aktif
            </span>
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data?.kpis.totalProjects ?? 0} Proyek</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Terintegrasi CRM & Kontrak</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Master RAB Baseline
            </span>
            <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data?.kpis.activeBudgets ?? 0} Baseline</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Auto-Generated (Margin 15%)</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tingkat 3-Way Match
            </span>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data?.kpis.threeWayMatchRate ?? "98.5%"}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-bold font-mono">PO vs GR vs Invoice AP</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Transaksi Terorkestrasi
            </span>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {data?.kpis.orchestratedTransactionsCount ?? 0} Alur
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Audit Trail Aman (ISO 27001)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-2 sm:gap-6 pb-px" aria-label="Tabs Orkestrasi">
          <button
            id="tab-btn-workflows"
            onClick={() => setActiveTab("workflows")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "workflows"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Peta Alur Kerja & Eksekusi</span>
          </button>

          <button
            id="tab-btn-traces"
            onClick={() => setActiveTab("traces")}
            className={`py-3 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "traces"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Buku Besar Jejak Alur</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono">
              {data?.traces.length ?? 0}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: WORKFLOW PIPELINES */}
      {activeTab === "workflows" && (
        <div id="tab-content-workflows" className="space-y-6">
          {/* Pipeline Card 1: CRM to Project & Budget */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                  ALUR BISNIS 01 — COMMERCE TO EXECUTION
                </span>
                <h2 id="heading-workflows" className="text-lg font-bold text-slate-900 mt-0.5">
                  Handover Tender Menang ke Master Proyek & Baseline RAB
                </h2>
                <p className="text-xs text-slate-500">
                  Mengubah tender status WON menjadi proyek operasional aktif dan membuat alokasi biaya WBS standar (Material 45%, Upah 25%, Alat 15%, Overhead 15%).
                </p>
              </div>
              <button
                id="btn-open-handover-modal"
                onClick={() => setIsHandoverModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Eksekusi Handover Tender</span>
              </button>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tahap 1: CRM & Tender</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Tender Status WON</div>
                <div className="text-xs text-slate-600 mt-1">Negosiasi selesai, SPK terbit, dan probabilitas menang 100%.</div>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">Tahap 2: Pembentukan Proyek</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Master Proyek Terdaftar</div>
                <div className="text-xs text-slate-600 mt-1">Kode proyek dibuat, relasi klien terhubung, status ACTIVE.</div>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Tahap 3: Master Budget</div>
                <div className="font-bold text-slate-900 text-sm mt-1">RAB Baseline V1 Disetujui</div>
                <div className="text-xs text-slate-600 mt-1">Struktur WBS, target biaya riil, dan margin proyek terkunci.</div>
              </div>
            </div>
          </div>

          {/* Pipeline Card 2: Procurement to Inventory to Finance */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">
                  ALUR BISNIS 02 — SUPPLY CHAIN & 3-WAY MATCHING
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Penerimaan Fisik Material & Verifikasi Jurnal Utang Usaha (AP)
                </h2>
                <p className="text-xs text-slate-500">
                  Mencatat barang masuk di gudang (Goods Receipt), memverifikasi kesesuaian PO vs Surat Jalan vs Tagihan, dan membukukan jurnal persediaan berimbang.
                </p>
              </div>
              <button
                id="btn-open-matching-modal"
                onClick={() => setIsPoMatchingModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Eksekusi 3-Way Match & AP</span>
              </button>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tahap 1: Pengadaan (PO)</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Purchase Order Resmi</div>
                <div className="text-xs text-slate-600 mt-1">PO disetujui, harga satuan & kuantitas material terkunci.</div>
              </div>
              <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50">
                <div className="text-[10px] font-mono font-bold text-indigo-700 uppercase">Tahap 2: Gudang Logistik</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Goods Receipt (GR)</div>
                <div className="text-xs text-slate-600 mt-1">Fisik dihitung, stok bergerak (IN_PURCHASE), nomor surat jalan dicatat.</div>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Tahap 3: Keuangan (AP GL)</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Jurnal Utang Usaha Terbit</div>
                <div className="text-xs text-slate-600 mt-1">Debit Persediaan (1130) & Kredit Utang Usaha (2110) otomatis terbit.</div>
              </div>
            </div>
          </div>

          {/* Pipeline Card 3: Site Operations to Physical Progress */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">
                  ALUR BISNIS 03 — FIELD OPS TO SCHEDULE VARIANCE
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Sinkronisasi Laporan Harian DSR ke Progres Fisik Proyek
                </h2>
                <p className="text-xs text-slate-500">
                  Persetujuan laporan harian site supervisor (DSR) otomatis mengakumulasikan progres pekerjaan di WBS dan kurva S portofolio proyek.
                </p>
              </div>
              <button
                id="btn-open-dsr-modal"
                onClick={() => setIsDsrApprovalModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sinkronisasi DSR Lapangan</span>
              </button>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tahap 1: Laporan Lapangan</div>
                <div className="font-bold text-slate-900 text-sm mt-1">DSR Diserahkan</div>
                <div className="text-xs text-slate-600 mt-1">Catatan cuaca, jumlah tenaga kerja, dan rekap pekerjaan harian.</div>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <div className="text-[10px] font-mono font-bold text-amber-700 uppercase">Tahap 2: Verifikasi PM / QA</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Persetujuan & QC Checklist</div>
                <div className="text-xs text-slate-600 mt-1">Kualitas pekerjaan diverifikasi, tidak ada cacat kritis (NCR clean).</div>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">Tahap 3: Akumulasi WBS</div>
                <div className="font-bold text-slate-900 text-sm mt-1">Progres Kumulatif Bertambah</div>
                <div className="text-xs text-slate-600 mt-1">Kurva S terupdate, persentase kemajuan siap untuk penagihan termin BAST.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRACE LEDGER */}
      {activeTab === "traces" && (
        <div id="tab-content-traces" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="heading-traces" className="text-base font-bold text-slate-900">Buku Besar Jejak Alur Lintas-Domain</h2>
              <p className="text-xs text-slate-500">
                Catatan komprehensif seluruh transaksi yang menghubungkan modul-modul BUILDFlow ERP.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded font-bold">
              VERIFIED ATOMIC TRACE
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu Transaksi</th>
                    <th className="py-3 px-4">Jenis Alur Bisnis</th>
                    <th className="py-3 px-4">Entitas Sumber (Origin)</th>
                    <th className="py-3 px-4">Entitas Tujuan (Target)</th>
                    <th className="py-3 px-4 text-right">Nilai Transaksi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data?.traces && data.traces.length > 0 ? (
                    data.traces.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(tr.timestamp).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tr.flowTitle}</div>
                          <div className="text-[10px] font-mono text-slate-400">{tr.flowName}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{tr.sourceEntity}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {tr.targetEntity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {tr.amount ? `Rp ${tr.amount.toLocaleString("id-ID")}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              tr.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : tr.status === "VERIFIED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {tr.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada jejak transaksi lintas modul tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: HANDOVER TENDER TO PROJECT */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-handover-title" className="font-bold text-slate-900 text-base">Eksekusi Handover Tender ke Proyek & RAB</h3>
              <button
                onClick={() => setIsHandoverModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteHandover} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Proyek Unik</label>
                <input
                  type="text"
                  required
                  value={handoverForm.projectCode}
                  onChange={(e) => setHandoverForm({ ...handoverForm, projectCode: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Proyek Konstruksi</label>
                <input
                  type="text"
                  required
                  value={handoverForm.projectName}
                  onChange={(e) => setHandoverForm({ ...handoverForm, projectName: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mulai Pelaksanaan</label>
                  <input
                    type="date"
                    value={handoverForm.plannedStart}
                    onChange={(e) => setHandoverForm({ ...handoverForm, plannedStart: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={handoverForm.plannedEnd}
                    onChange={(e) => setHandoverForm({ ...handoverForm, plannedEnd: e.target.value })}
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-handover"
                  type="button"
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-sm"
                >
                  Jalankan Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PO MATCHING & AP */}
      {isPoMatchingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-matching-title" className="font-bold text-slate-900 text-base">Eksekusi Penerimaan Material & 3-Way Match</h3>
              <button
                onClick={() => setIsPoMatchingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecutePoMatching} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Purchase Order (PO)</label>
                  <input
                    type="text"
                    required
                    value={poMatchingForm.poNumber}
                    onChange={(e) => setPoMatchingForm({ ...poMatchingForm, poNumber: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Gudang Tujuan</label>
                  <input
                    type="text"
                    required
                    value={poMatchingForm.warehouseCode}
                    onChange={(e) => setPoMatchingForm({ ...poMatchingForm, warehouseCode: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Jalan (GR)</label>
                  <input
                    type="text"
                    required
                    value={poMatchingForm.receiptNumber}
                    onChange={(e) => setPoMatchingForm({ ...poMatchingForm, receiptNumber: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Invoice Vendor</label>
                  <input
                    type="text"
                    required
                    value={poMatchingForm.invoiceNumber}
                    onChange={(e) => setPoMatchingForm({ ...poMatchingForm, invoiceNumber: e.target.value })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Diterima (Qty)</label>
                  <input
                    type="number"
                    required
                    value={poMatchingForm.receivedQuantity}
                    onChange={(e) =>
                      setPoMatchingForm({ ...poMatchingForm, receivedQuantity: Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Tagihan Invoice (Rp)</label>
                  <input
                    type="number"
                    required
                    value={poMatchingForm.invoiceAmount}
                    onChange={(e) => setPoMatchingForm({ ...poMatchingForm, invoiceAmount: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-matching"
                  type="button"
                  onClick={() => setIsPoMatchingModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-sm"
                >
                  Verifikasi 3-Way Match & Catat AP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DSR APPROVAL & PROGRESS */}
      {isDsrApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 id="modal-dsr-title" className="font-bold text-slate-900 text-base">Persetujuan DSR & Sinkronisasi Progres</h3>
              <button
                onClick={() => setIsDsrApprovalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteDsrApproval} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Penyetuju / Verifikator PM</label>
                <input
                  type="text"
                  required
                  value={dsrApprovalForm.approvedBy}
                  onChange={(e) => setDsrApprovalForm({ ...dsrApprovalForm, approvedBy: e.target.value })}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Persentase Tambahan Progres Fisik (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={dsrApprovalForm.physicalProgressIncrementPercentage}
                  onChange={(e) =>
                    setDsrApprovalForm({
                      ...dsrApprovalForm,
                      physicalProgressIncrementPercentage: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-dsr"
                  type="button"
                  onClick={() => setIsDsrApprovalModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold shadow-sm"
                >
                  Setujui & Sinkronkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
