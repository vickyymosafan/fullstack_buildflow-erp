"use client";

import { useState, useEffect } from "react";
import {
  Boxes,
  Package,
  Plus,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Truck,
  RotateCcw,
  X,
} from "lucide-react";

interface WarehouseItem {
  id: string;
  warehouseCode: string;
  name: string;
  location?: string;
}

interface StockItem {
  id: string;
  productCode: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  currentStock: number;
  status: "AVAILABLE" | "LOW_STOCK";
}

interface StockMovement {
  id: string;
  productCode: string;
  productName: string;
  warehouseCode: string;
  warehouseName: string;
  movementType: "IN_PURCHASE" | "OUT_PROJECT_ISSUE" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  createdById?: string;
  transactionDate: string;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "ledger">("stock");
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Goods Receipt
  const [receiptNumber, setReceiptNumber] = useState(
    `GR-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [poNumber, setPoNumber] = useState("PO-2026-088");
  const [targetWarehouse, setTargetWarehouse] = useState("WH-SITE-LRT");
  const [productCode, setProductCode] = useState("PRD-MAT-001");
  const [quantity, setQuantity] = useState<number>(200);
  const [unitCost, setUnitCost] = useState<number>(75000);

  useEffect(() => {
    loadData();
  }, [selectedWarehouse]);

  const loadData = async () => {
    setLoading(true);
    try {
      const whUrl = "http://localhost:4000/api/v1/inventory/warehouses";
      const stockUrl =
        selectedWarehouse === "ALL"
          ? "http://localhost:4000/api/v1/inventory/stock"
          : `http://localhost:4000/api/v1/inventory/stock?warehouseCode=${selectedWarehouse}`;
      const moveUrl = "http://localhost:4000/api/v1/inventory/movements?limit=30";

      const [whRes, stockRes, moveRes] = await Promise.all([
        fetch(whUrl),
        fetch(stockUrl),
        fetch(moveUrl),
      ]);

      if (whRes.ok) {
        const json = await whRes.json();
        setWarehouses(json.data || []);
      }
      if (stockRes.ok) {
        const json = await stockRes.json();
        setStockList(json.data || []);
      }
      if (moveRes.ok) {
        const json = await moveRes.json();
        setMovements(json.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat data inventaris:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoodsReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/inventory/goods-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptNumber,
          poNumber,
          warehouseCode: targetWarehouse,
          productCode,
          quantity: Number(quantity),
          unitCost: Number(unitCost),
        }),
      });

      if (res.ok) {
        setSuccessMsg(
          `Penerimaan barang ${receiptNumber} berhasil diproses. Stok fisik telah diperbarui dan tercatat di buku besar mutasi.`
        );
        setShowModal(false);
        setReceiptNumber(`GR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        await loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errJson = await res.json();
        alert(`Gagal memproses penerimaan: ${errJson.message || "Periksa data input"}`);
      }
    } catch (e) {
      alert("Terjadi kendala jaringan saat memproses penerimaan barang");
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // Filtered Stock
  const filteredStock = stockList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = stockList.filter((s) => s.status === "LOW_STOCK").length;
  const totalPhysicalUnits = stockList.reduce((acc, s) => acc + s.currentStock, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#2F6B9A]" /> Gudang & Inventaris (Supply Chain)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring saldo stok material fisik, batas aman minimum, dan buku besar mutasi logistik proyek.
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
            <Plus className="w-4 h-4" /> Catat Penerimaan Barang (GR)
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

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total SKU Material
            </span>
            <Package className="w-4 h-4 text-[#2F6B9A]" />
          </div>
          <div className="text-2xl font-bold text-[#17324D] mt-1">{stockList.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Master katalog aktif</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Unit Fisik
            </span>
            <Warehouse className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {totalPhysicalUnits.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh gudang</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Peringatan Stok Rendah
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{lowStockCount}</div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">
            {lowStockCount > 0 ? "Perlu restock segera" : "Semua di atas batas aman"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Transaksi Mutasi
            </span>
            <Truck className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{movements.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Catatan buku besar terlacak</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("stock")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "stock"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Saldo Fisik (Stock on Hand)
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === "ledger"
                ? "bg-[#2F6B9A] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Buku Besar Mutasi (Ledger)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[240px] sm:max-w-xs">
            <Warehouse className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
            >
              <option value="ALL">Semua Gudang</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.warehouseCode}>
                  {wh.warehouseCode} - {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          {activeTab === "stock" && (
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] w-full sm:w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Memuat data mutasi dan saldo inventaris...
        </div>
      ) : activeTab === "stock" ? (
        /* TAB 1: Stock on Hand */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode SKU</th>
                  <th className="py-3 px-4">Nama Material & Kategori</th>
                  <th className="py-3 px-4 text-center">Satuan</th>
                  <th className="py-3 px-4 text-right">Batas Min (Min Stock)</th>
                  <th className="py-3 px-4 text-right">Saldo Fisik Tersedia</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada material yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {item.productCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.category}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {item.minStock.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {item.currentStock.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === "LOW_STOCK" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" /> STOK KRITIS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AMAN (TERSEDIA)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setProductCode(item.productCode);
                            setShowModal(true);
                          }}
                          className="text-[11px] text-[#2F6B9A] hover:underline font-semibold"
                        >
                          + Catat Masuk
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {filteredStock.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada material yang cocok dengan filter.
              </div>
            ) : (
              filteredStock.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{item.productCode}</span>
                    {item.status === "LOW_STOCK" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-500" /> STOK KRITIS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> TERSEDIA
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-400">{item.category} • Satuan: {item.unit}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                    <span className="text-slate-500">Saldo Fisik:</span>
                    <span className="font-bold text-slate-900">{item.currentStock.toLocaleString("id-ID")} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Batas Min: {item.minStock.toLocaleString("id-ID")} {item.unit}</span>
                    <button
                      onClick={() => {
                        setProductCode(item.productCode);
                        setShowModal(true);
                      }}
                      className="text-[#2F6B9A] font-semibold hover:underline"
                    >
                      + Catat Masuk
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: Immutable Stock Movement Ledger */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">
              Buku Besar Mutasi Fisik (Immutable Audit Ledger)
            </div>
            <div className="text-[11px] text-slate-400">
              Menampilkan {movements.length} transaksi terakhir
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4">Kode & Nama Material</th>
                  <th className="py-3 px-4">Lokasi Gudang</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4">Dokumen Referensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada catatan mutasi stok tercatat.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isIncoming = m.quantity > 0 || m.movementType === "IN_PURCHASE";
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(m.transactionDate).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {isIncoming ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> MASUK (IN)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight className="w-3 h-3 text-rose-600" /> KELUAR (OUT)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{m.productName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {m.productCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {m.warehouseCode}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            isIncoming ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {isIncoming ? `+${m.quantity}` : `${m.quantity}`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {formatIDR(m.unitCost)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {m.referenceId || m.referenceType || "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {movements.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada catatan mutasi stok tercatat.
              </div>
            ) : (
              movements.map((m) => {
                const isIncoming = m.quantity > 0 || m.movementType === "IN_PURCHASE";
                return (
                  <div key={m.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(m.transactionDate).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      {isIncoming ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> MASUK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" /> KELUAR
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-800">{m.productName}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Gudang: {m.warehouseCode}</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{m.referenceId || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                      <span className="text-slate-500">Kuantitas:</span>
                      <span className={`font-mono font-bold ${isIncoming ? "text-emerald-700" : "text-rose-700"}`}>
                        {isIncoming ? `+${m.quantity}` : `${m.quantity}`} ({formatIDR(m.unitCost)})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Catat Surat Jalan / Penerimaan Barang (Goods Receipt) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2F6B9A]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Registrasi Surat Penerimaan Barang (GR)
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoodsReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Surat Penerimaan Barang (GR No)
                </label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Purchase Order (PO)
                  </label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="Contoh: PO-2026-088"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gudang Penerima
                  </label>
                  <select
                    value={targetWarehouse}
                    onChange={(e) => setTargetWarehouse(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                  >
                    {warehouses.length > 0 ? (
                      warehouses.map((w) => (
                        <option key={w.id} value={w.warehouseCode}>
                          {w.warehouseCode} - {w.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="WH-SITE-LRT">WH-SITE-LRT (Site Proyek Depo LRT)</option>
                        <option value="WH-JKT-01">WH-JKT-01 (Gudang Logistik Cakung)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Yang Diterima
                </label>
                <select
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A]"
                >
                  <option value="PRD-MAT-001">PRD-MAT-001 - Semen Portland Tipe I (50kg)</option>
                  <option value="PRD-MAT-002">PRD-MAT-002 - Besi Beton Ulir D16 (12m)</option>
                  <option value="PRD-MAT-003">PRD-MAT-003 - Ready Mix Concrete K-350</option>
                  <option value="PRD-MAT-004">PRD-MAT-004 - Pasir Pasang Super (m3)</option>
                  <option value="PRD-MAT-005">PRD-MAT-005 - Batu Split 1/2 (m3)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume Kuantitas Diterima
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Satuan (IDR)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F6B9A] font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                <span className="font-semibold">Catatan Verifikasi 3-Way Matching:</span>
                <p className="mt-0.5">
                  Penerimaan fisik akan langsung menambah kuantitas di buku besar mutasi stok dan
                  menyesuaikan progress penerimaan Purchase Order bersangkutan.
                </p>
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
                  {submitting ? "Memverifikasi..." : "Verifikasi & Simpan ke Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
