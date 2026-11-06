import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CreateBatchDisbursementDto } from './dto/create-batch-disbursement.dto';
import { GenerateVirtualAccountDto } from './dto/generate-virtual-account.dto';
import { SweepCashPoolDto } from './dto/sweep-cash-pool.dto';

export type BankAccountType = 'MASTER_HOLDING' | 'PROJECT_OPERATIONAL' | 'KSO_ESCROW' | 'TAX_RESERVE';
export type DisbursementStatus = 'DRAFT_MAKER' | 'PENDING_CHECKER' | 'PENDING_SIGNER' | 'EXECUTED_H2H' | 'REJECTED';
export type VirtualAccountStatus = 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface BankAccountRecord {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: BankAccountType;
  currency: string;
  currentBalance: number;
  minimumBalanceTarget: number;
  projectId?: string;
  projectName?: string;
  branchOffice?: string;
  isH2HConnected: boolean;
  lastH2HSyncAt: string;
}

export interface DisbursementItem {
  id: string;
  beneficiaryCode: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccount: string;
  amount: number;
  description: string;
  referenceNumber?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface BatchDisbursementRecord {
  id: string;
  batchNumber: string;
  batchTitle: string;
  bankPartner: string;
  sourceAccountNumber: string;
  sourceAccountHolder: string;
  category: string;
  projectId?: string;
  projectName?: string;
  totalAmount: number;
  itemCount: number;
  makerName: string;
  checkerName?: string;
  signerName?: string;
  ksoPartnerSignerName?: string;
  status: DisbursementStatus;
  items: DisbursementItem[];
  h2hReferenceCode?: string;
  createdAt: string;
  executedAt?: string;
  notes?: string;
}

export interface VirtualAccountRecord {
  id: string;
  vaNumber: string;
  bankPartner: string;
  customerName: string;
  projectId: string;
  projectName: string;
  billAmount: number;
  paidAmount: number;
  purpose: string;
  invoiceReference: string;
  status: VirtualAccountStatus;
  createdAt: string;
  expiredAt: string;
  paidAt?: string;
  description?: string;
}

export interface StatementReconciliationRecord {
  id: string;
  statementNumber: string;
  bankName: string;
  accountNumber: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  transactionCount: number;
  matchedCount: number;
  unmatchedCount: number;
  reconciliationRatePercent: number;
  auditStatus: 'FULLY_RECONCILED' | 'EXCEPTION_PENDING' | 'IN_PROGRESS';
  uploadedAt: string;
}

export interface CashPoolSweepRecord {
  id: string;
  sweepNumber: string;
  poolGroupId: string;
  sourceAccountNumber: string;
  sourceBankName: string;
  targetAccountNumber: string;
  targetBankName: string;
  amount: number;
  sweepType: 'SWEEPING_TO_MASTER' | 'TOP_UP_MINIMUM_BALANCE' | 'KSO_PROFIT_SPLIT';
  authorizedBy: string;
  executedAt: string;
  remarks?: string;
}

@Injectable()
export class TreasuryService {
  private bankAccounts: BankAccountRecord[] = [
    {
      id: 'ACC-001',
      bankName: 'Bank Mandiri',
      accountNumber: '123-00-9876543-2',
      accountHolder: 'PT BuildFlow Konstruksi Persada (Master Escrow Holding)',
      accountType: 'MASTER_HOLDING',
      currency: 'IDR',
      currentBalance: 64500000000,
      minimumBalanceTarget: 20000000000,
      branchOffice: 'KC Jakarta Plaza Mandiri',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T14:30:00Z',
    },
    {
      id: 'ACC-002',
      bankName: 'Bank BCA',
      accountNumber: '882-019-2831',
      accountHolder: 'PT BuildFlow Konstruksi Persada (Payroll & Op BCA)',
      accountType: 'PROJECT_OPERATIONAL',
      currency: 'IDR',
      currentBalance: 12800000000,
      minimumBalanceTarget: 5000000000,
      branchOffice: 'KCU Jakarta Menara BCA',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T14:25:00Z',
    },
    {
      id: 'ACC-003',
      bankName: 'Bank BNI',
      accountNumber: '019-283-7465',
      accountHolder: 'KSO Patimban Port Consortium (Joint Escrow Kas Bersama)',
      accountType: 'KSO_ESCROW',
      currency: 'IDR',
      currentBalance: 18250000000,
      minimumBalanceTarget: 10000000000,
      projectId: 'PRJ-PTB-002',
      projectName: 'Pelabuhan Patimban Subang Tahap 2',
      branchOffice: 'KC Subang',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T14:15:00Z',
    },
    {
      id: 'ACC-004',
      bankName: 'Bank Mandiri',
      accountNumber: '123-00-5544332-1',
      accountHolder: 'PT BuildFlow Proyek Istana IKN (Operasional Lapangan)',
      accountType: 'PROJECT_OPERATIONAL',
      currency: 'IDR',
      currentBalance: 8400000000,
      minimumBalanceTarget: 5000000000,
      projectId: 'PRJ-IKN-001',
      projectName: 'Pembangunan Istana Negara IKN Tahap II',
      branchOffice: 'KC Balikpapan Sudirman',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T14:00:00Z',
    },
    {
      id: 'ACC-005',
      bankName: 'Bank BRI',
      accountNumber: '0341-01-002931-50-2',
      accountHolder: 'PT BuildFlow Proyek Bendungan Bener (Operasional Daerah)',
      accountType: 'PROJECT_OPERATIONAL',
      currency: 'IDR',
      currentBalance: 4150000000,
      minimumBalanceTarget: 3000000000,
      projectId: 'PRJ-BNR-005',
      projectName: 'Bendungan Bener Purworejo',
      branchOffice: 'KC Purworejo',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T13:45:00Z',
    },
    {
      id: 'ACC-006',
      bankName: 'Bank BNI',
      accountNumber: '019-556-9911',
      accountHolder: 'PT BuildFlow Rekening Cadangan Pajak PPh & PPN WAPU',
      accountType: 'TAX_RESERVE',
      currency: 'IDR',
      currentBalance: 9600000000,
      minimumBalanceTarget: 5000000000,
      branchOffice: 'KC Jakarta Rawamangun',
      isH2HConnected: true,
      lastH2HSyncAt: '2026-03-05T12:00:00Z',
    },
  ];

  private disbursements: BatchDisbursementRecord[] = [
    {
      id: 'DISB-001',
      batchNumber: 'BATCH-2026-001',
      batchTitle: 'Pembayaran PO Material Utama Baja Tulangan & Ready Mix IKN',
      bankPartner: 'Bank Mandiri',
      sourceAccountNumber: '123-00-9876543-2',
      sourceAccountHolder: 'PT BuildFlow Konstruksi Persada (Master Escrow Holding)',
      category: 'MATERIAL_SUPPLIER_PO',
      projectId: 'PRJ-IKN-001',
      projectName: 'Pembangunan Istana Negara IKN Tahap II',
      totalAmount: 16500000000,
      itemCount: 2,
      makerName: 'Andi Pratama, S.E. (Treasury Officer)',
      checkerName: 'Rina Wulandari, S.E. (Finance Manager)',
      signerName: 'Ir. Hendra Tanuwidjaja (CFO / Direktur Keuangan)',
      status: 'EXECUTED_H2H',
      h2hReferenceCode: 'MND-H2H-20260305-99214',
      items: [
        {
          id: 'ITEM-01',
          beneficiaryCode: 'VND-002',
          beneficiaryName: 'PT Krakatau Steel (Persero) Tbk',
          beneficiaryBank: 'Bank BNI',
          beneficiaryAccount: '987-654-3210',
          amount: 9800000000,
          description: 'Pembayaran PO Baja Tulangan Ulir Patimban & IKN Batch 1',
          referenceNumber: 'PO-2026-0819',
          status: 'SUCCESS',
        },
        {
          id: 'ITEM-02',
          beneficiaryCode: 'VND-001',
          beneficiaryName: 'PT Solusi Bangun Semen Indonesia',
          beneficiaryBank: 'Bank Mandiri',
          beneficiaryAccount: '123-00-0987654-3',
          amount: 6700000000,
          description: 'Pembayaran Pasokan Semen Curah Proyek Istana IKN',
          referenceNumber: 'PO-2026-0820',
          status: 'SUCCESS',
        },
      ],
      createdAt: '2026-03-04T09:00:00Z',
      executedAt: '2026-03-04T14:12:00Z',
      notes: 'Eksekusi real-time H2H via Mandiri Cash Management API Host-to-Host sukses.',
    },
    {
      id: 'DISB-002',
      batchNumber: 'BATCH-2026-002',
      batchTitle: 'Termin Sertifikat Progres MC Subkontraktor Jembatan Patimban',
      bankPartner: 'Bank BNI',
      sourceAccountNumber: '019-283-7465',
      sourceAccountHolder: 'KSO Patimban Port Consortium (Joint Escrow Kas Bersama)',
      category: 'SUB_CONTRACTOR_PROGRESS',
      projectId: 'PRJ-PTB-002',
      projectName: 'Pelabuhan Patimban Subang Tahap 2',
      totalAmount: 5850000000,
      itemCount: 2,
      makerName: 'Budi Santoso, S.E. (KSO Site Cashier)',
      checkerName: 'Dra. Maya Kusuma (KSO Finance Lead)',
      status: 'PENDING_SIGNER',
      items: [
        {
          id: 'ITEM-03',
          beneficiaryCode: 'VND-005',
          beneficiaryName: 'PT Freyssinet Total Technology',
          beneficiaryBank: 'Bank BCA',
          beneficiaryAccount: '522-098-7654',
          amount: 3950000000,
          description: 'Termin MC-03 Pekerjaan Stressing Post-Tensioning Flyover',
          referenceNumber: 'SPK-PTB-FRY-02',
          status: 'PENDING',
        },
        {
          id: 'ITEM-04',
          beneficiaryCode: 'VND-006',
          beneficiaryName: 'PT Scaffolding Megah Perkasa',
          beneficiaryBank: 'Bank Mandiri',
          beneficiaryAccount: '133-00-1122334-5',
          amount: 1900000000,
          description: 'Sewa & Ereksi Modular Scaffolding Pier Head Dermaga',
          referenceNumber: 'SPK-PTB-SCF-04',
          status: 'PENDING',
        },
      ],
      createdAt: '2026-03-05T10:30:00Z',
      notes: 'Menunggu otorisasi Dual Signatory dari Lead Partner & Mitra KSO.',
    },
    {
      id: 'DISB-003',
      batchNumber: 'BATCH-2026-003',
      batchTitle: 'Payroll Upah Mingguan 450 Tenaga Kerja & Mandor Tol Sumatera',
      bankPartner: 'Bank BCA',
      sourceAccountNumber: '882-019-2831',
      sourceAccountHolder: 'PT BuildFlow Konstruksi Persada (Payroll & Op BCA)',
      category: 'LABOR_PAYROLL',
      projectId: 'PRJ-TOL-004',
      projectName: 'Tol Trans Sumatera Ruas Tebing Tinggi',
      totalAmount: 1420000000,
      itemCount: 450,
      makerName: 'Siti Rahayu (Site Payroll Admin)',
      status: 'PENDING_CHECKER',
      items: [
        {
          id: 'ITEM-05',
          beneficiaryCode: 'MNDR-01',
          beneficiaryName: 'Mandor Sutrisno (Kelompok Pembesian 45 Org)',
          beneficiaryBank: 'Bank BCA',
          beneficiaryAccount: '882-991-0021',
          amount: 142000000,
          description: 'Upah Borongan Mandor Sutrisno Minggu Ke-9',
          referenceNumber: 'PAY-W09-01',
          status: 'PENDING',
        },
      ],
      createdAt: '2026-03-05T11:00:00Z',
      notes: 'Batch payroll rutin mingguan tenaga kerja lapangan.',
    },
  ];

  private virtualAccounts: VirtualAccountRecord[] = [
    {
      id: 'VA-001',
      vaNumber: '889100260001',
      bankPartner: 'Bank Mandiri',
      customerName: 'Kementerian Pekerjaan Umum dan Perumahan Rakyat (PUPR)',
      projectId: 'PRJ-IKN-001',
      projectName: 'Pembangunan Istana Negara IKN Tahap II',
      billAmount: 14500000000,
      paidAmount: 14500000000,
      purpose: 'TERMIN_MC',
      invoiceReference: 'MC-2026-03-IKN',
      status: 'PAID',
      createdAt: '2026-02-15T08:00:00Z',
      expiredAt: '2026-03-05T23:59:59Z',
      paidAt: '2026-03-01T11:20:00Z',
      description: 'Penagihan Termin Sertifikat Bulanan MC-03 Proyek Istana Negara IKN',
    },
    {
      id: 'VA-002',
      vaNumber: '889100260002',
      bankPartner: 'Bank Mandiri',
      customerName: 'Direktorat Jenderal Perhubungan Laut Kemenhub RI',
      projectId: 'PRJ-PTB-002',
      projectName: 'Pelabuhan Patimban Subang Tahap 2',
      billAmount: 9800000000,
      paidAmount: 0,
      purpose: 'TERMIN_MC',
      invoiceReference: 'MC-2026-05-PTB',
      status: 'PENDING_PAYMENT',
      createdAt: '2026-03-01T09:00:00Z',
      expiredAt: '2026-03-20T23:59:59Z',
      description: 'Penagihan Termin MC-05 Pekerjaan Reklamasi & Jetty Dermaga',
    },
    {
      id: 'VA-003',
      vaNumber: '712900260003',
      bankPartner: 'Bank BCA',
      customerName: 'PT Hutama Graha Megah (Owner Swasta)',
      projectId: 'PRJ-MED-003',
      projectName: 'RS Regional Medan Modern Medical Center',
      billAmount: 2500000000,
      paidAmount: 2500000000,
      purpose: 'TENDER_DEPOSIT',
      invoiceReference: 'DEP-2026-TND-01',
      status: 'PAID',
      createdAt: '2026-02-20T10:00:00Z',
      expiredAt: '2026-03-01T17:00:00Z',
      paidAt: '2026-02-28T15:45:00Z',
      description: 'Setoran Uang Muka / Jaminan Pelaksanaan Pekerjaan Sub-Struktur',
    },
    {
      id: 'VA-004',
      vaNumber: '019000260004',
      bankPartner: 'Bank BNI',
      customerName: 'Badan Pengatur Jalan Tol (BPJT) / Jasamarga',
      projectId: 'PRJ-KLM-003',
      projectName: 'Flyover Kalimalang Interchange Toll',
      billAmount: 1250000000,
      paidAmount: 0,
      purpose: 'PERFORMANCE_RETENTION',
      invoiceReference: 'RET-2026-PHO-KLM',
      status: 'PENDING_PAYMENT',
      createdAt: '2026-03-02T13:00:00Z',
      expiredAt: '2026-04-02T23:59:59Z',
      description: 'Pencairan Retensi 5% Pasca Berita Acara Serah Terima Pertama (PHO)',
    },
  ];

  private reconciliations: StatementReconciliationRecord[] = [
    {
      id: 'REC-001',
      statementNumber: 'MT940-MND-20260304',
      bankName: 'Bank Mandiri',
      accountNumber: '123-00-9876543-2',
      statementDate: '2026-03-04',
      openingBalance: 48000000000,
      closingBalance: 64500000000,
      totalDebit: 16500000000,
      totalCredit: 33000000000,
      transactionCount: 48,
      matchedCount: 48,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: 'FULLY_RECONCILED',
      uploadedAt: '2026-03-04T18:00:00Z',
    },
    {
      id: 'REC-002',
      statementNumber: 'MT940-BCA-20260304',
      bankName: 'Bank BCA',
      accountNumber: '882-019-2831',
      statementDate: '2026-03-04',
      openingBalance: 11500000000,
      closingBalance: 12800000000,
      totalDebit: 1200000000,
      totalCredit: 2500000000,
      transactionCount: 32,
      matchedCount: 31,
      unmatchedCount: 1,
      reconciliationRatePercent: 96.9,
      auditStatus: 'EXCEPTION_PENDING',
      uploadedAt: '2026-03-04T18:30:00Z',
    },
    {
      id: 'REC-003',
      statementNumber: 'MT940-BNI-20260304',
      bankName: 'Bank BNI',
      accountNumber: '019-283-7465',
      statementDate: '2026-03-04',
      openingBalance: 18250000000,
      closingBalance: 18250000000,
      totalDebit: 0,
      totalCredit: 0,
      transactionCount: 12,
      matchedCount: 12,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: 'FULLY_RECONCILED',
      uploadedAt: '2026-03-04T19:00:00Z',
    },
  ];

  private cashPoolSweeps: CashPoolSweepRecord[] = [
    {
      id: 'SWP-001',
      sweepNumber: 'SWP-2026-03-01',
      poolGroupId: 'POOL-IKN-HOLDING',
      sourceAccountNumber: '123-00-5544332-1',
      sourceBankName: 'Bank Mandiri (Sub IKN)',
      targetAccountNumber: '123-00-9876543-2',
      targetBankName: 'Bank Mandiri (Master Holding)',
      amount: 4500000000,
      sweepType: 'SWEEPING_TO_MASTER',
      authorizedBy: 'Dewi Rahmawati, S.E. (Head of Corporate Treasury)',
      executedAt: '2026-03-04T21:00:00Z',
      remarks: 'End-of-day automatic balance sweep surplus kas proyek ke Master Escrow Pool',
    },
    {
      id: 'SWP-002',
      sweepNumber: 'SWP-2026-03-02',
      poolGroupId: 'POOL-BENER-HOLDING',
      sourceAccountNumber: '123-00-9876543-2',
      sourceBankName: 'Bank Mandiri (Master Holding)',
      targetAccountNumber: '0341-01-002931-50-2',
      targetBankName: 'Bank BRI (Sub Bendungan Bener)',
      amount: 2000000000,
      sweepType: 'TOP_UP_MINIMUM_BALANCE',
      authorizedBy: 'Dewi Rahmawati, S.E. (Head of Corporate Treasury)',
      executedAt: '2026-03-05T08:30:00Z',
      remarks: 'Top-up likuiditas operasional proyek Bendungan Bener memenuhi target balancing Rp 3 Miliar',
    },
  ];

  // 1. GET /summary
  getSummary() {
    const totalLiquidity = this.bankAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
    const masterHoldingBalance = this.bankAccounts
      .filter((a) => a.accountType === 'MASTER_HOLDING')
      .reduce((acc, curr) => acc + curr.currentBalance, 0);
    const ksoEscrowBalance = this.bankAccounts
      .filter((a) => a.accountType === 'KSO_ESCROW')
      .reduce((acc, curr) => acc + curr.currentBalance, 0);
    const operationalBalance = this.bankAccounts
      .filter((a) => a.accountType === 'PROJECT_OPERATIONAL')
      .reduce((acc, curr) => acc + curr.currentBalance, 0);

    const pendingDisbursementsCount = this.disbursements.filter(
      (d) => d.status === 'PENDING_CHECKER' || d.status === 'PENDING_SIGNER',
    ).length;
    const pendingDisbursementsTotal = this.disbursements
      .filter((d) => d.status === 'PENDING_CHECKER' || d.status === 'PENDING_SIGNER')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const activeVaCount = this.virtualAccounts.filter((va) => va.status === 'PENDING_PAYMENT').length;
    const totalVaReceivables = this.virtualAccounts
      .filter((va) => va.status === 'PENDING_PAYMENT')
      .reduce((acc, curr) => acc + curr.billAmount, 0);

    const totalReconciliationItems = this.reconciliations.reduce((acc, curr) => acc + curr.transactionCount, 0);
    const totalMatchedItems = this.reconciliations.reduce((acc, curr) => acc + curr.matchedCount, 0);
    const avgReconciliationRate =
      totalReconciliationItems > 0 ? (totalMatchedItems / totalReconciliationItems) * 100 : 100;

    return {
      totalLiquidity,
      breakdown: {
        masterHoldingBalance,
        ksoEscrowBalance,
        operationalBalance,
      },
      accountsCount: this.bankAccounts.length,
      pendingDisbursements: {
        count: pendingDisbursementsCount,
        totalAmount: pendingDisbursementsTotal,
      },
      virtualAccounts: {
        activeCount: activeVaCount,
        totalReceivables: totalVaReceivables,
      },
      reconciliation: {
        averageRatePercent: Math.round(avgReconciliationRate * 10) / 10,
        unmatchedExceptions: this.reconciliations.reduce((acc, curr) => acc + curr.unmatchedCount, 0),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // 2. GET /accounts
  getBankAccounts(type?: string, bankName?: string) {
    let result = [...this.bankAccounts];
    if (type && type !== 'ALL') {
      result = result.filter((a) => a.accountType === type);
    }
    if (bankName && bankName !== 'ALL') {
      result = result.filter((a) => a.bankName === bankName);
    }
    return result;
  }

  // 3. POST /accounts
  createBankAccount(dto: CreateBankAccountDto) {
    const nextSeq = this.bankAccounts.length + 1;
    const newAcc: BankAccountRecord = {
      id: `ACC-${String(nextSeq).padStart(3, '0')}`,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountHolder: dto.accountHolder,
      accountType: dto.accountType,
      currency: dto.currency || 'IDR',
      currentBalance: dto.currentBalance || 0,
      minimumBalanceTarget: dto.minimumBalanceTarget || 0,
      projectId: dto.projectId,
      projectName: dto.projectName,
      branchOffice: dto.branchOffice,
      isH2HConnected: dto.isH2HConnected ?? true,
      lastH2HSyncAt: new Date().toISOString(),
    };

    this.bankAccounts.push(newAcc);
    return {
      message: `Rekening bank ${newAcc.bankName} (${newAcc.accountNumber}) berhasil dihubungkan ke Treasury Gateway.`,
      account: newAcc,
    };
  }

  // 4. GET /disbursements
  getDisbursements(status?: string, bankPartner?: string) {
    let result = [...this.disbursements];
    if (status && status !== 'ALL') {
      result = result.filter((d) => d.status === status);
    }
    if (bankPartner && bankPartner !== 'ALL') {
      result = result.filter((d) => d.bankPartner === bankPartner);
    }
    return result;
  }

  // 5. POST /disbursements
  createBatchDisbursement(dto: CreateBatchDisbursementDto) {
    const nextSeq = this.disbursements.length + 1;
    const batchNumber = `BATCH-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `DISB-${String(nextSeq).padStart(3, '0')}`;

    const sourceAcc = this.bankAccounts.find((a) => a.accountNumber === dto.sourceAccountNumber);
    const sourceAccountHolder = sourceAcc ? sourceAcc.accountHolder : 'PT BuildFlow Konstruksi Persada';

    const totalAmount = dto.items.reduce((acc, curr) => acc + curr.amount, 0);

    const newBatch: BatchDisbursementRecord = {
      id,
      batchNumber,
      batchTitle: dto.batchTitle,
      bankPartner: dto.bankPartner,
      sourceAccountNumber: dto.sourceAccountNumber,
      sourceAccountHolder,
      category: dto.category,
      projectId: dto.projectId,
      projectName: dto.projectName,
      totalAmount,
      itemCount: dto.items.length,
      makerName: dto.makerName,
      status: 'PENDING_CHECKER',
      items: dto.items.map((it, idx) => ({
        id: `ITEM-${id}-${idx + 1}`,
        beneficiaryCode: it.beneficiaryCode,
        beneficiaryName: it.beneficiaryName,
        beneficiaryBank: it.beneficiaryBank,
        beneficiaryAccount: it.beneficiaryAccount,
        amount: it.amount,
        description: it.description,
        referenceNumber: it.referenceNumber,
        status: 'PENDING',
      })),
      createdAt: new Date().toISOString(),
      notes: dto.notes,
    };

    this.disbursements.unshift(newBatch);
    return {
      message: `Batch disbursement ${batchNumber} berhasil dibuat oleh Maker, menunggu verifikasi Checker.`,
      disbursement: newBatch,
    };
  }

  // 6. PATCH /disbursements/:id/authorize
  authorizeDisbursement(
    id: string,
    role: 'CHECKER' | 'SIGNER' | 'KSO_SIGNER',
    authorizerName: string,
    isApproved: boolean,
  ) {
    const batch = this.disbursements.find((d) => d.id === id || d.batchNumber === id);
    if (!batch) {
      throw new NotFoundException(`Batch disbursement ${id} tidak ditemukan`);
    }

    if (!isApproved) {
      batch.status = 'REJECTED';
      return {
        message: `Batch disbursement ${batch.batchNumber} ditolak oleh ${role} (${authorizerName}).`,
        disbursement: batch,
      };
    }

    if (role === 'CHECKER') {
      batch.checkerName = authorizerName;
      batch.status = 'PENDING_SIGNER';
    } else if (role === 'SIGNER') {
      batch.signerName = authorizerName;
      // Bila rekening KSO, cek apakah perlu KSO partner signer
      const sourceAcc = this.bankAccounts.find((a) => a.accountNumber === batch.sourceAccountNumber);
      if (sourceAcc && sourceAcc.accountType === 'KSO_ESCROW' && !batch.ksoPartnerSignerName) {
        batch.status = 'PENDING_SIGNER';
      } else {
        batch.status = 'EXECUTED_H2H';
        batch.executedAt = new Date().toISOString();
        batch.h2hReferenceCode = `${batch.bankPartner.substring(0, 3).toUpperCase()}-H2H-${Date.now()}`;
        batch.items.forEach((it) => (it.status = 'SUCCESS'));

        // Debet rekening sumber
        if (sourceAcc) {
          sourceAcc.currentBalance -= batch.totalAmount;
        }
      }
    } else if (role === 'KSO_SIGNER') {
      batch.ksoPartnerSignerName = authorizerName;
      if (batch.signerName) {
        batch.status = 'EXECUTED_H2H';
        batch.executedAt = new Date().toISOString();
        batch.h2hReferenceCode = `KSO-H2H-${Date.now()}`;
        batch.items.forEach((it) => (it.status = 'SUCCESS'));

        const sourceAcc = this.bankAccounts.find((a) => a.accountNumber === batch.sourceAccountNumber);
        if (sourceAcc) {
          sourceAcc.currentBalance -= batch.totalAmount;
        }
      }
    }

    return {
      message: `Batch disbursement ${batch.batchNumber} berhasil diotorisasi. Status saat ini: ${batch.status}`,
      disbursement: batch,
    };
  }

  // 7. GET /virtual-accounts
  getVirtualAccounts(status?: string, projectId?: string) {
    let result = [...this.virtualAccounts];
    if (status && status !== 'ALL') {
      result = result.filter((v) => v.status === status);
    }
    if (projectId && projectId !== 'ALL') {
      result = result.filter((v) => v.projectId === projectId);
    }
    return result;
  }

  // 8. POST /virtual-accounts
  generateVirtualAccount(dto: GenerateVirtualAccountDto) {
    const nextSeq = this.virtualAccounts.length + 1;
    const prefix = dto.bankPartner === 'Bank Mandiri' ? '8891' : dto.bankPartner === 'Bank BCA' ? '7129' : '0190';
    const vaNumber = `${prefix}0026${String(nextSeq).padStart(4, '0')}`;
    const id = `VA-${String(nextSeq).padStart(3, '0')}`;

    const newVa: VirtualAccountRecord = {
      id,
      vaNumber,
      bankPartner: dto.bankPartner,
      customerName: dto.customerName,
      projectId: dto.projectId,
      projectName: dto.projectName,
      billAmount: dto.billAmount,
      paidAmount: 0,
      purpose: dto.purpose,
      invoiceReference: dto.invoiceReference,
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
      expiredAt: dto.expiredAt,
      description: dto.description,
    };

    this.virtualAccounts.unshift(newVa);
    return {
      message: `Dynamic Virtual Account ${vaNumber} (${dto.bankPartner}) berhasil digenerate untuk penagihan invoice.`,
      virtualAccount: newVa,
    };
  }

  // 9. GET /reconciliations
  getReconciliations() {
    return this.reconciliations;
  }

  // 10. POST /reconciliations/upload-mt940
  uploadMt940(dto: { statementText: string; bankName: string; accountNumber: string }) {
    const nextSeq = this.reconciliations.length + 1;
    const statementNumber = `MT940-${dto.bankName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;
    const id = `REC-${String(nextSeq).padStart(3, '0')}`;

    // Parsing simulasi MT940 line items
    const newRec: StatementReconciliationRecord = {
      id,
      statementNumber,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      statementDate: new Date().toISOString().split('T')[0],
      openingBalance: 50000000000,
      closingBalance: 54500000000,
      totalDebit: 4500000000,
      totalCredit: 9000000000,
      transactionCount: 24,
      matchedCount: 24,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: 'FULLY_RECONCILED',
      uploadedAt: new Date().toISOString(),
    };

    this.reconciliations.unshift(newRec);
    return {
      message: `Berkas SWIFT MT940 statement ${statementNumber} berhasil diparsing dan direkonsiliasi otomatis ke General Ledger (100% matched).`,
      reconciliation: newRec,
    };
  }

  // 11. GET /cash-pooling
  getCashPooling() {
    return {
      accounts: this.bankAccounts,
      sweeps: this.cashPoolSweeps,
    };
  }

  // 12. POST /cash-pooling/sweep
  executeSweep(dto: SweepCashPoolDto) {
    const source = this.bankAccounts.find((a) => a.accountNumber === dto.sourceAccountNumber);
    const target = this.bankAccounts.find((a) => a.accountNumber === dto.targetAccountNumber);

    if (!source || !target) {
      throw new BadRequestException('Nomor rekening sumber atau target sweeping tidak valid');
    }

    if (source.currentBalance < dto.amount) {
      throw new BadRequestException(`Saldo rekening sumber (${source.currentBalance}) tidak mencukupi untuk sweeping ${dto.amount}`);
    }

    source.currentBalance -= dto.amount;
    target.currentBalance += dto.amount;

    const nextSeq = this.cashPoolSweeps.length + 1;
    const newSweep: CashPoolSweepRecord = {
      id: `SWP-${String(nextSeq).padStart(3, '0')}`,
      sweepNumber: `SWP-2026-${String(nextSeq).padStart(3, '0')}`,
      poolGroupId: dto.poolGroupId,
      sourceAccountNumber: source.accountNumber,
      sourceBankName: `${source.bankName} (${source.accountHolder})`,
      targetAccountNumber: target.accountNumber,
      targetBankName: `${target.bankName} (${target.accountHolder})`,
      amount: dto.amount,
      sweepType: dto.sweepType,
      authorizedBy: dto.authorizedBy,
      executedAt: new Date().toISOString(),
      remarks: dto.remarks,
    };

    this.cashPoolSweeps.unshift(newSweep);

    return {
      message: `Eksekusi cash pooling sweeping dana Rp ${dto.amount.toLocaleString('id-ID')} berhasil ditransfer.`,
      sweep: newSweep,
      updatedBalances: {
        sourceAccount: source,
        targetAccount: target,
      },
    };
  }
}

