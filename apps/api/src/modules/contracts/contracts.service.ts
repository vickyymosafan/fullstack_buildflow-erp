import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { AnalyzeClauseDto } from './dto/analyze-clause.dto';
import { SimulateLdDto } from './dto/simulate-ld.dto';
import { PredictDisputeDto } from './dto/predict-dispute.dto';
import { CreateAmendmentDto } from './dto/create-amendment.dto';

export type ContractType = 'FIDIC_RED' | 'FIDIC_YELLOW' | 'FIDIC_SILVER' | 'LPSE_PUPR' | 'PRIVATE_TURNKEY';
export type ContractStatus = 'ACTIVE' | 'AT_RISK' | 'DISPUTED' | 'AMENDED' | 'COMPLETED';
export type ClauseRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ClauseCategory =
  | 'LIQUIDATED_DAMAGES'
  | 'EXTENSION_OF_TIME'
  | 'PRICE_ESCALATION'
  | 'TERMINATION'
  | 'DEFECTS_LIABILITY'
  | 'FORCE_MAJEURE'
  | 'PAYMENT_TERMS'
  | 'DISPUTE_RESOLUTION';

export interface ContractRecord {
  id: string;
  contractNumber: string;
  title: string;
  clientName: string;
  contractType: ContractType;
  contractValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  originalEndDate: string;
  retentionPercent: number;
  defectNotificationPeriodMonths: number;
  liquidatedDamagesRatePerDay: number;
  liquidatedDamagesCapPercent: number;
  disputeResolutionForum: string;
  projectId?: string;
  status: ContractStatus;
  riskScore: number;
  totalAmendments: number;
  createdAt: string;
}

export interface ClauseRecord {
  id: string;
  contractId: string;
  contractNumber: string;
  clauseNumber: string;
  clauseTitle: string;
  clauseText: string;
  clauseCategory: ClauseCategory;
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

export interface DisputePredictionRecord {
  id: string;
  contractId: string;
  contractNumber: string;
  contractTitle: string;
  clientName: string;
  disputeProbabilityPercent: number;
  riskClassification: 'CRITICAL_DISPUTE' | 'HIGH_POTENTIAL' | 'MODERATE_MONITOR' | 'LOW_HEALTHY';
  primaryDrivers: { factor: string; weight: number; severity: string; details: string }[];
  potentialFinancialExposure: number;
  recommendedMitigation: string[];
  recommendedForum: string;
  evaluatedAt: string;
}

export interface AmendmentRecord {
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
  createdAt: string;
}

@Injectable()
export class ContractsService {
  private contracts: ContractRecord[] = [
    {
      id: 'CTR-001',
      contractNumber: 'CTR-MRT-2026-001',
      title: 'Pembangunan Stasiun Bawah Tanah Harmoni CP202',
      clientName: 'PT MRT Jakarta (Perseroda)',
      contractType: 'FIDIC_RED',
      contractValue: 450000000000,
      currentValue: 462500000000,
      startDate: '2026-01-15',
      endDate: '2027-07-30',
      originalEndDate: '2027-06-30',
      retentionPercent: 5,
      defectNotificationPeriodMonths: 24,
      liquidatedDamagesRatePerDay: 0.001,
      liquidatedDamagesCapPercent: 5,
      disputeResolutionForum: 'BANI_ARBITRATION',
      projectId: 'PRJ-MRT-2026',
      status: 'AT_RISK',
      riskScore: 78,
      totalAmendments: 1,
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'CTR-002',
      contractNumber: 'CTR-IKN-PUPR-04',
      title: 'Pembangunan Rusun Hunian ASN 4 Kawasan Inti IKN',
      clientName: 'Kementerian PUPR BPPW Kalimantan Timur',
      contractType: 'LPSE_PUPR',
      contractValue: 280000000000,
      currentValue: 280000000000,
      startDate: '2026-02-01',
      endDate: '2026-12-15',
      originalEndDate: '2026-12-15',
      retentionPercent: 5,
      defectNotificationPeriodMonths: 12,
      liquidatedDamagesRatePerDay: 0.001,
      liquidatedDamagesCapPercent: 5,
      disputeResolutionForum: 'DAB_ADJUDICATION',
      projectId: 'PRJ-IKN-ASN4',
      status: 'ACTIVE',
      riskScore: 32,
      totalAmendments: 0,
      createdAt: '2026-02-01T09:00:00Z',
    },
    {
      id: 'CTR-003',
      contractNumber: 'CTR-BPJT-JBT-09',
      title: 'Jembatan Cable Stayed Teluk Balikpapan Paket 2',
      clientName: 'Badan Pengatur Jalan Tol (BPJT) PUPR',
      contractType: 'FIDIC_YELLOW',
      contractValue: 620000000000,
      currentValue: 620000000000,
      startDate: '2026-01-10',
      endDate: '2028-02-28',
      originalEndDate: '2028-02-28',
      retentionPercent: 5,
      defectNotificationPeriodMonths: 24,
      liquidatedDamagesRatePerDay: 0.001,
      liquidatedDamagesCapPercent: 10,
      disputeResolutionForum: 'BANI_ARBITRATION',
      projectId: 'PRJ-JBT-BLK',
      status: 'ACTIVE',
      riskScore: 45,
      totalAmendments: 0,
      createdAt: '2026-01-10T08:30:00Z',
    },
    {
      id: 'CTR-004',
      contractNumber: 'CTR-BWS-NTB-2026',
      title: 'Pembangunan Bendungan Meninting Paket II Saluran Pelimpah',
      clientName: 'Balai Wilayah Sungai (BWS) Nusa Tenggara I',
      contractType: 'LPSE_PUPR',
      contractValue: 340000000000,
      currentValue: 340000000000,
      startDate: '2025-08-01',
      endDate: '2026-11-30',
      originalEndDate: '2026-11-30',
      retentionPercent: 5,
      defectNotificationPeriodMonths: 12,
      liquidatedDamagesRatePerDay: 0.001,
      liquidatedDamagesCapPercent: 5,
      disputeResolutionForum: 'DISTRICT_COURT',
      projectId: 'PRJ-BDG-NTB',
      status: 'DISPUTED',
      riskScore: 84,
      totalAmendments: 0,
      createdAt: '2025-08-01T07:45:00Z',
    },
    {
      id: 'CTR-005',
      contractNumber: 'CTR-PTM-WH-021',
      title: 'Smart Logistics Warehouse & CFS Hub Patimban',
      clientName: 'PT Patimban Multi Terminal Logistic',
      contractType: 'PRIVATE_TURNKEY',
      contractValue: 175000000000,
      currentValue: 175000000000,
      startDate: '2026-03-01',
      endDate: '2026-10-31',
      originalEndDate: '2026-10-31',
      retentionPercent: 5,
      defectNotificationPeriodMonths: 12,
      liquidatedDamagesRatePerDay: 0.002,
      liquidatedDamagesCapPercent: 8,
      disputeResolutionForum: 'BANI_ARBITRATION',
      projectId: 'PRJ-PTM-LOG',
      status: 'ACTIVE',
      riskScore: 28,
      totalAmendments: 0,
      createdAt: '2026-03-01T10:00:00Z',
    },
  ];

  private clauses: ClauseRecord[] = [
    {
      id: 'CLS-001',
      contractId: 'CTR-001',
      contractNumber: 'CTR-MRT-2026-001',
      clauseNumber: 'Klausul 8.7',
      clauseTitle: 'Delay Damages (Liquidated Damages) & Unlimited Liability Risk',
      clauseText:
        'Apabila Kontraktor gagal menyelesaikan Pekerjaan tepat pada Waktu Penyelesaian, Kontraktor wajib membayar Denda Keterlambatan sebesar 1/1000 per hari dari Nilai Kontrak tanpa klausul pembebasan atas keterlambatan relokasi utilitas publik yang dilakukan oleh Pihak Ketiga.',
      clauseCategory: 'LIQUIDATED_DAMAGES',
      riskLevel: 'CRITICAL',
      riskScore: 92,
      deviationIdentified:
        'Klausul membebankan penalti keterlambatan mutlak tanpa klausul pengecualian (relief event) atas keterlambatan penyerahan lahan atau relokasi utilitas pipa gas/air milik instansi lain.',
      legalReference:
        'FIDIC Red Book Sub-Clause 8.4 (Extension of Time) & UU Jasa Konstruksi No. 2/2017 Pasal 47 ayat (1) huruf d tentang Kesetaraan Hak dan Kewajiban.',
      recommendation:
        'Ajukan amandemen pembelaan klausul perpanjangan waktu otomatis (deemed EOT) apabila terdapat keterlambatan pihak utilitas pemerintah yang di luar kendali kontraktor.',
      counterClauseProposal:
        'Kontraktor berhak atas Perpanjangan Waktu Penyelesaian (EOT) dan pembebasan denda keterlambatan apabila terjadi keterlambatan relokasi utilitas publik atau gangguan akses kerja oleh Pihak Ketiga.',
      aiConfidenceScore: 96,
      isAmended: false,
      analyzedAt: '2026-01-20T11:00:00Z',
    },
    {
      id: 'CLS-002',
      contractId: 'CTR-001',
      contractNumber: 'CTR-MRT-2026-001',
      clauseNumber: 'Klausul 13.8',
      clauseTitle: 'Price Adjustments & Exclusion of Inflation Fluctuation',
      clauseText:
        'Harga Satuan dalam Kontrak ini bersifat Lumsum Mengikat dan Tetap (Fixed Lump Sum), dan tidak diberlakukan penyesuaian harga (eskalasi) akibat inflasi atau fluktuasi harga semen dan baja tulangan selama masa pelaksanaan.',
      clauseCategory: 'PRICE_ESCALATION',
      riskLevel: 'HIGH',
      riskScore: 81,
      deviationIdentified:
        'Meniadakan hak eskalasi pada proyek multi-years berdurasi lebih dari 12 bulan berpotensi merugikan kontraktor bila terjadi lonjakan harga bahan baku material strategis.',
      legalReference:
        'Permen PUPR No. 14/2020 tentang Standar Dokumen Pemilihan Pengadaan Jasa Konstruksi & Perpres No. 12/2021 Pasal 36.',
      recommendation:
        'Tambahkan formula eskalasi harga indeks BPS / BI untuk komponen material beton semen dan besi tulangan bila fluktuasi melampaui toleransi 5%.',
      counterClauseProposal:
        'Penyesuaian harga (eskalasi) diberlakukan untuk pekerjaan yang melampaui bulan ke-12 sejak penandatanganan kontrak berdasarkan formula indeks harga BPS.',
      aiConfidenceScore: 92,
      isAmended: true,
      analyzedAt: '2026-01-22T14:30:00Z',
    },
    {
      id: 'CLS-003',
      contractId: 'CTR-004',
      contractNumber: 'CTR-BWS-NTB-2026',
      clauseNumber: 'Klausul 20.2',
      clauseTitle: 'Forum Penyelesaian Sengketa via Pengadilan Negeri Mataram',
      clauseText:
        'Segala perselisihan dan sengketa yang timbul dari pelaksanaan Kontrak ini akan diselesaikan secara eksklusif melalui Pengadilan Negeri Kelas IA Mataram.',
      clauseCategory: 'DISPUTE_RESOLUTION',
      riskLevel: 'HIGH',
      riskScore: 85,
      deviationIdentified:
        'Sengketa teknis rekayasa bendungan dialihkan ke Pengadilan Negeri umum yang memakan waktu panjang (banding/kasasi bertahun-tahun) alih-alih arbitrase teknis BANI atau Dewan Sengketa (DAB).',
      legalReference:
        'UU No. 2/2017 Pasal 88 (Penyelesaian Sengketa Jasa Konstruksi Mengutamakan Musyawarah, Mediasi, Dewan Sengketa, dan Arbitrase).',
      recommendation:
        'Ubah forum sengketa menjadi Arbitrase Badan Arbitrase Nasional Indonesia (BANI) dengan putusan final dan mengikat (final and binding) sesuai kaidah industri konstruksi.',
      counterClauseProposal:
        'Perselisihan yang tidak dapat diselesaikan melalui musyawarah atau Dewan Sengketa (DAB) dalam waktu 45 hari akan diputus secara final melalui Arbitrase BANI di Jakarta.',
      aiConfidenceScore: 95,
      isAmended: false,
      analyzedAt: '2026-02-05T09:15:00Z',
    },
    {
      id: 'CLS-004',
      contractId: 'CTR-002',
      contractNumber: 'CTR-IKN-PUPR-04',
      clauseNumber: 'Klausul 4.2',
      clauseTitle: 'Jaminan Pelaksanaan (Performance Bond) & Pencairan Tanpa Bukti Cedera Janji',
      clauseText:
        'Pejabat Pembuat Komitmen berhak mencairkan Jaminan Pelaksanaan sebesar 5% dari Nilai Kontrak secara sepihak (unconditional) atas pertimbangan mandiri tanpa kewajiban membuktikan wanprestasi melalui verifikasi konsultan pengawas.',
      clauseCategory: 'TERMINATION',
      riskLevel: 'MEDIUM',
      riskScore: 68,
      deviationIdentified:
        'Pencairan tanpa verifikasi tim konsultan pengawas (MK) membuka risiko klaim sepihak bila terjadi salah paham administratif lapangan.',
      legalReference:
        'Standar SDP LKPP Bab Syarat-Syarat Umum Kontrak (SSUK) Pasal Ketentuan Jaminan Pelaksanaan.',
      recommendation:
        'Klarifikasi bahwa klaim pencairan jaminan wajib didahului Surat Peringatan (SP 1, SP 2, SP 3) dan audit teknis bersama Pengawas Lapangan.',
      counterClauseProposal:
        'Pencairan jaminan pelaksanaan hanya dapat dilakukan setelah diterbitkan Surat Peringatan Ketiga (SP-3) dan berita acara evaluasi teknis tim konsultan pengawas.',
      aiConfidenceScore: 88,
      isAmended: false,
      analyzedAt: '2026-02-12T10:00:00Z',
    },
    {
      id: 'CLS-005',
      contractId: 'CTR-003',
      contractNumber: 'CTR-BPJT-JBT-09',
      clauseNumber: 'Klausul 17.1',
      clauseTitle: 'Ganti Rugi Kerusakan Struktural & Batas Tanggung Jawab Desain',
      clauseText:
        'Kontraktor Bertanggung Jawab Penuh atas Desain Rancang Bangun (Design & Build) Jembatan dan membebaskan Pemilik Proyek dari seluruh tuntutan pihak ketiga hingga 10 tahun pasca FHO.',
      clauseCategory: 'DEFECTS_LIABILITY',
      riskLevel: 'MEDIUM',
      riskScore: 62,
      deviationIdentified:
        'Tanggung jawab kegagalan bangunan 10 tahun sesuai UU No. 2/2017 namun perlu ditegaskan batasan jika diakibatkan oleh beban lalu lintas berlebih (over-dimension over-load / ODOL).',
      legalReference:
        'UU No. 2/2017 Pasal 60 dan 65 tentang Tanggung Jawab Kegagalan Bangunan.',
      recommendation:
        'Tambahkan pasal perlindungan kontraktor dari kegagalan bangunan yang disebabkan modifikasi struktur tanpa izin atau beban kendaraan melampaui MST (Muatan Sumbu Terberat).',
      counterClauseProposal:
        'Tanggung jawab kegagalan struktur dikecualikan apabila terjadi akibat beban operasional melebihi kapasitas desain izin atau force majeure seismik melampaui SNI gempa.',
      aiConfidenceScore: 90,
      isAmended: false,
      analyzedAt: '2026-02-18T13:45:00Z',
    },
    {
      id: 'CLS-006',
      contractId: 'CTR-005',
      contractNumber: 'CTR-PTM-WH-021',
      clauseNumber: 'Klausul 14.7',
      clauseTitle: 'Jangka Waktu Pembayaran Sertifikat Bulanan (Monthly Certificate)',
      clauseText:
        'Pemilik Proyek wajib membayar Tagihan Progress Termin Kontraktor paling lambat 28 hari kerja setelah diterbitkannya Sertifikat Pembayaran oleh Konsultan Manajemen Konstruksi.',
      clauseCategory: 'PAYMENT_TERMS',
      riskLevel: 'LOW',
      riskScore: 24,
      deviationIdentified:
        'Standar pembayaran normal sesuai praktek industri konstruksi komersial.',
      legalReference:
        'FIDIC Yellow Book Sub-Clause 14.7 (Payment) & Standar Asosiasi Kontraktor Indonesia (AKI).',
      recommendation:
        'Klausul telah seimbang. Pastikan flow penagihan internal dihubungkan ke sistem billing ERP agar tidak melewati tenggat verifikasi.',
      counterClauseProposal:
        'Klausul telah sesuai standar industri, tidak memerlukan usulan perubahan.',
      aiConfidenceScore: 97,
      isAmended: false,
      analyzedAt: '2026-03-05T15:00:00Z',
    },
  ];

  private disputePredictions: DisputePredictionRecord[] = [
    {
      id: 'DSP-001',
      contractId: 'CTR-001',
      contractNumber: 'CTR-MRT-2026-001',
      contractTitle: 'Pembangunan Stasiun Bawah Tanah Harmoni CP202',
      clientName: 'PT MRT Jakarta (Perseroda)',
      disputeProbabilityPercent: 78,
      riskClassification: 'CRITICAL_DISPUTE',
      primaryDrivers: [
        {
          factor: 'Deviasi Progres Fisik SPI Rendah',
          weight: 35,
          severity: 'HIGH',
          details: 'SPI saat ini 0.82 akibat keterlambatan pergeseran jalur pipa gas PGN bawah tanah.',
        },
        {
          factor: 'Keterlambatan Pembayaran Termin MC',
          weight: 25,
          severity: 'HIGH',
          details: 'MC #03 senilai Rp 32 Miliar tertahan 75 hari menunggu verifikasi addendum waktu.',
        },
        {
          factor: 'CCO / Change Order Tidak Disetujui',
          weight: 25,
          severity: 'HIGH',
          details: '4 berkas usulan pekerjaan tambah D-Wall belum ditandatangani PPK.',
        },
        {
          factor: 'Klausul Penalti Keterlambatan Rigid',
          weight: 15,
          severity: 'MEDIUM',
          details: 'Klausul 8.7 tidak memuat relief event otomatis.',
        },
      ],
      potentialFinancialExposure: 22500000000,
      recommendedMitigation: [
        'Ajukan Surat Notifikasi Klaim Perpanjangan Waktu (EOT Notice) 45 hari mengacu FIDIC Sub-Clause 20.1.',
        'Minta rapat tripartit bersama Pemilik Proyek, Konsultan MK, dan Kontraktor untuk penandatanganan Addendum 02.',
        'Kirimkan somasi administratif atas keterlambatan pembayaran termin MC #03 guna menghindari default kontraktor.',
      ],
      recommendedForum: 'Dewan Sengketa (Dispute Adjudication Board - DAB) diikuti Arbitrase BANI bila kebuntuan berlanjut.',
      evaluatedAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'DSP-002',
      contractId: 'CTR-004',
      contractNumber: 'CTR-BWS-NTB-2026',
      contractTitle: 'Pembangunan Bendungan Meninting Paket II Saluran Pelimpah',
      clientName: 'Balai Wilayah Sungai (BWS) Nusa Tenggara I',
      disputeProbabilityPercent: 84,
      riskClassification: 'CRITICAL_DISPUTE',
      primaryDrivers: [
        {
          factor: 'Sengketa Pembebasan Lahan Tambahan',
          weight: 40,
          severity: 'CRITICAL',
          details: 'Akses quarry material batu andesit diblokir warga selama 60 hari.',
        },
        {
          factor: 'Klaim Cuaca Ekstrem (Curah Hujan Tinggi)',
          weight: 30,
          severity: 'HIGH',
          details: 'Banjir bandang merusak tanggul cofferdam sementara pada kuartal IV 2025.',
        },
        {
          factor: 'Forum Sengketa di Pengadilan Negeri',
          weight: 20,
          severity: 'HIGH',
          details: 'Klausul 20.2 menetapkan PN Mataram yang berisiko eskalasi sengketa publik berkepanjangan.',
        },
        {
          factor: 'Penolakan Berita Acara Keadaan Kahar',
          weight: 10,
          severity: 'MEDIUM',
          details: 'PPK belum menerbitkan SK Force Majeure resmi BMKG.',
        },
      ],
      potentialFinancialExposure: 17000000000,
      recommendedMitigation: [
        'Daftarkan permohonan Mediasi melalui Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP).',
        'Lampirkan data rekam cuaca resmi BMKG Stasiun Klimatologi Lombok Barat sebagai bukti keadaan kahar.',
        'Negosiasikan amandemen addendum pengalihan forum ke BANI Surabaya atau Jakarta.',
      ],
      recommendedForum: 'Badan Arbitrase Nasional Indonesia (BANI).',
      evaluatedAt: '2026-02-28T16:20:00Z',
    },
    {
      id: 'DSP-003',
      contractId: 'CTR-003',
      contractNumber: 'CTR-BPJT-JBT-09',
      contractTitle: 'Jembatan Cable Stayed Teluk Balikpapan Paket 2',
      clientName: 'Badan Pengatur Jalan Tol (BPJT) PUPR',
      disputeProbabilityPercent: 45,
      riskClassification: 'MODERATE_MONITOR',
      primaryDrivers: [
        {
          factor: 'Eskalasi Harga Baja Khusus High-Tensile',
          weight: 50,
          severity: 'MEDIUM',
          details: 'Kenaikan harga baja impor 14% di atas pagu penawaran tender.',
        },
        {
          factor: 'Koordinasi Alur Pelayaran Pelabuhan',
          weight: 30,
          severity: 'MEDIUM',
          details: 'Waktu kerja pemancangan pylon dibatasi izin KSOP pelayaran.',
        },
        {
          factor: 'Kepatuhan K3 Kerja Ketinggian',
          weight: 20,
          severity: 'LOW',
          details: 'Persyaratan K3 ketat berpotensi memperlambat siklus harian pekerjaan pylon.',
        },
      ],
      potentialFinancialExposure: 31000000000,
      recommendedMitigation: [
        'Ajukan permohonan penyesuaian harga (Price Adjustment) sesuai indeks eskalasi material khusus PUPR.',
        'Rapatkan izin alur pelayaran dengan KSOP Kelas I Balikpapan untuk window kerja malam hari.',
      ],
      recommendedForum: 'Dispute Adjudication Board (DAB).',
      evaluatedAt: '2026-03-02T11:40:00Z',
    },
  ];

  private amendments: AmendmentRecord[] = [
    {
      id: 'AMD-001',
      contractId: 'CTR-001',
      contractNumber: 'CTR-MRT-2026-001',
      amendmentNumber: 'ADD-01',
      title: 'Addendum I: Perpanjangan Waktu (EOT) & Relokasi Utilitas Gas PGN',
      amendmentType: 'SCOPE_CHANGE',
      costDelta: 12500000000,
      eotDays: 30,
      previousValue: 450000000000,
      newValue: 462500000000,
      previousEndDate: '2027-06-30',
      newEndDate: '2027-07-30',
      effectiveDate: '2026-02-20',
      signedByClient: 'Budi Santoso, ST (PPK MRT Jakarta)',
      signedByContractor: 'Ir. Hendra Wijaya (Project Director BuildFlow)',
      description: 'Penyesuaian galian akibat relokasi pipa gas PGN dan penambahan masa kerja 30 hari kalender.',
      createdAt: '2026-02-20T14:00:00Z',
    },
  ];

  // 1. GET /contracts/summary
  getSummary() {
    const totalContracts = this.contracts.length;
    const activeContracts = this.contracts.filter((c) => c.status === 'ACTIVE' || c.status === 'AT_RISK').length;
    const atRiskContracts = this.contracts.filter((c) => c.status === 'AT_RISK' || c.status === 'DISPUTED').length;
    const totalContractValue = this.contracts.reduce((acc, curr) => acc + curr.currentValue, 0);
    const totalClausesAnalyzed = this.clauses.length;
    const criticalClausesCount = this.clauses.filter((cl) => cl.riskLevel === 'CRITICAL').length;
    const highRiskClausesCount = this.clauses.filter((cl) => cl.riskLevel === 'HIGH' || cl.riskLevel === 'CRITICAL').length;
    const predictedDisputeCount = this.disputePredictions.filter((d) => d.disputeProbabilityPercent >= 70).length;
    const totalFinancialExposure = this.disputePredictions.reduce((acc, curr) => acc + curr.potentialFinancialExposure, 0);

    return {
      totalContracts,
      activeContracts,
      atRiskContracts,
      totalContractValue,
      totalClausesAnalyzed,
      criticalClausesCount,
      highRiskClausesCount,
      predictedDisputeCount,
      totalFinancialExposure,
      topDisputeRiskContracts: this.disputePredictions.slice(0, 3),
    };
  }

  // 2. GET /contracts
  getContracts(type?: string, status?: string) {
    let result = [...this.contracts];
    if (type && type !== 'ALL') {
      result = result.filter((c) => c.contractType === type);
    }
    if (status && status !== 'ALL') {
      result = result.filter((c) => c.status === status);
    }
    return result;
  }

  // 3. GET /contracts/:id
  getContractById(id: string) {
    const contract = this.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      throw new NotFoundException(`Kontrak ${id} tidak ditemukan`);
    }
    const relatedClauses = this.clauses.filter((cl) => cl.contractId === contract.id);
    const disputeRecord = this.disputePredictions.find((d) => d.contractId === contract.id);
    const relatedAmendments = this.amendments.filter((a) => a.contractId === contract.id);

    return {
      contract,
      clauses: relatedClauses,
      disputeRisk: disputeRecord || null,
      amendments: relatedAmendments,
    };
  }

  // 4. POST /contracts
  createContract(dto: CreateContractDto) {
    const nextSeq = this.contracts.length + 1;
    const id = `CTR-${String(nextSeq).padStart(3, '0')}`;

    const newContract: ContractRecord = {
      id,
      contractNumber: dto.contractNumber,
      title: dto.title,
      clientName: dto.clientName,
      contractType: dto.contractType as ContractType,
      contractValue: Number(dto.contractValue),
      currentValue: Number(dto.contractValue),
      startDate: dto.startDate,
      endDate: dto.endDate,
      originalEndDate: dto.endDate,
      retentionPercent: dto.retentionPercent ?? 5,
      defectNotificationPeriodMonths: dto.defectNotificationPeriodMonths ?? 12,
      liquidatedDamagesRatePerDay: dto.liquidatedDamagesRatePerDay ?? 0.001,
      liquidatedDamagesCapPercent: dto.liquidatedDamagesCapPercent ?? 5,
      disputeResolutionForum: dto.disputeResolutionForum,
      projectId: dto.projectId,
      status: 'ACTIVE',
      riskScore: 30,
      totalAmendments: 0,
      createdAt: new Date().toISOString(),
    };

    this.contracts.unshift(newContract);
    return {
      message: `Kontrak ${newContract.contractNumber} berhasil didaftarkan ke sistem AI Legal.`,
      contract: newContract,
    };
  }

  // 5. GET /contracts/clauses/list
  getClauses(contractId?: string, riskLevel?: string, category?: string) {
    let result = [...this.clauses];
    if (contractId && contractId !== 'ALL') {
      result = result.filter((cl) => cl.contractId === contractId);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      result = result.filter((cl) => cl.riskLevel === riskLevel);
    }
    if (category && category !== 'ALL') {
      result = result.filter((cl) => cl.clauseCategory === category);
    }
    return result;
  }

  // 6. POST /contracts/clauses/analyze
  analyzeClause(dto: AnalyzeClauseDto) {
    const contract = this.contracts.find((c) => c.id === dto.contractId || c.contractNumber === dto.contractId);
    const contractNumber = contract ? contract.contractNumber : dto.contractId;

    const nextSeq = this.clauses.length + 1;
    const id = `CLS-${String(nextSeq).padStart(3, '0')}`;

    // AI clause evaluation logic simulation
    const lowerText = dto.clauseText.toLowerCase();
    let riskLevel: ClauseRiskLevel = 'LOW';
    let riskScore = 25;
    let deviationIdentified = 'Klausul seimbang dan sesuai ketentuan FIDIC standar.';
    let legalReference = 'UU Jasa Konstruksi No. 2/2017 & Standar FIDIC.';
    let recommendation = 'Klausul dapat disetujui tanpa catatan khusus.';
    let counterClauseProposal = 'Tidak memerlukan perubahan.';

    if (lowerText.includes('tanpa batas') || lowerText.includes('sepihak') || lowerText.includes('unlimited') || lowerText.includes('unconditional')) {
      riskLevel = 'CRITICAL';
      riskScore = 94;
      deviationIdentified = 'Ditemukan klausul liabilitas sepihak tanpa batas risiko (unlimited liability) yang melanggar asas keseimbangan hukum.';
      legalReference = 'UU Jasa Konstruksi No. 2/2017 Pasal 47 & KUHPerdata Pasal 1320 (Kesesuaian Sebab yang Halal).';
      recommendation = 'Wajib diajukan sanggahan atau amandemen pembatasan tanggung jawab (liability cap) maksimum 100% nilai kontrak.';
      counterClauseProposal = 'Tanggung jawab ganti rugi dibatasi maksimum sebesar Nilai Kontrak dan tidak mencakup kerugian konsekuensial (indirect loss).';
    } else if (lowerText.includes('denda') || lowerText.includes('penalti') || lowerText.includes('liquidated damages')) {
      riskLevel = 'HIGH';
      riskScore = 82;
      deviationIdentified = 'Klausul denda keterlambatan belum memuat mekanisme relief event atau perpanjangan waktu otomatis (deemed EOT).';
      legalReference = 'FIDIC Sub-Clause 8.4 (Extension of Time) & Perpres No. 12/2021.';
      recommendation = 'Tambahkan klausul pembelaan keterlambatan akibat kelalaian owner atau force majeure.';
      counterClauseProposal = 'Kontraktor dibebaskan dari denda keterlambatan selama masa terjadinya kendala akibat pihak ketiga di luar kendali wajar.';
    } else if (lowerText.includes('tetap') || lowerText.includes('tidak ada eskalasi') || lowerText.includes('fixed price')) {
      riskLevel = 'MEDIUM';
      riskScore = 65;
      deviationIdentified = 'Klausul harga tetap untuk kontrak multi-tahun tanpa klausul eskalasi inflasi bahan baku.';
      legalReference = 'Permen PUPR No. 14/2020 tentang Penyesuaian Harga Multi-Years.';
      recommendation = 'Masukkan klausul penyesuaian harga indeks BPS bila inflasi kumulatif melampaui 5%.';
      counterClauseProposal = 'Eskalasi harga diberlakukan untuk pekerjaan yang dilaksanakan setelah bulan ke-12 sejak kontrak berlaku.';
    }

    const newClause: ClauseRecord = {
      id,
      contractId: dto.contractId,
      contractNumber,
      clauseNumber: dto.clauseNumber,
      clauseTitle: dto.clauseTitle,
      clauseText: dto.clauseText,
      clauseCategory: dto.clauseCategory as ClauseCategory,
      riskLevel,
      riskScore,
      deviationIdentified,
      legalReference,
      recommendation,
      counterClauseProposal,
      aiConfidenceScore: 94,
      isAmended: false,
      analyzedAt: new Date().toISOString(),
    };

    this.clauses.unshift(newClause);
    return {
      message: `Analisis AI Legal untuk pasal ${newClause.clauseNumber} (${newClause.clauseTitle}) selesai dengan tingkat risiko ${newClause.riskLevel}.`,
      clause: newClause,
    };
  }

  // 7. PATCH /contracts/clauses/:id/risk
  updateClauseRisk(id: string, riskLevel: ClauseRiskLevel, notes?: string) {
    const clause = this.clauses.find((cl) => cl.id === id);
    if (!clause) {
      throw new NotFoundException(`Klausul ${id} tidak ditemukan`);
    }

    clause.riskLevel = riskLevel;
    if (notes) {
      clause.recommendation = `${clause.recommendation} [Catatan Reviewer: ${notes}]`;
    }
    clause.isAmended = true;

    return {
      message: `Tingkat risiko klausul ${clause.clauseNumber} berhasil disesuaikan menjadi ${riskLevel}.`,
      clause,
    };
  }

  // 8. POST /contracts/calculator/simulate-ld
  simulateLiquidatedDamages(dto: SimulateLdDto) {
    const contract = this.contracts.find((c) => c.id === dto.contractId || c.contractNumber === dto.contractId);
    const contractValue = dto.overrideContractValue ?? (contract ? contract.currentValue : 450000000000);
    const dailyRate = dto.dailyRate ?? (contract ? contract.liquidatedDamagesRatePerDay : 0.001);
    const capPercent = dto.capPercent ?? (contract ? contract.liquidatedDamagesCapPercent : 5);
    const eligibleEotDays = dto.eligibleEotDays ?? 0;

    const netDelayDays = Math.max(0, dto.delayDays - eligibleEotDays);
    const dailyPenaltyAmount = contractValue * dailyRate;
    const grossPenaltyTotal = dto.delayDays * dailyPenaltyAmount;
    const netPenaltyTotal = netDelayDays * dailyPenaltyAmount;
    const maxPenaltyCapAmount = contractValue * (capPercent / 100);

    const effectivePenaltyGross = Math.min(grossPenaltyTotal, maxPenaltyCapAmount);
    const effectivePenaltyNet = Math.min(netPenaltyTotal, maxPenaltyCapAmount);
    const potentialSavingViaEot = effectivePenaltyGross - effectivePenaltyNet;
    const isCapReached = grossPenaltyTotal >= maxPenaltyCapAmount;

    return {
      contractId: dto.contractId,
      contractValue,
      dailyRatePercent: dailyRate * 100,
      capPercent,
      maxPenaltyCapAmount,
      totalDelayDays: dto.delayDays,
      eligibleEotDays,
      netDelayDays,
      dailyPenaltyAmount,
      grossPenaltyWithoutEot: effectivePenaltyGross,
      netPenaltyWithEotDefense: effectivePenaltyNet,
      potentialSavingViaEot,
      isCapReached,
      legalStrategyAdvice:
        netDelayDays > 0
          ? `Segera ajukan berkas klaim EOT untuk ${eligibleEotDays} hari agar terhindar dari denda sebesar Rp ${potentialSavingViaEot.toLocaleString('id-ID')}. Batas maksimum denda (cap ${capPercent}%) adalah Rp ${maxPenaltyCapAmount.toLocaleString('id-ID')}.`
          : 'Seluruh keterlambatan berhasil dimitigasi melalui pengajuan EOT resmi, bebas dari pembebanan denda liquidated damages.',
    };
  }

  // 9. GET /contracts/disputes/predictions
  getDisputePredictions(contractId?: string) {
    let result = [...this.disputePredictions];
    if (contractId && contractId !== 'ALL') {
      result = result.filter((d) => d.contractId === contractId);
    }
    return result;
  }

  // 10. POST /contracts/disputes/predict
  predictDispute(dto: PredictDisputeDto) {
    const contract = this.contracts.find((c) => c.id === dto.contractId || c.contractNumber === dto.contractId);
    const contractTitle = contract ? contract.title : 'Proyek Konstruksi Terkelola';
    const clientName = contract ? contract.clientName : 'Pemilik Proyek';
    const contractValue = contract ? contract.currentValue : 300000000000;

    // Composite dispute calculation algorithm
    let score = 20; // baseline
    const drivers: { factor: string; weight: number; severity: string; details: string }[] = [];

    // Factor 1: SPI Delay
    if (dto.schedulePerformanceIndex < 0.8) {
      score += 35;
      drivers.push({
        factor: 'Keterlambatan Kritis (SPI < 0.80)',
        weight: 35,
        severity: 'CRITICAL',
        details: `SPI sebesar ${dto.schedulePerformanceIndex} menunjukkan deviasi keterlambatan progres lebih dari 20%.`,
      });
    } else if (dto.schedulePerformanceIndex < 0.9) {
      score += 20;
      drivers.push({
        factor: 'Deviasi Jadwal (SPI < 0.90)',
        weight: 20,
        severity: 'HIGH',
        details: `SPI sebesar ${dto.schedulePerformanceIndex} membutuhkan percepatan (acceleration plan).`,
      });
    }

    // Factor 2: Unpaid Invoices Aging
    if (dto.unpaidInvoicesAgingDays > 60) {
      score += 25;
      drivers.push({
        factor: 'Piutang Macet > 60 Hari',
        weight: 25,
        severity: 'HIGH',
        details: `Tagihan termin tertahan ${dto.unpaidInvoicesAgingDays} hari berpotensi melanggar klausul pembayaran.`,
      });
    }

    // Factor 3: Unapproved Change Orders
    if (dto.unapprovedChangeOrdersCount >= 3) {
      score += 15;
      drivers.push({
        factor: 'Akumulasi CCO Belum Disetujui',
        weight: 15,
        severity: 'MEDIUM',
        details: `${dto.unapprovedChangeOrdersCount} berkas CCO tanpa persetujuan formal berpotensi menjadi sengketa biaya tambahan.`,
      });
    }

    const disputeProbabilityPercent = Math.min(98, score);
    let classification: 'CRITICAL_DISPUTE' | 'HIGH_POTENTIAL' | 'MODERATE_MONITOR' | 'LOW_HEALTHY' = 'LOW_HEALTHY';
    if (disputeProbabilityPercent >= 75) classification = 'CRITICAL_DISPUTE';
    else if (disputeProbabilityPercent >= 55) classification = 'HIGH_POTENTIAL';
    else if (disputeProbabilityPercent >= 35) classification = 'MODERATE_MONITOR';

    const potentialFinancialExposure = Math.round(contractValue * (disputeProbabilityPercent / 100) * 0.1);

    const nextSeq = this.disputePredictions.length + 1;
    const id = `DSP-${String(nextSeq).padStart(3, '0')}`;

    const newRecord: DisputePredictionRecord = {
      id,
      contractId: dto.contractId,
      contractNumber: contract ? contract.contractNumber : dto.contractId,
      contractTitle,
      clientName,
      disputeProbabilityPercent,
      riskClassification: classification,
      primaryDrivers: drivers,
      potentialFinancialExposure,
      recommendedMitigation: [
        'Kirimkan pemberitahuan resmi potensi perselisihan secara tertulis sesuai batas waktu kontrak.',
        'Gelar mediasi teknis internal sebelum melangkah ke arbitrase BANI.',
        'Konsolidasi bukti dokumenter harian site diary, foto udara, dan rekonsiliasi volume joint survey.',
      ],
      recommendedForum: dto.forumClause || (contract ? contract.disputeResolutionForum : 'BANI_ARBITRATION'),
      evaluatedAt: new Date().toISOString(),
    };

    this.disputePredictions.unshift(newRecord);
    return {
      message: `Prediksi risiko sengketa untuk ${newRecord.contractNumber} menghasilkan probabilitas ${newRecord.disputeProbabilityPercent}% (${newRecord.riskClassification}).`,
      prediction: newRecord,
    };
  }

  // 11. GET /contracts/amendments/list
  getAmendments(contractId?: string) {
    let result = [...this.amendments];
    if (contractId && contractId !== 'ALL') {
      result = result.filter((a) => a.contractId === contractId);
    }
    return result;
  }

  // 12. POST /contracts/amendments
  createAmendment(dto: CreateAmendmentDto) {
    const contract = this.contracts.find((c) => c.id === dto.contractId || c.contractNumber === dto.contractId);
    if (!contract) {
      throw new NotFoundException(`Kontrak ${dto.contractId} tidak ditemukan`);
    }

    const nextSeq = this.amendments.length + 1;
    const id = `AMD-${String(nextSeq).padStart(3, '0')}`;

    const previousValue = contract.currentValue;
    const newValue = previousValue + Number(dto.costDelta);
    const previousEndDate = contract.endDate;

    // Calculate new end date by adding eotDays
    const endDateObj = new Date(previousEndDate);
    endDateObj.setDate(endDateObj.getDate() + Number(dto.eotDays));
    const newEndDate = endDateObj.toISOString().split('T')[0];

    const newAmendment: AmendmentRecord = {
      id,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      amendmentNumber: dto.amendmentNumber,
      title: dto.title,
      amendmentType: dto.amendmentType,
      costDelta: Number(dto.costDelta),
      eotDays: Number(dto.eotDays),
      previousValue,
      newValue,
      previousEndDate,
      newEndDate,
      effectiveDate: dto.effectiveDate,
      signedByClient: dto.signedByClient,
      signedByContractor: dto.signedByContractor,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };

    // Update contract record
    contract.currentValue = newValue;
    contract.endDate = newEndDate;
    contract.totalAmendments += 1;
    contract.status = 'AMENDED';

    this.amendments.unshift(newAmendment);
    return {
      message: `Addendum ${newAmendment.amendmentNumber} untuk kontrak ${contract.contractNumber} berhasil dicatatkan. Nilai baru: Rp ${newValue.toLocaleString('id-ID')}, Target Selesai baru: ${newEndDate}.`,
      amendment: newAmendment,
      updatedContract: contract,
    };
  }
}

