"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Package,
  Search,
  Filter,
  X,
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectCode: string;
  projectName: string;
  vendorCode: string;
  vendorName: string;
  totalAmount: number;
  status: string;
  goodsReceiptCount: number;
  createdAt: string;
}

interface Vendor {
  id: string;
  code: string;
  name: string;
  bankName?: string;
  bankAccount?: string;
}

export default function ProcurementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New PO form state
  const [poNumber, setPoNumber] = useState(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [projectCode, setProjectCode] = useState("PRJ-2026-LRT");
  const [vendorCode, setVendorCode] = useState("VND-001");
  const [totalAmount, setTotalAmount] = useState(125000000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, vendorsRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/procurement/orders"),
        fetch("http://localhost:4000/api/v1/procurement/vendors"),
      ]);

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        setOrders(json.data || []);
      }
      if (vendorsRes.ok) {
        const json = await vendorsRes.json();
        setVendors(json.data || []);
      }
    } catch (e) {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/procurement/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poNumber,
          projectCode,
          vendorCode,
          totalAmount: Number(totalAmount),
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Purchase Order ${poNumber} berhasil diterbitkan dan masuk antrean approval!`);
        setShowModal(false);
        setPoNumber(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
        loadData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      alert("Gagal menerbitkan PO");
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const totalCommitment = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const approvedCount = orders.filter((o) => o.status === "APPROVED").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#2F6B9A]" /> Pengadaan & Purchase Order (Procurement)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan PO material, kuotasi rekanan vendor, dan verifikasi komitmen biaya proyek.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Terbitkan PO Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Komitmen PO</div>
          <div className="text-lg sm:text-xl font-bold text-[#17324D] mt-1">{formatIDR(totalCommitment)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Tercatat di akun Utang Usaha (AP)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PO Disetujui (Approved)</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">{approvedCount} Dokumen</div>
          <div className="text-[11px] text-slate-400 mt-1">Siap dikirim vendor & proses surat jalan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menunggu Persetujuan</div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 mt-1">{pendingCount} Dokumen</div>
          <div className="text-[11px] text-slate-400 mt-1">Dalam antrean verifikasi SoD Direksi</div>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Purchase Order Aktif</h2>
            <p className="text-xs text-slate-400">Sinkronisasi langsung dengan buku besar akuntansi & gudang</p>
          </div>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            {orders.length} Dokumen PO
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nomor PO</th>
                <th className="py-3 px-4">Vendor Rekanan</th>
                <th className="py-3 px-4">Alokasi Proyek</th>
                <th className="py-3 px-4 text-right">Nilai Bruto</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Surat Jalan (GR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Memuat data Purchase Order...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Belum ada Purchase Order</td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{po.vendorName}</div>
                      <div className="text-[10px] text-slate-400">Kode: {po.vendorCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium">{po.projectName}</span>
                      <div className="text-[10px] text-slate-400">{po.projectCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatIDR(po.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : po.status === "PENDING_APPROVAL"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#17324D] border border-blue-200">
                        {po.goodsReceiptCount} Penerimaan
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400">Memuat data Purchase Order...</div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">Belum ada Purchase Order</div>
          ) : (
            orders.map((po) => (
              <div key={po.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{po.poNumber}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      po.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : po.status === "PENDING_APPROVAL"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">{po.vendorName}</div>
                <div className="text-[11px] text-slate-500">{po.projectName}</div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                  <span className="text-slate-500 font-medium">Nilai Bruto:</span>
                  <span className="font-bold text-slate-900">{formatIDR(po.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Surat Jalan:</span>
                  <span className="font-semibold text-[#17324D]">{po.goodsReceiptCount} Penerimaan</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Terbitkan PO Baru */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#2F6B9A]" /> Terbitkan Purchase Order Baru
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor PO</label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proyek Konstruksi</label>
                <select
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="PRJ-2026-LRT">PRJ-2026-LRT — Stasiun LRT Dukuh Atas</option>
                  <option value="PRJ-2026-TOL">PRJ-2026-TOL — Tol Patimban Seksi 2</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Rekanan Vendor</label>
                <select
                  value={vendorCode}
                  onChange={(e) => setVendorCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {vendors.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name} ({v.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai Total PO (IDR)</label>
                <input
                  type="number"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2F6B9A] hover:bg-[#25567b] text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Simpan PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
