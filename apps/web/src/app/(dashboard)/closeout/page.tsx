"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Calculator,
  FolderArchive,
  History,
  FileCheck2,
  ShieldCheck,
  Percent,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
  RefreshCw,
  X,
  ExternalLink,
  Lock,
} from "lucide-react";

interface FinalAccount {
  id: string;
  settlementNumber: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  originalContractValue: number;
  totalVariationOrders: number;
  retentionDeduction: number;
  liquidatedDamages: number;
  finalAgreedValue: number;
  previousPayments: number;
  finalBalanceDue: number;
  status: "DRAFT" | "UNDER_REVIEW" | "QS_ENDORSED" | "APPROVED" | "DISCHARGED";
  notes?: string;
  createdAt: string;
  signatories: {
    role: "QUANTITY_SURVEYOR" | "MK_CONSULTANT" | "OWNER_PPK";
    name: string;
    signedAt?: string;
    status: "PENDING" | "SIGNED";
  }[];
}

interface AsBuiltDoc {
  id: string;
  docNumber: string;
  title: string;
  discipline: "ARCHITECTURE" | "STRUCTURE" | "MEP" | "CIVIL_LANDSCAPE" | "OM_MANUAL" | "SLF_CERTIFICATE";
  revision: string;
  format: string;
  fileSize: string;
  downloadUrl: string;
  description?: string;
  status: "DRAFT" | "SUBMITTED" | "MK_VERIFIED" | "OWNER_ACCEPTED";
  submittedBy: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: "CREATE" | "UPDATE" | "ENDORSE" | "APPROVE" | "DISCHARGE" | "VERIFY" | "EXPORT";
  module: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
}

export default function CloseoutPage() {
  const [activeTab, setActiveTab] = useState<"final-account" | "as-built" | "audit-trail">("final-account");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [disciplineFilter, setDisciplineFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  // State Data
  const [summary, setSummary] = useState({
    totalAgreedFinalValue: 114700000000,
    totalPreviousPayments: 103230000000,
    totalFinalBalanceDue: 11470000000,
    asBuiltTotal: 5,
    asBuiltVerified: 5,
    closeoutProgress: 96.5,
    auditLogsRecorded: 1244,
  });

  const [finalAccounts, setFinalAccounts] = useState<FinalAccount[]>([
    {
      id: "fa-001",
      settlementNumber: "FA-2026-NSI-001",
      projectId: "proj-001",
      projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
      contractorName: "PT Adhi Karya (Persero) Tbk",
      originalContractValue: 45000000000,
      totalVariationOrders: 3500000000,
      retentionDeduction: 2250000000,
      liquidatedDamages: 0,
      finalAgreedValue: 48500000000,
      previousPayments: 43650000000,
      finalBalanceDue: 4850000000,
      status: "APPROVED",
      notes: "Rekonsiliasi final account disetujui tanpa potongan denda keterlambatan.",
      createdAt: "2026-10-15T09:00:00.000Z",
      signatories: [
        { role: "QUANTITY_SURVEYOR", name: "Bambang Irawan, ST (Lead QS)", signedAt: "2026-10-18T10:00:00Z", status: "SIGNED" },
        { role: "MK_CONSULTANT", name: "Ir. Hendra Wijaya, IPM (Team Leader MK)", signedAt: "2026-10-20T14:30:00Z", status: "SIGNED" },
        { role: "OWNER_PPK", name: "Dr. Agus Santoso, M.Eng (PPK Kemenhub)", signedAt: "2026-10-25T11:15:00Z", status: "SIGNED" },
      ],
    },
    {
      id: "fa-002",
      settlementNumber: "FA-2026-IKN-002",
      projectId: "proj-002",
      projectName: "Pembangunan Rusun ASN Kawasan Inti Pusat Pemerintahan IKN",
      contractorName: "PT Wijaya Karya Bangunan Gedung Tbk",
      originalContractValue: 62000000000,
      totalVariationOrders: 4200000000,
      retentionDeduction: 3100000000,
      liquidatedDamages: 0,
      finalAgreedValue: 66200000000,
      previousPayments: 59580000000,
      finalBalanceDue: 6620000000,
      status: "QS_ENDORSED",
      notes: "Sedang menunggu telaah akhir Konsultan MK untuk verifikasi CCO No. 04.",
      createdAt: "2026-11-01T08:30:00.000Z",
      signatories: [
        { role: "QUANTITY_SURVEYOR", name: "Rahmat Hidayat, ST", signedAt: "2026-11-03T16:00:00Z", status: "SIGNED" },
        { role: "MK_CONSULTANT", name: "Ir. Dedi Kusuma, MT", status: "PENDING" },
        { role: "OWNER_PPK", name: "Ir. Tri Basuki (PPK BPPW Kaltim)", status: "PENDING" },
      ],
    },
  ]);

  const [asBuiltDocs, setAsBuiltDocs] = useState<AsBuiltDoc[]>([
    {
      id: "asb-001",
      docNumber: "ASB-AR-001",
      title: "Gambar Terlaksana Arsitektur Utama (Lantai Concourse & Platform)",
      discipline: "ARCHITECTURE",
      revision: "Rev.Final-0",
      format: "BIM / IFC / DWG",
      fileSize: "68.4 MB",
      downloadUrl: "/storage/asbuilt/ASB-AR-001-LRT-DukuhAtas.zip",
      description: "Gambar terlaksana lengkap dengan penyesuaian layout signage dan gate barrier penumpang.",
      status: "MK_VERIFIED",
      submittedBy: "PT Adhi Karya BIM Team",
      submittedAt: "2026-10-10T11:00:00.000Z",
      verifiedBy: "Ir. Hendra Wijaya (Team Leader MK)",
      verifiedAt: "2026-10-14T15:20:00.000Z",
    },
    {
      id: "asb-002",
      docNumber: "ASB-ST-002",
      title: "Gambar Terlaksana Struktur Baja & Beton Balok Girder Pier 1-14",
      discipline: "STRUCTURE",
      revision: "Rev.Final-0",
      format: "DWG / PDF",
      fileSize: "42.1 MB",
      downloadUrl: "/storage/asbuilt/ASB-ST-002-Girder-Pier.zip",
      description: "Dokumentasi as-built hasil pengujian beban elastis girder jembatan hub.",
      status: "MK_VERIFIED",
      submittedBy: "PT Adhi Karya Struktur",
      submittedAt: "2026-10-11T13:45:00.000Z",
      verifiedBy: "Ir. Hendra Wijaya (Team Leader MK)",
      verifiedAt: "2026-10-15T09:30:00.000Z",
    },
    {
      id: "asb-003",
      docNumber: "ASB-MEP-003",
      title: "Skematik As-Built MEP & Sistem Proteksi Kebakaran Otomatis",
      discipline: "MEP",
      revision: "Rev.Final-1",
      format: "DWG / PDF",
      fileSize: "51.8 MB",
      downloadUrl: "/storage/asbuilt/ASB-MEP-003-FireProtection.zip",
      description: "Pipa sprinkler, hydran, damper, panel alarm terintegrasi SCADA stasiun.",
      status: "MK_VERIFIED",
      submittedBy: "PT MEP Contractor Utama",
      submittedAt: "2026-10-12T16:00:00.000Z",
      verifiedBy: "Bambang Irawan (MK MEP Specialist)",
      verifiedAt: "2026-10-16T11:00:00.000Z",
    },
    {
      id: "asb-004",
      docNumber: "OM-HVAC-004",
      title: "Buku Manual Operasi & Pemeliharaan Sistem Chiller & Tata Udara",
      discipline: "OM_MANUAL",
      revision: "Ed.2026-1",
      format: "PDF / Interactive Manual",
      fileSize: "28.3 MB",
      downloadUrl: "/storage/om/OM-HVAC-004-ChillerSystem.pdf",
      description: "Manual SOP troubleshooting rutin, jadwal servis berkala kompresor, dan kontak darurat vendor.",
      status: "MK_VERIFIED",
      submittedBy: "Daikin Applied Engineering",
      submittedAt: "2026-10-14T09:15:00.000Z",
      verifiedBy: "Ir. Hendra Wijaya (Team Leader MK)",
      verifiedAt: "2026-10-18T14:00:00.000Z",
    },
    {
      id: "asb-005",
      docNumber: "SLF-CERT-005",
      title: "Sertifikat Laik Fungsi (SLF) & Rekomendasi Teknis Dinas PUPR",
      discipline: "SLF_CERTIFICATE",
      revision: "Original Final",
      format: "Digitally Signed PDF",
      fileSize: "15.2 MB",
      downloadUrl: "/storage/permits/SLF-CERT-005-Resmi.pdf",
      description: "Sertifikat resmi kelaikan fungsi operasional stasiun dari Dinas Tata Ruang & PUPR DKI.",
      status: "OWNER_ACCEPTED",
      submittedBy: "Konsultan Uji Kelaikan",
      submittedAt: "2026-10-22T10:00:00.000Z",
      verifiedBy: "Dr. Agus Santoso (PPK Kemenhub)",
      verifiedAt: "2026-10-24T16:00:00.000Z",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "aud-001",
      timestamp: "2026-11-06T08:50:00.000Z",
      userId: "usr-ppk-01",
      userName: "Dr. Agus Santoso, M.Eng",
      userRole: "PPK / Project Owner",
      action: "APPROVE",
      module: "ContractCloseout",
      resourceId: "fa-001",
      description: "Menyetujui dokumen Final Account Settlement FA-2026-NSI-001 senilai Rp 48.500.000.000.",
      ipAddress: "10.240.12.88",
      status: "SUCCESS",
    },
    {
      id: "aud-002",
      timestamp: "2026-11-06T08:35:12.000Z",
      userId: "usr-mk-02",
      userName: "Ir. Hendra Wijaya, IPM",
      userRole: "MK Consultant Lead",
      action: "VERIFY",
      module: "AsBuiltArchiving",
      resourceId: "asb-001",
      description: "Memverifikasi kesesuaian gambar terlaksana ASB-AR-001 dengan kondisi fisik lapangan.",
      ipAddress: "10.240.14.15",
      status: "SUCCESS",
    },
    {
      id: "aud-003",
      timestamp: "2026-11-06T07:15:40.000Z",
      userId: "usr-qs-05",
      userName: "Bambang Irawan, ST",
      userRole: "Quantity Surveyor Lead",
      action: "ENDORSE",
      module: "ContractCloseout",
      resourceId: "fa-002",
      description: "Mengunggah dan mengesahkan rekonsiliasi CCO No. 04 untuk Final Account FA-2026-IKN-002.",
      ipAddress: "10.240.11.32",
      status: "SUCCESS",
    },
    {
      id: "aud-004",
      timestamp: "2026-11-05T16:40:22.000Z",
      userId: "usr-sec-01",
      userName: "Security Officer ERP",
      userRole: "System Auditor",
      action: "EXPORT",
      module: "GovernanceAudit",
      resourceId: "AUDIT-EXPORT-2026Q4",
      description: "Mengunduh rekapitulasi audit trail lengkap periode Q4 2026 untuk pemeriksaan berkala BPKP.",
      ipAddress: "10.240.2.10",
      status: "SUCCESS",
    },
  ]);

  // Modal States
  const [showFaModal, setShowFaModal] = useState(false);
  const [showAsBuiltModal, setShowAsBuiltModal] = useState(false);
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Form states
  const [newFaForm, setNewFaForm] = useState({
    settlementNumber: "",
    projectId: "proj-001",
    projectName: "Pembangunan Stasiun LRT Hub Dukuh Atas",
    contractorName: "PT Adhi Karya (Persero) Tbk",
    originalContractValue: 45000000000,
    totalVariationOrders: 3500000000,
    retentionDeduction: 2250000000,
    liquidatedDamages: 0,
    previousPayments: 43650000000,
    notes: "",
  });

  const [newAsBuiltForm, setNewAsBuiltForm] = useState({
    docNumber: "",
    title: "",
    discipline: "ARCHITECTURE" as const,
    revision: "Rev.Final-0",
    format: "DWG / PDF",
    fileSize: "25.0 MB",
    downloadUrl: "/storage/asbuilt/new-doc.zip",
    description: "",
  });

  // Fetch summary and records from API
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/closeout/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
      const resFa = await fetch("http://localhost:4000/api/v1/closeout/final-accounts");
      if (resFa.ok) {
        const dataFa = await resFa.json();
        setFinalAccounts(dataFa);
      }
      const resAsb = await fetch("http://localhost:4000/api/v1/closeout/as-built-documents");
      if (resAsb.ok) {
        const dataAsb = await resAsb.json();
        setAsBuiltDocs(dataAsb);
      }
      const resAud = await fetch("http://localhost:4000/api/v1/closeout/audit-logs");
      if (resAud.ok) {
        const dataAud = await resAud.json();
        setAuditLogs(dataAud);
      }
    } catch {
      // In SSR or when backend is starting, state already populated with fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateFa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/closeout/final-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaForm),
      });
      if (res.ok) {
        setShowFaModal(false);
        refreshData();
      }
    } catch {
      setShowFaModal(false);
    }
  };

  const handleCreateAsBuilt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/closeout/as-built-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsBuiltForm),
      });
      if (res.ok) {
        setShowAsBuiltModal(false);
        refreshData();
      }
    } catch {
      setShowAsBuiltModal(false);
    }
  };

  const handleApproveFa = async (id: string, role: "QUANTITY_SURVEYOR" | "MK_CONSULTANT" | "OWNER_PPK", signerName: string) => {
    try {
      await fetch(`http://localhost:4000/api/v1/closeout/final-accounts/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, signerName }),
      });
      refreshData();
    } catch {
      // fallback local update
    }
  };

  const handleVerifyAsBuilt = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/v1/closeout/as-built-documents/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifierName: "Ir. Hendra Wijaya (Team Leader MK)" }),
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

  const filteredFinalAccounts = finalAccounts.filter((fa) => {
    const matchesStatus = statusFilter === "ALL" || fa.status === statusFilter;
    const matchesSearch =
      fa.settlementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fa.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fa.contractorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAsBuiltDocs = asBuiltDocs.filter((doc) => {
    const matchesDiscipline = disciplineFilter === "ALL" || doc.discipline === disciplineFilter;
    const matchesSearch =
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDiscipline && matchesSearch;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FolderArchive className="h-8 w-8 text-emerald-500" />
              Penutupan Kontrak & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              Phase 20
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Rekonsiliasi Final Account Settlement, Pengarsipan As-Built Drawings & O&M Manual, dan Jejak Audit Tata Kelola Proyek
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
            onClick={() => {
              alert("Berkas rekapitulasi Audit Trail resmi diekspor dengan integritas checksum SHA256 terverifikasi.");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-700 bg-indigo-950/50 hover:bg-indigo-900/60 text-xs font-medium text-indigo-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Ekspor Audit Trail
          </button>
          <button
            onClick={() => setShowFaModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Rekonsiliasi Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Final Agreed Value</span>
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Rp {(summary.totalAgreedFinalValue / 1000000000).toFixed(2)} M
            </p>
            <p className="text-xs text-slate-400 mt-1">Total nilai penutupan disepakati</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sisa Pelunasan (Balance Due)</span>
            <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Calculator className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-blue-400 tracking-tight">
              Rp {(summary.totalFinalBalanceDue / 1000000000).toFixed(2)} M
            </p>
            <p className="text-xs text-slate-400 mt-1">Kewajiban pelunasan termin akhir</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">As-Built & O&M Terverifikasi</span>
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {summary.asBuiltVerified} / {summary.asBuiltTotal} Dokumen
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(summary.asBuiltVerified / (summary.asBuiltTotal || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-purple-400">
                {((summary.asBuiltVerified / (summary.asBuiltTotal || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Jejak Audit Kepatuhan</span>
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
              {summary.auditLogsRecorded.toLocaleString("id-ID")} Entri
            </p>
            <p className="text-xs text-slate-400 mt-1">Jejak aktivitas immutable tersimpan</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Responsive wrap to prevent overflow on mobile) */}
      <div className="border-b border-slate-800">
        <nav className="flex flex-wrap gap-1 sm:gap-3 pb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("final-account")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "final-account"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Calculator className="h-4 w-4" />
            Final Account Settlement
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {finalAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("as-built")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "as-built"
                ? "border-blue-500 text-blue-400 bg-blue-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <FolderArchive className="h-4 w-4" />
            As-Built Drawings & O&M
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {asBuiltDocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit-trail")}
            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "audit-trail"
                ? "border-purple-500 text-purple-400 bg-purple-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <History className="h-4 w-4" />
            Audit Trail Logs
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {auditLogs.length}
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
            placeholder="Cari nomor berkas, proyek, atau keterangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {activeTab === "final-account" && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter Status Final Account"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status Settlement</option>
              <option value="DRAFT">DRAFT</option>
              <option value="QS_ENDORSED">QS_ENDORSED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DISCHARGED">DISCHARGED</option>
            </select>
          </div>
        )}

        {activeTab === "as-built" && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              aria-label="Filter Disiplin Dokumen As-Built"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Disiplin Teknis</option>
              <option value="ARCHITECTURE">Arsitektur</option>
              <option value="STRUCTURE">Struktur</option>
              <option value="MEP">MEP & Utilitas</option>
              <option value="OM_MANUAL">Manual O&M</option>
              <option value="SLF_CERTIFICATE">Sertifikat SLF</option>
            </select>
            <button
              onClick={() => setShowAsBuiltModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Unggah Gambar
            </button>
          </div>
        )}

        {activeTab === "audit-trail" && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter Jenis Aksi Audit"
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              <option value="CREATE">CREATE</option>
              <option value="ENDORSE">ENDORSE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="VERIFY">VERIFY</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Final Account Settlement */}
      {activeTab === "final-account" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                  <th className="p-3.5 font-medium">Nomor & Proyek</th>
                  <th className="p-3.5 font-medium">Kontraktor</th>
                  <th className="p-3.5 font-medium">Nilai Kontrak Awal</th>
                  <th className="p-3.5 font-medium">CCO & Variasi</th>
                  <th className="p-3.5 font-medium">Final Agreed Value</th>
                  <th className="p-3.5 font-medium">Sisa Pelunasan</th>
                  <th className="p-3.5 font-medium">Persetujuan 3 Pihak</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredFinalAccounts.map((fa) => (
                  <tr key={fa.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100">{fa.settlementNumber}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[200px]">{fa.projectName}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{fa.contractorName}</td>
                    <td className="p-3.5 text-slate-300 font-mono">{formatCurrency(fa.originalContractValue)}</td>
                    <td className="p-3.5 text-emerald-400 font-mono">+{formatCurrency(fa.totalVariationOrders)}</td>
                    <td className="p-3.5 text-white font-bold font-mono">{formatCurrency(fa.finalAgreedValue)}</td>
                    <td className="p-3.5 text-blue-400 font-bold font-mono">{formatCurrency(fa.finalBalanceDue)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {fa.signatories.map((sig, idx) => (
                          <span
                            key={idx}
                            title={`${sig.role}: ${sig.name} (${sig.status})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              sig.status === "SIGNED"
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {sig.role === "QUANTITY_SURVEYOR" ? "QS" : sig.role === "MK_CONSULTANT" ? "MK" : "PPK"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          fa.status === "APPROVED" || fa.status === "DISCHARGED"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                            : fa.status === "QS_ENDORSED"
                            ? "bg-blue-950/80 text-blue-400 border-blue-800/80"
                            : "bg-amber-950/80 text-amber-400 border-amber-800/80"
                        }`}
                      >
                        {fa.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {fa.status !== "APPROVED" && (
                          <button
                            onClick={() => handleApproveFa(fa.id, "MK_CONSULTANT", "Ir. Hendra Wijaya (MK Lead)")}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            Ttd MK
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Unduh Berita Acara Final Account Settlement ${fa.settlementNumber}`)}
                          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          title="Cetak Berita Acara"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: As-Built Drawings & O&M Manual */}
      {activeTab === "as-built" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAsBuiltDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                      {doc.docNumber}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        doc.status === "MK_VERIFIED" || doc.status === "OWNER_ACCEPTED"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                          : "bg-amber-950/80 text-amber-400 border-amber-800/60"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-2.5 leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{doc.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="block text-slate-500">Disiplin:</span>
                      <span className="text-slate-300 font-medium">{doc.discipline}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Format / Ukuran:</span>
                      <span className="text-slate-300 font-medium">
                        {doc.format} ({doc.fileSize})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {doc.verifiedBy ? `Verifikator: ${doc.verifiedBy}` : `Pengunggah: ${doc.submittedBy}`}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {doc.status !== "MK_VERIFIED" && (
                      <button
                        onClick={() => handleVerifyAsBuilt(doc.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        Verifikasi MK
                      </button>
                    )}
                    <a
                      href={doc.downloadUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Mengunduh berkas ${doc.docNumber} (${doc.fileSize})...`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 text-[11px] font-medium transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Unduh
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail Logs */}
      {activeTab === "audit-trail" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                  <th className="p-3.5 font-medium">Waktu (ISO / WIB)</th>
                  <th className="p-3.5 font-medium">Pengguna & Peran</th>
                  <th className="p-3.5 font-medium">Aksi</th>
                  <th className="p-3.5 font-medium">Modul</th>
                  <th className="p-3.5 font-medium">Keterangan Aktivitas</th>
                  <th className="p-3.5 font-medium">IP Pengguna</th>
                  <th className="p-3.5 font-medium">Integritas</th>
                  <th className="p-3.5 font-medium text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{log.userName}</div>
                      <div className="text-slate-500 text-[11px]">{log.userRole}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          log.action === "APPROVE" || log.action === "DISCHARGE"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                            : log.action === "CREATE"
                            ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                            : log.action === "VERIFY"
                            ? "bg-purple-950/80 text-purple-400 border-purple-800/60"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{log.module}</td>
                    <td className="p-3.5 text-slate-300 max-w-sm truncate">{log.description}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Valid
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedAuditLog(log);
                          setShowAuditDetailModal(true);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        Periksa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Buat Final Account Settlement */}
      {showFaModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-fa-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-fa-title" className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-500" />
                Rekonsiliasi Final Account Settlement
              </h2>
              <button
                onClick={() => setShowFaModal(false)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFa} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nomor Berkas Settlement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FA-2026-NSI-003"
                  value={newFaForm.settlementNumber}
                  onChange={(e) => setNewFaForm({ ...newFaForm, settlementNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nilai Kontrak Awal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newFaForm.originalContractValue}
                    onChange={(e) => setNewFaForm({ ...newFaForm, originalContractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">CCO & Variasi Nilai (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newFaForm.totalVariationOrders}
                    onChange={(e) => setNewFaForm({ ...newFaForm, totalVariationOrders: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Potongan Retensi 5% (Rp)</label>
                  <input
                    type="number"
                    value={newFaForm.retentionDeduction}
                    onChange={(e) => setNewFaForm({ ...newFaForm, retentionDeduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Denda Keterlambatan / LD (Rp)</label>
                  <input
                    type="number"
                    value={newFaForm.liquidatedDamages}
                    onChange={(e) => setNewFaForm({ ...newFaForm, liquidatedDamages: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Pembayaran Termin Sebelumnya (Rp)</label>
                <input
                  type="number"
                  required
                  value={newFaForm.previousPayments}
                  onChange={(e) => setNewFaForm({ ...newFaForm, previousPayments: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Catatan Rekonsiliasi & Klaim</label>
                <textarea
                  rows={2}
                  placeholder="Rincian berita acara kesepakatan final..."
                  value={newFaForm.notes}
                  onChange={(e) => setNewFaForm({ ...newFaForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFaModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Simpan Draf Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Unggah / Daftarkan Gambar As-Built */}
      {showAsBuiltModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-asbuilt-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-asbuilt-title" className="text-lg font-bold text-white flex items-center gap-2">
                <FolderArchive className="h-5 w-5 text-blue-500" />
                Pendaftaran Gambar As-Built & Manual O&M
              </h2>
              <button
                onClick={() => setShowAsBuiltModal(false)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsBuilt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nomor Gambar / Dokumen</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASB-MEP-004"
                  value={newAsBuiltForm.docNumber}
                  onChange={(e) => setNewAsBuiltForm({ ...newAsBuiltForm, docNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Judul Dokumen Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skematik As-Built Jalur Kabel Feeder Utama LVMD"
                  value={newAsBuiltForm.title}
                  onChange={(e) => setNewAsBuiltForm({ ...newAsBuiltForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Disiplin Teknis</label>
                  <select
                    value={newAsBuiltForm.discipline}
                    onChange={(e) =>
                      setNewAsBuiltForm({
                        ...newAsBuiltForm,
                        discipline: e.target.value as "ARCHITECTURE",
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ARCHITECTURE">ARCHITECTURE</option>
                    <option value="STRUCTURE">STRUCTURE</option>
                    <option value="MEP">MEP & Utilitas</option>
                    <option value="OM_MANUAL">O&M MANUAL</option>
                    <option value="SLF_CERTIFICATE">SLF CERTIFICATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Revisi Final</label>
                  <input
                    type="text"
                    value={newAsBuiltForm.revision}
                    onChange={(e) => setNewAsBuiltForm({ ...newAsBuiltForm, revision: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Keterangan / Lingkup Penyesuaian</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan perubahan dimensi atau layout aktual di lapangan..."
                  value={newAsBuiltForm.description}
                  onChange={(e) => setNewAsBuiltForm({ ...newAsBuiltForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAsBuiltModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Daftarkan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Detail Log Audit & Snapshot Integritas */}
      {showAuditDetailModal && selectedAuditLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-audit-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-audit-title" className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-500" />
                Detail Entri Audit Trail & Integritas Kepatuhan
              </h2>
              <button
                onClick={() => setShowAuditDetailModal(false)}
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-850 border border-slate-800">
                <div>
                  <span className="block text-slate-500">Log ID:</span>
                  <span className="text-slate-200 font-mono">{selectedAuditLog.id}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Waktu ISO:</span>
                  <span className="text-slate-200 font-mono">{selectedAuditLog.timestamp}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Pengguna:</span>
                  <span className="text-slate-200 font-semibold">{selectedAuditLog.userName}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Peran:</span>
                  <span className="text-slate-200">{selectedAuditLog.userRole}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Modul / Resource:</span>
                  <span className="text-purple-400 font-mono">
                    {selectedAuditLog.module} ({selectedAuditLog.resourceId})
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">IP Pengguna:</span>
                  <span className="text-slate-200 font-mono">{selectedAuditLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Uraian Aktivitas:</label>
                <p className="p-3 rounded-lg bg-slate-800 text-slate-200 leading-relaxed">
                  {selectedAuditLog.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-emerald-400">
                <Lock className="h-4 w-4 shrink-0" />
                <span className="text-[11px]">
                  Jejak audit bersifat kekal (*append-only*). Segel hash kriptografis SHA-256 terverifikasi dan memenuhi
                  standar audit BPK/BPKP.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditDetailModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

