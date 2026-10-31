import { Building2, Plus, Search, Calendar, ChevronRight } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      id: "PRJ-2026-001",
      name: "Pembangunan Gedung Menara 8 Office Tower",
      client: "PT Sentosa Graha Realty",
      branch: "Cabang Jakarta",
      pm: "Hendra Gunawan, ST",
      contractValue: "Rp 14.500.000.000",
      budgetBaseline: "Rp 12.800.000.000",
      actualCost: "Rp 8.950.000.000",
      startDate: "15 Jan 2026",
      endDate: "30 Nov 2026",
      progress: 78,
      status: "ACTIVE",
    },
    {
      id: "PRJ-2026-002",
      name: "Kompleks Residensial Emerald Blok A-D (45 Unit)",
      client: "PT Intiland Harmoni",
      branch: "Cabang Jakarta",
      pm: "Rudi Hartono, ST",
      contractValue: "Rp 8.200.000.000",
      budgetBaseline: "Rp 7.100.000.000",
      actualCost: "Rp 4.400.000.000",
      startDate: "01 Mar 2026",
      endDate: "15 Des 2026",
      progress: 62,
      status: "ACTIVE",
    },
    {
      id: "PRJ-2026-003",
      name: "Pembangunan Gudang Logistik Cikarang Dry Port",
      client: "PT Multi Logistik Global",
      branch: "Cabang Jakarta",
      pm: "Dedi Supriyadi, ST",
      contractValue: "Rp 5.000.000.000",
      budgetBaseline: "Rp 4.300.000.000",
      actualCost: "Rp 3.520.000.000",
      startDate: "10 Mei 2026",
      endDate: "20 Jan 2027",
      progress: 48,
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content-main tracking-tight">Daftar Proyek Konstruksi</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Kelola WBS, jadwal, pagu anggaran baseline, dan progres fisik seluruh proyek aktif.
          </p>
        </div>
        <button className="bg-action hover:bg-action-hover text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <Plus className="w-4 h-4" /> Daftarkan Proyek Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surface p-3 rounded-lg border border-border shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            placeholder="Cari kode proyek, nama, klien..."
            className="w-full text-xs bg-background border border-border rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-action"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="text-xs bg-background border border-border rounded-md px-3 py-1.5 text-content-main focus:outline-none flex-1 sm:flex-none">
            <option>Semua Status</option>
            <option>ACTIVE</option>
            <option>PLANNING</option>
            <option>COMPLETED</option>
          </select>
          <select className="text-xs bg-background border border-border rounded-md px-3 py-1.5 text-content-main focus:outline-none flex-1 sm:flex-none">
            <option>Semua Cabang</option>
            <option>Cabang Jakarta</option>
            <option>Cabang Surabaya</option>
          </select>
        </div>
      </div>

      {/* 1. Mobile & Tablet Card View (xl:hidden) */}
      <div className="xl:hidden space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="bg-surface rounded-lg border border-border p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] bg-surface-subtle text-action px-2 py-0.5 rounded font-semibold border border-border">
                  {p.id}
                </span>
                <h3 className="font-semibold text-content-main text-sm mt-1">{p.name}</h3>
                <div className="text-xs text-content-muted mt-0.5">{p.client} • PM: {p.pm}</div>
              </div>
              <span className="bg-status-successBg text-status-success font-semibold px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                {p.status}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-content-muted">Progres Fisik</span>
                <span className="font-mono font-bold text-action">{p.progress}%</span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="bg-action h-full rounded-full"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs font-mono">
              <div>
                <span className="text-[10px] text-content-muted block font-sans">Kontrak</span>
                <span className="font-semibold text-content-main">{p.contractValue}</span>
              </div>
              <div>
                <span className="text-[10px] text-content-muted block font-sans">Biaya Aktual</span>
                <span className="font-medium text-action">{p.actualCost}</span>
              </div>
            </div>

            {/* Card Action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-content-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {p.startDate} – {p.endDate}
              </span>
              <button className="px-3 py-1 bg-surface-subtle hover:bg-white border border-border rounded text-xs font-semibold text-action transition-colors flex items-center gap-1">
                Detail <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop Full Table View (hidden xl:block) */}
      <div className="hidden xl:block bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-subtle border-b border-border text-content-muted font-mono uppercase text-[11px]">
              <th className="py-3 px-4 font-semibold">Kode / Nama Proyek</th>
              <th className="py-3 px-4 font-semibold">Klien & PM</th>
              <th className="py-3 px-4 font-semibold">Nilai Kontrak</th>
              <th className="py-3 px-4 font-semibold">Baseline Anggaran</th>
              <th className="py-3 px-4 font-semibold">Biaya Aktual (HPP)</th>
              <th className="py-3 px-4 font-semibold">Progres Fisik</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-surface-subtle/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono text-action font-semibold">{p.id}</div>
                  <div className="font-semibold text-content-main mt-0.5">{p.name}</div>
                  <div className="text-[11px] text-content-muted flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {p.startDate} – {p.endDate}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-content-main">{p.client}</div>
                  <div className="text-content-muted mt-0.5">PM: {p.pm}</div>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-content-main">
                  {p.contractValue}
                </td>
                <td className="py-3 px-4 font-mono text-content-muted">
                  {p.budgetBaseline}
                </td>
                <td className="py-3 px-4 font-mono font-medium text-action">
                  {p.actualCost}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-surface-subtle h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-action h-full rounded-full"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-content-main">{p.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-status-successBg text-status-success font-semibold px-2 py-0.5 rounded text-[10px] font-mono">
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="px-2.5 py-1 bg-white hover:bg-surface-subtle border border-border rounded text-[11px] font-semibold text-action transition-colors inline-flex items-center gap-1">
                    Detail <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
