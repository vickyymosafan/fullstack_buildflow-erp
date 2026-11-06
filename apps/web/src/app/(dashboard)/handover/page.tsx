"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  Landmark,
  ShieldCheck,
  Search,
  Plus,
  X,
  FileText,
  UserCheck,
  Wrench,
  Camera,
  Check,
  ExternalLink,
  DollarSign,
  AlertCircle,
  FileSignature,
} from "lucide-react";

interface HandoverSummary {
  projectId: string;
  projectCode: string;
  projectName: string;
  totalContractValue: number;
  totalHandoverCertificates: number;
  activeDlpCount: number;
  fhoCompletedCount: number;
  totalPunchLists: number;
  openPunchLists: number;
  closedPunchLists: number;
  punchListResolutionRate: number;
  totalRetentionAmount: number;
  releasedRetentionAmount: number;
  retentionRemaining: number;
}

interface HandoverCertificate {
  id: string;
  projectCode: string;
  certificateType: "PHO_BAST_1" | "FHO_BAST_2";
  certificateNumber: string;
  title: string;
  handoverDate: string;
  workProgressPercent: number;
  warrantyPeriodMonths: number;
  warrantyEndDate: string;
  committeeChair: string;
  contractorRepresentative: string;
  ownerSignatory: string;
  status: string;
  signedAt: string | null;
  retentionAmount: number;
  retentionStatus: string;
  asBuiltDrawingsVerified: boolean;
  omManualVerified: boolean;
  notes: string;
}

interface PunchListItem {
  id: string;
  certificateId: string;
  itemCode: string;
  title: string;
  category: string;
  severity: string;
  location: string;
  assignedSubcon: string;
  deadline: string;
  status: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  rectifiedDate: string | null;
  verifiedBy: string | null;
  notes: string;
}

interface RetentionRelease {
  id: string;
  certificateId: string;
  releaseNumber: string;
  projectTitle: string;
  releaseType: "CASH_RETENTION" | "MAINTENANCE_BOND";
  retentionAmount: number;
  bankName: string;
  bankGuaranteeNumber: string;
  guaranteeValidityDate: string;
  releaseStatus: string;
  financeApproval: boolean;
  ownerPpkApproval: boolean;
  releasedDate: string | null;
  notes: string;
}

const initialCertificates: HandoverCertificate[] = [
  {
    id: "bast-01",
    projectCode: "PRJ-2026-IKN-PK3",
    certificateType: "PHO_BAST_1",
    certificateNumber: "BAST-PHO-2026-001",
    title: "Serah Terima Pertama (PHO) Pekerjaan Fisik 100% Gedung Istana Utama IKN",
    handoverDate: "2026-03-31",
    workProgressPercent: 100,
    warrantyPeriodMonths: 6,
    warrantyEndDate: "2026-09-30",
    committeeChair: "Ir. Danang Wicaksono, M.Eng. (PPHP PUPR)",
    contractorRepresentative: "Ir. Agus Wijaya, M.T. (Project Manager)",
    ownerSignatory: "Dr. Hendra Gunawan, S.T., M.T. (PPK PUPR)",
    status: "SIGNED",
    signedAt: "2026-03-31T14:30:00Z",
    retentionAmount: 7125000000,
    retentionStatus: "HELD_IN_DLP",
    asBuiltDrawingsVerified: true,
    omManualVerified: true,
    notes: "Fisik pekerjaan telah diuji komisioning lengkap, commissioning certificate diterbitkan. Memasuki masa pemeliharaan (DLP) 6 bulan.",
  },
  {
    id: "bast-02",
    projectCode: "PRJ-2026-LRT-DUKUH",
    certificateType: "FHO_BAST_2",
    certificateNumber: "BAST-FHO-2026-004",
    title: "Serah Terima Akhir (FHO) Pekerjaan Trackwork & Viaduct LRT Jabodebek Extension",
    handoverDate: "2026-02-15",
    workProgressPercent: 100,
    warrantyPeriodMonths: 12,
    warrantyEndDate: "2026-02-15",
    committeeChair: "Ir. Budi Prasetyo (PPHP Kemenhub)",
    contractorRepresentative: "Drs. Hendro Wibowo (PM Trackwork)",
    ownerSignatory: "Ahmad Syukri, M.Sc. (PPK Balai Kereta Api)",
    status: "SIGNED",
    signedAt: "2026-02-15T11:00:00Z",
    retentionAmount: 4425000000,
    retentionStatus: "RELEASED_FULL",
    asBuiltDrawingsVerified: true,
    omManualVerified: true,
    notes: "Masa pemeliharaan 12 bulan tuntas tanpa catatan cacat mutu tersisa. Seluruh jaminan pemeliharaan dikembalikan.",
  },
  {
    id: "bast-03",
    projectCode: "PRJ-2026-TOL-SUMATRA",
    certificateType: "PHO_BAST_1",
    certificateNumber: "BAST-PHO-2026-008",
    title: "Serah Terima Pertama (PHO) Paket Interchange & Gerbang Tol Seksi 4",
    handoverDate: "2026-04-10",
    workProgressPercent: 100,
    warrantyPeriodMonths: 12,
    warrantyEndDate: "2027-04-10",
    committeeChair: "Ir. Slamet Riyadi (Direksi Teknis BPJT)",
    contractorRepresentative: "Ir. Hendra Gunawan (PM Tol)",
    ownerSignatory: "Bambang Sudiro (Direktur Utama PT Hutama Karya)",
    status: "INSPECTION_PENDING",
    signedAt: null,
    retentionAmount: 4750000000,
    retentionStatus: "HELD_IN_DLP",
    asBuiltDrawingsVerified: true,
    omManualVerified: false,
    notes: "Pemeriksaan bersama tim PPHP sedang berlangsung. Dokumen manual O&M gardu tol dalam tahap verifikasi final.",
  },
];

const initialPunchLists: PunchListItem[] = [
  {
    id: "punch-01",
    certificateId: "bast-01",
    itemCode: "PUNCH-2026-001",
    title: "Retak rambut pada plesteran dinding lobby utama lantai dasar",
    category: "ARCHITECTURAL",
    severity: "LOW",
    location: "Lobby Utama Sayap Barat As 5-7",
    assignedSubcon: "PT Dinding Megah Perkasa",
    deadline: "2026-04-15",
    status: "VERIFIED_CLOSED",
    beforePhotoUrl: "/proofs/punch-lobby-crack-before.jpg",
    afterPhotoUrl: "/proofs/punch-lobby-crack-after.jpg",
    rectifiedDate: "2026-04-10",
    verifiedBy: "Ir. Danang Wicaksono (PPHP PUPR)",
    notes: "Perbaikan dengan plamir elastis dan pengecatan ulang telah rata sempurna dan disetujui pengawas.",
  },
  {
    id: "punch-02",
    certificateId: "bast-01",
    itemCode: "PUNCH-2026-002",
    title: "Rembesan waterproofing minor pada sambungan talang beton sayap barat",
    category: "CIVIL_INFRA",
    severity: "MEDIUM",
    location: "Lantai Atap Blok C As 14-16",
    assignedSubcon: "PT Tirta Waterproofing Mandiri",
    deadline: "2026-04-20",
    status: "RECTIFIED",
    beforePhotoUrl: "/proofs/punch-gutter-leak-before.jpg",
    afterPhotoUrl: "/proofs/punch-gutter-leak-after.jpg",
    rectifiedDate: "2026-04-18",
    verifiedBy: "Bambang Haryanto (Pengawas Lapangan)",
    notes: "Injeksi sealant polyurethane telah diaplikasikan; menunggu uji genangan air 2x24 jam sebelum verifikasi closed.",
  },
  {
    id: "punch-03",
    certificateId: "bast-01",
    itemCode: "PUNCH-2026-003",
    title: "Pengaturan ulang balancing damper ducting HVAC ruang rapat VIP",
    category: "MEP",
    severity: "HIGH",
    location: "Ruang Rapat VIP Lantai 2",
    assignedSubcon: "PT Cipta Udara Segar",
    deadline: "2026-04-25",
    status: "IN_PROGRESS",
    beforePhotoUrl: "/proofs/punch-hvac-damper-before.jpg",
    afterPhotoUrl: null,
    rectifiedDate: null,
    verifiedBy: null,
    notes: "Tingkat kebisingan masih 52 dB (target batas maksimal 45 dB). Tim teknisi sedang mengganti sound attenuator.",
  },
  {
    id: "punch-04",
    certificateId: "bast-01",
    itemCode: "PUNCH-2026-004",
    title: "Pembersihan sisa noda semen & pelapisan ulang granite tile serambi",
    category: "ARCHITECTURAL",
    severity: "LOW",
    location: "Serambi Timur Gedung Utama",
    assignedSubcon: "PT Granit Selaras Alam",
    deadline: "2026-04-30",
    status: "OPEN",
    beforePhotoUrl: "/proofs/punch-granite-clean-before.jpg",
    afterPhotoUrl: null,
    rectifiedDate: null,
    verifiedBy: null,
    notes: "Poles lantai kristalisasi dijadwalkan setelah mobilisasi material interior selesai.",
  },
  {
    id: "punch-05",
    certificateId: "bast-02",
    itemCode: "PUNCH-2026-005",
    title: "Penyesuaian torsi baut elastis penambat rel jalur layang Stasiun Ciliwung",
    category: "STRUCTURAL",
    severity: "CRITICAL",
    location: "Track 1 Km 12+450",
    assignedSubcon: "PT Rekayasa Trackindo",
    deadline: "2026-02-10",
    status: "VERIFIED_CLOSED",
    beforePhotoUrl: "/proofs/punch-rail-bolt-before.jpg",
    afterPhotoUrl: "/proofs/punch-rail-bolt-after.jpg",
    rectifiedDate: "2026-02-08",
    verifiedBy: "Ir. Budi Prasetyo (PPHP Kemenhub)",
    notes: "Kalibrasi uji torsi 250 Nm tuntas 100% dengan sertifikat uji keselamatan Ditjen Perkeretaapian.",
  },
];

const initialRetentions: RetentionRelease[] = [
  {
    id: "ret-01",
    certificateId: "bast-01",
    releaseNumber: "RET-REL-2026-001",
    projectTitle: "Pembangunan Gedung Istana Kawasan Inti IKN",
    releaseType: "CASH_RETENTION",
    retentionAmount: 7125000000,
    bankName: "Bank Mandiri (Persero) Tbk - Cabang Khusus BUMN",
    bankGuaranteeNumber: "BG-MANDIRI-MNT-2026-9901",
    guaranteeValidityDate: "2026-09-30",
    releaseStatus: "PENDING_VERIFICATION",
    financeApproval: true,
    ownerPpkApproval: false,
    releasedDate: null,
    notes: "Pengajuan pencairan termin retensi 5% setelah 50% masa garansi pemeliharaan berjalan dengan resolusi punch list 75%.",
  },
  {
    id: "ret-02",
    certificateId: "bast-02",
    releaseNumber: "RET-REL-2026-002",
    projectTitle: "Trackwork & Viaduct LRT Jabodebek Extension Dukuh Atas",
    releaseType: "MAINTENANCE_BOND",
    retentionAmount: 4425000000,
    bankName: "Bank BNI (Persero) Tbk - Cabang Dukuh Atas",
    bankGuaranteeNumber: "BG-BNI-MNT-2025-4412",
    guaranteeValidityDate: "2026-02-15",
    releaseStatus: "RELEASED",
    financeApproval: true,
    ownerPpkApproval: true,
    releasedDate: "2026-02-20",
    notes: "Pelepasan sertifikat Bank Garansi Pemeliharaan telah tuntas diserahkan kembali kepada kontraktor utama pasca-FHO.",
  },
];

export default function HandoverPage() {
  const [activeTab, setActiveTab] = useState<"certificates" | "punchlist" | "retention">("certificates");
  const [summary, setSummary] = useState<HandoverSummary | null>(null);
  const [certificates, setCertificates] = useState<HandoverCertificate[]>(initialCertificates);
  const [punchLists, setPunchLists] = useState<PunchListItem[]>(initialPunchLists);
  const [retentions, setRetentions] = useState<RetentionRelease[]>(initialRetentions);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Modals
  const [showBastModal, setShowBastModal] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);

  // Form States
  const [bastForm, setBastForm] = useState({
    projectCode: "PRJ-2026-IKN-PK3",
    certificateType: "PHO_BAST_1" as "PHO_BAST_1" | "FHO_BAST_2",
    certificateNumber: "",
    title: "",
    handoverDate: "2026-05-15",
    workProgressPercent: 100,
    warrantyPeriodMonths: 6,
    committeeChair: "Ir. Danang Wicaksono, M.Eng. (PPHP)",
    contractorRepresentative: "Ir. Agus Wijaya, M.T. (PM)",
    ownerSignatory: "Dr. Hendra Gunawan, S.T., M.T. (PPK)",
    notes: "",
  });

  const [punchForm, setPunchForm] = useState({
    certificateId: "bast-01",
    title: "",
    category: "ARCHITECTURAL",
    severity: "MEDIUM",
    location: "",
    assignedSubcon: "",
    deadline: "2026-05-30",
    repairMethod: "",
  });

  const [retentionForm, setRetentionForm] = useState({
    certificateId: "bast-01",
    releaseType: "CASH_RETENTION" as "CASH_RETENTION" | "MAINTENANCE_BOND",
    retentionAmount: 7125000000,
    bankName: "Bank Mandiri (Persero) Tbk",
    bankGuaranteeNumber: "",
    guaranteeValidityDate: "2026-09-30",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [sumRes, certRes, punchRes, retRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/handover/summary").catch(() => null),
        fetch("http://localhost:4000/api/v1/handover/certificates").catch(() => null),
        fetch("http://localhost:4000/api/v1/handover/punch-lists").catch(() => null),
        fetch("http://localhost:4000/api/v1/handover/retention-releases").catch(() => null),
      ]);

      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (certRes && certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData);
      }
      if (punchRes && punchRes.ok) {
        const punchData = await punchRes.json();
        setPunchLists(punchData);
      }
      if (retRes && retRes.ok) {
        const retData = await retRes.json();
        setRetentions(retData);
      }
    } catch (err) {
      console.error("Gagal memuat data serah terima proyek:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  async function handleCreateBast(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/handover/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bastForm),
      });
      if (res.ok) {
        const created = await res.json();
        setCertificates([created, ...certificates]);
        setShowBastModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreatePunch(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/handover/punch-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(punchForm),
      });
      if (res.ok) {
        const created = await res.json();
        setPunchLists([created, ...punchLists]);
        setShowPunchModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateRetention(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/handover/retention-releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retentionForm),
      });
      if (res.ok) {
        const created = await res.json();
        setRetentions([created, ...retentions]);
        setShowRetentionModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSignCertificate(id: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/handover/certificates/${id}/sign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatoryRole: "OWNER_PPK" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCertificates(certificates.map((c) => (c.id === id ? updated : c)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRectifyPunch(id: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/handover/punch-lists/${id}/rectify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ afterPhotoUrl: "/proofs/punch-rectified-sample.jpg" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPunchLists(punchLists.map((p) => (p.id === id ? updated : p)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClosePunch(id: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/handover/punch-lists/${id}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBy: "Ir. Danang Wicaksono, M.Eng. (PPHP PUPR)" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPunchLists(punchLists.map((p) => (p.id === id ? updated : p)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApproveRetention(id: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/handover/retention-releases/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverRole: "OWNER_PPK" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRetentions(retentions.map((r) => (r.id === id ? updated : r)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredPunch = punchLists.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesSeverity = severityFilter === "ALL" || item.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Serah Terima Proyek (PHO & FHO) & Masa Pemeliharaan
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Tata kelola Berita Acara Serah Terima (BAST I / BAST II), manajemen cacat mutu (Punch List DLP), dan pencairan jaminan retensi (5%).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            data-testid="open-retention-modal-btn"
            onClick={() => setShowRetentionModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span>Pencairan Retensi (5%)</span>
          </button>

          <button
            data-testid="open-punch-modal-btn"
            onClick={() => setShowPunchModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Catat Punch List Cacat</span>
          </button>

          <button
            data-testid="open-bast-modal-btn"
            onClick={() => setShowBastModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan BAST Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: BAST Diterbitkan */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Berita Acara (BAST)
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileSignature className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {summary ? summary.totalHandoverCertificates : 3} Dokumen
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                {summary ? summary.fhoCompletedCount : 1} FHO Selesai
              </span>
              <span>• Fisik 100% PUPR</span>
            </div>
          </div>
        </div>

        {/* Card 2: Masa Garansi / DLP */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Masa Pemeliharaan (DLP)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {summary ? summary.activeDlpCount : 1} Paket Berjalan
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                Garansi 6-12 Bulan
              </span>
              <span>• Standar FIDIC</span>
            </div>
          </div>
        </div>

        {/* Card 3: Resolusi Punch List */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resolusi Cacat Mutu
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {summary ? `${summary.punchListResolutionRate}%` : "60.0%"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                {summary ? `${summary.closedPunchLists} dari ${summary.totalPunchLists}` : "3 dari 5"} Cacat Tertutup
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Dana Retensi Terjaga */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dana Retensi Terjaga (5%)
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono text-sm sm:text-lg">
              {summary ? formatRupiah(summary.retentionRemaining) : "Rp 7.125.000.000"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-purple-600 font-semibold">
                Bank Garansi Aktif
              </span>
              <span>• Mandiri & BNI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-3 pb-px" role="tablist" aria-label="Tabs">
          <button
            data-testid="tab-certificates"
            onClick={() => setActiveTab("certificates")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "certificates"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSignature className="w-4 h-4 shrink-0" />
            <span>Berita Acara BAST</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              {certificates.length}
            </span>
          </button>

          <button
            data-testid="tab-punchlist"
            onClick={() => setActiveTab("punchlist")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "punchlist"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Punch List DLP</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {punchLists.length}
            </span>
          </button>

          <button
            data-testid="tab-retention"
            onClick={() => setActiveTab("retention")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "retention"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Landmark className="w-4 h-4 shrink-0" />
            <span>Pencairan Retensi & Garansi</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-purple-500/10 text-purple-600">
              {retentions.length}
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: BERITA ACARA PHO / FHO (BAST) */}
      {activeTab === "certificates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-primary">{cert.certificateNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cert.certificateType === "PHO_BAST_1"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {cert.certificateType === "PHO_BAST_1" ? "BAST I (PHO)" : "BAST II (FHO)"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cert.status === "SIGNED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mt-1.5">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Kode Proyek: {cert.projectCode}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Progress Fisik:</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">{cert.workProgressPercent}% Tuntas</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Tanggal Serah Terima:</span>
                    <span className="font-medium text-foreground">{cert.handoverDate}</span>
                    <span className="text-muted-foreground block text-[11px] pt-1">Masa Garansi / DLP:</span>
                    <span className="font-semibold text-amber-600">
                      {cert.warrantyPeriodMonths} Bulan (s/d {cert.warrantyEndDate})
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 space-y-1 font-mono text-[11px]">
                    <span className="text-muted-foreground block font-sans">Cadangan Retensi (5%):</span>
                    <span className="font-bold text-foreground">{formatRupiah(cert.retentionAmount)}</span>
                    <span className="text-muted-foreground block font-sans pt-1">Status Retensi:</span>
                    <span className="font-semibold text-purple-600">{cert.retentionStatus}</span>
                  </div>
                </div>

                {/* Signatories & Documents Matrix */}
                <div className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs">
                  <div className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Penandatangan Resmi Berita Acara:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">PPHP / Direksi:</span>
                      <span className="font-medium text-foreground">{cert.committeeChair}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Kontraktor:</span>
                      <span className="font-medium text-foreground">{cert.contractorRepresentative}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">PPK Owner:</span>
                      <span className="font-medium text-foreground">{cert.ownerSignatory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> As-Built Drawings
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Manual O&M
                    </span>
                  </div>
                  {cert.status !== "SIGNED" && (
                    <button
                      onClick={() => handleSignCertificate(cert.id)}
                      className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors"
                    >
                      Sahkan & Tanda Tangani
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PUNCH LIST CACAT MUTU DLP */}
      {activeTab === "punchlist" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                data-testid="search-punch-input"
                type="text"
                placeholder="Cari deskripsi cacat mutu, kode punch list, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="ARCHITECTURAL">Arsitektur</option>
                <option value="STRUCTURAL">Struktur</option>
                <option value="MEP">Mekanikal & Elektrikal</option>
                <option value="CIVIL_INFRA">Infrastruktur Sipil</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Tingkat Cacat</option>
                <option value="CRITICAL">Critical (Darurat)</option>
                <option value="HIGH">High (Mayor)</option>
                <option value="MEDIUM">Medium (Sedang)</option>
                <option value="LOW">Low (Minor)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPunch.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{item.itemCode}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : item.severity === "HIGH"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === "VERIFIED_CLOSED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : item.status === "RECTIFIED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Lokasi: <span className="font-medium text-foreground">{item.location}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/30 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subkontraktor PIC:</span>
                    <span className="font-medium text-foreground">{item.assignedSubcon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batas Waktu SLA:</span>
                    <span className="font-mono text-amber-600 font-semibold">{item.deadline}</span>
                  </div>
                  {item.verifiedBy && (
                    <div className="flex justify-between pt-1 border-t border-border">
                      <span className="text-muted-foreground">Verifikator MK:</span>
                      <span className="font-medium text-emerald-600">{item.verifiedBy}</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground italic">
                  {item.notes}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{item.afterPhotoUrl ? "Foto Selesai Ada" : "Foto Awal Ada"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.status === "OPEN" || item.status === "IN_PROGRESS" ? (
                      <button
                        onClick={() => handleRectifyPunch(item.id)}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium text-[11px] hover:bg-blue-700"
                      >
                        Tandai Selesai
                      </button>
                    ) : item.status === "RECTIFIED" ? (
                      <button
                        onClick={() => handleClosePunch(item.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700"
                      >
                        Verifikasi MK (Closed)
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tuntas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PENCAIRAN RETENSI & BANK GARANSI */}
      {activeTab === "retention" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-600" />
                Penatausahaan Dana Retensi Kas (5%) & Jaminan Pemeliharaan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengembalian jaminan garansi bank pemeliharaan (*Maintenance Bond*) atau pencairan retensi kas setelah masa pemeliharaan terbukti selesai tanpa cacat mutu tertunda.
              </p>
            </div>
            <button
              onClick={() => setShowRetentionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Pencairan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {retentions.map((ret) => (
              <div
                key={ret.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{ret.releaseNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ret.releaseStatus === "RELEASED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {ret.releaseStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{ret.projectTitle}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Bentuk: <span className="font-semibold text-foreground">{ret.releaseType === "CASH_RETENTION" ? "Retensi Kas 5%" : "Bank Garansi Pemeliharaan"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Nilai Retensi:</span>
                    <span className="font-bold text-foreground text-sm text-purple-600">
                      {formatRupiah(ret.retentionAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bank Penjamin:</span>
                    <span className="font-medium text-foreground">{ret.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No. Bank Garansi:</span>
                    <span className="font-semibold text-foreground">{ret.bankGuaranteeNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-600">
                    <span>Masa Berlaku s/d:</span>
                    <span>{ret.guaranteeValidityDate}</span>
                  </div>
                </div>

                {/* Dual Approval Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {ret.financeApproval ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Finance Director: {ret.financeApproval ? "Approved" : "Waiting"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {ret.ownerPpkApproval ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span>PPK Owner: {ret.ownerPpkApproval ? "Approved" : "Waiting"}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground italic">
                  {ret.notes}
                </div>

                {ret.releaseStatus !== "RELEASED" && (
                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      onClick={() => handleApproveRetention(ret.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-sm text-xs"
                    >
                      Otorisasi Persetujuan Pencairan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: TERBITKAN BAST BARU (PHO / FHO) */}
      {showBastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                Penerbitan Berita Acara Serah Terima (BAST Baru)
              </h3>
              <button onClick={() => setShowBastModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBast} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tipe BAST *</label>
                  <select
                    value={bastForm.certificateType}
                    onChange={(e) => setBastForm({ ...bastForm, certificateType: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  >
                    <option value="PHO_BAST_1">BAST I — Provisional Hand Over (PHO 100%)</option>
                    <option value="FHO_BAST_2">BAST II — Final Hand Over (FHO Akhir)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor BAST *</label>
                  <input
                    type="text"
                    required
                    value={bastForm.certificateNumber}
                    onChange={(e) => setBastForm({ ...bastForm, certificateNumber: e.target.value })}
                    placeholder="Contoh: BAST-PHO-2026-012"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Judul / Uraian Serah Terima *</label>
                <input
                  type="text"
                  required
                  value={bastForm.title}
                  onChange={(e) => setBastForm({ ...bastForm, title: e.target.value })}
                  placeholder="Contoh: Serah Terima Pertama Pekerjaan Gedung Utama"
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Tanggal BAST *</label>
                  <input
                    type="date"
                    required
                    value={bastForm.handoverDate}
                    onChange={(e) => setBastForm({ ...bastForm, handoverDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kemajuan Fisik (%) *</label>
                  <input
                    type="number"
                    value={bastForm.workProgressPercent}
                    onChange={(e) => setBastForm({ ...bastForm, workProgressPercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Durasi Garansi (Bulan) *</label>
                  <input
                    type="number"
                    value={bastForm.warrantyPeriodMonths}
                    onChange={(e) => setBastForm({ ...bastForm, warrantyPeriodMonths: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Ketua PPHP / Direksi *</label>
                  <input
                    type="text"
                    required
                    value={bastForm.committeeChair}
                    onChange={(e) => setBastForm({ ...bastForm, committeeChair: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kontraktor Pelaksana *</label>
                  <input
                    type="text"
                    required
                    value={bastForm.contractorRepresentative}
                    onChange={(e) => setBastForm({ ...bastForm, contractorRepresentative: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">PPK Owner *</label>
                  <input
                    type="text"
                    required
                    value={bastForm.ownerSignatory}
                    onChange={(e) => setBastForm({ ...bastForm, ownerSignatory: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-muted/40 text-[11px] text-muted-foreground">
                Penerbitan BAST PHO mensyaratkan kelengkapan dokumen As-Built Drawings, Commissioning Test, dan penyerahan Jaminan Pemeliharaan 5% nilai kontrak.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBastModal(false)}
                  className="px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
                >
                  Terbitkan BAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT TEMUAN PUNCH LIST BARU */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                Pencatatan Temuan Cacat Mutu (Punch List DLP)
              </h3>
              <button onClick={() => setShowPunchModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePunch} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Deskripsi Cacat Mutu *</label>
                <input
                  type="text"
                  required
                  value={punchForm.title}
                  onChange={(e) => setPunchForm({ ...punchForm, title: e.target.value })}
                  placeholder="Contoh: Sambungan seal kaca facade lantai 4 mengalami kebocoran air"
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kategori Pekerjaan *</label>
                  <select
                    value={punchForm.category}
                    onChange={(e) => setPunchForm({ ...punchForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  >
                    <option value="ARCHITECTURAL">Arsitektur</option>
                    <option value="STRUCTURAL">Struktur</option>
                    <option value="MEP">Mekanikal & Elektrikal</option>
                    <option value="FACADE">Facade & Glazing</option>
                    <option value="CIVIL_INFRA">Infrastruktur Sipil</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tingkat Cacat (Severity) *</label>
                  <select
                    value={punchForm.severity}
                    onChange={(e) => setPunchForm({ ...punchForm, severity: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-semibold"
                  >
                    <option value="LOW">Low (Minor Finishing)</option>
                    <option value="MEDIUM">Medium (Sedang)</option>
                    <option value="HIGH">High (Fungsi Utama Terganggu)</option>
                    <option value="CRITICAL">Critical (Risiko Struktural / Keselamatan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Lokasi Titik Cacat *</label>
                  <input
                    type="text"
                    required
                    value={punchForm.location}
                    onChange={(e) => setPunchForm({ ...punchForm, location: e.target.value })}
                    placeholder="Contoh: Gedung B Sayap Utara Ruang 304"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Subkontraktor Penanggung Jawab *</label>
                  <input
                    type="text"
                    required
                    value={punchForm.assignedSubcon}
                    onChange={(e) => setPunchForm({ ...punchForm, assignedSubcon: e.target.value })}
                    placeholder="Contoh: PT Kaca Alumindo Jaya"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Batas Waktu Perbaikan SLA *</label>
                <input
                  type="date"
                  required
                  value={punchForm.deadline}
                  onChange={(e) => setPunchForm({ ...punchForm, deadline: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Rencana Metode Perbaikan</label>
                <textarea
                  rows={2}
                  value={punchForm.repairMethod}
                  onChange={(e) => setPunchForm({ ...punchForm, repairMethod: e.target.value })}
                  placeholder="Uraian langkah teknis perbaikan..."
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 shadow-sm"
                >
                  Simpan Punch List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENGAJUAN PENCAIRAN RETENSI */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-600" />
                Pengajuan Pencairan Retensi & Pelepasan Jaminan Bank
              </h3>
              <button onClick={() => setShowRetentionModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRetention} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Bentuk Jaminan / Retensi *</label>
                  <select
                    value={retentionForm.releaseType}
                    onChange={(e) => setRetentionForm({ ...retentionForm, releaseType: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  >
                    <option value="CASH_RETENTION">Pencairan Retensi Kas 5%</option>
                    <option value="MAINTENANCE_BOND">Pelepasan Bank Garansi Pemeliharaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nilai Nominal Retensi (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={retentionForm.retentionAmount}
                    onChange={(e) => setRetentionForm({ ...retentionForm, retentionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Bank Penjamin / Penerbit *</label>
                  <input
                    type="text"
                    required
                    value={retentionForm.bankName}
                    onChange={(e) => setRetentionForm({ ...retentionForm, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor Bank Garansi</label>
                  <input
                    type="text"
                    value={retentionForm.bankGuaranteeNumber}
                    onChange={(e) => setRetentionForm({ ...retentionForm, bankGuaranteeNumber: e.target.value })}
                    placeholder="Contoh: BG-MANDIRI-MNT-2026-9901"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Masa Berlaku Garansi s/d</label>
                <input
                  type="date"
                  value={retentionForm.guaranteeValidityDate}
                  onChange={(e) => setRetentionForm({ ...retentionForm, guaranteeValidityDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Catatan Verifikasi</label>
                <textarea
                  rows={2}
                  value={retentionForm.notes}
                  onChange={(e) => setRetentionForm({ ...retentionForm, notes: e.target.value })}
                  placeholder="Catatan rekomendasi konsultan pengawas..."
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                />
              </div>

              <div className="p-3 rounded-md bg-muted/40 text-[11px] text-muted-foreground">
                Pencairan retensi kas atau pelepasan sertifikat bank garansi membutuhkan otorisasi ganda (*Dual Approval*) dari Finance Director dan Pejabat Pembuat Komitmen (PPK).
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowRetentionModal(false)}
                  className="px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-sm"
                >
                  Ajukan Pencairan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
