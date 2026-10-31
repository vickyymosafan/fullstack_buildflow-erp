import {
  TrendingUp,
  Building2,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function OverviewPage() {
  const kpis = [
    {
      label: "Proyek Aktif",
      value: "12",
      subtext: "+2 kuartal ini",
      icon: Building2,
      trend: "positive",
    },
    {
      label: "Nilai Kontrak Portofolio",
      value: "Rp 32,0 M",
      subtext: "12 proyek berjalan",
      icon: TrendingUp,
      trend: "positive",
    },
    {
      label: "Realisasi Anggaran (Cost)",
      value: "68%",
      subtext: "Terhadap baseline disetujui",
      icon: Receipt,
      trend: "neutral",
    },
    {
      label: "Outstanding Piutang (AR)",
      value: "Rp 2,5 M",
      subtext: "8 termin invoice pending",
      icon: AlertTriangle,
      trend: "warning",
    },
  ];

  const projects = [
    { name: "Pembangunan Menara 8 Office Tower", code: "PRJ-2026-001", progress: 78, budgetStatus: "Aman", budget: "Rp 14,5 M", actual: "Rp 11,2 M" },
    { name: "Kompleks Residensial Emerald Blok A", code: "PRJ-2026-002", progress: 62, budgetStatus: "Aman", budget: "Rp 8,2 M", actual: "Rp 5,1 M" },
    { name: "Gudang Logistik Cikarang Dry Port", code: "PRJ-2026-003", progress: 48, budgetStatus: "Waspada", budget: "Rp 5,0 M", actual: "Rp 4,1 M" },
    { name: "Renovasi Komersial Retail Mall Plaza", code: "PRJ-2026-004", progress: 91, budgetStatus: "Aman", budget: "Rp 2,8 M", actual: "Rp 2,5 M" },
    { name: "Pelebaran Jalan Akses Kawasan Industri", code: "PRJ-2026-005", progress: 35, budgetStatus: "Aman", budget: "Rp 1,5 M", actual: "Rp 0,5 M" },
  ];

  const pendingApprovals = [
    { id: "PO-2026-10-0042", title: "PO Pengadaan Beton ReadyMix K-350 (PT Semen Indonesia)", requester: "Site Eng. Bambang", amount: "Rp 420.000.000", time: "2 jam lalu" },
    { id: "CO-2026-08-0012", title: "Change Order Revisi Pondasi Bored Pile Menara 8", requester: "PM Hendra Gunawan", amount: "Rp 185.000.000", time: "5 jam lalu" },
    { id: "PAY-2026-10-0019", title: "Termin 2 Pembayaran Subkon Plumbing & Elektrikal", requester: "Finance Staff Sari", amount: "Rp 120.000.000", time: "1 hari lalu" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-main tracking-tight">Executive Overview</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Ringkasan konsolidasi portofolio proyek, realisasi biaya, dan antrean persetujuan operasional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-content-muted font-mono bg-white px-2.5 py-1 rounded border border-border">
            Periode: Oktober 2026
          </span>
          <button className="bg-action hover:bg-action-hover text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition-colors">
            Unduh Laporan Portofolio
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-surface rounded-lg p-5 border border-border shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-content-muted">{kpi.label}</span>
                <div className="w-8 h-8 rounded bg-surface-subtle flex items-center justify-center text-action">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-content-main font-mono">{kpi.value}</div>
                <div className="text-[11px] text-content-muted mt-1">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Projects Status & Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Progress Tracking */}
        <div className="lg:col-span-2 bg-surface rounded-lg border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-content-main">Kesehatan & Progres Proyek Utama</h2>
              <p className="text-xs text-content-muted">Realisasi jadwal fisik vs pagu anggaran baseline</p>
            </div>
            <a href="/projects" className="text-xs font-semibold text-action hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4">
            {projects.map((p, idx) => (
              <div key={idx} className="p-3 rounded-md border border-border/80 hover:bg-surface-subtle/50 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="font-semibold text-content-main flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-surface-subtle text-action px-1.5 py-0.5 rounded border border-border">
                      {p.code}
                    </span>
                    {p.name}
                  </div>
                  <span className="font-mono font-bold text-action">{p.progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-action h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-content-muted mt-2 font-mono">
                  <span>Anggaran: {p.budget}</span>
                  <span>Aktual: {p.actual}</span>
                  <span className={`font-sans font-medium px-1.5 py-0.5 rounded text-[10px] ${
                    p.budgetStatus === 'Aman' ? 'bg-status-successBg text-status-success' : 'bg-status-warningBg text-status-warning'
                  }`}>
                    {p.budgetStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Urgent Approvals Queue */}
        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-content-main">Antrean Persetujuan (Approval)</h2>
              <p className="text-xs text-content-muted">Transaksi bernilai tinggi butuh otorisasi</p>
            </div>
            <span className="w-5 h-5 rounded-full bg-status-danger text-white text-[10px] font-bold flex items-center justify-center font-mono">
              3
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {pendingApprovals.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md bg-surface-subtle/70 border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary text-[11px]">{item.id}</span>
                  <span className="text-[10px] text-content-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </span>
                </div>
                <div className="font-medium text-content-main leading-snug">{item.title}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-bold text-action">{item.amount}</span>
                  <span className="text-[10px] text-content-muted">{item.requester}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-action hover:bg-action-hover text-white py-1 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Setujui
                  </button>
                  <button className="px-2.5 py-1 bg-white border border-border rounded text-[11px] text-content-muted hover:text-content-main">
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

