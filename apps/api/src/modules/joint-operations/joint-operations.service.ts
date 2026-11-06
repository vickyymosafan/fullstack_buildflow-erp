import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateConsortiumDto } from './dto/create-consortium.dto';
import { CreateSharedExpenseDto } from './dto/create-shared-expense.dto';
import { CreateProfitDistributionDto } from './dto/create-profit-distribution.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@Injectable()
export class JointOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProjectId(projectCode?: string): Promise<string> {
    const project = await this.prisma.project.findFirst({
      where: projectCode ? { projectCode } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    if (!project) {
      throw new NotFoundException('Proyek konstruksi tidak ditemukan.');
    }
    return project.id;
  }

  // 1. Get KSO Portfolio Summary
  async getSummary(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projectCode: true,
        name: true,
        contractValue: true,
      },
    });

    const consortiums = await this.getConsortiums(projectCode);
    const expenses = await this.getSharedExpenses();
    const distributions = await this.getProfitDistributions();
    const taxes = await this.getTaxes();

    const totalContractValue = consortiums.reduce((acc, c) => acc + c.contractValue, 0) || Number(project?.contractValue || 142500000000);
    const jointCashBalance = consortiums.reduce((acc, c) => acc + c.jointCashBalance, 0) || 18750000000;
    const totalSharedExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalDistributedProfit = distributions.reduce((acc, d) => acc + d.netProfit, 0);
    const totalTaxWithheld = taxes.reduce((acc, t) => acc + t.pphFinalAmount + t.ppnAmount, 0);

    return {
      projectId,
      projectCode: project?.projectCode || 'PRJ-2026-IKN-PK3',
      projectName: project?.name || 'Proyek Pembangunan Istana Presiden Kawasan Inti Pusat Pemerintahan (KIPP)',
      totalContractValue,
      jointCashBalance,
      totalSharedExpenses,
      totalDistributedProfit,
      totalTaxWithheld,
      activeConsortiumCount: consortiums.length,
      leadEquityRatio: 60,
      partnerEquityRatio: 40,
      dualSignatoryThreshold: 50000000,
      leadContractorName: 'PT Adhi Megah Konstruksi (Persero) Tbk',
      partnerContractorName: 'PT Wijaya Mandiri Kontraktor',
      jointBankName: 'Bank Mandiri (Persero) Tbk - KSO Khusus IKN',
      jointAccountNumber: '137-00-2026888-1',
    };
  }

  // 2. Get Consortiums List
  async getConsortiums(projectCode?: string) {
    const projectId = await this.getProjectId(projectCode);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { projectCode: true, name: true, contractValue: true },
    });

    // In-memory / database seed representation
    const defaultConsortiums = [
      {
        id: 'kso-01',
        projectId,
        ksoCode: 'KSO-IKN-PK3-2026',
        consortiumName: 'KSO Adhi - Wijaya - Pembangunan Perumahan',
        projectTitle: project?.name || 'Paket Gedung Istana Kawasan Inti IKN',
        leadContractor: 'PT Adhi Megah Konstruksi (Persero) Tbk',
        leadSharePercent: 60,
        leadSignatory: 'Ir. Agus Wijaya, M.T. (Project Manager)',
        partnerContractor: 'PT Wijaya Mandiri Kontraktor',
        partnerSharePercent: 40,
        partnerSignatory: 'Bambang Haryanto, S.T. (Kuasa KSO)',
        jointBank: 'Bank Mandiri (Persero) Tbk - Cabang Khusus BUMN',
        jointAccountNumber: '137-00-2026888-1',
        jointAccountName: 'KSO ADHI WIJAYA PRJ IKN',
        contractValue: 142500000000,
        jointCashBalance: 18750000000,
        taxQualification: 'BESAR',
        status: 'ACTIVE',
        establishedDate: '2026-01-15',
        notes: 'Akta Notaris No. 42/2026 Notaris Dr. Habibie, S.H., M.Kn. Pembagian risiko modal kerja 60:40 dual signatory.',
      },
      {
        id: 'kso-02',
        projectId,
        ksoCode: 'KSO-LRT-JABODETABEK-EXT',
        consortiumName: 'KSO Adhi - Hutama - Nindya Karya',
        projectTitle: 'Paket Jalur Layang & Stasiun LRT Extension Dukuh Atas',
        leadContractor: 'PT Adhi Megah Konstruksi (Persero) Tbk',
        leadSharePercent: 55,
        leadSignatory: 'Drs. Hendro Wibowo (PM Trackwork)',
        partnerContractor: 'PT Hutama Karya Infrastruktur',
        partnerSharePercent: 45,
        partnerSignatory: 'Ir. Faisal Akbar (Kuasa Mitra)',
        jointBank: 'Bank BNI (Persero) Tbk - Sentra BUMN',
        jointAccountNumber: '028-11-2026999-4',
        jointAccountName: 'KSO ADHI HUTAMA LRT',
        contractValue: 88500000000,
        jointCashBalance: 11200000000,
        taxQualification: 'BESAR',
        status: 'ACTIVE',
        establishedDate: '2026-02-01',
        notes: 'Pekerjaan struktur layang pier beton dan rel stasiun integrasi LRT.',
      },
    ];

    return defaultConsortiums;
  }

  // 3. Create New Consortium
  async createConsortium(dto: CreateConsortiumDto) {
    if (dto.leadSharePercent + dto.partnerSharePercent !== 100) {
      throw new BadRequestException('Total porsi ekuitas kontraktor utama dan mitra harus berjumlah 100%.');
    }

    const projectId = await this.getProjectId();
    const newConsortium = {
      id: `kso-${Date.now().toString().slice(-4)}`,
      projectId,
      ksoCode: dto.ksoCode,
      consortiumName: dto.consortiumName,
      leadContractor: dto.leadContractor,
      leadSharePercent: dto.leadSharePercent,
      leadSignatory: dto.leadSignatory,
      partnerContractor: dto.partnerContractor,
      partnerSharePercent: dto.partnerSharePercent,
      partnerSignatory: dto.partnerSignatory,
      jointBank: dto.jointBank,
      jointAccountNumber: dto.jointAccountNumber,
      jointAccountName: dto.jointAccountName,
      contractValue: Number(dto.contractValue),
      jointCashBalance: Number(dto.jointCashBalance || 0),
      taxQualification: dto.taxQualification,
      status: 'ACTIVE',
      establishedDate: new Date().toISOString().split('T')[0],
      notes: dto.notes || 'Registrasi konsorsium KSO baru BuildFlow ERP.',
    };

    return newConsortium;
  }

  // 4. Get Shared Expenses List
  async getSharedExpenses(ksoCode?: string, category?: string, status?: string) {
    const expenses = [
      {
        id: 'exp-001',
        ksoCode: 'KSO-IKN-PK3-2026',
        expenseCode: 'EXP-KSO-2026-001',
        title: 'Pembangunan Direksi Keet, Kantor Lapangan Gabungan & Laboratorium Uji Beton',
        category: 'SITE_FACILITY',
        amount: 850000000,
        leadAllocationAmount: 510000000, // 60%
        partnerAllocationAmount: 340000000, // 40%
        vendorName: 'PT Sarana Fasilitas Konstruksi',
        invoiceRef: 'INV-SFK-2026-088',
        expenseDate: '2026-02-10',
        leadApproved: true,
        partnerApproved: true,
        status: 'APPROVED_DUAL',
        dualSignatories: [
          { role: 'LEAD', name: 'Ir. Agus Wijaya, M.T.', status: 'SIGNED', date: '2026-02-11' },
          { role: 'PARTNER', name: 'Bambang Haryanto, S.T.', status: 'SIGNED', date: '2026-02-12' },
        ],
        notes: 'Disetujui bersama untuk fasilitas kantor tim supervisi KSO.',
      },
      {
        id: 'exp-002',
        ksoCode: 'KSO-IKN-PK3-2026',
        expenseCode: 'EXP-KSO-2026-002',
        title: 'Mobilisasi & Perakitan 2 Unit Tower Crane Liebherr 50 Ton Bersama',
        category: 'EQUIPMENT_MOB',
        amount: 1450000000,
        leadAllocationAmount: 870000000, // 60%
        partnerAllocationAmount: 580000000, // 40%
        vendorName: 'PT Berdikari Alat Perkasa',
        invoiceRef: 'INV-BAP-2026-112',
        expenseDate: '2026-02-18',
        leadApproved: true,
        partnerApproved: true,
        status: 'APPROVED_DUAL',
        dualSignatories: [
          { role: 'LEAD', name: 'Ir. Agus Wijaya, M.T.', status: 'SIGNED', date: '2026-02-19' },
          { role: 'PARTNER', name: 'Bambang Haryanto, S.T.', status: 'SIGNED', date: '2026-02-20' },
        ],
        notes: 'Peralatan erection struktur gedung istana zona barat dan timur.',
      },
      {
        id: 'exp-003',
        ksoCode: 'KSO-IKN-PK3-2026',
        expenseCode: 'EXP-KSO-2026-003',
        title: 'Pengurusan Izin AMDAL, Uji Lingkungan Hidup & Sertifikasi K3 Gabungan',
        category: 'SAFETY_ENVIRONMENT',
        amount: 320000000,
        leadAllocationAmount: 192000000, // 60%
        partnerAllocationAmount: 128000000, // 40%
        vendorName: 'Balai Uji Keselamatan & Lingkungan IKN',
        invoiceRef: 'INV-BUK-2026-045',
        expenseDate: '2026-02-25',
        leadApproved: true,
        partnerApproved: false,
        status: 'PENDING_APPROVAL',
        dualSignatories: [
          { role: 'LEAD', name: 'Ir. Agus Wijaya, M.T.', status: 'SIGNED', date: '2026-02-26' },
          { role: 'PARTNER', name: 'Bambang Haryanto, S.T.', status: 'WAITING', date: null },
        ],
        notes: 'Menunggu review dokumen kelengkapan dari perwakilan mitra Wijaya.',
      },
      {
        id: 'exp-004',
        ksoCode: 'KSO-IKN-PK3-2026',
        expenseCode: 'EXP-KSO-2026-004',
        title: 'Pemasangan Jaringan Listrik PLN Sementara 1.250 kVA & Genset Cadangan',
        category: 'SHARED_OVERHEAD',
        amount: 620000000,
        leadAllocationAmount: 372000000, // 60%
        partnerAllocationAmount: 248000000, // 40%
        vendorName: 'PT Cipta Daya Elektrika',
        invoiceRef: 'INV-CDE-2026-204',
        expenseDate: '2026-03-01',
        leadApproved: true,
        partnerApproved: true,
        status: 'APPROVED_DUAL',
        dualSignatories: [
          { role: 'LEAD', name: 'Ir. Agus Wijaya, M.T.', status: 'SIGNED', date: '2026-03-02' },
          { role: 'PARTNER', name: 'Bambang Haryanto, S.T.', status: 'SIGNED', date: '2026-03-02' },
        ],
        notes: 'Penyediaan daya kerja fabrikasi baja dan pompa ready mix.',
      },
    ];

    let result = expenses;
    if (ksoCode) {
      result = result.filter((e) => e.ksoCode === ksoCode);
    }
    if (category && category !== 'ALL') {
      result = result.filter((e) => e.category === category);
    }
    if (status && status !== 'ALL') {
      result = result.filter((e) => e.status === status);
    }

    return result;
  }

  // 5. Create New Shared Expense
  async createSharedExpense(dto: CreateSharedExpenseDto) {
    const ksoCode = dto.ksoCode || 'KSO-IKN-PK3-2026';
    const amount = Number(dto.amount);
    const leadShare = 60;
    const partnerShare = 40;

    const leadAllocation = (amount * leadShare) / 100;
    const partnerAllocation = (amount * partnerShare) / 100;

    const newExpense = {
      id: `exp-${Date.now().toString().slice(-4)}`,
      ksoCode,
      expenseCode: `EXP-KSO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: dto.title,
      category: dto.category,
      amount,
      leadAllocationAmount: leadAllocation,
      partnerAllocationAmount: partnerAllocation,
      vendorName: dto.vendorName,
      invoiceRef: dto.invoiceRef,
      expenseDate: dto.expenseDate || new Date().toISOString().split('T')[0],
      leadApproved: true, // Pembuat otomatis approve
      partnerApproved: false,
      status: 'PENDING_APPROVAL',
      dualSignatories: [
        { role: 'LEAD', name: 'Ir. Agus Wijaya, M.T.', status: 'SIGNED', date: new Date().toISOString().split('T')[0] },
        { role: 'PARTNER', name: 'Bambang Haryanto, S.T.', status: 'WAITING', date: null },
      ],
      notes: dto.notes || 'Pengajuan beban bersama konsorsium KSO.',
    };

    return newExpense;
  }

  // 6. Approve Shared Expense (Dual Signatory)
  async approveSharedExpense(id: string, signatoryRole: 'LEAD' | 'PARTNER', notes?: string) {
    const expenses = await this.getSharedExpenses();
    const expense = expenses.find((e) => e.id === id) || expenses[0];

    const updated = {
      ...expense,
      leadApproved: signatoryRole === 'LEAD' ? true : expense.leadApproved,
      partnerApproved: signatoryRole === 'PARTNER' ? true : expense.partnerApproved,
      status: 'APPROVED_DUAL',
      notes: notes || 'Otorisasi dual-signatory pengeluaran rekening kas bersama berhasil disahkan.',
      approvedAt: new Date().toISOString(),
    };

    return updated;
  }

  // 7. Get Profit Distributions List
  async getProfitDistributions(ksoCode?: string) {
    const distributions = [
      {
        id: 'dist-01',
        ksoCode: 'KSO-IKN-PK3-2026',
        periodLabel: 'Distribusi Dividen Laba Bersih Termin 1 (Opname 20%)',
        grossRevenue: 28500000000,
        totalSharedCost: 21375000000,
        retentionReserve: 1425000000,
        netProfit: 5700000000,
        leadDistributedProfit: 3420000000, // 60%
        partnerDistributedProfit: 2280000000, // 40%
        distributionDate: '2026-01-20',
        payoutStatus: 'PAID',
        notes: 'Pencairan dividen termin 1 lunas via transfer bilyet giro Mandiri KSO.',
      },
      {
        id: 'dist-02',
        ksoCode: 'KSO-IKN-PK3-2026',
        periodLabel: 'Distribusi Dividen Laba Bersih Termin 2 (Opname 40%)',
        grossRevenue: 28500000000,
        totalSharedCost: 20805000000,
        retentionReserve: 1425000000,
        netProfit: 6270000000,
        leadDistributedProfit: 3762000000, // 60%
        partnerDistributedProfit: 2508000000, // 40%
        distributionDate: '2026-02-22',
        payoutStatus: 'PAID',
        notes: 'Pencairan dividen termin 2 tuntas diverifikasi kantor akuntan publik.',
      },
      {
        id: 'dist-03',
        ksoCode: 'KSO-IKN-PK3-2026',
        periodLabel: 'Distribusi Dividen Laba Bersih Termin 3 (Opname 60%)',
        grossRevenue: 28500000000,
        totalSharedCost: 20235000000,
        retentionReserve: 1425000000,
        netProfit: 6840000000,
        leadDistributedProfit: 4104000000, // 60%
        partnerDistributedProfit: 2736000000, // 40%
        distributionDate: '2026-03-05',
        payoutStatus: 'SCHEDULED',
        notes: 'Jadwal transfer kliring rekening bank mitra Wijaya tanggal 10 Maret 2026.',
      },
    ];

    if (ksoCode) {
      return distributions.filter((d) => d.ksoCode === ksoCode);
    }
    return distributions;
  }

  // 8. Create Profit Distribution
  async createProfitDistribution(dto: CreateProfitDistributionDto) {
    const gross = Number(dto.grossRevenue);
    const sharedCost = Number(dto.totalSharedCost);
    const retention = Number(dto.retentionReserve || 0);

    const netProfit = gross - sharedCost - retention;
    if (netProfit <= 0) {
      throw new BadRequestException('Total pendapatan termin harus melebihi biaya bersama dan retensi.');
    }

    const leadShare = (netProfit * 60) / 100;
    const partnerShare = (netProfit * 40) / 100;

    const newDist = {
      id: `dist-${Date.now().toString().slice(-4)}`,
      ksoCode: dto.ksoCode || 'KSO-IKN-PK3-2026',
      periodLabel: dto.periodLabel,
      grossRevenue: gross,
      totalSharedCost: sharedCost,
      retentionReserve: retention,
      netProfit,
      leadDistributedProfit: leadShare,
      partnerDistributedProfit: partnerShare,
      distributionDate: dto.distributionDate || new Date().toISOString().split('T')[0],
      payoutStatus: 'SCHEDULED',
      notes: dto.notes || 'Pengesahan distribusi laba bersih periodik KSO.',
    };

    return newDist;
  }

  // 9. Get Construction Taxes Records
  async getTaxes(ksoCode?: string) {
    const taxes = [
      {
        id: 'tax-01',
        ksoCode: 'KSO-IKN-PK3-2026',
        invoiceNumber: 'INV-PUPR-TERMIN-01',
        description: 'Pemotongan Pajak Termin 1 Prestasi Fisik 20%',
        grossInvoiceAmount: 28500000000,
        contractorQualification: 'MENENGAH_BESAR',
        pphFinalRate: 2.65,
        pphFinalAmount: 755250000,
        ppnRate: 12.0,
        ppnAmount: 3420000000,
        pph23Amount: 0,
        netReceivable: 31164750000,
        bupotNumber: 'BUPOT-4(2)-2026-00192',
        ntpn: '8821948192841924',
        paymentStatus: 'REMITTED',
        remittedDate: '2026-01-25',
      },
      {
        id: 'tax-02',
        ksoCode: 'KSO-IKN-PK3-2026',
        invoiceNumber: 'INV-PUPR-TERMIN-02',
        description: 'Pemotongan Pajak Termin 2 Prestasi Fisik 40%',
        grossInvoiceAmount: 28500000000,
        contractorQualification: 'MENENGAH_BESAR',
        pphFinalRate: 2.65,
        pphFinalAmount: 755250000,
        ppnRate: 12.0,
        ppnAmount: 3420000000,
        pph23Amount: 0,
        netReceivable: 31164750000,
        bupotNumber: 'BUPOT-4(2)-2026-00284',
        ntpn: '9912048102948102',
        paymentStatus: 'REMITTED',
        remittedDate: '2026-02-26',
      },
      {
        id: 'tax-03',
        ksoCode: 'KSO-IKN-PK3-2026',
        invoiceNumber: 'INV-PUPR-TERMIN-03',
        description: 'Pemotongan Pajak Termin 3 Prestasi Fisik 60%',
        grossInvoiceAmount: 28500000000,
        contractorQualification: 'MENENGAH_BESAR',
        pphFinalRate: 2.65,
        pphFinalAmount: 755250000,
        ppnRate: 12.0,
        ppnAmount: 3420000000,
        pph23Amount: 0,
        netReceivable: 31164750000,
        bupotNumber: 'BUPOT-4(2)-2026-00361',
        ntpn: 'PENDING_VALIDATION',
        paymentStatus: 'BILLED',
        remittedDate: null,
      },
    ];

    if (ksoCode) {
      return taxes.filter((t) => t.ksoCode === ksoCode);
    }
    return taxes;
  }

  // 10. Calculate Construction Tax Simulation (PP No. 9/2022)
  async calculateTax(dto: CalculateTaxDto) {
    const gross = Number(dto.grossAmount);

    // PP No. 9 Tahun 2022 Tariffs
    let pphFinalRate = 2.65;
    if (dto.contractorQualification === 'KECIL') {
      pphFinalRate = 1.75;
    } else if (dto.contractorQualification === 'MENENGAH_BESAR' || dto.contractorQualification === 'SPESIALIS') {
      pphFinalRate = 2.65;
    } else if (dto.contractorQualification === 'TIDAK_BERSERTIFIKAT') {
      pphFinalRate = 4.0;
    } else if (dto.contractorQualification === 'KONSULTASI_KONSTRUKSI') {
      pphFinalRate = 3.5;
    }

    const pphFinalAmount = (gross * pphFinalRate) / 100;

    let pph23Amount = 0;
    if (dto.includePph23 && dto.equipmentRentPortion) {
      pph23Amount = (Number(dto.equipmentRentPortion) * 2.0) / 100;
    }

    const ppnRate = dto.ppnRatePercent || 12.0;
    const ppnAmount = (gross * ppnRate) / 100;

    const netReceivable = gross - pphFinalAmount - pph23Amount + ppnAmount;

    return {
      grossAmount: gross,
      contractorQualification: dto.contractorQualification,
      regulationBasis: 'PP No. 9 Tahun 2022 & UU HPP No. 7 Tahun 2021',
      pphFinal: {
        ratePercent: pphFinalRate,
        amount: pphFinalAmount,
        article: 'Pasal 4 Ayat (2) Jasa Konstruksi',
      },
      pph23: {
        ratePercent: dto.includePph23 ? 2.0 : 0,
        amount: pph23Amount,
        article: 'Pasal 23 Sewa Alat & Jasa Teknik',
      },
      ppn: {
        ratePercent: ppnRate,
        amount: ppnAmount,
        article: 'Pajak Pertambahan Nilai',
      },
      totalTaxDeductions: pphFinalAmount + pph23Amount,
      netReceivableAmount: netReceivable,
      invoiceNumber: dto.invoiceNumber || `SIM-${Date.now().toString().slice(-6)}`,
      simulatedAt: new Date().toISOString(),
    };
  }
}

