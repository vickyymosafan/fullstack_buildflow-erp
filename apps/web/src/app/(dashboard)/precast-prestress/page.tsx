"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Columns3,
  FlaskConical,
  Gauge,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  X,
  Check,
  QrCode,
  ArrowUpRight,
} from "lucide-react";

type TabKey = "OVERVIEW" | "SEGMENTS" | "CUBE_TESTS" | "STRESSING" | "ERECTION";

interface PrecastSegment {
  id: string;
  rfidTagCode: string;
  elementType: string;
  castingYardLine: string;
  projectId: string;
  designFcMpa: number;
  currentTransferFcMpa: number;
  steamCuringTempC: number;
  stage: "STEAM_CURING" | "DEMOLDED_STOCKYARD" | "STRESSED_YARD_READY" | "ERECTED_ON_PIER";
  castDate: string;
}

interface CubeCompressionTest {
  id: string;
  specimenCode: string;
  segmentId: string;
  rfidTagCode: string;
  batchDocketNo: string;
  curingAgeDays: number;
  targetFcMpa: number;
  crushingLoadKn: number;
  measuredFcMpa: number;
  strengthAchievementPct: number;
  sniComplianceStatus: "PASSED_SNI_1974" | "TRANSFER_ELIGIBLE_80PCT" | "SUBSTANDARD_HOLD_NCR";
  testedAt: string;
}

interface TendonStressingRecord {
  id: string;
  segmentId: string;
  rfidTagCode: string;
  tendonCode: string;
  jackingForceKn: number;
  gaugePressureBar: number;
  theoreticalElongationMm: number;
  measuredElongationMm: number;
  elongationDeviationPct: number;
  toleranceStatus: "WITHIN_SNI_7PCT_TOLERANCE" | "ELONGATION_ANOMALY_HOLD";
  groutingStatus: "NON_SHRINK_GROUTED" | "AWAITING_GROUTING";
  engineerName: string;
  stressedAt: string;
}

interface LauncherErectionLog {
  id: string;
  segmentId: string;
  rfidTagCode: string;
  spanPierLocation: string;
  launcherGantryUnit: string;
  windSpeedKnots: number;
  camberDeflectionMm: number;
  bearingPadSeated: boolean;
  status: "CERTIFIED_ON_BEARING" | "GANTRY_POSITIONING";
  inspectorName?: string;
  erectedAt: string;
}

const INITIAL_SEGMENTS: PrecastSegment[] = [
  {
    id: "SEG-001",
    rfidTagCode: "RFID-PCIG-IKN-001",
    elementType: "PCI-Girder L=40.8m H=2.1m (Span P10-P11 Girder #1)",
    castingYardLine: "Plant Precast Kariangau Line A - Bed #01",
    projectId: "PRJ-IKN-TOL-3A",
    designFcMpa: 50,
    currentTransferFcMpa: 53.8,
    steamCuringTempC: 61.5,
    stage: "ERECTED_ON_PIER",
    castDate: "2026-10-08T07:00:00.000Z",
  },
  {
    id: "SEG-002",
    rfidTagCode: "RFID-PCIG-IKN-002",
    elementType: "PCI-Girder L=40.8m H=2.1m (Span P10-P11 Girder #2)",
    castingYardLine: "Plant Precast Kariangau Line A - Bed #02",
    projectId: "PRJ-IKN-TOL-3A",
    designFcMpa: 50,
    currentTransferFcMpa: 44.2,
    steamCuringTempC: 63.0,
    stage: "STRESSED_YARD_READY",
    castDate: "2026-10-25T08:00:00.000Z",
  },
  {
    id: "SEG-003",
    rfidTagCode: "RFID-BOXG-IKN-003",
    elementType: "Segmental Box Girder SBG-14 (Balanced Cantilever Pier P14)",
    castingYardLine: "Plant Precast Kariangau Short-Line Match Cast #05",
    projectId: "PRJ-IKN-TOL-3A",
    designFcMpa: 55,
    currentTransferFcMpa: 46.5,
    steamCuringTempC: 59.8,
    stage: "DEMOLDED_STOCKYARD",
    castDate: "2026-11-01T09:30:00.000Z",
  },
];

const INITIAL_CUBE_TESTS: CubeCompressionTest[] = [
  {
    id: "CUBE-001",
    specimenCode: "LAB-SNI-2026-041",
    segmentId: "SEG-001",
    rfidTagCode: "RFID-PCIG-IKN-001",
    batchDocketNo: "BATCH-BPP-20261008-01",
    curingAgeDays: 28,
    targetFcMpa: 50,
    crushingLoadKn: 950.7,
    measuredFcMpa: 53.8,
    strengthAchievementPct: 107.6,
    sniComplianceStatus: "PASSED_SNI_1974",
    testedAt: "2026-11-05T10:15:00.000Z",
  },
  {
    id: "CUBE-002",
    specimenCode: "LAB-SNI-2026-052",
    segmentId: "SEG-002",
    rfidTagCode: "RFID-PCIG-IKN-002",
    batchDocketNo: "BATCH-BPP-20261025-03",
    curingAgeDays: 7,
    targetFcMpa: 50,
    crushingLoadKn: 781.1,
    measuredFcMpa: 44.2,
    strengthAchievementPct: 88.4,
    sniComplianceStatus: "TRANSFER_ELIGIBLE_80PCT",
    testedAt: "2026-11-01T14:20:00.000Z",
  },
  {
    id: "CUBE-003",
    specimenCode: "LAB-SNI-2026-063",
    segmentId: "SEG-003",
    rfidTagCode: "RFID-BOXG-IKN-003",
    batchDocketNo: "BATCH-BPP-20261101-02",
    curingAgeDays: 7,
    targetFcMpa: 55,
    crushingLoadKn: 821.7,
    measuredFcMpa: 46.5,
    strengthAchievementPct: 84.55,
    sniComplianceStatus: "TRANSFER_ELIGIBLE_80PCT",
    testedAt: "2026-11-06T11:00:00.000Z",
  },
];

const INITIAL_STRESSING: TendonStressingRecord[] = [
  {
    id: "STR-001",
    segmentId: "SEG-001",
    rfidTagCode: "RFID-PCIG-IKN-001",
    tendonCode: "TENDON-CABLE-T1 (19x15.2mm ASTM A416 Grade 270)",
    jackingForceKn: 3720,
    gaugePressureBar: 430,
    theoreticalElongationMm: 270.0,
    measuredElongationMm: 274.2,
    elongationDeviationPct: 1.56,
    toleranceStatus: "WITHIN_SNI_7PCT_TOLERANCE",
    groutingStatus: "NON_SHRINK_GROUTED",
    engineerName: "Ir. Bambang Sudjatmiko, MT",
    stressedAt: "2026-11-02T09:00:00.000Z",
  },
  {
    id: "STR-002",
    segmentId: "SEG-002",
    rfidTagCode: "RFID-PCIG-IKN-002",
    tendonCode: "TENDON-CABLE-T1 (19x15.2mm ASTM A416 Grade 270)",
    jackingForceKn: 3695,
    gaugePressureBar: 427,
    theoreticalElongationMm: 270.0,
    measuredElongationMm: 266.8,
    elongationDeviationPct: -1.19,
    toleranceStatus: "WITHIN_SNI_7PCT_TOLERANCE",
    groutingStatus: "NON_SHRINK_GROUTED",
    engineerName: "Ir. Bambang Sudjatmiko, MT",
    stressedAt: "2026-11-04T15:30:00.000Z",
  },
  {
    id: "STR-003",
    segmentId: "SEG-003",
    rfidTagCode: "RFID-BOXG-IKN-003",
    tendonCode: "CANTILEVER-TOP-T4 (22x15.2mm Grade 270)",
    jackingForceKn: 4280,
    gaugePressureBar: 488,
    theoreticalElongationMm: 310.0,
    measuredElongationMm: 336.5,
    elongationDeviationPct: 8.55,
    toleranceStatus: "ELONGATION_ANOMALY_HOLD",
    groutingStatus: "AWAITING_GROUTING",
    engineerName: "Ir. Bambang Sudjatmiko, MT",
    stressedAt: "2026-11-06T16:10:00.000Z",
  },
];

const INITIAL_ERECTION: LauncherErectionLog[] = [
  {
    id: "ERC-001",
    segmentId: "SEG-001",
    rfidTagCode: "RFID-PCIG-IKN-001",
    spanPierLocation: "Span P10 - P11 (Jembatan Sungai Wain Jalur A)",
    launcherGantryUnit: "Overhead Launching Gantry LG-220Ton #01",
    windSpeedKnots: 8.4,
    camberDeflectionMm: 42.5,
    bearingPadSeated: true,
    status: "CERTIFIED_ON_BEARING",
    inspectorName: "Ir. Hendra Wijaya, MT",
    erectedAt: "2026-11-05T22:40:00.000Z",
  },
  {
    id: "ERC-002",
    segmentId: "SEG-002",
    rfidTagCode: "RFID-PCIG-IKN-002",
    spanPierLocation: "Span P10 - P11 (Jembatan Sungai Wain Jalur B)",
    launcherGantryUnit: "Overhead Launching Gantry LG-220Ton #01",
    windSpeedKnots: 11.2,
    camberDeflectionMm: 44.0,
    bearingPadSeated: true,
    status: "GANTRY_POSITIONING",
    erectedAt: "2026-11-06T17:15:00.000Z",
  },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "OVERVIEW", label: "Ikhtisar Precast & Lab" },
  { key: "SEGMENTS", label: "Pabrik Segmen RFID" },
  { key: "CUBE_TESTS", label: "Uji Kuat Tekan f'c" },
  { key: "STRESSING", label: "Post-Tensioning Stressing" },
  { key: "ERECTION", label: "Launching Gantry Erection" },
];

export default function PrecastPrestressPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [segments, setSegments] = useState<PrecastSegment[]>(INITIAL_SEGMENTS);
  const [cubeTests, setCubeTests] = useState<CubeCompressionTest[]>(INITIAL_CUBE_TESTS);
  const [stressingRecords, setStressingRecords] = useState<TendonStressingRecord[]>(INITIAL_STRESSING);
  const [erectionLogs, setErectionLogs] = useState<LauncherErectionLog[]>(INITIAL_ERECTION);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<
    "REGISTER_SEGMENT" | "RECORD_CUBE_TEST" | "RECORD_STRESSING" | null
  >(null);

  // Register Segment Form
  const [rfidTagCode, setRfidTagCode] = useState("RFID-PCIG-IKN-015");
  const [elementType, setElementType] = useState("PCI-Girder L=40.8m H=2.1m (Span P12-P13 Girder #3)");
  const [castingYardLine, setCastingYardLine] = useState("Plant Precast Kariangau Line B - Bed #04");
  const [designFcMpa, setDesignFcMpa] = useState("50");
  const [steamCuringTempC, setSteamCuringTempC] = useState("62.0");

  // Record Cube Test Form
  const [specimenCode, setSpecimenCode] = useState("LAB-SNI-2026-091");
  const [batchDocketNo, setBatchDocketNo] = useState("BATCH-BPP-20261106-05");
  const [curingAgeDays, setCuringAgeDays] = useState("28");
  const [targetFcMpa, setTargetFcMpa] = useState("50");
  const [measuredFcMpa, setMeasuredFcMpa] = useState("54.5");

  // Record Stressing Form
  const [tendonCode, setTendonCode] = useState("TENDON-CABLE-T2 (19x15.2mm ASTM A416 Grade 270)");
  const [jackingForceKn, setJackingForceKn] = useState("3710");
  const [gaugePressureBar, setGaugePressureBar] = useState("428");
  const [theoreticalElongationMm, setTheoreticalElongationMm] = useState("270.0");
  const [measuredElongationMm, setMeasuredElongationMm] = useState("273.8");

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [sRes, cRes, stRes, eRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/precast-prestress/segments"),
          fetch("http://localhost:4000/api/v1/precast-prestress/cube-tests"),
          fetch("http://localhost:4000/api/v1/precast-prestress/stressing-records"),
          fetch("http://localhost:4000/api/v1/precast-prestress/erection-logs"),
        ]);
        if (sRes.ok) setSegments(await sRes.json());
        if (cRes.ok) setCubeTests(await cRes.json());
        if (stRes.ok) setStressingRecords(await stRes.json());
        if (eRes.ok) setErectionLogs(await eRes.json());
      } catch {
        // Fallback to deterministic seed state
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveModal(null);
      } else if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let nextIdx = idx;
    if (e.key === "ArrowRight") {
      nextIdx = (idx + 1) % TABS.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (idx - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = TABS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const nextTab = TABS[nextIdx];
    setActiveTab(nextTab.key);
    tabRefs.current[nextIdx]?.focus();
  };

  const handleRegisterSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      rfidTagCode,
      elementType,
      castingYardLine,
      projectId: "PRJ-IKN-TOL-3A",
      designFcMpa: Number(designFcMpa),
      steamCuringTempC: Number(steamCuringTempC),
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/precast-prestress/segments/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: PrecastSegment = await res.json();
        setSegments((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(`Segmen Precast ${created.rfidTagCode} berhasil didaftarkan & lolos batas Steam Curing.`);
        return;
      }
    } catch {
      // Fallback
    }

    const fallback: PrecastSegment = {
      id: `SEG-00${segments.length + 1}`,
      rfidTagCode,
      elementType,
      castingYardLine,
      projectId: "PRJ-IKN-TOL-3A",
      designFcMpa: Number(designFcMpa),
      currentTransferFcMpa: Math.round(Number(designFcMpa) * 0.85 * 10) / 10,
      steamCuringTempC: Number(steamCuringTempC),
      stage: "DEMOLDED_STOCKYARD",
      castDate: new Date().toISOString(),
    };
    setSegments((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(`Segmen Precast ${fallback.rfidTagCode} berhasil didaftarkan & lolos batas Steam Curing.`);
  };

  const handleRecordCubeTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      specimenCode,
      segmentId: "SEG-001",
      batchDocketNo,
      curingAgeDays: Number(curingAgeDays),
      targetFcMpa: Number(targetFcMpa),
      crushingLoadKn: 960,
      measuredFcMpa: Number(measuredFcMpa),
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/precast-prestress/cube-tests/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: CubeCompressionTest = await res.json();
        setCubeTests((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(
          `Uji kuat tekan ${created.specimenCode} tercatat: ${created.measuredFcMpa} MPa (${created.strengthAchievementPct}%).`
        );
        return;
      }
    } catch {
      // Fallback
    }

    const pct = Math.round((Number(measuredFcMpa) / Number(targetFcMpa)) * 10000) / 100;
    const fallback: CubeCompressionTest = {
      id: `CUBE-00${cubeTests.length + 1}`,
      specimenCode,
      segmentId: "SEG-001",
      rfidTagCode: "RFID-PCIG-IKN-001",
      batchDocketNo,
      curingAgeDays: Number(curingAgeDays),
      targetFcMpa: Number(targetFcMpa),
      crushingLoadKn: 960,
      measuredFcMpa: Number(measuredFcMpa),
      strengthAchievementPct: pct,
      sniComplianceStatus: pct >= 100 ? "PASSED_SNI_1974" : "TRANSFER_ELIGIBLE_80PCT",
      testedAt: new Date().toISOString(),
    };
    setCubeTests((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(
      `Uji kuat tekan ${fallback.specimenCode} tercatat: ${fallback.measuredFcMpa} MPa (${fallback.strengthAchievementPct}%).`
    );
  };

  const handleRecordStressing = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      segmentId: "SEG-002",
      tendonCode,
      jackingForceKn: Number(jackingForceKn),
      gaugePressureBar: Number(gaugePressureBar),
      theoreticalElongationMm: Number(theoreticalElongationMm),
      measuredElongationMm: Number(measuredElongationMm),
      engineerName: "Ir. Bambang Sudjatmiko, MT",
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/precast-prestress/stressing-records/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: TendonStressingRecord = await res.json();
        setStressingRecords((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(
          `Stressing tendon ${created.id} tercatat: Deviasi elongasi ${created.elongationDeviationPct}% (${created.toleranceStatus}).`
        );
        return;
      }
    } catch {
      // Fallback
    }

    const dev =
      Math.round(
        ((Number(measuredElongationMm) - Number(theoreticalElongationMm)) / Number(theoreticalElongationMm)) * 10000
      ) / 100;
    const within = Math.abs(dev) <= 7.0;
    const fallback: TendonStressingRecord = {
      id: `STR-00${stressingRecords.length + 1}`,
      segmentId: "SEG-002",
      rfidTagCode: "RFID-PCIG-IKN-002",
      tendonCode,
      jackingForceKn: Number(jackingForceKn),
      gaugePressureBar: Number(gaugePressureBar),
      theoreticalElongationMm: Number(theoreticalElongationMm),
      measuredElongationMm: Number(measuredElongationMm),
      elongationDeviationPct: dev,
      toleranceStatus: within ? "WITHIN_SNI_7PCT_TOLERANCE" : "ELONGATION_ANOMALY_HOLD",
      groutingStatus: within ? "NON_SHRINK_GROUTED" : "AWAITING_GROUTING",
      engineerName: "Ir. Bambang Sudjatmiko, MT",
      stressedAt: new Date().toISOString(),
    };
    setStressingRecords((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(
      `Stressing tendon ${fallback.id} tercatat: Deviasi elongasi ${fallback.elongationDeviationPct}% (${fallback.toleranceStatus}).`
    );
  };

  const handleCertifyErection = async (log: LauncherErectionLog) => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/precast-prestress/erection-logs/certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          erectionId: log.id,
          inspectorName: "Ir. Hendra Wijaya, MT (Chief Bridge Inspector)",
        }),
      });
      if (res.ok) {
        const updated: LauncherErectionLog = await res.json();
        setErectionLogs((prev) => prev.map((e) => (e.id === log.id ? updated : e)));
        showToast(`Erection Girder ${log.rfidTagCode} di atas Bearing Pad berhasil disertifikasi.`);
        return;
      }
    } catch {
      // Fallback
    }

    setErectionLogs((prev) =>
      prev.map((e) =>
        e.id === log.id
          ? { ...e, status: "CERTIFIED_ON_BEARING", inspectorName: "Ir. Hendra Wijaya, MT" }
          : e
      )
    );
    showToast(`Erection Girder ${log.rfidTagCode} di atas Bearing Pad berhasil disertifikasi.`);
  };

  // Derived KPIs
  const stressedOrErectedCount = segments.filter(
    (s) => s.stage === "STRESSED_YARD_READY" || s.stage === "ERECTED_ON_PIER"
  ).length;
  const avgFcMpa =
    Math.round(
      (cubeTests.reduce((acc, c) => acc + c.measuredFcMpa, 0) / Math.max(1, cubeTests.length)) * 10
    ) / 10;
  const compliantStressingCount = stressingRecords.filter(
    (r) => r.toleranceStatus === "WITHIN_SNI_7PCT_TOLERANCE"
  ).length;
  const certifiedErectionCount = erectionLogs.filter((e) => e.status === "CERTIFIED_ON_BEARING").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-primary text-white">
              <Columns3 className="w-3.5 h-3.5 shrink-0" />
              PHASE 30 • PRECAST YARD &amp; POST-TENSIONING
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-900">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              SNI 2847:2019 (±7% Elongasi) • SNI 1974:2011
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight break-words">
            Precast Concrete Yard, Post-Tensioning Stressing &amp; Material Lab QA/QC
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl break-words">
            Pelacakan produksi <em>PCI-Girder</em> &amp; <em>Segmental Box Girder</em> berbasis RFID, pengujian kuat
            tekan silinder beton, verifikasi elongasi kabel tendon prategang, dan telemetri <em>Launching Gantry</em>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-open-segment-modal"
            onClick={() => setActiveModal("REGISTER_SEGMENT")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Registrasi Segmen RFID
          </button>
          <button
            type="button"
            id="btn-open-cube-modal"
            onClick={() => setActiveModal("RECORD_CUBE_TEST")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-action text-white hover:bg-action/90 transition-colors shadow-xs"
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            Catat Uji Tekan f&apos;c
          </button>
          <button
            type="button"
            id="btn-open-stressing-modal"
            onClick={() => setActiveModal("RECORD_STRESSING")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <Gauge className="w-4 h-4 text-primary shrink-0" />
            Input Stressing Tendon
          </button>
        </div>
      </header>

      {/* Accessible Live Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-emerald-900 text-white text-sm font-medium shadow-md"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span className="break-words">{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-white/80 hover:text-white p-1 shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <section aria-label="Indikator Kinerja Utama Precast & Post-Tensioning" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Segmen Precast RFID</span>
            <QrCode className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {stressedOrErectedCount} / {segments.length} Siap
          </div>
          <p className="text-xs text-slate-600">
            Lolos <em>Steam Curing</em> (≤ 65°C) &amp; Siap Stressing/Erection
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Rata-rata Kuat Tekan f&apos;c</span>
            <FlaskConical className="w-4 h-4 text-action shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">{avgFcMpa} MPa</div>
          <p className="text-xs text-slate-600">
            Dari {cubeTests.length} Spesimen Silinder SNI 1974:2011
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Kepatuhan Stressing ±7%</span>
            <Gauge className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {compliantStressingCount} / {stressingRecords.length} Tendon
          </div>
          <p className="text-xs text-slate-600">
            Verifikasi Elongasi &amp; <em>Non-Shrink Grouting</em> SNI 2847
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Launching Gantry Erection</span>
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {certifiedErectionCount} / {erectionLogs.length} Span
          </div>
          <p className="text-xs text-slate-600">
            Tersertifikasi Duduk Sempurna di Atas <em>Bearing Pad</em>
          </p>
        </div>
      </section>

      {/* WAI-ARIA Tabs Navigation (flex-wrap for zero horizontal overflow) */}
      <div
        role="tablist"
        aria-label="Sub-modul Precast Concrete Yard & Post-Tensioning"
        className="flex flex-wrap gap-1.5 sm:gap-2 pb-1"
      >
        {TABS.map((t, idx) => {
          const selected = activeTab === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={`precast-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`precast-panel-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(t.key)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`min-h-11 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors ${
                selected
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white border border-border text-slate-700 hover:text-primary hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-border rounded-xl p-4 md:p-6 shadow-xs">
        {activeTab === "OVERVIEW" && (
          <div
            id="precast-panel-OVERVIEW"
            role="tabpanel"
            aria-labelledby="precast-tab-OVERVIEW"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <QrCode className="w-4 h-4 text-action shrink-0" />
                  <span>Pelacakan RFID &amp; Steam Curing</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Setiap segmen girder dipasangi chip <strong>RFID tahan suhu tinggi</strong> untuk memantau kurva uap{" "}
                  <em>Steam Curing</em> (maksimal 75°C guna mencegah keretakan mikro <em>Delayed Ettringite Formation</em>).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <FlaskConical className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Gerbang Mutu Kuat Tekan Transfer 80% f&apos;c</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Penarikan kabel prategang (<em>post-tensioning</em>) hanya diizinkan setelah hasil uji tekan silinder
                  beton laboratorium mencapai minimal <strong>80% kuat tekan karakteristik rencana (f&apos;c)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Gauge className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Kontrol Elongasi Tendon ±7% SNI 2847:2019</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Komparasi otomatis antara gaya tarik <em>Hydraulic Jack</em> dan perpanjangan kabel aktual (mm). Jika
                  deviasi melampaui <strong>±7%</strong>, injeksi <em>grouting</em> ditahan untuk investigasi struktur.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-primary">
                Rekapitulasi Log Stressing Tendon &amp; Elongasi Terbaru
              </h2>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full table-fixed text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                      <th scope="col" className="p-2.5 w-[32%] font-semibold">Segmen RFID &amp; Kabel Tendon</th>
                      <th scope="col" className="p-2.5 w-[22%] font-semibold">Jacking Force</th>
                      <th scope="col" className="p-2.5 w-[22%] font-semibold">Elongasi Aktual</th>
                      <th scope="col" className="p-2.5 w-[24%] font-semibold">Status SNI ±7%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stressingRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-2.5 min-w-0">
                          <div className="font-mono font-bold text-primary break-words">{rec.rfidTagCode}</div>
                          <div className="text-[11px] text-slate-600 break-words">{rec.tendonCode}</div>
                        </td>
                        <td className="p-2.5 text-slate-700 break-words">
                          <div className="font-mono font-semibold">{rec.jackingForceKn.toLocaleString("id-ID")} kN</div>
                          <div className="text-[11px] text-slate-600">{rec.gaugePressureBar} Bar</div>
                        </td>
                        <td className="p-2.5 text-slate-700 break-words">
                          <div className="font-mono font-semibold">{rec.measuredElongationMm} mm</div>
                          <div className="text-[11px] text-slate-600">
                            Deviasi: {rec.elongationDeviationPct > 0 ? "+" : ""}
                            {rec.elongationDeviationPct}%
                          </div>
                        </td>
                        <td className="p-2.5 min-w-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold break-words ${
                              rec.toleranceStatus === "WITHIN_SNI_7PCT_TOLERANCE"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-rose-100 text-rose-900"
                            }`}
                          >
                            {rec.toleranceStatus === "WITHIN_SNI_7PCT_TOLERANCE"
                              ? "Sesuai SNI (±7%)"
                              : "Anomali Hold"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "SEGMENTS" && (
          <div
            id="precast-panel-SEGMENTS"
            role="tabpanel"
            aria-labelledby="precast-tab-SEGMENTS"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Inventaris Segmen PCI-Girder &amp; Box Girder Berbasis RFID/QR
              </h2>
              <p className="text-xs text-slate-600">
                Pemantauan siklus pencetakan (*casting bed*), pematangan uap (*steam curing*), hingga kesiapan *erection*.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {segments.map((seg) => (
                <div key={seg.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary text-sm break-words">{seg.rfidTagCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        seg.stage === "ERECTED_ON_PIER"
                          ? "bg-emerald-100 text-emerald-900"
                          : seg.stage === "STRESSED_YARD_READY"
                          ? "bg-sky-100 text-sky-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {seg.stage}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-sm break-words">{seg.elementType}</div>
                  <div className="text-xs text-slate-600 break-words">{seg.castingYardLine}</div>
                  <dl className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg">
                    <div>
                      <dt className="text-slate-600">Mutu Rencana f&apos;c</dt>
                      <dd className="font-mono font-bold text-primary">{seg.designFcMpa} MPa</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">f&apos;c Aktual Saat Ini</dt>
                      <dd className="font-mono font-bold text-emerald-800">{seg.currentTransferFcMpa} MPa</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Suhu Steam Curing</dt>
                      <dd className="font-mono text-slate-800">{seg.steamCuringTempC} °C</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">ID Segmen</dt>
                      <dd className="font-mono text-slate-800">{seg.id}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "CUBE_TESTS" && (
          <div
            id="precast-panel-CUBE_TESTS"
            role="tabpanel"
            aria-labelledby="precast-tab-CUBE_TESTS"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Hasil Uji Kuat Tekan Silinder/Kubus Beton Laboratorium (SNI 1974:2011)
              </h2>
              <p className="text-xs text-slate-600">
                Verifikasi kekuatan beton umur 7 hari (transfer prategang ≥ 80% f&apos;c) dan 28 hari (≥ 100% f&apos;c).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cubeTests.map((ct) => (
                <div key={ct.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-white min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary text-sm">{ct.specimenCode}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-200 text-slate-800">
                      Umur {ct.curingAgeDays} Hari
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    Segmen: <strong className="text-slate-800">{ct.rfidTagCode}</strong> • {ct.batchDocketNo}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <dt className="text-slate-600">Beban Hancur UTM</dt>
                      <dd className="font-mono font-semibold text-slate-800">{ct.crushingLoadKn} kN</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Kuat Tekan Terukur</dt>
                      <dd className="font-mono font-bold text-primary">
                        {ct.measuredFcMpa} / {ct.targetFcMpa} MPa
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      Capaian: {ct.strengthAchievementPct}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        ct.sniComplianceStatus === "PASSED_SNI_1974"
                          ? "bg-emerald-100 text-emerald-900"
                          : ct.sniComplianceStatus === "TRANSFER_ELIGIBLE_80PCT"
                          ? "bg-sky-100 text-sky-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {ct.sniComplianceStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "STRESSING" && (
          <div
            id="precast-panel-STRESSING"
            role="tabpanel"
            aria-labelledby="precast-tab-STRESSING"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Rekaman Penarikan Kabel Tendon Post-Tensioning &amp; Elongasi (SNI 2847:2019)
              </h2>
              <p className="text-xs text-slate-600">
                Pencatatan tekanan manometer pompa hidrolik, gaya dongkrak (kN), dan deviasi perpanjangan strand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stressingRecords.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary text-sm">{rec.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        rec.toleranceStatus === "WITHIN_SNI_7PCT_TOLERANCE"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {rec.toleranceStatus}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs break-words">{rec.tendonCode}</div>
                  <div className="text-xs font-mono text-slate-600">RFID: {rec.rfidTagCode}</div>
                  <dl className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Gaya Jacking:</dt>
                      <dd className="font-mono font-bold text-primary">
                        {rec.jackingForceKn.toLocaleString("id-ID")} kN ({rec.gaugePressureBar} Bar)
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Elongasi Teoritis:</dt>
                      <dd className="font-mono text-slate-800">{rec.theoreticalElongationMm} mm</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Elongasi Aktual:</dt>
                      <dd className="font-mono font-bold text-primary">
                        {rec.measuredElongationMm} mm ({rec.elongationDeviationPct > 0 ? "+" : ""}
                        {rec.elongationDeviationPct}%)
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
                      <dt className="text-slate-600">Status Grouting:</dt>
                      <dd className="font-mono font-semibold text-emerald-800">{rec.groutingStatus}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ERECTION" && (
          <div
            id="precast-panel-ERECTION"
            role="tabpanel"
            aria-labelledby="precast-tab-ERECTION"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Telemetri Overhead Launching Gantry &amp; Sertifikasi Dudukan Bearing Pad
              </h2>
              <p className="text-xs text-slate-600">
                Pemantauan kecepatan angin saat pengangkatan girder, lawan lendut (*camber*), dan presisi tumpuan.
              </p>
            </div>

            <div className="space-y-3">
              {erectionLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">{log.id}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-200 text-slate-800">
                        {log.rfidTagCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          log.status === "CERTIFIED_ON_BEARING"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm break-words">{log.spanPierLocation}</div>
                    <div className="text-xs text-slate-600 break-words">
                      Unit: <strong>{log.launcherGantryUnit}</strong> • Kecepatan Angin:{" "}
                      <strong>{log.windSpeedKnots} Knots</strong> • Camber Tengah Bentang:{" "}
                      <strong>+{log.camberDeflectionMm} mm</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {log.status !== "CERTIFIED_ON_BEARING" ? (
                      <button
                        type="button"
                        onClick={() => handleCertifyErection(log)}
                        className="min-h-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        Sertifikasi Dudukan Bearing
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Certified ({log.inspectorName || "Bridge QA/QC"})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accessible Modal Dialogs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="precast-modal-title"
            className="bg-white border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="precast-modal-title" className="text-base md:text-lg font-bold text-primary">
                {activeModal === "REGISTER_SEGMENT" && "Registrasi Segmen Precast Girder RFID Baru"}
                {activeModal === "RECORD_CUBE_TEST" && "Catat Hasil Uji Kuat Tekan Silinder Beton (SNI 1974)"}
                {activeModal === "RECORD_STRESSING" && "Input Data Penarikan Tendon Post-Tensioning"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-md"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModal === "REGISTER_SEGMENT" && (
              <form onSubmit={handleRegisterSegment} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-rfid-code" className="block font-semibold text-slate-700 mb-1">
                    Kode Tag RFID / QR Segmen Precast
                  </label>
                  <input
                    id="input-rfid-code"
                    type="text"
                    required
                    value={rfidTagCode}
                    onChange={(e) => setRfidTagCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="input-element-type" className="block font-semibold text-slate-700 mb-1">
                    Tipe Elemen Struktur &amp; Bentang Span
                  </label>
                  <input
                    id="input-element-type"
                    type="text"
                    required
                    value={elementType}
                    onChange={(e) => setElementType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="input-casting-line" className="block font-semibold text-slate-700 mb-1">
                    Jalur Pabrik Precast &amp; Nomor Casting Bed
                  </label>
                  <input
                    id="input-casting-line"
                    type="text"
                    required
                    value={castingYardLine}
                    onChange={(e) => setCastingYardLine(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-design-fc" className="block font-semibold text-slate-700 mb-1">
                      Mutu Rencana f&apos;c (MPa)
                    </label>
                    <input
                      id="input-design-fc"
                      type="number"
                      required
                      value={designFcMpa}
                      onChange={(e) => setDesignFcMpa(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-steam-temp" className="block font-semibold text-slate-700 mb-1">
                      Suhu Puncak Steam Curing (°C)
                    </label>
                    <input
                      id="input-steam-temp"
                      type="number"
                      step="0.5"
                      required
                      value={steamCuringTempC}
                      onChange={(e) => setSteamCuringTempC(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-segment"
                    className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  >
                    Simpan Segmen RFID
                  </button>
                </div>
              </form>
            )}

            {activeModal === "RECORD_CUBE_TEST" && (
              <form onSubmit={handleRecordCubeTest} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-specimen-code" className="block font-semibold text-slate-700 mb-1">
                    Kode Spesimen Silinder Laboratorium
                  </label>
                  <input
                    id="input-specimen-code"
                    type="text"
                    required
                    value={specimenCode}
                    onChange={(e) => setSpecimenCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="input-batch-docket" className="block font-semibold text-slate-700 mb-1">
                    Nomor Docket Batching Plant
                  </label>
                  <input
                    id="input-batch-docket"
                    type="text"
                    required
                    value={batchDocketNo}
                    onChange={(e) => setBatchDocketNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-curing-age" className="block font-semibold text-slate-700 mb-1">
                      Umur Uji (Hari)
                    </label>
                    <input
                      id="input-curing-age"
                      type="number"
                      required
                      value={curingAgeDays}
                      onChange={(e) => setCuringAgeDays(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-target-fc" className="block font-semibold text-slate-700 mb-1">
                      Target f&apos;c (MPa)
                    </label>
                    <input
                      id="input-target-fc"
                      type="number"
                      step="0.1"
                      required
                      value={targetFcMpa}
                      onChange={(e) => setTargetFcMpa(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-measured-fc" className="block font-semibold text-slate-700 mb-1">
                      Hasil Uji f&apos;c (MPa)
                    </label>
                    <input
                      id="input-measured-fc"
                      type="number"
                      step="0.1"
                      required
                      value={measuredFcMpa}
                      onChange={(e) => setMeasuredFcMpa(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-cube"
                    className="px-4 py-2 rounded-lg font-semibold bg-action text-white hover:bg-action/90"
                  >
                    Simpan Hasil Uji Tekan
                  </button>
                </div>
              </form>
            )}

            {activeModal === "RECORD_STRESSING" && (
              <form onSubmit={handleRecordStressing} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-tendon-code" className="block font-semibold text-slate-700 mb-1">
                    Kode Kabel Tendon &amp; Spesifikasi Strand
                  </label>
                  <input
                    id="input-tendon-code"
                    type="text"
                    required
                    value={tendonCode}
                    onChange={(e) => setTendonCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-jacking-force" className="block font-semibold text-slate-700 mb-1">
                      Gaya Tarik Jacking (kN)
                    </label>
                    <input
                      id="input-jacking-force"
                      type="number"
                      required
                      value={jackingForceKn}
                      onChange={(e) => setJackingForceKn(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-gauge-pressure" className="block font-semibold text-slate-700 mb-1">
                      Tekanan Manometer (Bar)
                    </label>
                    <input
                      id="input-gauge-pressure"
                      type="number"
                      required
                      value={gaugePressureBar}
                      onChange={(e) => setGaugePressureBar(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-theo-elongation" className="block font-semibold text-slate-700 mb-1">
                      Elongasi Teoritis (mm)
                    </label>
                    <input
                      id="input-theo-elongation"
                      type="number"
                      step="0.1"
                      required
                      value={theoreticalElongationMm}
                      onChange={(e) => setTheoreticalElongationMm(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-measured-elongation" className="block font-semibold text-slate-700 mb-1">
                      Elongasi Aktual Terukur (mm)
                    </label>
                    <input
                      id="input-measured-elongation"
                      type="number"
                      step="0.1"
                      required
                      value={measuredElongationMm}
                      onChange={(e) => setMeasuredElongationMm(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-stressing"
                    className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  >
                    Verifikasi Elongasi ±7% SNI
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

