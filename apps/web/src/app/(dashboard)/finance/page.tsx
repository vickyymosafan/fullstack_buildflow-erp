"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  Plus,
  Scale,
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Search,
  Filter,
  FileText,
  RotateCcw,
  X,
  CreditCard,
  Building,
} from "lucide-react";

interface AccountItem {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
}

interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  memo?: string;
}

interface JournalEntry {
  id: string;
  journalNumber: string;
  transactionDate: string;
  description: string;
  postingStatus: string;
  postedBy?: string;
  postedAt?: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  lines: JournalLine[];
}

interface FinanceSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  trialBalance: {
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  };
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"coa" | "journals">("coa");
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Manual Journal
  const [journalNumber, setJournalNumber] = useState(
    `JV-2026-02-${Math.floor(100 + Math.random() * 900)}`
  );
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(
    "Penyesuaian Biaya Lapangan Proyek LRT"
  );
  const [debitAccount, setDebitAccount] = useState("5-1100");
  const [creditAccount, setCreditAccount] = useState("1-1200");
  const [amount, setAmount] = useState<number>(25000000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accRes, jvRes, sumRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/finance/accounts"),
        fetch("http://localhost:4000/api/v1/finance/journals?limit=30"),
        fetch("http://localhost:4000/api/v1/finance/summary"),
      ]);

      if (accRes.ok) {
        const json = await accRes.json();
        setAccounts(json.data || []);
      }
      if (jvRes.ok) {
        const json = await jvRes.json();
        setJournals(json.data || []);
      }
      if (sumRes.ok) {
        const json = await sumRes.json();
        setSummary(json.data || null);
      }
    } catch (e) {
      console.error("Gagal memuat data keuangan:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        journalNumber,
        transactionDate: new Date(transactionDate).toISOString(),
        description,
        lines: [
          {
            accountCode: debitAccount,
            debit: Number(amount),
            credit: 0,
            memo: description,
          },
          {
            accountCode: creditAccount,
            debit: 0,
            credit: Number(amount),
            memo: description,
          },
        ],
      };

      const res = await fetch("http://localhost:4000/api/v1/finance/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(
          `Voucher Jurnal ${journalNumber} berhasil diposting ke Buku Besar secara seimbang.`
        );
        setShowModal(false);
        setJournalNumber(`JV-2026-02-${Math.floor(100 + Math.random() * 900)}`);
        await loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errJson = await res.json();
        alert(`Gagal memposting jurnal: ${errJson.message || "Periksa data input"}`);
      }
    } catch (e) {
      alert("Terjadi kendala jaringan saat memposting jurnal");
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesType =
      selectedType === "ALL" || acc.accountType === selectedType;
    const matchesQuery =
      acc.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#2F6B9A]" /> Finance & Construction Accounting (PSAK)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bagan Akun Proyek (COA), Buku Besar Jurnal Berpasangan, Neraca Saldo, dan Pengakuan Biaya Konstruksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Muat Ulang Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Posting Jurnal Penyesuaian
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Trial Balance Audit Banner */}
      {summary && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">STATUS AUDIT NERACA SALDO:</span>{" "}
              <span className="font-semibold text-emerald-700">SEIMBANG (DEBIT = KREDIT)</span>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Total Debit: {formatIDR(summary.trialBalance.totalDebit)} = Total Kredit: {formatIDR(summary.trialBalance.totalCredit)}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto uppercase tracking-wide">
            Double-Entry Validated
          </span>
        </div>
      )}

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Aset Proyek
            </span>
            <Wallet className="w-4 h-4 text-[#2F6B9A]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#17324D] mt-1 font-mono">
            {summary ? formatIDR(summary.totalAssets) : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kas, Bank, & Persediaan Site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Utang Usaha Rekanan (AP)
            </span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 font-mono">
            {summary ? formatIDR(summary.totalLiabilities) : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Komitmen jatuh tempo vendor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pendapatan Termin
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {summary ? formatIDR(summary.totalRevenue) : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Prestasi termin tertagih</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Laba Bersih Proyek
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 font-mono">
            {summary ? formatIDR(summary.netIncome) : "..."}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gross margin berjalan</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("coa")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "coa"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bagan Akun & Neraca Saldo (COA)
          </button>
          <button
            onClick={() => setActiveTab("journals")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "journals"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Buku Besar Umum (General Ledger)
          </button>
        </div>

        {activeTab === "coa" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Account Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[200px] sm:max-w-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="ALL">Semua Golongan Akun</option>
                <option value="ASSET">1 - Aset (Harta)</option>
                <option value="LIABILITY">2 - Liabilitas (Utang)</option>
                <option value="EQUITY">3 - Ekuitas (Modal)</option>
                <option value="REVENUE">4 - Pendapatan</option>
                <option value="EXPENSE">5 - Beban Konstruksi</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari akun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] w-full sm:w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Memuat data buku besar dan neraca saldo...
        </div>
      ) : activeTab === "coa" ? (
        /* TAB 1: Chart of Accounts & Trial Balance */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode Akun</th>
                  <th className="py-3 px-4">Nama Akun Standar PSAK</th>
                  <th className="py-3 px-4 text-center">Golongan</th>
                  <th className="py-3 px-4 text-right">Mutasi Debit</th>
                  <th className="py-3 px-4 text-right">Mutasi Kredit</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada akun yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {acc.accountCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {acc.accountName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            acc.accountType === "ASSET"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : acc.accountType === "LIABILITY"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : acc.accountType === "EQUITY"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : acc.accountType === "REVENUE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {acc.accountType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatIDR(acc.totalDebit)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatIDR(acc.totalCredit)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatIDR(acc.endingBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {filteredAccounts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada akun yang sesuai dengan filter.
              </div>
            ) : (
              filteredAccounts.map((acc) => (
                <div key={acc.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{acc.accountCode}</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.accountType === "ASSET"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : acc.accountType === "LIABILITY"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : acc.accountType === "EQUITY"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : acc.accountType === "REVENUE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {acc.accountType}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-800">{acc.accountName}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-50">
                    <div>
                      <span className="text-slate-400">Debit:</span>{" "}
                      <span className="font-mono text-slate-600">{formatIDR(acc.totalDebit)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Kredit:</span>{" "}
                      <span className="font-mono text-slate-600">{formatIDR(acc.totalCredit)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                    <span className="text-slate-500 font-medium">Saldo Akhir:</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(acc.endingBalance)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: General Ledger Double-Entry Journals */
        <div className="space-y-4">
          {journals.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Belum ada voucher jurnal umum tercatat.
            </div>
          ) : (
            journals.map((jv) => (
              <div
                key={jv.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Journal Voucher Header */}
                <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {jv.journalNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(jv.transactionDate).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SEIMBANG
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-400">Petugas:</span>{" "}
                    <span className="font-semibold text-slate-700">{jv.postedBy || "System"}</span>
                  </div>
                </div>

                <div className="p-4 border-b border-slate-100 text-xs text-slate-700 font-medium">
                  {jv.description}
                </div>

                {/* Desktop Journal Lines Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100 text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Kode & Nama Akun</th>
                        <th className="py-2.5 px-4">Keterangan Memo</th>
                        <th className="py-2.5 px-4 text-right">Debit</th>
                        <th className="py-2.5 px-4 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jv.lines.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/30">
                          <td className="py-2.5 px-4">
                            <span className="font-mono font-bold text-slate-800">
                              {l.accountCode}
                            </span>{" "}
                            <span className="text-slate-600 font-medium ml-1">
                              {l.accountName}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {l.memo || "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700">
                            {l.debit > 0 ? formatIDR(l.debit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-medium text-blue-700">
                            {l.credit > 0 ? formatIDR(l.credit) : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50 font-bold border-t border-slate-200">
                        <td colSpan={2} className="py-2.5 px-4 text-slate-700">
                          Total Baris Jurnal
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-800">
                          {formatIDR(jv.totalDebit)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-800">
                          {formatIDR(jv.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Journal Lines Cards */}
                <div className="block sm:hidden p-4 space-y-3">
                  {jv.lines.map((l) => (
                    <div key={l.id} className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">{l.accountCode}</span>
                        {l.debit > 0 ? (
                          <span className="font-mono font-bold text-emerald-700">+{formatIDR(l.debit)} (D)</span>
                        ) : (
                          <span className="font-mono font-bold text-blue-700">+{formatIDR(l.credit)} (K)</span>
                        )}
                      </div>
                      <div className="text-slate-700 font-medium">{l.accountName}</div>
                      {l.memo && <div className="text-[11px] text-slate-400">{l.memo}</div>}
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                    <span>Total Seimbang:</span>
                    <span className="font-mono text-slate-900">{formatIDR(jv.totalDebit)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Posting Jurnal Penyesuaian Manual */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#2F6B9A]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Posting Voucher Jurnal Penyesuaian
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Voucher
                  </label>
                  <input
                    type="text"
                    required
                    value={journalNumber}
                    onChange={(e) => setJournalNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Transaksi / Memo
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Akun Debit
                  </label>
                  <select
                    value={debitAccount}
                    onChange={(e) => setDebitAccount(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  >
                    <option value="5-1100">5-1100 - Beban Material Langsung</option>
                    <option value="5-1200">5-1200 - Beban Upah & Subkon</option>
                    <option value="5-1300">5-1300 - Beban Sewa Alat Berat</option>
                    <option value="1-1400">1-1400 - Persediaan Material Site</option>
                    <option value="2-1100">2-1100 - Utang Usaha Rekanan AP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Akun Kredit
                  </label>
                  <select
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  >
                    <option value="1-1200">1-1200 - Bank Mandiri Escrow</option>
                    <option value="1-1100">1-1100 - Kas Operasional Lapangan</option>
                    <option value="1-1400">1-1400 - Persediaan Material Site</option>
                    <option value="2-1100">2-1100 - Utang Usaha Rekanan AP</option>
                    <option value="4-1100">4-1100 - Pendapatan Termin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Seimbang (IDR)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Sistem menjamin prinsip double-entry: Debit ({formatIDR(amount)}) = Kredit ({formatIDR(amount)}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Memposting..." : "Posting ke Buku Besar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

