import React from "react";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  FileSpreadsheet,
  ArrowUpRight,
  Layers,
} from "lucide-react";

async function getBudgetData() {
  try {
    const [varRes, itemsRes] = await Promise.all([
      fetch("http://localhost:4000/api/v1/budgets/variance/PRJ-2026-LRT", { cache: "no-store" }),
      fetch("http://localhost:4000/api/v1/budgets/project/PRJ-2026-LRT", { cache: "no-store" }),
    ]);

    const varianceJson = varRes.ok ? await varRes.json() : null;
    const itemsJson = itemsRes.ok ? await itemsRes.json() : null;

    return {
      variance: varianceJson?.data || null,
      items: itemsJson?.data?.items || [],
    };
  } catch (e) {
    return { variance: null, items: [] };
  }
}

export default async function BudgetPage() {
  const data = await getBudgetData();

  const varianceData = data.variance || {
    projectName: "Pembangunan Stasiun LRT Dukuh Atas Hub",
    projectCode: "PRJ-2026-LRT",
    contractValue: 45000000000,
    totalBaseline: 39600000000,
    totalActual: 27143975000,
    totalVariance: 12456025000,
    burnRatePercentage: 68.5,
    progress: 68.4,
    categories: [
      { code: "MAT", name: "Biaya Bahan & Material", type: "MATERIAL", baseline: 16440000000, actual: 12165600000, variance: 4274400000, consumptionPercentage: 74.0, status: "WARNING" },
      { code: "LAB", name: "Biaya Upah & Mandor", type: "LABOR", baseline: 3707500000, actual: 2335725000, variance: 1371775000, consumptionPercentage: 63.0, status: "NORMAL" },
      { code: "EQP", name: "Biaya Sewa Alat Berat", type: "EQUIPMENT", baseline: 2820000000, actual: 1945800000, variance: 874200000, consumptionPercentage: 69.0, status: "NORMAL" },
      { code: "SUB", name: "Biaya Subkontraktor Spesialis", type: "SUBCON", baseline: 15000000000, actual: 9750000000, variance: 5250000000, consumptionPercentage: 65.0, status: "NORMAL" },
      { code: "OVH", name: "Biaya Overhead Lapangan & K3", type: "OVERHEAD", baseline: 1632500000, actual: 946850000, variance: 685650000, consumptionPercentage: 58.0, status: "NORMAL" },
    ],
  };

  const boqItems = data.items.length > 0 ? data.items : [
    { costCode: "MAT-01", category: "Biaya Bahan & Material", description: "Ready Mix Concrete K-350 Slump 12±2 (Pondasi & Pile Cap)", quantity: 2500, unit: "m3", unitPrice: 1150000, totalAmount: 2875000000 },
    { costCode: "MAT-02", category: "Biaya Bahan & Material", description: "Besi Beton Ulir BJTD-40 D16 & D25 SNI", quantity: 450000, unit: "kg", unitPrice: 14500, totalAmount: 6525000000 },
    { costCode: "MAT-03", category: "Biaya Bahan & Material", description: "Baja Profil WF 400x200 & Plat Buhul Grade SM490", quantity: 320000, unit: "kg", unitPrice: 22000, totalAmount: 7040000000 },
    { costCode: "LAB-01", category: "Biaya Upah & Mandor", description: "Mandor & Tukang Pembesian Terampil", quantity: 12000, unit: "OH", unitPrice: 185000, totalAmount: 2220000000 },
    { costCode: "SUB-01", category: "Biaya Subkontraktor Spesialis", description: "Subkon Pondasi Bored Pile Dia 800mm kedalaman 32m", quantity: 1, unit: "Lot", unitPrice: 9800000000, totalAmount: 9800000000 },
  ];

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2F6B9A] border border-blue-200">
              {varianceData.projectCode}
            </span>
            <span className="text-xs text-slate-500">• Baseline v1.0 (Approved)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Pengendalian Anggaran (RAB vs Realisasi)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {varianceData.projectName} — Analisis deviasi biaya konstruksi terintegrasi ke buku besar (GL).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Proyek
          </button>
          <button className="bg-[#2F6B9A] hover:bg-[#25567b] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Ekspor RAP (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nilai Kontrak Bruto</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {formatIDR(varianceData.contractValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Target Margin Bersih:</span>
            <span className="font-semibold text-emerald-600">12.0%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pagu Anggaran (RAP Baseline)</div>
          <div className="text-lg sm:text-xl font-bold text-[#17324D] mt-1">
            {formatIDR(varianceData.totalBaseline)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            88.0% dari nilai kontrak (Plafond biaya)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Realisasi Biaya Lapangan</div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 mt-1">
            {formatIDR(varianceData.totalActual)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Burn Rate: <strong>{varianceData.burnRatePercentage}%</strong></span>
            <span>Progres Fisik: <strong>{varianceData.progress}%</strong></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sisa Anggaran (Variance)</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">
            {formatIDR(varianceData.totalVariance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kondisi Cashflow Aman</span>
          </div>
        </div>
      </div>

      {/* Variance Alert Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Peringatan Deviasi Kategori Material (74.0% terpakai):</span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Konsumsi bahan dan pembesian mendekati ambang batas deviasi 75% akibat fluktuasi harga baja profile. Disarankan tinjau kuotasi subkon sebelum menerbitkan PO tambahan.
            </p>
          </div>
        </div>
        <button className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto transition-colors">
          Audit PO Material
        </button>
      </div>

      {/* Variance Breakdown by Cost Category */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Kalkulasi Deviasi per Kategori Biaya Konstruksi</h2>
            <p className="text-xs text-slate-400">Pemantauan real-time realisasi terhadap pagu baseline WBS</p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Standar Akuntansi Konstruksi Indonesia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kategori Biaya</th>
                <th className="py-3 px-4 text-right">Pagu Baseline (RAP)</th>
                <th className="py-3 px-4 text-right">Realisasi Lapangan</th>
                <th className="py-3 px-4 text-right">Sisa Anggaran</th>
                <th className="py-3 px-4">Konsumsi (%)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {varianceData.categories.map((cat: any) => (
                <tr key={cat.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{cat.name}</div>
                    <div className="text-[11px] text-slate-400">Kode Akun: {cat.code} • {cat.type}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{formatIDR(cat.baseline)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatIDR(cat.actual)}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600">{formatIDR(cat.variance)}</td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cat.consumptionPercentage > 100
                              ? "bg-rose-500"
                              : cat.consumptionPercentage > 70
                              ? "bg-amber-500"
                              : "bg-[#2F6B9A]"
                          }`}
                          style={{ width: `${Math.min(cat.consumptionPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold w-9 text-right text-slate-600">
                        {cat.consumptionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        cat.status === "WARNING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : cat.status === "OVERBUDGET"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill of Quantities (BoQ) Detail List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Rincian Item Pekerjaan & Material Utama (BoQ)</h2>
            <p className="text-xs text-slate-400">Daftar item volume dan harga satuan kontrak kerja</p>
          </div>
          <span className="text-xs text-[#2F6B9A] font-semibold cursor-pointer hover:underline flex items-center gap-1">
            Lihat Semua Item ({boqItems.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Deskripsi Item</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-right">Total Anggaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {boqItems.map((it: any) => (
                <tr key={it.costCode} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{it.costCode}</td>
                  <td className="py-3 px-4 max-w-xs">{it.description}</td>
                  <td className="py-3 px-4 text-slate-500">{it.category}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {it.quantity.toLocaleString("id-ID")} {it.unit}
                  </td>
                  <td className="py-3 px-4 text-right">{formatIDR(it.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatIDR(it.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

