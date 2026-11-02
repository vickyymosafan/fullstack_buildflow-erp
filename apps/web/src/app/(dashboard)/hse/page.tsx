"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  HardHat,
  Flame,
  HeartPulse,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  CloudSun,
  Clock,
  Plus,
  Search,
  RefreshCw,
  X,
  Check,
  AlertOctagon,
  ShieldCheck,
  Award,
} from "lucide-react";

interface HseSummary {
  safeManHours: number;
  zeroAccidentDays: number;
  ltifr: number;
  severityRate: number;
  apdComplianceRate: number;
  activePtwCount: number;
  nearMissCount: number;
  tbmTotalSessions: number;
  totalWorkersProtected: number;
  totalIncidents: number;
  standardConformance: string;
}

interface PtwItem {
  id: string;
  permitNumber: string;
  title: string;
  permitType: string;
  riskLevel: string;
  location: string;
  contractorName: string;
  supervisorName: string;
  workerCount: number;
  validFrom: string;
  validTo: string;
  specialPrecautionsRequired: boolean;
  safetyPrecautions: string;
  status: string;
  reviewedBy: string;
  reviewNotes: string;
  createdAt: string;
  project?: { name: string; projectCode: string };
}

interface IncidentItem {
  id: string;
  incidentNumber: string;
  title: string;
  incidentType: string;
  severity: string;
  location: string;
  reporterName: string;
  affectedPerson: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  daysLost: number;
  status: string;
  createdAt: string;
  project?: { name: string; projectCode: string };
}

interface TbmItem {
  id: string;
  tbmNumber: string;
  topic: string;
  zoneLocation: string;
  leadBy: string;
  attendeeCount: number;
  targetGroup: string;
  weatherCondition: string;
  keySafetyNotes: string;
  status: string;
  sessionDate: string;
  project?: { name: string; projectCode: string };
}

interface HseInspectionItem {
  id: string;
  auditNumber: string;
  title: string;
  inspectionType: string;
  severity: string;
  location: string;
  inspectorName: string;
  score: number;
  helmetCompliant: boolean;
  vestCompliant: boolean;
  bootsCompliant: boolean;
  harnessCompliant: boolean;
  observations: string;
  actionPlan: string;
  status: string;
  auditDate: string;
  project?: { name: string; projectCode: string };
}

const API_BASE = "http://localhost:4000/api/v1/hse";

export default function HsePortalPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ptw" | "incident" | "tbm" | "inspections">("ptw");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Summary State
  const [summary, setSummary] = useState<HseSummary>({
    safeManHours: 1488200,
    zeroAccidentDays: 253,
    ltifr: 0.0,
    severityRate: 0.0,
    apdComplianceRate: 96.5,
    activePtwCount: 3,
    nearMissCount: 1,
    tbmTotalSessions: 2,
    totalWorkersProtected: 112,
    totalIncidents: 2,
    standardConformance: "SMK3 PP 50/2012 & ISO 45001:2018",
  });

  // Lists State
  const [ptwList, setPtwList] = useState<PtwItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [tbmList, setTbmList] = useState<TbmItem[]>([]);
  const [inspections, setInspections] = useState<HseInspectionItem[]>([]);

  // Modals State
  const [isPtwModalOpen, setIsPtwModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isTbmModalOpen, setIsTbmModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Form States
  const [ptwForm, setPtwForm] = useState({
    title: "",
    permitType: "HOT_WORK",
    riskLevel: "HIGH",
    location: "",
    contractorName: "",
    supervisorName: "",
    workerCount: 4,
    validFrom: "2026-11-03T08:00",
    validTo: "2026-11-03T17:00",
    specialPrecautionsRequired: true,
    safetyPrecautions: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    title: "",
    incidentType: "NEAR_MISS",
    severity: "MEDIUM",
    location: "",
    reporterName: "",
    affectedPerson: "",
    description: "",
    rootCause: "",
    correctiveAction: "",
    daysLost: 0,
  });

  const [tbmForm, setTbmForm] = useState({
    topic: "",
    zoneLocation: "",
    leadBy: "",
    attendeeCount: 30,
    targetGroup: "Mandor & Pekerja Struktur",
    weatherCondition: "Cerah Berawan",
    keySafetyNotes: "",
  });

  const [auditForm, setAuditForm] = useState({
    title: "",
    inspectionType: "APD_COMPLIANCE",
    severity: "LOW",
    location: "",
    inspectorName: "",
    score: 95,
    helmetCompliant: true,
    vestCompliant: true,
    bootsCompliant: true,
    harnessCompliant: true,
    observations: "",
    actionPlan: "",
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sumRes, ptwRes, incRes, tbmRes, inspRes] = await Promise.all([
        fetch(`${API_BASE}/summary`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/ptw`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_BASE}/incidents`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_BASE}/tbm`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_BASE}/inspections`).then((r) => (r.ok ? r.json() : [])),
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(ptwRes)) setPtwList(ptwRes);
      if (Array.isArray(incRes)) setIncidents(incRes);
      if (Array.isArray(tbmRes)) setTbmList(tbmRes);
      if (Array.isArray(inspRes)) setInspections(inspRes);
    } catch (err) {
      console.warn("Using baseline fallback state:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const handleCreatePtw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/ptw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ptwForm),
      });
      if (res.ok) {
        setIsPtwModalOpen(false);
        setPtwForm({
          title: "",
          permitType: "HOT_WORK",
          riskLevel: "HIGH",
          location: "",
          contractorName: "",
          supervisorName: "",
          workerCount: 4,
          validFrom: "2026-11-03T08:00",
          validTo: "2026-11-03T17:00",
          specialPrecautionsRequired: true,
          safetyPrecautions: "",
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Gagal submit PTW", err);
    }
  };

  const handleUpdatePtwStatus = async (id: string, status: "APPROVED" | "REJECTED" | "CLOSED") => {
    try {
      await fetch(`${API_BASE}/ptw/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerName: "Ir. Danang Wicaksono, CSP (HSE Manager)",
          notes: `Permit status updated to ${status} by HSE lead`,
        }),
      });
      await fetchData();
    } catch (err) {
      console.error("Gagal update status PTW", err);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentForm),
      });
      if (res.ok) {
        setIsIncidentModalOpen(false);
        setIncidentForm({
          title: "",
          incidentType: "NEAR_MISS",
          severity: "MEDIUM",
          location: "",
          reporterName: "",
          affectedPerson: "",
          description: "",
          rootCause: "",
          correctiveAction: "",
          daysLost: 0,
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Gagal submit Insiden", err);
    }
  };

  const handleCreateTbm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tbm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tbmForm),
      });
      if (res.ok) {
        setIsTbmModalOpen(false);
        setTbmForm({
          topic: "",
          zoneLocation: "",
          leadBy: "",
          attendeeCount: 30,
          targetGroup: "Mandor & Pekerja Struktur",
          weatherCondition: "Cerah Berawan",
          keySafetyNotes: "",
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Gagal submit TBM", err);
    }
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditForm),
      });
      if (res.ok) {
        setIsAuditModalOpen(false);
        setAuditForm({
          title: "",
          inspectionType: "APD_COMPLIANCE",
          severity: "LOW",
          location: "",
          inspectorName: "",
          score: 95,
          helmetCompliant: true,
          vestCompliant: true,
          bootsCompliant: true,
          harnessCompliant: true,
          observations: "",
          actionPlan: "",
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Gagal submit Audit APD", err);
    }
  };

  // Filtered Items
  const filteredPtw = ptwList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIncidents = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTbm = tbmList.filter(
    (t) =>
      t.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tbmNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.zoneLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInspections = inspections.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.auditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                HSE & K3 Konstruksi Enterprise
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Sistem Manajemen Keselamatan Kerja Konstruksi (SMK3 PP 50/2012 & ISO 45001:2018)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-refresh-hse"
            onClick={fetchData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            title="Refresh Data K3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            Refresh
          </button>

          <button
            id="btn-open-ptw-modal"
            onClick={() => setIsPtwModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow transition-colors"
          >
            <Flame className="w-3.5 h-3.5" />
            Buat Permit (PTW)
          </button>

          <button
            id="btn-open-incident-modal"
            onClick={() => setIsIncidentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Lapor Insiden
          </button>

          <button
            id="btn-open-tbm-modal"
            onClick={() => setIsTbmModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Catat TBM
          </button>

          <button
            id="btn-open-audit-modal"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow transition-colors"
          >
            <HardHat className="w-3.5 h-3.5" />
            Audit APD & 5R
          </button>
        </div>
      </div>

      {/* KPI Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Safe Man-Hours */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-700 tracking-wider">
              Safe Man-Hours
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {summary.safeManHours.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Jam kerja akumulatif tanpa kecelakaan fatal</span>
            </p>
          </div>
        </div>

        {/* Card 2: Zero Accident Days */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-700 tracking-wider">
              Zero Accident Days
            </span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {summary.zeroAccidentDays}{" "}
              <span className="text-sm font-sans font-normal text-slate-700">Hari</span>
            </div>
            <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>Rekor keselamatan berturut-turut</span>
            </p>
          </div>
        </div>

        {/* Card 3: LTIFR & Severity Rate */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-700 tracking-wider">
              LTIFR & Severity Rate
            </span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {summary.ltifr.toFixed(2)}{" "}
              <span className="text-sm font-sans font-normal text-slate-700">/ SR: {summary.severityRate.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Target Benchmark ISO 45001: 0.00</span>
            </p>
          </div>
        </div>

        {/* Card 4: APD Compliance Rate */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-700 tracking-wider">
              Kepatuhan APD Wajib
            </span>
            <span className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <HardHat className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {summary.apdComplianceRate}%
            </div>
            <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-purple-700" />
              <span>{summary.totalWorkersProtected} Tenaga kerja diawasi harian</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
          <nav className="flex flex-wrap gap-1 sm:gap-4 pb-px" role="tablist" aria-label="Tabs HSE">
            <button
              id="tab-ptw"
              role="tab"
              aria-selected={activeTab === "ptw"}
              onClick={() => setActiveTab("ptw")}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "ptw"
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Permit to Work ({ptwList.length})
            </button>

            <button
              id="tab-incident"
              role="tab"
              aria-selected={activeTab === "incident"}
              onClick={() => setActiveTab("incident")}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "incident"
                  ? "border-rose-700 text-rose-800"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Insiden & Near-Miss ({incidents.length})
            </button>

            <button
              id="tab-tbm"
              role="tab"
              aria-selected={activeTab === "tbm"}
              onClick={() => setActiveTab("tbm")}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "tbm"
                  ? "border-sky-700 text-sky-800"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Toolbox Meeting ({tbmList.length})
            </button>

            <button
              id="tab-inspections"
              role="tab"
              aria-selected={activeTab === "inspections"}
              onClick={() => setActiveTab("inspections")}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "inspections"
                  ? "border-amber-700 text-amber-800"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Audit APD ({inspections.length})
            </button>
          </nav>

          <div className="relative pb-2 sm:pb-0 w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-600" />
            <input
              type="text"
              id="input-hse-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tiket, lokasi, subkon..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
        </div>

        {/* Tab 1: Permit to Work (PTW) */}
        {activeTab === "ptw" && (
          <div className="space-y-3">
            {/* Mobile Card View (xl:hidden) */}
            <div className="xl:hidden space-y-3">
              {filteredPtw.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Tidak ada izin kerja (PTW) yang sesuai.
                </div>
              ) : (
                filteredPtw.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.permitNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "SUBMITTED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {item.permitType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${
                          item.riskLevel === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        Risiko: {item.riskLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>Lokasi: {item.location}</div>
                      <div>Subkon: {item.contractorName}</div>
                      <div>Pekerja: {item.workerCount} orang</div>
                    </div>
                    {item.status === "SUBMITTED" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleUpdatePtwStatus(item.id, "APPROVED")}
                          className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg text-center"
                        >
                          Setujui PTW
                        </button>
                        <button
                          onClick={() => handleUpdatePtwStatus(item.id, "REJECTED")}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden xl:block) */}
            <div className="hidden xl:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Izin & Pekerjaan</th>
                    <th className="py-3 px-4">Tipe & Risiko</th>
                    <th className="py-3 px-4">Lokasi & Subkon</th>
                    <th className="py-3 px-4">Masa Berlaku</th>
                    <th className="py-3 px-4">Mitigasi K3</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPtw.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Tidak ada izin kerja (PTW) yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredPtw.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{item.permitNumber}</div>
                          <div className="text-slate-700 font-medium">{item.title}</div>
                          <div className="text-[11px] text-slate-700">Pekerja: {item.workerCount} orang</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-800 mr-1">
                            {item.permitType}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                              item.riskLevel === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : item.riskLevel === "HIGH"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{item.location}</div>
                          <div className="text-slate-700 text-[11px]">{item.contractorName}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                          <div>Mulai: {new Date(item.validFrom).toLocaleDateString("id-ID")}</div>
                          <div>Selesai: {new Date(item.validTo).toLocaleDateString("id-ID")}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-700 truncate" title={item.safetyPrecautions}>
                          {item.safetyPrecautions}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              item.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "SUBMITTED"
                                ? "bg-amber-100 text-amber-800"
                                : item.status === "CLOSED"
                                ? "bg-slate-100 text-slate-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.status === "APPROVED" && <Check className="w-3 h-3" />}
                            {item.status === "SUBMITTED" && <Clock className="w-3 h-3" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.status === "SUBMITTED" ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleUpdatePtwStatus(item.id, "APPROVED")}
                                className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-sm"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleUpdatePtwStatus(item.id, "REJECTED")}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : item.status === "APPROVED" ? (
                            <button
                              onClick={() => handleUpdatePtwStatus(item.id, "CLOSED")}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded"
                            >
                              Tutup Izin
                            </button>
                          ) : (
                            <span className="text-slate-600 font-mono text-[11px]">Selesai</span>
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

        {/* Tab 2: Incident & Near-Miss */}
        {activeTab === "incident" && (
          <div className="space-y-3">
            {/* Mobile Card View (xl:hidden) */}
            <div className="xl:hidden space-y-3">
              {filteredIncidents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Tidak ada laporan insiden yang tercatat.
                </div>
              ) : (
                filteredIncidents.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.incidentNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${
                          item.incidentType === "LOST_TIME_INJURY"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.incidentType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        Lost: {item.daysLost} hari
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Lokasi: {item.location}</div>
                      <div>Pelapor: {item.reporterName}</div>
                      <div>Korban: {item.affectedPerson}</div>
                      <div className="text-slate-800">Akar: {item.rootCause}</div>
                      <div className="text-emerald-800 font-medium">Aksi: {item.correctiveAction}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden xl:block) */}
            <div className="hidden xl:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Insiden & Judul</th>
                    <th className="py-3 px-4">Tipe Kejadian</th>
                    <th className="py-3 px-4">Lokasi & Pelapor</th>
                    <th className="py-3 px-4">Pekerja Terdampak</th>
                    <th className="py-3 px-4">Akar Masalah & Tindakan</th>
                    <th className="py-3 px-4">Lost Days</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Tidak ada laporan insiden yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{item.incidentNumber}</div>
                          <div className="text-slate-700 font-medium">{item.title}</div>
                          <div className="text-[11px] text-slate-700">{item.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                              item.incidentType === "LOST_TIME_INJURY"
                                ? "bg-rose-100 text-rose-800"
                                : item.incidentType === "FIRST_AID"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.incidentType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{item.location}</div>
                          <div className="text-slate-700 text-[11px]">{item.reporterName}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-medium">
                          {item.affectedPerson}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-slate-700 truncate" title={`Akar: ${item.rootCause}`}>
                            <span className="font-semibold text-slate-800">Akar:</span> {item.rootCause}
                          </div>
                          <div className="text-emerald-800 truncate" title={`Mitigasi: ${item.correctiveAction}`}>
                            <span className="font-semibold text-slate-800">Aksi:</span> {item.correctiveAction}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {item.daysLost} hari
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              item.status === "CLOSED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Toolbox Meeting (TBM) */}
        {activeTab === "tbm" && (
          <div className="space-y-3">
            {/* Mobile Card View (xl:hidden) */}
            <div className="xl:hidden space-y-3">
              {filteredTbm.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Tidak ada catatan sesi Toolbox Meeting (TBM).
                </div>
              ) : (
                filteredTbm.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.tbmNumber}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <CloudSun className="w-3 h-3 text-amber-500" />
                        {item.weatherCondition}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{item.topic}</div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>Zona: {item.zoneLocation}</div>
                      <div>Pemimpin: {item.leadBy}</div>
                      <div className="font-semibold text-sky-800">Hadir: {item.attendeeCount} Orang</div>
                    </div>
                    <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                      {item.keySafetyNotes}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden xl:block) */}
            <div className="hidden xl:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. TBM & Topik K3</th>
                    <th className="py-3 px-4">Zona / Lokasi</th>
                    <th className="py-3 px-4">Pemimpin Sesi</th>
                    <th className="py-3 px-4">Kelompok Target</th>
                    <th className="py-3 px-4">Hadir</th>
                    <th className="py-3 px-4">Kondisi Cuaca</th>
                    <th className="py-3 px-4">Instruksi K3 Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTbm.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Tidak ada catatan sesi Toolbox Meeting (TBM).
                      </td>
                    </tr>
                  ) : (
                    filteredTbm.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{item.tbmNumber}</div>
                          <div className="text-slate-700 font-medium">{item.topic}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {item.zoneLocation}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.leadBy}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.targetGroup}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sky-800">
                          {item.attendeeCount} Orang
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            <CloudSun className="w-3 h-3 text-amber-500" />
                            {item.weatherCondition}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-sm text-slate-700 truncate" title={item.keySafetyNotes}>
                          {item.keySafetyNotes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: APD Compliance & Safety Observations */}
        {activeTab === "inspections" && (
          <div className="space-y-3">
            {/* Mobile Card View (xl:hidden) */}
            <div className="xl:hidden space-y-3">
              {filteredInspections.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Tidak ada catatan audit kepatuhan APD.
                </div>
              ) : (
                filteredInspections.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.auditNumber}</span>
                      <span
                        className={`text-sm font-mono font-bold ${
                          item.score >= 90 ? "text-emerald-800" : "text-amber-800"
                        }`}
                      >
                        {item.score}%
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-600">Lokasi: {item.location} ({item.inspectorName})</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.helmetCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        Helm {item.helmetCompliant ? "OK" : "NO"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.vestCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        Rompi {item.vestCompliant ? "OK" : "NO"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.bootsCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        Sepatu {item.bootsCompliant ? "OK" : "NO"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.harnessCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        Harness {item.harnessCompliant ? "OK" : "NO"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>Temuan: {item.observations}</div>
                      <div className="text-emerald-800 font-medium">Aksi: {item.actionPlan}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden xl:block) */}
            <div className="hidden xl:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Audit & Judul</th>
                    <th className="py-3 px-4">Tipe Audit</th>
                    <th className="py-3 px-4">Lokasi & Pengawas</th>
                    <th className="py-3 px-4">Skor</th>
                    <th className="py-3 px-4">Checklist APD</th>
                    <th className="py-3 px-4">Temuan & Tindakan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Tidak ada catatan audit kepatuhan APD.
                      </td>
                    </tr>
                  ) : (
                    filteredInspections.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{item.auditNumber}</div>
                          <div className="text-slate-700 font-medium">{item.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded font-semibold text-[10px] bg-purple-100 text-purple-800">
                            {item.inspectionType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{item.location}</div>
                          <div className="text-slate-700 text-[11px]">{item.inspectorName}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={`text-sm ${
                              item.score >= 90
                                ? "text-emerald-800"
                                : item.score >= 75
                                ? "text-amber-800"
                                : "text-rose-800"
                            }`}
                          >
                            {item.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.helmetCompliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Helm {item.helmetCompliant ? "OK" : "NO"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.vestCompliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Rompi {item.vestCompliant ? "OK" : "NO"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.bootsCompliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Sepatu {item.bootsCompliant ? "OK" : "NO"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.harnessCompliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Harness {item.harnessCompliant ? "OK" : "NO"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-slate-700 truncate" title={`Temuan: ${item.observations}`}>
                            <span className="font-semibold text-slate-800">Temuan:</span> {item.observations}
                          </div>
                          <div className="text-emerald-800 truncate" title={`Koreksi: ${item.actionPlan}`}>
                            <span className="font-semibold text-slate-800">Koreksi:</span> {item.actionPlan}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              item.status === "PASSED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Create PTW */}
      {isPtwModalOpen && (
        <div
          id="modal-create-ptw"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pengajuan Digital Permit to Work (PTW)
                </h3>
              </div>
              <button
                id="btn-close-ptw-modal"
                onClick={() => setIsPtwModalOpen(false)}
                className="text-slate-600 hover:text-slate-800 p-1"
                aria-label="Tutup Modal PTW"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePtw} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Pekerjaan Berisiko Tinggi *
                </label>
                <input
                  type="text"
                  required
                  value={ptwForm.title}
                  onChange={(e) => setPtwForm({ ...ptwForm, title: e.target.value })}
                  placeholder="Misal: Pengelasan Konstruksi Canopy Lobby"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Izin *</label>
                  <select
                    value={ptwForm.permitType}
                    onChange={(e) => setPtwForm({ ...ptwForm, permitType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    <option value="HOT_WORK">Hot Work (Api / Las)</option>
                    <option value="WORKING_AT_HEIGHT">Working at Height (&gt;1.8m)</option>
                    <option value="CONFINED_SPACE">Confined Space (Ruang Terbatas)</option>
                    <option value="HEAVY_LIFTING">Heavy Lifting (Crane)</option>
                    <option value="ELECTRICAL_ISOLATION">Electrical LOTO</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Risiko *</label>
                  <select
                    value={ptwForm.riskLevel}
                    onChange={(e) => setPtwForm({ ...ptwForm, riskLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    <option value="HIGH">Tinggi (High Risk)</option>
                    <option value="CRITICAL">Kritis (Critical)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Fisik *</label>
                  <input
                    type="text"
                    required
                    value={ptwForm.location}
                    onChange={(e) => setPtwForm({ ...ptwForm, location: e.target.value })}
                    placeholder="Contoh: Tower A Lantai 18"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subkontraktor *</label>
                  <input
                    type="text"
                    required
                    value={ptwForm.contractorName}
                    onChange={(e) => setPtwForm({ ...ptwForm, contractorName: e.target.value })}
                    placeholder="PT Baja Mandiri Utama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mandor / Pengawas *</label>
                  <input
                    type="text"
                    required
                    value={ptwForm.supervisorName}
                    onChange={(e) => setPtwForm({ ...ptwForm, supervisorName: e.target.value })}
                    placeholder="Wawan Hermawan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Pekerja *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={ptwForm.workerCount}
                    onChange={(e) => setPtwForm({ ...ptwForm, workerCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Langkah Pencegahan & Mitigasi Bahaya K3 *
                </label>
                <textarea
                  required
                  rows={3}
                  value={ptwForm.safetyPrecautions}
                  onChange={(e) => setPtwForm({ ...ptwForm, safetyPrecautions: e.target.value })}
                  placeholder="Misal: APAR Powder 6kg standby, Fire Blanket, Barricade line radius 5 meter, Full body harness double lanyard..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPtwModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-ptw"
                  className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow transition-colors"
                >
                  Kirim Pengajuan PTW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Incident */}
      {isIncidentModalOpen && (
        <div
          id="modal-create-incident"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Laporan Insiden & Near-Miss Keselamatan Kerja
                </h3>
              </div>
              <button
                id="btn-close-incident-modal"
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-slate-600 hover:text-slate-800 p-1"
                aria-label="Tutup Modal Insiden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Kejadian *</label>
                <input
                  type="text"
                  required
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  placeholder="Misal: Pekerja Terpeleset di Tangga Bordes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Insiden *</label>
                  <select
                    value={incidentForm.incidentType}
                    onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  >
                    <option value="NEAR_MISS">Near-Miss (Hampir Celaka)</option>
                    <option value="FIRST_AID">Pertolongan Pertama (First Aid)</option>
                    <option value="LOST_TIME_INJURY">Lost Time Injury (LTI)</option>
                    <option value="PROPERTY_DAMAGE">Kerusakan Alat / Properti</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity *</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  >
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                    <option value="CRITICAL">Kritis (Critical)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Kejadian *</label>
                  <input
                    type="text"
                    required
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                    placeholder="Tower B Lantai 6"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pelapor *</label>
                  <input
                    type="text"
                    required
                    value={incidentForm.reporterName}
                    onChange={(e) => setIncidentForm({ ...incidentForm, reporterName: e.target.value })}
                    placeholder="Budi Santoso (Safety Officer)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Korban / Saksi</label>
                  <input
                    type="text"
                    value={incidentForm.affectedPerson}
                    onChange={(e) => setIncidentForm({ ...incidentForm, affectedPerson: e.target.value })}
                    placeholder="Nama pekerja"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari Hilang (Days Lost)</label>
                  <input
                    type="number"
                    min={0}
                    value={incidentForm.daysLost}
                    onChange={(e) => setIncidentForm({ ...incidentForm, daysLost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kronologi Kejadian *</label>
                <textarea
                  required
                  rows={2}
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Ceritakan urutan kejadian secara faktual..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Koreksi Langsung *</label>
                <textarea
                  required
                  rows={2}
                  value={incidentForm.correctiveAction}
                  onChange={(e) => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })}
                  placeholder="Langkah perbaikan langsung di lapangan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-incident"
                  className="px-4 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow transition-colors"
                >
                  Simpan Laporan Insiden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create TBM */}
      {isTbmModalOpen && (
        <div
          id="modal-create-tbm"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Catat Toolbox Meeting (TBM) Harian
                </h3>
              </div>
              <button
                id="btn-close-tbm-modal"
                onClick={() => setIsTbmModalOpen(false)}
                className="text-slate-600 hover:text-slate-800 p-1"
                aria-label="Tutup Modal TBM"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTbm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik Briefing K3 *</label>
                <input
                  type="text"
                  required
                  value={tbmForm.topic}
                  onChange={(e) => setTbmForm({ ...tbmForm, topic: e.target.value })}
                  placeholder="Misal: Disiplin Penggunaan Full Body Harness Double Lanyard"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zona / Area Briefing *</label>
                  <input
                    type="text"
                    required
                    value={tbmForm.zoneLocation}
                    onChange={(e) => setTbmForm({ ...tbmForm, zoneLocation: e.target.value })}
                    placeholder="Plaza Utama Lantai Dasar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pemimpin Sesi *</label>
                  <input
                    type="text"
                    required
                    value={tbmForm.leadBy}
                    onChange={(e) => setTbmForm({ ...tbmForm, leadBy: e.target.value })}
                    placeholder="Rahmat Hidayat (Safety Rep)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Hadir *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={tbmForm.attendeeCount}
                    onChange={(e) => setTbmForm({ ...tbmForm, attendeeCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi Cuaca *</label>
                  <input
                    type="text"
                    required
                    value={tbmForm.weatherCondition}
                    onChange={(e) => setTbmForm({ ...tbmForm, weatherCondition: e.target.value })}
                    placeholder="Cerah Berawan / Angin 6 km/h"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poin Instruksi K3 Utama *</label>
                <textarea
                  required
                  rows={3}
                  value={tbmForm.keySafetyNotes}
                  onChange={(e) => setTbmForm({ ...tbmForm, keySafetyNotes: e.target.value })}
                  placeholder="Checklist hook lifeline, kewajiban masker las, dilarang melepas helm..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTbmModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-tbm"
                  className="px-4 py-2 font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow transition-colors"
                >
                  Simpan TBM Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Create APD Audit */}
      {isAuditModalOpen && (
        <div
          id="modal-create-audit"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Audit Kepatuhan APD & Bahaya Lapangan
                </h3>
              </div>
              <button
                id="btn-close-audit-modal"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-600 hover:text-slate-800 p-1"
                aria-label="Tutup Modal Audit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Audit / Observasi *</label>
                <input
                  type="text"
                  required
                  value={auditForm.title}
                  onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
                  placeholder="Misal: Audit Kepatuhan APD Wajib Tower A Lantai 12"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Observasi *</label>
                  <select
                    value={auditForm.inspectionType}
                    onChange={(e) => setAuditForm({ ...auditForm, inspectionType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  >
                    <option value="APD_COMPLIANCE">Audit Kepatuhan APD</option>
                    <option value="UNSAFE_ACT">Unsafe Act (Tindakan Tidak Aman)</option>
                    <option value="UNSAFE_CONDITION">Unsafe Condition (Kondisi Berbahaya)</option>
                    <option value="HOUSEKEEPING_5R">Housekeeping & 5R</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skor Kepatuhan (%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={auditForm.score}
                    onChange={(e) => setAuditForm({ ...auditForm, score: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi *</label>
                  <input
                    type="text"
                    required
                    value={auditForm.location}
                    onChange={(e) => setAuditForm({ ...auditForm, location: e.target.value })}
                    placeholder="Tower A Lantai 12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pengawas *</label>
                  <input
                    type="text"
                    required
                    value={auditForm.inspectorName}
                    onChange={(e) => setAuditForm({ ...auditForm, inspectorName: e.target.value })}
                    placeholder="Tri Handoko (HSE Inspector)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Checklist Kepatuhan APD</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditForm.helmetCompliant}
                      onChange={(e) => setAuditForm({ ...auditForm, helmetCompliant: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-800">Helm Safety Bertali Dagu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditForm.vestCompliant}
                      onChange={(e) => setAuditForm({ ...auditForm, vestCompliant: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-800">Rompi Reflektif (Hi-Vis)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditForm.bootsCompliant}
                      onChange={(e) => setAuditForm({ ...auditForm, bootsCompliant: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-800">Sepatu Safety Toe Cap</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={auditForm.harnessCompliant}
                      onChange={(e) => setAuditForm({ ...auditForm, harnessCompliant: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-800">Body Harness di Ketinggian</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temuan Observasi *</label>
                <textarea
                  required
                  rows={2}
                  value={auditForm.observations}
                  onChange={(e) => setAuditForm({ ...auditForm, observations: e.target.value })}
                  placeholder="Catatan temuan unsafe act atau unsafe condition..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Koreksi *</label>
                <textarea
                  required
                  rows={2}
                  value={auditForm.actionPlan}
                  onChange={(e) => setAuditForm({ ...auditForm, actionPlan: e.target.value })}
                  placeholder="Instruksi perbaikan langsung..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-audit"
                  className="px-4 py-2 font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow transition-colors"
                >
                  Simpan Audit K3
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
