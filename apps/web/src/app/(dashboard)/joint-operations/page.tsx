"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  Landmark,
  Coins,
  Receipt,
  FileCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  Calculator,
  ArrowUpRight,
  TrendingUp,
  X,
  FileText,
  BadgePercent,
  ChevronRight,
  Split,
} from "lucide-react";

interface KsoSummary {
  projectId: string;
  projectCode: string;
  projectName: string;
  totalContractValue: number;
  jointCashBalance: number;
  totalSharedExpenses: number;
  totalDistributedProfit: number;
  totalTaxWithheld: number;
  activeConsortiumCount: number;
  leadEquityRatio: number;
  partnerEquityRatio: number;
  dualSignatoryThreshold: number;
  leadContractorName: string;
  partnerContractorName: string;
  jointBankName: string;
  jointAccountNumber: string;
}

interface Consortium {
  id: string;
  ksoCode: string;
  consortiumName: string;
  projectTitle: string;
  leadContractor: string;
  leadSharePercent: number;
  leadSignatory: string;
  partnerContractor: string;
  partnerSharePercent: number;
  partnerSignatory: string;
  jointBank: string;
  jointAccountNumber: string;
  jointAccountName: string;
  contractValue: number;
  jointCashBalance: number;
  taxQualification: string;
  status: string;
  establishedDate: string;
  notes: string;
}

interface SharedExpense {
  id: string;
  ksoCode: string;
  expenseCode: string;
  title: string;
  category: string;
  amount: number;
  leadAllocationAmount: number;
  partnerAllocationAmount: number;
  vendorName: string;
  invoiceRef: string;
  expenseDate: string;
  leadApproved: boolean;
  partnerApproved: boolean;
  status: string;
  dualSignatories: { role: string; name: string; status: string; date: string | null }[];
  notes: string;
}

interface ProfitDistribution {
  id: string;
  ksoCode: string;
  periodLabel: string;
  grossRevenue: number;
  totalSharedCost: number;
  retentionReserve: number;
  netProfit: number;
  leadDistributedProfit: number;
  partnerDistributedProfit: number;
  distributionDate: string;
  payoutStatus: string;
  notes: string;
}

interface ConstructionTax {
  id: string;
  ksoCode: string;
  invoiceNumber: string;
  description: string;
  grossInvoiceAmount: number;
  contractorQualification: string;
  pphFinalRate: number;
  pphFinalAmount: number;
  ppnRate: number;
  ppnAmount: number;
  netReceivable: number;
  bupotNumber: string;
  ntpn: string;
  paymentStatus: string;
  remittedDate: string | null;
}

const initialConsortiums: Consortium[] = [
  {
    id: "kso-01",
    projectId: "prj-01",
    ksoCode: "KSO-IKN-PK3-2026",
    consortiumName: "KSO Adhi - Wijaya - Pembangunan Perumahan",
    projectTitle: "Paket Gedung Istana Kawasan Inti IKN",
    leadContractor: "PT Adhi Megah Konstruksi (Persero) Tbk",
    leadSharePercent: 60,
    leadSignatory: "Ir. Agus Wijaya, M.T. (Project Manager)",
    partnerContractor: "PT Wijaya Mandiri Kontraktor",
    partnerSharePercent: 40,
    partnerSignatory: "Bambang Haryanto, S.T. (Kuasa KSO)",
    jointBank: "Bank Mandiri (Persero) Tbk - Cabang Khusus BUMN",
    jointAccountNumber: "137-00-2026888-1",
    jointAccountName: "KSO ADHI WIJAYA PRJ IKN",
    contractValue: 142500000000,
    jointCashBalance: 18750000000,
    taxQualification: "BESAR",
    status: "ACTIVE",
    establishedDate: "2026-01-15",
    notes: "Akta Notaris No. 42/2026 Notaris Dr. Habibie, S.H., M.Kn. Pembagian risiko modal kerja 60:40 dual signatory.",
  },
  {
    id: "kso-02",
    projectId: "prj-01",
    ksoCode: "KSO-LRT-JABODETABEK-EXT",
    consortiumName: "KSO Adhi - Hutama - Nindya Karya",
    projectTitle: "Paket Jalur Layang & Stasiun LRT Extension Dukuh Atas",
    leadContractor: "PT Adhi Megah Konstruksi (Persero) Tbk",
    leadSharePercent: 55,
    leadSignatory: "Drs. Hendro Wibowo (PM Trackwork)",
    partnerContractor: "PT Hutama Karya Infrastruktur",
    partnerSharePercent: 45,
    partnerSignatory: "Ir. Faisal Akbar (Kuasa Mitra)",
    jointBank: "Bank BNI (Persero) Tbk - Cabang Dukuh Atas",
    jointAccountNumber: "089-22-2026999-5",
    jointAccountName: "KSO ADHI HUTAMA LRT JABODETABEK",
    contractValue: 88500000000,
    jointCashBalance: 11200000000,
    taxQualification: "BESAR",
    status: "ACTIVE",
    establishedDate: "2026-02-01",
    notes: "Konsorsium spesialis trackwork & viaduct elevation dengan sistem joint account pengawasan terpadu.",
  },
];

export default function JointOperationsPage() {
  const [activeTab, setActiveTab] = useState<"consortium" | "expenses" | "distributions" | "taxes">("consortium");
  const [summary, setSummary] = useState<KsoSummary | null>(null);
  const [consortiums, setConsortiums] = useState<Consortium[]>(initialConsortiums);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
  const [taxes, setTaxes] = useState<ConstructionTax[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showConsortiumModal, setShowConsortiumModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  // Form states
  const [consortiumForm, setConsortiumForm] = useState({
    ksoCode: "",
    consortiumName: "",
    leadContractor: "PT Adhi Megah Konstruksi (Persero) Tbk",
    leadSharePercent: 60,
    leadSignatory: "Ir. Agus Wijaya, M.T. (Project Manager)",
    partnerContractor: "",
    partnerSharePercent: 40,
    partnerSignatory: "",
    jointBank: "Bank Mandiri (Persero) Tbk",
    jointAccountNumber: "",
    jointAccountName: "",
    contractValue: 50000000000,
    jointCashBalance: 5000000000,
    taxQualification: "BESAR",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    ksoCode: "KSO-IKN-PK3-2026",
    title: "",
    category: "SITE_FACILITY",
    amount: 150000000,
    vendorName: "",
    invoiceRef: "",
    notes: "",
  });

  const [taxSimForm, setTaxSimForm] = useState({
    grossAmount: 10000000000,
    contractorQualification: "MENENGAH_BESAR",
    includePph23: false,
    equipmentRentPortion: 0,
    ppnRatePercent: 12,
  });

  const [taxSimResult, setTaxSimResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [sumRes, conRes, expRes, distRes, taxRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/joint-operations/summary").catch(() => null),
        fetch("http://localhost:4000/api/v1/joint-operations/consortiums").catch(() => null),
        fetch("http://localhost:4000/api/v1/joint-operations/expenses").catch(() => null),
        fetch("http://localhost:4000/api/v1/joint-operations/distributions").catch(() => null),
        fetch("http://localhost:4000/api/v1/joint-operations/taxes").catch(() => null),
      ]);

      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (conRes && conRes.ok) {
        const conData = await conRes.json();
        setConsortiums(conData);
      }
      if (expRes && expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }
      if (distRes && distRes.ok) {
        const distData = await distRes.json();
        setDistributions(distData);
      }
      if (taxRes && taxRes.ok) {
        const taxData = await taxRes.json();
        setTaxes(taxData);
      }
    } catch (err) {
      console.error("Gagal memuat data Joint Operation:", err);
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

  async function handleCreateConsortium(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/joint-operations/consortiums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consortiumForm),
      });
      if (res.ok) {
        const created = await res.json();
        setConsortiums([created, ...consortiums]);
        setShowConsortiumModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/joint-operations/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      if (res.ok) {
        const created = await res.json();
        setExpenses([created, ...expenses]);
        setShowExpenseModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSimulateTax(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/v1/joint-operations/taxes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taxSimForm),
      });
      if (res.ok) {
        const calcResult = await res.json();
        setTaxSimResult(calcResult);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApproveExpense(id: string, signatoryRole: "LEAD" | "PARTNER") {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/joint-operations/expenses/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatoryRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExpenses(expenses.map((e) => (e.id === id ? updated : e)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.expenseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Konsorsium KSO & Rekening Kas Bersama
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Tata kelola kemitraan Joint Operation, rekening bersama *dual-signatory*, alokasi beban bersama, dan pajak konstruksi (PP 9/2022).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            data-testid="open-tax-calculator-btn"
            onClick={() => {
              setShowTaxModal(true);
              setTaxSimResult(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-input bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4 text-purple-600" />
            <span>Kalkulator Pajak PP 9/2022</span>
          </button>

          <button
            data-testid="open-expense-modal-btn"
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Catat Beban Bersama</span>
          </button>

          <button
            data-testid="open-consortium-modal-btn"
            onClick={() => setShowConsortiumModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan KSO Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nilai Kontrak KSO */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kontrak KSO
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? formatRupiah(summary.totalContractValue) : "Rp 231.000.000.000"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                {summary ? summary.activeConsortiumCount : 2} Paket Konsorsium
              </span>
              <span>• Rasio 60:40</span>
            </div>
          </div>
        </div>

        {/* Card 2: Saldo Kas Bersama */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kas Rekening Bersama
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? formatRupiah(summary.jointCashBalance) : "Rp 29.950.000.000"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                Dual Signatory Aktif
              </span>
              <span>• Bank Mandiri</span>
            </div>
          </div>
        </div>

        {/* Card 3: Beban Bersama Terdistribusi */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Beban Bersama (Overhead)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? formatRupiah(summary.totalSharedExpenses) : "Rp 3.240.000.000"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                {expenses.length} Transaksi
              </span>
              <span>• Alokasi Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pajak Jasa Konstruksi */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pajak PPh 4(2) & PPN
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? formatRupiah(summary.totalTaxWithheld) : "Rp 12.525.750.000"}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-purple-600 font-semibold">
                Tarif 2.65% & 12%
              </span>
              <span>• Bupot Elektronik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 sm:gap-3 pb-px" role="tablist" aria-label="Tabs">
          <button
            data-testid="tab-consortium"
            onClick={() => setActiveTab("consortium")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "consortium"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Struktur Konsorsium</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary">
              {consortiums.length}
            </span>
          </button>

          <button
            data-testid="tab-expenses"
            onClick={() => setActiveTab("expenses")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "expenses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>Beban Bersama (Overhead)</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-600">
              {expenses.length}
            </span>
          </button>

          <button
            data-testid="tab-distributions"
            onClick={() => setActiveTab("distributions")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "distributions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Distribusi Laba KSO</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-600">
              {distributions.length}
            </span>
          </button>

          <button
            data-testid="tab-taxes"
            onClick={() => setActiveTab("taxes")}
            className={`py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === "taxes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BadgePercent className="w-4 h-4 shrink-0" />
            <span>Pajak Konstruksi (PP 9/2022)</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-purple-500/10 text-purple-600">
              PPh 4(2) & PPN
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: STRUKTUR KONSORSIUM KSO */}
      {activeTab === "consortium" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {consortiums.map((kso) => (
              <div
                key={kso.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary">{kso.ksoCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {kso.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mt-1">{kso.consortiumName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{kso.projectTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Nilai Kontrak KSO:</span>
                    <span className="font-mono font-bold text-foreground text-sm">{formatRupiah(kso.contractValue)}</span>
                  </div>
                </div>

                {/* Equity Ratio Segmented Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Lead: <strong className="text-blue-600">{kso.leadSharePercent}%</strong> ({kso.leadContractor})
                    </span>
                    <span className="font-medium text-foreground">
                      Mitra: <strong className="text-emerald-600">{kso.partnerSharePercent}%</strong> ({kso.partnerContractor})
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex">
                    <div
                      style={{ width: `${kso.leadSharePercent}%` }}
                      className="bg-blue-600 h-full transition-all duration-300"
                    />
                    <div
                      style={{ width: `${kso.partnerSharePercent}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Joint Bank Account Details */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Landmark className="w-4 h-4 text-primary" />
                      <span>Rekening Kas Bersama (Joint Account):</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">
                      Saldo: {formatRupiah(kso.jointCashBalance)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border">
                    <div>
                      <span className="text-muted-foreground block">Bank & No. Rekening:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {kso.jointBank} — {kso.jointAccountNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Nama Rekening:</span>
                      <span className="font-medium text-foreground">{kso.jointAccountName}</span>
                    </div>
                  </div>
                </div>

                {/* Dual Signatories Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Penandatangan Utama (Lead):</span>
                    </div>
                    <div className="font-bold text-foreground text-xs">{kso.leadSignatory}</div>
                    <span className="text-[10px] text-muted-foreground">Otorisasi Bilyet Giro / Pengeluaran KSO</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Penandatangan Mitra (Member):</span>
                    </div>
                    <div className="font-bold text-foreground text-xs">{kso.partnerSignatory}</div>
                    <span className="text-[10px] text-muted-foreground">Dual Otorisasi Pencairan Kas Bersama</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                  {kso.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BEBAN BIAYA BERSAMA (SHARED EXPENSES) */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                data-testid="search-expenses-input"
                type="text"
                placeholder="Cari uraian pengeluaran, nomor biaya, atau nama vendor..."
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
                <option value="ALL">Semua Kategori Beban</option>
                <option value="SITE_FACILITY">Site Facility & Basecamp</option>
                <option value="EQUIPMENT_MOB">Mobilisasi Alat Berat</option>
                <option value="SHARED_OVERHEAD">Shared Overhead Proyek</option>
                <option value="SAFETY_ENVIRONMENT">K3 & Lingkungan Hidup</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 text-xs sm:text-sm rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">Semua Status Otorisasi</option>
                <option value="APPROVED_DUAL">Disahkan (Dual Signatory)</option>
                <option value="PENDING_APPROVAL">Menunggu Otorisasi Mitra</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-[18%]">No. Bukti & Tanggal</th>
                  <th className="py-3 px-4 w-[32%]">Uraian Beban Bersama & Vendor</th>
                  <th className="py-3 px-4 w-[16%]">Total Nominal (Rp)</th>
                  <th className="py-3 px-4 w-[20%]">Alokasi Porsi (60:40)</th>
                  <th className="py-3 px-4 w-[14%] text-right">Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-primary">{exp.expenseCode}</span>
                      <div className="text-[11px] text-muted-foreground">{exp.expenseDate}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-muted font-mono">
                        {exp.invoiceRef}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground truncate">{exp.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        Vendor: {exp.vendorName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {formatRupiah(exp.amount)}
                      <div className="text-[10px] text-muted-foreground font-sans">{exp.category}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>
                        Lead (60%): <strong className="text-blue-600">{formatRupiah(exp.leadAllocationAmount)}</strong>
                      </div>
                      <div>
                        Mitra (40%): <strong className="text-emerald-600">{formatRupiah(exp.partnerAllocationAmount)}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exp.status === "APPROVED_DUAL" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dual Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveExpense(exp.id, "PARTNER")}
                          className="px-2.5 py-1 text-xs rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                          Sign Mitra
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{exp.expenseCode}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      exp.status === "APPROVED_DUAL"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {exp.status === "APPROVED_DUAL" ? "Dual Approved" : "Pending Signatory"}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{exp.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Vendor: {exp.vendorName}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Nominal:</span>
                    <span className="font-mono font-bold text-foreground">{formatRupiah(exp.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Porsi Lead (60%):</span>
                    <span className="font-mono text-blue-600 font-semibold">{formatRupiah(exp.leadAllocationAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Porsi Mitra (40%):</span>
                    <span className="font-mono text-emerald-600 font-semibold">{formatRupiah(exp.partnerAllocationAmount)}</span>
                  </div>
                </div>
                {exp.status !== "APPROVED_DUAL" && (
                  <button
                    onClick={() => handleApproveExpense(exp.id, "PARTNER")}
                    className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs"
                  >
                    Otorisasi Penandatangan Mitra
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISTRIBUSI LABA / DIVIDEN KSO */}
      {activeTab === "distributions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Rekapitulasi Distribusi Dividen Laba Bersih Konsorsium
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhitungan laba bersih setelah dikurangi seluruh beban bersama dan cadangan retensi, dibagikan sesuai porsi ekuitas (60:40).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {distributions.map((dist) => (
              <div key={dist.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{dist.ksoCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {dist.payoutStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{dist.periodLabel}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Tanggal Pembagian: <span className="font-medium text-foreground">{dist.distributionDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pendapatan Bruto:</span>
                    <span className="font-mono font-medium">{formatRupiah(dist.grossRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Total Beban Bersama:</span>
                    <span className="font-mono">-{formatRupiah(dist.totalSharedCost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-600">
                    <span>Cadangan Retensi (5%):</span>
                    <span className="font-mono">-{formatRupiah(dist.retentionReserve)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-1.5 border-t border-border">
                    <span className="text-foreground">Laba Bersih KSO:</span>
                    <span className="font-mono text-emerald-600">{formatRupiah(dist.netProfit)}</span>
                  </div>
                </div>

                {/* Split Breakdown */}
                <div className="pt-2 border-t border-border space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Dividen Lead (60%):</span>
                    <span className="font-mono font-bold text-blue-600">{formatRupiah(dist.leadDistributedProfit)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Dividen Mitra (40%):</span>
                    <span className="font-mono font-bold text-emerald-600">{formatRupiah(dist.partnerDistributedProfit)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground italic pt-1">
                  {dist.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAJAK JASA KONSTRUKSI (PP NO. 9/2022 & PPN) */}
      {activeTab === "taxes" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-purple-600" />
                Rekapitulasi Pajak Penghasilan (PPh Final 4(2)) & PPN Jasa Konstruksi
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengenaan pajak final berdasarkan PP No. 9 Tahun 2022 dan bukti potong elektronik resmi (*Bupot*).
              </p>
            </div>
            <button
              onClick={() => {
                setShowTaxModal(true);
                setTaxSimResult(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:bg-primary/90"
            >
              <Calculator className="w-4 h-4" />
              <span>Simulasi Pajak Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxes.map((tax) => (
              <div key={tax.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{tax.invoiceNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {tax.paymentStatus}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{tax.description}</h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Dasar Pengenaan Pajak (DPP): <span className="font-mono font-bold text-foreground">{formatRupiah(tax.grossInvoiceAmount)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-rose-600">
                    <span>PPh Final 4(2) ({tax.pphFinalRate}%):</span>
                    <span>-{formatRupiah(tax.pphFinalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-600">
                    <span>PPN Keluaran ({tax.ppnRate}%):</span>
                    <span>+{formatRupiah(tax.ppnAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-1.5 border-t border-border text-foreground">
                    <span>Penerimaan Kas Neto:</span>
                    <span className="text-emerald-600">{formatRupiah(tax.netReceivable)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] pt-1 border-t border-border">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>No. Bupot Elektronik:</span>
                    <span className="font-mono font-semibold text-foreground">{tax.bupotNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>NTPN / Validasi:</span>
                    <span className="font-mono text-foreground">{tax.ntpn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: DAFTARKAN KONSORSIUM KSO BARU */}
      {showConsortiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Registrasi Kemitraan Konsorsium KSO Baru
              </h3>
              <button onClick={() => setShowConsortiumModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConsortium} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kode KSO *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.ksoCode}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, ksoCode: e.target.value })}
                    placeholder="Contoh: KSO-MRT-FASE2-2026"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nama Konsorsium *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.consortiumName}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, consortiumName: e.target.value })}
                    placeholder="Contoh: KSO Adhi - Wijaya Paket 2"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kontraktor Mitra (Partner) *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.partnerContractor}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, partnerContractor: e.target.value })}
                    placeholder="Contoh: PT Hutama Karya Infrastruktur"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Kuasa KSO Mitra *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.partnerSignatory}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, partnerSignatory: e.target.value })}
                    placeholder="Nama perwakilan sah mitra"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Porsi Lead (%) *</label>
                  <input
                    type="number"
                    value={consortiumForm.leadSharePercent}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, leadSharePercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Porsi Mitra (%) *</label>
                  <input
                    type="number"
                    value={consortiumForm.partnerSharePercent}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, partnerSharePercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Bank Rekening Bersama *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.jointBank}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, jointBank: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Nomor Rekening Bersama *</label>
                  <input
                    type="text"
                    required
                    value={consortiumForm.jointAccountNumber}
                    onChange={(e) => setConsortiumForm({ ...consortiumForm, jointAccountNumber: e.target.value })}
                    placeholder="Contoh: 137-00-998877-2"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-muted/40 text-[11px] text-muted-foreground">
                Setiap transaksi penarikan dana rekening bersama di atas Rp 50.000.000 akan otomatis membutuhkan otorisasi ganda (*Dual Signatory*) dari kedua penandatangan.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowConsortiumModal(false)}
                  className="px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
                >
                  Simpan KSO Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT BEBAN BIAYA BERSAMA */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                Catat Pengeluaran Beban Bersama KSO
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Uraian / Judul Beban Bersama *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="Contoh: Sewa Generator Set 1000 kVA dan Solar Operasional Bulan Maret"
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kategori Pengeluaran *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  >
                    <option value="SITE_FACILITY">Site Facility & Basecamp</option>
                    <option value="EQUIPMENT_MOB">Mobilisasi Alat Berat</option>
                    <option value="SHARED_OVERHEAD">Shared Overhead Proyek</option>
                    <option value="SAFETY_ENVIRONMENT">K3 & Lingkungan Hidup</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Total Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Nama Vendor / Penyedia *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    placeholder="Contoh: PT Sarana Generator Perkasa"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">No. Invoice / Faktur Ref *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.invoiceRef}
                    onChange={(e) => setExpenseForm({ ...expenseForm, invoiceRef: e.target.value })}
                    placeholder="Contoh: INV-SGP-2026-092"
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-md bg-muted/40 space-y-1 text-[11px]">
                <div className="font-semibold text-foreground">Proyeksi Pembagian Beban (60:40):</div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Porsi Lead (60%):</span>
                  <span className="font-mono text-blue-600 font-bold">{formatRupiah((expenseForm.amount * 60) / 100)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Porsi Mitra (40%):</span>
                  <span className="font-mono text-emerald-600 font-bold">{formatRupiah((expenseForm.amount * 40) / 100)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm"
                >
                  Simpan Beban Bersama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KALKULATOR PAJAK PP NO. 9 TAHUN 2022 */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                Simulasi Pajak Jasa Konstruksi (PP No. 9/2022)
              </h3>
              <button onClick={() => setShowTaxModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateTax} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Nilai Tagihan Bruto (Rp) *</label>
                <input
                  type="number"
                  required
                  value={taxSimForm.grossAmount}
                  onChange={(e) => setTaxSimForm({ ...taxSimForm, grossAmount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Kualifikasi Penyedia Jasa *</label>
                  <select
                    value={taxSimForm.contractorQualification}
                    onChange={(e) => setTaxSimForm({ ...taxSimForm, contractorQualification: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background"
                  >
                    <option value="KECIL">Kecil (PPh Final 1.75%)</option>
                    <option value="MENENGAH_BESAR">Menengah & Besar (PPh Final 2.65%)</option>
                    <option value="SPESIALIS">Spesialis (PPh Final 2.65%)</option>
                    <option value="TIDAK_BERSERTIFIKAT">Tidak Bersertifikat (PPh Final 4.0%)</option>
                    <option value="KONSULTASI_KONSTRUKSI">Konsultan Pengawas / MK (3.5%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Tarif PPN Berlaku (%) *</label>
                  <select
                    value={taxSimForm.ppnRatePercent}
                    onChange={(e) => setTaxSimForm({ ...taxSimForm, ppnRatePercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-md border border-input bg-background font-mono"
                  >
                    <option value={12}>12% (Tarif Standar UU HPP)</option>
                    <option value={11}>11% (Tarif Transisi)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                Kalkulasi Pajak & Netto
              </button>

              {/* Simulation Result Box */}
              {taxSimResult && (
                <div className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 space-y-2 text-xs">
                  <div className="font-semibold text-purple-900 dark:text-purple-300">
                    Hasil Perhitungan Pajak Konstruksi Resmi:
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nilai DPP Bruto:</span>
                      <span className="font-bold text-foreground">{formatRupiah(taxSimResult.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>PPh Final 4(2) ({taxSimResult.pphFinal.ratePercent}%):</span>
                      <span>-{formatRupiah(taxSimResult.pphFinal.amount)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>PPN ({taxSimResult.ppn.ratePercent}%):</span>
                      <span>+{formatRupiah(taxSimResult.ppn.amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-purple-200 dark:border-purple-800 text-sm">
                      <span className="text-purple-900 dark:text-purple-200 font-sans">Net Tagihan Diterima:</span>
                      <span className="text-emerald-600">{formatRupiah(taxSimResult.netReceivableAmount)}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-1">
                    Dasar hukum: {taxSimResult.regulationBasis}.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  data-testid="close-tax-modal-btn"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-1.5 rounded-md border border-input hover:bg-muted font-medium text-xs text-foreground"
                >
                  Tutup Simulator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
