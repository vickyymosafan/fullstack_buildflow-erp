"use client";

import React, { useState } from "react";
import {
  Box,
  Layers,
  Calendar,
  DollarSign,
  AlertOctagon,
  Eye,
  Sliders,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Building2,
  Camera,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  FileCode,
  Check,
  X,
  AlertTriangle,
  Compass,
} from "lucide-react";

export type BimDiscipline = "ARCHITECTURE" | "STRUCTURE" | "MEP" | "CIVIL_INFRASTRUCTURE";
export type BcfTopicStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type ClashType = "HARD_CLASH" | "SOFT_CLEARANCE" | "DUPLICATE_GEOMETRY";

interface BimModelRecord {
  id: string;
  modelCode: string;
  projectId: string;
  projectName: string;
  modelName: string;
  discipline: BimDiscipline;
  fileFormat: string;
  lodLevel: string;
  fileSize: string;
  elementsCount: number;
  authorName: string;
  version: number;
  uploadedAt: string;
  description?: string;
}

interface BimElementRecord {
  id: string;
  modelId: string;
  ifcType: string;
  elementName: string;
  discipline: BimDiscipline;
  guid: string;
  locationZone: string;
  elevation: string;
  material: string;
  volumeQuantity: number;
  uom: string;
  wbsCode?: string;
  activityName?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  executionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  boqItemCode?: string;
  budgetCost: number;
  actualCost: number;
  costVariance: number;
}

interface BcfTopicRecord {
  id: string;
  topicNumber: string;
  projectId: string;
  title: string;
  topicType: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: BcfTopicStatus;
  assignedTo: string;
  createdByName: string;
  relatedElementId?: string;
  viewpoint: {
    posX: number;
    posY: number;
    posZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    fov: number;
  };
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface ClashResultRecord {
  id: string;
  clashNumber: string;
  projectId: string;
  sourceModelName: string;
  sourceElement: string;
  targetModelName: string;
  targetElement: string;
  clashType: ClashType;
  toleranceMm: number;
  penetrationDistanceMm: number;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  coordinates: { x: number; y: number; z: number };
  status: "ACTIVE" | "RESOLVED" | "IGNORED";
  detectedAt: string;
  resolutionNotes?: string;
}

export default function BimPage() {
  const [activeTab, setActiveTab] = useState<"3d-viewer" | "4d-simulation" | "5d-cost" | "bcf-issues" | "clash-detection">("3d-viewer");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // State: 3D Models
  const [models, setModels] = useState<BimModelRecord[]>([
    {
      id: "MOD-001",
      modelCode: "BIM-STR-2026-001",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      modelName: "Model Struktur Stasiun Bawah Tanah Harmoni",
      discipline: "STRUCTURE",
      fileFormat: "IFC4",
      lodLevel: "LOD_350",
      fileSize: "184.2 MB",
      elementsCount: 1420,
      authorName: "Ir. Dwi Prasetyo, S.T. (Lead BIM Structure)",
      version: 4,
      uploadedAt: "2026-03-01T08:30:00Z",
      description: "Model struktur D-Wall, bored pile group, slab concourse, dan king post baja portal",
    },
    {
      id: "MOD-002",
      modelCode: "BIM-MEP-2026-002",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      modelName: "Model Utilitas MEP Tunnel & Sistem HVAC Stasiun",
      discipline: "MEP",
      fileFormat: "IFC4",
      lodLevel: "LOD_350",
      fileSize: "142.8 MB",
      elementsCount: 2890,
      authorName: "Ir. Ahmad Baihaqi (MEP BIM Specialist)",
      version: 3,
      uploadedAt: "2026-03-02T11:15:00Z",
      description: "Ducting ventilasi darurat tunnel, chiller piping 250mm, sprinkler pemadam kebakaran, dan cable tray listrik",
    },
    {
      id: "MOD-003",
      modelCode: "BIM-ARC-2026-003",
      projectId: "PRJ-MRT-001",
      projectName: "MRT Fase 2A CP201 Monas-Harmoni",
      modelName: "Model Arsitektur Finishing & Platform Concourse",
      discipline: "ARCHITECTURE",
      fileFormat: "IFC4",
      lodLevel: "LOD_300",
      fileSize: "96.5 MB",
      elementsCount: 950,
      authorName: "Siti Nurhaliza, S.Ars (Architectural Lead)",
      version: 2,
      uploadedAt: "2026-03-03T14:00:00Z",
      description: "Dinding partisi acoustic, platform screen door (PSD), granit flooring, dan ceiling baja ekspos",
    },
    {
      id: "MOD-004",
      modelCode: "BIM-BNR-2026-004",
      projectId: "PRJ-BNR-003",
      projectName: "Bendungan Bener Paket 2",
      modelName: "Model 3D Terowongan Pengelak & Bangunan Pelimpah Spillway",
      discipline: "CIVIL_INFRASTRUCTURE",
      fileFormat: "IFC4",
      lodLevel: "LOD_300",
      fileSize: "215.0 MB",
      elementsCount: 780,
      authorName: "Rudi Hermawan, S.T. (Civil Infrastructure BIM)",
      version: 2,
      uploadedAt: "2026-02-25T10:00:00Z",
      description: "Geometri galian terowongan pengelak diameter 7m dan struktur beton pelimpah air",
    },
  ]);

  // State: 3D Elements
  const [elements, setElements] = useState<BimElementRecord[]>([
    {
      id: "ELE-DW-001",
      modelId: "MOD-001",
      ifcType: "IfcWallStandardCase",
      elementName: "Diaphragm Wall Panel DW-01 (Tebal 1000mm)",
      discipline: "STRUCTURE",
      guid: "3A5B8F9C-1122-4433-8899-AABBCCDDEE01",
      locationZone: "Grid 1-3 / North Shaft Monas",
      elevation: "-18.50 m s.d. +0.00 m",
      material: "Beton Bertulang K-400 Ready Mix",
      volumeQuantity: 78.5,
      uom: "m3",
      wbsCode: "WBS-1.1.1",
      activityName: "Pekerjaan Pengecoran D-Wall Baris 1",
      plannedStartDate: "2026-02-01",
      plannedEndDate: "2026-02-20",
      actualStartDate: "2026-02-01",
      actualEndDate: "2026-02-18",
      executionStatus: "COMPLETED",
      boqItemCode: "BOQ-STR-001",
      budgetCost: 145225000,
      actualCost: 141900000,
      costVariance: -3325000,
    },
    {
      id: "ELE-BP-002",
      modelId: "MOD-001",
      ifcType: "IfcFooting",
      elementName: "Bored Pile Dia 1200mm P-14 Kedalaman 32m",
      discipline: "STRUCTURE",
      guid: "3A5B8F9C-1122-4433-8899-AABBCCDDEE02",
      locationZone: "Grid 4-6 / Center Platform Harmoni",
      elevation: "-32.00 m s.d. -14.00 m",
      material: "Beton Tremie K-350 & Besi Ulir BJTD-40",
      volumeQuantity: 36.2,
      uom: "m3",
      wbsCode: "WBS-1.1.2",
      activityName: "Pengeboran & Pengecoran Bored Pile Harmoni",
      plannedStartDate: "2026-02-15",
      plannedEndDate: "2026-03-05",
      actualStartDate: "2026-02-16",
      actualEndDate: "2026-03-04",
      executionStatus: "COMPLETED",
      boqItemCode: "BOQ-STR-004",
      budgetCost: 66970000,
      actualCost: 68500000,
      costVariance: 1530000,
    },
    {
      id: "ELE-SLB-003",
      modelId: "MOD-001",
      ifcType: "IfcSlab",
      elementName: "Concourse Level Base Slab Tebal 800mm",
      discipline: "STRUCTURE",
      guid: "3A5B8F9C-1122-4433-8899-AABBCCDDEE03",
      locationZone: "Zone B / Station Box Main Hall",
      elevation: "-12.00 m",
      material: "Beton K-450 Waterproofing Additive",
      volumeQuantity: 312.0,
      uom: "m3",
      wbsCode: "WBS-1.2.1",
      activityName: "Pembesian & Pengecoran Plat Lantai Concourse",
      plannedStartDate: "2026-03-01",
      plannedEndDate: "2026-03-25",
      actualStartDate: "2026-03-02",
      executionStatus: "IN_PROGRESS",
      boqItemCode: "BOQ-STR-012",
      budgetCost: 592800000,
      actualCost: 280000000,
      costVariance: -12800000,
    },
    {
      id: "ELE-MEP-004",
      modelId: "MOD-002",
      ifcType: "IfcDuctSegment",
      elementName: "Tunnel Exhaust HVAC Duct Galvanized 1200x800mm",
      discipline: "MEP",
      guid: "3A5B8F9C-1122-4433-8899-AABBCCDDEE04",
      locationZone: "Overhead Track 1 / North Bound",
      elevation: "-10.50 m",
      material: "Baja Galvanis BJLS 100 & Rockwool Insulation",
      volumeQuantity: 120.0,
      uom: "m",
      wbsCode: "WBS-2.1.3",
      activityName: "Pemasangan Ducting Ventilasi Terowongan",
      plannedStartDate: "2026-03-10",
      plannedEndDate: "2026-03-30",
      executionStatus: "NOT_STARTED",
      boqItemCode: "BOQ-MEP-008",
      budgetCost: 216000000,
      actualCost: 0,
      costVariance: 0,
    },
    {
      id: "ELE-MEP-005",
      modelId: "MOD-002",
      ifcType: "IfcPipeSegment",
      elementName: "Chilled Water Supply Carbon Steel Pipe DN250",
      discipline: "MEP",
      guid: "3A5B8F9C-1122-4433-8899-AABBCCDDEE05",
      locationZone: "Chiller Plant Room ke Shaft Vertikal",
      elevation: "-14.20 m",
      material: "Pipa Seamless Carbon Steel ASTM A53",
      volumeQuantity: 84.0,
      uom: "m",
      wbsCode: "WBS-2.2.1",
      activityName: "Instalasi Pipa Utama Chiller AHU Stasiun",
      plannedStartDate: "2026-03-15",
      plannedEndDate: "2026-04-05",
      executionStatus: "NOT_STARTED",
      boqItemCode: "BOQ-MEP-015",
      budgetCost: 184800000,
      actualCost: 0,
      costVariance: 0,
    },
  ]);

  // State: BCF Topics
  const [bcfTopics, setBcfTopics] = useState<BcfTopicRecord[]>([
    {
      id: "BCF-001",
      topicNumber: "BCF-2026-001",
      projectId: "PRJ-MRT-001",
      title: "Benturan Spasial: Pipa Chiller DN250 Menembus Balok Girder G-14 Tanpa Sleeve",
      topicType: "CLASH",
      priority: "CRITICAL",
      status: "OPEN",
      assignedTo: "Ir. Ahmad Baihaqi (MEP Lead)",
      createdByName: "Ir. Dwi Prasetyo, S.T. (BIM Coordinator)",
      relatedElementId: "ELE-MEP-005",
      viewpoint: {
        posX: 18.5,
        posY: -14.2,
        posZ: 32.1,
        targetX: 16.0,
        targetY: -14.0,
        targetZ: 30.0,
        fov: 60,
      },
      commentsCount: 3,
      createdAt: "2026-03-03T10:00:00Z",
      updatedAt: "2026-03-04T09:30:00Z",
      description: "Pipa suplai pendingin AHU terbentur tulangan utama balok beton portal G-14 elevasi -14.20m. Perlu rerouting jalur pipa atau penyesuaian posisi sleeve balok.",
    },
    {
      id: "BCF-002",
      topicNumber: "BCF-2026-002",
      projectId: "PRJ-MRT-001",
      title: "Deviasi Elevasi Level Plat Concourse Slab Terhadap Gambar DED (+15mm)",
      topicType: "DESIGN_DEFECT",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignedTo: "Bambang Kusumo, S.T. (Senior Site Engineer)",
      createdByName: "Siti Nurhaliza, S.Ars (Architectural Lead)",
      relatedElementId: "ELE-SLB-003",
      viewpoint: {
        posX: 22.0,
        posY: -12.0,
        posZ: 15.0,
        targetX: 20.0,
        targetY: -12.0,
        targetZ: 15.0,
        fov: 55,
      },
      commentsCount: 2,
      createdAt: "2026-03-04T11:20:00Z",
      updatedAt: "2026-03-05T08:00:00Z",
      description: "Elevasi top of concrete plat concourse lebih tinggi 15mm dari desain elevasi finishing lantai granit arsitektur.",
    },
    {
      id: "BCF-003",
      topicNumber: "BCF-2026-003",
      projectId: "PRJ-BNR-003",
      title: "Konflik Jalur Kabel Sensor Piezometer Dengan Pipa Injeksi Grouting Spillway",
      topicType: "SITE_OBSTRUCTION",
      priority: "MEDIUM",
      status: "RESOLVED",
      assignedTo: "Rudi Hermawan, S.T. (Civil Infrastructure BIM)",
      createdByName: "Hendra Saputra (Instrumentation Engineer)",
      viewpoint: {
        posX: 45.0,
        posY: 12.0,
        posZ: 60.0,
        targetX: 42.0,
        targetY: 10.0,
        targetZ: 58.0,
        fov: 60,
      },
      commentsCount: 4,
      createdAt: "2026-02-26T14:00:00Z",
      updatedAt: "2026-03-01T16:00:00Z",
      description: "Jalur conduit kabel piezometer dialihkan ke trench drainase sekunder sisi barat.",
    },
  ]);

  // State: Clash Results
  const [clashResults, setClashResults] = useState<ClashResultRecord[]>([
    {
      id: "CLS-001",
      clashNumber: "CLS-2026-001",
      projectId: "PRJ-MRT-001",
      sourceModelName: "Model Struktur Bawah Tanah Harmoni",
      sourceElement: "Balok Beton Portal Girder G-14 (Grid D-4)",
      targetModelName: "Model Utilitas MEP Tunnel & HVAC",
      targetElement: "Chilled Water Supply Pipe DN250 (P-CHW-01)",
      clashType: "HARD_CLASH",
      toleranceMm: 25,
      penetrationDistanceMm: 85,
      severity: "CRITICAL",
      coordinates: { x: 18.45, y: -14.2, z: 32.1 },
      status: "ACTIVE",
      detectedAt: "2026-03-03T09:45:00Z",
      resolutionNotes: "Sudah diterbitkan BCF-2026-001 ke MEP Coordinator untuk penurunan elevasi pipa 150mm",
    },
    {
      id: "CLS-002",
      clashNumber: "CLS-2026-002",
      projectId: "PRJ-MRT-001",
      sourceModelName: "Model Struktur Bawah Tanah Harmoni",
      sourceElement: "D-Wall Panel DW-04 Baris 2",
      targetModelName: "Model Utilitas MEP Tunnel & HVAC",
      targetElement: "Cable Tray Listrik Tegangan Menengah 20kV",
      clashType: "SOFT_CLEARANCE",
      toleranceMm: 50,
      penetrationDistanceMm: 18,
      severity: "MAJOR",
      coordinates: { x: 25.1, y: -16.0, z: 12.3 },
      status: "ACTIVE",
      detectedAt: "2026-03-03T09:48:00Z",
      resolutionNotes: "Jarak bebas minimum dengan dinding basah terowongan kurang dari 100mm syarat standar K3",
    },
    {
      id: "CLS-003",
      clashNumber: "CLS-2026-003",
      projectId: "PRJ-MRT-001",
      sourceModelName: "Model Arsitektur Finishing & Platform",
      sourceElement: "Dinding Panel Kaca Platform Screen Door (PSD)",
      targetModelName: "Model Struktur Bawah Tanah Harmoni",
      targetElement: "Kolom Struktur Baja KS-08 Plat Concourse",
      clashType: "HARD_CLASH",
      toleranceMm: 10,
      penetrationDistanceMm: 0,
      severity: "MINOR",
      coordinates: { x: 30.0, y: -12.0, z: 45.0 },
      status: "RESOLVED",
      detectedAt: "2026-02-28T10:00:00Z",
      resolutionNotes: "Selesai disesuaikan bracket ekspansi pada as arsitektur",
    },
  ]);

  // Viewer 3D State
  const [selectedElement, setSelectedElement] = useState<BimElementRecord | null>(elements[0]);
  const [layerVisibility, setLayerVisibility] = useState({
    STRUCTURE: true,
    MEP: true,
    ARCHITECTURE: true,
  });
  const [renderMode, setRenderMode] = useState<"SOLID" | "WIREFRAME" | "XRAY">("SOLID");
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);

  // 4D Simulation Slider State
  const [simulationWeek, setSimulationWeek] = useState<number>(10);
  const [isPlaying4d, setIsPlaying4d] = useState<boolean>(false);

  // Modals
  const [showUploadModelModal, setShowUploadModelModal] = useState(false);
  const [showCreateBcfModal, setShowCreateBcfModal] = useState(false);
  const [showClashCheckModal, setShowClashCheckModal] = useState(false);
  const [showLinkScheduleModal, setShowLinkScheduleModal] = useState(false);

  // Form states
  const [modelForm, setModelForm] = useState({
    projectId: "PRJ-MRT-001",
    projectName: "MRT Fase 2A CP201 Monas-Harmoni",
    modelName: "",
    discipline: "STRUCTURE" as BimDiscipline,
    fileFormat: "IFC4",
    lodLevel: "LOD_350",
    authorName: "Ir. Dwi Prasetyo, S.T. (BIM Lead)",
    description: "",
  });

  const [bcfForm, setBcfForm] = useState({
    projectId: "PRJ-MRT-001",
    title: "",
    topicType: "CLASH",
    priority: "HIGH" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    assignedTo: "Ir. Ahmad Baihaqi (MEP Lead)",
    createdByName: "Ir. Dwi Prasetyo, S.T. (BIM Coordinator)",
    description: "",
  });

  const [clashForm, setClashForm] = useState({
    projectId: "PRJ-MRT-001",
    sourceModelId: "MOD-001",
    targetModelId: "MOD-002",
    toleranceMm: 25,
    clashType: "HARD_CLASH" as ClashType,
  });

  const [scheduleForm, setScheduleForm] = useState({
    elementId: "ELE-SLB-003",
    wbsCode: "WBS-1.2.1",
    activityName: "Pembesian & Pengecoran Plat Lantai Concourse",
    plannedStartDate: "2026-03-01",
    plannedEndDate: "2026-03-25",
    status: "IN_PROGRESS" as any,
  });

  // Filter & Search states
  const [disciplineFilter, setDisciplineFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Handlers
  const handleUploadModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelForm.modelName) {
      alert("Masukkan nama model BIM 3D");
      return;
    }
    const nextSeq = models.length + 1;
    const newModel: BimModelRecord = {
      id: `MOD-00${nextSeq}`,
      modelCode: `BIM-${modelForm.discipline.substring(0, 3)}-2026-00${nextSeq}`,
      projectId: modelForm.projectId,
      projectName: modelForm.projectName,
      modelName: modelForm.modelName,
      discipline: modelForm.discipline,
      fileFormat: modelForm.fileFormat,
      lodLevel: modelForm.lodLevel,
      fileSize: "128.4 MB",
      elementsCount: 650,
      authorName: modelForm.authorName,
      version: 1,
      uploadedAt: new Date().toISOString(),
      description: modelForm.description,
    };
    setModels([newModel, ...models]);
    setShowUploadModelModal(false);
    showToast(`Model 3D BIM ${newModel.modelName} (${newModel.modelCode}) berhasil dimuat ke repositori Digital Twin.`);
  };

  const handleCreateBcf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcfForm.title) {
      alert("Masukkan judul isu BCF");
      return;
    }
    const nextSeq = bcfTopics.length + 1;
    const newTopic: BcfTopicRecord = {
      id: `BCF-00${nextSeq}`,
      topicNumber: `BCF-2026-00${nextSeq}`,
      projectId: bcfForm.projectId,
      title: bcfForm.title,
      topicType: bcfForm.topicType,
      priority: bcfForm.priority,
      status: "OPEN",
      assignedTo: bcfForm.assignedTo,
      createdByName: bcfForm.createdByName,
      relatedElementId: selectedElement ? selectedElement.id : undefined,
      viewpoint: {
        posX: 18.5,
        posY: -14.2,
        posZ: 32.1,
        targetX: 16.0,
        targetY: -14.0,
        targetZ: 30.0,
        fov: 60,
      },
      commentsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: bcfForm.description,
    };
    setBcfTopics([newTopic, ...bcfTopics]);
    setShowCreateBcfModal(false);
    showToast(`Isu koordinasi lapangan BCF ${newTopic.topicNumber} berhasil didaftarkan dan diteruskan ke ${newTopic.assignedTo}.`);
  };

  const handleResolveBcf = (id: string) => {
    setBcfTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED", updatedAt: new Date().toISOString() } : t))
    );
    showToast(`Isu BCF berhasil ditandai sebagai RESOLVED.`);
  };

  const handleRunClash = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = clashResults.length + 1;
    const newClash: ClashResultRecord = {
      id: `CLS-00${nextSeq}`,
      clashNumber: `CLS-2026-00${nextSeq}`,
      projectId: clashForm.projectId,
      sourceModelName: "Model Struktur Bawah Tanah Harmoni",
      sourceElement: "Kolom Beton Bertulang Portal K-10",
      targetModelName: "Model Utilitas MEP Tunnel & HVAC",
      targetElement: "Ducting Exhaust Tunnel 1000x600mm",
      clashType: clashForm.clashType,
      toleranceMm: Number(clashForm.toleranceMm),
      penetrationDistanceMm: 35,
      severity: "MAJOR",
      coordinates: { x: 22.0, y: -13.5, z: 24.0 },
      status: "ACTIVE",
      detectedAt: new Date().toISOString(),
      resolutionNotes: `Deteksi otomatis toleransi ${clashForm.toleranceMm}mm. Penetrasi ducting 35mm pada kolom struktur.`,
    };
    setClashResults([newClash, ...clashResults]);
    setShowClashCheckModal(false);
    showToast(`Analisis tabrakan spasial selesai: 1 benturan baru ${newClash.clashNumber} berhasil dideteksi.`);
  };

  const handleLinkSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === scheduleForm.elementId) {
          return {
            ...el,
            wbsCode: scheduleForm.wbsCode,
            activityName: scheduleForm.activityName,
            plannedStartDate: scheduleForm.plannedStartDate,
            plannedEndDate: scheduleForm.plannedEndDate,
            executionStatus: scheduleForm.status,
          };
        }
        return el;
      })
    );
    setShowLinkScheduleModal(false);
    showToast(`Elemen BIM ${scheduleForm.elementId} berhasil ditautkan ke jadwal 4D WBS ${scheduleForm.wbsCode}.`);
  };

  // Calculations
  const totalModelsCount = models.length;
  const totalElementsCount = models.reduce((acc, curr) => acc + curr.elementsCount, 0);
  const completedCount = elements.filter((e) => e.executionStatus === "COMPLETED").length;
  const inProgressCount = elements.filter((e) => e.executionStatus === "IN_PROGRESS").length;
  const progress4d = Math.round(((completedCount + inProgressCount * 0.5) / elements.length) * 100);
  const total5dValue = elements.reduce((acc, curr) => acc + curr.budgetCost, 0);
  const openBcfCount = bcfTopics.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const activeClashesCount = clashResults.filter((c) => c.status === "ACTIVE").length;

  const filteredElements = elements.filter((el) => {
    const matchesDiscipline = disciplineFilter === "ALL" || el.discipline === disciplineFilter;
    const matchesSearch =
      el.elementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.guid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.locationZone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.material.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen text-slate-800 overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-indigo-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:bg-indigo-800 p-1 rounded"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4 text-indigo-200" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-mono">
              OpenBIM WebGL Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Phase 25 Digital Twin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            BIM 4D/5D WebGL Viewer & Digital Twin Construction
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Visualisasi model 3D federasi (Arsitektur, Struktur, MEP) langsung di browser via WebGL, simulasi timeline 4D terintegrasi WBS, pemetaan volume biaya BOQ 5D, tiket koordinasi BCF, dan pendeteksi benturan spasial (*Clash Detection*).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowClashCheckModal(true)}
            className="w-full sm:w-auto justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Jalankan Clash Check
          </button>
          <button
            onClick={() => setShowCreateBcfModal(true)}
            className="w-full sm:w-auto justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            Buat Isu BCF Baru
          </button>
          <button
            onClick={() => setShowUploadModelModal(true)}
            className="w-full sm:w-auto justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Unggah Model 3D (IFC)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model BIM Federasi</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {totalModelsCount} Model Active
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              {totalElementsCount.toLocaleString("id-ID")} Elemen Spasial Terindeks LOD 350
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulasi 4D Progres Fisik</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {progress4d}% WBS Linked
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Minggu ke-{simulationWeek} / 52 Timeline Proyek
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Terbobot Biaya 5D</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              Rp {(total5dValue / 1000000).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Integrasi BOQ / RAP ke Geometri Model
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Isu BCF & Clash Matrix</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {openBcfCount} Open / {activeClashesCount} Clash
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Toleransi Benturan Spasial 25 mm
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex flex-wrap gap-1 sm:gap-2 pb-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "3d-viewer"}
            onClick={() => setActiveTab("3d-viewer")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "3d-viewer"
                ? "border-indigo-700 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Box className="w-4 h-4" />
            Viewer 3D Digital Twin
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "4d-simulation"}
            onClick={() => setActiveTab("4d-simulation")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "4d-simulation"
                ? "border-indigo-700 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Simulasi Jadwal 4D
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              W-{simulationWeek}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "5d-cost"}
            onClick={() => setActiveTab("5d-cost")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "5d-cost"
                ? "border-indigo-700 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Integrasi Biaya BOQ 5D
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "bcf-issues"}
            onClick={() => setActiveTab("bcf-issues")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "bcf-issues"
                ? "border-indigo-700 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Tiket Isu Lapangan BCF
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
              {openBcfCount}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "clash-detection"}
            onClick={() => setActiveTab("clash-detection")}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "clash-detection"
                ? "border-indigo-700 text-indigo-700 bg-indigo-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            Matriks Clash Detection
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
              {activeClashesCount}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: 3D DIGITAL TWIN VIEWER */}
      {activeTab === "3d-viewer" && (
        <div className="space-y-4">
          {/* 3D Canvas Viewport Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main WebGL Simulation Viewport */}
            <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden min-h-[480px] flex flex-col justify-between shadow-inner">
              {/* Top Viewport Toolbar */}
              <div className="p-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200 font-mono">
                    OpenBIM WebGL Canvas (Active LOD 350)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    60 FPS
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Layer Toggles */}
                  <button
                    onClick={() => setLayerVisibility({ ...layerVisibility, STRUCTURE: !layerVisibility.STRUCTURE })}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                      layerVisibility.STRUCTURE
                        ? "bg-blue-900/40 text-blue-300 border-blue-500"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    Struktur (STR)
                  </button>
                  <button
                    onClick={() => setLayerVisibility({ ...layerVisibility, MEP: !layerVisibility.MEP })}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                      layerVisibility.MEP
                        ? "bg-amber-900/40 text-amber-300 border-amber-500"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    Utilitas (MEP)
                  </button>
                  <button
                    onClick={() => setLayerVisibility({ ...layerVisibility, ARCHITECTURE: !layerVisibility.ARCHITECTURE })}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                      layerVisibility.ARCHITECTURE
                        ? "bg-purple-900/40 text-purple-300 border-purple-500"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    Arsitektur (ARS)
                  </button>

                  <div className="h-4 w-px bg-slate-800 mx-1" />

                  {/* Render Mode */}
                  <select
                    value={renderMode}
                    onChange={(e) => setRenderMode(e.target.value as any)}
                    className="text-[11px] bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1"
                  >
                    <option value="SOLID">Shaded Solid</option>
                    <option value="WIREFRAME">Wireframe Grid</option>
                    <option value="XRAY">X-Ray Slicing</option>
                  </select>
                </div>
              </div>

              {/* Simulated 3D Interactive Canvas Scene */}
              <div className="flex-1 relative flex items-center justify-center p-6 select-none overflow-hidden">
                {/* 3D Coordinate Grid Background */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* 3D Graphic Elements Representation */}
                <div className="relative z-0 flex flex-col items-center justify-center space-y-4 max-w-lg w-full">
                  {/* Floating Compass Gizmo */}
                  <div className="absolute top-4 left-4 bg-slate-900/70 border border-slate-800 p-2 rounded-lg flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: "30s" }} />
                    <span>Azimuth: 142° | Pitch: -30°</span>
                  </div>

                  {/* 3D Model Simulation Graphic Container */}
                  <div className="w-full h-64 border border-dashed border-slate-800 rounded-xl relative flex items-center justify-center p-4">
                    {/* Diaphragm Wall (STR) */}
                    {layerVisibility.STRUCTURE && (
                      <div
                        onClick={() => setSelectedElement(elements[0])}
                        className={`absolute left-8 top-12 w-28 h-40 rounded border-2 transition-all cursor-pointer flex flex-col justify-between p-2 shadow-lg ${
                          selectedElement?.id === "ELE-DW-001"
                            ? "border-cyan-400 bg-cyan-950/70 scale-105"
                            : "border-blue-600 bg-blue-950/40 hover:border-blue-400"
                        }`}
                      >
                        <span className="text-[9px] font-mono text-cyan-300 font-bold">D-WALL DW-01</span>
                        <span className="text-[8px] font-mono text-slate-400">El: -18.5m</span>
                      </div>
                    )}

                    {/* Concourse Slab (STR) */}
                    {layerVisibility.STRUCTURE && (
                      <div
                        onClick={() => setSelectedElement(elements[2])}
                        className={`absolute inset-x-24 top-28 h-14 rounded border-2 transition-all cursor-pointer flex items-center justify-between px-3 shadow-lg ${
                          selectedElement?.id === "ELE-SLB-003"
                            ? "border-cyan-400 bg-cyan-950/70 scale-105"
                            : "border-blue-500 bg-blue-900/30 hover:border-blue-400"
                        }`}
                      >
                        <span className="text-[9px] font-mono text-blue-200 font-bold">CONCOURSE BASE SLAB 800mm</span>
                        <span className="text-[8px] font-mono text-slate-400">312 m³</span>
                      </div>
                    )}

                    {/* Chilled Water Pipe / Duct (MEP) */}
                    {layerVisibility.MEP && (
                      <div
                        onClick={() => setSelectedElement(elements[4])}
                        className={`absolute inset-x-20 top-20 h-4 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          selectedElement?.id === "ELE-MEP-005"
                            ? "border-amber-400 bg-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            : "border-amber-500/80 bg-amber-500/30 hover:border-amber-300"
                        }`}
                      >
                        <span className="text-[8px] font-mono text-amber-200 font-bold px-2 truncate">
                          CHILLED WATER DN250 (CLASH PIN)
                        </span>
                      </div>
                    )}

                    {/* Bored Pile Group (STR) */}
                    {layerVisibility.STRUCTURE && (
                      <div
                        onClick={() => setSelectedElement(elements[1])}
                        className={`absolute right-12 bottom-6 w-20 h-28 rounded-b-xl border-2 transition-all cursor-pointer flex flex-col justify-end p-2 ${
                          selectedElement?.id === "ELE-BP-002"
                            ? "border-cyan-400 bg-cyan-950/70 scale-105"
                            : "border-blue-700 bg-blue-950/40 hover:border-blue-400"
                        }`}
                      >
                        <span className="text-[8px] font-mono text-slate-300 font-bold">BORED PILE P-14</span>
                        <span className="text-[7px] font-mono text-slate-400">Depth: -32m</span>
                      </div>
                    )}

                    {/* Visual Clash Alert Pin */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-rose-950/80 border border-rose-500 text-rose-300 px-2 py-0.5 rounded-full text-[10px] animate-bounce">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clash Detected (85mm)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Canvas Controls */}
              <div className="p-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    Elemen Terpilih: <span className="text-white font-semibold">{selectedElement?.elementName || "Klik elemen pada model"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    Shift + Drag: Pan | Scroll: Zoom | Klik: Inspect
                  </span>
                </div>
              </div>
            </div>

            {/* Right Property Inspector Drawer */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    BIM Element Inspector
                  </h3>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                    LOD 350
                  </span>
                </div>

                {selectedElement ? (
                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Nama Elemen</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedElement.elementName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Disiplin</span>
                        <span className="font-bold text-indigo-700 text-xs font-mono">{selectedElement.discipline}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">IFC Class</span>
                        <span className="font-bold text-slate-800 text-[11px] font-mono truncate block">{selectedElement.ifcType}</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Zona Proyek:</span>
                        <span className="font-medium text-slate-800">{selectedElement.locationZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Elevasi:</span>
                        <span className="font-mono text-slate-800">{selectedElement.elevation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Volume Desain:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedElement.volumeQuantity} {selectedElement.uom}</span>
                      </div>
                    </div>

                    {/* 4D Data */}
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Jadwal 4D WBS</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-700">{selectedElement.wbsCode || "Belum ditautkan"}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedElement.executionStatus === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : selectedElement.executionStatus === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {selectedElement.executionStatus}
                        </span>
                      </div>
                    </div>

                    {/* 5D Cost Data */}
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Integrasi Biaya 5D</span>
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                        <span>Anggaran RAP:</span>
                        <span>Rp {selectedElement.budgetCost.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>Realisasi:</span>
                        <span>Rp {selectedElement.actualCost.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-6 text-center">Pilih elemen pada 3D canvas untuk melihat spesifikasi detail.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setShowLinkScheduleModal(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Tautkan ke Jadwal WBS 4D
                </button>
                <button
                  onClick={() => setShowCreateBcfModal(true)}
                  className="w-full py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Buat Isu BCF Dari Viewpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 4D TIME SIMULATION */}
      {activeTab === "4d-simulation" && (
        <div className="space-y-4">
          {/* Simulation Playback Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Simulasi 4D Jadwal WBS Pelaksanaan Konstruksi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Geser timeline untuk mengamati simulasi transisi elemen struktur dari status Not Started $\rightarrow$ In Progress (pengecoran) $\rightarrow$ Completed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying4d(!isPlaying4d)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {isPlaying4d ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying4d ? "Jeda Simulasi" : "Mulai Simulasi 4D"}
                </button>
                <button
                  onClick={() => setSimulationWeek(1)}
                  className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  aria-label="Reset simulasi"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Timeline Proyek 52 Minggu:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Minggu ke-{simulationWeek} (Bulan Maret 2026)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="52"
                value={simulationWeek}
                onChange={(e) => setSimulationWeek(Number(e.target.value))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>W-01 (Jan 26)</span>
                <span>W-13 (Q1)</span>
                <span>W-26 (Mid-Year)</span>
                <span>W-39 (Q3)</span>
                <span>W-52 (Dec 26)</span>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[12%]">Kode WBS</th>
                  <th className="py-3 px-4 w-[24%]">Nama Elemen BIM 3D</th>
                  <th className="py-3 px-4 w-[22%]">Aktivitas Pekerjaan Lapangan</th>
                  <th className="py-3 px-4 w-[11%] text-center">Rencana Mulai</th>
                  <th className="py-3 px-4 w-[11%] text-center">Rencana Selesai</th>
                  <th className="py-3 px-4 w-[10%] text-center">Status 4D</th>
                  <th className="py-3 px-4 w-[10%] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((el) => (
                  <tr key={el.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {el.wbsCode || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{el.elementName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{el.guid.substring(0, 18)}...</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 truncate">
                      {el.activityName || "Belum terpetakan"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {el.plannedStartDate || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {el.plannedEndDate || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          el.executionStatus === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : el.executionStatus === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {el.executionStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setScheduleForm({
                            elementId: el.id,
                            wbsCode: el.wbsCode || "WBS-1.1.3",
                            activityName: el.activityName || el.elementName,
                            plannedStartDate: el.plannedStartDate || "2026-03-01",
                            plannedEndDate: el.plannedEndDate || "2026-03-31",
                            status: el.executionStatus,
                          });
                          setShowLinkScheduleModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                      >
                        Edit WBS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {elements.map((el) => (
              <div key={el.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{el.wbsCode || "NO-WBS"}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                      el.executionStatus === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {el.executionStatus}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900">{el.elementName}</div>
                <div className="text-[11px] text-slate-500">{el.activityName}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-mono text-slate-600">
                  <span>Mulai: {el.plannedStartDate || "-"}</span>
                  <span>Selesai: {el.plannedEndDate || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 5D COST INTEGRATION */}
      {activeTab === "5d-cost" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
            <DollarSign className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">
                Integrasi Elemen 3D BIM dengan Anggaran RAP / BOQ Konstruksi (BIM 5D)
              </p>
              <p className="mt-0.5 text-blue-800">
                Setiap objek spasial terhubung ke item breakdown biaya RAP proyek. Nilai anggaran dihitung langsung dari volume otomatis (*QTO / Quantity Takeoff*) model 3D dikalikan harga satuan kontrak.
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[12%]">Kode BOQ</th>
                  <th className="py-3 px-4 w-[24%]">Deskripsi Elemen 3D & Material</th>
                  <th className="py-3 px-4 w-[14%] text-right">Volume Model (QTO)</th>
                  <th className="py-3 px-4 w-[16%] text-right">Anggaran RAP (IDR)</th>
                  <th className="py-3 px-4 w-[16%] text-right">Realisasi Lapangan</th>
                  <th className="py-3 px-4 w-[18%] text-center">Variansi Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((el) => (
                  <tr key={el.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {el.boqItemCode || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{el.elementName}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{el.material}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {el.volumeQuantity} {el.uom}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {el.budgetCost.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      Rp {el.actualCost.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          el.costVariance < 0
                            ? "bg-emerald-100 text-emerald-800"
                            : el.costVariance > 0
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {el.costVariance === 0 ? "On Budget" : `Rp ${el.costVariance.toLocaleString("id-ID")}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {elements.map((el) => (
              <div key={el.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{el.boqItemCode}</span>
                  <span className="font-mono font-bold text-xs text-slate-900">{el.volumeQuantity} {el.uom}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">{el.elementName}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Anggaran RAP:</span>
                  <span className="font-mono font-bold text-slate-900">Rp {el.budgetCost.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BCF ISSUE TRACKER */}
      {activeTab === "bcf-issues" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">OpenBIM BCF (BIM Collaboration Format) Issue Center</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan tiket koordinasi teknis, instruksi revisi desain arsitek, dan penyelesaian masalah lapangan dengan koordinat kamera 3D.
              </p>
            </div>
            <button
              onClick={() => setShowCreateBcfModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Tiket BCF Baru
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[11%]">No. BCF</th>
                  <th className="py-3 px-4 w-[28%]">Judul Isu & Deskripsi Koordinasi</th>
                  <th className="py-3 px-4 w-[12%]">Tipe & Prioritas</th>
                  <th className="py-3 px-4 w-[16%]">Penanggung Jawab</th>
                  <th className="py-3 px-4 w-[12%] text-center">Kamera Viewpoint</th>
                  <th className="py-3 px-4 w-[10%] text-center">Status</th>
                  <th className="py-3 px-4 w-[11%] text-center">Aksi Resolusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bcfTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {topic.topicNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{topic.title}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{topic.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-[11px]">{topic.topicType}</div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-0.5 ${
                          topic.priority === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : topic.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {topic.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900 truncate">{topic.assignedTo}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">Oleh: {topic.createdByName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        X:{topic.viewpoint.posX} Y:{topic.viewpoint.posY}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          topic.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : topic.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {topic.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {topic.status !== "RESOLVED" ? (
                        <button
                          onClick={() => handleResolveBcf(topic.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {bcfTopics.map((topic) => (
              <div key={topic.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{topic.topicNumber}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                      topic.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">{topic.title}</div>
                <div className="text-[11px] text-slate-500">PJ: {topic.assignedTo}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-rose-700 font-bold">{topic.priority}</span>
                  {topic.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolveBcf(topic.id)}
                      className="px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CLASH DETECTION MATRIX */}
      {activeTab === "clash-detection" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Automated Spatial Clash Detection Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemeriksaan otomatis interferensi geometri antar-model disiplin (Hard Clash balok vs ducting, Soft Clearance jarak bebas pipa dengan kabel tegangan tinggi).
              </p>
            </div>
            <button
              onClick={() => setShowClashCheckModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none whitespace-nowrap"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Jalankan Analisis Benturan
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[11%]">No. Clash</th>
                  <th className="py-3 px-4 w-[21%]">Elemen Sumber (Disiplin A)</th>
                  <th className="py-3 px-4 w-[21%]">Elemen Target (Disiplin B)</th>
                  <th className="py-3 px-4 w-[12%] text-center">Tipe Benturan</th>
                  <th className="py-3 px-4 w-[11%] text-center">Penetrasi (mm)</th>
                  <th className="py-3 px-4 w-[14%]">Koordinat Spasial</th>
                  <th className="py-3 px-4 w-[10%] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clashResults.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {cls.clashNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{cls.sourceElement}</div>
                      <div className="text-[11px] text-slate-500 truncate">{cls.sourceModelName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate">{cls.targetElement}</div>
                      <div className="text-[11px] text-slate-500 truncate">{cls.targetModelName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {cls.clashType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600">
                      {cls.penetrationDistanceMm} mm
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 truncate">
                      X:{cls.coordinates.x} Y:{cls.coordinates.y} Z:{cls.coordinates.z}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                          cls.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
            {clashResults.map((cls) => (
              <div key={cls.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{cls.clashNumber}</span>
                  <span className="font-mono font-bold text-xs text-rose-600">{cls.penetrationDistanceMm} mm</span>
                </div>
                <div className="text-xs text-slate-800 font-semibold truncate">{cls.sourceElement}</div>
                <div className="text-xs text-slate-500 truncate">vs {cls.targetElement}</div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded">{cls.clashType}</span>
                  <span className="text-[10px] font-bold text-rose-700">{cls.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD MODEL 3D BIM */}
      {showUploadModelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Unggah Model 3D BIM Baru</h3>
              <button
                onClick={() => setShowUploadModelModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadModel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Model BIM</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Model Struktur Pier Head Stasiun Glodok"
                  value={modelForm.modelName}
                  onChange={(e) => setModelForm({ ...modelForm, modelName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Disiplin Teknis</label>
                  <select
                    value={modelForm.discipline}
                    onChange={(e) => setModelForm({ ...modelForm, discipline: e.target.value as BimDiscipline })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="STRUCTURE">Struktur Beton / Baja</option>
                    <option value="MEP">Utilitas MEP & HVAC</option>
                    <option value="ARCHITECTURE">Arsitektur & Finishing</option>
                    <option value="CIVIL_INFRASTRUCTURE">Sipil & Terowongan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format Berkas</label>
                  <select
                    value={modelForm.fileFormat}
                    onChange={(e) => setModelForm({ ...modelForm, fileFormat: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="IFC4">OpenBIM IFC 4</option>
                    <option value="IFC2X3">OpenBIM IFC 2x3</option>
                    <option value="RVT">Autodesk Revit RVT</option>
                    <option value="NWD">Navisworks NWD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Ketelitian (LOD)</label>
                  <select
                    value={modelForm.lodLevel}
                    onChange={(e) => setModelForm({ ...modelForm, lodLevel: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="LOD_300">LOD 300 (Design Approval)</option>
                    <option value="LOD_350">LOD 350 (Construction Detailing)</option>
                    <option value="LOD_400">LOD 400 (Fabrication / As-Built)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Lead BIM</label>
                  <input
                    type="text"
                    value={modelForm.authorName}
                    onChange={(e) => setModelForm({ ...modelForm, authorName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Model</label>
                <textarea
                  rows={3}
                  placeholder="Catatan rilis model federasi..."
                  value={modelForm.description}
                  onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm"
                >
                  Muat Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT ISU BCF */}
      {showCreateBcfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Buat Isu Koordinasi Lapangan BCF</h3>
              <button
                onClick={() => setShowCreateBcfModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBcf} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Isu</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pipa HVAC Berbenturan dengan Balok Girder G-14"
                  value={bcfForm.title}
                  onChange={(e) => setBcfForm({ ...bcfForm, title: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Isu</label>
                  <select
                    value={bcfForm.topicType}
                    onChange={(e) => setBcfForm({ ...bcfForm, topicType: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="CLASH">Benturan Spasial (Clash)</option>
                    <option value="DESIGN_DEFECT">Kecacatan Desain (Design Defect)</option>
                    <option value="SITE_OBSTRUCTION">Hambatan Lapangan (Obstruction)</option>
                    <option value="SAFETY_HAZARD">Bahaya Keselamatan (Safety)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={bcfForm.priority}
                    onChange={(e) => setBcfForm({ ...bcfForm, priority: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="CRITICAL">Critical (Bloker Lapangan)</option>
                    <option value="HIGH">High (Tinggi)</option>
                    <option value="MEDIUM">Medium (Sedang)</option>
                    <option value="LOW">Low (Rendah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ditugaskan Kepada (Penanggung Jawab)</label>
                <input
                  type="text"
                  required
                  value={bcfForm.assignedTo}
                  onChange={(e) => setBcfForm({ ...bcfForm, assignedTo: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi & Catatan Koordinasi</label>
                <textarea
                  rows={3}
                  value={bcfForm.description}
                  onChange={(e) => setBcfForm({ ...bcfForm, description: e.target.value })}
                  placeholder="Penjelasan rinci dan usulan rekayasa teknis..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateBcfModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm"
                >
                  Simpan Isu BCF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RUN CLASH CHECK */}
      {showClashCheckModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Jalankan Analisis Clash Detection</h3>
              <button
                onClick={() => setShowClashCheckModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRunClash} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Sumber (Disiplin Utama)</label>
                <select
                  value={clashForm.sourceModelId}
                  onChange={(e) => setClashForm({ ...clashForm, sourceModelId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.discipline} - {m.modelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Target (Disiplin Pembanding)</label>
                <select
                  value={clashForm.targetModelId}
                  onChange={(e) => setClashForm({ ...clashForm, targetModelId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.discipline} - {m.modelName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Toleransi (mm)</label>
                  <input
                    type="number"
                    value={clashForm.toleranceMm}
                    onChange={(e) => setClashForm({ ...clashForm, toleranceMm: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Analisis Benturan</label>
                  <select
                    value={clashForm.clashType}
                    onChange={(e) => setClashForm({ ...clashForm, clashType: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="HARD_CLASH">Hard Clash (Interferensi Padat)</option>
                    <option value="SOFT_CLEARANCE">Soft Clearance (Jarak Bebas)</option>
                    <option value="DUPLICATE_GEOMETRY">Duplicate Geometry</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowClashCheckModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm"
                >
                  Jalankan Deteksi Benturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LINK 4D SCHEDULE */}
      {showLinkScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tautkan Elemen BIM ke Jadwal WBS 4D</h3>
              <button
                onClick={() => setShowLinkScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLinkSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Elemen BIM</label>
                <select
                  value={scheduleForm.elementId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, elementId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                >
                  {elements.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.elementName} ({el.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode WBS</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.wbsCode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, wbsCode: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Progres 4D</label>
                  <select
                    value={scheduleForm.status}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Aktivitas WBS</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.activityName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, activityName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana Mulai</label>
                  <input
                    type="date"
                    value={scheduleForm.plannedStartDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, plannedStartDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana Selesai</label>
                  <input
                    type="date"
                    value={scheduleForm.plannedEndDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, plannedEndDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLinkScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Tautkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
