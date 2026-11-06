"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Cpu,
  Scale,
  Truck,
  Fingerprint,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  X,
  Gauge,
  Fuel,
  ShieldCheck,
  Wifi,
} from "lucide-react";

type TabType = "WEIGHBRIDGE" | "TELEMATICS" | "FUEL_ALERTS" | "BIOMETRICS" | "GATEWAYS";

interface WeighTicket {
  id: string;
  ticketNo: string;
  plate: string;
  doNo: string;
  material: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  expectedKg: number;
  variancePct: number;
  status: "MATCHED" | "TOLERANCE_WARNING" | "SHORTAGE_REJECTED";
}

interface FleetUnit {
  id: string;
  name: string;
  zone: string;
  rpm: number;
  burnLph: number;
  fuelPct: number;
  hm: number;
  geofence: "INSIDE_ZONE" | "BREACH_ALERT";
}

interface FuelAlert {
  id: string;
  unitId: string;
  unitName: string;
  dropLiters: number;
  severity: "CRITICAL" | "HIGH";
  status: "OPEN" | "ACKNOWLEDGED";
  by?: string;
}

interface BioBatch {
  id: string;
  code: string;
  gate: string;
  records: number;
  helmetOk: number;
  offlineMin: number;
}

interface GatewayNode {
  id: string;
  gwId: string;
  name: string;
  type: string;
  location: string;
  uplink: string;
  rssi: number;
  queued: number;
  status: "ONLINE" | "BUFFERING_OFFLINE";
}

const initialTickets: WeighTicket[] = [
  { id: "wt-1", ticketNo: "WB-20261106-001", plate: "B 9482 UIA", doNo: "DO-SMG-0891", material: "Semen Portland Curah", grossKg: 42680, tareKg: 14200, netKg: 28480, expectedKg: 28500, variancePct: -0.07, status: "MATCHED" },
  { id: "wt-2", ticketNo: "WB-20261106-002", plate: "BE 8812 YU", doNo: "DO-AGG-1120", material: "Agregat Split 20-30mm", grossKg: 36900, tareKg: 12500, netKg: 24400, expectedKg: 25000, variancePct: -2.4, status: "SHORTAGE_REJECTED" },
  { id: "wt-3", ticketNo: "WB-20261106-003", plate: "B 9011 KQA", doNo: "DO-ASP-0419", material: "Aspal Pen 60/70 Curah", grossKg: 31890, tareKg: 11900, netKg: 19990, expectedKg: 20000, variancePct: -0.05, status: "MATCHED" },
];

const initialFleet: FleetUnit[] = [
  { id: "EQ-EXC-001", name: "Komatsu PC200-8MO Excavator #01", zone: "Galian Bendungan Utama", rpm: 1720, burnLph: 18.6, fuelPct: 72.4, hm: 4128.5, geofence: "INSIDE_ZONE" },
  { id: "EQ-DOZ-002", name: "Caterpillar D6R2 XL Bulldozer #02", zone: "Timbunan Seksi 3B", rpm: 820, burnLph: 6.2, fuelPct: 48.0, hm: 2890.2, geofence: "INSIDE_ZONE" },
  { id: "EQ-DMP-009", name: "Hino FM 260 JD Dump Truck #09", zone: "Hauling Quarry KM 14", rpm: 0, burnLph: 0, fuelPct: 31.5, hm: 6412.0, geofence: "BREACH_ALERT" },
];

const initialAlerts: FuelAlert[] = [
  { id: "alert-fuel-01", unitId: "EQ-DMP-009", unitName: "Hino FM 260 JD Dump Truck #09", dropLiters: 38.5, severity: "CRITICAL", status: "OPEN" },
  { id: "alert-fuel-02", unitId: "EQ-DOZ-002", unitName: "Caterpillar D6R2 XL Bulldozer #02", dropLiters: 21.0, severity: "HIGH", status: "ACKNOWLEDGED", by: "Ir. Hendra Wijaya" },
];

const initialBatches: BioBatch[] = [
  { id: "b-1", code: "SYNC-IKN-20261106-A", gate: "Turnstile Gate A - Camp IKN", records: 142, helmetOk: 142, offlineMin: 45 },
  { id: "b-2", code: "SYNC-MNT-20261106-B", gate: "Turnstile Gate B - Area Spillway", records: 86, helmetOk: 84, offlineMin: 120 },
];

const initialGateways: GatewayNode[] = [
  { id: "1", gwId: "gw-weigh-01", name: "Weighbridge Modbus TCP Node #01", type: "WEIGHBRIDGE_MODBUS", location: "Tol Sumatera Seksi 4", uplink: "Fiber + 5G Backup", rssi: -54, queued: 0, status: "ONLINE" },
  { id: "2", gwId: "gw-can-01", name: "LoRaWAN & J1939 Fleet Concentrator", type: "OBD_CANBUS_TELEMATICS", location: "Bendungan Meninting", uplink: "Starlink Enterprise Sat-02", rssi: -68, queued: 0, status: "ONLINE" },
  { id: "3", gwId: "gw-bio-01", name: "Biometric/RFID Turnstile Terminal", type: "BIOMETRIC_RFID_TERMINAL", location: "Camp Pekerja IKN 3B", uplink: "Starlink Business Sat-04", rssi: -81, queued: 34, status: "BUFFERING_OFFLINE" },
];

const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "WEIGHBRIDGE", label: "Jembatan Timbang", icon: Scale },
  { key: "TELEMATICS", label: "Telematika OBD/CAN", icon: Truck },
  { key: "FUEL_ALERTS", label: "Anomali BBM", icon: Fuel },
  { key: "BIOMETRICS", label: "Absensi Biometrik", icon: Fingerprint },
  { key: "GATEWAYS", label: "Edge Gateways", icon: Radio },
];

export default function IotGatewayPage() {
  const [tab, setTab] = useState<TabType>("WEIGHBRIDGE");
  const [tickets, setTickets] = useState(initialTickets);
  const [fleet] = useState(initialFleet);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [batches, setBatches] = useState(initialBatches);
  const [gateways, setGateways] = useState(initialGateways);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "WEIGH" | "BIO_SYNC" | "GATEWAY">(null);

  const [wForm, setWForm] = useState({ plate: "B 9124 Uka", doNo: "DO-SMG-0912", material: "Semen Curah OPC", grossKg: 42500, tareKg: 14000, expectedKg: 28500 });
  const [bForm, setBForm] = useState({ gate: "Turnstile Gate C - Batching Plant", records: 64 });
  const [gForm, setGForm] = useState({ gwId: "gw-lora-ikn-04", name: "LoRaWAN Field Concentrator #04", location: "IKN Seksi 3B Zona 2" });

  const lastTrigger = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const openModal = (m: "WEIGH" | "BIO_SYNC" | "GATEWAY") => {
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
    document.getElementById(`iot-tab-${tabs[next].key}`)?.focus();
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const submitWeigh = () => {
    const netKg = Math.max(0, wForm.grossKg - wForm.tareKg);
    const variancePct = Number((((netKg - wForm.expectedKg) / wForm.expectedKg) * 100).toFixed(2));
    const status = variancePct < -1.0 ? "SHORTAGE_REJECTED" : variancePct < -0.3 ? "TOLERANCE_WARNING" : "MATCHED";
    setTickets([
      {
        id: `wt-${Date.now()}`,
        ticketNo: `WB-20261106-00${tickets.length + 1}`,
        plate: wForm.plate,
        doNo: wForm.doNo,
        material: wForm.material,
        grossKg: wForm.grossKg,
        tareKg: wForm.tareKg,
        netKg,
        expectedKg: wForm.expectedKg,
        variancePct,
        status,
      },
      ...tickets,
    ]);
    setModal(null);
    notify(`Tiket timbangan ${wForm.plate} tercatat (Netto ${netKg.toLocaleString("id-ID")} kg).`);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: "ACKNOWLEDGED", by: "Ir. Hendra Wijaya" } : a)));
    notify("Anomali penurunan BBM telah diverifikasi dan ditindaklanjuti.");
  };

  const submitBioSync = () => {
    setBatches([
      {
        id: `b-${Date.now()}`,
        code: `SYNC-${Date.now().toString().slice(-4)}`,
        gate: bForm.gate,
        records: bForm.records,
        helmetOk: bForm.records,
        offlineMin: 20,
      },
      ...batches,
    ]);
    setGateways(gateways.map((g) => (g.gwId === "gw-bio-01" ? { ...g, queued: 0, status: "ONLINE" } : g)));
    setModal(null);
    notify(`Sinkronisasi ${bForm.records} log absensi biometrik offline berhasil.`);
  };

  const submitGateway = () => {
    if (!gForm.gwId.trim()) return;
    setGateways([
      {
        id: `${Date.now()}`,
        gwId: gForm.gwId,
        name: gForm.name,
        type: "LORAWAN_CONCENTRATOR",
        location: gForm.location,
        uplink: "Starlink Failover",
        rssi: -59,
        queued: 0,
        status: "ONLINE",
      },
      ...gateways,
    ]);
    setModal(null);
    notify(`Edge gateway ${gForm.gwId} berhasil didaftarkan.`);
  };

  const pingNode = (gwId: string) => {
    setGateways(gateways.map((g) => (g.gwId === gwId ? { ...g, status: "ONLINE", queued: 0 } : g)));
    notify(`Heartbeat mTLS ke ${gwId} responsif (RTT 18 ms).`);
  };

  const totalTon = (tickets.reduce((s, t) => s + t.netKg, 0) / 1000).toFixed(2);
  const openAlertsCount = alerts.filter((a) => a.status === "OPEN").length;

  const kpis = [
    { label: "Edge Gateways Aktif", value: `${gateways.filter((g) => g.status === "ONLINE").length}/${gateways.length}`, sub: "MQTT mTLS / Starlink", icon: Wifi, color: "text-emerald-600" },
    { label: "Tonase Timbangan Hari Ini", value: `${totalTon} Ton`, sub: `${tickets.length} truk terverifikasi ANPR`, icon: Scale, color: "text-blue-600" },
    { label: "Rata-rata BBM Armada", value: "12,4 L/jam", sub: "SAE J1939 CAN bus live", icon: Gauge, color: "text-blue-600" },
    { label: "Alert Anomali BBM", value: `${openAlertsCount} Open`, sub: "Deteksi drop tangki >15L", icon: AlertTriangle, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-start sm:items-center gap-2">
            <Cpu className="w-6 h-6 shrink-0 text-action mt-0.5 sm:mt-0" />
            <span className="break-words">Hardware IoT Site Gateway &amp; Telematika Armada</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Integrasi jembatan timbang digital Modbus, telematika BBM CAN bus J1939, dan terminal biometrik offline-first.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openModal("WEIGH")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Rekam Timbangan
          </button>
          <button onClick={() => openModal("BIO_SYNC")} className="min-h-11 px-4 rounded-md border border-border bg-white text-primary text-sm font-medium flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Biometrik
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

      <div role="tablist" aria-label="Modul IoT dan Telematika" className="flex flex-wrap gap-1 sm:gap-2 pb-1">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`iot-tab-${t.key}`}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls="iot-tabpanel"
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

      <div role="tabpanel" id="iot-tabpanel" aria-labelledby={`iot-tab-${tab}`} tabIndex={0}>
        {tab === "WEIGHBRIDGE" && (
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th scope="col" className="p-2 w-[28%]">Tiket / Plat ANPR</th>
                  <th scope="col" className="p-2 w-[26%]">Material &amp; DO</th>
                  <th scope="col" className="p-2 w-[16%]">Netto (kg)</th>
                  <th scope="col" className="p-2 w-[14%]">Selisih</th>
                  <th scope="col" className="p-2 w-[16%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="p-2 min-w-0">
                      <div className="font-mono font-medium truncate">{t.plate}</div>
                      <div className="font-mono text-[11px] text-slate-600 truncate">{t.ticketNo}</div>
                    </td>
                    <td className="p-2 min-w-0">
                      <div className="font-medium truncate">{t.material}</div>
                      <div className="font-mono text-[11px] text-slate-600 truncate">{t.doNo}</div>
                    </td>
                    <td className="p-2 font-mono">{t.netKg.toLocaleString("id-ID")}</td>
                    <td className="p-2 font-mono">{t.variancePct}%</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          t.status === "MATCHED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {t.status === "MATCHED" ? "Sesuai" : "Selisih"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "TELEMATICS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {fleet.map((u) => (
              <div key={u.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                <div className="font-semibold text-primary truncate">{u.name}</div>
                <div className="text-xs text-slate-600 truncate">{u.id} · {u.zone}</div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <dt className="text-slate-600">Putaran Mesin</dt>
                  <dd className="font-mono text-right">{u.rpm} RPM</dd>
                  <dt className="text-slate-600">Burn Rate BBM</dt>
                  <dd className="font-mono text-right">{u.burnLph} L/jam</dd>
                  <dt className="text-slate-600">Level Tangki</dt>
                  <dd className="font-mono text-right">{u.fuelPct}%</dd>
                  <dt className="text-slate-600">Hour Meter</dt>
                  <dd className="font-mono text-right">{u.hm} HM</dd>
                  <dt className="text-slate-600">Geofence</dt>
                  <dd className="text-right font-medium text-emerald-800">
                    {u.geofence === "INSIDE_ZONE" ? "Dalam Zona" : "Keluar Zona"}
                  </dd>
                </dl>
              </div>
            ))}
          </div>
        )}

        {tab === "FUEL_ALERTS" && (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-primary">{a.unitName}</div>
                  <div className="text-xs font-mono text-slate-600">
                    {a.unitId} · Penurunan mendadak -{a.dropLiters} Liter saat RPM 0
                  </div>
                </div>
                {a.status === "ACKNOWLEDGED" ? (
                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    Terverifikasi · {a.by}
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledgeAlert(a.id)}
                    className="min-h-11 px-3 rounded-md bg-action text-white text-sm font-medium self-start sm:self-auto"
                  >
                    Verifikasi Investigasi
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "BIOMETRICS" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Enkripsi template biometrik SHA-256 sesuai UU PDP No. 27/2022 · Deteksi AI Helm K3 aktif
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((b) => (
                <div key={b.id} className="rounded-lg border border-border bg-white p-4 min-w-0">
                  <div className="font-semibold text-primary truncate">{b.gate}</div>
                  <div className="text-xs font-mono text-slate-600 mt-1">{b.code}</div>
                  <div className="text-xs text-slate-600 mt-2">
                    {b.records} pekerja tersinkronisasi · Helm K3 {b.helmetOk}/{b.records} · Buffer offline {b.offlineMin} mnt
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "GATEWAYS" && (
          <div className="space-y-3">
            <button onClick={() => openModal("GATEWAY")} className="min-h-11 px-4 rounded-md bg-action text-white text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Daftarkan Node Gateway
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {gateways.map((g) => (
                <div key={g.id} className="rounded-lg border border-border bg-white p-4 space-y-2 min-w-0">
                  <div className="font-semibold text-primary truncate">{g.name}</div>
                  <div className="text-xs font-mono text-slate-600 truncate">{g.gwId} · {g.location}</div>
                  <div className="text-xs text-slate-600">Uplink: {g.uplink} · RSSI {g.rssi} dBm · Antrean {g.queued} paket</div>
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${g.status === "ONLINE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                      {g.status}
                    </span>
                    <button onClick={() => pingNode(g.gwId)} className="min-h-11 px-3 rounded-md border border-border text-xs font-medium">
                      Ping mTLS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div role="dialog" aria-modal="true" aria-labelledby="iot-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div ref={dialogRef} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="iot-modal-title" className="font-semibold text-primary">
                {modal === "WEIGH" ? "Rekam Tiket Jembatan Timbang" : modal === "BIO_SYNC" ? "Sinkronisasi Batch Biometrik" : "Daftarkan Edge Gateway"}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Tutup" className="min-h-11 min-w-11 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modal === "WEIGH" && (
              <>
                <label className="block text-sm">
                  Plat Nomor Truk (ANPR)
                  <input value={wForm.plate} onChange={(e) => setWForm({ ...wForm, plate: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Berat Bruto (kg)
                  <input type="number" value={wForm.grossKg} onChange={(e) => setWForm({ ...wForm, grossKg: Number(e.target.value) })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <button onClick={submitWeigh} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">
                  Simpan Tiket Timbangan
                </button>
              </>
            )}
            {modal === "BIO_SYNC" && (
              <>
                <label className="block text-sm">
                  Lokasi Gate Turnstile
                  <input value={bForm.gate} onChange={(e) => setBForm({ ...bForm, gate: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Jumlah Log Pekerja Offline
                  <input type="number" value={bForm.records} onChange={(e) => setBForm({ ...bForm, records: Number(e.target.value) })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <button onClick={submitBioSync} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">
                  Jalankan Sinkronisasi
                </button>
              </>
            )}
            {modal === "GATEWAY" && (
              <>
                <label className="block text-sm">
                  Gateway ID
                  <input value={gForm.gwId} onChange={(e) => setGForm({ ...gForm, gwId: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <label className="block text-sm">
                  Nama Perangkat
                  <input value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} className="mt-1 w-full min-h-11 rounded border border-border px-3" />
                </label>
                <button onClick={submitGateway} className="w-full min-h-11 rounded-md bg-action text-white text-sm font-medium">
                  Simpan Gateway
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
