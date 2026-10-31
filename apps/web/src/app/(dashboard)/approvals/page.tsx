"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  ChevronRight,
  Filter,
} from "lucide-react";

interface PendingApproval {
  id: string;
  itemType: "PURCHASE_ORDER" | "SITE_REPORT" | "BUDGET_REVISION";
  title: string;
  projectCode: string;
  projectName: string;
  amount?: number;
  submittedBy: string;
  submittedAt: string;
  requiredRole: string;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
  status: "PENDING";
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<PendingApproval[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, [selectedRole]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const url =
        selectedRole === "ALL"
          ? "http://localhost:4000/api/v1/approvals/pending"
          : `http://localhost:4000/api/v1/approvals/pending?role=${selectedRole}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (itemId: string, itemType: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/approvals/action?role=DIRECTOR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          action,
          notes: `${action === "APPROVE" ? "Disetujui" : "Ditolak"} via Portal Eksekutif BuildFlow`,
        }),
      });

      if (res.ok) {
        setActionFeedback(`Dokumen ${itemId} berhasil diproses (${action}) dan dicatat di buku audit.`);
        fetchPending();
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (e) {
      alert("Gagal memproses approval");
    }
  };

  const formatIDR = (val?: number) => (val ? `Rp ${val.toLocaleString("id-ID")}` : "-");

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#2F6B9A]" /> Antrean Persetujuan & SoD (Approval Inbox)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Otorisasi berjenjang pengadaan material, laporan kemajuan opname, dan revisi pagu anggaran proyek.
          </p>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto text-xs">
          {[
            { id: "ALL", label: "Semua Wewenang" },
            { id: "DIRECTOR", label: "Direksi (Eksekutif)" },
            { id: "PROJECT_MANAGER", label: "Project Manager" },
            { id: "FINANCE_MANAGER", label: "Finance & Accounting" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                selectedRole === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Approval List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Memuat antrean persetujuan...</div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Semua Persetujuan Selesai</h3>
            <p className="text-xs text-slate-400">Tidak ada dokumen tertunda yang membutuhkan wewenang Anda.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#17324D] border border-blue-200">
                    {item.itemType}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-700">{item.id}</span>
                  <span className="text-[10px] text-slate-400">• Proyek: {item.projectCode}</span>
                  {item.priority === "HIGH" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Prioritas Tinggi
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Diajukan oleh: <strong className="text-slate-700">{item.submittedBy}</strong></span>
                  {item.amount && (
                    <span className="text-emerald-700 font-semibold">
                      Nilai: {formatIDR(item.amount)}
                    </span>
                  )}
                  <span className="text-slate-400">
                    Wewenang: <span className="font-semibold text-indigo-700">{item.requiredRole}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleAction(item.id, item.itemType, "REJECT")}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Tolak
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(item.id, item.itemType, "APPROVE")}
                  className="px-4 py-2 bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Setujui
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Segregation of Duties Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2F6B9A]" /> Tata Kelola Segregation of Duties (SoD Matrix)
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sesuai Blueprint Bab 2: Setiap persetujuan transaksi di atas Rp 100.000.000 wajib melibatkan verifikasi Direksi Eksekutif. Pengaju dokumen (Maker) secara sistem diblokir dari melakukan persetujuan atas dokumen yang dibuatnya sendiri (Anti-self approval).
        </p>
      </div>
    </div>
  );
}

