import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  RegisterFlightMissionDto,
  CompleteMissionProcessingDto,
  CalculateEarthworkVolumeDto,
  RunAiVisualInspectionDto,
  ResolveAiDefectDto,
} from './dto/photogrammetry.dto';

export interface FlightMission {
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
  kkopAirspaceStatus: 'KKOP_CLEARED' | 'SPECIAL_NOTAM_APPROVED';
  status: 'COMPLETED_ORTHO_LIDAR' | 'PROCESSING_SFM_CLOUD' | 'FLIGHT_SCHEDULED';
  rmseAccuracyCm: number;
  densePointsCount: number;
  capturedPhotosCount: number;
  executedAt: string;
}

export interface PointCloudModel {
  id: string;
  missionId: string;
  missionCode: string;
  projectName: string;
  crsepsg: string;
  format: 'LAZ_COPC_1_4' | 'GEOTIFF_DSM_DTM' | '3D_TILES_CESIUM';
  densePointsCount: number;
  orthomosaicResolutionCm: number;
  rmseZCm: number;
  fileSizeGb: number;
  opnameReady: boolean;
  generatedAt: string;
}

export interface EarthworkVolumeRecord {
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
  opnameVerificationStatus: 'CERTIFIED_FOR_MC' | 'VARIANCE_AUDIT_REQUIRED' | 'IN_PROGRESS';
  calculatedAt: string;
}

export interface AiVisualDefectRecord {
  id: string;
  structureElement: string;
  projectId: string;
  missionId: string;
  defectType: 'STRUCTURAL_CRACK' | 'CONCRETE_SPALLING' | 'EXPOSED_REBAR_CORROSION' | 'WATER_SEEPAGE_HONEYCOMB';
  crackWidthMm: number;
  defectExtentMeters: number;
  aiConfidencePct: number;
  sniSeverityGrade: 'CRITICAL_SNI_BREACH' | 'MODERATE_REPAIR_NEEDED' | 'HAIRLINE_MONITORING';
  status: 'OPEN_NCR_RAISED' | 'REMEDIATED_VERIFIED';
  inspectorName?: string;
  remediationNotes?: string;
  detectedAt: string;
  resolvedAt?: string;
}

@Injectable()
export class PhotogrammetryService {
  private missions: FlightMission[] = [
    {
      id: 'MSN-001',
      missionCode: 'MSN-IKN-2026-001',
      projectId: 'PRJ-IKN-TOL-3A',
      projectName: 'Tol IKN Seksi 3A (Segmen Karang Joang - KKT Kariangau)',
      uavModel: 'DJI Matrice 350 RTK + Zenmuse L2 LiDAR',
      pilotName: 'Capt. Raka Pratama (DKPPU #8841)',
      altitudeAglMeters: 90,
      overlapPct: 80,
      gsdCmPerPx: 1.35,
      gcpCount: 14,
      notamPermitRef: 'AIRNAV-BPN-0192/2026',
      kkopAirspaceStatus: 'KKOP_CLEARED',
      status: 'COMPLETED_ORTHO_LIDAR',
      rmseAccuracyCm: 1.42,
      densePointsCount: 64200000,
      capturedPhotosCount: 1480,
      executedAt: '2026-11-05T08:30:00.000Z',
    },
    {
      id: 'MSN-002',
      missionCode: 'MSN-IKN-2026-002',
      projectId: 'PRJ-IKN-TOL-3A',
      projectName: 'Jembatan Sungai Wain & Overpass STA 14+200',
      uavModel: 'DJI Mavic 3 Enterprise RTK (Close-Range Oblique)',
      pilotName: 'Capt. Dimas Anggara (DKPPU #9104)',
      altitudeAglMeters: 45,
      overlapPct: 85,
      gsdCmPerPx: 0.65,
      gcpCount: 8,
      notamPermitRef: 'AIRNAV-BPN-0205/2026',
      kkopAirspaceStatus: 'KKOP_CLEARED',
      status: 'COMPLETED_ORTHO_LIDAR',
      rmseAccuracyCm: 0.95,
      densePointsCount: 38900000,
      capturedPhotosCount: 920,
      executedAt: '2026-11-06T09:15:00.000Z',
    },
    {
      id: 'MSN-003',
      missionCode: 'MSN-BDG-2026-003',
      projectId: 'PRJ-BENDUNGAN-02',
      projectName: 'Bendungan Sepaku Semoi Paket II (Spillway & Main Dam)',
      uavModel: 'WingtraOne Gen II PPK Fixed-Wing + Sony RX1R II 42MP',
      pilotName: 'Capt. Fajar Nugroho (DKPPU #7732)',
      altitudeAglMeters: 115,
      overlapPct: 75,
      gsdCmPerPx: 1.5,
      gcpCount: 18,
      notamPermitRef: 'AIRNAV-BPN-0219/2026',
      kkopAirspaceStatus: 'KKOP_CLEARED',
      status: 'PROCESSING_SFM_CLOUD',
      rmseAccuracyCm: 1.85,
      densePointsCount: 51400000,
      capturedPhotosCount: 2150,
      executedAt: '2026-11-06T14:40:00.000Z',
    },
  ];

  private pointClouds: PointCloudModel[] = [
    {
      id: 'PCL-001',
      missionId: 'MSN-001',
      missionCode: 'MSN-IKN-2026-001',
      projectName: 'Tol IKN Seksi 3A (STA 10+000 - STA 13+200)',
      crsepsg: 'EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)',
      format: 'LAZ_COPC_1_4',
      densePointsCount: 64200000,
      orthomosaicResolutionCm: 1.35,
      rmseZCm: 1.42,
      fileSizeGb: 14.8,
      opnameReady: true,
      generatedAt: '2026-11-05T13:10:00.000Z',
    },
    {
      id: 'PCL-002',
      missionId: 'MSN-002',
      missionCode: 'MSN-IKN-2026-002',
      projectName: 'Jembatan Sungai Wain 3D Mesh & Close-Range Point Cloud',
      crsepsg: 'EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)',
      format: '3D_TILES_CESIUM',
      densePointsCount: 38900000,
      orthomosaicResolutionCm: 0.65,
      rmseZCm: 0.95,
      fileSizeGb: 9.4,
      opnameReady: true,
      generatedAt: '2026-11-06T12:45:00.000Z',
    },
    {
      id: 'PCL-003',
      missionId: 'MSN-001',
      missionCode: 'MSN-IKN-2026-001',
      projectName: 'Digital Terrain Model (DTM Bare-Earth LiDAR Classified)',
      crsepsg: 'EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)',
      format: 'GEOTIFF_DSM_DTM',
      densePointsCount: 29500000,
      orthomosaicResolutionCm: 2.0,
      rmseZCm: 1.42,
      fileSizeGb: 4.2,
      opnameReady: true,
      generatedAt: '2026-11-05T14:00:00.000Z',
    },
  ];

  private earthworkVolumes: EarthworkVolumeRecord[] = [
    {
      id: 'VOL-001',
      corridorSegment: 'STA 10+000 - STA 11+500 (Galian Bukit & Timbunan Badan Jalan)',
      projectId: 'PRJ-IKN-TOL-3A',
      missionId: 'MSN-001',
      boqTargetCutM3: 85000,
      measuredCutM3: 81600,
      cutProgressPct: 96.0,
      boqTargetFillM3: 62000,
      measuredFillM3: 59800,
      fillProgressPct: 96.45,
      netMassBalanceM3: 21800,
      compactionFactor: 1.15,
      opnameVerificationStatus: 'CERTIFIED_FOR_MC',
      calculatedAt: '2026-11-05T15:20:00.000Z',
    },
    {
      id: 'VOL-002',
      corridorSegment: 'STA 11+500 - STA 13+200 (Zona Rawa & Disposal Area C)',
      projectId: 'PRJ-IKN-TOL-3A',
      missionId: 'MSN-001',
      boqTargetCutM3: 54000,
      measuredCutM3: 48200,
      cutProgressPct: 89.26,
      boqTargetFillM3: 71000,
      measuredFillM3: 64500,
      fillProgressPct: 90.85,
      netMassBalanceM3: -16300,
      compactionFactor: 1.12,
      opnameVerificationStatus: 'CERTIFIED_FOR_MC',
      calculatedAt: '2026-11-05T16:05:00.000Z',
    },
    {
      id: 'VOL-003',
      corridorSegment: 'Main Dam Spillway Excavation Zone A (Bendungan Sepaku)',
      projectId: 'PRJ-BENDUNGAN-02',
      missionId: 'MSN-003',
      boqTargetCutM3: 110000,
      measuredCutM3: 118500,
      cutProgressPct: 107.73,
      boqTargetFillM3: 45000,
      measuredFillM3: 41200,
      fillProgressPct: 91.56,
      netMassBalanceM3: 77300,
      compactionFactor: 1.18,
      opnameVerificationStatus: 'VARIANCE_AUDIT_REQUIRED',
      calculatedAt: '2026-11-06T16:10:00.000Z',
    },
  ];

  private aiDefects: AiVisualDefectRecord[] = [
    {
      id: 'CV-DEF-001',
      structureElement: 'Pier Head P-12 Jembatan Sungai Wain (Sisi Utara)',
      projectId: 'PRJ-IKN-TOL-3A',
      missionId: 'MSN-002',
      defectType: 'STRUCTURAL_CRACK',
      crackWidthMm: 0.48,
      defectExtentMeters: 1.65,
      aiConfidencePct: 97.2,
      sniSeverityGrade: 'CRITICAL_SNI_BREACH',
      status: 'OPEN_NCR_RAISED',
      detectedAt: '2026-11-06T13:10:00.000Z',
    },
    {
      id: 'CV-DEF-002',
      structureElement: 'Box Girder Span 4 Segmen B-08 (Soffit Bawah)',
      projectId: 'PRJ-IKN-TOL-3A',
      missionId: 'MSN-002',
      defectType: 'CONCRETE_SPALLING',
      crackWidthMm: 0.25,
      defectExtentMeters: 0.85,
      aiConfidencePct: 94.8,
      sniSeverityGrade: 'MODERATE_REPAIR_NEEDED',
      status: 'OPEN_NCR_RAISED',
      detectedAt: '2026-11-06T13:25:00.000Z',
    },
    {
      id: 'CV-DEF-003',
      structureElement: 'Dinding Wingwall Abutment A-1 Tol IKN',
      projectId: 'PRJ-IKN-TOL-3A',
      missionId: 'MSN-001',
      defectType: 'WATER_SEEPAGE_HONEYCOMB',
      crackWidthMm: 0.15,
      defectExtentMeters: 0.4,
      aiConfidencePct: 92.1,
      sniSeverityGrade: 'HAIRLINE_MONITORING',
      status: 'REMEDIATED_VERIFIED',
      inspectorName: 'Ir. Hendra Wijaya, MT',
      remediationNotes: 'Patching mortar non-shrink SikaGrout-215 & coating kristalisasi kedap air selesai.',
      detectedAt: '2026-11-05T17:00:00.000Z',
      resolvedAt: '2026-11-06T10:30:00.000Z',
    },
  ];

  getOverview() {
    const totalMissions = this.missions.length;
    const completedMissions = this.missions.filter((m) => m.status === 'COMPLETED_ORTHO_LIDAR').length;
    const totalDensePoints = this.missions.reduce((acc, m) => acc + m.densePointsCount, 0);
    const avgRmseCm =
      Math.round(
        (this.missions.reduce((acc, m) => acc + m.rmseAccuracyCm, 0) / Math.max(1, totalMissions)) * 100,
      ) / 100;

    const totalMeasuredCutM3 = this.earthworkVolumes.reduce((acc, v) => acc + v.measuredCutM3, 0);
    const totalMeasuredFillM3 = this.earthworkVolumes.reduce((acc, v) => acc + v.measuredFillM3, 0);
    const certifiedSegmentsCount = this.earthworkVolumes.filter(
      (v) => v.opnameVerificationStatus === 'CERTIFIED_FOR_MC',
    ).length;

    const openCriticalDefects = this.aiDefects.filter((d) => d.status === 'OPEN_NCR_RAISED').length;
    const remediatedDefects = this.aiDefects.filter((d) => d.status === 'REMEDIATED_VERIFIED').length;

    return {
      module: 'Drone UAV Photogrammetry, Point Cloud Earthwork & AI Visual Progress Inspection',
      summary: {
        totalMissions,
        completedMissions,
        totalDensePoints,
        avgRmseCm,
        totalMeasuredCutM3,
        totalMeasuredFillM3,
        certifiedSegmentsCount,
        openCriticalDefects,
        remediatedDefects,
        totalDefectsInspected: this.aiDefects.length,
      },
      standardsCompliance: [
        'BIG (Badan Informasi Geospasial) SRGI 2013 & Ketelitian Peta Dasar Skala 1:1.000 (RMSE <= 3.0 cm)',
        'Kemenhub DKPPU CASR Part 107 & KKOP Airspace Altitude Control (<= 120m AGL / NOTAM Verified)',
        'SNI 2847:2019 (Batas Lebar Retak Struktur Beton Bertulang <= 0.30 mm untuk Eksposur Luar)',
      ],
    };
  }

  getMissions() {
    return this.missions;
  }

  registerMission(dto: RegisterFlightMissionDto): FlightMission {
    if (!dto.missionCode || dto.missionCode.trim() === '') {
      throw new BadRequestException('Kode misi penerbangan (missionCode) wajib diisi.');
    }
    const existing = this.missions.find(
      (m) => m.missionCode.toLowerCase() === dto.missionCode.trim().toLowerCase(),
    );
    if (existing) {
      throw new BadRequestException(`Kode misi ${dto.missionCode} sudah terdaftar di sistem.`);
    }
    if (dto.altitudeAglMeters <= 0 || dto.altitudeAglMeters > 500) {
      throw new BadRequestException('Ketinggian terbang (altitudeAglMeters) harus berada di rentang 1m - 500m AGL.');
    }
    if (dto.altitudeAglMeters > 120 && (!dto.notamPermitRef || dto.notamPermitRef.trim() === '')) {
      throw new BadRequestException(
        'Penerbangan di atas 120m AGL wajib menyertakan nomor izin khusus AirNav/KKOP NOTAM (notamPermitRef).',
      );
    }

    const newMission: FlightMission = {
      id: `MSN-00${this.missions.length + 1}`,
      missionCode: dto.missionCode.trim(),
      projectId: dto.projectId || 'PRJ-IKN-TOL-3A',
      projectName: dto.projectName || 'Koridor Proyek Infrastruktur Utama',
      uavModel: dto.uavModel || 'DJI Matrice 350 RTK + Zenmuse L2 LiDAR',
      pilotName: dto.pilotName || 'Capt. Raka Pratama',
      altitudeAglMeters: Number(dto.altitudeAglMeters),
      overlapPct: Number(dto.overlapPct || 80),
      gsdCmPerPx: Number(dto.gsdCmPerPx || 1.4),
      gcpCount: Number(dto.gcpCount || 10),
      notamPermitRef: dto.notamPermitRef?.trim() || 'AIRNAV-AUTO-KKOP-2026',
      kkopAirspaceStatus: dto.altitudeAglMeters > 120 ? 'SPECIAL_NOTAM_APPROVED' : 'KKOP_CLEARED',
      status: 'PROCESSING_SFM_CLOUD',
      rmseAccuracyCm: 1.5,
      densePointsCount: 42000000,
      capturedPhotosCount: 1120,
      executedAt: new Date().toISOString(),
    };

    this.missions.unshift(newMission);
    return newMission;
  }

  completeMissionProcessing(dto: CompleteMissionProcessingDto) {
    const mission = this.missions.find((m) => m.id === dto.missionId);
    if (!mission) {
      throw new NotFoundException(`Misi drone dengan ID ${dto.missionId} tidak ditemukan.`);
    }
    if (dto.rmseAccuracyCm <= 0) {
      throw new BadRequestException('Nilai RMSE akurasi (rmseAccuracyCm) harus lebih besar dari 0 cm.');
    }

    mission.status = 'COMPLETED_ORTHO_LIDAR';
    mission.densePointsCount = Number(dto.densePointsCount || mission.densePointsCount);
    mission.rmseAccuracyCm = Number(dto.rmseAccuracyCm);

    const newPointCloud: PointCloudModel = {
      id: `PCL-00${this.pointClouds.length + 1}`,
      missionId: mission.id,
      missionCode: mission.missionCode,
      projectName: mission.projectName,
      crsepsg: 'EPSG:32750 (WGS 84 / UTM Zone 50S - SRGI 2013)',
      format: 'LAZ_COPC_1_4',
      densePointsCount: mission.densePointsCount,
      orthomosaicResolutionCm: mission.gsdCmPerPx,
      rmseZCm: mission.rmseAccuracyCm,
      fileSizeGb: Math.round((mission.densePointsCount / 4300000) * 10) / 10,
      opnameReady: mission.rmseAccuracyCm <= 3.0,
      generatedAt: new Date().toISOString(),
    };

    this.pointClouds.unshift(newPointCloud);

    return {
      mission,
      pointCloud: newPointCloud,
    };
  }

  getPointClouds() {
    return this.pointClouds;
  }

  getEarthworkVolumes() {
    return this.earthworkVolumes;
  }

  calculateEarthworkVolume(dto: CalculateEarthworkVolumeDto): EarthworkVolumeRecord {
    if (dto.boqTargetCutM3 <= 0 || dto.boqTargetFillM3 <= 0) {
      throw new BadRequestException('Volume target kontrak BOQ Cut & Fill harus lebih besar dari 0 m3.');
    }
    if (dto.measuredCutM3 < 0 || dto.measuredFillM3 < 0) {
      throw new BadRequestException('Volume terukur Point Cloud tidak boleh bernilai negatif.');
    }

    const cutProgressPct = Math.round((dto.measuredCutM3 / dto.boqTargetCutM3) * 10000) / 100;
    const fillProgressPct = Math.round((dto.measuredFillM3 / dto.boqTargetFillM3) * 10000) / 100;
    const netMassBalanceM3 = Math.round((dto.measuredCutM3 - dto.measuredFillM3) * 100) / 100;

    let opnameVerificationStatus: EarthworkVolumeRecord['opnameVerificationStatus'] = 'CERTIFIED_FOR_MC';
    if (cutProgressPct > 105 || fillProgressPct > 105) {
      opnameVerificationStatus = 'VARIANCE_AUDIT_REQUIRED';
    } else if (cutProgressPct < 25 && fillProgressPct < 25) {
      opnameVerificationStatus = 'IN_PROGRESS';
    }

    const record: EarthworkVolumeRecord = {
      id: `VOL-00${this.earthworkVolumes.length + 1}`,
      corridorSegment: dto.corridorSegment,
      projectId: dto.projectId || 'PRJ-IKN-TOL-3A',
      missionId: dto.missionId || 'MSN-001',
      boqTargetCutM3: Number(dto.boqTargetCutM3),
      measuredCutM3: Number(dto.measuredCutM3),
      cutProgressPct,
      boqTargetFillM3: Number(dto.boqTargetFillM3),
      measuredFillM3: Number(dto.measuredFillM3),
      fillProgressPct,
      netMassBalanceM3,
      compactionFactor: Number(dto.compactionFactor || 1.12),
      opnameVerificationStatus,
      calculatedAt: new Date().toISOString(),
    };

    this.earthworkVolumes.unshift(record);
    return record;
  }

  getAiInspections() {
    return this.aiDefects;
  }

  runAiVisualInspection(dto: RunAiVisualInspectionDto): AiVisualDefectRecord {
    if (dto.crackWidthMm < 0) {
      throw new BadRequestException('Lebar retakan (crackWidthMm) tidak boleh bernilai negatif.');
    }

    let sniSeverityGrade: AiVisualDefectRecord['sniSeverityGrade'] = 'HAIRLINE_MONITORING';
    if (dto.crackWidthMm > 0.3 || dto.defectType === 'EXPOSED_REBAR_CORROSION') {
      sniSeverityGrade = 'CRITICAL_SNI_BREACH';
    } else if (dto.crackWidthMm >= 0.2 || dto.defectType === 'CONCRETE_SPALLING') {
      sniSeverityGrade = 'MODERATE_REPAIR_NEEDED';
    }

    const record: AiVisualDefectRecord = {
      id: `CV-DEF-00${this.aiDefects.length + 1}`,
      structureElement: dto.structureElement,
      projectId: dto.projectId || 'PRJ-IKN-TOL-3A',
      missionId: dto.missionId || 'MSN-002',
      defectType: dto.defectType,
      crackWidthMm: Number(dto.crackWidthMm),
      defectExtentMeters: Number(dto.defectExtentMeters || 1.0),
      aiConfidencePct: Number(dto.aiConfidencePct || 95.5),
      sniSeverityGrade,
      status: 'OPEN_NCR_RAISED',
      detectedAt: new Date().toISOString(),
    };

    this.aiDefects.unshift(record);
    return record;
  }

  resolveAiDefect(dto: ResolveAiDefectDto): AiVisualDefectRecord {
    const defect = this.aiDefects.find((d) => d.id === dto.defectId);
    if (!defect) {
      throw new NotFoundException(`Temuan defek AI dengan ID ${dto.defectId} tidak ditemukan.`);
    }

    defect.status = 'REMEDIATED_VERIFIED';
    defect.inspectorName = dto.inspectorName;
    defect.remediationNotes = dto.remediationNotes;
    defect.resolvedAt = new Date().toISOString();

    return defect;
  }
}
