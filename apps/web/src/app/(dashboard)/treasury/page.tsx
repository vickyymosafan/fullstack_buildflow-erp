"use client";

import React, { useState } from "react";
import {
  WalletCards,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  Clock,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  Send,
  Eye,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

export type BankAccountType = "MASTER_HOLDING" | "PROJECT_OPERATIONAL" | "KSO_ESCROW" | "TAX_RESERVE";
export type DisbursementStatus = "DRAFT_MAKER" | "PENDING_CHECKER" | "PENDING_SIGNER" | "EXECUTED_H2H" | "REJECTED";
export type VirtualAccountStatus = "PENDING_PAYMENT" | "PAID" | "EXPIRED" | "CANCELLED";

interface BankAccountRecord {
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

interface DisbursementItem {
  id: string;
  beneficiaryCode: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccount: string;
  amount: number;
  description: string;
  referenceNumber?: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

interface BatchDisbursementRecord {
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

interface VirtualAccountRecord {
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

interface StatementReconciliationRecord {
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
  auditStatus: "FULLY_RECONCILED" | "EXCEPTION_PENDING" | "IN_PROGRESS";
  uploadedAt: string;
}

interface CashPoolSweepRecord {
  id: string;
  sweepNumber: string;
  poolGroupId: string;
  sourceAccountNumber: string;
  sourceBankName: string;
  targetAccountNumber: string;
  targetBankName: string;
  amount: number;
  sweepType: "SWEEPING_TO_MASTER" | "TOP_UP_MINIMUM_BALANCE" | "KSO_PROFIT_SPLIT";
  authorizedBy: string;
  executedAt: string;
  remarks?: string;
}

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "disbursements" | "virtual-accounts" | "reconciliation" | "cash-pooling">("accounts");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // State: Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccountRecord[]>([
    {
      id: "ACC-001",
      bankName: "Bank Mandiri",
      accountNumber: "137-00-1928374-1",
      accountHolder: "PT BuildFlow Konstruksi Persada (Master Giro)",
      accountType: "MASTER_HOLDING",
      currency: "IDR",
      currentBalance: 42500000000,
      minimumBalanceTarget: 20000000000,
      branchOffice: "KC Jakarta Thamrin",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:45:00Z",
    },
    {
      id: "ACC-002",
      bankName: "Bank BCA",
      accountNumber: "035-8829101",
      accountHolder: "PT BuildFlow Konstruksi Persada (Operational Holding)",
      accountType: "MASTER_HOLDING",
      currency: "IDR",
      currentBalance: 22000000000,
      minimumBalanceTarget: 5000000000,
      branchOffice: "KCU Wisma Asia Slipi",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:40:00Z",
    },
    {
      id: "ACC-003",
      bankName: "Bank BCA",
      accountNumber: "522-0918234",
      accountHolder: "KSO Adhi-BuildFlow (MRT Fase 2A Escrow)",
      accountType: "KSO_ESCROW",
      currency: "IDR",
      currentBalance: 18250000000,
      minimumBalanceTarget: 10000000000,
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      branchOffice: "KCU Menara BCA",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:30:00Z",
    },
    {
      id: "ACC-004",
      bankName: "Bank BNI",
      accountNumber: "021-98471625",
      accountHolder: "BuildFlow - Tol Cisumdawu Seksi 6 Ops",
      accountType: "PROJECT_OPERATIONAL",
      currency: "IDR",
      currentBalance: 8400000000,
      minimumBalanceTarget: 5000000000,
      projectId: "PRJ-CSM-002",
      projectName: "Jalan Tol Cisumdawu Seksi 6",
      branchOffice: "KC Bandung ITB",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:20:00Z",
    },
    {
      id: "ACC-005",
      bankName: "Bank BRI",
      accountNumber: "0018-01-002938-30-2",
      accountHolder: "BuildFlow - Bendungan Bener Purworejo Ops",
      accountType: "PROJECT_OPERATIONAL",
      currency: "IDR",
      currentBalance: 16950000000,
      minimumBalanceTarget: 3000000000,
      projectId: "PRJ-BNR-003",
      projectName: "Bendungan Bener Paket 2",
      branchOffice: "KC Purworejo",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:15:00Z",
    },
    {
      id: "ACC-006",
      bankName: "Bank Mandiri",
      accountNumber: "137-00-8837190-5",
      accountHolder: "PT BuildFlow Konstruksi Persada (PPH/PPN Reserve)",
      accountType: "TAX_RESERVE",
      currency: "IDR",
      currentBalance: 9600000000,
      minimumBalanceTarget: 5000000000,
      branchOffice: "KC Jakarta Sudirman",
      isH2HConnected: true,
      lastH2HSyncAt: "2026-03-05T11:00:00Z",
    },
  ]);

  // State: Batch Disbursements
  const [disbursements, setDisbursements] = useState<BatchDisbursementRecord[]>([
    {
      id: "DISB-001",
      batchNumber: "BATCH-2026-001",
      batchTitle: "Disbursement Payroll Mandor & Tenaga Ahli Periode Feb-26 CP201",
      bankPartner: "Bank Mandiri",
      sourceAccountNumber: "137-00-1928374-1",
      sourceAccountHolder: "PT BuildFlow Konstruksi Persada (Master Giro)",
      category: "MANDOR_PAYROLL",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      totalAmount: 4850000000,
      itemCount: 42,
      makerName: "Ahmad Zulkarnaen, S.Ak (Treasury Staff)",
      checkerName: "Dewi Rahmawati, S.E. (Head of Corporate Treasury)",
      status: "PENDING_SIGNER",
      items: [
        {
          id: "ITEM-001",
          beneficiaryCode: "MND-014",
          beneficiaryName: "Mandor Joko Susanto (Pekerjaan D-Wall)",
          beneficiaryBank: "Bank Mandiri",
          beneficiaryAccount: "137-00-5544332",
          amount: 450000000,
          description: "Opname Upah Mandor D-Wall Stasiun Monas Periode II",
          referenceNumber: "OPN-MND-001",
          status: "PENDING",
        },
        {
          id: "ITEM-002",
          beneficiaryCode: "MND-028",
          beneficiaryName: "Mandor Bambang Irawan (Pembesian & Bekisting)",
          beneficiaryBank: "Bank BCA",
          beneficiaryAccount: "035-7766554",
          amount: 380000000,
          description: "Opname Upah Mandor Pembesian Box Station Harmoni",
          referenceNumber: "OPN-MND-002",
          status: "PENDING",
        },
      ],
      createdAt: "2026-03-04T09:00:00Z",
      notes: "Sudah diverifikasi dokumen e-opname dan verifikasi absensi biometrik site.",
    },
    {
      id: "DISB-002",
      batchNumber: "BATCH-2026-002",
      batchTitle: "Pelunasan SPK Subkontraktor Batch Maret 2026",
      bankPartner: "Bank BCA",
      sourceAccountNumber: "522-0918234",
      sourceAccountHolder: "KSO Adhi-BuildFlow (MRT Fase 2A Escrow)",
      category: "SUBCON_SPK",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      totalAmount: 2420000000,
      itemCount: 8,
      makerName: "Ahmad Zulkarnaen, S.Ak (Treasury Staff)",
      checkerName: "Dewi Rahmawati, S.E. (Head of Corporate Treasury)",
      signerName: "Ir. Hendra Kusuma (CFO BuildFlow)",
      status: "PENDING_SIGNER",
      items: [
        {
          id: "ITEM-003",
          beneficiaryCode: "SUB-005",
          beneficiaryName: "PT Geosains Pondasi Unggul",
          beneficiaryBank: "Bank BCA",
          beneficiaryAccount: "522-1122334",
          amount: 1420000000,
          description: "Pelunasan Term 3 SPK Jet Grouting Bored Pile",
          referenceNumber: "SPK-GEO-003",
          status: "PENDING",
        },
        {
          id: "ITEM-004",
          beneficiaryCode: "SUB-012",
          beneficiaryName: "PT Baja Struktur Presisi",
          beneficiaryBank: "Bank Mandiri",
          beneficiaryAccount: "137-00-9988776",
          amount: 1000000000,
          description: "Termin 2 Pengadaan King Post & Strutting",
          referenceNumber: "SPK-BAJA-002",
          status: "PENDING",
        },
      ],
      createdAt: "2026-03-05T10:30:00Z",
      notes: "Rekening KSO Escrow memerlukan persetujuan Dual-Signatory dari Kuasa KSO Mitra (Adhi Karya).",
    },
    {
      id: "DISB-003",
      batchNumber: "BATCH-2026-003",
      batchTitle: "Disbursement Pengadaan Solar Industri & Maintenance Alat Berat",
      bankPartner: "Bank BRI",
      sourceAccountNumber: "0018-01-002938-30-2",
      sourceAccountHolder: "BuildFlow - Bendungan Bener Purworejo Ops",
      category: "MATERIAL_FUEL",
      projectId: "PRJ-BNR-003",
      projectName: "Bendungan Bener Paket 2",
      totalAmount: 1150000000,
      itemCount: 4,
      makerName: "Siti Rahayu (Site Cashier)",
      checkerName: "Dewi Rahmawati, S.E. (Head of Corporate Treasury)",
      signerName: "Ir. Hendra Kusuma (CFO BuildFlow)",
      status: "EXECUTED_H2H",
      items: [
        {
          id: "ITEM-005",
          beneficiaryCode: "SPL-021",
          beneficiaryName: "PT Pertamina Patra Niaga",
          beneficiaryBank: "Bank BRI",
          beneficiaryAccount: "0018-01-889900-30-1",
          amount: 850000000,
          description: "Pembelian BBM Solar Non-Subsidi 48.000 Liter",
          referenceNumber: "PO-BBM-2026-02",
          status: "SUCCESS",
        },
      ],
      h2hReferenceCode: "BRI-CMS-TRX-20260305-9921",
      createdAt: "2026-03-05T08:00:00Z",
      executedAt: "2026-03-05T09:12:00Z",
      notes: "Auto-disbursed via BRI Cash Management System (CMS) API Host-to-Host.",
    },
  ]);

  // State: Virtual Accounts
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccountRecord[]>([
    {
      id: "VA-001",
      vaNumber: "889100260001",
      bankPartner: "Bank Mandiri",
      customerName: "PT MRT Jakarta (Perseroda)",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      billAmount: 8550000000,
      paidAmount: 0,
      purpose: "MONTHLY_CERTIFICATE",
      invoiceReference: "INV-MC18-MRT2026-02",
      status: "PENDING_PAYMENT",
      createdAt: "2026-03-01T09:00:00Z",
      expiredAt: "2026-03-15T23:59:59Z",
      description: "Tagihan Monthly Certificate No. 18 Pekerjaan Bored Piling Stasiun Harmoni",
    },
    {
      id: "VA-002",
      vaNumber: "712900260002",
      bankPartner: "Bank BCA",
      customerName: "PT Citra Marga Nusaphala Persada Tbk",
      projectId: "PRJ-CSM-002",
      projectName: "Jalan Tol Cisumdawu Seksi 6",
      billAmount: 2500000000,
      paidAmount: 0,
      purpose: "RETENTION_SETTLEMENT",
      invoiceReference: "RET-CSM-FHO-2026",
      status: "PENDING_PAYMENT",
      createdAt: "2026-02-20T10:00:00Z",
      expiredAt: "2026-03-20T23:59:59Z",
      description: "Pengembalian dana retensi 5% setelah penerbitan Berita Acara FHO",
    },
    {
      id: "VA-003",
      vaNumber: "889100260003",
      bankPartner: "Bank Mandiri",
      customerName: "Balai Besar Wilayah Sungai Serayu Opak (BBWSO)",
      projectId: "PRJ-BNR-003",
      projectName: "Bendungan Bener Paket 2",
      billAmount: 14200000000,
      paidAmount: 14200000000,
      purpose: "MONTHLY_CERTIFICATE",
      invoiceReference: "INV-MC12-BNR2026-01",
      status: "PAID",
      createdAt: "2026-02-15T08:00:00Z",
      expiredAt: "2026-03-01T23:59:59Z",
      paidAt: "2026-02-28T14:22:10Z",
      description: "Pembayaran termin MC-12 Galian Spilway & Terowongan Pengelak",
    },
  ]);

  // State: Reconciliations
  const [reconciliations, setReconciliations] = useState<StatementReconciliationRecord[]>([
    {
      id: "REC-001",
      statementNumber: "MT940-MCM-20260304",
      bankName: "Bank Mandiri (MCM)",
      accountNumber: "137-00-1928374-1",
      statementDate: "2026-03-04",
      openingBalance: 40500000000,
      closingBalance: 42500000000,
      totalDebit: 3200000000,
      totalCredit: 5200000000,
      transactionCount: 38,
      matchedCount: 38,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: "FULLY_RECONCILED",
      uploadedAt: "2026-03-04T18:00:00Z",
    },
    {
      id: "REC-002",
      statementNumber: "CAMT053-BCA-20260304",
      bankName: "Bank BCA (KlikBCA Bisnis)",
      accountNumber: "035-8829101",
      statementDate: "2026-03-04",
      openingBalance: 24500000000,
      closingBalance: 22000000000,
      totalDebit: 4500000000,
      totalCredit: 2000000000,
      transactionCount: 29,
      matchedCount: 28,
      unmatchedCount: 1,
      reconciliationRatePercent: 96.6,
      auditStatus: "EXCEPTION_PENDING",
      uploadedAt: "2026-03-04T18:30:00Z",
    },
    {
      id: "REC-003",
      statementNumber: "MT940-BNI-20260304",
      bankName: "Bank BNI (BNI Direct)",
      accountNumber: "021-98471625",
      statementDate: "2026-03-04",
      openingBalance: 9800000000,
      closingBalance: 8400000000,
      totalDebit: 2100000000,
      totalCredit: 700000000,
      transactionCount: 17,
      matchedCount: 17,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: "FULLY_RECONCILED",
      uploadedAt: "2026-03-04T19:00:00Z",
    },
  ]);

  // State: Cash Pooling Sweeps
  const [cashPoolSweeps, setCashPoolSweeps] = useState<CashPoolSweepRecord[]>([
    {
      id: "SWP-001",
      sweepNumber: "SWP-2026-001",
      poolGroupId: "POOL-GRP-HOLDING-IDR",
      sourceAccountNumber: "021-98471625",
      sourceBankName: "Bank BNI (Jalan Tol Cisumdawu Seksi 6)",
      targetAccountNumber: "137-00-1928374-1",
      targetBankName: "Bank Mandiri (PT BuildFlow Master Giro)",
      amount: 4500000000,
      sweepType: "SWEEPING_TO_MASTER",
      authorizedBy: "Sistem H2H Sweeper Otomatis (EOD ZBA)",
      executedAt: "2026-03-04T23:59:00Z",
      remarks: "End of Day Zero Balance Account (ZBA) sweeping ke rekening induk holding",
    },
    {
      id: "SWP-002",
      sweepNumber: "SWP-2026-002",
      poolGroupId: "POOL-GRP-HOLDING-IDR",
      sourceAccountNumber: "137-00-1928374-1",
      sourceBankName: "Bank Mandiri (PT BuildFlow Master Giro)",
      targetAccountNumber: "0018-01-002938-30-2",
      targetBankName: "Bank BRI (Bendungan Bener Paket 2)",
      amount: 2500000000,
      sweepType: "TOP_UP_MINIMUM_BALANCE",
      authorizedBy: "Dewi Rahmawati, S.E. (Head of Corporate Treasury)",
      executedAt: "2026-03-05T08:30:00Z",
      remarks: "Top-up likuiditas operasional proyek Bendungan Bener memenuhi target balancing Rp 3 Miliar",
    },
  ]);

  // Modals
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showVaModal, setShowVaModal] = useState(false);
  const [showSweepModal, setShowSweepModal] = useState(false);
  const [showUploadMt940Modal, setShowUploadMt940Modal] = useState(false);

  // Forms
  const [accountForm, setAccountForm] = useState({
    bankName: "Bank Mandiri",
    accountNumber: "",
    accountHolder: "",
    accountType: "MASTER_HOLDING" as BankAccountType,
    currentBalance: 0,
    minimumBalanceTarget: 5000000000,
    branchOffice: "",
  });

  const [disbursementForm, setDisbursementForm] = useState({
    batchTitle: "",
    bankPartner: "Bank Mandiri",
    sourceAccountNumber: "137-00-1928374-1",
    category: "MANDOR_PAYROLL",
    makerName: "Ahmad Zulkarnaen, S.Ak (Treasury Staff)",
    itemCount: 5,
    totalAmount: 1250000000,
    notes: "",
  });

  const [vaForm, setVaForm] = useState({
    bankPartner: "Bank Mandiri",
    customerName: "",
    projectId: "PRJ-MRT-001",
    projectName: "MRT Fase 2A CP201 Monas-Harmoni",
    billAmount: 5000000000,
    purpose: "MONTHLY_CERTIFICATE",
    invoiceReference: "",
    expiredAt: "2026-03-31",
    description: "",
  });

  const [sweepForm, setSweepForm] = useState({
    poolGroupId: "POOL-GRP-HOLDING-IDR",
    sourceAccountNumber: "021-98471625",
    targetAccountNumber: "137-00-1928374-1",
    amount: 1000000000,
    sweepType: "SWEEPING_TO_MASTER" as "SWEEPING_TO_MASTER" | "TOP_UP_MINIMUM_BALANCE" | "KSO_PROFIT_SPLIT",
    authorizedBy: "Dewi Rahmawati, S.E. (Head of Corporate Treasury)",
    remarks: "",
  });

  const [mt940Text, setMt940Text] = useState(
    `:20:STATEMENT-2026-0305\n:25:137-00-1928374-1\n:28C:00054/001\n:60F:C260305IDR42500000000,00\n:61:2603050305CR14200000000,00NTRFNONREF//INV-MC12-BNR2026-01\n:86:PEMBAYARAN TERMIN MC-12 BBWSO PROYEK BENDUNGAN BENER\n:61:2603050305DR4850000000,00NTRFNONREF//BATCH-2026-001\n:86:BATCH DISBURSEMENT PAYROLL MANDOR SPK CP201\n:62F:C260305IDR51850000000,00`
  );

  // Filters & Search
  const [accountTypeFilter, setAccountTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Handlers
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.accountNumber || !accountForm.accountHolder) {
      alert("Lengkapi nomor rekening dan nama pemegang rekening");
      return;
    }
    const newRecord: BankAccountRecord = {
      id: `ACC-00${bankAccounts.length + 1}`,
      bankName: accountForm.bankName,
      accountNumber: accountForm.accountNumber,
      accountHolder: accountForm.accountHolder,
      accountType: accountForm.accountType,
      currency: "IDR",
      currentBalance: Number(accountForm.currentBalance) || 0,
      minimumBalanceTarget: Number(accountForm.minimumBalanceTarget) || 0,
      branchOffice: accountForm.branchOffice || "Kantor Cabang Utama",
      isH2HConnected: true,
      lastH2HSyncAt: new Date().toISOString(),
    };
    setBankAccounts([newRecord, ...bankAccounts]);
    setShowAddAccountModal(false);
    showToast(`Rekening bank ${newRecord.bankName} (${newRecord.accountNumber}) berhasil dihubungkan ke Gateway Treasury H2H.`);
  };

  const handleCreateDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursementForm.batchTitle) {
      alert("Lengkapi judul batch disbursement");
      return;
    }
    const nextSeq = disbursements.length + 1;
    const newDisb: BatchDisbursementRecord = {
      id: `DISB-00${nextSeq}`,
      batchNumber: `BATCH-2026-00${nextSeq}`,
      batchTitle: disbursementForm.batchTitle,
      bankPartner: disbursementForm.bankPartner,
      sourceAccountNumber: disbursementForm.sourceAccountNumber,
      sourceAccountHolder: "PT BuildFlow Konstruksi Persada (Master Giro)",
      category: disbursementForm.category,
      totalAmount: Number(disbursementForm.totalAmount),
      itemCount: Number(disbursementForm.itemCount),
      makerName: disbursementForm.makerName,
      status: "PENDING_CHECKER",
      items: [
        {
          id: `ITEM-NEW-1`,
          beneficiaryCode: "BEN-099",
          beneficiaryName: "Rekanan / Mandor Batch " + nextSeq,
          beneficiaryBank: disbursementForm.bankPartner,
          beneficiaryAccount: "9988776655",
          amount: Number(disbursementForm.totalAmount),
          description: disbursementForm.batchTitle,
          status: "PENDING",
        },
      ],
      createdAt: new Date().toISOString(),
      notes: disbursementForm.notes,
    };
    setDisbursements([newDisb, ...disbursements]);
    setShowDisbursementModal(false);
    showToast(`Batch ${newDisb.batchNumber} berhasil dibuat oleh Maker. Menunggu persetujuan Checker.`);
  };

  const handleAuthorizeDisbursement = (
    id: string,
    role: "CHECKER" | "SIGNER" | "KSO_SIGNER",
    authorizerName: string
  ) => {
    setDisbursements((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (role === "CHECKER") {
          return { ...d, checkerName: authorizerName, status: "PENDING_SIGNER" };
        } else if (role === "SIGNER") {
          // Check if KSO account needs partner dual signer
          if (d.sourceAccountNumber === "522-0918234" && !d.ksoPartnerSignerName) {
            return { ...d, signerName: authorizerName, status: "PENDING_SIGNER" };
          }
          return {
            ...d,
            signerName: authorizerName,
            status: "EXECUTED_H2H",
            executedAt: new Date().toISOString(),
            h2hReferenceCode: `H2H-MANDIRI-${Date.now()}`,
          };
        } else if (role === "KSO_SIGNER") {
          return {
            ...d,
            ksoPartnerSignerName: authorizerName,
            status: "EXECUTED_H2H",
            executedAt: new Date().toISOString(),
            h2hReferenceCode: `H2H-KSO-BCA-${Date.now()}`,
          };
        }
        return d;
      })
    );
    showToast(`Otorisasi ${role} untuk batch disbursement berhasil disahkan.`);
  };

  const handleGenerateVa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaForm.customerName || !vaForm.invoiceReference) {
      alert("Lengkapi nama pembayar (owner) dan nomor invoice referensi");
      return;
    }
    const nextSeq = virtualAccounts.length + 1;
    const prefix = vaForm.bankPartner === "Bank Mandiri" ? "8891" : vaForm.bankPartner === "Bank BCA" ? "7129" : "0190";
    const newVa: VirtualAccountRecord = {
      id: `VA-00${nextSeq}`,
      vaNumber: `${prefix}002600${nextSeq}`,
      bankPartner: vaForm.bankPartner,
      customerName: vaForm.customerName,
      projectId: vaForm.projectId,
      projectName: vaForm.projectName,
      billAmount: Number(vaForm.billAmount),
      paidAmount: 0,
      purpose: vaForm.purpose,
      invoiceReference: vaForm.invoiceReference,
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
      expiredAt: `${vaForm.expiredAt}T23:59:59Z`,
      description: vaForm.description || "Tagihan Monthly Certificate Konstruksi",
    };
    setVirtualAccounts([newVa, ...virtualAccounts]);
    setShowVaModal(false);
    showToast(`Dynamic Virtual Account ${newVa.vaNumber} (${newVa.bankPartner}) siap ditagihkan ke ${newVa.customerName}.`);
  };

  const handleExecuteSweep = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceAcc = bankAccounts.find((a) => a.accountNumber === sweepForm.sourceAccountNumber);
    const targetAcc = bankAccounts.find((a) => a.accountNumber === sweepForm.targetAccountNumber);

    if (!sourceAcc || !targetAcc) {
      alert("Pilih rekening sumber dan target yang valid");
      return;
    }
    const sweepAmt = Number(sweepForm.amount);
    if (sourceAcc.currentBalance < sweepAmt) {
      alert("Saldo rekening sumber tidak mencukupi untuk transfer cash sweep ini!");
      return;
    }

    // Update balances
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.accountNumber === sourceAcc.accountNumber) {
          return { ...acc, currentBalance: acc.currentBalance - sweepAmt };
        }
        if (acc.accountNumber === targetAcc.accountNumber) {
          return { ...acc, currentBalance: acc.currentBalance + sweepAmt };
        }
        return acc;
      })
    );

    const nextSeq = cashPoolSweeps.length + 1;
    const newSweep: CashPoolSweepRecord = {
      id: `SWP-00${nextSeq}`,
      sweepNumber: `SWP-2026-00${nextSeq}`,
      poolGroupId: sweepForm.poolGroupId,
      sourceAccountNumber: sourceAcc.accountNumber,
      sourceBankName: `${sourceAcc.bankName} (${sourceAcc.accountHolder})`,
      targetAccountNumber: targetAcc.accountNumber,
      targetBankName: `${targetAcc.bankName} (${targetAcc.accountHolder})`,
      amount: sweepAmt,
      sweepType: sweepForm.sweepType,
      authorizedBy: sweepForm.authorizedBy,
      executedAt: new Date().toISOString(),
      remarks: sweepForm.remarks || "Eksekusi Cash Pooling Target Balancing H2H",
    };

    setCashPoolSweeps([newSweep, ...cashPoolSweeps]);
    setShowSweepModal(false);
    showToast(`Cash Pooling Sweeping senilai Rp ${(sweepAmt / 1000000000).toFixed(2)} Miliar berhasil dieksekusi secara real-time.`);
  };

  const handleUploadMt940 = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = reconciliations.length + 1;
    const newRec: StatementReconciliationRecord = {
      id: `REC-00${nextSeq}`,
      statementNumber: `MT940-MAN-${Date.now().toString().slice(-6)}`,
      bankName: "Bank Mandiri (MCM H2H)",
      accountNumber: "137-00-1928374-1",
      statementDate: new Date().toISOString().split("T")[0],
      openingBalance: 42500000000,
      closingBalance: 51850000000,
      totalDebit: 4850000000,
      totalCredit: 14200000000,
      transactionCount: 22,
      matchedCount: 22,
      unmatchedCount: 0,
      reconciliationRatePercent: 100,
      auditStatus: "FULLY_RECONCILED",
      uploadedAt: new Date().toISOString(),
    };
    setReconciliations([newRec, ...reconciliations]);
    setShowUploadMt940Modal(false);
    showToast(`Berkas SWIFT MT940 statement berhasil diparsing dan direkonsiliasi otomatis ke GL dengan 100% Matching Rate.`);
  };

  // Calculations
  const totalCorporateLiquidity = bankAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
  const pendingDisbursementsTotal = disbursements
    .filter((d) => d.status === "PENDING_CHECKER" || d.status === "PENDING_SIGNER")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const activeVaReceivables = virtualAccounts
    .filter((v) => v.status === "PENDING_PAYMENT")
    .reduce((acc, curr) => acc + curr.billAmount, 0);
  const avgReconRate =
    reconciliations.length > 0
      ? (reconciliations.reduce((acc, curr) => acc + curr.matchedCount, 0) /
          reconciliations.reduce((acc, curr) => acc + curr.transactionCount, 0)) *
        100
      : 100;

  const filteredAccounts = bankAccounts.filter((acc) => {
    const matchesType = accountTypeFilter === "ALL" || acc.accountType === accountTypeFilter;
    const matchesSearch =
      acc.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountNumber.includes(searchTerm) ||
      acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.projectName && acc.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen text-slate-800 overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:bg-emerald-800 p-1 rounded"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4 text-emerald-200" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Treasury Gateway H2H
            </span>
            <span className="text-xs text-slate-500 font-mono">Phase 24 Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Enterprise Treasury, Banking H2H & Cash Pooling
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Sistem perbankan korporat Host-to-Host (Mandiri MCM, KlikBCA Bisnis, BNI Direct, BRI CMS), dynamic virtual account penagihan termin MC, 3-tier bulk disbursement payroll mandor, rekonsiliasi SWIFT MT940, dan Zero Balance Account (ZBA).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowUploadMt940Modal(true)}
            className="w-full sm:w-auto justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Upload SWIFT MT940
          </button>
          <button
            onClick={() => setShowSweepModal(true)}
            className="w-full sm:w-auto justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            Eksekusi ZBA Sweeping
          </button>
          <button
            onClick={() => setShowDisbursementModal(true)}
            className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Batch Disbursement Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Likuiditas Kas Korporat</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              Rp {(totalCorporateLiquidity / 1000000000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Konsolidasi {bankAccounts.length} Rekening H2H Real-Time
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Batch Disbursement</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              Rp {(pendingDisbursementsTotal / 1000000000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Menunggu Checker / Dual-Signatory KSO
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Dynamic VA Receivables</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              Rp {(activeVaReceivables / 1000000000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Penagihan Termin MC Proyek ke Owner
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MT940 Matching Rate</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {avgReconRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              Rekonsiliasi Mutasi GL Otomatis Harian
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex flex-wrap gap-1 sm:gap-2 pb-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "accounts"}
            onClick={() => setActiveTab("accounts")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "accounts"
                ? "border-blue-700 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Landmark className="w-4 h-4" />
            Rekening Bank & Likuiditas
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "disbursements"}
            onClick={() => setActiveTab("disbursements")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "disbursements"
                ? "border-blue-700 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Send className="w-4 h-4" />
            Bulk Disbursement H2H
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
              {disbursements.filter((d) => d.status === "PENDING_CHECKER" || d.status === "PENDING_SIGNER").length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "virtual-accounts"}
            onClick={() => setActiveTab("virtual-accounts")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "virtual-accounts"
                ? "border-blue-700 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            Dynamic Virtual Account
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "reconciliation"}
            onClick={() => setActiveTab("reconciliation")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "reconciliation"
                ? "border-blue-700 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Rekonsiliasi Mutasi MT940
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "cash-pooling"}
            onClick={() => setActiveTab("cash-pooling")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "cash-pooling"
                ? "border-blue-700 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Cash Pooling & ZBA
          </button>
        </div>
      </div>

      {/* TAB 1: BANK ACCOUNTS & LIQUIDITY */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor rekening, bank, atau proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <option value="ALL">Semua Jenis Rekening</option>
                  <option value="MASTER_HOLDING">Rekening Giro Induk Holding</option>
                  <option value="KSO_ESCROW">Rekening Escrow KSO</option>
                  <option value="PROJECT_OPERATIONAL">Rekening Operasional Proyek</option>
                  <option value="TAX_RESERVE">Rekening Cadangan Pajak</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="w-full sm:w-auto justify-center px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Rekening
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[18%]">Nama Bank & Cabang</th>
                  <th className="py-3 px-4 w-[15%]">No. Rekening</th>
                  <th className="py-3 px-4 w-[20%]">Pemegang Rekening / Proyek</th>
                  <th className="py-3 px-4 w-[14%]">Tipe Rekening</th>
                  <th className="py-3 px-4 w-[14%] text-right">Saldo Berjalan</th>
                  <th className="py-3 px-4 w-[10%] text-right">Target Min</th>
                  <th className="py-3 px-4 w-[9%] text-center">Status H2H</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                          {acc.bankName.substring(5, 8).toUpperCase() || "BNK"}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate">{acc.bankName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{acc.branchOffice}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 truncate">{acc.accountHolder}</div>
                      {acc.projectName && (
                        <div className="text-[11px] text-blue-600 truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" />
                          {acc.projectName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          acc.accountType === "MASTER_HOLDING"
                            ? "bg-purple-100 text-purple-800"
                            : acc.accountType === "KSO_ESCROW"
                            ? "bg-amber-100 text-amber-800"
                            : acc.accountType === "TAX_RESERVE"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {acc.accountType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      Rp {acc.currentBalance.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      Rp {acc.minimumBalanceTarget.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAccounts.map((acc) => (
              <div key={acc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {acc.accountType.replace("_", " ")}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{acc.bankName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{acc.accountNumber}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    H2H
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <div className="text-xs text-slate-700 font-medium truncate">{acc.accountHolder}</div>
                  {acc.projectName && (
                    <div className="text-[11px] text-blue-600 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 shrink-0" />
                      {acc.projectName}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Saldo Berjalan:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rp {acc.currentBalance.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BULK DISBURSEMENTS & 3-TIER APPROVAL */}
      {activeTab === "disbursements" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Penerapan 3-Tier Security Authorization: Maker - Checker - Signer
              </p>
              <p className="mt-0.5 text-amber-800">
                Setiap pembayaran massal (Payroll mandor / SPK rekanan) wajib dipersiapkan oleh Staff Treasury (Maker), diverifikasi keabsahan invoice oleh Treasury Head (Checker), dan disahkan tanda tangan digital oleh Kuasa Anggaran/Direktur Keuangan (Signer). Rekening KSO Escrow mewajibkan Dual-Signatory dari perwakilan mitra KSO.
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[11%]">No. Batch</th>
                  <th className="py-3 px-4 w-[23%]">Deskripsi Pengeluaran</th>
                  <th className="py-3 px-4 w-[15%]">Bank & Rekening Sumber</th>
                  <th className="py-3 px-4 w-[13%] text-right">Total Nominal</th>
                  <th className="py-3 px-4 w-[7%] text-center">Penerima</th>
                  <th className="py-3 px-4 w-[12%]">Otorisasi</th>
                  <th className="py-3 px-4 w-[8%] text-center">Status</th>
                  <th className="py-3 px-4 w-[11%] text-center">Aksi / Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disbursements.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {d.batchNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{d.batchTitle}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Kategori: <span className="font-medium text-slate-700">{d.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div className="font-medium text-slate-900">{d.bankPartner}</div>
                      <div className="text-[11px] text-slate-500">{d.sourceAccountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {d.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {d.itemCount} rek
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 space-y-0.5">
                      <div>Maker: <span className="text-slate-900 font-medium">{d.makerName.split(" ")[0]}</span></div>
                      <div>Checker: <span className={d.checkerName ? "text-emerald-700 font-medium" : "text-amber-600 italic"}>{d.checkerName ? "Verified" : "Pending"}</span></div>
                      <div>Signer: <span className={d.signerName ? "text-emerald-700 font-medium" : "text-amber-600 italic"}>{d.signerName ? "Approved" : "Pending"}</span></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          d.status === "EXECUTED_H2H"
                            ? "bg-emerald-100 text-emerald-800"
                            : d.status === "PENDING_SIGNER"
                            ? "bg-amber-100 text-amber-800"
                            : d.status === "PENDING_CHECKER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {d.status === "PENDING_CHECKER" && (
                        <button
                          onClick={() => handleAuthorizeDisbursement(d.id, "CHECKER", "Dewi Rahmawati, S.E. (Head of Corporate Treasury)")}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                        >
                          Approve Checker
                        </button>
                      )}
                      {d.status === "PENDING_SIGNER" && (
                        <div className="flex flex-col gap-1">
                          {!d.signerName && (
                            <button
                              onClick={() => handleAuthorizeDisbursement(d.id, "SIGNER", "Ir. Hendra Kusuma (CFO BuildFlow)")}
                              className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                            >
                              Signer Release
                            </button>
                          )}
                          {d.sourceAccountNumber === "522-0918234" && !d.ksoPartnerSignerName && (
                            <button
                              onClick={() => handleAuthorizeDisbursement(d.id, "KSO_SIGNER", "Ir. Bambang Tri, M.T. (Kuasa KSO Adhi Karya)")}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
                            >
                              Dual-Sign KSO
                            </button>
                          )}
                        </div>
                      )}
                      {d.status === "EXECUTED_H2H" && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {d.h2hReferenceCode?.substring(0, 14)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {disbursements.map((d) => (
              <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{d.batchNumber}</span>
                    <h3 className="font-semibold text-slate-900 text-xs mt-0.5">{d.batchTitle}</h3>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                      d.status === "EXECUTED_H2H"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {d.status.replace("_", " ")}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Nominal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rp {d.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{d.itemCount} Rekening Penerima</span>
                  {d.status === "PENDING_CHECKER" && (
                    <button
                      onClick={() => handleAuthorizeDisbursement(d.id, "CHECKER", "Dewi Rahmawati, S.E. (Head of Corporate Treasury)")}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 rounded"
                    >
                      Approve Checker
                    </button>
                  )}
                  {d.status === "PENDING_SIGNER" && (
                    <button
                      onClick={() => handleAuthorizeDisbursement(d.id, "SIGNER", "Ir. Hendra Kusuma (CFO BuildFlow)")}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 rounded"
                    >
                      Release Signer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC VIRTUAL ACCOUNTS */}
      {activeTab === "virtual-accounts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Dynamic Virtual Account Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nomor VA unik otomatis diterbitkan untuk setiap termin Monthly Certificate (MC), invoice tagihan owner, dan setoran retensi.
              </p>
            </div>
            <button
              onClick={() => setShowVaModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Dynamic VA
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[16%]">No. Virtual Account</th>
                  <th className="py-3 px-4 w-[13%]">Mitra Bank</th>
                  <th className="py-3 px-4 w-[23%]">Pelanggan / Proyek</th>
                  <th className="py-3 px-4 w-[18%]">No. Invoice / Tujuan</th>
                  <th className="py-3 px-4 w-[14%] text-right">Tagihan VA</th>
                  <th className="py-3 px-4 w-[8%] text-center">Batas Waktu</th>
                  <th className="py-3 px-4 w-[8%] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {virtualAccounts.map((va) => (
                  <tr key={va.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {va.vaNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {va.bankPartner}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{va.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {va.projectName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700 truncate">{va.invoiceReference}</div>
                      <div className="text-[11px] text-slate-500 truncate">{va.purpose}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {va.billAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-600">
                      {va.expiredAt.split("T")[0]}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          va.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {va.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {virtualAccounts.map((va) => (
              <div key={va.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-700">{va.vaNumber}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                      va.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {va.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">{va.customerName}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{va.invoiceReference}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{va.bankPartner}</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rp {va.billAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED STATEMENT RECONCILIATION */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Automated Bank Reconciliation Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Parsing otomatis format berkas standard perbankan SWIFT MT940 dan ISO 20022 CAMT.053 dengan pencocokan debit/kredit ke General Ledger.
              </p>
            </div>
            <button
              onClick={() => setShowUploadMt940Modal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Upload & Parsing Berkas MT940
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[16%]">No. Berkas Statement</th>
                  <th className="py-3 px-4 w-[18%]">Bank & Rekening</th>
                  <th className="py-3 px-4 w-[10%] text-center">Tanggal Mutasi</th>
                  <th className="py-3 px-4 w-[13%] text-right">Total Debit</th>
                  <th className="py-3 px-4 w-[13%] text-right">Total Kredit</th>
                  <th className="py-3 px-4 w-[12%] text-center">Pencocokan Transaksi</th>
                  <th className="py-3 px-4 w-[8%] text-center">Matching Rate</th>
                  <th className="py-3 px-4 w-[10%] text-center">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rec.statementNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{rec.bankName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rec.accountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {rec.statementDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-medium">
                      Rp {rec.totalDebit.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-medium">
                      Rp {rec.totalCredit.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-bold text-slate-900">{rec.matchedCount}</span> / {rec.transactionCount} matched
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={rec.reconciliationRatePercent === 100 ? "text-emerald-700" : "text-amber-700"}>
                        {rec.reconciliationRatePercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          rec.auditStatus === "FULLY_RECONCILED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rec.auditStatus.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {reconciliations.map((rec) => (
              <div key={rec.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{rec.statementNumber}</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{rec.reconciliationRatePercent}%</span>
                </div>
                <div className="text-xs text-slate-700 font-medium">{rec.bankName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{rec.accountNumber}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{rec.matchedCount}/{rec.transactionCount} Matched</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {rec.auditStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CASH POOLING & ZERO BALANCE ACCOUNT (ZBA) */}
      {activeTab === "cash-pooling" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
            <ArrowRightLeft className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">
                Struktur Cash Pooling & Zero Balance Account (ZBA) Multi-Bank
              </p>
              <p className="mt-0.5 text-blue-800">
                Sistem secara otomatis mengkonsolidasikan surplus kas sub-rekening operasional proyek ke Master Escrow Holding setiap akhir hari (End-of-Day Sweeping), serta menyuplai likuiditas kembali (Target Balancing Top-up) saat sub-rekening proyek mendekati batas minimum saldo operasional.
              </p>
            </div>
          </div>

          {/* Sweeps Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Riwayat Transfer Cash Sweeping ZBA</h2>
              <button
                onClick={() => setShowSweepModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Eksekusi Sweeping Manual
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden xl:block overflow-hidden w-full">
              <table className="w-full text-left text-xs table-fixed">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-[12%]">No. Transaksi</th>
                    <th className="py-3 px-4 w-[20%]">Rekening Sumber</th>
                    <th className="py-3 px-4 w-[20%]">Rekening Tujuan</th>
                    <th className="py-3 px-4 w-[14%] text-right">Nominal Sweeping</th>
                    <th className="py-3 px-4 w-[14%]">Jenis Sweeping</th>
                    <th className="py-3 px-4 w-[12%]">Diotorisasi Oleh</th>
                    <th className="py-3 px-4 w-[8%] text-center">Waktu Eksekusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashPoolSweeps.map((swp) => (
                    <tr key={swp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {swp.sweepNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 truncate">{swp.sourceBankName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{swp.sourceAccountNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 truncate">{swp.targetBankName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{swp.targetAccountNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        Rp {swp.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 uppercase tracking-wide">
                          {swp.sweepType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 truncate">
                        {swp.authorizedBy}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                        {swp.executedAt.replace("T", " ").substring(0, 16)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="xl:hidden p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {cashPoolSweeps.map((swp) => (
                <div key={swp.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{swp.sweepNumber}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {swp.sweepType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="text-slate-500">Dari:</span> {swp.sourceBankName}
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="text-slate-500">Ke:</span> {swp.targetBankName}
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Nominal:</span>
                    <span className="font-mono font-bold text-slate-900">
                      Rp {swp.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH REKENING BANK BARU */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Koneksikan Rekening Bank Baru (H2H)</h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bank Mitra</label>
                <select
                  value={accountForm.bankName}
                  onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="Bank Mandiri">Bank Mandiri (MCM Host-to-Host)</option>
                  <option value="Bank BCA">Bank BCA (KlikBCA Bisnis API)</option>
                  <option value="Bank BNI">Bank BNI (BNI Direct API)</option>
                  <option value="Bank BRI">Bank BRI (BRI CMS Gateway)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening Giro</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 137-00-1928374-1"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pemegang Rekening (Sesuai Buku Giro)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT BuildFlow Konstruksi Persada (Master Giro)"
                  value={accountForm.accountHolder}
                  onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Rekening</label>
                  <select
                    value={accountForm.accountType}
                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as BankAccountType })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="MASTER_HOLDING">Master Giro Holding</option>
                    <option value="KSO_ESCROW">Rekening Escrow KSO</option>
                    <option value="PROJECT_OPERATIONAL">Operasional Proyek</option>
                    <option value="TAX_RESERVE">Cadangan Pajak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kantor Cabang</label>
                  <input
                    type="text"
                    placeholder="Contoh: KC Thamrin"
                    value={accountForm.branchOffice}
                    onChange={(e) => setAccountForm({ ...accountForm, branchOffice: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Saldo Awal (IDR)</label>
                  <input
                    type="number"
                    value={accountForm.currentBalance}
                    onChange={(e) => setAccountForm({ ...accountForm, currentBalance: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Minimum Saldo (ZBA)</label>
                  <input
                    type="number"
                    value={accountForm.minimumBalanceTarget}
                    onChange={(e) => setAccountForm({ ...accountForm, minimumBalanceTarget: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Koneksikan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT BATCH DISBURSEMENT BARU */}
      {showDisbursementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Buat Batch Disbursement Baru (Maker)</h3>
              <button
                onClick={() => setShowDisbursementModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDisbursement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul / Deskripsi Pembayaran Massal</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Upah Mandor Pembesian Box Station Harmoni Periode II"
                  value={disbursementForm.batchTitle}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, batchTitle: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Mitra H2H</label>
                  <select
                    value={disbursementForm.bankPartner}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, bankPartner: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="Bank Mandiri">Bank Mandiri (MCM)</option>
                    <option value="Bank BCA">Bank BCA (KlikBCA Bisnis)</option>
                    <option value="Bank BNI">Bank BNI (BNI Direct)</option>
                    <option value="Bank BRI">Bank BRI (BRI CMS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Disbursement</label>
                  <select
                    value={disbursementForm.category}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, category: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="MANDOR_PAYROLL">Payroll Mandor & Tukang</option>
                    <option value="SUBCON_SPK">Pelunasan Termin SPK Subkon</option>
                    <option value="MATERIAL_FUEL">Pengadaan Material & BBM</option>
                    <option value="EQUIPMENT_RENT">Sewa Alat Berat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Rekening Tujuan</label>
                  <input
                    type="number"
                    value={disbursementForm.itemCount}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, itemCount: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Nominal (IDR)</label>
                  <input
                    type="number"
                    value={disbursementForm.totalAmount}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, totalAmount: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Petugas Pembuat (Maker)</label>
                <input
                  type="text"
                  value={disbursementForm.makerName}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, makerName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDisbursementModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Ajukan ke Checker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE DYNAMIC VA */}
      {showVaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Generate Dynamic Virtual Account Baru</h3>
              <button
                onClick={() => setShowVaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateVa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Customer / Owner Proyek</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT MRT Jakarta (Perseroda)"
                  value={vaForm.customerName}
                  onChange={(e) => setVaForm({ ...vaForm, customerName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mitra Bank VA</label>
                  <select
                    value={vaForm.bankPartner}
                    onChange={(e) => setVaForm({ ...vaForm, bankPartner: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="Bank Mandiri">Bank Mandiri (Prefix: 8891)</option>
                    <option value="Bank BCA">Bank BCA (Prefix: 7129)</option>
                    <option value="Bank BNI">Bank BNI (Prefix: 0190)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Pembayaran</label>
                  <select
                    value={vaForm.purpose}
                    onChange={(e) => setVaForm({ ...vaForm, purpose: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="MONTHLY_CERTIFICATE">Termin Monthly Certificate (MC)</option>
                    <option value="DOWN_PAYMENT">Uang Muka Proyek (Down Payment)</option>
                    <option value="RETENTION_SETTLEMENT">Pengembalian Dana Retensi FHO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Invoice Referensi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: INV-MC19-MRT2026-03"
                    value={vaForm.invoiceReference}
                    onChange={(e) => setVaForm({ ...vaForm, invoiceReference: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Tagihan (IDR)</label>
                  <input
                    type="number"
                    value={vaForm.billAmount}
                    onChange={(e) => setVaForm({ ...vaForm, billAmount: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Waktu Pembayaran (Expired)</label>
                <input
                  type="date"
                  value={vaForm.expiredAt}
                  onChange={(e) => setVaForm({ ...vaForm, expiredAt: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowVaModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Generate Virtual Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EKSEKUSI CASH SWEEPING ZBA */}
      {showSweepModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Eksekusi Cash Sweeping & Target Balancing</h3>
              <button
                onClick={() => setShowSweepModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteSweep} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rekening Sumber (Debet)</label>
                <select
                  value={sweepForm.sourceAccountNumber}
                  onChange={(e) => setSweepForm({ ...sweepForm, sourceAccountNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.accountNumber}>
                      {a.bankName} - {a.accountNumber} ({a.accountHolder}) [Saldo: Rp {(a.currentBalance / 1000000000).toFixed(2)}M]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rekening Target (Kredit)</label>
                <select
                  value={sweepForm.targetAccountNumber}
                  onChange={(e) => setSweepForm({ ...sweepForm, targetAccountNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                >
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.accountNumber}>
                      {a.bankName} - {a.accountNumber} ({a.accountHolder}) [Saldo: Rp {(a.currentBalance / 1000000000).toFixed(2)}M]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal Sweeping (IDR)</label>
                  <input
                    type="number"
                    value={sweepForm.amount}
                    onChange={(e) => setSweepForm({ ...sweepForm, amount: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Sweeping</label>
                  <select
                    value={sweepForm.sweepType}
                    onChange={(e) => setSweepForm({ ...sweepForm, sweepType: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="SWEEPING_TO_MASTER">Sweeping ke Rekening Induk Holding</option>
                    <option value="TOP_UP_MINIMUM_BALANCE">Top-up Likuiditas Target Balancing Proyek</option>
                    <option value="KSO_PROFIT_SPLIT">Distribusi Bagi Hasil KSO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Transfer</label>
                <input
                  type="text"
                  placeholder="Contoh: Konsolidasi likuiditas harian ZBA"
                  value={sweepForm.remarks}
                  onChange={(e) => setSweepForm({ ...sweepForm, remarks: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSweepModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm"
                >
                  Eksekusi Sweeping Real-Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: UPLOAD & PARSING MT940 */}
      {showUploadMt940Modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload & Parsing SWIFT MT940 Statement</h3>
              <button
                onClick={() => setShowUploadMt940Modal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadMt940} className="space-y-4">
              <p className="text-xs text-slate-600">
                Tempelkan teks berkas MT940 yang diterima dari perbankan atau klik proses rekonsiliasi GL otomatis:
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payload SWIFT MT940</label>
                <textarea
                  rows={8}
                  value={mt940Text}
                  onChange={(e) => setMt940Text(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadMt940Modal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Proses & Rekonsiliasi GL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
