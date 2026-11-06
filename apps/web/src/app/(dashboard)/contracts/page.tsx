"use client";

import React, { useState, useMemo } from "react";
import {
  Gavel,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Scale,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  RefreshCw,
  FileSignature,
  Zap,
  BookOpen,
  ChevronRight,
  X,
  Eye,
  Percent,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  UserCheck,
  Activity,
  Layers,
} from "lucide-react";

// Types
type TabType = "PORTFOLIO" | "AI_CLAUSES" | "DISPUTES" | "LD_CALCULATOR" | "AMENDMENTS";
type ContractType = "FIDIC_RED" | "FIDIC_YELLOW" | "FIDIC_SILVER" | "LPSE_PUPR" | "PRIVATE_TURNKEY";
type ContractStatus = "ACTIVE" | "AT_RISK" | "DISPUTED" | "AMENDED" | "COMPLETED";
type ClauseRiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  clientName: string;
  contractType: ContractType;
  contractValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  retentionPercent: number;
  defectNotificationPeriodMonths: number;
  liquidatedDamagesRatePerDay: number;
  liquidatedDamagesCapPercent: number;
  disputeResolutionForum: string;
  projectId?: string;
  status: ContractStatus;
  riskScore: number;
  totalAmendments: number;
}

interface ClauseItem {
  id: string;
  contractId: string;
  contractNumber: string;
  clauseNumber: string;
  clauseTitle: string;
  clauseText: string;
  clauseCategory: string;
  riskLevel: ClauseRiskLevel;
  riskScore: number;
  deviationIdentified: string;
  legalReference: string;
  recommendation: string;
  counterClauseProposal: string;
  aiConfidenceScore: number;
  isAmended: boolean;
  analyzedAt: string;
}

interface DisputePredictionItem {
  id: string;
  contractId: string;
  contractNumber: string;
  contractTitle: string;
  clientName: string;
  disputeProbabilityPercent: number;
  riskClassification: "CRITICAL_DISPUTE" | "HIGH_POTENTIAL" | "MODERATE_MONITOR" | "LOW_HEALTHY";
  primaryDrivers: { factor: string; weight: number; severity: string; details: string }[];
  potentialFinancialExposure: number;
  recommendedMitigation: string[];
  recommendedForum: string;
  evaluatedAt: string;
}

interface AmendmentItem {
  id: string;
  contractId: string;
  contractNumber: string;
  amendmentNumber: string;
  title: string;
  amendmentType: string;
  costDelta: number;
  eotDays: number;
  previousValue: number;
  newValue: number;
  previousEndDate: string;
  newEndDate: string;
  effectiveDate: string;
  signedByClient: string;
  signedByContractor: string;
  description?: string;
}

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: "CTR-001",
    contractNumber: "CTR-MRT-2026-001",
    title: "Pembangunan Stasiun Bawah Tanah Harmoni CP202",
    clientName: "PT MRT Jakarta (Perseroda)",
    contractType: "FIDIC_RED",
    contractValue: 450000000000,
    currentValue: 462500000000,
    startDate: "2026-01-15",
    endDate: "2027-07-30",
    retentionPercent: 5,
    defectNotificationPeriodMonths: 24,
    liquidatedDamagesRatePerDay: 0.001,
    liquidatedDamagesCapPercent: 5,
    disputeResolutionForum: "BANI_ARBITRATION",
    projectId: "PRJ-MRT-2026",
    status: "AT_RISK",
    riskScore: 78,
    totalAmendments: 1,
  },
  {
    id: "CTR-002",
    contractNumber: "CTR-IKN-PUPR-04",
    title: "Pembangunan Rusun Hunian ASN 4 Kawasan Inti IKN",
    clientName: "Kementerian PUPR BPPW Kalimantan Timur",
    contractType: "LPSE_PUPR",
    contractValue: 280000000000,
    currentValue: 280000000000,
    startDate: "2026-02-01",
    endDate: "2026-12-15",
    retentionPercent: 5,
    defectNotificationPeriodMonths: 12,
    liquidatedDamagesRatePerDay: 0.001,
    liquidatedDamagesCapPercent: 5,
    disputeResolutionForum: "DAB_ADJUDICATION",
    projectId: "PRJ-IKN-ASN4",
    status: "ACTIVE",
    riskScore: 32,
    totalAmendments: 0,
  },
  {
    id: "CTR-003",
    contractNumber: "CTR-BPJT-JBT-09",
    title: "Jembatan Cable Stayed Teluk Balikpapan Paket 2",
    clientName: "Badan Pengatur Jalan Tol (BPJT) PUPR",
    contractType: "FIDIC_YELLOW",
    contractValue: 620000000000,
    currentValue: 620000000000,
    startDate: "2026-01-10",
    endDate: "2028-02-28",
    retentionPercent: 5,
    defectNotificationPeriodMonths: 24,
    liquidatedDamagesRatePerDay: 0.001,
    liquidatedDamagesCapPercent: 10,
    disputeResolutionForum: "BANI_ARBITRATION",
    projectId: "PRJ-JBT-BLK",
    status: "ACTIVE",
    riskScore: 45,
    totalAmendments: 0,
  },
  {
    id: "CTR-004",
    contractNumber: "CTR-BWS-NTB-2026",
    title: "Pembangunan Bendungan Meninting Paket II Saluran Pelimpah",
    clientName: "Balai Wilayah Sungai (BWS) Nusa Tenggara I",
    contractType: "LPSE_PUPR",
    contractValue: 340000000000,
    currentValue: 340000000000,
    startDate: "2025-08-01",
    endDate: "2026-11-30",
    retentionPercent: 5,
    defectNotificationPeriodMonths: 12,
    liquidatedDamagesRatePerDay: 0.001,
    liquidatedDamagesCapPercent: 5,
    disputeResolutionForum: "DISTRICT_COURT",
    projectId: "PRJ-BDG-NTB",
    status: "DISPUTED",
    riskScore: 84,
    totalAmendments: 0,
  },
  {
    id: "CTR-005",
    contractNumber: "CTR-PTM-WH-021",
    title: "Smart Logistics Warehouse & CFS Hub Patimban",
    clientName: "PT Patimban Multi Terminal Logistic",
    contractType: "PRIVATE_TURNKEY",
    contractValue: 175000000000,
    currentValue: 175000000000,
    startDate: "2026-03-01",
    endDate: "2026-10-31",
    retentionPercent: 5,
    defectNotificationPeriodMonths: 12,
    liquidatedDamagesRatePerDay: 0.002,
    liquidatedDamagesCapPercent: 8,
    disputeResolutionForum: "BANI_ARBITRATION",
    projectId: "PRJ-PTM-LOG",
    status: "ACTIVE",
    riskScore: 28,
    totalAmendments: 0,
  },
];

const INITIAL_CLAUSES: ClauseItem[] = [
  {
    id: "CLS-001",
    contractId: "CTR-001",
    contractNumber: "CTR-MRT-2026-001",
    clauseNumber: "Klausul 8.7",
    clauseTitle: "Delay Damages (Liquidated Damages) & Unlimited Liability Risk",
    clauseText:
      "Apabila Kontraktor gagal menyelesaikan Pekerjaan tepat pada Waktu Penyelesaian, Kontraktor wajib membayar Denda Keterlambatan sebesar 1/1000 per hari dari Nilai Kontrak tanpa klausul pembebasan atas keterlambatan relokasi utilitas publik yang dilakukan oleh Pihak Ketiga.",
    clauseCategory: "LIQUIDATED_DAMAGES",
    riskLevel: "CRITICAL",
    riskScore: 92,
    deviationIdentified:
      "Klausul membebankan penalti keterlambatan mutlak tanpa klausul pengecualian (relief event) atas keterlambatan penyerahan lahan atau relokasi utilitas pipa gas/air milik instansi lain.",
    legalReference:
      "FIDIC Red Book Sub-Clause 8.4 (Extension of Time) & UU Jasa Konstruksi No. 2/2017 Pasal 47 ayat (1) huruf d tentang Kesetaraan Hak dan Kewajiban.",
    recommendation:
      "Ajukan amandemen pembelaan klausul perpanjangan waktu otomatis (deemed EOT) apabila terdapat keterlambatan pihak utilitas pemerintah yang di luar kendali kontraktor.",
    counterClauseProposal:
      "Kontraktor berhak atas Perpanjangan Waktu Penyelesaian (EOT) dan pembebasan denda keterlambatan apabila terjadi keterlambatan relokasi utilitas publik atau gangguan akses kerja oleh Pihak Ketiga.",
    aiConfidenceScore: 96,
    isAmended: false,
    analyzedAt: "2026-01-20T11:00:00Z",
  },
  {
    id: "CLS-002",
    contractId: "CTR-001",
    contractNumber: "CTR-MRT-2026-001",
    clauseNumber: "Klausul 13.8",
    clauseTitle: "Price Adjustments & Exclusion of Inflation Fluctuation",
    clauseText:
      "Harga Satuan dalam Kontrak ini bersifat Lumsum Mengikat dan Tetap (Fixed Lump Sum), dan tidak diberlakukan penyesuaian harga (eskalasi) akibat inflasi atau fluktuasi harga semen dan baja tulangan selama masa pelaksanaan.",
    clauseCategory: "PRICE_ESCALATION",
    riskLevel: "HIGH",
    riskScore: 81,
    deviationIdentified:
      "Meniadakan hak eskalasi pada proyek multi-years berdurasi lebih dari 12 bulan berpotensi merugikan kontraktor bila terjadi lonjakan harga bahan baku material strategis.",
    legalReference:
      "Permen PUPR No. 14/2020 tentang Standar Dokumen Pemilihan Pengadaan Jasa Konstruksi & Perpres No. 12/2021 Pasal 36.",
    recommendation:
      "Tambahkan formula eskalasi harga indeks BPS / BI untuk komponen material beton semen dan besi tulangan bila fluktuasi melampaui toleransi 5%.",
    counterClauseProposal:
      "Penyesuaian harga (eskalasi) diberlakukan untuk pekerjaan yang melampaui bulan ke-12 sejak penandatanganan kontrak berdasarkan formula indeks harga BPS.",
    aiConfidenceScore: 92,
    isAmended: true,
    analyzedAt: "2026-01-22T14:30:00Z",
  },
  {
    id: "CLS-003",
    contractId: "CTR-004",
    contractNumber: "CTR-BWS-NTB-2026",
    clauseNumber: "Klausul 20.2",
    clauseTitle: "Forum Penyelesaian Sengketa via Pengadilan Negeri Mataram",
    clauseText:
      "Segala perselisihan dan sengketa yang timbul dari pelaksanaan Kontrak ini akan diselesaikan secara eksklusif melalui Pengadilan Negeri Kelas IA Mataram.",
    clauseCategory: "DISPUTE_RESOLUTION",
    riskLevel: "HIGH",
    riskScore: 85,
    deviationIdentified:
      "Sengketa teknis rekayasa bendungan dialihkan ke Pengadilan Negeri umum yang memakan waktu panjang (banding/kasasi bertahun-tahun) alih-alih arbitrase teknis BANI atau Dewan Sengketa (DAB).",
    legalReference:
      "UU No. 2/2017 Pasal 88 (Penyelesaian Sengketa Jasa Konstruksi Mengutamakan Musyawarah, Mediasi, Dewan Sengketa, dan Arbitrase).",
    recommendation:
      "Ubah forum sengketa menjadi Arbitrase Badan Arbitrase Nasional Indonesia (BANI) dengan putusan final dan mengikat (final and binding) sesuai kaidah industri konstruksi.",
    counterClauseProposal:
      "Perselisihan yang tidak dapat diselesaikan melalui musyawarah atau Dewan Sengketa (DAB) dalam waktu 45 hari akan diputus secara final melalui Arbitrase BANI di Jakarta.",
    aiConfidenceScore: 95,
    isAmended: false,
    analyzedAt: "2026-02-05T09:15:00Z",
  },
  {
    id: "CLS-004",
    contractId: "CTR-002",
    contractNumber: "CTR-IKN-PUPR-04",
    clauseNumber: "Klausul 4.2",
    clauseTitle: "Jaminan Pelaksanaan (Performance Bond) & Pencairan Tanpa Bukti Cedera Janji",
    clauseText:
      "Pejabat Pembuat Komitmen berhak mencairkan Jaminan Pelaksanaan sebesar 5% dari Nilai Kontrak secara sepihak (unconditional) atas pertimbangan mandiri tanpa kewajiban membuktikan wanprestasi melalui verifikasi konsultan pengawas.",
    clauseCategory: "TERMINATION",
    riskLevel: "MEDIUM",
    riskScore: 68,
    deviationIdentified:
      "Pencairan tanpa verifikasi tim konsultan pengawas (MK) membuka risiko klaim sepihak bila terjadi salah paham administratif lapangan.",
    legalReference:
      "Standar SDP LKPP Bab Syarat-Syarat Umum Kontrak (SSUK) Pasal Ketentuan Jaminan Pelaksanaan.",
    recommendation:
      "Klarifikasi bahwa klaim pencairan jaminan wajib didahului Surat Peringatan (SP 1, SP 2, SP 3) dan audit teknis bersama Pengawas Lapangan.",
    counterClauseProposal:
      "Pencairan jaminan pelaksanaan hanya dapat dilakukan setelah diterbitkan Surat Peringatan Ketiga (SP-3) dan berita acara evaluasi teknis tim konsultan pengawas.",
    aiConfidenceScore: 88,
    isAmended: false,
    analyzedAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "CLS-005",
    contractId: "CTR-003",
    contractNumber: "CTR-BPJT-JBT-09",
    clauseNumber: "Klausul 17.1",
    clauseTitle: "Ganti Rugi Kerusakan Struktural & Batas Tanggung Jawab Desain",
    clauseText:
      "Kontraktor Bertanggung Jawab Penuh atas Desain Rancang Bangun (Design & Build) Jembatan dan membebaskan Pemilik Proyek dari seluruh tuntutan pihak ketiga hingga 10 tahun pasca FHO.",
    clauseCategory: "DEFECTS_LIABILITY",
    riskLevel: "MEDIUM",
    riskScore: 62,
    deviationIdentified:
      "Tanggung jawab kegagalan bangunan 10 tahun sesuai UU No. 2/2017 namun perlu ditegaskan batasan jika diakibatkan oleh beban lalu lintas berlebih (over-dimension over-load / ODOL).",
    legalReference:
      "UU No. 2/2017 Pasal 60 dan 65 tentang Tanggung Jawab Kegagalan Bangunan.",
    recommendation:
      "Tambahkan pasal perlindungan kontraktor dari kegagalan bangunan yang disebabkan modifikasi struktur tanpa izin atau beban kendaraan melampaui MST (Muatan Sumbu Terberat).",
    counterClauseProposal:
      "Tanggung jawab kegagalan struktur dikecualikan apabila terjadi akibat beban operasional melebihi kapasitas desain izin atau force majeure seismik melampaui SNI gempa.",
    aiConfidenceScore: 90,
    isAmended: false,
    analyzedAt: "2026-02-18T13:45:00Z",
  },
  {
    id: "CLS-006",
    contractId: "CTR-005",
    contractNumber: "CTR-PTM-WH-021",
    clauseNumber: "Klausul 14.7",
    clauseTitle: "Jangka Waktu Pembayaran Sertifikat Bulanan (Monthly Certificate)",
    clauseText:
      "Pemilik Proyek wajib membayar Tagihan Progress Termin Kontraktor paling lambat 28 hari kerja setelah diterbitkannya Sertifikat Pembayaran oleh Konsultan Manajemen Konstruksi.",
    clauseCategory: "PAYMENT_TERMS",
    riskLevel: "LOW",
    riskScore: 24,
    deviationIdentified:
      "Standar pembayaran normal sesuai praktek industri konstruksi komersial.",
    legalReference:
      "FIDIC Yellow Book Sub-Clause 14.7 (Payment) & Standar Asosiasi Kontraktor Indonesia (AKI).",
    recommendation:
      "Klausul telah seimbang. Pastikan flow penagihan internal dihubungkan ke sistem billing ERP agar tidak melewati tenggat verifikasi.",
    counterClauseProposal:
      "Klausul telah sesuai standar industri, tidak memerlukan usulan perubahan.",
    aiConfidenceScore: 97,
    isAmended: false,
    analyzedAt: "2026-03-05T15:00:00Z",
  },
];

const INITIAL_DISPUTES: DisputePredictionItem[] = [
  {
    id: "DSP-001",
    contractId: "CTR-001",
    contractNumber: "CTR-MRT-2026-001",
    contractTitle: "Pembangunan Stasiun Bawah Tanah Harmoni CP202",
    clientName: "PT MRT Jakarta (Perseroda)",
    disputeProbabilityPercent: 78,
    riskClassification: "CRITICAL_DISPUTE",
    primaryDrivers: [
      {
        factor: "Deviasi Progres Fisik SPI Rendah",
        weight: 35,
        severity: "HIGH",
        details: "SPI saat ini 0.82 akibat keterlambatan pergeseran jalur pipa gas PGN bawah tanah.",
      },
      {
        factor: "Keterlambatan Pembayaran Termin MC",
        weight: 25,
        severity: "HIGH",
        details: "MC #03 senilai Rp 32 Miliar tertahan 75 hari menunggu verifikasi addendum waktu.",
      },
      {
        factor: "CCO / Change Order Tidak Disetujui",
        weight: 25,
        severity: "HIGH",
        details: "4 berkas usulan pekerjaan tambah D-Wall belum ditandatangani PPK.",
      },
      {
        factor: "Klausul Penalti Keterlambatan Rigid",
        weight: 15,
        severity: "MEDIUM",
        details: "Klausul 8.7 tidak memuat relief event otomatis.",
      },
    ],
    potentialFinancialExposure: 22500000000,
    recommendedMitigation: [
      "Ajukan Surat Notifikasi Klaim Perpanjangan Waktu (EOT Notice) 45 hari mengacu FIDIC Sub-Clause 20.1.",
      "Minta rapat tripartit bersama Pemilik Proyek, Konsultan MK, dan Kontraktor untuk penandatanganan Addendum 02.",
      "Kirimkan somasi administratif atas keterlambatan pembayaran termin MC #03 guna menghindari default kontraktor.",
    ],
    recommendedForum: "Dewan Sengketa (DAB) diikuti Arbitrase BANI bila kebuntuan berlanjut.",
    evaluatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "DSP-002",
    contractId: "CTR-004",
    contractNumber: "CTR-BWS-NTB-2026",
    contractTitle: "Pembangunan Bendungan Meninting Paket II Saluran Pelimpah",
    clientName: "Balai Wilayah Sungai (BWS) Nusa Tenggara I",
    disputeProbabilityPercent: 84,
    riskClassification: "CRITICAL_DISPUTE",
    primaryDrivers: [
      {
        factor: "Sengketa Pembebasan Lahan Tambahan",
        weight: 40,
        severity: "CRITICAL",
        details: "Akses quarry material batu andesit diblokir warga selama 60 hari.",
      },
      {
        factor: "Klaim Cuaca Ekstrem (Curah Hujan Tinggi)",
        weight: 30,
        severity: "HIGH",
        details: "Banjir bandang merusak tanggul cofferdam sementara pada kuartal IV 2025.",
      },
      {
        factor: "Forum Sengketa di Pengadilan Negeri",
        weight: 20,
        severity: "HIGH",
        details: "Klausul 20.2 menetapkan PN Mataram yang berisiko eskalasi sengketa publik berkepanjangan.",
      },
      {
        factor: "Penolakan Berita Acara Keadaan Kahar",
        weight: 10,
        severity: "MEDIUM",
        details: "PPK belum menerbitkan SK Force Majeure resmi BMKG.",
      },
    ],
    potentialFinancialExposure: 17000000000,
    recommendedMitigation: [
      "Daftarkan permohonan Mediasi melalui Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP).",
      "Lampirkan data rekam cuaca resmi BMKG Stasiun Klimatologi Lombok Barat sebagai bukti keadaan kahar.",
      "Negosiasikan amandemen addendum pengalihan forum ke BANI Surabaya atau Jakarta.",
    ],
    recommendedForum: "Badan Arbitrase Nasional Indonesia (BANI).",
    evaluatedAt: "2026-02-28T16:20:00Z",
  },
  {
    id: "DSP-003",
    contractId: "CTR-003",
    contractNumber: "CTR-BPJT-JBT-09",
    contractTitle: "Jembatan Cable Stayed Teluk Balikpapan Paket 2",
    clientName: "Badan Pengatur Jalan Tol (BPJT) PUPR",
    disputeProbabilityPercent: 45,
    riskClassification: "MODERATE_MONITOR",
    primaryDrivers: [
      {
        factor: "Eskalasi Harga Baja Khusus High-Tensile",
        weight: 50,
        severity: "MEDIUM",
        details: "Kenaikan harga baja impor 14% di atas pagu penawaran tender.",
      },
      {
        factor: "Koordinasi Alur Pelayaran Pelabuhan",
        weight: 30,
        severity: "MEDIUM",
        details: "Waktu kerja pemancangan pylon dibatasi izin KSOP pelayaran.",
      },
    ],
    potentialFinancialExposure: 31000000000,
    recommendedMitigation: [
      "Ajukan permohonan penyesuaian harga (Price Adjustment) sesuai indeks eskalasi material khusus PUPR.",
      "Rapatkan izin alur pelayaran dengan KSOP Kelas I Balikpapan untuk window kerja malam hari.",
    ],
    recommendedForum: "Dispute Adjudication Board (DAB).",
    evaluatedAt: "2026-03-02T11:40:00Z",
  },
];

const INITIAL_AMENDMENTS: AmendmentItem[] = [
  {
    id: "AMD-001",
    contractId: "CTR-001",
    contractNumber: "CTR-MRT-2026-001",
    amendmentNumber: "ADD-01",
    title: "Addendum I: Perpanjangan Waktu (EOT) & Relokasi Utilitas Gas PGN",
    amendmentType: "SCOPE_CHANGE",
    costDelta: 12500000000,
    eotDays: 30,
    previousValue: 450000000000,
    newValue: 462500000000,
    previousEndDate: "2027-06-30",
    newEndDate: "2027-07-30",
    effectiveDate: "2026-02-20",
    signedByClient: "Budi Santoso, ST (PPK MRT Jakarta)",
    signedByContractor: "Ir. Hendra Wijaya (Project Director BuildFlow)",
    description: "Penyesuaian galian akibat relokasi pipa gas PGN dan penambahan masa kerja 30 hari kalender.",
  },
];

export default function ContractsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("PORTFOLIO");
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [clauses, setClauses] = useState<ClauseItem[]>(INITIAL_CLAUSES);
  const [disputes, setDisputes] = useState<DisputePredictionItem[]>(INITIAL_DISPUTES);
  const [amendments, setAmendments] = useState<AmendmentItem[]>(INITIAL_AMENDMENTS);

  // Filters
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("ALL");
  const [contractStatusFilter, setContractStatusFilter] = useState<string>("ALL");
  const [clauseRiskFilter, setClauseRiskFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showCreateContractModal, setShowCreateContractModal] = useState<boolean>(false);
  const [showAnalyzeClauseModal, setShowAnalyzeClauseModal] = useState<boolean>(false);
  const [showSimulateDisputeModal, setShowSimulateDisputeModal] = useState<boolean>(false);
  const [showCreateAmendmentModal, setShowCreateAmendmentModal] = useState<boolean>(false);

  // Selected clause for detail modal / view
  const [selectedClause, setSelectedClause] = useState<ClauseItem | null>(null);

  // Interactive Liquidated Damages (LD) Calculator State
  const [calcContractId, setCalcContractId] = useState<string>("CTR-001");
  const [calcDelayDays, setCalcDelayDays] = useState<number>(45);
  const [calcEligibleEotDays, setCalcEligibleEotDays] = useState<number>(20);
  const [calcDailyRate, setCalcDailyRate] = useState<number>(0.001);
  const [calcCapPercent, setCalcCapPercent] = useState<number>(5);

  // Form states for modals
  const [newContractForm, setNewContractForm] = useState({
    contractNumber: "",
    title: "",
    clientName: "",
    contractType: "FIDIC_RED",
    contractValue: 150000000000,
    startDate: "2026-04-01",
    endDate: "2027-04-01",
    liquidatedDamagesRatePerDay: 0.001,
    liquidatedDamagesCapPercent: 5,
    disputeResolutionForum: "BANI_ARBITRATION",
  });

  const [newClauseForm, setNewClauseForm] = useState({
    contractId: "CTR-001",
    clauseNumber: "Klausul 14.2",
    clauseTitle: "Ketentuan Uang Muka (Advance Payment) & Pengembalian",
    clauseText:
      "Pemilik Proyek berhak memotong pengembalian Uang Muka secara proporsional dari setiap Sertifikat Pembayaran Bulanan sebesar 20% sampai dengan lunas sebelum progres fisik mencapai 80%.",
    clauseCategory: "PAYMENT_TERMS",
  });

  const [newDisputeForm, setNewDisputeForm] = useState({
    contractId: "CTR-001",
    schedulePerformanceIndex: 0.85,
    unpaidInvoicesAgingDays: 65,
    unapprovedChangeOrdersCount: 3,
    siteAccessDelayDays: 14,
  });

  const [newAmendmentForm, setNewAmendmentForm] = useState({
    contractId: "CTR-001",
    amendmentNumber: "ADD-02",
    title: "Addendum II: Penambahan Volume D-Wall Zona Selatan",
    amendmentType: "COST_ADJUSTMENT",
    costDelta: 8500000000,
    eotDays: 15,
    effectiveDate: "2026-03-10",
    signedByClient: "Budi Santoso, ST (PPK)",
    signedByContractor: "Ir. Hendra Wijaya (Project Director)",
    description: "Penambahan kedalaman D-Wall elevasi -22m akibat lapisan batuan keras.",
  });

  // KPI Calculations
  const totalContractValue = useMemo(() => {
    return contracts.reduce((acc, curr) => acc + curr.currentValue, 0);
  }, [contracts]);

  const atRiskCount = useMemo(() => {
    return contracts.filter((c) => c.status === "AT_RISK" || c.status === "DISPUTED").length;
  }, [contracts]);

  const criticalClausesCount = useMemo(() => {
    return clauses.filter((c) => c.riskLevel === "CRITICAL" || c.riskLevel === "HIGH").length;
  }, [clauses]);

  const totalDisputeExposure = useMemo(() => {
    return disputes.reduce((acc, curr) => acc + curr.potentialFinancialExposure, 0);
  }, [disputes]);

  // Dynamic calculation for LD Calculator tab
  const activeCalcContract = useMemo(() => {
    return contracts.find((c) => c.id === calcContractId) || contracts[0];
  }, [contracts, calcContractId]);

  const calcResults = useMemo(() => {
    const contractValue = activeCalcContract.currentValue;
    const dailyPenalty = contractValue * calcDailyRate;
    const grossTotal = calcDelayDays * dailyPenalty;
    const maxCapAmount = contractValue * (calcCapPercent / 100);
    const effectiveGross = Math.min(grossTotal, maxCapAmount);

    const netDays = Math.max(0, calcDelayDays - calcEligibleEotDays);
    const netTotal = netDays * dailyPenalty;
    const effectiveNet = Math.min(netTotal, maxCapAmount);
    const savingsViaEot = effectiveGross - effectiveNet;
    const isCapReached = grossTotal >= maxCapAmount;

    return {
      contractValue,
      dailyPenalty,
      grossTotal,
      maxCapAmount,
      effectiveGross,
      netDays,
      effectiveNet,
      savingsViaEot,
      isCapReached,
    };
  }, [activeCalcContract, calcDelayDays, calcEligibleEotDays, calcDailyRate, calcCapPercent]);

  // Filtered Lists
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchType = contractTypeFilter === "ALL" || c.contractType === contractTypeFilter;
      const matchStatus = contractStatusFilter === "ALL" || c.status === contractStatusFilter;
      const matchSearch =
        searchQuery === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [contracts, contractTypeFilter, contractStatusFilter, searchQuery]);

  const filteredClauses = useMemo(() => {
    return clauses.filter((cl) => {
      const matchRisk = clauseRiskFilter === "ALL" || cl.riskLevel === clauseRiskFilter;
      const matchSearch =
        searchQuery === "" ||
        cl.clauseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cl.clauseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cl.contractNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRisk && matchSearch;
    });
  }, [clauses, clauseRiskFilter, searchQuery]);

  // Modal Submit Handlers
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = contracts.length + 1;
    const id = `CTR-${String(nextSeq).padStart(3, "0")}`;
    const newContract: ContractItem = {
      id,
      contractNumber: newContractForm.contractNumber || `CTR-2026-${String(nextSeq).padStart(3, "0")}`,
      title: newContractForm.title || "Proyek Konstruksi Baru",
      clientName: newContractForm.clientName || "Pemberi Kerja",
      contractType: newContractForm.contractType as ContractType,
      contractValue: Number(newContractForm.contractValue),
      currentValue: Number(newContractForm.contractValue),
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate,
      retentionPercent: 5,
      defectNotificationPeriodMonths: 12,
      liquidatedDamagesRatePerDay: Number(newContractForm.liquidatedDamagesRatePerDay),
      liquidatedDamagesCapPercent: Number(newContractForm.liquidatedDamagesCapPercent),
      disputeResolutionForum: newContractForm.disputeResolutionForum,
      status: "ACTIVE",
      riskScore: 25,
      totalAmendments: 0,
    };
    setContracts([newContract, ...contracts]);
    setShowCreateContractModal(false);
  };

  const handleAnalyzeClause = (e: React.FormEvent) => {
    e.preventDefault();
    const contract = contracts.find((c) => c.id === newClauseForm.contractId) || contracts[0];
    const nextSeq = clauses.length + 1;
    const id = `CLS-${String(nextSeq).padStart(3, "0")}`;

    const lower = newClauseForm.clauseText.toLowerCase();
    let riskLevel: ClauseRiskLevel = "LOW";
    let riskScore = 25;
    let deviation = "Klausul seimbang sesuai kaidah standar konstruksi.";
    let legalRef = "UU Jasa Konstruksi No. 2/2017 & Kaidah Umum FIDIC.";
    let rec = "Klausul dapat disetujui tanpa catatan khusus.";
    let counter = "Tidak memerlukan usulan perubahan.";

    if (lower.includes("potong") || lower.includes("retensi") || lower.includes("uang muka")) {
      riskLevel = "MEDIUM";
      riskScore = 55;
      deviation = "Ketentuan pengembalian uang muka berpotensi membebani cash flow operasional kontraktor jika progres fisik melambat.";
      legalRef = "Standar SDP LKPP Syarat-Syarat Khusus Kontrak (SSKK).";
      rec = "Pastikan batas akhir pelunasan uang muka selaras dengan batas progres 80% dan sertifikat termin bulanan.";
      counter = "Pemotongan uang muka dimulai setelah progres mencapai 20% dan diselesaikan proporsional hingga 80%.";
    }

    const newClause: ClauseItem = {
      id,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      clauseNumber: newClauseForm.clauseNumber,
      clauseTitle: newClauseForm.clauseTitle,
      clauseText: newClauseForm.clauseText,
      clauseCategory: newClauseForm.clauseCategory,
      riskLevel,
      riskScore,
      deviationIdentified: deviation,
      legalReference: legalRef,
      recommendation: rec,
      counterClauseProposal: counter,
      aiConfidenceScore: 95,
      isAmended: false,
      analyzedAt: new Date().toISOString(),
    };

    setClauses([newClause, ...clauses]);
    setShowAnalyzeClauseModal(false);
  };

  const handleCreateAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    const contract = contracts.find((c) => c.id === newAmendmentForm.contractId) || contracts[0];
    const nextSeq = amendments.length + 1;
    const id = `AMD-${String(nextSeq).padStart(3, "0")}`;
    const prevVal = contract.currentValue;
    const newVal = prevVal + Number(newAmendmentForm.costDelta);

    const prevDate = new Date(contract.endDate);
    prevDate.setDate(prevDate.getDate() + Number(newAmendmentForm.eotDays));
    const newEndDateStr = prevDate.toISOString().split("T")[0];

    const newAmd: AmendmentItem = {
      id,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      amendmentNumber: newAmendmentForm.amendmentNumber,
      title: newAmendmentForm.title,
      amendmentType: newAmendmentForm.amendmentType,
      costDelta: Number(newAmendmentForm.costDelta),
      eotDays: Number(newAmendmentForm.eotDays),
      previousValue: prevVal,
      newValue: newVal,
      previousEndDate: contract.endDate,
      newEndDate: newEndDateStr,
      effectiveDate: newAmendmentForm.effectiveDate,
      signedByClient: newAmendmentForm.signedByClient,
      signedByContractor: newAmendmentForm.signedByContractor,
      description: newAmendmentForm.description,
    };

    // Update contract in list
    setContracts(
      contracts.map((c) =>
        c.id === contract.id
          ? {
              ...c,
              currentValue: newVal,
              endDate: newEndDateStr,
              totalAmendments: c.totalAmendments + 1,
              status: "AMENDED",
            }
          : c
      )
    );

    setAmendments([newAmd, ...amendments]);
    setShowCreateAmendmentModal(false);
  };

  const handleSimulateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    const contract = contracts.find((c) => c.id === newDisputeForm.contractId) || contracts[0];
    const nextSeq = disputes.length + 1;
    const id = `DSP-${String(nextSeq).padStart(3, "0")}`;

    let score = 25;
    const drivers = [];
    if (newDisputeForm.schedulePerformanceIndex < 0.9) {
      score += 30;
      drivers.push({
        factor: "Deviasi Jadwal SPI Rendah",
        weight: 35,
        severity: "HIGH",
        details: `SPI sebesar ${newDisputeForm.schedulePerformanceIndex} menunjukkan perlambatan progres signifikan.`,
      });
    }
    if (newDisputeForm.unpaidInvoicesAgingDays > 60) {
      score += 25;
      drivers.push({
        factor: "Piutang Termin Tertahan",
        weight: 25,
        severity: "HIGH",
        details: `Piutang berumur ${newDisputeForm.unpaidInvoicesAgingDays} hari melebihi batas klausul pembayaran 28 hari.`,
      });
    }

    const prob = Math.min(95, score);
    const exposure = Math.round(contract.currentValue * (prob / 100) * 0.1);

    const newDsp: DisputePredictionItem = {
      id,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      contractTitle: contract.title,
      clientName: contract.clientName,
      disputeProbabilityPercent: prob,
      riskClassification: prob >= 75 ? "CRITICAL_DISPUTE" : prob >= 50 ? "HIGH_POTENTIAL" : "MODERATE_MONITOR",
      primaryDrivers: drivers,
      potentialFinancialExposure: exposure,
      recommendedMitigation: [
        "Kirim notifikasi formal klausul sengketa kepada PPK.",
        "Gelar musyawarah mufakat tripartit dengan konsultan pengawas.",
      ],
      recommendedForum: contract.disputeResolutionForum,
      evaluatedAt: new Date().toISOString(),
    };

    setDisputes([newDsp, ...disputes]);
    setShowSimulateDisputeModal(false);
  };

  return (
    <div className="overflow-x-hidden p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              AI Legal Contract Clause Analyzer & Dispute Predictor
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-200">
              FIDIC & BANI AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis otomatis klausul hukum konstruksi standar FIDIC/PUPR, kalkulator denda keterlambatan (LD), dan deteksi dini sengketa arbitrase BANI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateContractModal(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrasi Kontrak</span>
          </button>
          <button
            onClick={() => setShowAnalyzeClauseModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Analisis Klausul AI</span>
          </button>
          <button
            onClick={() => setShowCreateAmendmentModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 text-slate-100 hover:bg-slate-700 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <FileSignature className="w-4 h-4" />
            <span>Addendum Kontrak</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Nilai Kontrak */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Nilai Kontrak
            </span>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              Rp {(totalContractValue / 1000000000).toFixed(1)} M
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{contracts.length} Kontrak Terkelola</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Klausul Risiko Tinggi */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Klausul Risiko Kritis & Tinggi
            </span>
            <div className="text-xl sm:text-2xl font-bold text-rose-600">
              {criticalClausesCount} Klausul
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Dari total {clauses.length} pasal teranalisis AI
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Proyek Berisiko Sengketa */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Proyek Berisiko Sengketa
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600">
              {atRiskCount} Proyek
            </div>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Probabilitas sengketa BANI &gt; 70%</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Potensi Eksposur Finansial Sengketa / LD */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Potensi Eksposur Klaim/Denda
            </span>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              Rp {(totalDisputeExposure / 1000000000).toFixed(1)} M
            </div>
            <p className="text-[11px] text-indigo-600 font-medium">
              Tercakup mitigasi EOT & Amandemen
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("PORTFOLIO")}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "PORTFOLIO"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Portfolio Kontrak ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab("AI_CLAUSES")}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "AI_CLAUSES"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          AI Clause Analyzer ({clauses.length})
        </button>
        <button
          onClick={() => setActiveTab("DISPUTES")}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "DISPUTES"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Dispute Predictor & BANI ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab("LD_CALCULATOR")}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "LD_CALCULATOR"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Simulasi Kalkulator LD & EOT
        </button>
        <button
          onClick={() => setActiveTab("AMENDMENTS")}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "AMENDMENTS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Amandemen & Addendum ({amendments.length})
        </button>
      </div>

      {/* TAB 1: PORTFOLIO KONTRAK */}
      {activeTab === "PORTFOLIO" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nomor kontrak, judul, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Semua Standar Kontrak</option>
                <option value="FIDIC_RED">FIDIC Red Book</option>
                <option value="FIDIC_YELLOW">FIDIC Yellow Book</option>
                <option value="LPSE_PUPR">LPSE Standar PUPR</option>
                <option value="PRIVATE_TURNKEY">Private Turnkey EPC</option>
              </select>

              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif Berjalan</option>
                <option value="AT_RISK">At Risk (Peringatan)</option>
                <option value="DISPUTED">Sengketa Terbuka</option>
                <option value="AMENDED">Telah Diamandemen</option>
              </select>
            </div>

            <div className="text-xs text-muted-foreground self-end md:self-center">
              Menampilkan {filteredContracts.length} dari {contracts.length} kontrak
            </div>
          </div>

          {/* Desktop Table (hidden xl:block overflow-hidden w-full table-fixed) */}
          <div className="hidden xl:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full table-fixed text-left text-xs divide-y divide-border">
              <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-[16%]">No. Kontrak & Proyek</th>
                  <th className="py-3 px-4 w-[15%]">Pemilik (Client)</th>
                  <th className="py-3 px-4 w-[13%]">Standar & Forum</th>
                  <th className="py-3 px-4 w-[15%]">Nilai Kontrak (IDR)</th>
                  <th className="py-3 px-4 w-[13%]">Masa Pelaksanaan</th>
                  <th className="py-3 px-4 w-[12%] text-center">Ketentuan Denda (LD)</th>
                  <th className="py-3 px-4 w-[8%] text-center">Status</th>
                  <th className="py-3 px-4 w-[8%] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground truncate">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{c.contractNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground truncate">{c.clientName}</div>
                      <div className="text-[10px] text-muted-foreground">ID: {c.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {c.contractType.replace("_", " ")}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        Forum: {c.disputeResolutionForum.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        Rp {c.currentValue.toLocaleString("id-ID")}
                      </div>
                      {c.currentValue !== c.contractValue && (
                        <div className="text-[10px] text-amber-600">
                          Awal: Rp {c.contractValue.toLocaleString("id-ID")} ({c.totalAmendments} Addendum)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground text-[11px]">
                        {c.startDate} s.d. {c.endDate}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Retensi: {c.retentionPercent}% | DNP: {c.defectNotificationPeriodMonths} Bln
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs font-mono font-medium text-foreground">
                        {(c.liquidatedDamagesRatePerDay * 1000).toFixed(1)}‰ / hari
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Cap Maks: {c.liquidatedDamagesCapPercent}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : c.status === "AT_RISK"
                            ? "bg-amber-100 text-amber-700"
                            : c.status === "DISPUTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setCalcContractId(c.id);
                          setActiveTab("LD_CALCULATOR");
                        }}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Simulasi LD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card Fallback (xl:hidden) */}
          <div className="xl:hidden space-y-3">
            {filteredContracts.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{c.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{c.contractNumber}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : c.status === "AT_RISK"
                        ? "bg-amber-100 text-amber-700"
                        : c.status === "DISPUTED"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-2">
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <div className="font-medium text-foreground truncate">{c.clientName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Standar:</span>
                    <div className="font-medium text-foreground">{c.contractType.replace("_", " ")}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nilai Kontrak:</span>
                    <div className="font-medium text-foreground">
                      Rp {(c.currentValue / 1000000000).toFixed(2)} M
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Selesai:</span>
                    <div className="font-medium text-foreground">{c.endDate}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    Tarif LD: {(c.liquidatedDamagesRatePerDay * 1000).toFixed(1)}‰/hari (Cap {c.liquidatedDamagesCapPercent}%)
                  </span>
                  <button
                    onClick={() => {
                      setCalcContractId(c.id);
                      setActiveTab("LD_CALCULATOR");
                    }}
                    className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    <span>Hitung Denda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI CLAUSE ANALYZER */}
      {activeTab === "AI_CLAUSES" && (
        <div className="space-y-4">
          {/* Clause Filter Bar */}
          <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari pasal, kata kunci, deviasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={clauseRiskFilter}
                onChange={(e) => setClauseRiskFilter(e.target.value)}
                className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">Semua Tingkat Risiko</option>
                <option value="CRITICAL">Risiko Kritis (Critical)</option>
                <option value="HIGH">Risiko Tinggi (High)</option>
                <option value="MEDIUM">Risiko Sedang (Medium)</option>
                <option value="LOW">Risiko Rendah (Low)</option>
              </select>
            </div>

            <button
              onClick={() => setShowAnalyzeClauseModal(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs font-medium self-end md:self-center"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Analisis Teks Baru</span>
            </button>
          </div>

          {/* Clause Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClauses.map((cl) => (
              <div
                key={cl.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {cl.contractNumber} &bull; {cl.clauseNumber}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-1">{cl.clauseTitle}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cl.riskLevel === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : cl.riskLevel === "HIGH"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : cl.riskLevel === "MEDIUM"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {cl.riskLevel} (Skor {cl.riskScore})
                    </span>
                  </div>

                  {/* Original Clause Text Quote */}
                  <div className="bg-muted/40 p-3 rounded-lg border-l-2 border-primary text-xs text-foreground italic leading-relaxed">
                    &ldquo;{cl.clauseText}&rdquo;
                  </div>

                  {/* AI Legal Insight */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        Temuan Deviasi / Cacat Risiko:
                      </span>
                      <p className="text-muted-foreground mt-0.5">{cl.deviationIdentified}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Rujukan Regulasi / Standar:</span>
                      <p className="text-muted-foreground mt-0.5">{cl.legalReference}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Usulan Klausul Penyeimbang (Counter-Clause):
                      </span>
                      <p className="text-muted-foreground mt-0.5 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded border border-emerald-200 dark:border-emerald-900 font-mono text-[11px]">
                        {cl.counterClauseProposal}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Confidence: {cl.aiConfidenceScore}%</span>
                  </span>
                  <button
                    onClick={() => setSelectedClause(cl)}
                    className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    <span>Detail Rekomendasi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTE PREDICTOR & BANI */}
      {activeTab === "DISPUTES" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Construction Dispute Early Warning & BANI Predictor</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Model pembelajaran mesin mengkombinasikan indeks deviasi jadwal (SPI EVM), penuaan piutang sertifikat termin (MC), klaim CCO tertahan, dan klausul ganti rugi untuk memprediksi risiko sengketa sebelum bereskalasi ke persidangan.
              </p>
            </div>
            <button
              onClick={() => setShowSimulateDisputeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 self-start md:self-center"
            >
              <Activity className="w-4 h-4" />
              <span>Simulasi Proyek Baru</span>
            </button>
          </div>

          {/* Dispute Cards List */}
          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      ID: {d.id} &bull; {d.contractNumber}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{d.contractTitle}</h3>
                    <p className="text-xs text-muted-foreground">{d.clientName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Probabilitas Sengketa</div>
                      <div
                        className={`text-2xl font-black ${
                          d.disputeProbabilityPercent >= 75
                            ? "text-rose-600"
                            : d.disputeProbabilityPercent >= 50
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {d.disputeProbabilityPercent}%
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        d.riskClassification === "CRITICAL_DISPUTE"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : d.riskClassification === "HIGH_POTENTIAL"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {d.riskClassification.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Primary Risk Drivers */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Faktor Pemicu Risiko Utama:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {d.primaryDrivers.map((drv, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/40 p-3 rounded-lg border border-border space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground truncate">{drv.factor}</span>
                          <span className="text-[10px] font-mono text-rose-600 font-bold">
                            Bobot {drv.weight}%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{drv.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Exposure & Mitigation Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-border pt-3">
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-3 text-xs space-y-1">
                    <span className="text-muted-foreground text-[11px] uppercase font-semibold">
                      Estimasi Potensi Eksposur Finansial:
                    </span>
                    <div className="text-xl font-bold text-rose-700 dark:text-rose-400">
                      Rp {(d.potentialFinancialExposure / 1000000000).toFixed(2)} Miliar
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Berdasarkan kalkulasi denda LD, klaim kontraktor, dan biaya jasa arbitrase.
                    </p>
                  </div>

                  <div className="lg:col-span-2 space-y-1.5 text-xs">
                    <span className="font-semibold text-foreground">
                      Langkah Mitigasi Pencegahan Rekomendasi Legal:
                    </span>
                    <ul className="space-y-1 text-muted-foreground">
                      {d.recommendedMitigation.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium pt-1">
                      Forum Penyelesaian Acuan: {d.recommendedForum}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIQUIDATED DAMAGES & EOT CALCULATOR */}
      {activeTab === "LD_CALCULATOR" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Parameter Simulasi Denda LD & EOT</h3>
              </div>

              {/* Select Contract */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pilih Kontrak Proyek:</label>
                <select
                  value={calcContractId}
                  onChange={(e) => setCalcContractId(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Nilai Kontrak: Rp {(activeCalcContract.currentValue / 1000000000).toFixed(2)} M
                </p>
              </div>

              {/* Delay Days Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Total Hari Keterlambatan Fisik:</span>
                  <span className="font-mono font-bold text-rose-600">{calcDelayDays} Hari</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={calcDelayDays}
                  onChange={(e) => setCalcDelayDays(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Eligible EOT Days Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Hak EOT (Extension of Time):</span>
                  <span className="font-mono font-bold text-emerald-600">{calcEligibleEotDays} Hari</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={calcEligibleEotDays}
                  onChange={(e) => setCalcEligibleEotDays(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[10px] text-muted-foreground">
                  Hari kompensasi akibat keterlambatan owner / utilitas / force majeure.
                </p>
              </div>

              {/* Daily Rate & Cap % */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Tarif Harian:</label>
                  <select
                    value={calcDailyRate}
                    onChange={(e) => setCalcDailyRate(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  >
                    <option value={0.001}>1‰ (0.1% / hari)</option>
                    <option value={0.002}>2‰ (0.2% / hari)</option>
                    <option value={0.0005}>0.5‰ (0.05% / hari)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Batas Cap (%):</label>
                  <select
                    value={calcCapPercent}
                    onChange={(e) => setCalcCapPercent(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5"
                  >
                    <option value={5}>5% (Standar LPSE/PUPR)</option>
                    <option value={8}>8% (FIDIC Red)</option>
                    <option value={10}>10% (Batas Maksimum)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulation Results Card */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">Hasil Simulasi Finansial Denda Keterlambatan</h3>
                </div>
                {calcResults.isCapReached && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
                    Cap Maksimum Tercapai
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Denda Bruto (Tanpa EOT)</span>
                  <div className="text-xl font-bold text-rose-600">
                    Rp {(calcResults.effectiveGross / 1000000000).toFixed(2)} M
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Tarif harian: Rp {(calcResults.dailyPenalty / 1000000).toFixed(0)} Jt/hari
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 uppercase font-semibold">
                    Denda Netto (Dengan EOT)
                  </span>
                  <div className="text-xl font-bold text-emerald-600">
                    Rp {(calcResults.effectiveNet / 1000000000).toFixed(2)} M
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Sisa hari denda netto: {calcResults.netDays} hari
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-1">
                  <span className="text-xs text-indigo-800 dark:text-indigo-300 uppercase font-semibold">
                    Penghematan via Klaim EOT
                  </span>
                  <div className="text-xl font-bold text-indigo-600">
                    Rp {(calcResults.savingsViaEot / 1000000000).toFixed(2)} M
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Dari {calcEligibleEotDays} hari EOT valid
                  </p>
                </div>
              </div>

              {/* Cap Threshold Progress Bar */}
              <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Rasio Akumulasi Denda terhadap Batas Cap ({calcCapPercent}%):
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    Rp {(calcResults.effectiveNet / 1000000000).toFixed(2)} M / Rp{" "}
                    {(calcResults.maxCapAmount / 1000000000).toFixed(2)} M
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      calcResults.effectiveNet >= calcResults.maxCapAmount
                        ? "bg-rose-600"
                        : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (calcResults.effectiveNet / calcResults.maxCapAmount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Legal Strategy Advice */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <BookOpen className="w-4 h-4" />
                  <span>Rekomendasi Strategi Hukum Konstruksi:</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-[11px] leading-relaxed">
                  Segera konsolidasikan dokumen Berita Acara Rapat Lapangan, Site Memo Konsultan, dan rekaman cuaca BMKG untuk memperkuat klaim {calcEligibleEotDays} hari perpanjangan waktu. Berdasarkan UU Jasa Konstruksi No. 2/2017, klaim EOT yang diajukan sebelum berakhirnya kontrak efektif menggugurkan denda keterlambatan hingga Rp {(calcResults.savingsViaEot / 1000000000).toFixed(2)} Miliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AMENDEMEN & ADDENDUM */}
      {activeTab === "AMENDMENTS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Menampilkan {amendments.length} riwayat Addendum & Amandemen Kontrak resmi yang tercatat
            </div>
            <button
              onClick={() => setShowCreateAmendmentModal(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs font-medium self-end sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Addendum</span>
            </button>
          </div>

          {/* Desktop Table (hidden xl:block overflow-hidden w-full table-fixed) */}
          <div className="hidden xl:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full table-fixed text-left text-xs divide-y divide-border">
              <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-[16%]">No. Addendum & Kontrak</th>
                  <th className="py-3 px-4 w-[24%]">Judul Perubahan</th>
                  <th className="py-3 px-4 w-[13%]">Tipe Perubahan</th>
                  <th className="py-3 px-4 w-[15%]">Penyesuaian Biaya</th>
                  <th className="py-3 px-4 w-[14%]">Penyesuaian Waktu (EOT)</th>
                  <th className="py-3 px-4 w-[18%]">Penandatangan & Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {amendments.map((a) => (
                  <tr key={a.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{a.amendmentNumber}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{a.contractNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{a.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {a.amendmentType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-600">
                        +Rp {(a.costDelta / 1000000000).toFixed(2)} M
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Nilai Baru: Rp {(a.newValue / 1000000000).toFixed(2)} M
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">+{a.eotDays} Hari Kalender</div>
                      <div className="text-[10px] text-muted-foreground">Target Baru: {a.newEndDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-foreground truncate">{a.signedByClient}</div>
                      <div className="text-[10px] text-muted-foreground">Tgl Efektif: {a.effectiveDate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (xl:hidden) */}
          <div className="xl:hidden space-y-3">
            {amendments.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-sm text-foreground">{a.amendmentNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                    {a.amendmentType.replace("_", " ")}
                  </span>
                </div>
                <div className="font-medium text-foreground">{a.title}</div>
                <p className="text-[11px] text-muted-foreground">{a.description}</p>
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                  <div>
                    <span className="text-muted-foreground">Delta Biaya:</span>
                    <div className="font-semibold text-emerald-600">
                      +Rp {(a.costDelta / 1000000000).toFixed(2)} M
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tambahan Waktu:</span>
                    <div className="font-semibold text-foreground">+{a.eotDays} Hari (s.d. {a.newEndDate})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRASI KONTRAK */}
      {showCreateContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Registrasi Kontrak Konstruksi Baru</h3>
              <button
                onClick={() => setShowCreateContractModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Kontrak:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CTR-MRT-2026-002"
                  value={newContractForm.contractNumber}
                  onChange={(e) =>
                    setNewContractForm({ ...newContractForm, contractNumber: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Perjanjian Kontrak:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pembangunan Jembatan Layang Flyover Senayan"
                  value={newContractForm.title}
                  onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik Proyek (Client / Bouwheer):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinas Bina Marga DKI Jakarta"
                  value={newContractForm.clientName}
                  onChange={(e) =>
                    setNewContractForm({ ...newContractForm, clientName: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Standar Format Kontrak:</label>
                  <select
                    value={newContractForm.contractType}
                    onChange={(e) =>
                      setNewContractForm({ ...newContractForm, contractType: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="FIDIC_RED">FIDIC Red Book</option>
                    <option value="FIDIC_YELLOW">FIDIC Yellow Book</option>
                    <option value="FIDIC_SILVER">FIDIC Silver Book</option>
                    <option value="LPSE_PUPR">LPSE Standar PUPR</option>
                    <option value="PRIVATE_TURNKEY">Private Turnkey EPC</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Forum Sengketa:</label>
                  <select
                    value={newContractForm.disputeResolutionForum}
                    onChange={(e) =>
                      setNewContractForm({
                        ...newContractForm,
                        disputeResolutionForum: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="BANI_ARBITRATION">Arbitrase BANI</option>
                    <option value="DAB_ADJUDICATION">Dewan Sengketa (DAB)</option>
                    <option value="DISTRICT_COURT">Pengadilan Negeri</option>
                    <option value="MEDIATION">Mediasi Terstruktur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nilai Kontrak (IDR):</label>
                <input
                  type="number"
                  required
                  value={newContractForm.contractValue}
                  onChange={(e) =>
                    setNewContractForm({ ...newContractForm, contractValue: Number(e.target.value) })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.startDate}
                    onChange={(e) =>
                      setNewContractForm({ ...newContractForm, startDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Target Selesai:</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.endDate}
                    onChange={(e) =>
                      setNewContractForm({ ...newContractForm, endDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateContractModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Simpan Kontrak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ANALISIS KLAUSUL AI */}
      {showAnalyzeClauseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Analisis Klausul Kontrak via AI Legal</h3>
              <button
                onClick={() => setShowAnalyzeClauseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAnalyzeClause} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kontrak Acuan:</label>
                <select
                  value={newClauseForm.contractId}
                  onChange={(e) => setNewClauseForm({ ...newClauseForm, contractId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Pasal:</label>
                  <input
                    type="text"
                    required
                    value={newClauseForm.clauseNumber}
                    onChange={(e) =>
                      setNewClauseForm({ ...newClauseForm, clauseNumber: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Pasal:</label>
                  <select
                    value={newClauseForm.clauseCategory}
                    onChange={(e) =>
                      setNewClauseForm({ ...newClauseForm, clauseCategory: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="LIQUIDATED_DAMAGES">Denda Keterlambatan (LD)</option>
                    <option value="EXTENSION_OF_TIME">Perpanjangan Waktu (EOT)</option>
                    <option value="PRICE_ESCALATION">Eskalasi / Fluktuasi Harga</option>
                    <option value="TERMINATION">Pemutusan Kontrak / Terminasi</option>
                    <option value="PAYMENT_TERMS">Ketentuan Pembayaran</option>
                    <option value="DISPUTE_RESOLUTION">Forum Sengketa / Arbitrase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Klausul:</label>
                <input
                  type="text"
                  required
                  value={newClauseForm.clauseTitle}
                  onChange={(e) =>
                    setNewClauseForm({ ...newClauseForm, clauseTitle: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teks Lengkap Klausul Kontrak:</label>
                <textarea
                  rows={4}
                  required
                  value={newClauseForm.clauseText}
                  onChange={(e) => setNewClauseForm({ ...newClauseForm, clauseText: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnalyzeClauseModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Jalankan Analisis AI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SIMULASI PREDIKSI SENGKETA */}
      {showSimulateDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Simulasi Prediksi Risiko Sengketa Proyek</h3>
              <button
                onClick={() => setShowSimulateDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateDispute} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kontrak Proyek:</label>
                <select
                  value={newDisputeForm.contractId}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, contractId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Schedule Performance Index (SPI):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="1.5"
                    required
                    value={newDisputeForm.schedulePerformanceIndex}
                    onChange={(e) =>
                      setNewDisputeForm({
                        ...newDisputeForm,
                        schedulePerformanceIndex: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Aging Tagihan MC Macet (Hari):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    required
                    value={newDisputeForm.unpaidInvoicesAgingDays}
                    onChange={(e) =>
                      setNewDisputeForm({
                        ...newDisputeForm,
                        unpaidInvoicesAgingDays: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jumlah CCO Belum Disetujui:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={newDisputeForm.unapprovedChangeOrdersCount}
                    onChange={(e) =>
                      setNewDisputeForm({
                        ...newDisputeForm,
                        unapprovedChangeOrdersCount: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Keterlambatan Site Access (Hari):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={newDisputeForm.siteAccessDelayDays}
                    onChange={(e) =>
                      setNewDisputeForm({
                        ...newDisputeForm,
                        siteAccessDelayDays: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateDisputeModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Kalkulasi Risiko Sengketa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH ADDENDUM KONTRAK */}
      {showCreateAmendmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Pencatatan Addendum / Amandemen Kontrak</h3>
              <button
                onClick={() => setShowCreateAmendmentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAmendment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kontrak Induk:</label>
                <select
                  value={newAmendmentForm.contractId}
                  onChange={(e) =>
                    setNewAmendmentForm({ ...newAmendmentForm, contractId: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Addendum:</label>
                  <input
                    type="text"
                    required
                    value={newAmendmentForm.amendmentNumber}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, amendmentNumber: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe Perubahan:</label>
                  <select
                    value={newAmendmentForm.amendmentType}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, amendmentType: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="SCOPE_CHANGE">Perubahan Lingkup (Scope)</option>
                    <option value="TIME_EXTENSION_EOT">Perpanjangan Waktu (EOT)</option>
                    <option value="COST_ADJUSTMENT">Penyesuaian Biaya (Cost)</option>
                    <option value="TERMS_REVISION">Revisi Syarat Kontrak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Addendum:</label>
                <input
                  type="text"
                  required
                  value={newAmendmentForm.title}
                  onChange={(e) =>
                    setNewAmendmentForm({ ...newAmendmentForm, title: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Delta Biaya (+/- IDR):</label>
                  <input
                    type="number"
                    required
                    value={newAmendmentForm.costDelta}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, costDelta: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tambahan Waktu EOT (Hari):</label>
                  <input
                    type="number"
                    required
                    value={newAmendmentForm.eotDays}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, eotDays: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Efektif:</label>
                  <input
                    type="date"
                    required
                    value={newAmendmentForm.effectiveDate}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, effectiveDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Penandatangan Owner:</label>
                  <input
                    type="text"
                    required
                    value={newAmendmentForm.signedByClient}
                    onChange={(e) =>
                      setNewAmendmentForm({ ...newAmendmentForm, signedByClient: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Uraian Alasan Addendum:</label>
                <textarea
                  rows={2}
                  value={newAmendmentForm.description}
                  onChange={(e) =>
                    setNewAmendmentForm({ ...newAmendmentForm, description: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAmendmentModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Simpan Addendum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL KLAUSUL AI */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedClause.contractNumber} &bull; {selectedClause.clauseNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedClause.clauseTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedClause(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-indigo-600 italic">
                &ldquo;{selectedClause.clauseText}&rdquo;
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Analisis Cacat Risiko:</span>
                <p className="text-slate-600 leading-relaxed">{selectedClause.deviationIdentified}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Rujukan Regulasi:</span>
                <p className="text-slate-600">{selectedClause.legalReference}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Saran Negosiasi:</span>
                <p className="text-slate-600 leading-relaxed">{selectedClause.recommendation}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <span className="font-bold text-emerald-900 block mb-0.5">
                  Draf Usulan Counter-Clause:
                </span>
                <p className="text-emerald-800 font-mono text-[11px] leading-relaxed">
                  {selectedClause.counterClauseProposal}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end border-t pt-3">
              <button
                onClick={() => setSelectedClause(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700"
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
