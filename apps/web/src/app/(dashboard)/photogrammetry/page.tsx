"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Scan,
  Compass,
  Layers,
  Mountain,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
  Check,
  Sparkles,
  Crosshair,
} from "lucide-react";

type TabKey = "OVERVIEW" | "MISSIONS" | "POINT_CLOUDS" | "EARTHWORK" | "AI_INSPECTIONS";

interface FlightMission {
  id: string;
  missionCode: string;
  projectId: string;
  projectName: string;
  uavModel: string;
  pilotName: string;
  altitudeAglMeters: number;
  overlapPct: number;
  gsdCmPerPx: number;
  gcpCount: number;
  notamPermitRef: string;
  kkopAirspaceStatus: "KKOP_CLEARED" | "SPECIAL_NOTAM_APPROVED";
  status: "COMPLETED_ORTHO_LIDAR" | "PROCESSING_SFM_CLOUD" | "FLIGHT_SCHEDULED";
  rmseAccuracyCm: number;
  densePointsCount: number;
  capturedPhotosCount: number;
  executedAt: string;
}

interface PointCloudModel {
  id: string;
  missionId: string;
  missionCode: string;
  projectName: string;
  crsepsg: string;
  format: "LAZ_COPC_1_4" | "GEOTIFF_DSM_DTM" | "3D_TILES_CESIUM";
  densePointsCount: number;
  orthomosaicResolutionCm: number;
  rmseZCm: number;
  fileSizeGb: number;
  opnameReady: boolean;
  generatedAt: string;
}

interface EarthworkVolumeRecord {
  id: string;
  corridorSegment: string;
  projectId: string;
  missionId: string;
  boqTargetCutM3: number;
  measuredCutM3: number;
  cutProgressPct: number;
  boqTargetFillM3: number;
  measuredFillM3: number;
  fillProgressPct: number;
  netMassBalanceM3: number;
  compactionFactor: number;
  opnameVerificationStatus: "CERTIFIED_FOR_MC" | "VARIANCE_AUDIT_REQUIRED" | "IN_PROGRESS";
  calculatedAt: string;
}

interface AiVisualDefectRecord {
  id: string;
  structureElement: string;
  projectId: string;
  missionId: string;
  defectType: "STRUCTURAL_CRACK" | "CONCRETE_SPALLING" | "EXPOSED_REBAR_CORROSION" | "WATER_SEEPAGE_HONEYCOMB";
  crackWidthMm: number;
  defectExtentMeters: number;
  aiConfidencePct: number;
  sniSeverityGrade: "CRITICAL_SNI_BREACH" | "MODERATE_REPAIR_NEEDED" | "HAIRLINE_MONITORING";
  status: "OPEN_NCR_RAISED" | "REMEDIATED_VERIFIED";
  inspectorName?: string;
  remediationNotes?: string;
  detectedAt: string;
  resolvedAt?: string;
}

const INITIAL_MISSIONS: FlightMission[] = [
  {
    id: "MSN-001",
    missionCode: "MSN-IKN-2026-001",
    projectId: "PRJ-IKN-TOL-3A",
    projectName: "Tol IKN Seksi 3A (Segmen Karang Joang - KKT Kariangau)",
    uavModel: "DJI Matrice 350 RTK + Zenmuse L2 LiDAR",
    pilotName: "Capt. Raka Pratama (DKPPU #8841)",
    altitudeAglMeters: 90,
    overlapPct: 80,
    gsdCmPerPx: 1.35,
    gcpCount: 14,
    notamPermitRef: "AIRNAV-BPN-0192/2026",
    kkopAirspaceStatus: "KKOP_CLEARED",
    status: "COMPLETED_ORTHO_LIDAR",
    rmseAccuracyCm: 1.42,
    densePointsCount: 64200000,
    capturedPhotosCount: 1480,
    executedAt: "2026-11-05T08:30:00.000Z",
  },
  {
    id: "MSN-002",
    missionCode: "MSN-IKN-2026-002",
    projectId: "PRJ-IKN-TOL-3A",
    projectName: "Jembatan Sungai Wain & Overpass STA 14+200",
    uavModel: "DJI Mavic 3 Enterprise RTK (Close-Range Oblique)",
    pilotName: "Capt. Dimas Anggara (DKPPU #9104)",
    altitudeAglMeters: 45,
    overlapPct: 85,
    gsdCmPerPx: 0.65,
    gcpCount: 8,
    notamPermitRef: "AIRNAV-BPN-0205/2026",
    kkopAirspaceStatus: "KKOP_CLEARED",
    status: "COMPLETED_ORTHO_LIDAR",
    rmseAccuracyCm: 0.95,
    densePointsCount: 38900000,
    capturedPhotosCount: 920,
    executedAt: "2026-11-06T09:15:00.000Z",
  },
  {
    id: "MSN-003",
    missionCode: "MSN-BDG-2026-003",
    projectId: "PRJ-BENDUNGAN-02",
    projectName: "Bendungan Sepaku Semoi Paket II (Spillway & Main Dam)",
    uavModel: "WingtraOne Gen II PPK Fixed-Wing + Sony RX1R II 42MP",
    pilotName: "Capt. Fajar Nugroho (DKPPU #7732)",
    altitudeAglMeters: 115,
    overlapPct: 75,
    gsdCmPerPx: 1.5,
    gcpCount: 18,
    notamPermitRef: "AIRNAV-BPN-0219/2026",
    kkopAirspaceStatus: "KKOP_CLEARED",
    status: "PROCESSING_SFM_CLOUD",
    rmseAccuracyCm: 1.85,
    densePointsCount: 51400000,
    capturedPhotosCount: 2150,
    executedAt: "2026-11-06T14:40:00.000Z",
  },
];

const INITIAL_POINT_CLOUDS: PointCloudModel[] = [
  {
    id: "PCL-001",
    missionId: "MSN-001",
    missionCode: "MSN-IKN-2026-001",
    projectName: "Tol IKN Seksi 3A (STA 10+000 - STA 13+200)",
    crsepsg: "EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)",
    format: "LAZ_COPC_1_4",
    densePointsCount: 64200000,
    orthomosaicResolutionCm: 1.35,
    rmseZCm: 1.42,
    fileSizeGb: 14.8,
    opnameReady: true,
    generatedAt: "2026-11-05T13:10:00.000Z",
  },
  {
    id: "PCL-002",
    missionId: "MSN-002",
    missionCode: "MSN-IKN-2026-002",
    projectName: "Jembatan Sungai Wain 3D Mesh & Close-Range Point Cloud",
    crsepsg: "EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)",
    format: "3D_TILES_CESIUM",
    densePointsCount: 38900000,
    orthomosaicResolutionCm: 0.65,
    rmseZCm: 0.95,
    fileSizeGb: 9.4,
    opnameReady: true,
    generatedAt: "2026-11-06T12:45:00.000Z",
  },
  {
    id: "PCL-003",
    missionId: "MSN-001",
    missionCode: "MSN-IKN-2026-001",
    projectName: "Digital Terrain Model (DTM Bare-Earth LiDAR Classified)",
    crsepsg: "EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)",
    format: "GEOTIFF_DSM_DTM",
    densePointsCount: 29500000,
    orthomosaicResolutionCm: 2.0,
    rmseZCm: 1.42,
    fileSizeGb: 4.2,
    opnameReady: true,
    generatedAt: "2026-11-05T14:00:00.000Z",
  },
];

const INITIAL_EARTHWORK: EarthworkVolumeRecord[] = [
  {
    id: "VOL-001",
    corridorSegment: "STA 10+000 - STA 11+500 (Galian Bukit & Timbunan Badan Jalan)",
    projectId: "PRJ-IKN-TOL-3A",
    missionId: "MSN-001",
    boqTargetCutM3: 85000,
    measuredCutM3: 81600,
    cutProgressPct: 96.0,
    boqTargetFillM3: 62000,
    measuredFillM3: 59800,
    fillProgressPct: 96.45,
    netMassBalanceM3: 21800,
    compactionFactor: 1.15,
    opnameVerificationStatus: "CERTIFIED_FOR_MC",
    calculatedAt: "2026-11-05T15:20:00.000Z",
  },
  {
    id: "VOL-002",
    corridorSegment: "STA 11+500 - STA 13+200 (Zona Rawa & Disposal Area C)",
    projectId: "PRJ-IKN-TOL-3A",
    missionId: "MSN-001",
    boqTargetCutM3: 54000,
    measuredCutM3: 48200,
    cutProgressPct: 89.26,
    boqTargetFillM3: 71000,
    measuredFillM3: 64500,
    fillProgressPct: 90.85,
    netMassBalanceM3: -16300,
    compactionFactor: 1.12,
    opnameVerificationStatus: "CERTIFIED_FOR_MC",
    calculatedAt: "2026-11-05T16:05:00.000Z",
  },
  {
    id: "VOL-003",
    corridorSegment: "Main Dam Spillway Excavation Zone A (Bendungan Sepaku)",
    projectId: "PRJ-BENDUNGAN-02",
    missionId: "MSN-003",
    boqTargetCutM3: 110000,
    measuredCutM3: 118500,
    cutProgressPct: 107.73,
    boqTargetFillM3: 45000,
    measuredFillM3: 41200,
    fillProgressPct: 91.56,
    netMassBalanceM3: 77300,
    compactionFactor: 1.18,
    opnameVerificationStatus: "VARIANCE_AUDIT_REQUIRED",
    calculatedAt: "2026-11-06T16:10:00.000Z",
  },
];

const INITIAL_DEFECTS: AiVisualDefectRecord[] = [
  {
    id: "CV-DEF-001",
    structureElement: "Pier Head P-12 Jembatan Sungai Wain (Sisi Utara)",
    projectId: "PRJ-IKN-TOL-3A",
    missionId: "MSN-002",
    defectType: "STRUCTURAL_CRACK",
    crackWidthMm: 0.48,
    defectExtentMeters: 1.65,
    aiConfidencePct: 97.2,
    sniSeverityGrade: "CRITICAL_SNI_BREACH",
    status: "OPEN_NCR_RAISED",
    detectedAt: "2026-11-06T13:10:00.000Z",
  },
  {
    id: "CV-DEF-002",
    structureElement: "Box Girder Span 4 Segmen B-08 (Soffit Bawah)",
    projectId: "PRJ-IKN-TOL-3A",
    missionId: "MSN-002",
    defectType: "CONCRETE_SPALLING",
    crackWidthMm: 0.25,
    defectExtentMeters: 0.85,
    aiConfidencePct: 94.8,
    sniSeverityGrade: "MODERATE_REPAIR_NEEDED",
    status: "OPEN_NCR_RAISED",
    detectedAt: "2026-11-06T13:25:00.000Z",
  },
  {
    id: "CV-DEF-003",
    structureElement: "Dinding Wingwall Abutment A-1 Tol IKN",
    projectId: "PRJ-IKN-TOL-3A",
    missionId: "MSN-001",
    defectType: "WATER_SEEPAGE_HONEYCOMB",
    crackWidthMm: 0.15,
    defectExtentMeters: 0.4,
    aiConfidencePct: 92.1,
    sniSeverityGrade: "HAIRLINE_MONITORING",
    status: "REMEDIATED_VERIFIED",
    inspectorName: "Ir. Hendra Wijaya, MT",
    remediationNotes: "Patching mortar non-shrink SikaGrout-215 & coating kristalisasi kedap air selesai.",
    detectedAt: "2026-11-05T17:00:00.000Z",
    resolvedAt: "2026-11-06T10:30:00.000Z",
  },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "OVERVIEW", label: "Ikhtisar Geospasial" },
  { key: "MISSIONS", label: "Misi Terbang UAV" },
  { key: "POINT_CLOUDS", label: "3D Point Cloud" },
  { key: "EARTHWORK", label: "Volume Cut & Fill" },
  { key: "AI_INSPECTIONS", label: "Inspeksi Defek AI" },
];

export default function PhotogrammetryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [missions, setMissions] = useState<FlightMission[]>(INITIAL_MISSIONS);
  const [pointClouds, setPointClouds] = useState<PointCloudModel[]>(INITIAL_POINT_CLOUDS);
  const [earthworkVolumes, setEarthworkVolumes] = useState<EarthworkVolumeRecord[]>(INITIAL_EARTHWORK);
  const [aiDefects, setAiDefects] = useState<AiVisualDefectRecord[]>(INITIAL_DEFECTS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<
    "REGISTER_MISSION" | "CALCULATE_VOLUME" | "RUN_AI_INSPECTION" | null
  >(null);

  // Form states for Register Mission
  const [missionCode, setMissionCode] = useState("MSN-IKN-2026-009");
  const [projectName, setProjectName] = useState("Tol IKN Seksi 3A (STA 13+500 - STA 15+200)");
  const [uavModel, setUavModel] = useState("DJI Matrice 350 RTK + Zenmuse L2 LiDAR");
  const [pilotName, setPilotName] = useState("Capt. Raka Pratama (DKPPU #8841)");
  const [altitudeAglMeters, setAltitudeAglMeters] = useState("95");
  const [gcpCount, setGcpCount] = useState("12");
  const [notamPermitRef, setNotamPermitRef] = useState("AIRNAV-BPN-0244/2026");

  // Form states for Calculate Volume
  const [corridorSegment, setCorridorSegment] = useState("STA 13+200 - STA 14+500 (Zona Galian Tanah & Embankment)");
  const [boqTargetCutM3, setBoqTargetCutM3] = useState("64000");
  const [measuredCutM3, setMeasuredCutM3] = useState("61500");
  const [boqTargetFillM3, setBoqTargetFillM3] = useState("48000");
  const [measuredFillM3, setMeasuredFillM3] = useState("46200");

  // Form states for Run AI Inspection
  const [structureElement, setStructureElement] = useState("Pilar Pier P-14 Jembatan Sungai Wain");
  const [defectType, setDefectType] = useState<AiVisualDefectRecord["defectType"]>("STRUCTURAL_CRACK");
  const [crackWidthMm, setCrackWidthMm] = useState("0.42");
  const [defectExtentMeters, setDefectExtentMeters] = useState("1.50");

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
        const [mRes, pRes, eRes, aRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/photogrammetry/missions"),
          fetch("http://localhost:4000/api/v1/photogrammetry/point-clouds"),
          fetch("http://localhost:4000/api/v1/photogrammetry/earthwork-volumes"),
          fetch("http://localhost:4000/api/v1/photogrammetry/ai-inspections"),
        ]);
        if (mRes.ok) setMissions(await mRes.json());
        if (pRes.ok) setPointClouds(await pRes.json());
        if (eRes.ok) setEarthworkVolumes(await eRes.json());
        if (aRes.ok) setAiDefects(await aRes.json());
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

  const handleRegisterMission = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      missionCode,
      projectId: "PRJ-IKN-TOL-3A",
      projectName,
      uavModel,
      pilotName,
      altitudeAglMeters: Number(altitudeAglMeters),
      overlapPct: 80,
      gsdCmPerPx: 1.35,
      gcpCount: Number(gcpCount),
      notamPermitRef,
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/photogrammetry/missions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: FlightMission = await res.json();
        setMissions((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(`Misi terbang drone ${created.missionCode} berhasil didaftarkan & lolos verifikasi KKOP.`);
        return;
      }
    } catch {
      // Fallback
    }

    const fallback: FlightMission = {
      id: `MSN-00${missions.length + 1}`,
      missionCode,
      projectId: "PRJ-IKN-TOL-3A",
      projectName,
      uavModel,
      pilotName,
      altitudeAglMeters: Number(altitudeAglMeters),
      overlapPct: 80,
      gsdCmPerPx: 1.35,
      gcpCount: Number(gcpCount),
      notamPermitRef,
      kkopAirspaceStatus: Number(altitudeAglMeters) > 120 ? "SPECIAL_NOTAM_APPROVED" : "KKOP_CLEARED",
      status: "PROCESSING_SFM_CLOUD",
      rmseAccuracyCm: 1.45,
      densePointsCount: 44500000,
      capturedPhotosCount: 1240,
      executedAt: new Date().toISOString(),
    };
    setMissions((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(`Misi terbang drone ${fallback.missionCode} berhasil didaftarkan & lolos verifikasi KKOP.`);
  };

  const handleCompleteMissionProcessing = async (mission: FlightMission) => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/photogrammetry/missions/complete-processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: mission.id,
          densePointsCount: 58400000,
          rmseAccuracyCm: 1.38,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMissions((prev) => prev.map((m) => (m.id === mission.id ? data.mission : m)));
        setPointClouds((prev) => [data.pointCloud, ...prev]);
        showToast(`Pemrosesan SfM & LiDAR untuk ${mission.missionCode} selesai (RMSE: 1.38 cm).`);
        return;
      }
    } catch {
      // Fallback
    }

    setMissions((prev) =>
      prev.map((m) =>
        m.id === mission.id
          ? { ...m, status: "COMPLETED_ORTHO_LIDAR", densePointsCount: 58400000, rmseAccuracyCm: 1.38 }
          : m
      )
    );
    showToast(`Pemrosesan SfM & LiDAR untuk ${mission.missionCode} selesai (RMSE: 1.38 cm).`);
  };

  const handleCalculateEarthwork = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      corridorSegment,
      projectId: "PRJ-IKN-TOL-3A",
      missionId: "MSN-001",
      boqTargetCutM3: Number(boqTargetCutM3),
      measuredCutM3: Number(measuredCutM3),
      boqTargetFillM3: Number(boqTargetFillM3),
      measuredFillM3: Number(measuredFillM3),
      compactionFactor: 1.12,
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/photogrammetry/earthwork-volumes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: EarthworkVolumeRecord = await res.json();
        setEarthworkVolumes((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(
          `Kalkulasi Cut & Fill segmen ${created.corridorSegment} selesai (Cut: ${created.cutProgressPct}%, Fill: ${created.fillProgressPct}%).`
        );
        return;
      }
    } catch {
      // Fallback
    }

    const cutPct = Math.round((Number(measuredCutM3) / Number(boqTargetCutM3)) * 10000) / 100;
    const fillPct = Math.round((Number(measuredFillM3) / Number(boqTargetFillM3)) * 10000) / 100;
    const fallback: EarthworkVolumeRecord = {
      id: `VOL-00${earthworkVolumes.length + 1}`,
      corridorSegment,
      projectId: "PRJ-IKN-TOL-3A",
      missionId: "MSN-001",
      boqTargetCutM3: Number(boqTargetCutM3),
      measuredCutM3: Number(measuredCutM3),
      cutProgressPct: cutPct,
      boqTargetFillM3: Number(boqTargetFillM3),
      measuredFillM3: Number(measuredFillM3),
      fillProgressPct: fillPct,
      netMassBalanceM3: Number(measuredCutM3) - Number(measuredFillM3),
      compactionFactor: 1.12,
      opnameVerificationStatus: cutPct > 105 ? "VARIANCE_AUDIT_REQUIRED" : "CERTIFIED_FOR_MC",
      calculatedAt: new Date().toISOString(),
    };
    setEarthworkVolumes((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(
      `Kalkulasi Cut & Fill segmen ${fallback.corridorSegment} selesai (Cut: ${fallback.cutProgressPct}%, Fill: ${fallback.fillProgressPct}%).`
    );
  };

  const handleRunAiInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      structureElement,
      projectId: "PRJ-IKN-TOL-3A",
      missionId: "MSN-002",
      defectType,
      crackWidthMm: Number(crackWidthMm),
      defectExtentMeters: Number(defectExtentMeters),
      aiConfidencePct: 96.8,
    };

    try {
      const res = await fetch("http://localhost:4000/api/v1/photogrammetry/ai-inspections/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: AiVisualDefectRecord = await res.json();
        setAiDefects((prev) => [created, ...prev]);
        setActiveModal(null);
        showToast(
          `Inspeksi AI Computer Vision selesai: ${created.structureElement} (${created.sniSeverityGrade}).`
        );
        return;
      }
    } catch {
      // Fallback
    }

    const width = Number(crackWidthMm);
    const fallback: AiVisualDefectRecord = {
      id: `CV-DEF-00${aiDefects.length + 1}`,
      structureElement,
      projectId: "PRJ-IKN-TOL-3A",
      missionId: "MSN-002",
      defectType,
      crackWidthMm: width,
      defectExtentMeters: Number(defectExtentMeters),
      aiConfidencePct: 96.8,
      sniSeverityGrade: width > 0.3 ? "CRITICAL_SNI_BREACH" : "MODERATE_REPAIR_NEEDED",
      status: "OPEN_NCR_RAISED",
      detectedAt: new Date().toISOString(),
    };
    setAiDefects((prev) => [fallback, ...prev]);
    setActiveModal(null);
    showToast(
      `Inspeksi AI Computer Vision selesai: ${fallback.structureElement} (${fallback.sniSeverityGrade}).`
    );
  };

  const handleResolveDefect = async (defect: AiVisualDefectRecord) => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/photogrammetry/ai-inspections/resolve-defect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defectId: defect.id,
          inspectorName: "Ir. Hendra Wijaya, MT (Lead Structural QA/QC)",
          remediationNotes:
            "Injeksi Epoxy Sikadur-52 ID bertekanan rendah & verifikasi ultrasonik UPV selesai.",
        }),
      });
      if (res.ok) {
        const updated: AiVisualDefectRecord = await res.json();
        setAiDefects((prev) => prev.map((d) => (d.id === defect.id ? updated : d)));
        showToast(`Defek struktur ${defect.id} telah diverifikasi remediasi & NCR ditutup.`);
        return;
      }
    } catch {
      // Fallback
    }

    setAiDefects((prev) =>
      prev.map((d) =>
        d.id === defect.id
          ? {
              ...d,
              status: "REMEDIATED_VERIFIED",
              inspectorName: "Ir. Hendra Wijaya, MT",
              remediationNotes:
                "Injeksi Epoxy Sikadur-52 ID bertekanan rendah & verifikasi ultrasonik UPV selesai.",
            }
          : d
      )
    );
    showToast(`Defek struktur ${defect.id} telah diverifikasi remediasi & NCR ditutup.`);
  };

  // Derived metrics
  const completedMissionsCount = missions.filter((m) => m.status === "COMPLETED_ORTHO_LIDAR").length;
  const totalDensePointsMillions = Math.round(
    missions.reduce((acc, m) => acc + m.densePointsCount, 0) / 1000000
  );
  const avgRmseCm =
    Math.round(
      (missions.reduce((acc, m) => acc + m.rmseAccuracyCm, 0) / Math.max(1, missions.length)) * 100
    ) / 100;
  const totalCutVolumeM3 = earthworkVolumes.reduce((acc, v) => acc + v.measuredCutM3, 0);
  const totalFillVolumeM3 = earthworkVolumes.reduce((acc, v) => acc + v.measuredFillM3, 0);
  const openDefectsCount = aiDefects.filter((d) => d.status === "OPEN_NCR_RAISED").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-border rounded-xl p-5 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-primary text-white">
              <Scan className="w-3.5 h-3.5 shrink-0" />
              PHASE 29 • UAV LIDAR &amp; CV
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-900">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              SRGI 2013 • KKOP AirNav • SNI 2847:2019
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight break-words">
            Drone UAV Photogrammetry, Point Cloud Earthwork &amp; AI Visual Inspection
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl break-words">
            Pemetaan koridor infrastruktur menggunakan RTK/PPK UAV &amp; sensor LiDAR, kalkulasi otomatis volume{" "}
            <em>Cut &amp; Fill</em> terhadap kontrak RAB/BOQ, serta deteksi retak struktur beton berbasis{" "}
            <em>Computer Vision AI</em>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-open-mission-modal"
            onClick={() => setActiveModal("REGISTER_MISSION")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Registrasi Misi Drone
          </button>
          <button
            type="button"
            id="btn-open-earthwork-modal"
            onClick={() => setActiveModal("CALCULATE_VOLUME")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-action text-white hover:bg-action/90 transition-colors shadow-xs"
          >
            <Mountain className="w-4 h-4 shrink-0" />
            Hitung Cut &amp; Fill
          </button>
          <button
            type="button"
            id="btn-open-ai-modal"
            onClick={() => setActiveModal("RUN_AI_INSPECTION")}
            className="min-h-11 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            Inspeksi Defek AI
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
      <section aria-label="Indikator Kinerja Utama Geospasial & Photogrammetry" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Misi Terbang RTK/PPK</span>
            <Compass className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {completedMissionsCount} / {missions.length} Selesai
          </div>
          <p className="text-xs text-slate-600">
            Akurasi Geodetik Rata-rata: <strong className="text-emerald-800">RMSE {avgRmseCm} cm</strong>
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Kerapatan Point Cloud</span>
            <Layers className="w-4 h-4 text-action shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">{totalDensePointsMillions} Juta Titik</div>
          <p className="text-xs text-slate-600">
            {pointClouds.length} Model 3D LAZ / DSM / Cesium Tiles Siap Opname
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Volume Galian &amp; Timbunan</span>
            <Mountain className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {(totalCutVolumeM3 / 1000).toFixed(1)}k / {(totalFillVolumeM3 / 1000).toFixed(1)}k m³
          </div>
          <p className="text-xs text-slate-600">
            Cut vs Fill Terukur untuk Sertifikat Bulanan (MC)
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 shadow-xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Temuan Defek Beton AI</span>
            <Eye className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {openDefectsCount} NCR Terbuka
          </div>
          <p className="text-xs text-slate-600">
            Total {aiDefects.length} Segmen Struktur Diinspeksi YOLOv8 CV
          </p>
        </div>
      </section>

      {/* WAI-ARIA Tabs Navigation (flex-wrap for zero horizontal overflow across 320px-2560px) */}
      <div
        role="tablist"
        aria-label="Sub-modul Drone UAV Photogrammetry & Point Cloud"
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
              id={`photo-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`photo-panel-${t.key}`}
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
            id="photo-panel-OVERVIEW"
            role="tabpanel"
            aria-labelledby="photo-tab-OVERVIEW"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Crosshair className="w-4 h-4 text-action shrink-0" />
                  <span>Georeferensi SRGI 2013 &amp; RTK GCP</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Seluruh orthomosaic dan point cloud diikatkan ke titik ikat <strong>Ground Control Point (GCP)</strong>{" "}
                  berakurasi geodetik dengan batas toleransi <strong>RMSE Z ≤ 3.0 cm</strong> sesuai standar Badan
                  Informasi Geospasial (BIG).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Mountain className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Rekonsiliasi Otomatis Cut &amp; Fill ke MC</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Selisih permukaan <em>Digital Terrain Model</em> (DTM) antar-periode dihitung secara volumetrik untuk
                  memvalidasi tagihan <strong>Monthly Certificate (MC)</strong> subkontraktor pekerjaan tanah.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Eye className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Deteksi Retak Beton SNI 2847:2019</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  Citra jarak dekat (<em>close-range oblique</em> GSD &lt; 0.7 cm/px) dianalisis oleh model{" "}
                  <strong>Vision AI</strong> untuk mengukur lebar retak struktur (batas kritis &gt; 0.30 mm) dan memicu
                  NCR otomatis.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-primary">
                Ringkasan Koridor Pekerjaan Tanah &amp; Sertifikasi Opname Terbaru
              </h2>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full table-fixed text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                      <th scope="col" className="p-2.5 w-[34%] font-semibold">Segmen STA / Koridor</th>
                      <th scope="col" className="p-2.5 w-[22%] font-semibold">Cut Terukur</th>
                      <th scope="col" className="p-2.5 w-[22%] font-semibold">Fill Terukur</th>
                      <th scope="col" className="p-2.5 w-[22%] font-semibold">Status MC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {earthworkVolumes.map((vol) => (
                      <tr key={vol.id} className="hover:bg-slate-50">
                        <td className="p-2.5 min-w-0">
                          <div className="font-medium text-primary break-words">{vol.corridorSegment}</div>
                          <div className="text-[11px] font-mono text-slate-600">{vol.id}</div>
                        </td>
                        <td className="p-2.5 text-slate-700 break-words">
                          <div className="font-mono font-semibold">{vol.measuredCutM3.toLocaleString("id-ID")} m³</div>
                          <div className="text-[11px] text-slate-600">{vol.cutProgressPct}% BOQ</div>
                        </td>
                        <td className="p-2.5 text-slate-700 break-words">
                          <div className="font-mono font-semibold">{vol.measuredFillM3.toLocaleString("id-ID")} m³</div>
                          <div className="text-[11px] text-slate-600">{vol.fillProgressPct}% BOQ</div>
                        </td>
                        <td className="p-2.5 min-w-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold break-words ${
                              vol.opnameVerificationStatus === "CERTIFIED_FOR_MC"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {vol.opnameVerificationStatus === "CERTIFIED_FOR_MC" ? "Tersertifikasi MC" : "Audit Variansi"}
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

        {activeTab === "MISSIONS" && (
          <div
            id="photo-panel-MISSIONS"
            role="tabpanel"
            aria-labelledby="photo-tab-MISSIONS"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Daftar Misi Penerbangan UAV RTK/PPK &amp; Izin Ruang Udara KKOP
              </h2>
              <p className="text-xs text-slate-600">
                Pemantauan ketinggian terbang AGL, kepatuhan CASR Part 107, dan status kompilasi SfM/LiDAR.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-primary break-words">{m.missionCode}</div>
                      <div className="text-xs text-slate-600 break-words">{m.projectName}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        m.status === "COMPLETED_ORTHO_LIDAR"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg">
                    <div className="min-w-0">
                      <dt className="text-slate-600">Wahana UAV</dt>
                      <dd className="font-medium text-slate-800 break-words">{m.uavModel}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-slate-600">Pilot DKPPU</dt>
                      <dd className="font-medium text-slate-800 break-words">{m.pilotName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">AGL &amp; Overlap</dt>
                      <dd className="font-mono text-slate-800">
                        {m.altitudeAglMeters}m • {m.overlapPct}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">GSD &amp; GCP</dt>
                      <dd className="font-mono text-slate-800">
                        {m.gsdCmPerPx} cm/px • {m.gcpCount} GCP
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Izin KKOP / NOTAM</dt>
                      <dd className="font-mono text-sky-900 break-words">{m.notamPermitRef}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Akurasi &amp; Titik</dt>
                      <dd className="font-mono text-emerald-900 font-semibold">
                        RMSE {m.rmseAccuracyCm} cm ({(m.densePointsCount / 1000000).toFixed(1)}M)
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-slate-600">{m.kkopAirspaceStatus}</span>
                    {m.status !== "COMPLETED_ORTHO_LIDAR" ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteMissionProcessing(m)}
                        className="min-h-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary/90"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Selesaikan SfM
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        Terverifikasi BIG
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "POINT_CLOUDS" && (
          <div
            id="photo-panel-POINT_CLOUDS"
            role="tabpanel"
            aria-labelledby="photo-tab-POINT_CLOUDS"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Repositori Model 3D Point Cloud (LAZ/COPC), DSM/DTM &amp; Cesium 3D Tiles
              </h2>
              <p className="text-xs text-slate-600">
                Dataset geospasial terklasifikasi dengan sistem koordinat proyeksi UTM SRGI 2013.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pointClouds.map((pc) => (
                <div key={pc.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-white min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary text-sm">{pc.id}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-200 text-slate-800">
                      {pc.format}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-sm break-words">{pc.projectName}</div>
                  <div className="text-xs font-mono text-slate-600 break-words">{pc.crsepsg}</div>
                  <dl className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <dt className="text-slate-600">Kerapatan</dt>
                      <dd className="font-mono font-semibold text-primary">
                        {(pc.densePointsCount / 1000000).toFixed(1)} Juta Titik
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Ukuran File</dt>
                      <dd className="font-mono text-slate-800">{pc.fileSizeGb} GB</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Resolusi GSD</dt>
                      <dd className="font-mono text-slate-800">{pc.orthomosaicResolutionCm} cm/px</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">RMSE Vertikal (Z)</dt>
                      <dd className="font-mono font-semibold text-emerald-800">{pc.rmseZCm} cm</dd>
                    </div>
                  </dl>
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-900">
                      {pc.opnameReady ? "OPNAME READY (<=3cm)" : "RE-CALIBRATION NEEDED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "EARTHWORK" && (
          <div
            id="photo-panel-EARTHWORK"
            role="tabpanel"
            aria-labelledby="photo-tab-EARTHWORK"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Perhitungan Volumetrik Cut &amp; Fill (Pekerjaan Tanah) vs Target Kontrak BOQ
              </h2>
              <p className="text-xs text-slate-600">
                Komparasi permukaan DTM LiDAR terhadap desain grading 3D BIM untuk sertifikasi pembayaran MC.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {earthworkVolumes.map((vol) => (
                <div key={vol.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary text-sm">{vol.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        vol.opnameVerificationStatus === "CERTIFIED_FOR_MC"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {vol.opnameVerificationStatus}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-sm break-words">{vol.corridorSegment}</div>
                  <dl className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Target BOQ Cut:</dt>
                      <dd className="font-mono text-slate-800">{vol.boqTargetCutM3.toLocaleString("id-ID")} m³</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Realisasi Cut:</dt>
                      <dd className="font-mono font-bold text-primary">
                        {vol.measuredCutM3.toLocaleString("id-ID")} m³ ({vol.cutProgressPct}%)
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
                      <dt className="text-slate-600">Target BOQ Fill:</dt>
                      <dd className="font-mono text-slate-800">{vol.boqTargetFillM3.toLocaleString("id-ID")} m³</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">Realisasi Fill:</dt>
                      <dd className="font-mono font-bold text-primary">
                        {vol.measuredFillM3.toLocaleString("id-ID")} m³ ({vol.fillProgressPct}%)
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-slate-200">
                      <dt className="text-slate-600">Neraca Massa (Net):</dt>
                      <dd className="font-mono font-semibold text-slate-800">
                        {vol.netMassBalanceM3.toLocaleString("id-ID")} m³ ({vol.compactionFactor}x)
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "AI_INSPECTIONS" && (
          <div
            id="photo-panel-AI_INSPECTIONS"
            role="tabpanel"
            aria-labelledby="photo-tab-AI_INSPECTIONS"
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-primary">
                Inspeksi Visual Struktur Beton Berbasis Computer Vision AI (SNI 2847:2019)
              </h2>
              <p className="text-xs text-slate-600">
                Deteksi otomatis lebar retakan (<em>crack width</em>), <em>spalling</em> selimut beton, dan eksposur
                tulangan korosi dari fotogrametri jarak dekat.
              </p>
            </div>

            <div className="space-y-3">
              {aiDefects.map((def) => (
                <div
                  key={def.id}
                  className="rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">{def.id}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-200 text-slate-800">
                        {def.defectType}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          def.sniSeverityGrade === "CRITICAL_SNI_BREACH"
                            ? "bg-rose-100 text-rose-900"
                            : def.sniSeverityGrade === "MODERATE_REPAIR_NEEDED"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-sky-100 text-sky-900"
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {def.sniSeverityGrade}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm break-words">{def.structureElement}</div>
                    <div className="text-xs text-slate-600">
                      Lebar Retak: <strong className="text-primary">{def.crackWidthMm} mm</strong> • Panjang/Luas:{" "}
                      <strong>{def.defectExtentMeters} m</strong> • Confidence AI: <strong>{def.aiConfidencePct}%</strong>
                    </div>
                    {def.remediationNotes && (
                      <div className="text-xs text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-md break-words">
                        Remediasi: {def.remediationNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        def.status === "REMEDIATED_VERIFIED"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {def.status}
                    </span>
                    {def.status === "OPEN_NCR_RAISED" ? (
                      <button
                        type="button"
                        onClick={() => handleResolveDefect(def)}
                        className="min-h-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Verifikasi Injeksi Epoxy
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Closed ({def.inspectorName || "QA/QC"})
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
            aria-labelledby="photo-modal-title"
            className="bg-white border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="photo-modal-title" className="text-base md:text-lg font-bold text-primary">
                {activeModal === "REGISTER_MISSION" && "Registrasi Misi Penerbangan UAV RTK/PPK Baru"}
                {activeModal === "CALCULATE_VOLUME" && "Kalkulasi Volume Cut & Fill Point Cloud vs BOQ"}
                {activeModal === "RUN_AI_INSPECTION" && "Jalankan Inspeksi Visual Retak Beton AI (CV)"}
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

            {activeModal === "REGISTER_MISSION" && (
              <form onSubmit={handleRegisterMission} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-mission-code" className="block font-semibold text-slate-700 mb-1">
                    Kode Misi Penerbangan
                  </label>
                  <input
                    id="input-mission-code"
                    type="text"
                    required
                    value={missionCode}
                    onChange={(e) => setMissionCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="input-project-name" className="block font-semibold text-slate-700 mb-1">
                    Koridor Proyek &amp; Segmen STA
                  </label>
                  <input
                    id="input-project-name"
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-uav-model" className="block font-semibold text-slate-700 mb-1">
                      Wahana UAV &amp; Sensor
                    </label>
                    <input
                      id="input-uav-model"
                      type="text"
                      required
                      value={uavModel}
                      onChange={(e) => setUavModel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-pilot-name" className="block font-semibold text-slate-700 mb-1">
                      Pilot Bersertifikat DKPPU
                    </label>
                    <input
                      id="input-pilot-name"
                      type="text"
                      required
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-altitude" className="block font-semibold text-slate-700 mb-1">
                      Ketinggian AGL (m)
                    </label>
                    <input
                      id="input-altitude"
                      type="number"
                      required
                      value={altitudeAglMeters}
                      onChange={(e) => setAltitudeAglMeters(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-gcp-count" className="block font-semibold text-slate-700 mb-1">
                      Jumlah Titik GCP
                    </label>
                    <input
                      id="input-gcp-count"
                      type="number"
                      required
                      value={gcpCount}
                      onChange={(e) => setGcpCount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-notam-ref" className="block font-semibold text-slate-700 mb-1">
                      Referensi NOTAM
                    </label>
                    <input
                      id="input-notam-ref"
                      type="text"
                      value={notamPermitRef}
                      onChange={(e) => setNotamPermitRef(e.target.value)}
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
                    id="btn-submit-mission"
                    className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  >
                    Simpan &amp; Verifikasi KKOP
                  </button>
                </div>
              </form>
            )}

            {activeModal === "CALCULATE_VOLUME" && (
              <form onSubmit={handleCalculateEarthwork} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-corridor-segment" className="block font-semibold text-slate-700 mb-1">
                    Segmen Koridor STA / Area Kerja
                  </label>
                  <input
                    id="input-corridor-segment"
                    type="text"
                    required
                    value={corridorSegment}
                    onChange={(e) => setCorridorSegment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-boq-cut" className="block font-semibold text-slate-700 mb-1">
                      Target Kontrak BOQ Cut (m³)
                    </label>
                    <input
                      id="input-boq-cut"
                      type="number"
                      required
                      value={boqTargetCutM3}
                      onChange={(e) => setBoqTargetCutM3(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-measured-cut" className="block font-semibold text-slate-700 mb-1">
                      Volume Cut Terukur LiDAR (m³)
                    </label>
                    <input
                      id="input-measured-cut"
                      type="number"
                      required
                      value={measuredCutM3}
                      onChange={(e) => setMeasuredCutM3(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-boq-fill" className="block font-semibold text-slate-700 mb-1">
                      Target Kontrak BOQ Fill (m³)
                    </label>
                    <input
                      id="input-boq-fill"
                      type="number"
                      required
                      value={boqTargetFillM3}
                      onChange={(e) => setBoqTargetFillM3(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-measured-fill" className="block font-semibold text-slate-700 mb-1">
                      Volume Fill Terukur LiDAR (m³)
                    </label>
                    <input
                      id="input-measured-fill"
                      type="number"
                      required
                      value={measuredFillM3}
                      onChange={(e) => setMeasuredFillM3(e.target.value)}
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
                    id="btn-submit-earthwork"
                    className="px-4 py-2 rounded-lg font-semibold bg-action text-white hover:bg-action/90"
                  >
                    Hitung &amp; Sertifikasi Opname
                  </button>
                </div>
              </form>
            )}

            {activeModal === "RUN_AI_INSPECTION" && (
              <form onSubmit={handleRunAiInspection} className="space-y-3 text-xs md:text-sm">
                <div>
                  <label htmlFor="input-structure-element" className="block font-semibold text-slate-700 mb-1">
                    Elemen Struktur yang Diinspeksi
                  </label>
                  <input
                    id="input-structure-element"
                    type="text"
                    required
                    value={structureElement}
                    onChange={(e) => setStructureElement(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="select-defect-type" className="block font-semibold text-slate-700 mb-1">
                    Klasifikasi Defek Visual (YOLOv8 CV)
                  </label>
                  <select
                    id="select-defect-type"
                    value={defectType}
                    onChange={(e) =>
                      setDefectType(e.target.value as AiVisualDefectRecord["defectType"])
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="STRUCTURAL_CRACK">STRUCTURAL_CRACK (Retak Struktur Utama)</option>
                    <option value="CONCRETE_SPALLING">CONCRETE_SPALLING (Terupasnya Selimut Beton)</option>
                    <option value="EXPOSED_REBAR_CORROSION">EXPOSED_REBAR_CORROSION (Tulangan Terekspos Korosi)</option>
                    <option value="WATER_SEEPAGE_HONEYCOMB">WATER_SEEPAGE_HONEYCOMB (Rembesan &amp; Keropos)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-crack-width" className="block font-semibold text-slate-700 mb-1">
                      Lebar Retak Terukur (mm)
                    </label>
                    <input
                      id="input-crack-width"
                      type="number"
                      step="0.01"
                      required
                      value={crackWidthMm}
                      onChange={(e) => setCrackWidthMm(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-defect-extent" className="block font-semibold text-slate-700 mb-1">
                      Panjang / Luas Defek (m)
                    </label>
                    <input
                      id="input-defect-extent"
                      type="number"
                      step="0.05"
                      required
                      value={defectExtentMeters}
                      onChange={(e) => setDefectExtentMeters(e.target.value)}
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
                    id="btn-submit-ai-inspection"
                    className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  >
                    Analisis Evaluasi SNI 2847
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
