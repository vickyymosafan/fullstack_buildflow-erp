"use client";

import React, { useState } from "react";
import {
  DatabaseZap,
  Server,
  HardDriveDownload,
  Layers,
  Gauge,
  Lock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Archive,
  Plus,
  X,
  Play,
  Trash2,
  Clock,
  Award,
} from "lucide-react";

type TabType = "TOPOLOGY" | "PARTITIONS" | "CACHE" | "PITR" | "DRILLS";

interface Replica {
  id: string;
  name: string;
  role: string;
  location: string;
  lagMs: number;
  lagBytes: number;
  connections: number;
}

interface Partition {
  id: string;
  tenant: string;
  year: number;
  schema: string;
  tables: number;
  rows: number;
  size: string;
  status: "active" | "archived_cold";
}

interface Drill {
  id: string;
  code: string;
  title: string;
  duration: string;
  rpo: number;
  rto: number;
  certified: boolean;
  auditor?: string;
}

const RPO_TARGET = 300;
const RTO_TARGET = 900;

const initialReplicas: Replica[] = [
  { id: "pg-replica-jkt-01", name: "Replica 01 (Sync, Cibitung)", role: "standby_sync", location: "DCI Cibitung H2", lagMs: 8, lagBytes: 0, connections: 42 },
  { id: "pg-replica-sby-01", name: "Replica 02 (Async, Surabaya)", role: "standby_async", location: "Telkom Sigma Surabaya", lagMs: 24, lagBytes: 16384, connections: 29 },
  { id: "pg-replica-ikn-01", name: "Replica 03 (Async, IKN PDN)", role: "standby_async", location: "PDN Nusantara", lagMs: 42, lagBytes: 65536, connections: 18 },
];

const initialPartitions: Partition[] = [
  { id: "part-public-shared", tenant: "Shared Core Metadata", year: 2026, schema: "public", tables: 42, rows: 189420, size: "1.20 GB", status: "active" },
  { id: "part-adhimix-2026", tenant: "PT Adhimix Precast", year: 2026, schema: "tenant_adhimix_2026", tables: 68, rows: 1420500, size: "8.40 GB", status: "active" },
  { id: "part-wika-2026", tenant: "WIKA KSO Tol Sumatera", year: 2026, schema: "tenant_wika_2026", tables: 68, rows: 2894200, size: "14.20 GB", status: "active" },
  { id: "part-hk-2026", tenant: "HK Bendungan Meninting", year: 2026, schema: "tenant_hk_2026", tables: 68, rows: 2150300, size: "11.80 GB", status: "active" },
  { id: "part-adhimix-2024", tenant: "PT Adhimix Precast", year: 2024, schema: "tenant_adhimix_2024", tables: 68, rows: 3912000, size: "18.10 GB", status: "archived_cold" },
];

const cacheTags = [
  { tag: "contracts:clauses", keys: 4210, hit: 98.4 },
  { tag: "budget:rap", keys: 8940, hit: 97.2 },
  { tag: "treasury:pool", keys: 3120, hit: 99.1 },
  { tag: "inventory:stock", keys: 14200, hit: 94.6 },
  { tag: "auth:sessions", keys: 2210, hit: 99.8 },
];

const locks = [
  { key: "redlock:disbursement:mandor-payroll-bca-091", by: "worker-disbursement-pod-1", ttl: 3420 },
  { key: "redlock:budget:rap-revision-toll-km42", by: "api-service-pod-3", ttl: 8120 },
  { key: "redlock:inventory:stock-alloc-cement-jkt01", by: "worker-inventory-pod-2", ttl: 1980 },
];

const snapshots = [
  { id: "snap-20261106-0000", at: "06 Nov 2026 00:00", size: "42.10 GB", sha: "8f4c9a1e…34567" },
  { id: "snap-20261105-0000", at: "05 Nov 2026 00:00", size: "41.80 GB", sha: "3a1b8c7d…0c9d8" },
  { id: "snap-20261104-0000", at: "04 Nov 2026 00:00", size: "41.20 GB", sha: "7c9e5a3f…c2e4a" },
];

const initialDrills: Drill[] = [
  { id: "drill-20261028-01", code: "DR-DRILL-Q4-2026", title: "Switchover DC Jakarta ke Cibitung", duration: "3m 18s", rpo: 14, rto: 198, certified: true, auditor: "BSI Group Indonesia" },
  { id: "drill-20260715-01", code: "DR-DRILL-Q3-2026", title: "PITR Sandbox Simulasi Ransomware", duration: "4m 14s", rpo: 22, rto: 254, certified: true, auditor: "TUV Rheinland Indonesia" },
];

const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "TOPOLOGY", label: "Topologi HA", icon: Server },
  { key: "PARTITIONS", label: "Partisi Tenant", icon: Layers },
  { key: "CACHE", label: "Redis Cache & Lock", icon: Gauge },
  { key: "PITR", label: "PITR & WAL", icon: HardDriveDownload },
  { key: "DRILLS", label: "Drill & Sertifikasi", icon: Award },
];

export default function DisasterRecoveryPage() {
  const [tab, setTab] = useState<TabType>("TOPOLOGY");
  const [replicas] = useState(initialReplicas);
  const [partitions, setPartitions] = useState(initialPartitions);
  const [drills, setDrills] = useState(initialDrills);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "PARTITION" | "FAILOVER" | "PITR">(null);
  const [cacheUsage, setCacheUsage] = useState(20.12);

  const [pForm, setPForm] = useState({ tenant: "", year: 2026 });
  const [failoverTarget, setFailoverTarget] = useState(initialReplicas[0].id);
  const [pitrTime, setPitrTime] = useState("2026-11-06T14:32");
  const [pitrSnap, setPitrSnap] = useState(snapshots[0].id);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const addPartition = () => {
    if (!pForm.tenant.trim()) return;
    const slug = pForm.tenant.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    setPartitions([
      { id: `part-${slug}-${pForm.year}`, tenant: pForm.tenant, year: pForm.year, schema: `tenant_${slug}_${pForm.year}`, tables: 68, rows: 0, size: "256 MB", status: "active" },
      ...partitions,
    ]);
    setModal(null);
    setPForm({ tenant: "", year: 2026 });
    notify("Partisi tenant berhasil diprovisi.");
  };

  const archive = (id: string) => {
    setPartitions(partitions.map((p) => (p.id === id ? { ...p, status: "archived_cold" } : p)));
    notify("Partisi di-detach dan diarsipkan ke cold storage (AES-256).");
  };

  const addDrill = (title: string, rto: number, rpo: number) => {
    setDrills([
      { id: `drill-${Date.now()}`, code: `DR-${Date.now().toString().slice(-4)}`, title, duration: `${rto} detik`, rpo, rto, certified: false },
      ...drills,
    ]);
  };

  const runFailover = () => {
    const r = replicas.find((x) => x.id === failoverTarget);
    if (!r) return;
    addDrill(`Failover ke ${r.name}`, 17, Math.max(1, Math.round(r.lagMs / 1000)));
    setModal(null);
    notify(`Failover ke ${r.name} sukses tanpa data loss (RTO 17s).`);
  };

  const runPitr = () => {
    addDrill(`PITR ke ${pitrTime.replace("T", " ")} dari ${pitrSnap}`, 185, 18);
    setModal(null);
    notify("Restorasi PITR sandbox sukses, checksum SHA-256 cocok 100%.");
  };

  const certify = (id: string) => {
    setDrills(drills.map((d) => (d.id === id ? { ...d, certified: true, auditor: "BSI Group Indonesia" } : d)));
    notify("Drill disertifikasi ISO 22301 / ISO 27001.");
  };

  const purge = () => {
    setCacheUsage(2.5);
    notify("Cache Redis dibersihkan (84.210 key).");
  };

  const kpis = [
    { label: "Kesehatan Cluster", value: "HEALTHY", sub: "4/4 node aktif", icon: ShieldCheck, color: "text-emerald-600" },
    { label: "RPO Saat Ini", value: "38 dtk", sub: `Target < ${RPO_TARGET} dtk`, icon: Clock, color: "text-blue-600" },
    { label: "Estimasi RTO", value: "4m 12s", sub: `Target < ${RTO_TARGET / 60} menit`, icon: RefreshCw, color: "text-blue-600" },
    { label: "Cache Hit Ratio", value: "96,84%", sub: "Redis allkeys-lru", icon: Gauge, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <DatabaseZap className="w-6 h-6 shrink-0 text-action" />
            <span className="truncate">Disaster Recovery &amp; High Availability</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Partisi multi-tenant, replikasi PostgreSQL, Redis cache, dan Point-in-Time Recovery (ISO 22301).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal("FAILOVER")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4" /> Simulasi Failover
          </button>
          <button onClick={() => setModal("PITR")} className="min-h-11 px-4 rounded-md border border-border text-sm font-medium flex items-center gap-2">
            <HardDriveDownload className="w-4 h-4" /> Simulasi PITR
          </button>
        </div>
      </div>

      {toast && (
        <div role="status" className="rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className={`mt-2 text-xl font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div role="tablist" className="flex flex-wrap gap-1 sm:gap-2 pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-11 px-3 rounded-md text-sm font-medium flex items-center gap-2 ${
              tab === t.key ? "bg-action text-white" : "bg-white border border-border text-primary"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "TOPOLOGY" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <div className="font-semibold text-emerald-900">Primary: db-master.buildflow.internal (Jakarta JK1)</div>
            <div className="text-xs font-mono text-emerald-800 mt-1 break-all">LSN 0/1F992AC0 · 68/500 koneksi · Raft quorum 3/3</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {replicas.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                <div className="font-semibold text-primary truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.location}</div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <dt className="text-muted-foreground">Lag</dt>
                  <dd className="font-mono text-right">{r.lagMs} ms</dd>
                  <dt className="text-muted-foreground">Lag bytes</dt>
                  <dd className="font-mono text-right">{r.lagBytes} B</dd>
                  <dt className="text-muted-foreground">Koneksi</dt>
                  <dd className="font-mono text-right">{r.connections}</dd>
                  <dt className="text-muted-foreground">Mode</dt>
                  <dd className="text-right">{r.role === "standby_sync" ? "Sync" : "Async"}</dd>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "PARTITIONS" && (
        <div className="space-y-3">
          <button onClick={() => setModal("PARTITION")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Partisi Baru
          </button>
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-2 w-[34%]">Tenant / Schema</th>
                  <th className="p-2 w-[12%]">TA</th>
                  <th className="p-2 w-[16%]">Ukuran</th>
                  <th className="p-2 w-[20%]">Status</th>
                  <th className="p-2 w-[18%]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {partitions.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-2 min-w-0">
                      <div className="font-medium truncate">{p.tenant}</div>
                      <div className="font-mono text-[11px] text-muted-foreground truncate">{p.schema}</div>
                    </td>
                    <td className="p-2 font-mono">{p.year}</td>
                    <td className="p-2 font-mono">{p.size}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                        {p.status === "active" ? "Aktif" : "Arsip"}
                      </span>
                    </td>
                    <td className="p-2">
                      {p.status === "active" && p.year < 2026 ? (
                        <button onClick={() => archive(p.id)} aria-label={`Arsipkan ${p.schema}`} className="min-h-11 min-w-11 flex items-center justify-center">
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : p.status === "active" ? (
                        <button onClick={() => archive(p.id)} aria-label={`Arsipkan ${p.schema}`} className="min-h-11 min-w-11 flex items-center justify-center">
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "CACHE" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-primary">Memori Redis</h2>
              <button onClick={purge} className="min-h-11 px-3 rounded-md border border-border text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Purge Semua
              </button>
            </div>
            <div className="h-3 rounded bg-slate-200 overflow-hidden">
              <div className="h-full bg-action" style={{ width: `${cacheUsage}%` }} />
            </div>
            <div className="text-xs font-mono">{cacheUsage}% dari 2.0 GB</div>
            <ul className="space-y-2">
              {cacheTags.map((c) => (
                <li key={c.tag} className="flex justify-between gap-2 text-xs">
                  <span className="font-mono truncate">{c.tag}</span>
                  <span className="font-mono shrink-0">{c.keys} key · {c.hit}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 space-y-3">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <Lock className="w-4 h-4" /> Distributed Lock Aktif
            </h2>
            <ul className="space-y-2">
              {locks.map((l) => (
                <li key={l.key} className="rounded border border-border p-2 text-xs min-w-0">
                  <div className="font-mono break-all">{l.key}</div>
                  <div className="text-muted-foreground mt-1">{l.by} · TTL {l.ttl} ms</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "PITR" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            WAL archiving STREAMING → s3://buildflow-wal-archive/asia-southeast2/ · AES-256 GCM · lag 12 dtk
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {snapshots.map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                <div className="font-mono text-sm break-all">{s.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.at} · {s.size}</div>
                <div className="text-[11px] font-mono mt-2 break-all">SHA-256 {s.sha}</div>
                <div className="text-xs text-emerald-700 mt-1">Terverifikasi</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "DRILLS" && (
        <div className="space-y-3">
          {drills.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-primary">{d.title}</div>
                <div className="text-xs font-mono text-muted-foreground">{d.code} · {d.duration}</div>
                <div className="text-xs mt-1">
                  RPO {d.rpo}s (&lt;{RPO_TARGET}s) · RTO {d.rto}s (&lt;{RTO_TARGET}s)
                </div>
              </div>
              {d.certified ? (
                <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  Tersertifikasi · {d.auditor}
                </span>
              ) : (
                <button onClick={() => certify(d.id)} className="min-h-11 px-3 rounded-md bg-action text-white text-sm self-start sm:self-auto">
                  Sertifikasi ISO 22301
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-primary">
                {modal === "PARTITION" ? "Partisi Tenant Baru" : modal === "FAILOVER" ? "Simulasi Failover" : "Simulasi PITR"}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Tutup" className="min-h-11 min-w-11 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modal === "PARTITION" && (
              <>
                <label className="block text-sm">
                  Nama Tenant
                  <input value={pForm.tenant} onChange={(e) => setPForm({ ...pForm, tenant: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Tahun Anggaran
                  <input type="number" value={pForm.year} onChange={(e) => setPForm({ ...pForm, year: Number(e.target.value) })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <button onClick={addPartition} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Provisi Partisi</button>
              </>
            )}
            {modal === "FAILOVER" && (
              <>
                <label className="block text-sm">
                  Replica Target
                  <select value={failoverTarget} onChange={(e) => setFailoverTarget(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3">
                    {replicas.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </label>
                <button onClick={runFailover} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Jalankan Failover</button>
              </>
            )}
            {modal === "PITR" && (
              <>
                <label className="block text-sm">
                  Target Waktu Pemulihan
                  <input type="datetime-local" value={pitrTime} onChange={(e) => setPitrTime(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Base Snapshot
                  <select value={pitrSnap} onChange={(e) => setPitrSnap(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3">
                    {snapshots.map((s) => (
                      <option key={s.id} value={s.id}>{s.id}</option>
                    ))}
                  </select>
                </label>
                <button onClick={runPitr} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Jalankan Restorasi Sandbox</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

