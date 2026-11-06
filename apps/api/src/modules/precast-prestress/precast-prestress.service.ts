import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  RegisterPrecastSegmentDto,
  AdvanceSegmentStageDto,
  RecordCubeCompressionTestDto,
  RecordTendonStressingDto,
  CertifyLauncherErectionDto,
} from './dto/precast-prestress.dto';

export interface PrecastSegment {
  id: string;
  rfidTagCode: string;
  elementType: string;
  castingYardLine: string;
  projectId: string;
  designFcMpa: number;
  currentTransferFcMpa: number;
  steamCuringTempC: number;
  stage: 'STEAM_CURING' | 'DEMOLDED_STOCKYARD' | 'STRESSED_YARD_READY' | 'ERECTED_ON_PIER';
  castDate: string;
}

export interface CubeCompressionTest {
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
  sniComplianceStatus: 'PASSED_SNI_1974' | 'TRANSFER_ELIGIBLE_80PCT' | 'SUBSTANDARD_HOLD_NCR';
  testedAt: string;
}

export interface TendonStressingRecord {
  id: string;
  segmentId: string;
  rfidTagCode: string;
  tendonCode: string;
  jackingForceKn: number;
  gaugePressureBar: number;
  theoreticalElongationMm: number;
  measuredElongationMm: number;
  elongationDeviationPct: number;
  toleranceStatus: 'WITHIN_SNI_7PCT_TOLERANCE' | 'ELONGATION_ANOMALY_HOLD';
  groutingStatus: 'NON_SHRINK_GROUTED' | 'AWAITING_GROUTING';
  engineerName: string;
  stressedAt: string;
}

export interface LauncherErectionLog {
  id: string;
  segmentId: string;
  rfidTagCode: string;
  spanPierLocation: string;
  launcherGantryUnit: string;
  windSpeedKnots: number;
  camberDeflectionMm: number;
  bearingPadSeated: boolean;
  status: 'CERTIFIED_ON_BEARING' | 'GANTRY_POSITIONING';
  inspectorName?: string;
  erectedAt: string;
}

@Injectable()
export class PrecastPrestressService {
  private segments: PrecastSegment[] = [];

  private cubeTests: CubeCompressionTest[] = [];

  private stressingRecords: TendonStressingRecord[] = [];

  private erectionLogs: LauncherErectionLog[] = [];

  getOverview() {
    const totalSegments = this.segments.length;
    const stressedOrErectedCount = this.segments.filter(
      (s) => s.stage === 'STRESSED_YARD_READY' || s.stage === 'ERECTED_ON_PIER',
    ).length;
    const avgMeasuredFcMpa =
      Math.round(
        (this.cubeTests.reduce((acc, c) => acc + c.measuredFcMpa, 0) / Math.max(1, this.cubeTests.length)) * 10,
      ) / 10;
    const compliantStressingCount = this.stressingRecords.filter(
      (r) => r.toleranceStatus === 'WITHIN_SNI_7PCT_TOLERANCE',
    ).length;
    const anomalyStressingCount = this.stressingRecords.filter(
      (r) => r.toleranceStatus === 'ELONGATION_ANOMALY_HOLD',
    ).length;
    const certifiedErectionCount = this.erectionLogs.filter((e) => e.status === 'CERTIFIED_ON_BEARING').length;

    return {
      module: 'Precast Concrete Yard, Post-Tensioning Stressing & Structural Material Lab QA/QC',
      summary: {
        totalSegments,
        stressedOrErectedCount,
        avgMeasuredFcMpa,
        totalCubeTests: this.cubeTests.length,
        compliantStressingCount,
        anomalyStressingCount,
        totalStressingRecords: this.stressingRecords.length,
        certifiedErectionCount,
        totalErectionLogs: this.erectionLogs.length,
      },
      standardsCompliance: [
        'SNI 2847:2019 Pasal 26.10 — Toleransi Elongasi Tendon Prategang (Post-Tensioning) ±7% dari Perhitungan Teoritis',
        'SNI 1974:2011 / ASTM C39 — Metode Uji Kuat Tekan Beton Silinder 150x300 mm & Syarat Kuat Tekan Transfer >= 80% f\'c',
        'SE Menteri PUPR — Keselamatan Operasi Launching Gantry & Erection Girder Jembatan Bentang Panjang',
      ],
    };
  }

  getSegments() {
    return this.segments;
  }

  registerSegment(dto: RegisterPrecastSegmentDto): PrecastSegment {
    if (!dto.rfidTagCode || dto.rfidTagCode.trim() === '') {
      throw new BadRequestException('Kode RFID/QR segmen pracetak (rfidTagCode) wajib diisi.');
    }
    const duplicate = this.segments.find(
      (s) => s.rfidTagCode.toLowerCase() === dto.rfidTagCode.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new BadRequestException(`Kode RFID segmen ${dto.rfidTagCode} sudah terdaftar di pabrik precast.`);
    }
    if (dto.designFcMpa < 20 || dto.designFcMpa > 120) {
      throw new BadRequestException('Mutu rencana beton prategang f\'c harus berada pada rentang 20 - 120 MPa.');
    }
    if (dto.steamCuringTempC > 75) {
      throw new BadRequestException(
        'Suhu puncak ruang Steam Curing tidak boleh melebihi 75°C untuk mencegah Delayed Ettringite Formation (DEF).',
      );
    }

    const segment: PrecastSegment = {
      id: `SEG-00${this.segments.length + 1}`,
      rfidTagCode: dto.rfidTagCode.trim(),
      elementType: dto.elementType,
      castingYardLine: dto.castingYardLine,
      projectId: dto.projectId || 'PRJ-IKN-TOL-3A',
      designFcMpa: Number(dto.designFcMpa),
      currentTransferFcMpa: Math.round(Number(dto.designFcMpa) * 0.85 * 10) / 10,
      steamCuringTempC: Number(dto.steamCuringTempC || 60),
      stage: 'DEMOLDED_STOCKYARD',
      castDate: new Date().toISOString(),
    };

    this.segments.unshift(segment);
    return segment;
  }

  advanceSegmentStage(dto: AdvanceSegmentStageDto): PrecastSegment {
    const seg = this.segments.find((s) => s.id === dto.segmentId);
    if (!seg) {
      throw new NotFoundException(`Segmen precast dengan ID ${dto.segmentId} tidak ditemukan.`);
    }
    seg.stage = dto.targetStage;
    return seg;
  }

  getCubeTests() {
    return this.cubeTests;
  }

  recordCubeTest(dto: RecordCubeCompressionTestDto): CubeCompressionTest {
    if (dto.targetFcMpa <= 0 || dto.measuredFcMpa <= 0) {
      throw new BadRequestException('Nilai kuat tekan rencana dan terukur (MPa) harus lebih besar dari 0.');
    }

    const seg = this.segments.find((s) => s.id === dto.segmentId);
    const rfidTagCode = seg ? seg.rfidTagCode : 'RFID-PCIG-IKN-001';

    const strengthAchievementPct = Math.round((dto.measuredFcMpa / dto.targetFcMpa) * 10000) / 100;
    let sniComplianceStatus: CubeCompressionTest['sniComplianceStatus'] = 'SUBSTANDARD_HOLD_NCR';
    if (strengthAchievementPct >= 100) {
      sniComplianceStatus = 'PASSED_SNI_1974';
    } else if (strengthAchievementPct >= 80) {
      sniComplianceStatus = 'TRANSFER_ELIGIBLE_80PCT';
    }

    if (seg) {
      seg.currentTransferFcMpa = Number(dto.measuredFcMpa);
    }

    const record: CubeCompressionTest = {
      id: `CUBE-00${this.cubeTests.length + 1}`,
      specimenCode: dto.specimenCode,
      segmentId: dto.segmentId || 'SEG-001',
      rfidTagCode,
      batchDocketNo: dto.batchDocketNo || 'BATCH-BPP-20261106-09',
      curingAgeDays: Number(dto.curingAgeDays || 28),
      targetFcMpa: Number(dto.targetFcMpa),
      crushingLoadKn: Number(dto.crushingLoadKn || 920),
      measuredFcMpa: Number(dto.measuredFcMpa),
      strengthAchievementPct,
      sniComplianceStatus,
      testedAt: new Date().toISOString(),
    };

    this.cubeTests.unshift(record);
    return record;
  }

  getStressingRecords() {
    return this.stressingRecords;
  }

  recordTendonStressing(dto: RecordTendonStressingDto): TendonStressingRecord {
    if (dto.theoreticalElongationMm <= 0 || dto.measuredElongationMm <= 0) {
      throw new BadRequestException('Elongasi teoritis dan aktual (mm) harus lebih besar dari 0.');
    }
    if (dto.jackingForceKn <= 0) {
      throw new BadRequestException('Gaya tarik dongkrak hidrolik (jackingForceKn) harus lebih besar dari 0 kN.');
    }

    const seg = this.segments.find((s) => s.id === dto.segmentId);
    const rfidTagCode = seg ? seg.rfidTagCode : 'RFID-PCIG-IKN-001';

    const deviationPct =
      Math.round(((dto.measuredElongationMm - dto.theoreticalElongationMm) / dto.theoreticalElongationMm) * 10000) /
      100;
    const withinTolerance = Math.abs(deviationPct) <= 7.0;

    if (seg && withinTolerance) {
      seg.stage = 'STRESSED_YARD_READY';
    }

    const record: TendonStressingRecord = {
      id: `STR-00${this.stressingRecords.length + 1}`,
      segmentId: dto.segmentId || 'SEG-001',
      rfidTagCode,
      tendonCode: dto.tendonCode,
      jackingForceKn: Number(dto.jackingForceKn),
      gaugePressureBar: Number(dto.gaugePressureBar || 425),
      theoreticalElongationMm: Number(dto.theoreticalElongationMm),
      measuredElongationMm: Number(dto.measuredElongationMm),
      elongationDeviationPct: deviationPct,
      toleranceStatus: withinTolerance ? 'WITHIN_SNI_7PCT_TOLERANCE' : 'ELONGATION_ANOMALY_HOLD',
      groutingStatus: withinTolerance ? 'NON_SHRINK_GROUTED' : 'AWAITING_GROUTING',
      engineerName: dto.engineerName || 'Ir. Bambang Sudjatmiko, MT',
      stressedAt: new Date().toISOString(),
    };

    this.stressingRecords.unshift(record);
    return record;
  }

  getErectionLogs() {
    return this.erectionLogs;
  }

  certifyLauncherErection(dto: CertifyLauncherErectionDto): LauncherErectionLog {
    const log = this.erectionLogs.find((e) => e.id === dto.erectionId);
    if (!log) {
      throw new NotFoundException(`Log erection dengan ID ${dto.erectionId} tidak ditemukan.`);
    }

    log.status = 'CERTIFIED_ON_BEARING';
    log.inspectorName = dto.inspectorName;

    const seg = this.segments.find((s) => s.id === log.segmentId);
    if (seg) {
      seg.stage = 'ERECTED_ON_PIER';
    }

    return log;
  }
}

