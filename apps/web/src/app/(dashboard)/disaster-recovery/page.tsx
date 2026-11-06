"use client";

import React, { useEffect, useRef, useState } from "react";
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

const initialReplicas: Replica[] = [];

const initialPartitions: Partition[] = [];

const cacheTags: { tag: string; keys: number; hit: number }[] = [];

const locks: { key: string; by: string; ttl: number }[] = [];

const snapshots: { id: string; at: string; size: string; sha: string }[] = [];

const initialDrills: Drill[] = [];

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
  const [failoverTarget, setFailoverTarget] = useState(initialReplicas[0]?.id ?? "pg-replica-jkt-01");
  const [pitrTime, setPitrTime] = useState("2026-11-06T14:32");
  const [pitrSnap, setPitrSnap] = useState(snapshots[0]?.id ?? "snap-20261106-0000");

  const lastTrigger = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const openModal = (m: "PARTITION" | "FAILOVER" | "PITR") => {
    lastTrigger.current = document.activeElement as HTMLElement | null;
    setModal(m);
  };

  useEffect(() => {
    if (!modal) {
      lastTrigger.current?.focus();
      return;
    }
    dialogRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab" && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>("button, input, select");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    const n = tabs.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % n;
    if (e.key === "ArrowLeft") next = (idx - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(tabs[next].key);
    document.getElementById(`dr-tab-${tabs[next].key}`)?.focus();
  };

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
    const targetName = r ? r.name : failoverTarget || "Replica Standby #01";
    const lagSec = r ? Math.max(1, Math.round(r.lagMs / 1000)) : 2;
    addDrill(`Failover ke ${targetName}`, 17, lagSec);
    setModal(null);
    notify(`Failover ke ${targetName} sukses tanpa data loss (RTO 17s).`);
  };

  const runPitr = () => {
    addDrill(`PITR ke ${pitrTime.replace("T", " ")} dari ${pitrSnap || "snap-base"}`, 185, 18);
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
    { label: "Kesehatan Cluster", value: "HEALTHY", sub: `${replicas.length + 1} node aktif`, icon: ShieldCheck, color: "text-emerald-600" },
    { label: "RPO Saat Ini", value: "0 dtk", sub: `Target < ${RPO_TARGET} dtk`, icon: Clock, color: "text-blue-600" },
    { label: "Estimasi RTO", value: "0m 00s", sub: `Target < ${RTO_TARGET / 60} menit`, icon: RefreshCw, color: "text-blue-600" },
    { label: "Cache Hit Ratio", value: "96,84%", sub: "Redis allkeys-lru", icon: Gauge, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-start sm:items-center gap-2">
            <DatabaseZap className="w-6 h-6 shrink-0 text-action mt-0.5 sm:mt-0" />
            <span className="break-words">Disaster Recovery &amp; High Availability</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Partisi multi-tenant, replikasi PostgreSQL, Redis cache, dan Point-in-Time Recovery (ISO 22301).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button id="dr-btn-open-failover" onClick={() => openModal("FAILOVER")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4" /> Simulasi Failover
          </button>
          <button id="dr-btn-open-pitr" onClick={() => openModal("PITR")} className="min-h-11 px-4 rounded-md border border-border text-sm font-medium flex items-center gap-2">
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
              <span className="text-xs text-slate-600">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className={`mt-2 text-xl font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-600 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div role="tablist" aria-label="Bagian Disaster Recovery" className="flex flex-wrap gap-1 sm:gap-2 pb-1">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`dr-tab-${t.key}`}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls="dr-tabpanel"
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`min-h-11 px-3 rounded-md text-sm font-medium flex items-center gap-2 ${
              tab === t.key ? "bg-action text-white" : "bg-white border border-border text-primary"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="dr-tabpanel" aria-labelledby={`dr-tab-${tab}`} tabIndex={0}>
        {tab === "TOPOLOGY" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
              <div className="font-semibold text-emerald-900">Primary: db-master.buildflow.internal (Jakarta JK1)</div>
              <div className="text-xs font-mono text-emerald-800 mt-1 break-all">LSN 0/1F992AC0 · 68/500 koneksi · Raft quorum 3/3</div>
            </div>
            {replicas.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-600 text-xs">
                Belum ada replika standby terdaftar pada topologi.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {replicas.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                    <div className="font-semibold text-primary truncate">{r.name}</div>
                    <div className="text-xs text-slate-600">{r.location}</div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <dt className="text-slate-600">Lag</dt>
                      <dd className="font-mono text-right">{r.lagMs} ms</dd>
                      <dt className="text-slate-600">Lag bytes</dt>
                      <dd className="font-mono text-right">{r.lagBytes} B</dd>
                      <dt className="text-slate-600">Koneksi</dt>
                      <dd className="font-mono text-right">{r.connections}</dd>
                      <dt className="text-slate-600">Mode</dt>
                      <dd className="text-right">{r.role === "standby_sync" ? "Sync" : "Async"}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "PARTITIONS" && (
          <div className="space-y-3">
            <button id="dr-btn-open-partition" onClick={() => openModal("PARTITION")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Partisi Baru
            </button>
            <div className="rounded-lg border border-border bg-white overflow-hidden">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th scope="col" className="p-2 w-[34%]">Tenant / Schema</th>
                    <th scope="col" className="p-2 w-[12%]">TA</th>
                    <th scope="col" className="p-2 w-[16%]">Ukuran</th>
                    <th scope="col" className="p-2 w-[20%]">Status</th>
                    <th scope="col" className="p-2 w-[18%]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {partitions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-600 text-xs">
                        Belum ada partisi tenant diprovisi. Klik <strong>Partisi Baru</strong> di atas untuk membuat partisi schema.
                      </td>
                    </tr>
                  ) : (
                    partitions.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-2 min-w-0">
                          <div className="font-medium truncate">{p.tenant}</div>
                          <div className="font-mono text-[11px] text-slate-600 truncate">{p.schema}</div>
                        </td>
                        <td className="p-2 font-mono">{p.year}</td>
                        <td className="p-2 font-mono">{p.size}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                            {p.status === "active" ? "Aktif" : "Arsip"}
                          </span>
                        </td>
                        <td className="p-2">
                          {p.status === "active" ? (
                            <button onClick={() => archive(p.id)} aria-label={`Arsipkan ${p.schema}`} className="min-h-11 min-w-11 flex items-center justify-center">
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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
              {cacheTags.length === 0 ? (
                <div className="text-xs text-slate-600 py-2">Tidak ada tag cache aktif.</div>
              ) : (
                <ul className="space-y-2">
                  {cacheTags.map((c) => (
                    <li key={c.tag} className="flex justify-between gap-2 text-xs">
                      <span className="font-mono truncate">{c.tag}</span>
                      <span className="font-mono shrink-0">{c.keys} key · {c.hit}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-border bg-white p-4 space-y-3">
              <h2 className="font-semibold text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Distributed Lock Aktif
              </h2>
              {locks.length === 0 ? (
                <div className="text-xs text-slate-600 py-2">Tidak ada distributed lock aktif.</div>
              ) : (
                <ul className="space-y-2">
                  {locks.map((l) => (
                    <li key={l.key} className="rounded border border-border p-2 text-xs min-w-0">
                      <div className="font-mono break-all">{l.key}</div>
                      <div className="text-slate-600 mt-1">{l.by} · TTL {l.ttl} ms</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "PITR" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
              WAL archiving STREAMING → s3://buildflow-wal-archive/asia-southeast2/ · AES-256 GCM · lag 12 dtk
            </div>
            {snapshots.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-600 text-xs">
                Belum ada base snapshot PITR tersedia.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {snapshots.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                    <div className="font-mono text-sm break-all">{s.id}</div>
                    <div className="text-xs text-slate-600 mt-1">{s.at} · {s.size}</div>
                    <div className="text-[11px] font-mono mt-2 break-all">SHA-256 {s.sha}</div>
                    <div className="text-xs text-emerald-700 mt-1">Terverifikasi</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "DRILLS" && (
          <div className="space-y-3">
            {drills.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-600 text-xs">
                Belum ada riwayat simulasi DR Drill. Klik <strong>Simulasi Failover</strong> atau <strong>Simulasi PITR</strong> di atas untuk menjalankan simulasi.
              </div>
            ) : (
              drills.map((d) => (
                <div key={d.id} className="rounded-lg border border-border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-primary">{d.title}</div>
                    <div className="text-xs font-mono text-slate-600">{d.code} · {d.duration}</div>
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
              ))
            )}
          </div>
        )}
      </div>

      {modal && (
        <div role="dialog" aria-modal="true" aria-labelledby="dr-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div ref={dialogRef} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="dr-modal-title" className="font-semibold text-primary">
                {modal === "PARTITION" ? "Partisi Tenant Baru" : modal === "FAILOVER" ? "Simulasi Failover" : "Simulasi PITR"}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Tutup" className="min-h-11 min-w-11 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modal === "PARTITION" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addPartition();
                }}
                className="space-y-4"
              >
                <label className="block text-sm">
                  Nama Tenant
                  <input id="dr-input-tenant" value={pForm.tenant} onChange={(e) => setPForm({ ...pForm, tenant: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Tahun Anggaran
                  <input id="dr-input-year" type="number" value={pForm.year} onChange={(e) => setPForm({ ...pForm, year: Number(e.target.value) })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <button type="submit" id="dr-btn-submit-partition" className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Provisi Partisi</button>
              </form>
            )}
            {modal === "FAILOVER" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runFailover();
                }}
                className="space-y-4"
              >
                <label className="block text-sm">
                  Replica Target
                  <select id="dr-select-replica" value={failoverTarget} onChange={(e) => setFailoverTarget(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3">
                    {replicas.length === 0 ? (
                      <option value="pg-replica-jkt-01">Replica 01 (Sync, Cibitung)</option>
                    ) : (
                      replicas.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))
                    )}
                  </select>
                </label>
                <button type="submit" id="dr-btn-submit-failover" className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Jalankan Failover</button>
              </form>
            )}
            {modal === "PITR" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runPitr();
                }}
                className="space-y-4"
              >
                <label className="block text-sm">
                  Target Waktu Pemulihan
                  <input id="dr-input-pitr-time" type="datetime-local" value={pitrTime} onChange={(e) => setPitrTime(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Base Snapshot
                  <select id="dr-select-snapshot" value={pitrSnap} onChange={(e) => setPitrSnap(e.target.value)} className="mt-1 w-full min-h-11 rounded border border-border px-3">
                    {snapshots.length === 0 ? (
                      <option value="snap-20261106-0000">snap-20261106-0000</option>
                    ) : (
                      snapshots.map((s) => (
                        <option key={s.id} value={s.id}>{s.id}</option>
                      ))
                    )}
                  </select>
                </label>
                <button type="submit" id="dr-btn-submit-pitr" className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">Jalankan Restorasi Sandbox</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
