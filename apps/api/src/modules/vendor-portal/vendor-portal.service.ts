import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { EvaluateVendorDto } from './dto/evaluate-vendor.dto';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';

export type VendorTier = 'GOLD' | 'SILVER' | 'BRONZE' | 'BLACKLISTED';
export type LegalStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED';

export interface VendorRecord {
  id: string;
  vendorCode: string;
  companyName: string;
  brandName?: string;
  category: 'MATERIAL_SUPPLIER' | 'SPECIALIST_SUBCON' | 'HEAVY_EQUIPMENT' | 'SCAFFOLDING' | 'LOGISTICS_SERVICE';
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

export interface VpeEvaluationRecord {
  id: string;
  evaluationNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  evaluationPeriod: string;
  qualityScore: number; // 35%
  deliveryScore: number; // 30%
  hseScore: number; // 20%
  commercialScore: number; // 15%
  weightedScore: number;
  resultingTier: VendorTier;
  ncrCount: number;
  evaluatorName: string;
  remarks: string;
  evaluatedDate: string;
}

export interface RfqRecord {
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
  status: 'OPEN' | 'UNDER_EVALUATION' | 'AWARDED' | 'CANCELLED';
  requiredVendorTier: 'ALL' | 'GOLD' | 'SILVER_ABOVE';
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

export interface RfqBidRecord {
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
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  technicalNotes?: string;
  submittedAt: string;
}

@Injectable()
export class VendorPortalService {
  private vendors: VendorRecord[] = [
    {
      id: 'VND-001',
      vendorCode: 'VND-2026-001',
      companyName: 'PT Solusi Bangun Semen Indonesia',
      brandName: 'Dynamix Cement',
      category: 'MATERIAL_SUPPLIER',
      tier: 'GOLD',
      vpeScore: 89.5,
      legalStatus: 'VERIFIED',
      nib: '9120003456781',
      sbuNumber: 'SBU-LPJK-2024-B1-002',
      sbuGrade: 'B1',
      npwp: '01.234.567.8-012.000',
      isPkp: true,
      bankName: 'Bank Mandiri',
      bankAccountNumber: '123-00-0987654-3',
      bankAccountName: 'PT Solusi Bangun Semen Indonesia',
      contactPerson: 'Ir. Hendro Wijaya',
      email: 'hendro.wijaya@solusibangun.co.id',
      phone: '+628118899001',
      address: 'Kawasan Industri Tuban & Plant Narogong KM 22',
      city: 'Bogor',
      province: 'Jawa Barat',
      certifications: ['SNI 2049:2015', 'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'Green Label Gold'],
      materialsSupplied: ['Semen PCC 50kg', 'Semen OPC Tipe 1 Curah', 'Semen Rendah Kalor Mass Concrete'],
      activeContractsCount: 3,
      totalCompletedContracts: 18,
      ncrCount: 0,
      registeredAt: '2024-02-10T08:00:00Z',
      lastEvaluatedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'VND-002',
      vendorCode: 'VND-2026-002',
      companyName: 'PT Krakatau Steel (Persero) Tbk',
      brandName: 'KS Wire & Bar',
      category: 'MATERIAL_SUPPLIER',
      tier: 'GOLD',
      vpeScore: 92.4,
      legalStatus: 'VERIFIED',
      nib: '8120009876543',
      sbuNumber: 'SBU-LPJK-2024-B2-001',
      sbuGrade: 'B2',
      npwp: '01.000.123.4-051.000',
      isPkp: true,
      bankName: 'Bank BNI',
      bankAccountNumber: '987-654-3210',
      bankAccountName: 'PT Krakatau Steel (Persero) Tbk',
      contactPerson: 'Dra. Maya Kusuma',
      email: 'maya.kusuma@krakatausteel.com',
      phone: '+6281234567890',
      address: 'Kawasan Industri Krakatau Steel, Jl. Industri No. 5',
      city: 'Cilegon',
      province: 'Banten',
      certifications: ['SNI 2052:2017', 'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'TKDN > 75%'],
      materialsSupplied: ['Baja Tulangan Polos BJTP 280', 'Baja Tulangan Sirip BJTS 420B', 'Baja Profil WF', 'Sheet Pile'],
      activeContractsCount: 4,
      totalCompletedContracts: 32,
      ncrCount: 0,
      registeredAt: '2023-08-15T09:00:00Z',
      lastEvaluatedAt: '2026-03-02T14:30:00Z',
    },
    {
      id: 'VND-003',
      vendorCode: 'VND-2026-003',
      companyName: 'PT Trakindo Utama Heavy Machinery',
      brandName: 'Caterpillar Indonesia',
      category: 'HEAVY_EQUIPMENT',
      tier: 'GOLD',
      vpeScore: 87.0,
      legalStatus: 'VERIFIED',
      nib: '9120005544332',
      sbuNumber: 'SBU-LPJK-2024-B1-044',
      sbuGrade: 'B1',
      npwp: '01.445.678.9-031.000',
      isPkp: true,
      bankName: 'Bank Mandiri',
      bankAccountNumber: '127-00-5566778-9',
      bankAccountName: 'PT Trakindo Utama',
      contactPerson: 'Budi Santoso, S.T.',
      email: 'budi.santoso@trakindo.co.id',
      phone: '+6281399887766',
      address: 'Gedung Trakindo Utama, Jl. Cilandak KKO Raya No. 1',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      certifications: ['ISO 9001:2015', 'SMK3 Kemnaker Emas', 'SILO Disnaker Resmi', 'Cat Certified Tech'],
      materialsSupplied: ['Excavator 20-40 Ton', 'Bulldozer D6R', 'Motor Grader 140K', 'Vibro Roller 12 Ton'],
      activeContractsCount: 2,
      totalCompletedContracts: 14,
      ncrCount: 0,
      registeredAt: '2024-01-20T11:00:00Z',
      lastEvaluatedAt: '2026-02-28T16:00:00Z',
    },
    {
      id: 'VND-004',
      vendorCode: 'VND-2026-004',
      companyName: 'PT Varia Usaha Beton (SIG Group)',
      brandName: 'VUB Ready Mix',
      category: 'MATERIAL_SUPPLIER',
      tier: 'SILVER',
      vpeScore: 78.8,
      legalStatus: 'VERIFIED',
      nib: '9120001122334',
      sbuNumber: 'SBU-LPJK-2024-M2-012',
      sbuGrade: 'M2',
      npwp: '01.555.888.2-021.000',
      isPkp: true,
      bankName: 'Bank BRI',
      bankAccountNumber: '0341-01-000892-30-1',
      bankAccountName: 'PT Varia Usaha Beton',
      contactPerson: 'Ahmad Faisal, S.T.',
      email: 'a.faisal@vubeton.co.id',
      phone: '+6281566778899',
      address: 'Jl. Veteran No. 129, Kebomas',
      city: 'Gresik',
      province: 'Jawa Timur',
      certifications: ['SNI 4433:2016', 'ISO 9001:2015', 'ISO 45001:2018'],
      materialsSupplied: ['Ready Mix Beton fc 20 - fc 50 MPa', 'Precast U-Ditch & Box Culvert', 'Tiang Pancang Square'],
      activeContractsCount: 2,
      totalCompletedContracts: 11,
      ncrCount: 1,
      registeredAt: '2024-04-12T13:00:00Z',
      lastEvaluatedAt: '2026-03-05T09:15:00Z',
    },
    {
      id: 'VND-005',
      vendorCode: 'VND-2026-005',
      companyName: 'PT Freyssinet Total Technology',
      brandName: 'Freyssinet Indonesia',
      category: 'SPECIALIST_SUBCON',
      tier: 'GOLD',
      vpeScore: 94.2,
      legalStatus: 'VERIFIED',
      nib: '9120007788990',
      sbuNumber: 'SBU-LPJK-2024-B2-088',
      sbuGrade: 'B2',
      npwp: '01.777.999.3-042.000',
      isPkp: true,
      bankName: 'Bank BCA',
      bankAccountNumber: '522-098-7654',
      bankAccountName: 'PT Freyssinet Total Tech',
      contactPerson: 'Jean-Pierre Pratama, Ir.',
      email: 'jp.pratama@freyssinet.co.id',
      phone: '+628111223344',
      address: 'Gandaria 8 Office Tower Lt. 18, Jl. Sultan Iskandar Muda',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      certifications: ['ISO 9001:2015', 'ISO 45001:2018', 'PTI Specialist Certified', 'SMK3 Platinum'],
      materialsSupplied: ['Post-Tensioning Strand', 'Expansion Joint Jembatan', 'Elastomeric Bearing Pad', 'Geotechnical Anchors'],
      activeContractsCount: 3,
      totalCompletedContracts: 22,
      ncrCount: 0,
      registeredAt: '2023-11-05T10:00:00Z',
      lastEvaluatedAt: '2026-03-03T11:20:00Z',
    },
    {
      id: 'VND-006',
      vendorCode: 'VND-2026-006',
      companyName: 'PT Scaffolding Megah Perkasa',
      brandName: 'Megah Scaffolding System',
      category: 'SCAFFOLDING',
      tier: 'SILVER',
      vpeScore: 74.5,
      legalStatus: 'VERIFIED',
      nib: '9120002233445',
      sbuNumber: 'SBU-LPJK-2024-M1-039',
      sbuGrade: 'M1',
      npwp: '02.333.444.5-015.000',
      isPkp: true,
      bankName: 'Bank Mandiri',
      bankAccountNumber: '133-00-1122334-5',
      bankAccountName: 'PT Scaffolding Megah Perkasa',
      contactPerson: 'Teguh Wicaksono',
      email: 'teguh@megahscaffolding.com',
      phone: '+6281788991122',
      address: 'Jl. Raya Narogong KM 14, Pangkalan 3',
      city: 'Bekasi',
      province: 'Jawa Barat',
      certifications: ['SNI 03-3430-1994', 'ISO 9001:2015', 'Disnaker Scaffolding Inspector Certified'],
      materialsSupplied: ['Main Frame Scaffolding', 'Ringlock Modular Scaffolding', 'Formwork Aluma & Plywood Film'],
      activeContractsCount: 1,
      totalCompletedContracts: 9,
      ncrCount: 1,
      registeredAt: '2024-05-18T14:00:00Z',
      lastEvaluatedAt: '2026-02-25T15:00:00Z',
    },
    {
      id: 'VND-007',
      vendorCode: 'VND-2026-007',
      companyName: 'CV Putra Mandiri Konstruksi',
      brandName: 'Putra Mandiri Earthworks',
      category: 'SPECIALIST_SUBCON',
      tier: 'BRONZE',
      vpeScore: 62.0,
      legalStatus: 'PENDING',
      nib: '9120004455667',
      sbuNumber: 'SBU-LPJK-2025-K3-091',
      sbuGrade: 'K3',
      npwp: '03.888.777.1-412.000',
      isPkp: false,
      bankName: 'Bank Jateng',
      bankAccountNumber: '1-029-38475-6',
      bankAccountName: 'CV Putra Mandiri Konstruksi',
      contactPerson: 'Slamet Riyadi',
      email: 'putramandiri.earth@gmail.com',
      phone: '+6285223344556',
      address: 'Jl. Solo-Purwodadi KM 18, Kalijambe',
      city: 'Sragen',
      province: 'Jawa Tengah',
      certifications: ['Surat Izin Usaha Jasa Konstruksi (IUJK) Daerah'],
      materialsSupplied: ['Galian & Timbunan Tanah Pilihan', 'Subbase Pasir Batu (Sirtu)', 'Perapihan Talud'],
      activeContractsCount: 1,
      totalCompletedContracts: 3,
      ncrCount: 2,
      registeredAt: '2025-10-10T09:30:00Z',
      lastEvaluatedAt: '2026-02-15T10:30:00Z',
    },
    {
      id: 'VND-008',
      vendorCode: 'VND-2026-008',
      companyName: 'PT Borneo Geosintetik Abadi',
      brandName: 'Borneo Geotextile',
      category: 'MATERIAL_SUPPLIER',
      tier: 'SILVER',
      vpeScore: 76.5,
      legalStatus: 'VERIFIED',
      nib: '9120006677889',
      sbuNumber: 'SBU-LPJK-2024-M2-055',
      sbuGrade: 'M2',
      npwp: '02.999.111.4-721.000',
      isPkp: true,
      bankName: 'Bank Danamon',
      bankAccountNumber: '003-556-7890',
      bankAccountName: 'PT Borneo Geosintetik Abadi',
      contactPerson: 'Hj. Ratna Sari, S.T.',
      email: 'ratna@borneogeosintetik.com',
      phone: '+6281255667788',
      address: 'Jl. Soekarno-Hatta KM 5.5, Kariangau',
      city: 'Balikpapan',
      province: 'Kalimantan Timur',
      certifications: ['SNI Geotekstil', 'ISO 9001:2015', 'TKDN 62%'],
      materialsSupplied: ['Geotextile Woven 250gr', 'Geotextile Non-Woven 300gr', 'Geogrid Biaxial', 'HDPE Geomembrane 1.5mm'],
      activeContractsCount: 2,
      totalCompletedContracts: 7,
      ncrCount: 0,
      registeredAt: '2024-09-01T10:00:00Z',
      lastEvaluatedAt: '2026-03-01T14:00:00Z',
    },
    {
      id: 'VND-009',
      vendorCode: 'VND-2026-009',
      companyName: 'PT Cipta Kreasi Subkonindo',
      brandName: 'CKS Electrical',
      category: 'SPECIALIST_SUBCON',
      tier: 'BLACKLISTED',
      vpeScore: 38.0,
      legalStatus: 'REJECTED',
      nib: '9120009988112',
      sbuNumber: 'SBU-LPJK-2023-M1-819 (DICABUT)',
      sbuGrade: 'M1',
      npwp: '01.666.222.8-062.000',
      isPkp: true,
      bankName: 'Bank Mandiri',
      bankAccountNumber: '142-00-9988112-3',
      bankAccountName: 'PT Cipta Kreasi Subkonindo',
      contactPerson: 'Deni Kurniawan',
      email: 'deni.k@cks-subcon.id',
      phone: '+6281800991122',
      address: 'Ruko Rungkut Megah Raya Blok D-14',
      city: 'Surabaya',
      province: 'Jawa Timur',
      certifications: [],
      materialsSupplied: ['Kabel Power NYY/NYFGBY', 'Panel Distribusi MDP/SDP', 'Instalasi Tray Kabel'],
      activeContractsCount: 0,
      totalCompletedContracts: 2,
      ncrCount: 6,
      sanctionReason: 'Abandonment proyek MEP Gedung Rawat Inap RS Surabaya & Pemalsuan Sertifikat Uji Tahanan Isolasi Kabel',
      sanctionDate: '2026-01-15T08:00:00Z',
      registeredAt: '2023-06-20T08:00:00Z',
      lastEvaluatedAt: '2026-01-14T11:00:00Z',
    },
  ];

  private evaluations: VpeEvaluationRecord[] = [
    {
      id: 'VPE-001',
      evaluationNumber: 'VPE-2026-001',
      vendorId: 'VND-001',
      vendorName: 'PT Solusi Bangun Semen Indonesia',
      projectId: 'PRJ-IKN-001',
      projectName: 'Pembangunan Istana Negara IKN Tahap II',
      evaluationPeriod: '2026-Q1',
      qualityScore: 92,
      deliveryScore: 88,
      hseScore: 90,
      commercialScore: 85,
      weightedScore: 89.5, // 92*0.35 + 88*0.30 + 90*0.20 + 85*0.15 = 32.2 + 26.4 + 18.0 + 12.75 = 89.35 -> 89.5
      resultingTier: 'GOLD',
      ncrCount: 0,
      evaluatorName: 'Bambang Kusumo, S.T. (Senior Procurement Lead)',
      remarks: 'Pasokan semen curah tepat waktu via jetty Balikpapan. Kualitas konsisten dengan sertifikat uji lab terverifikasi.',
      evaluatedDate: '2026-03-01T10:00:00Z',
    },
    {
      id: 'VPE-002',
      evaluationNumber: 'VPE-2026-002',
      vendorId: 'VND-002',
      vendorName: 'PT Krakatau Steel (Persero) Tbk',
      projectId: 'PRJ-PTB-002',
      projectName: 'Pengembangan Pelabuhan Patimban Subang Tahap 2',
      evaluationPeriod: '2026-Q1',
      qualityScore: 95,
      deliveryScore: 90,
      hseScore: 94,
      commercialScore: 88,
      weightedScore: 92.4, // 95*0.35 + 90*0.30 + 94*0.20 + 88*0.15 = 33.25 + 27.0 + 18.8 + 13.2 = 92.25 -> 92.4
      resultingTier: 'GOLD',
      ncrCount: 0,
      evaluatorName: 'Dewi Anggraini, S.T. (QA/QC Procurement Manager)',
      remarks: 'Hasil uji tarik baja tulangan BJTS 420B memenuhi syarat ASTM/SNI. Tidak ada karat permukaan signifikan saat serah terima.',
      evaluatedDate: '2026-03-02T14:30:00Z',
    },
    {
      id: 'VPE-003',
      evaluationNumber: 'VPE-2026-003',
      vendorId: 'VND-005',
      vendorName: 'PT Freyssinet Total Technology',
      projectId: 'PRJ-LRT-003',
      projectName: 'LRT Velodrome-Manggarai Flyover Package',
      evaluationPeriod: '2026-Q1',
      qualityScore: 96,
      deliveryScore: 92,
      hseScore: 95,
      commercialScore: 90,
      weightedScore: 94.2,
      resultingTier: 'GOLD',
      ncrCount: 0,
      evaluatorName: 'Ir. Taufik Hidayat (Bridge Specialist Consultant)',
      remarks: 'Metode stressing post-tensioning sangat rapi dan presisi kalibrasi dongkrak hidrolik akurat.',
      evaluatedDate: '2026-03-03T11:20:00Z',
    },
    {
      id: 'VPE-004',
      evaluationNumber: 'VPE-2026-004',
      vendorId: 'VND-004',
      vendorName: 'PT Varia Usaha Beton (SIG Group)',
      projectId: 'PRJ-TOL-004',
      projectName: 'Tol Trans Sumatera Ruas Tebing Tinggi-Parapat',
      evaluationPeriod: '2026-Q1',
      qualityScore: 80,
      deliveryScore: 76,
      hseScore: 82,
      commercialScore: 78,
      weightedScore: 78.8,
      resultingTier: 'SILVER',
      ncrCount: 1,
      evaluatorName: 'Rahmat Subekti (Site Logistics Coordinator)',
      remarks: 'Sempat terjadi keterlambatan 1 hari batching plant akibat maintenance pompa, namun segera teratasi dengan batching cadangan.',
      evaluatedDate: '2026-03-05T09:15:00Z',
    },
    {
      id: 'VPE-005',
      evaluationNumber: 'VPE-2026-005',
      vendorId: 'VND-007',
      vendorName: 'CV Putra Mandiri Konstruksi',
      projectId: 'PRJ-BNR-005',
      projectName: 'Bendungan Bener Purworejo Access Road',
      evaluationPeriod: '2026-Q1',
      qualityScore: 65,
      deliveryScore: 60,
      hseScore: 60,
      commercialScore: 65,
      weightedScore: 62.0,
      resultingTier: 'BRONZE',
      ncrCount: 2,
      evaluatorName: 'Yusuf Maulana (Site QC Inspector)',
      remarks: 'Kepadatan tanah timbunan belum seragam pada uji sand cone pertama. Diperlukan compactor tambahan dan supervisi K3 pekerja.',
      evaluatedDate: '2026-02-15T10:30:00Z',
    },
  ];

  private rfqs: RfqRecord[] = [
    {
      id: 'RFQ-001',
      rfqNumber: 'RFQ-2026-001',
      title: 'Pengadaan Baja Tulangan Ulir Proyek IKN Tahap II',
      projectId: 'PRJ-IKN-001',
      projectName: 'Pembangunan Istana Negara IKN Tahap II',
      category: 'Baja & Struktur Logam',
      estimatedBudget: 8500000000,
      submissionDeadline: '2026-03-25T17:00:00Z',
      deliveryLocation: 'Pelabuhan Cita Sabut / Stockyard IKN KIPP',
      targetDeliveryDate: '2026-04-10',
      status: 'OPEN',
      requiredVendorTier: 'SILVER_ABOVE',
      items: [
        { id: 'ITM-01', itemName: 'Baja Tulangan Sirip BJTS 420B D25', spec: 'SNI 2052:2017 Panjang 12m', quantity: 350, uom: 'TON' },
        { id: 'ITM-02', itemName: 'Baja Tulangan Sirip BJTS 420B D16', spec: 'SNI 2052:2017 Panjang 12m', quantity: 280, uom: 'TON' },
      ],
      bidsCount: 2,
      lowestBidAmount: 8150000000,
      createdAt: '2026-03-01T08:00:00Z',
    },
    {
      id: 'RFQ-002',
      rfqNumber: 'RFQ-2026-002',
      title: 'Sewa Heavy Duty Tower Crane 10-Ton Proyek RS Regional Medan',
      projectId: 'PRJ-RSM-002',
      projectName: 'RS Regional Medan Modern Medical Center',
      category: 'Alat Berat & Rental',
      estimatedBudget: 1450000000,
      submissionDeadline: '2026-03-20T15:00:00Z',
      deliveryLocation: 'Jl. Willem Iskandar Kav. 12, Medan Estate',
      targetDeliveryDate: '2026-04-01',
      status: 'UNDER_EVALUATION',
      requiredVendorTier: 'GOLD',
      items: [
        { id: 'ITM-03', itemName: 'Sewa Tower Crane Jib 60m 10-Ton', spec: 'Tahun rakitan >= 2020 + Operator SILO', quantity: 6, uom: 'BULAN' },
        { id: 'ITM-04', itemName: 'Jasa Erection & Dismantling TC', spec: 'Termasuk pondasi angkur & perizinan Disnaker', quantity: 1, uom: 'LOT' },
      ],
      bidsCount: 1,
      lowestBidAmount: 1380000000,
      createdAt: '2026-02-20T09:00:00Z',
    },
    {
      id: 'RFQ-003',
      rfqNumber: 'RFQ-2026-003',
      title: 'Supply Beton Ready Mix Mutu fc 35 MPa Flyover Kalimalang',
      projectId: 'PRJ-KLM-003',
      projectName: 'Flyover Kalimalang Interchange Toll',
      category: 'Ready Mix & Precast',
      estimatedBudget: 4800000000,
      submissionDeadline: '2026-02-28T17:00:00Z',
      deliveryLocation: 'Batching Point Exit Bekasi Barat',
      targetDeliveryDate: '2026-03-15',
      status: 'AWARDED',
      requiredVendorTier: 'ALL',
      items: [
        { id: 'ITM-05', itemName: 'Beton Ready Mix fc 35 MPa Slump 12±2cm', spec: 'Semen OPC Tipe 1 + Fly Ash max 15%', quantity: 4200, uom: 'M3' },
      ],
      bidsCount: 3,
      lowestBidAmount: 4620000000,
      awardedVendorId: 'VND-004',
      awardedVendorName: 'PT Varia Usaha Beton (SIG Group)',
      createdAt: '2026-02-10T10:00:00Z',
    },
  ];

  private bids: RfqBidRecord[] = [
    {
      id: 'BID-001',
      rfqId: 'RFQ-001',
      vendorId: 'VND-002',
      vendorName: 'PT Krakatau Steel (Persero) Tbk',
      vendorTier: 'GOLD',
      quotedAmount: 8150000000,
      deliveryLeadTimeDays: 14,
      warrantyMonths: 12,
      paymentTerms: 'SKBDN 90 Hari setelah BAST Material On Site',
      tkdnPercentage: 78.5,
      isSealed: true,
      status: 'SUBMITTED',
      technicalNotes: 'Franko Jetty Balikpapan / Stockyard IKN KIPP. Pengiriman bertahap 4 shipment.',
      submittedAt: '2026-03-03T11:00:00Z',
    },
    {
      id: 'BID-002',
      rfqId: 'RFQ-001',
      vendorId: 'VND-001',
      vendorName: 'PT Solusi Bangun Semen Indonesia',
      vendorTier: 'GOLD',
      quotedAmount: 8350000000,
      deliveryLeadTimeDays: 12,
      warrantyMonths: 12,
      paymentTerms: 'Termin 30 Hari via SCF Mandiri',
      tkdnPercentage: 82.0,
      isSealed: true,
      status: 'SUBMITTED',
      technicalNotes: 'Mitra konsorsium baja Krakatau Posco.',
      submittedAt: '2026-03-04T15:20:00Z',
    },
    {
      id: 'BID-003',
      rfqId: 'RFQ-002',
      vendorId: 'VND-003',
      vendorName: 'PT Trakindo Utama Heavy Machinery',
      vendorTier: 'GOLD',
      quotedAmount: 1380000000,
      deliveryLeadTimeDays: 7,
      warrantyMonths: 6,
      paymentTerms: 'Termin Bulanan Net 30',
      tkdnPercentage: 65.0,
      isSealed: true,
      status: 'SUBMITTED',
      technicalNotes: 'Termasuk teknisi on-site 24/7 dan penggantian parts darurat < 24 jam.',
      submittedAt: '2026-02-25T14:10:00Z',
    },
  ];

  // 1. GET /summary
  getSummary() {
    const totalVendors = this.vendors.length;
    const goldCount = this.vendors.filter((v) => v.tier === 'GOLD').length;
    const silverCount = this.vendors.filter((v) => v.tier === 'SILVER').length;
    const bronzeCount = this.vendors.filter((v) => v.tier === 'BRONZE').length;
    const blacklistedCount = this.vendors.filter((v) => v.tier === 'BLACKLISTED').length;

    const pendingLegalCount = this.vendors.filter((v) => v.legalStatus === 'PENDING').length;
    const openRfqsCount = this.rfqs.filter((r) => r.status === 'OPEN').length;

    const avgVpeScore =
      this.vendors.filter((v) => v.tier !== 'BLACKLISTED').reduce((acc, curr) => acc + curr.vpeScore, 0) /
      (totalVendors - blacklistedCount || 1);

    const totalActiveContracts = this.vendors.reduce((acc, curr) => acc + curr.activeContractsCount, 0);

    return {
      totalVendors,
      tiers: {
        gold: goldCount,
        silver: silverCount,
        bronze: bronzeCount,
        blacklisted: blacklistedCount,
      },
      averageVpeScore: Math.round(avgVpeScore * 10) / 10,
      pendingLegalVerification: pendingLegalCount,
      openRfqs: openRfqsCount,
      totalActiveContracts,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. GET /vendors
  getVendors(tier?: string, category?: string, legalStatus?: string, search?: string) {
    let result = [...this.vendors];

    if (tier && tier !== 'ALL') {
      result = result.filter((v) => v.tier === tier);
    }
    if (category && category !== 'ALL') {
      result = result.filter((v) => v.category === category);
    }
    if (legalStatus && legalStatus !== 'ALL') {
      result = result.filter((v) => v.legalStatus === legalStatus);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.companyName.toLowerCase().includes(q) ||
          v.vendorCode.toLowerCase().includes(q) ||
          (v.brandName && v.brandName.toLowerCase().includes(q)) ||
          v.city.toLowerCase().includes(q),
      );
    }

    return result;
  }

  // 3. GET /vendors/:id
  getVendorById(id: string) {
    const vendor = this.vendors.find((v) => v.id === id || v.vendorCode === id);
    if (!vendor) {
      throw new NotFoundException(`Vendor dengan ID atau Kode ${id} tidak ditemukan`);
    }
    const vendorEvaluations = this.evaluations.filter((e) => e.vendorId === vendor.id);
    const vendorBids = this.bids.filter((b) => b.vendorId === vendor.id);

    return {
      vendor,
      evaluations: vendorEvaluations,
      bids: vendorBids,
    };
  }

  // 4. POST /vendors (Register)
  registerVendor(dto: RegisterVendorDto) {
    const nextSeq = this.vendors.length + 1;
    const vendorCode = `VND-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `VND-${String(nextSeq).padStart(3, '0')}`;

    const newVendor: VendorRecord = {
      id,
      vendorCode,
      companyName: dto.companyName,
      brandName: dto.brandName,
      category: dto.category,
      tier: 'BRONZE', // default awal masa probation
      vpeScore: 60.0,
      legalStatus: 'PENDING',
      nib: dto.nib,
      sbuNumber: dto.sbuNumber,
      sbuGrade: dto.sbuGrade,
      npwp: dto.npwp,
      isPkp: dto.isPkp,
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber,
      bankAccountName: dto.bankAccountName,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      city: dto.city,
      province: dto.province,
      certifications: dto.certifications || [],
      materialsSupplied: dto.materialsSupplied || [],
      activeContractsCount: 0,
      totalCompletedContracts: 0,
      ncrCount: 0,
      registeredAt: new Date().toISOString(),
      lastEvaluatedAt: new Date().toISOString(),
    };

    this.vendors.unshift(newVendor);
    return {
      message: 'Pendaftaran rekanan berhasil disubmit, menunggu verifikasi legalitas OSS & LPJK.',
      vendor: newVendor,
    };
  }

  // 5. PATCH /vendors/:id/verify-legal
  verifyLegalStatus(id: string, isApproved: boolean, notes?: string) {
    const vendor = this.vendors.find((v) => v.id === id || v.vendorCode === id);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} tidak ditemukan`);
    }

    vendor.legalStatus = isApproved ? 'VERIFIED' : 'REJECTED';
    if (!isApproved && notes) {
      vendor.sanctionReason = `Penolakan Legalitas: ${notes}`;
    }

    return {
      message: `Status legalitas vendor ${vendor.companyName} diperbarui menjadi ${vendor.legalStatus}`,
      vendor,
    };
  }

  // 6. PATCH /vendors/:id/sanction
  sanctionVendor(id: string, action: 'BLACKLIST' | 'UNFREEZE', reason: string) {
    const vendor = this.vendors.find((v) => v.id === id || v.vendorCode === id);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} tidak ditemukan`);
    }

    if (action === 'BLACKLIST') {
      vendor.tier = 'BLACKLISTED';
      vendor.sanctionReason = reason;
      vendor.sanctionDate = new Date().toISOString();
    } else {
      vendor.tier = 'BRONZE';
      delete vendor.sanctionReason;
      delete vendor.sanctionDate;
    }

    return {
      message: `Status sanksi vendor ${vendor.companyName} berhasil diubah ke ${vendor.tier}`,
      vendor,
    };
  }

  // 7. GET /evaluations
  getEvaluations(vendorId?: string, projectId?: string) {
    let result = [...this.evaluations];
    if (vendorId && vendorId !== 'ALL') {
      result = result.filter((e) => e.vendorId === vendorId);
    }
    if (projectId && projectId !== 'ALL') {
      result = result.filter((e) => e.projectId === projectId);
    }
    return result;
  }

  // 8. POST /evaluations (Input VPE scoring)
  evaluateVendor(dto: EvaluateVendorDto) {
    const vendor = this.vendors.find((v) => v.id === dto.vendorId || v.vendorCode === dto.vendorId);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${dto.vendorId} tidak ditemukan`);
    }

    // Kalkulasi pembobotan VPE resmi: Mutu 35%, Waktu 30%, K3 20%, Biaya/Komersial 15%
    const weightedScore =
      dto.qualityScore * 0.35 +
      dto.deliveryScore * 0.3 +
      dto.hseScore * 0.2 +
      dto.commercialScore * 0.15;
    const roundedScore = Math.round(weightedScore * 10) / 10;

    // Evaluasi Tier Otomatis
    let resultingTier: VendorTier = 'BRONZE';
    if (vendor.tier === 'BLACKLISTED') {
      resultingTier = 'BLACKLISTED';
    } else if (roundedScore >= 85 && dto.ncrCount === 0 && vendor.legalStatus === 'VERIFIED') {
      resultingTier = 'GOLD';
    } else if (roundedScore >= 70 && vendor.legalStatus === 'VERIFIED') {
      resultingTier = 'SILVER';
    } else {
      resultingTier = 'BRONZE';
    }

    const nextSeq = this.evaluations.length + 1;
    const newEval: VpeEvaluationRecord = {
      id: `VPE-${String(nextSeq).padStart(3, '0')}`,
      evaluationNumber: `VPE-2026-${String(nextSeq).padStart(3, '0')}`,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      projectId: dto.projectId,
      projectName: dto.projectName,
      evaluationPeriod: dto.evaluationPeriod,
      qualityScore: dto.qualityScore,
      deliveryScore: dto.deliveryScore,
      hseScore: dto.hseScore,
      commercialScore: dto.commercialScore,
      weightedScore: roundedScore,
      resultingTier,
      ncrCount: dto.ncrCount,
      evaluatorName: dto.evaluatorName,
      remarks: dto.remarks || '',
      evaluatedDate: new Date().toISOString(),
    };

    // Update profil vendor
    vendor.vpeScore = roundedScore;
    vendor.tier = resultingTier;
    vendor.ncrCount = dto.ncrCount;
    vendor.lastEvaluatedAt = newEval.evaluatedDate;

    this.evaluations.unshift(newEval);

    return {
      message: `Evaluasi kinerja VPE berhasil disimpan. Skor akhir: ${roundedScore} (Tier: ${resultingTier})`,
      evaluation: newEval,
      updatedVendor: vendor,
    };
  }

  // 9. GET /rfq
  getRfqs(status?: string, projectId?: string) {
    let result = [...this.rfqs];
    if (status && status !== 'ALL') {
      result = result.filter((r) => r.status === status);
    }
    if (projectId && projectId !== 'ALL') {
      result = result.filter((r) => r.projectId === projectId);
    }
    return result;
  }

  // 10. POST /rfq
  createRfq(dto: CreateRfqDto) {
    const nextSeq = this.rfqs.length + 1;
    const rfqNumber = dto.rfqNumber || `RFQ-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `RFQ-${String(nextSeq).padStart(3, '0')}`;

    const newRfq: RfqRecord = {
      id,
      rfqNumber,
      title: dto.title,
      projectId: dto.projectId,
      projectName: dto.projectName,
      category: dto.category,
      estimatedBudget: dto.estimatedBudget,
      submissionDeadline: dto.submissionDeadline,
      deliveryLocation: dto.deliveryLocation,
      targetDeliveryDate: dto.targetDeliveryDate,
      status: 'OPEN',
      requiredVendorTier: dto.requiredVendorTier,
      items: dto.items.map((item, idx) => ({
        id: `ITM-${id}-${idx + 1}`,
        itemName: item.itemName,
        spec: item.spec,
        quantity: item.quantity,
        uom: item.uom,
      })),
      bidsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.rfqs.unshift(newRfq);
    return {
      message: `Paket pengadaan digital e-RFQ ${rfqNumber} berhasil dipublikasikan.`,
      rfq: newRfq,
    };
  }

  // 11. POST /rfq/:id/bids
  submitBid(rfqId: string, dto: SubmitBidDto) {
    const rfq = this.rfqs.find((r) => r.id === rfqId || r.rfqNumber === rfqId);
    if (!rfq) {
      throw new NotFoundException(`Paket RFQ ${rfqId} tidak ditemukan`);
    }

    if (rfq.status !== 'OPEN') {
      throw new BadRequestException(`Paket RFQ ${rfq.rfqNumber} sudah ditutup (${rfq.status})`);
    }

    const vendor = this.vendors.find((v) => v.id === dto.vendorId || v.vendorCode === dto.vendorId);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${dto.vendorId} tidak terdaftar`);
    }

    if (vendor.tier === 'BLACKLISTED') {
      throw new BadRequestException('Rekanan berstatus BLACKLISTED tidak diizinkan memasukkan penawaran');
    }

    if (rfq.requiredVendorTier === 'GOLD' && vendor.tier !== 'GOLD') {
      throw new BadRequestException('Paket RFQ ini mensyaratkan kualifikasi rekanan Tier GOLD');
    }

    if (rfq.requiredVendorTier === 'SILVER_ABOVE' && vendor.tier === 'BRONZE') {
      throw new BadRequestException('Paket RFQ ini mensyaratkan kualifikasi rekanan minimal Tier SILVER');
    }

    const nextSeq = this.bids.length + 1;
    const newBid: RfqBidRecord = {
      id: `BID-${String(nextSeq).padStart(3, '0')}`,
      rfqId: rfq.id,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      vendorTier: vendor.tier,
      quotedAmount: dto.quotedAmount,
      deliveryLeadTimeDays: dto.deliveryLeadTimeDays,
      warrantyMonths: dto.warrantyMonths,
      paymentTerms: dto.paymentTerms,
      tkdnPercentage: dto.tkdnPercentage || 0,
      isSealed: true,
      status: 'SUBMITTED',
      technicalNotes: dto.technicalNotes,
      submittedAt: new Date().toISOString(),
    };

    rfq.bidsCount += 1;
    if (!rfq.lowestBidAmount || dto.quotedAmount < rfq.lowestBidAmount) {
      rfq.lowestBidAmount = dto.quotedAmount;
    }

    this.bids.unshift(newBid);

    return {
      message: 'Penawaran tersandi (*sealed bidding*) berhasil disubmit ke e-Procurement Portal.',
      bid: newBid,
    };
  }

  // Helper untuk bids
  getBidsByRfq(rfqId: string) {
    return this.bids.filter((b) => b.rfqId === rfqId);
  }
}
