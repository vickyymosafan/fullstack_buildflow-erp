import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { CreateBcfTopicDto } from './dto/create-bcf-topic.dto';
import { RunClashCheckDto } from './dto/run-clash-check.dto';
import { Link4dScheduleDto } from './dto/link-4d-schedule.dto';
import { Map5dCostDto } from './dto/map-5d-cost.dto';

export type BimDiscipline = 'ARCHITECTURE' | 'STRUCTURE' | 'MEP' | 'CIVIL_INFRASTRUCTURE';
export type BcfTopicStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ClashType = 'HARD_CLASH' | 'SOFT_CLEARANCE' | 'DUPLICATE_GEOMETRY';

export interface BimModelRecord {
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

export interface BimElementRecord {
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
  // 4D Time Simulation data
  wbsCode?: string;
  activityName?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  executionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  // 5D Cost Loaded data
  boqItemCode?: string;
  budgetCost: number;
  actualCost: number;
  costVariance: number;
}

export interface BcfTopicRecord {
  id: string;
  topicNumber: string;
  projectId: string;
  title: string;
  topicType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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

export interface ClashResultRecord {
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
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  coordinates: { x: number; y: number; z: number };
  status: 'ACTIVE' | 'RESOLVED' | 'IGNORED';
  detectedAt: string;
  resolutionNotes?: string;
}

@Injectable()
export class BimService {
  private models: BimModelRecord[] = [
    {
      id: 'MOD-001',
      modelCode: 'BIM-STR-2026-001',
      projectId: 'PRJ-MRT-001',
      projectName: 'MRT Fase 2A CP201 Monas-Harmoni',
      modelName: 'Model Struktur Stasiun Bawah Tanah Harmoni',
      discipline: 'STRUCTURE',
      fileFormat: 'IFC4',
      lodLevel: 'LOD_350',
      fileSize: '184.2 MB',
      elementsCount: 1420,
      authorName: 'Ir. Dwi Prasetyo, S.T. (Lead BIM Structure)',
      version: 4,
      uploadedAt: '2026-03-01T08:30:00Z',
      description: 'Model struktur D-Wall, bored pile group, slab concourse, dan king post baja portal',
    },
    {
      id: 'MOD-002',
      modelCode: 'BIM-MEP-2026-002',
      projectId: 'PRJ-MRT-001',
      projectName: 'MRT Fase 2A CP201 Monas-Harmoni',
      modelName: 'Model Utilitas MEP Tunnel & Sistem HVAC Stasiun',
      discipline: 'MEP',
      fileFormat: 'IFC4',
      lodLevel: 'LOD_350',
      fileSize: '142.8 MB',
      elementsCount: 2890,
      authorName: 'Ir. Ahmad Baihaqi (MEP BIM Specialist)',
      version: 3,
      uploadedAt: '2026-03-02T11:15:00Z',
      description: 'Ducting ventilasi darurat tunnel, chiller piping 250mm, sprinkler pemadam kebakaran, dan cable tray listrik',
    },
    {
      id: 'MOD-003',
      modelCode: 'BIM-ARC-2026-003',
      projectId: 'PRJ-MRT-001',
      projectName: 'MRT Fase 2A CP201 Monas-Harmoni',
      modelName: 'Model Arsitektur Finishing & Platform Concourse',
      discipline: 'ARCHITECTURE',
      fileFormat: 'IFC4',
      lodLevel: 'LOD_300',
      fileSize: '96.5 MB',
      elementsCount: 950,
      authorName: 'Siti Nurhaliza, S.Ars (Architectural Lead)',
      version: 2,
      uploadedAt: '2026-03-03T14:00:00Z',
      description: 'Dinding partisi acoustic, platform screen door (PSD), granit flooring, dan ceiling baja ekspos',
    },
    {
      id: 'MOD-004',
      modelCode: 'BIM-BNR-2026-004',
      projectId: 'PRJ-BNR-003',
      projectName: 'Bendungan Bener Paket 2',
      modelName: 'Model 3D Terowongan Pengelak & Bangunan Pelimpah Spillway',
      discipline: 'CIVIL_INFRASTRUCTURE',
      fileFormat: 'IFC4',
      lodLevel: 'LOD_300',
      fileSize: '215.0 MB',
      elementsCount: 780,
      authorName: 'Rudi Hermawan, S.T. (Civil Infrastructure BIM)',
      version: 2,
      uploadedAt: '2026-02-25T10:00:00Z',
      description: 'Geometri galian terowongan pengelak diameter 7m dan struktur beton pelimpah air',
    },
    {
      id: 'MOD-005',
      modelCode: 'BIM-CSM-2026-005',
      projectId: 'PRJ-CSM-002',
      projectName: 'Jalan Tol Cisumdawu Seksi 6',
      modelName: 'Model Gelagar Jembatan Baja Bentang 60m',
      discipline: 'STRUCTURE',
      fileFormat: 'IFC4',
      lodLevel: 'LOD_350',
      fileSize: '112.4 MB',
      elementsCount: 640,
      authorName: 'Ir. Dwi Prasetyo, S.T. (Lead BIM Structure)',
      version: 3,
      uploadedAt: '2026-02-28T16:20:00Z',
      description: 'Struktur composite steel box girder dan elastomer bearing pad jembatan overpass',
    },
  ];

  private elements: BimElementRecord[] = [
    {
      id: 'ELE-DW-001',
      modelId: 'MOD-001',
      ifcType: 'IfcWallStandardCase',
      elementName: 'Diaphragm Wall Panel DW-01 (Tebal 1000mm)',
      discipline: 'STRUCTURE',
      guid: '3A5B8F9C-1122-4433-8899-AABBCCDDEE01',
      locationZone: 'Grid 1-3 / North Shaft Monas',
      elevation: '-18.50 m s.d. +0.00 m',
      material: 'Beton Bertulang K-400 Ready Mix Semen Portland',
      volumeQuantity: 78.5,
      uom: 'm3',
      wbsCode: 'WBS-1.1.1',
      activityName: 'Pekerjaan Pengecoran D-Wall Baris 1',
      plannedStartDate: '2026-02-01',
      plannedEndDate: '2026-02-20',
      actualStartDate: '2026-02-01',
      actualEndDate: '2026-02-18',
      executionStatus: 'COMPLETED',
      boqItemCode: 'BOQ-STR-001',
      budgetCost: 145225000,
      actualCost: 141900000,
      costVariance: -3325000,
    },
    {
      id: 'ELE-BP-002',
      modelId: 'MOD-001',
      ifcType: 'IfcFooting',
      elementName: 'Bored Pile Dia 1200mm P-14 Kedalaman 32m',
      discipline: 'STRUCTURE',
      guid: '3A5B8F9C-1122-4433-8899-AABBCCDDEE02',
      locationZone: 'Grid 4-6 / Center Platform Harmoni',
      elevation: '-32.00 m s.d. -14.00 m',
      material: 'Beton Tremie K-350 & Besi Ulir BJTD-40',
      volumeQuantity: 36.2,
      uom: 'm3',
      wbsCode: 'WBS-1.1.2',
      activityName: 'Pengeboran & Pengecoran Bored Pile Harmoni',
      plannedStartDate: '2026-02-15',
      plannedEndDate: '2026-03-05',
      actualStartDate: '2026-02-16',
      actualEndDate: '2026-03-04',
      executionStatus: 'COMPLETED',
      boqItemCode: 'BOQ-STR-004',
      budgetCost: 66970000,
      actualCost: 68500000,
      costVariance: 1530000,
    },
    {
      id: 'ELE-SLB-003',
      modelId: 'MOD-001',
      ifcType: 'IfcSlab',
      elementName: 'Concourse Level Base Slab Tebal 800mm',
      discipline: 'STRUCTURE',
      guid: '3A5B8F9C-1122-4433-8899-AABBCCDDEE03',
      locationZone: 'Zone B / Station Box Main Hall',
      elevation: '-12.00 m',
      material: 'Beton K-450 Waterproofing Additive Integral',
      volumeQuantity: 312.0,
      uom: 'm3',
      wbsCode: 'WBS-1.2.1',
      activityName: 'Pembesian & Pengecoran Plat Lantai Concourse',
      plannedStartDate: '2026-03-01',
      plannedEndDate: '2026-03-25',
      actualStartDate: '2026-03-02',
      executionStatus: 'IN_PROGRESS',
      boqItemCode: 'BOQ-STR-012',
      budgetCost: 592800000,
      actualCost: 280000000,
      costVariance: -12800000,
    },
    {
      id: 'ELE-MEP-004',
      modelId: 'MOD-002',
      ifcType: 'IfcDuctSegment',
      elementName: 'Tunnel Exhaust HVAC Duct Galvanized 1200x800mm',
      discipline: 'MEP',
      guid: '3A5B8F9C-1122-4433-8899-AABBCCDDEE04',
      locationZone: 'Overhead Track 1 / North Bound',
      elevation: '-10.50 m',
      material: 'Baja Galvanis BJLS 100 & Rockwool Insulation',
      volumeQuantity: 120.0,
      uom: 'm',
      wbsCode: 'WBS-2.1.3',
      activityName: 'Pemasangan Ducting Ventilasi Terowongan',
      plannedStartDate: '2026-03-10',
      plannedEndDate: '2026-03-30',
      executionStatus: 'NOT_STARTED',
      boqItemCode: 'BOQ-MEP-008',
      budgetCost: 216000000,
      actualCost: 0,
      costVariance: 0,
    },
    {
      id: 'ELE-MEP-005',
      modelId: 'MOD-002',
      ifcType: 'IfcPipeSegment',
      elementName: 'Chilled Water Supply Carbon Steel Pipe DN250',
      discipline: 'MEP',
      guid: '3A5B8F9C-1122-4433-8899-AABBCCDDEE05',
      locationZone: 'Chiller Plant Room ke Shaft Vertikal',
      elevation: '-14.20 m',
      material: 'Pipa Seamless Carbon Steel ASTM A53 Grade B',
      volumeQuantity: 84.0,
      uom: 'm',
      wbsCode: 'WBS-2.2.1',
      activityName: 'Instalasi Pipa Utama Chiller AHU Stasiun',
      plannedStartDate: '2026-03-15',
      plannedEndDate: '2026-04-05',
      executionStatus: 'NOT_STARTED',
      boqItemCode: 'BOQ-MEP-015',
      budgetCost: 184800000,
      actualCost: 0,
      costVariance: 0,
    },
  ];

  private bcfTopics: BcfTopicRecord[] = [
    {
      id: 'BCF-001',
      topicNumber: 'BCF-2026-001',
      projectId: 'PRJ-MRT-001',
      title: 'Benturan Spasial: Pipa Chiller DN250 Menembus Balok Girder G-14 Tanpa Sleeve',
      topicType: 'CLASH',
      priority: 'CRITICAL',
      status: 'OPEN',
      assignedTo: 'Ir. Ahmad Baihaqi (MEP Lead)',
      createdByName: 'Ir. Dwi Prasetyo, S.T. (BIM Coordinator)',
      relatedElementId: 'ELE-MEP-005',
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
      createdAt: '2026-03-03T10:00:00Z',
      updatedAt: '2026-03-04T09:30:00Z',
      description: 'Pipa suplai pendingin AHU terbentur tulangan utama balok beton portal G-14 elevasi -14.20m. Perlu rerouting jalur pipa atau penyesuaian posisi sleeve balok sebelum cor.',
    },
    {
      id: 'BCF-002',
      topicNumber: 'BCF-2026-002',
      projectId: 'PRJ-MRT-001',
      title: 'Deviasi Elevasi Level Plat Concourse Slab Terhadap Gambar DED (+15mm)',
      topicType: 'DESIGN_DEFECT',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Bambang Kusumo, S.T. (Senior Site Engineer)',
      createdByName: 'Siti Nurhaliza, S.Ars (Architectural Lead)',
      relatedElementId: 'ELE-SLB-003',
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
      createdAt: '2026-03-04T11:20:00Z',
      updatedAt: '2026-03-05T08:00:00Z',
      description: 'Elevasi top of concrete plat concourse lebih tinggi 15mm dari desain elevasi finishing lantai granit arsitektur.',
    },
    {
      id: 'BCF-003',
      topicNumber: 'BCF-2026-003',
      projectId: 'PRJ-BNR-003',
      title: 'Konflik Jalur Kabel Sensor Piezometer Dengan Pipa Injeksi Grouting Spillway',
      topicType: 'SITE_OBSTRUCTION',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedTo: 'Rudi Hermawan, S.T. (Civil Infrastructure BIM)',
      createdByName: 'Hendra Saputra (Instrumentation Engineer)',
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
      createdAt: '2026-02-26T14:00:00Z',
      updatedAt: '2026-03-01T16:00:00Z',
      description: 'Jalur conduit kabel piezometer dialihkan ke trench drainase sekunder sisi barat.',
    },
  ];

  private clashResults: ClashResultRecord[] = [
    {
      id: 'CLS-001',
      clashNumber: 'CLS-2026-001',
      projectId: 'PRJ-MRT-001',
      sourceModelName: 'Model Struktur Bawah Tanah Harmoni',
      sourceElement: 'Balok Beton Portal Girder G-14 (Grid D-4)',
      targetModelName: 'Model Utilitas MEP Tunnel & HVAC',
      targetElement: 'Chilled Water Supply Pipe DN250 (P-CHW-01)',
      clashType: 'HARD_CLASH',
      toleranceMm: 25,
      penetrationDistanceMm: 85,
      severity: 'CRITICAL',
      coordinates: { x: 18.45, y: -14.2, z: 32.1 },
      status: 'ACTIVE',
      detectedAt: '2026-03-03T09:45:00Z',
      resolutionNotes: 'Sudah diterbitkan BCF-2026-001 ke MEP Coordinator untuk penurunan elevasi pipa 150mm',
    },
    {
      id: 'CLS-002',
      clashNumber: 'CLS-2026-002',
      projectId: 'PRJ-MRT-001',
      sourceModelName: 'Model Struktur Bawah Tanah Harmoni',
      sourceElement: 'D-Wall Panel DW-04 Baris 2',
      targetModelName: 'Model Utilitas MEP Tunnel & HVAC',
      targetElement: 'Cable Tray Listrik Tegangan Menengah 20kV',
      clashType: 'SOFT_CLEARANCE',
      toleranceMm: 50,
      penetrationDistanceMm: 18,
      severity: 'MAJOR',
      coordinates: { x: 25.1, y: -16.0, z: 12.3 },
      status: 'ACTIVE',
      detectedAt: '2026-03-03T09:48:00Z',
      resolutionNotes: 'Jarak bebas minimum dengan dinding basah terowongan kurang dari 100mm syarat standar K3',
    },
    {
      id: 'CLS-003',
      clashNumber: 'CLS-2026-003',
      projectId: 'PRJ-MRT-001',
      sourceModelName: 'Model Arsitektur Finishing & Platform',
      sourceElement: 'Dinding Panel Kaca Platform Screen Door (PSD)',
      targetModelName: 'Model Struktur Bawah Tanah Harmoni',
      targetElement: 'Kolom Struktur Baja KS-08 Plat Concourse',
      clashType: 'HARD_CLASH',
      toleranceMm: 10,
      penetrationDistanceMm: 0,
      severity: 'MINOR',
      coordinates: { x: 30.0, y: -12.0, z: 45.0 },
      status: 'RESOLVED',
      detectedAt: '2026-02-28T10:00:00Z',
      resolutionNotes: 'Selesai disesuaikan bracket ekspansi pada as arsitektur',
    },
  ];

  // 1. GET /summary
  getSummary() {
    const totalModels = this.models.length;
    const totalElements = this.models.reduce((acc, curr) => acc + curr.elementsCount, 0);

    const completedElements = this.elements.filter((e) => e.executionStatus === 'COMPLETED').length;
    const inProgressElements = this.elements.filter((e) => e.executionStatus === 'IN_PROGRESS').length;
    const totalTrackedElements = this.elements.length;
    const scheduleProgressPercent =
      totalTrackedElements > 0
        ? Math.round(((completedElements + inProgressElements * 0.5) / totalTrackedElements) * 1000) / 10
        : 68.5;

    const total5dBudgetValue = this.elements.reduce((acc, curr) => acc + curr.budgetCost, 0);
    const total5dActualValue = this.elements.reduce((acc, curr) => acc + curr.actualCost, 0);

    const openBcfIssues = this.bcfTopics.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const activeClashes = this.clashResults.filter((c) => c.status === 'ACTIVE').length;

    return {
      totalModels,
      totalElements,
      schedule4D: {
        completedElements,
        inProgressElements,
        progressPercent: scheduleProgressPercent,
      },
      cost5D: {
        totalBudgetValue: total5dBudgetValue,
        totalActualValue: total5dActualValue,
        netVariance: total5dActualValue - total5dBudgetValue,
      },
      coordination: {
        openBcfIssues,
        activeClashes,
        totalBcfTopics: this.bcfTopics.length,
        totalClashesDetected: this.clashResults.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // 2. GET /models
  getModels(discipline?: string, projectId?: string) {
    let result = [...this.models];
    if (discipline && discipline !== 'ALL') {
      result = result.filter((m) => m.discipline === discipline);
    }
    if (projectId && projectId !== 'ALL') {
      result = result.filter((m) => m.projectId === projectId);
    }
    return result;
  }

  // 3. POST /models
  createModel(dto: CreateBimModelDto) {
    const nextSeq = this.models.length + 1;
    const modelCode = `BIM-${dto.discipline.substring(0, 3)}-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `MOD-${String(nextSeq).padStart(3, '0')}`;

    const newModel: BimModelRecord = {
      id,
      modelCode,
      projectId: dto.projectId,
      projectName: dto.projectName,
      modelName: dto.modelName,
      discipline: dto.discipline,
      fileFormat: dto.fileFormat,
      lodLevel: dto.lodLevel,
      fileSize: dto.fileSize || '85.0 MB',
      elementsCount: 500,
      authorName: dto.authorName || 'PT BuildFlow BIM Center',
      version: 1,
      uploadedAt: new Date().toISOString(),
      description: dto.description,
    };

    this.models.unshift(newModel);
    return {
      message: `Model 3D BIM ${newModel.modelName} (${newModel.modelCode}) berhasil diunggah ke Digital Twin Engine.`,
      model: newModel,
    };
  }

  // 4. GET /models/:id/elements
  getElementsByModel(modelId: string) {
    const model = this.models.find((m) => m.id === modelId || m.modelCode === modelId);
    if (!model) {
      return this.elements;
    }
    return this.elements.filter((e) => e.modelId === model.id);
  }

  // 5. GET /4d-schedule
  get4dSchedule() {
    return {
      timelineWeeks: 52,
      currentSimulationWeek: 10,
      elements: this.elements.map((e) => ({
        id: e.id,
        elementName: e.elementName,
        discipline: e.discipline,
        wbsCode: e.wbsCode,
        activityName: e.activityName,
        plannedStartDate: e.plannedStartDate,
        plannedEndDate: e.plannedEndDate,
        actualStartDate: e.actualStartDate,
        actualEndDate: e.actualEndDate,
        executionStatus: e.executionStatus,
      })),
    };
  }

  // 6. PATCH /4d-schedule/link
  link4dSchedule(dto: Link4dScheduleDto) {
    const element = this.elements.find((e) => e.id === dto.elementId);
    if (!element) {
      throw new NotFoundException(`Elemen BIM ${dto.elementId} tidak ditemukan`);
    }

    element.wbsCode = dto.wbsCode;
    element.activityName = dto.activityName;
    element.plannedStartDate = dto.plannedStartDate;
    element.plannedEndDate = dto.plannedEndDate;
    if (dto.actualStartDate) element.actualStartDate = dto.actualStartDate;
    if (dto.actualEndDate) element.actualEndDate = dto.actualEndDate;
    if (dto.status) element.executionStatus = dto.status;

    return {
      message: `Elemen ${element.elementName} berhasil dihubungkan ke jadwal WBS ${dto.wbsCode}.`,
      element,
    };
  }

  // 7. GET /5d-cost
  get5dCostData() {
    const totalBudget = this.elements.reduce((acc, curr) => acc + curr.budgetCost, 0);
    const totalActual = this.elements.reduce((acc, curr) => acc + curr.actualCost, 0);
    const variance = totalActual - totalBudget;

    return {
      totalBudget,
      totalActual,
      variance,
      elements: this.elements,
    };
  }

  // 8. PATCH /5d-cost/map
  map5dCost(dto: Map5dCostDto) {
    const element = this.elements.find((e) => e.id === dto.elementId);
    if (!element) {
      throw new NotFoundException(`Elemen BIM ${dto.elementId} tidak ditemukan`);
    }

    element.boqItemCode = dto.boqItemCode;
    element.volumeQuantity = dto.designQuantity;
    element.uom = dto.uom;
    element.budgetCost = dto.designQuantity * dto.unitRate;
    if (dto.actualQuantity && dto.actualUnitRate) {
      element.actualCost = dto.actualQuantity * dto.actualUnitRate;
    }
    element.costVariance = element.actualCost - element.budgetCost;

    return {
      message: `Elemen ${element.elementName} berhasil dipetakan ke item BOQ ${dto.boqItemCode} senilai Rp ${element.budgetCost.toLocaleString('id-ID')}.`,
      element,
    };
  }

  // 9. GET /bcf/topics
  getBcfTopics(status?: string, priority?: string) {
    let result = [...this.bcfTopics];
    if (status && status !== 'ALL') {
      result = result.filter((t) => t.status === status);
    }
    if (priority && priority !== 'ALL') {
      result = result.filter((t) => t.priority === priority);
    }
    return result;
  }

  // 10. POST /bcf/topics
  createBcfTopic(dto: CreateBcfTopicDto) {
    const nextSeq = this.bcfTopics.length + 1;
    const topicNumber = `BCF-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `BCF-${String(nextSeq).padStart(3, '0')}`;

    const newTopic: BcfTopicRecord = {
      id,
      topicNumber,
      projectId: dto.projectId,
      title: dto.title,
      topicType: dto.topicType,
      priority: dto.priority,
      status: 'OPEN',
      assignedTo: dto.assignedTo,
      createdByName: dto.createdByName,
      relatedElementId: dto.relatedElementId,
      viewpoint: dto.viewpoint || {
        posX: 10,
        posY: -10,
        posZ: 20,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        fov: 60,
      },
      commentsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: dto.description,
    };

    this.bcfTopics.unshift(newTopic);
    return {
      message: `Isu koordinasi lapangan BCF ${topicNumber} berhasil didaftarkan dan ditugaskan ke ${newTopic.assignedTo}.`,
      topic: newTopic,
    };
  }

  // 11. PATCH /bcf/topics/:id/status
  updateBcfStatus(id: string, status: BcfTopicStatus, resolutionNotes?: string) {
    const topic = this.bcfTopics.find((t) => t.id === id || t.topicNumber === id);
    if (!topic) {
      throw new NotFoundException(`Isu BCF ${id} tidak ditemukan`);
    }

    topic.status = status;
    topic.updatedAt = new Date().toISOString();
    if (resolutionNotes) {
      topic.description = `${topic.description || ''} [Resolusi: ${resolutionNotes}]`;
    }

    return {
      message: `Status isu koordinasi BCF ${topic.topicNumber} diperbarui menjadi ${status}.`,
      topic,
    };
  }

  // 12. POST /clash/run
  runClashCheck(dto: RunClashCheckDto) {
    const nextSeq = this.clashResults.length + 1;
    const clashNumber = `CLS-2026-${String(nextSeq).padStart(3, '0')}`;
    const id = `CLS-${String(nextSeq).padStart(3, '0')}`;

    const newClash: ClashResultRecord = {
      id,
      clashNumber,
      projectId: dto.projectId,
      sourceModelName: 'Model Struktur Bawah Tanah Harmoni',
      sourceElement: 'Kolom Beton Bertulang C-12 Elevasi -14m',
      targetModelName: 'Model Utilitas MEP Tunnel & HVAC',
      targetElement: 'Pipa Drainase Sump Pit Dia 150mm',
      clashType: dto.clashType,
      toleranceMm: dto.toleranceMm,
      penetrationDistanceMm: 42,
      severity: 'MAJOR',
      coordinates: { x: 21.3, y: -14.0, z: 28.5 },
      status: 'ACTIVE',
      detectedAt: new Date().toISOString(),
      resolutionNotes: 'Otomatis terdeteksi oleh Engine Clash Matrix dengan batas toleransi ' + dto.toleranceMm + 'mm',
    };

    this.clashResults.unshift(newClash);
    return {
      message: `Pemeriksaan benturan spasial selesai. Ditemukan 1 benturan baru ${clashNumber} dengan penetrasi 42mm.`,
      clash: newClash,
      summary: {
        totalClashes: this.clashResults.length,
        activeCount: this.clashResults.filter((c) => c.status === 'ACTIVE').length,
        resolvedCount: this.clashResults.filter((c) => c.status === 'RESOLVED').length,
      },
    };
  }
}

