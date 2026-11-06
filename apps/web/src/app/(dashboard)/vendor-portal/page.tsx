"use client";

import React, { useState } from "react";
import {
  Store,
  Building2,
  Award,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  Clock,
  HardHat,
  Scale,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export type VendorTier = "GOLD" | "SILVER" | "BRONZE" | "BLACKLISTED";
export type LegalStatus = "VERIFIED" | "PENDING" | "REJECTED" | "EXPIRED";

interface VendorRecord {
  id: string;
  vendorCode: string;
  companyName: string;
  brandName?: string;
  category: "MATERIAL_SUPPLIER" | "SPECIALIST_SUBCON" | "HEAVY_EQUIPMENT" | "SCAFFOLDING" | "LOGISTICS_SERVICE";
  tier: VendorTier;
  vpeScore: number;
  legalStatus: LegalStatus;
  nib: string;
  sbuNumber?: string;
  sbuGrade?: string;
  npwp: string;
  isPkp: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  certifications: string[];
  materialsSupplied: string[];
  activeContractsCount: number;
  totalCompletedContracts: number;
  ncrCount: number;
  sanctionReason?: string;
  sanctionDate?: string;
  registeredAt: string;
  lastEvaluatedAt: string;
}

interface VpeEvaluationRecord {
  id: string;
  evaluationNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  evaluationPeriod: string;
  qualityScore: number;
  deliveryScore: number;
  hseScore: number;
  commercialScore: number;
  weightedScore: number;
  resultingTier: VendorTier;
  ncrCount: number;
  evaluatorName: string;
  remarks: string;
  evaluatedDate: string;
}

interface RfqRecord {
  id: string;
  rfqNumber: string;
  title: string;
  projectId: string;
  projectName: string;
  category: string;
  estimatedBudget: number;
  submissionDeadline: string;
  deliveryLocation: string;
  targetDeliveryDate: string;
  status: "OPEN" | "UNDER_EVALUATION" | "AWARDED" | "CANCELLED";
  requiredVendorTier: "ALL" | "GOLD" | "SILVER_ABOVE";
  items: Array<{
    id: string;
    itemName: string;
    spec: string;
    quantity: number;
    uom: string;
  }>;
  bidsCount: number;
  lowestBidAmount?: number;
  awardedVendorId?: string;
  awardedVendorName?: string;
  createdAt: string;
}

interface RfqBidRecord {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  vendorTier: VendorTier;
  quotedAmount: number;
  deliveryLeadTimeDays: number;
  warrantyMonths: number;
  paymentTerms: string;
  tkdnPercentage: number;
  isSealed: boolean;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED";
  technicalNotes?: string;
  submittedAt: string;
}

export default function VendorPortalPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "evaluasi" | "rfq" | "legalitas">("directory");

  // Notifications
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "warning"; text: string } | null>(null);

  // Filter States
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [isSubmitBidOpen, setIsSubmitBidOpen] = useState(false);
  const [selectedRfqForBid, setSelectedRfqForBid] = useState<RfqRecord | null>(null);
  const [selectedVendorDetail, setSelectedVendorDetail] = useState<VendorRecord | null>(null);

  // Master State
  const [vendors, setVendors] = useState<VendorRecord[]>([
    {
      id: "VND-001",
      vendorCode: "VND-2026-001",
      companyName: "PT Solusi Bangun Semen Indonesia",
      brandName: "Dynamix Cement",
      category: "MATERIAL_SUPPLIER",
      tier: "GOLD",
      vpeScore: 89.5,
      legalStatus: "VERIFIED",
      nib: "9120003456781",
      sbuNumber: "SBU-LPJK-2024-B1-002",
      sbuGrade: "B1",
      npwp: "01.234.567.8-012.000",
      isPkp: true,
      bankName: "Bank Mandiri",
      bankAccountNumber: "123-00-0987654-3",
      bankAccountName: "PT Solusi Bangun Semen Indonesia",
      contactPerson: "Ir. Hendro Wijaya",
      email: "hendro.wijaya@solusibangun.co.id",
      phone: "+628118899001",
      address: "Kawasan Industri Tuban & Plant Narogong KM 22",
      city: "Bogor",
      province: "Jawa Barat",
      certifications: ["SNI 2049:2015", "ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "Green Label Gold"],
      materialsSupplied: ["Semen PCC 50kg", "Semen OPC Tipe 1 Curah", "Semen Rendah Kalor Mass Concrete"],
      activeContractsCount: 3,
      totalCompletedContracts: 18,
      ncrCount: 0,
      registeredAt: "2024-02-10T08:00:00Z",
      lastEvaluatedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "VND-002",
      vendorCode: "VND-2026-002",
      companyName: "PT Krakatau Steel (Persero) Tbk",
      brandName: "KS Wire & Bar",
      category: "MATERIAL_SUPPLIER",
      tier: "GOLD",
      vpeScore: 92.4,
      legalStatus: "VERIFIED",
      nib: "8120009876543",
      sbuNumber: "SBU-LPJK-2024-B2-001",
      sbuGrade: "B2",
      npwp: "01.000.123.4-051.000",
      isPkp: true,
      bankName: "Bank BNI",
      bankAccountNumber: "987-654-3210",
      bankAccountName: "PT Krakatau Steel (Persero) Tbk",
      contactPerson: "Dra. Maya Kusuma",
      email: "maya.kusuma@krakatausteel.com",
      phone: "+6281234567890",
      address: "Kawasan Industri Krakatau Steel, Jl. Industri No. 5",
      city: "Cilegon",
      province: "Banten",
      certifications: ["SNI 2052:2017", "ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "TKDN > 75%"],
      materialsSupplied: ["Baja Tulangan Polos BJTP 280", "Baja Tulangan Sirip BJTS 420B", "Baja Profil WF", "Sheet Pile"],
      activeContractsCount: 4,
      totalCompletedContracts: 32,
      ncrCount: 0,
      registeredAt: "2023-08-15T09:00:00Z",
      lastEvaluatedAt: "2026-03-02T14:30:00Z",
    },
    {
      id: "VND-003",
      vendorCode: "VND-2026-003",
      companyName: "PT Trakindo Utama Heavy Machinery",
      brandName: "Caterpillar Indonesia",
      category: "HEAVY_EQUIPMENT",
      tier: "GOLD",
      vpeScore: 87.0,
      legalStatus: "VERIFIED",
      nib: "9120005544332",
      sbuNumber: "SBU-LPJK-2024-B1-044",
      sbuGrade: "B1",
      npwp: "01.445.678.9-031.000",
      isPkp: true,
      bankName: "Bank Mandiri",
      bankAccountNumber: "127-00-5566778-9",
      bankAccountName: "PT Trakindo Utama",
      contactPerson: "Budi Santoso, S.T.",
      email: "budi.santoso@trakindo.co.id",
      phone: "+6281399887766",
      address: "Gedung Trakindo Utama, Jl. Cilandak KKO Raya No. 1",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      certifications: ["ISO 9001:2015", "SMK3 Kemnaker Emas", "SILO Disnaker Resmi", "Cat Certified Tech"],
      materialsSupplied: ["Excavator 20-40 Ton", "Bulldozer D6R", "Motor Grader 140K", "Vibro Roller 12 Ton"],
      activeContractsCount: 2,
      totalCompletedContracts: 14,
      ncrCount: 0,
      registeredAt: "2024-01-20T11:00:00Z",
      lastEvaluatedAt: "2026-02-28T16:00:00Z",
    },
    {
      id: "VND-004",
      vendorCode: "VND-2026-004",
      companyName: "PT Varia Usaha Beton (SIG Group)",
      brandName: "VUB Ready Mix",
      category: "MATERIAL_SUPPLIER",
      tier: "SILVER",
      vpeScore: 78.8,
      legalStatus: "VERIFIED",
      nib: "9120001122334",
      sbuNumber: "SBU-LPJK-2024-M2-012",
      sbuGrade: "M2",
      npwp: "01.555.888.2-021.000",
      isPkp: true,
      bankName: "Bank BRI",
      bankAccountNumber: "0341-01-000892-30-1",
      bankAccountName: "PT Varia Usaha Beton",
      contactPerson: "Ahmad Faisal, S.T.",
      email: "a.faisal@vubeton.co.id",
      phone: "+6281566778899",
      address: "Jl. Veteran No. 129, Kebomas",
      city: "Gresik",
      province: "Jawa Timur",
      certifications: ["SNI 4433:2016", "ISO 9001:2015", "ISO 45001:2018"],
      materialsSupplied: ["Ready Mix Beton fc 20 - fc 50 MPa", "Precast U-Ditch & Box Culvert", "Tiang Pancang Square"],
      activeContractsCount: 2,
      totalCompletedContracts: 11,
      ncrCount: 1,
      registeredAt: "2024-04-12T13:00:00Z",
      lastEvaluatedAt: "2026-03-05T09:15:00Z",
    },
    {
      id: "VND-005",
      vendorCode: "VND-2026-005",
      companyName: "PT Freyssinet Total Technology",
      brandName: "Freyssinet Indonesia",
      category: "SPECIALIST_SUBCON",
      tier: "GOLD",
      vpeScore: 94.2,
      legalStatus: "VERIFIED",
      nib: "9120007788990",
      sbuNumber: "SBU-LPJK-2024-B2-088",
      sbuGrade: "B2",
      npwp: "01.777.999.3-042.000",
      isPkp: true,
      bankName: "Bank BCA",
      bankAccountNumber: "522-098-7654",
      bankAccountName: "PT Freyssinet Total Tech",
      contactPerson: "Jean-Pierre Pratama, Ir.",
      email: "jp.pratama@freyssinet.co.id",
      phone: "+628111223344",
      address: "Gandaria 8 Office Tower Lt. 18, Jl. Sultan Iskandar Muda",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      certifications: ["ISO 9001:2015", "ISO 45001:2018", "PTI Specialist Certified", "SMK3 Platinum"],
      materialsSupplied: ["Post-Tensioning Strand", "Expansion Joint Jembatan", "Elastomeric Bearing Pad", "Geotechnical Anchors"],
      activeContractsCount: 3,
      totalCompletedContracts: 22,
      ncrCount: 0,
      registeredAt: "2023-11-05T10:00:00Z",
      lastEvaluatedAt: "2026-03-03T11:20:00Z",
    },
    {
      id: "VND-006",
      vendorCode: "VND-2026-006",
      companyName: "PT Scaffolding Megah Perkasa",
      brandName: "Megah Scaffolding System",
      category: "SCAFFOLDING",
      tier: "SILVER",
      vpeScore: 74.5,
      legalStatus: "VERIFIED",
      nib: "9120002233445",
      sbuNumber: "SBU-LPJK-2024-M1-039",
      sbuGrade: "M1",
      npwp: "02.333.444.5-015.000",
      isPkp: true,
      bankName: "Bank Mandiri",
      bankAccountNumber: "133-00-1122334-5",
      bankAccountName: "PT Scaffolding Megah Perkasa",
      contactPerson: "Teguh Wicaksono",
      email: "teguh@megahscaffolding.com",
      phone: "+6281788991122",
      address: "Jl. Raya Narogong KM 14, Pangkalan 3",
      city: "Bekasi",
      province: "Jawa Barat",
      certifications: ["SNI 03-3430-1994", "ISO 9001:2015", "Disnaker Scaffolding Inspector Certified"],
      materialsSupplied: ["Main Frame Scaffolding", "Ringlock Modular Scaffolding", "Formwork Aluma & Plywood Film"],
      activeContractsCount: 1,
      totalCompletedContracts: 9,
      ncrCount: 1,
      registeredAt: "2024-05-18T14:00:00Z",
      lastEvaluatedAt: "2026-02-25T15:00:00Z",
    },
    {
      id: "VND-007",
      vendorCode: "VND-2026-007",
      companyName: "CV Putra Mandiri Konstruksi",
      brandName: "Putra Mandiri Earthworks",
      category: "SPECIALIST_SUBCON",
      tier: "BRONZE",
      vpeScore: 62.0,
      legalStatus: "PENDING",
      nib: "9120004455667",
      sbuNumber: "SBU-LPJK-2025-K3-091",
      sbuGrade: "K3",
      npwp: "03.888.777.1-412.000",
      isPkp: false,
      bankName: "Bank Jateng",
      bankAccountNumber: "1-029-38475-6",
      bankAccountName: "CV Putra Mandiri Konstruksi",
      contactPerson: "Slamet Riyadi",
      email: "putramandiri.earth@gmail.com",
      phone: "+6285223344556",
      address: "Jl. Solo-Purwodadi KM 18, Kalijambe",
      city: "Sragen",
      province: "Jawa Tengah",
      certifications: ["Surat Izin Usaha Jasa Konstruksi (IUJK) Daerah"],
      materialsSupplied: ["Galian & Timbunan Tanah Pilihan", "Subbase Pasir Batu (Sirtu)", "Perapihan Talud"],
      activeContractsCount: 1,
      totalCompletedContracts: 3,
      ncrCount: 2,
      registeredAt: "2025-10-10T09:30:00Z",
      lastEvaluatedAt: "2026-02-15T10:30:00Z",
    },
    {
      id: "VND-008",
      vendorCode: "VND-2026-008",
      companyName: "PT Borneo Geosintetik Abadi",
      brandName: "Borneo Geotextile",
      category: "MATERIAL_SUPPLIER",
      tier: "SILVER",
      vpeScore: 76.5,
      legalStatus: "VERIFIED",
      nib: "9120006677889",
      sbuNumber: "SBU-LPJK-2024-M2-055",
      sbuGrade: "M2",
      npwp: "02.999.111.4-721.000",
      isPkp: true,
      bankName: "Bank Danamon",
      bankAccountNumber: "003-556-7890",
      bankAccountName: "PT Borneo Geosintetik Abadi",
      contactPerson: "Hj. Ratna Sari, S.T.",
      email: "ratna@borneogeosintetik.com",
      phone: "+6281255667788",
      address: "Jl. Soekarno-Hatta KM 5.5, Kariangau",
      city: "Balikpapan",
      province: "Kalimantan Timur",
      certifications: ["SNI Geotekstil", "ISO 9001:2015", "TKDN 62%"],
      materialsSupplied: ["Geotextile Woven 250gr", "Geotextile Non-Woven 300gr", "Geogrid Biaxial", "HDPE Geomembrane 1.5mm"],
      activeContractsCount: 2,
      totalCompletedContracts: 7,
      ncrCount: 0,
      registeredAt: "2024-09-01T10:00:00Z",
      lastEvaluatedAt: "2026-03-01T14:00:00Z",
    },
    {
      id: "VND-009",
      vendorCode: "VND-2026-009",
      companyName: "PT Cipta Kreasi Subkonindo",
      brandName: "CKS Electrical",
      category: "SPECIALIST_SUBCON",
      tier: "BLACKLISTED",
      vpeScore: 38.0,
      legalStatus: "REJECTED",
      nib: "9120009988112",
      sbuNumber: "SBU-LPJK-2023-M1-819 (DICABUT)",
      sbuGrade: "M1",
      npwp: "01.666.222.8-062.000",
      isPkp: true,
      bankName: "Bank Mandiri",
      bankAccountNumber: "142-00-9988112-3",
      bankAccountName: "PT Cipta Kreasi Subkonindo",
      contactPerson: "Deni Kurniawan",
      email: "deni.k@cks-subcon.id",
      phone: "+6281800991122",
      address: "Ruko Rungkut Megah Raya Blok D-14",
      city: "Surabaya",
      province: "Jawa Timur",
      certifications: [],
      materialsSupplied: ["Kabel Power NYY/NYFGBY", "Panel Distribusi MDP/SDP", "Instalasi Tray Kabel"],
      activeContractsCount: 0,
      totalCompletedContracts: 2,
      ncrCount: 6,
      sanctionReason: "Abandonment proyek MEP Gedung Rawat Inap RS Surabaya & Pemalsuan Sertifikat Uji Kabel",
      sanctionDate: "2026-01-15T08:00:00Z",
      registeredAt: "2023-06-20T08:00:00Z",
      lastEvaluatedAt: "2026-01-14T11:00:00Z",
    },
  ]);

  const [evaluations, setEvaluations] = useState<VpeEvaluationRecord[]>([
    {
      id: "VPE-001",
      evaluationNumber: "VPE-2026-001",
      vendorId: "VND-001",
      vendorName: "PT Solusi Bangun Semen Indonesia",
      projectId: "PRJ-IKN-001",
      projectName: "Pembangunan Istana Negara IKN Tahap II",
      evaluationPeriod: "2026-Q1",
      qualityScore: 92,
      deliveryScore: 88,
      hseScore: 90,
      commercialScore: 85,
      weightedScore: 89.5,
      resultingTier: "GOLD",
      ncrCount: 0,
      evaluatorName: "Bambang Kusumo, S.T. (Senior Procurement Lead)",
      remarks: "Pasokan semen curah tepat waktu via jetty Balikpapan. Kualitas konsisten dengan sertifikat uji lab terverifikasi.",
      evaluatedDate: "2026-03-01T10:00:00Z",
    },
    {
      id: "VPE-002",
      evaluationNumber: "VPE-2026-002",
      vendorId: "VND-002",
      vendorName: "PT Krakatau Steel (Persero) Tbk",
      projectId: "PRJ-PTB-002",
      projectName: "Pengembangan Pelabuhan Patimban Subang Tahap 2",
      evaluationPeriod: "2026-Q1",
      qualityScore: 95,
      deliveryScore: 90,
      hseScore: 94,
      commercialScore: 88,
      weightedScore: 92.4,
      resultingTier: "GOLD",
      ncrCount: 0,
      evaluatorName: "Dewi Anggraini, S.T. (QA/QC Procurement Manager)",
      remarks: "Hasil uji tarik baja tulangan BJTS 420B memenuhi syarat ASTM/SNI. Tidak ada karat permukaan signifikan saat serah terima.",
      evaluatedDate: "2026-03-02T14:30:00Z",
    },
    {
      id: "VPE-003",
      evaluationNumber: "VPE-2026-003",
      vendorId: "VND-005",
      vendorName: "PT Freyssinet Total Technology",
      projectId: "PRJ-LRT-003",
      projectName: "LRT Velodrome-Manggarai Flyover Package",
      evaluationPeriod: "2026-Q1",
      qualityScore: 96,
      deliveryScore: 92,
      hseScore: 95,
      commercialScore: 90,
      weightedScore: 94.2,
      resultingTier: "GOLD",
      ncrCount: 0,
      evaluatorName: "Ir. Taufik Hidayat (Bridge Specialist Consultant)",
      remarks: "Metode stressing post-tensioning sangat rapi dan presisi kalibrasi dongkrak hidrolik akurat.",
      evaluatedDate: "2026-03-03T11:20:00Z",
    },
    {
      id: "VPE-004",
      evaluationNumber: "VPE-2026-004",
      vendorId: "VND-004",
      vendorName: "PT Varia Usaha Beton (SIG Group)",
      projectId: "PRJ-TOL-004",
      projectName: "Tol Trans Sumatera Ruas Tebing Tinggi-Parapat",
      evaluationPeriod: "2026-Q1",
      qualityScore: 80,
      deliveryScore: 76,
      hseScore: 82,
      commercialScore: 78,
      weightedScore: 78.8,
      resultingTier: "SILVER",
      ncrCount: 1,
      evaluatorName: "Rahmat Subekti (Site Logistics Coordinator)",
      remarks: "Sempat terjadi keterlambatan 1 hari batching plant akibat maintenance pompa, namun segera teratasi dengan batching cadangan.",
      evaluatedDate: "2026-03-05T09:15:00Z",
    },
    {
      id: "VPE-005",
      evaluationNumber: "VPE-2026-005",
      vendorId: "VND-007",
      vendorName: "CV Putra Mandiri Konstruksi",
      projectId: "PRJ-BNR-005",
      projectName: "Bendungan Bener Purworejo Access Road",
      evaluationPeriod: "2026-Q1",
      qualityScore: 65,
      deliveryScore: 60,
      hseScore: 60,
      commercialScore: 65,
      weightedScore: 62.0,
      resultingTier: "BRONZE",
      ncrCount: 2,
      evaluatorName: "Yusuf Maulana (Site QC Inspector)",
      remarks: "Kepadatan tanah timbunan belum seragam pada uji sand cone pertama. Diperlukan compactor tambahan dan supervisi K3 pekerja.",
      evaluatedDate: "2026-02-15T10:30:00Z",
    },
  ]);

  const [rfqs, setRfqs] = useState<RfqRecord[]>([
    {
      id: "RFQ-001",
      rfqNumber: "RFQ-2026-001",
      title: "Pengadaan Baja Tulangan Ulir Proyek IKN Tahap II",
      projectId: "PRJ-IKN-001",
      projectName: "Pembangunan Istana Negara IKN Tahap II",
      category: "Baja & Struktur Logam",
      estimatedBudget: 8500000000,
      submissionDeadline: "2026-03-25T17:00:00Z",
      deliveryLocation: "Pelabuhan Cita Sabut / Stockyard IKN KIPP",
      targetDeliveryDate: "2026-04-10",
      status: "OPEN",
      requiredVendorTier: "SILVER_ABOVE",
      items: [
        { id: "ITM-01", itemName: "Baja Tulangan Sirip BJTS 420B D25", spec: "SNI 2052:2017 Panjang 12m", quantity: 350, uom: "TON" },
        { id: "ITM-02", itemName: "Baja Tulangan Sirip BJTS 420B D16", spec: "SNI 2052:2017 Panjang 12m", quantity: 280, uom: "TON" },
      ],
      bidsCount: 2,
      lowestBidAmount: 8150000000,
      createdAt: "2026-03-01T08:00:00Z",
    },
    {
      id: "RFQ-002",
      rfqNumber: "RFQ-2026-002",
      title: "Sewa Heavy Duty Tower Crane 10-Ton Proyek RS Regional Medan",
      projectId: "PRJ-RSM-002",
      projectName: "RS Regional Medan Modern Medical Center",
      category: "Alat Berat & Rental",
      estimatedBudget: 1450000000,
      submissionDeadline: "2026-03-20T15:00:00Z",
      deliveryLocation: "Jl. Willem Iskandar Kav. 12, Medan Estate",
      targetDeliveryDate: "2026-04-01",
      status: "UNDER_EVALUATION",
      requiredVendorTier: "GOLD",
      items: [
        { id: "ITM-03", itemName: "Sewa Tower Crane Jib 60m 10-Ton", spec: "Tahun rakitan >= 2020 + Operator SILO", quantity: 6, uom: "BULAN" },
        { id: "ITM-04", itemName: "Jasa Erection & Dismantling TC", spec: "Termasuk pondasi angkur & perizinan Disnaker", quantity: 1, uom: "LOT" },
      ],
      bidsCount: 1,
      lowestBidAmount: 1380000000,
      createdAt: "2026-02-20T09:00:00Z",
    },
    {
      id: "RFQ-003",
      rfqNumber: "RFQ-2026-003",
      title: "Supply Beton Ready Mix Mutu fc 35 MPa Flyover Kalimalang",
      projectId: "PRJ-KLM-003",
      projectName: "Flyover Kalimalang Interchange Toll",
      category: "Ready Mix & Precast",
      estimatedBudget: 4800000000,
      submissionDeadline: "2026-02-28T17:00:00Z",
      deliveryLocation: "Batching Point Exit Bekasi Barat",
      targetDeliveryDate: "2026-03-15",
      status: "AWARDED",
      requiredVendorTier: "ALL",
      items: [
        { id: "ITM-05", itemName: "Beton Ready Mix fc 35 MPa Slump 12±2cm", spec: "Semen OPC Tipe 1 + Fly Ash max 15%", quantity: 4200, uom: "M3" },
      ],
      bidsCount: 3,
      lowestBidAmount: 4620000000,
      awardedVendorId: "VND-004",
      awardedVendorName: "PT Varia Usaha Beton (SIG Group)",
      createdAt: "2026-02-10T10:00:00Z",
    },
  ]);

  const [bids, setBids] = useState<RfqBidRecord[]>([
    {
      id: "BID-001",
      rfqId: "RFQ-001",
      vendorId: "VND-002",
      vendorName: "PT Krakatau Steel (Persero) Tbk",
      vendorTier: "GOLD",
      quotedAmount: 8150000000,
      deliveryLeadTimeDays: 14,
      warrantyMonths: 12,
      paymentTerms: "SKBDN 90 Hari setelah BAST Material On Site",
      tkdnPercentage: 78.5,
      isSealed: true,
      status: "SUBMITTED",
      technicalNotes: "Franko Jetty Balikpapan / Stockyard IKN KIPP. Pengiriman bertahap 4 shipment.",
      submittedAt: "2026-03-03T11:00:00Z",
    },
    {
      id: "BID-002",
      rfqId: "RFQ-001",
      vendorId: "VND-001",
      vendorName: "PT Solusi Bangun Semen Indonesia",
      vendorTier: "GOLD",
      quotedAmount: 8350000000,
      deliveryLeadTimeDays: 12,
      warrantyMonths: 12,
      paymentTerms: "Termin 30 Hari via SCF Mandiri",
      tkdnPercentage: 82.0,
      isSealed: true,
      status: "SUBMITTED",
      technicalNotes: "Mitra konsorsium baja Krakatau Posco.",
      submittedAt: "2026-03-04T15:20:00Z",
    },
    {
      id: "BID-003",
      rfqId: "RFQ-002",
      vendorId: "VND-003",
      vendorName: "PT Trakindo Utama Heavy Machinery",
      vendorTier: "GOLD",
      quotedAmount: 1380000000,
      deliveryLeadTimeDays: 7,
      warrantyMonths: 6,
      paymentTerms: "Termin Bulanan Net 30",
      tkdnPercentage: 65.0,
      isSealed: true,
      status: "SUBMITTED",
      technicalNotes: "Termasuk teknisi on-site 24/7 dan penggantian parts darurat < 24 jam.",
      submittedAt: "2026-02-25T14:10:00Z",
    },
  ]);

  // Form States
  const [registerForm, setRegisterForm] = useState({
    companyName: "",
    brandName: "",
    category: "MATERIAL_SUPPLIER" as VendorRecord["category"],
    nib: "",
    sbuNumber: "",
    sbuGrade: "B1",
    npwp: "",
    isPkp: true,
    bankName: "Bank Mandiri",
    bankAccountNumber: "",
    bankAccountName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    certificationsStr: "ISO 9001:2015, SMK3 Kemnaker",
    materialsStr: "",
  });

  const [evaluateForm, setEvaluateForm] = useState({
    vendorId: "VND-001",
    projectId: "PRJ-IKN-001",
    projectName: "Pembangunan Istana Negara IKN Tahap II",
    evaluationPeriod: "2026-Q1",
    qualityScore: 90,
    deliveryScore: 85,
    hseScore: 90,
    commercialScore: 80,
    ncrCount: 0,
    evaluatorName: "Ir. Bambang Sugiarto (Procurement Manager)",
    remarks: "Pengiriman material konsisten sesuai spesifikasi teknis dan standar K3.",
  });

  const [rfqForm, setRfqForm] = useState({
    title: "",
    projectId: "PRJ-IKN-001",
    projectName: "Pembangunan Istana Negara IKN Tahap II",
    category: "Material & Konstruksi",
    estimatedBudget: 5000000000,
    submissionDeadline: "2026-04-10T17:00",
    deliveryLocation: "KIPP IKN Sepaku, Kalimantan Timur",
    targetDeliveryDate: "2026-04-25",
    requiredVendorTier: "SILVER_ABOVE" as RfqRecord["requiredVendorTier"],
    itemName: "Baja WF 400x200",
    itemSpec: "SNI 07-7178-2006",
    itemQty: 250,
    itemUom: "TON",
    notes: "",
  });

  const [bidForm, setBidForm] = useState({
    vendorId: "VND-002",
    quotedAmount: 0,
    deliveryLeadTimeDays: 14,
    warrantyMonths: 12,
    paymentTerms: "SKBDN 90 hari setelah BAST",
    tkdnPercentage: 75.0,
    technicalNotes: "",
  });

  // KPI Calculations
  const totalVendors = vendors.length;
  const goldCount = vendors.filter((v) => v.tier === "GOLD").length;
  const silverCount = vendors.filter((v) => v.tier === "SILVER").length;
  const bronzeCount = vendors.filter((v) => v.tier === "BRONZE").length;
  const blacklistedCount = vendors.filter((v) => v.tier === "BLACKLISTED").length;

  const validVendors = vendors.filter((v) => v.tier !== "BLACKLISTED");
  const avgVpeScore =
    validVendors.length > 0
      ? (validVendors.reduce((acc, curr) => acc + curr.vpeScore, 0) / validVendors.length).toFixed(1)
      : "0";

  const pendingLegalCount = vendors.filter((v) => v.legalStatus === "PENDING").length;
  const openRfqsCount = rfqs.filter((r) => r.status === "OPEN").length;

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) => {
    const matchTier = tierFilter === "ALL" || v.tier === tierFilter;
    const matchCategory = categoryFilter === "ALL" || v.category === categoryFilter;
    const matchSearch =
      searchQuery === "" ||
      v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.brandName && v.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTier && matchCategory && matchSearch;
  });

  // Action Handlers
  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = vendors.length + 1;
    const vendorCode = `VND-2026-${String(nextSeq).padStart(3, "0")}`;
    const id = `VND-${String(nextSeq).padStart(3, "0")}`;

    const newVendor: VendorRecord = {
      id,
      vendorCode,
      companyName: registerForm.companyName,
      brandName: registerForm.brandName || undefined,
      category: registerForm.category,
      tier: "BRONZE",
      vpeScore: 60.0,
      legalStatus: "PENDING",
      nib: registerForm.nib,
      sbuNumber: registerForm.sbuNumber || undefined,
      sbuGrade: registerForm.sbuGrade,
      npwp: registerForm.npwp,
      isPkp: registerForm.isPkp,
      bankName: registerForm.bankName,
      bankAccountNumber: registerForm.bankAccountNumber,
      bankAccountName: registerForm.bankAccountName,
      contactPerson: registerForm.contactPerson,
      email: registerForm.email,
      phone: registerForm.phone,
      address: registerForm.address,
      city: registerForm.city,
      province: registerForm.province,
      certifications: registerForm.certificationsStr.split(",").map((s) => s.trim()).filter(Boolean),
      materialsSupplied: registerForm.materialsStr.split(",").map((s) => s.trim()).filter(Boolean),
      activeContractsCount: 0,
      totalCompletedContracts: 0,
      ncrCount: 0,
      registeredAt: new Date().toISOString(),
      lastEvaluatedAt: new Date().toISOString(),
    };

    setVendors([newVendor, ...vendors]);
    setIsRegisterOpen(false);
    setAlertMessage({
      type: "success",
      text: `Pendaftaran rekanan ${newVendor.companyName} berhasil disubmit. Menunggu verifikasi legalitas OSS & LPJK.`,
    });
  };

  const handleEvaluateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === evaluateForm.vendorId);
    if (!vendor) return;

    const weighted =
      evaluateForm.qualityScore * 0.35 +
      evaluateForm.deliveryScore * 0.3 +
      evaluateForm.hseScore * 0.2 +
      evaluateForm.commercialScore * 0.15;
    const roundedScore = Math.round(weighted * 10) / 10;

    let resultingTier: VendorTier = "BRONZE";
    if (vendor.tier === "BLACKLISTED") {
      resultingTier = "BLACKLISTED";
    } else if (roundedScore >= 85 && evaluateForm.ncrCount === 0 && vendor.legalStatus === "VERIFIED") {
      resultingTier = "GOLD";
    } else if (roundedScore >= 70 && vendor.legalStatus === "VERIFIED") {
      resultingTier = "SILVER";
    } else {
      resultingTier = "BRONZE";
    }

    const nextSeq = evaluations.length + 1;
    const newEval: VpeEvaluationRecord = {
      id: `VPE-${String(nextSeq).padStart(3, "0")}`,
      evaluationNumber: `VPE-2026-${String(nextSeq).padStart(3, "0")}`,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      projectId: evaluateForm.projectId,
      projectName: evaluateForm.projectName,
      evaluationPeriod: evaluateForm.evaluationPeriod,
      qualityScore: evaluateForm.qualityScore,
      deliveryScore: evaluateForm.deliveryScore,
      hseScore: evaluateForm.hseScore,
      commercialScore: evaluateForm.commercialScore,
      weightedScore: roundedScore,
      resultingTier,
      ncrCount: evaluateForm.ncrCount,
      evaluatorName: evaluateForm.evaluatorName,
      remarks: evaluateForm.remarks,
      evaluatedDate: new Date().toISOString(),
    };

    setEvaluations([newEval, ...evaluations]);
    setVendors(
      vendors.map((v) =>
        v.id === vendor.id
          ? {
              ...v,
              vpeScore: roundedScore,
              tier: resultingTier,
              ncrCount: evaluateForm.ncrCount,
              lastEvaluatedAt: newEval.evaluatedDate,
            }
          : v
      )
    );

    setIsEvaluateOpen(false);
    setAlertMessage({
      type: "success",
      text: `Evaluasi VPE untuk ${vendor.companyName} tersimpan. Skor Akhir: ${roundedScore} (Tier: ${resultingTier}).`,
    });
  };

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = rfqs.length + 1;
    const rfqNumber = `RFQ-2026-${String(nextSeq).padStart(3, "0")}`;
    const id = `RFQ-${String(nextSeq).padStart(3, "0")}`;

    const newRfq: RfqRecord = {
      id,
      rfqNumber,
      title: rfqForm.title,
      projectId: rfqForm.projectId,
      projectName: rfqForm.projectName,
      category: rfqForm.category,
      estimatedBudget: Number(rfqForm.estimatedBudget),
      submissionDeadline: rfqForm.submissionDeadline,
      deliveryLocation: rfqForm.deliveryLocation,
      targetDeliveryDate: rfqForm.targetDeliveryDate,
      status: "OPEN",
      requiredVendorTier: rfqForm.requiredVendorTier,
      items: [
        {
          id: `ITM-${id}-01`,
          itemName: rfqForm.itemName,
          spec: rfqForm.itemSpec,
          quantity: Number(rfqForm.itemQty),
          uom: rfqForm.itemUom,
        },
      ],
      bidsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setRfqs([newRfq, ...rfqs]);
    setIsCreateRfqOpen(false);
    setAlertMessage({
      type: "success",
      text: `Paket e-RFQ ${rfqNumber} berhasil dipublikasikan untuk penawaran tersandi.`,
    });
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForBid) return;

    const vendor = vendors.find((v) => v.id === bidForm.vendorId);
    if (!vendor) return;

    if (vendor.tier === "BLACKLISTED") {
      setAlertMessage({
        type: "warning",
        text: `Vendor ${vendor.companyName} berada dalam status sanksi BLACKLISTED dan dilarang mengajukan penawaran.`,
      });
      return;
    }

    const nextSeq = bids.length + 1;
    const newBid: RfqBidRecord = {
      id: `BID-${String(nextSeq).padStart(3, "0")}`,
      rfqId: selectedRfqForBid.id,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      vendorTier: vendor.tier,
      quotedAmount: Number(bidForm.quotedAmount),
      deliveryLeadTimeDays: Number(bidForm.deliveryLeadTimeDays),
      warrantyMonths: Number(bidForm.warrantyMonths),
      paymentTerms: bidForm.paymentTerms,
      tkdnPercentage: Number(bidForm.tkdnPercentage),
      isSealed: true,
      status: "SUBMITTED",
      technicalNotes: bidForm.technicalNotes,
      submittedAt: new Date().toISOString(),
    };

    setBids([newBid, ...bids]);
    setRfqs(
      rfqs.map((r) =>
        r.id === selectedRfqForBid.id
          ? {
              ...r,
              bidsCount: r.bidsCount + 1,
              lowestBidAmount:
                !r.lowestBidAmount || newBid.quotedAmount < r.lowestBidAmount
                  ? newBid.quotedAmount
                  : r.lowestBidAmount,
            }
          : r
      )
    );

    setIsSubmitBidOpen(false);
    setAlertMessage({
      type: "success",
      text: `Penawaran tersandi dari ${vendor.companyName} untuk paket ${selectedRfqForBid.rfqNumber} berhasil disubmit.`,
    });
  };

  const handleVerifyLegal = (vendorId: string, isApproved: boolean) => {
    setVendors(
      vendors.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              legalStatus: isApproved ? "VERIFIED" : "REJECTED",
              tier: isApproved ? (v.vpeScore >= 85 ? "GOLD" : v.vpeScore >= 70 ? "SILVER" : "BRONZE") : "BRONZE",
            }
          : v
      )
    );
    setAlertMessage({
      type: "success",
      text: `Status legalitas rekanan berhasil diperbarui menjadi ${isApproved ? "VERIFIED (Terverifikasi OSS/LPJK)" : "REJECTED"}.`,
    });
  };

  const handleToggleSanction = (vendorId: string) => {
    setVendors(
      vendors.map((v) => {
        if (v.id === vendorId) {
          if (v.tier === "BLACKLISTED") {
            return {
              ...v,
              tier: "BRONZE",
              sanctionReason: undefined,
              sanctionDate: undefined,
            };
          } else {
            return {
              ...v,
              tier: "BLACKLISTED",
              sanctionReason: "Pelanggaran integritas / NCR kritis berulang tanpa tindak lanjut perbaikan",
              sanctionDate: new Date().toISOString(),
            };
          }
        }
        return v;
      })
    );
    setAlertMessage({
      type: "warning",
      text: `Status sanksi pembekuan rekanan berhasil diperbarui.`,
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Toast Alert */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            alertMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
          }`}
        >
          <div className="flex items-center space-x-3">
            {alertMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            )}
            <span className="text-xs sm:text-sm font-medium">{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Vendor & E-Procurement Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-1 sm:mt-0">
                  LPJK & OSS Berbasis Risiko
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Prakualifikasi Legalitas Digital OSS/LPJK, Vendor Performance Evaluation (VPE) & Lelang Penawaran Tersandi
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Pendaftaran Rekanan</span>
          </button>
          <button
            onClick={() => setIsEvaluateOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>Evaluasi VPE</span>
          </button>
          <button
            onClick={() => setIsCreateRfqOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors shadow-sm border border-slate-600"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Buat Paket e-RFQ</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rekanan */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Rekanan Terdaftar
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
                {totalVendors}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400 flex-wrap">
            <span className="text-emerald-400 font-semibold">{goldCount} Gold</span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">{silverCount} Silver</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">{bronzeCount} Bronze</span>
          </div>
        </div>

        {/* Card 2: Rata-rata Skor VPE */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Rata-rata Skor VPE
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {avgVpeScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            4 Pilar: Mutu 35%, Waktu 30%, K3 20%, Biaya 15%
          </p>
        </div>

        {/* Card 3: Verifikasi Legalitas */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Legalitas NIB & SBU
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-1">
                {totalVendors - pendingLegalCount - blacklistedCount}{" "}
                <span className="text-sm font-normal text-slate-400">Verified</span>
              </h3>
            </div>
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-400 font-medium">
            {pendingLegalCount} rekanan menunggu verifikasi berkas
          </p>
        </div>

        {/* Card 4: Paket e-RFQ */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Paket e-RFQ Aktif
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono mt-1">
                {openRfqsCount} <span className="text-sm font-normal text-slate-400">Bidding Open</span>
              </h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {bids.length} penawaran tersandi (*sealed bids*) masuk
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700/60 flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "directory"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Direktori Rekanan & Tiering</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
            {vendors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("evaluasi")}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "evaluasi"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Evaluasi Kinerja VPE</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
            {evaluations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("rfq")}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "rfq"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Paket Lelang e-RFQ & Bids</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-300">
            {rfqs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("legalitas")}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "legalitas"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Verifikasi Legalitas OSS / LPJK</span>
          {pendingLegalCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
              {pendingLegalCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Direktori Rekanan & Tiering */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari rekanan, merek, kode, atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Semua Tier Kualifikasi</option>
                  <option value="GOLD">Tier GOLD (Skor &gt;= 85)</option>
                  <option value="SILVER">Tier SILVER (Skor &gt;= 70)</option>
                  <option value="BRONZE">Tier BRONZE (Probation)</option>
                  <option value="BLACKLISTED">Tier BLACKLISTED</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="MATERIAL_SUPPLIER">Material Supplier</option>
                  <option value="SPECIALIST_SUBCON">Subkontraktor Spesialis</option>
                  <option value="HEAVY_EQUIPMENT">Rental Alat Berat</option>
                  <option value="SCAFFOLDING">Scaffolding & Formwork</option>
                  <option value="LOGISTICS_SERVICE">Ekspedisi & Logistik</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/60 font-medium">
                <tr>
                  <th className="py-3 px-4 w-[28%]">Kode & Rekanan</th>
                  <th className="py-3 px-4 w-[16%]">Kategori & SBU</th>
                  <th className="py-3 px-4 w-[12%]">Tier Kualifikasi</th>
                  <th className="py-3 px-4 w-[12%]">Skor VPE</th>
                  <th className="py-3 px-4 w-[12%]">Legalitas OSS</th>
                  <th className="py-3 px-4 w-[10%]">Kontrak & NCR</th>
                  <th className="py-3 px-4 w-[10%] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-300">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 truncate">
                      <div className="font-semibold text-white truncate">{vendor.companyName}</div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{vendor.vendorCode}</span>
                        {vendor.brandName && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/90">{vendor.brandName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{vendor.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 truncate">
                      <div className="text-slate-300 font-medium truncate">{vendor.category.replace("_", " ")}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {vendor.sbuGrade ? `Grade SBU ${vendor.sbuGrade}` : "Non-SBU"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {vendor.tier === "GOLD" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ★ GOLD
                        </span>
                      )}
                      {vendor.tier === "SILVER" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-600/30 text-slate-200 border border-slate-500/40">
                          SILVER
                        </span>
                      )}
                      {vendor.tier === "BRONZE" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                          BRONZE
                        </span>
                      )}
                      {vendor.tier === "BLACKLISTED" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          BLACKLISTED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-100">
                          {vendor.vpeScore.toFixed(1)}
                        </span>
                        <div className="w-14 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vendor.vpeScore >= 85
                                ? "bg-amber-400"
                                : vendor.vpeScore >= 70
                                ? "bg-sky-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${Math.min(100, vendor.vpeScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {vendor.legalStatus === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                      {vendor.legalStatus === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {vendor.legalStatus === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="text-emerald-400 font-semibold">{vendor.activeContractsCount} Aktif</span>
                      </div>
                      {vendor.ncrCount > 0 && (
                        <div className="text-xs text-rose-400 font-medium mt-0.5">
                          {vendor.ncrCount} NCR
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVendorDetail(vendor)}
                          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleToggleSanction(vendor.id)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            vendor.tier === "BLACKLISTED"
                              ? "bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50"
                              : "bg-rose-600/30 text-rose-300 hover:bg-rose-600/50"
                          }`}
                        >
                          {vendor.tier === "BLACKLISTED" ? "Cabut" : "Sanksi"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Card View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{vendor.companyName}</h4>
                    <div className="text-slate-400 font-mono mt-0.5">
                      {vendor.vendorCode} • {vendor.city}
                    </div>
                  </div>
                  {vendor.tier === "GOLD" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      ★ GOLD
                    </span>
                  )}
                  {vendor.tier === "SILVER" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-600/30 text-slate-200 border border-slate-500/40 shrink-0">
                      SILVER
                    </span>
                  )}
                  {vendor.tier === "BRONZE" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/40 shrink-0">
                      BRONZE
                    </span>
                  )}
                  {vendor.tier === "BLACKLISTED" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                      BLACKLISTED
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-900/50 space-y-1.5 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kategori:</span>
                    <span className="text-slate-200 font-medium">{vendor.category.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Skor Kinerja VPE:</span>
                    <span className="font-mono font-bold text-amber-400">{vendor.vpeScore.toFixed(1)} / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Legalitas OSS:</span>
                    <span className="text-emerald-400 font-medium">{vendor.legalStatus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kontrak & NCR:</span>
                    <span className="text-slate-300">
                      {vendor.activeContractsCount} Aktif {vendor.ncrCount > 0 ? `(${vendor.ncrCount} NCR)` : "(Zero NCR)"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => setSelectedVendorDetail(vendor)}
                    className="flex-1 py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium text-center"
                  >
                    Detail Profil
                  </button>
                  <button
                    onClick={() => handleToggleSanction(vendor.id)}
                    className={`py-1.5 px-3 rounded font-medium ${
                      vendor.tier === "BLACKLISTED"
                        ? "bg-emerald-600/30 text-emerald-300"
                        : "bg-rose-600/30 text-rose-300"
                    }`}
                  >
                    {vendor.tier === "BLACKLISTED" ? "Cabut Sanksi" : "Beri Sanksi"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Evaluasi Kinerja (VPE) */}
      {activeTab === "evaluasi" && (
        <div className="space-y-4">
          {/* Formula Info Banner */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Formula Standar Vendor Performance Evaluation (VPE)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">Pilar 1: Mutu Material & Fisik</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-1">35% Bobot</div>
                <div className="text-[11px] text-slate-500 mt-1">Lulus lab uji beton, baja, & rasio NCR</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">Pilar 2: Ketepatan Pengiriman</div>
                <div className="text-base font-bold text-sky-400 font-mono mt-1">30% Bobot</div>
                <div className="text-[11px] text-slate-500 mt-1">On-Time In-Full (OTIF) & lead time</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">Pilar 3: K3 & Lingkungan (HSE)</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">20% Bobot</div>
                <div className="text-[11px] text-slate-500 mt-1">APD pekerja, izin SILO alat, zero insiden</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">Pilar 4: Komersial & Finansial</div>
                <div className="text-base font-bold text-indigo-400 font-mono mt-1">15% Bobot</div>
                <div className="text-[11px] text-slate-500 mt-1">Fleksibilitas termin SKBDN & harga pasar</div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/60 font-medium">
                <tr>
                  <th className="py-3 px-4 w-[24%]">No & Vendor</th>
                  <th className="py-3 px-4 w-[24%]">Proyek & Periode</th>
                  <th className="py-3 px-4 w-[8%] text-center">Mutu (35%)</th>
                  <th className="py-3 px-4 w-[8%] text-center">Waktu (30%)</th>
                  <th className="py-3 px-4 w-[8%] text-center">K3 (20%)</th>
                  <th className="py-3 px-4 w-[8%] text-center">Komersial</th>
                  <th className="py-3 px-4 w-[10%]">Skor & Tier</th>
                  <th className="py-3 px-4 w-[10%]">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-300">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 truncate">
                      <div className="font-semibold text-white truncate">{ev.vendorName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{ev.evaluationNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 truncate">
                      <div className="text-slate-200 font-medium truncate">{ev.projectName}</div>
                      <div className="text-xs text-amber-400/90 font-mono mt-0.5">{ev.evaluationPeriod}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-200">
                      {ev.qualityScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-200">
                      {ev.deliveryScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-200">
                      {ev.hseScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-200">
                      {ev.commercialScore}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {ev.weightedScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-200">
                          {ev.resultingTier}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 truncate">
                      <div className="text-xs text-slate-400 italic truncate">{ev.remarks}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Card View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{ev.vendorName}</h4>
                    <div className="text-slate-400 font-mono mt-0.5">
                      {ev.evaluationNumber} • {ev.evaluationPeriod}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {ev.weightedScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-200">
                      {ev.resultingTier}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mutu</span>
                    <span className="font-mono font-bold text-amber-400">{ev.qualityScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Waktu</span>
                    <span className="font-mono font-bold text-sky-400">{ev.deliveryScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">K3</span>
                    <span className="font-mono font-bold text-emerald-400">{ev.hseScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Komersil</span>
                    <span className="font-mono font-bold text-indigo-400">{ev.commercialScore}</span>
                  </div>
                </div>

                <div className="text-slate-300">
                  <span className="text-slate-400 block text-[11px]">Proyek:</span>
                  <div className="font-medium">{ev.projectName}</div>
                  <p className="text-slate-400 italic mt-1 text-[11px]">{ev.remarks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Paket Lelang e-RFQ & Bids */}
      {activeTab === "rfq" && (
        <div className="space-y-6">
          {rfqs.map((rfq) => {
            const rfqBids = bids.filter((b) => b.rfqId === rfq.id);

            return (
              <div
                key={rfq.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm"
              >
                {/* RFQ Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/60 pb-4">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
                        {rfq.rfqNumber}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">{rfq.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {rfq.projectName} • Kategori: <span className="text-slate-300">{rfq.category}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap">
                    {rfq.status === "OPEN" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        PENDAFTARAN BUKA
                      </span>
                    )}
                    {rfq.status === "UNDER_EVALUATION" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        EVALUASI TERSANDI
                      </span>
                    )}
                    {rfq.status === "AWARDED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        PEMENANG DITETAPKAN
                      </span>
                    )}

                    {rfq.status === "OPEN" && (
                      <button
                        onClick={() => {
                          setSelectedRfqForBid(rfq);
                          setBidForm({
                            ...bidForm,
                            quotedAmount: rfq.estimatedBudget * 0.96,
                          });
                          setIsSubmitBidOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kirim Penawaran Tersandi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* RFQ Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-900/50 p-3.5 rounded-lg border border-slate-700/40">
                  <div>
                    <span className="text-slate-400 block">Pagu Anggaran (HPS/OE):</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {formatRupiah(rfq.estimatedBudget)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Batas Akhir Penawaran:</span>
                    <span className="font-medium text-slate-200">
                      {new Date(rfq.submissionDeadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lokasi Serah Terima:</span>
                    <span className="font-medium text-slate-200 truncate block">{rfq.deliveryLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Syarat Kualifikasi:</span>
                    <span className="font-semibold text-amber-400">
                      {rfq.requiredVendorTier === "SILVER_ABOVE"
                        ? "Minimal Tier SILVER"
                        : rfq.requiredVendorTier === "GOLD"
                        ? "Khusus Tier GOLD"
                        : "Semua Tier Terdaftar"}
                    </span>
                  </div>
                </div>

                {/* Items Needed */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Daftar Rincian Material & Jasa
                  </h4>
                  <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3 space-y-2">
                    {rfq.items.map((it) => (
                      <div key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-slate-800 last:border-0 pb-2 last:pb-0">
                        <div>
                          <div className="font-medium text-white">{it.itemName}</div>
                          <div className="text-[11px] text-slate-400">{it.spec}</div>
                        </div>
                        <div className="font-mono font-bold text-slate-200 sm:text-right shrink-0">
                          {it.quantity.toLocaleString("id-ID")} {it.uom}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sealed Bids List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Penawaran Masuk ({rfqBids.length})</span>
                    <span className="text-[11px] text-amber-400 font-normal">
                      Enkripsi SHA-256 Sealed Bidding
                    </span>
                  </h4>
                  {rfqBids.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-900/30 rounded-lg">
                      Belum ada penawaran tersandi yang masuk untuk paket pengadaan ini.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rfqBids.map((b) => (
                        <div
                          key={b.id}
                          className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-3.5 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-white text-xs sm:text-sm">
                                {b.vendorName}
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                                Tier {b.vendorTier}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3" />
                              <span>Tersandi</span>
                            </span>
                          </div>

                          <div className="pt-1 border-t border-slate-800 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Harga Penawaran:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {formatRupiah(b.quotedAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Lead Time & Garansi:</span>
                              <span className="text-slate-200">
                                {b.deliveryLeadTimeDays} hari / {b.warrantyMonths} bln
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">TKDN Sertifikat:</span>
                              <span className="font-mono text-sky-400">{b.tkdnPercentage}%</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-1">
                              {b.paymentTerms}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: Verifikasi Legalitas OSS / LPJK */}
      {activeTab === "legalitas" && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-1">
              Verifikasi Kepatuhan Legalitas Rekanan Digital
            </h3>
            <p className="text-xs text-slate-400">
              Validasi Nomor Induk Berusaha (NIB OSS RBA), Sertifikat Badan Usaha (SBU LPJK Permen PUPR No. 6/2021),
              dan Sertifikasi Sistem Manajemen Keselamatan Kerja (SMK3 Kemnaker / ISO 45001).
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/60 font-medium">
                <tr>
                  <th className="py-3 px-4 w-[24%]">Nama Rekanan</th>
                  <th className="py-3 px-4 w-[16%]">NIB OSS</th>
                  <th className="py-3 px-4 w-[16%]">SBU LPJK & Grade</th>
                  <th className="py-3 px-4 w-[16%]">NPWP & PKP</th>
                  <th className="py-3 px-4 w-[14%]">Status Verifikasi</th>
                  <th className="py-3 px-4 w-[14%] text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-300">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white truncate">
                      <div className="truncate">{v.companyName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{v.vendorCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 truncate">{v.nib}</td>
                    <td className="py-3.5 px-4 truncate">
                      <div className="text-slate-200 truncate">{v.sbuNumber || "-"}</div>
                      {v.sbuGrade && (
                        <span className="text-[11px] text-amber-400 font-bold">Kualifikasi {v.sbuGrade}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 truncate">
                      <div className="font-mono text-slate-300 truncate">{v.npwp}</div>
                      <span className="text-[11px] text-slate-400">{v.isPkp ? "PKP" : "Non-PKP"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.legalStatus === "VERIFIED" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Disetujui
                        </span>
                      )}
                      {v.legalStatus === "PENDING" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Menunggu
                        </span>
                      )}
                      {v.legalStatus === "REJECTED" && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {v.legalStatus === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerifyLegal(v.id, true)}
                            className="px-2 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerifyLegal(v.id, false)}
                            className="px-2 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Tersertifikasi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Card View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{v.companyName}</h4>
                    <span className="text-slate-400 font-mono text-[11px]">{v.vendorCode}</span>
                  </div>
                  {v.legalStatus === "VERIFIED" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                      Verified
                    </span>
                  )}
                  {v.legalStatus === "PENDING" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300">
                      Pending
                    </span>
                  )}
                  {v.legalStatus === "REJECTED" && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIB OSS:</span>
                    <span className="font-mono text-slate-200">{v.nib}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SBU LPJK:</span>
                    <span className="text-slate-200">{v.sbuNumber || "Non-SBU"} ({v.sbuGrade || "-"})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NPWP:</span>
                    <span className="font-mono text-slate-200">{v.npwp}</span>
                  </div>
                </div>

                {v.legalStatus === "PENDING" && (
                  <div className="flex gap-2 pt-1 border-t border-slate-700/60">
                    <button
                      onClick={() => handleVerifyLegal(v.id, true)}
                      className="flex-1 py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-center"
                    >
                      Setujui Legalitas
                    </button>
                    <button
                      onClick={() => handleVerifyLegal(v.id, false)}
                      className="py-1 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Pendaftaran Rekanan Baru */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Pendaftaran Rekanan Baru (Prequalification)</span>
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterVendor} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Nama Perusahaan / PT / CV *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Beton Pracetak Utama"
                    value={registerForm.companyName}
                    onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Merek Dagang / Brand</label>
                  <input
                    type="text"
                    placeholder="Contoh: Precast King"
                    value={registerForm.brandName}
                    onChange={(e) => setRegisterForm({ ...registerForm, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Kategori Rekanan *</label>
                  <select
                    value={registerForm.category}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, category: e.target.value as VendorRecord["category"] })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MATERIAL_SUPPLIER">Material Supplier (Semen, Besi, Beton)</option>
                    <option value="SPECIALIST_SUBCON">Subkontraktor Spesialis (MEP, Struktur, Geoteknik)</option>
                    <option value="HEAVY_EQUIPMENT">Rental Alat Berat & Crane</option>
                    <option value="SCAFFOLDING">Scaffolding & Formwork System</option>
                    <option value="LOGISTICS_SERVICE">Ekspedisi & Jasa Angkut Material</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Nomor Induk Berusaha (NIB OSS 13 Digit) *</label>
                  <input
                    type="text"
                    required
                    placeholder="9120001234567"
                    value={registerForm.nib}
                    onChange={(e) => setRegisterForm({ ...registerForm, nib: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Nomor SBU LPJK PUPR</label>
                  <input
                    type="text"
                    placeholder="SBU-LPJK-2024-B1-099"
                    value={registerForm.sbuNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, sbuNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Kualifikasi SBU</label>
                  <select
                    value={registerForm.sbuGrade}
                    onChange={(e) => setRegisterForm({ ...registerForm, sbuGrade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="B2">Besar 2 (B2)</option>
                    <option value="B1">Besar 1 (B1)</option>
                    <option value="M2">Menengah 2 (M2)</option>
                    <option value="M1">Menengah 1 (M1)</option>
                    <option value="K3">Kecil 3 (K3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">NPWP Badan (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    placeholder="01.234.567.8-012.000"
                    value={registerForm.npwp}
                    onChange={(e) => setRegisterForm({ ...registerForm, npwp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Nama Bank & Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bank Mandiri: 123-00-112233-4 (a.n. PT ...)"
                    value={registerForm.bankAccountNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Nama PIC *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penanggung Jawab"
                    value={registerForm.contactPerson}
                    onChange={(e) => setRegisterForm({ ...registerForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@perusahaan.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="+628123456789"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Kota & Domisili Kantor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta Barat"
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Sertifikasi Dimiliki (Pisahkan Koma)</label>
                  <input
                    type="text"
                    placeholder="SNI, ISO 9001:2015, SMK3 Kemnaker"
                    value={registerForm.certificationsStr}
                    onChange={(e) => setRegisterForm({ ...registerForm, certificationsStr: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Submit Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Input Evaluasi VPE */}
      {isEvaluateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Input Vendor Performance Evaluation (VPE)</span>
              </h3>
              <button
                onClick={() => setIsEvaluateOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvaluateVendor} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Pilih Rekanan Vendor *</label>
                <select
                  value={evaluateForm.vendorId}
                  onChange={(e) => setEvaluateForm({ ...evaluateForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendorCode} - {v.companyName} (Tier {v.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Proyek Konstruksi</label>
                  <input
                    type="text"
                    value={evaluateForm.projectName}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, projectName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Periode Evaluasi</label>
                  <input
                    type="text"
                    value={evaluateForm.evaluationPeriod}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, evaluationPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 4 Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <label className="text-slate-300 block mb-1">
                    Skor Mutu Material (35%) <span className="font-mono text-amber-400 font-bold">{evaluateForm.qualityScore}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluateForm.qualityScore}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, qualityScore: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">
                    Ketepatan Waktu (30%) <span className="font-mono text-sky-400 font-bold">{evaluateForm.deliveryScore}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluateForm.deliveryScore}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, deliveryScore: Number(e.target.value) })}
                    className="w-full accent-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">
                    Kepatuhan K3 & HSE (20%) <span className="font-mono text-emerald-400 font-bold">{evaluateForm.hseScore}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluateForm.hseScore}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, hseScore: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">
                    Harga & Komersial (15%) <span className="font-mono text-indigo-400 font-bold">{evaluateForm.commercialScore}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluateForm.commercialScore}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, commercialScore: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Temuan Non-Conformance (NCR)</label>
                  <input
                    type="number"
                    min="0"
                    value={evaluateForm.ncrCount}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, ncrCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Nama Lead Evaluator</label>
                  <input
                    type="text"
                    value={evaluateForm.evaluatorName}
                    onChange={(e) => setEvaluateForm({ ...evaluateForm, evaluatorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Catatan Kinerja Khusus</label>
                <textarea
                  rows={2}
                  value={evaluateForm.remarks}
                  onChange={(e) => setEvaluateForm({ ...evaluateForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEvaluateOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Simpan Evaluasi VPE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Buat Paket e-RFQ */}
      {isCreateRfqOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Buat Paket Pengadaan e-RFQ Baru</span>
              </h3>
              <button
                onClick={() => setIsCreateRfqOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Judul Paket Pengadaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengadaan Tiang Pancang Spun Pile Dia 600mm"
                  value={rfqForm.title}
                  onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Pagu Anggaran (HPS/OE Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rfqForm.estimatedBudget}
                    onChange={(e) => setRfqForm({ ...rfqForm, estimatedBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Syarat Kualifikasi Rekanan *</label>
                  <select
                    value={rfqForm.requiredVendorTier}
                    onChange={(e) =>
                      setRfqForm({ ...rfqForm, requiredVendorTier: e.target.value as RfqRecord["requiredVendorTier"] })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="SILVER_ABOVE">Minimal Tier SILVER (Rekomendasi)</option>
                    <option value="GOLD">Khusus Tier GOLD (Proyek Strategis)</option>
                    <option value="ALL">Semua Rekanan Terdaftar Termasuk Bronze</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Batas Akhir Penawaran *</label>
                  <input
                    type="datetime-local"
                    required
                    value={rfqForm.submissionDeadline}
                    onChange={(e) => setRfqForm({ ...rfqForm, submissionDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Target Pengiriman ke Proyek</label>
                  <input
                    type="date"
                    required
                    value={rfqForm.targetDeliveryDate}
                    onChange={(e) => setRfqForm({ ...rfqForm, targetDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-xs font-semibold text-amber-400 block uppercase tracking-wider">
                  Rincian Item Pertama
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nama Material / Item"
                      value={rfqForm.itemName}
                      onChange={(e) => setRfqForm({ ...rfqForm, itemName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Spesifikasi / Standar ASTM"
                      value={rfqForm.itemSpec}
                      onChange={(e) => setRfqForm({ ...rfqForm, itemSpec: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      required
                      placeholder="Volume / Kuantitas"
                      value={rfqForm.itemQty}
                      onChange={(e) => setRfqForm({ ...rfqForm, itemQty: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Satuan (TON/M3/BATANG)"
                      value={rfqForm.itemUom}
                      onChange={(e) => setRfqForm({ ...rfqForm, itemUom: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateRfqOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Publikasikan e-RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Kirim Penawaran Tersandi (Sealed Bid) */}
      {isSubmitBidOpen && selectedRfqForBid && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Pemasukan Penawaran Tersandi (Sealed Bid)</span>
              </h3>
              <button
                onClick={() => setIsSubmitBidOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-xs">
              <div className="font-semibold text-white">{selectedRfqForBid.title}</div>
              <div className="text-slate-400 font-mono mt-0.5">
                {selectedRfqForBid.rfqNumber} • Pagu HPS: {formatRupiah(selectedRfqForBid.estimatedBudget)}
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Pilih Akun Rekanan Pengaju *</label>
                <select
                  value={bidForm.vendorId}
                  onChange={(e) => setBidForm({ ...bidForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {vendors
                    .filter((v) => v.tier !== "BLACKLISTED")
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.companyName} (Tier {v.tier})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Harga Penawaran Total (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={bidForm.quotedAmount}
                    onChange={(e) => setBidForm({ ...bidForm, quotedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Kandungan TKDN (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={bidForm.tkdnPercentage}
                    onChange={(e) => setBidForm({ ...bidForm, tkdnPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1">Lead Time Pengiriman (Hari Kalender)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bidForm.deliveryLeadTimeDays}
                    onChange={(e) => setBidForm({ ...bidForm, deliveryLeadTimeDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Masa Garansi Kualitas (Bulan)</label>
                  <input
                    type="number"
                    min="0"
                    value={bidForm.warrantyMonths}
                    onChange={(e) => setBidForm({ ...bidForm, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Syarat & Termin Pembayaran</label>
                <input
                  type="text"
                  value={bidForm.paymentTerms}
                  onChange={(e) => setBidForm({ ...bidForm, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                Data penawaran akan dienkripsi dengan standar Sealed Bidding dan hanya dapat dibuka saat
                waktu pembukaan lelang resmi (*Aanwijzing / Bidding Opening Date*).
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSubmitBidOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Enkripsi & Kirim Penawaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Detail Rekanan */}
      {selectedVendorDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVendorDetail.companyName}</h3>
                <span className="text-xs text-slate-400 font-mono">{selectedVendorDetail.vendorCode}</span>
              </div>
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-xs">Tier Kualifikasi:</span>
                  <span className="font-bold text-amber-400">{selectedVendorDetail.tier}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Skor VPE:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedVendorDetail.vpeScore.toFixed(1)} / 100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Status Legalitas OSS:</span>
                  <span className="font-semibold text-emerald-400">{selectedVendorDetail.legalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Grade SBU LPJK:</span>
                  <span className="font-semibold text-slate-200">{selectedVendorDetail.sbuGrade || "-"}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Kontak & Alamat Pabrik/Gudang:</span>
                <p className="text-slate-200 mt-0.5">{selectedVendorDetail.address}, {selectedVendorDetail.city}, {selectedVendorDetail.province}</p>
                <p className="text-slate-400 mt-1">PIC: {selectedVendorDetail.contactPerson} ({selectedVendorDetail.phone} • {selectedVendorDetail.email})</p>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Informasi Rekening Bank:</span>
                <p className="text-slate-200 font-mono mt-0.5">
                  {selectedVendorDetail.bankName} - {selectedVendorDetail.bankAccountNumber} (a.n. {selectedVendorDetail.bankAccountName})
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Sertifikasi Legalitas:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVendorDetail.certifications.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {selectedVendorDetail.sanctionReason && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                  <span className="font-bold block">Riwayat Catatan Sanksi:</span>
                  {selectedVendorDetail.sanctionReason}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700">
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
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
