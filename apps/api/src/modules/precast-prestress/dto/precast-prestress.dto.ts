import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPrecastSegmentDto {
  @ApiProperty({ example: 'RFID-PCIG-IKN-014', description: 'Unique RFID / QR Precast Segment Tag' })
  rfidTagCode!: string;

  @ApiProperty({ example: 'PCI-Girder L=40.8m H=2.1m (Span P12-P13)', description: 'Structural Element Type & Span' })
  elementType!: string;

  @ApiProperty({ example: 'Pabrik Precast Kariangau Line B - Bed #04', description: 'Precast Casting Yard & Bed Line' })
  castingYardLine!: string;

  @ApiProperty({ example: 'PRJ-IKN-TOL-3A', description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ example: 50, description: 'Design Characteristic Concrete Strength f\'c (MPa)' })
  designFcMpa!: number;

  @ApiProperty({ example: 62.5, description: 'Peak Steam Curing Chamber Temperature (°C)' })
  steamCuringTempC!: number;
}

export class AdvanceSegmentStageDto {
  @ApiProperty({ example: 'SEG-002', description: 'Precast Segment ID' })
  segmentId!: string;

  @ApiProperty({
    example: 'STRESSED_YARD_READY',
    enum: ['STEAM_CURING', 'DEMOLDED_STOCKYARD', 'STRESSED_YARD_READY', 'ERECTED_ON_PIER'],
    description: 'Target Production / Erection Stage',
  })
  targetStage!: 'STEAM_CURING' | 'DEMOLDED_STOCKYARD' | 'STRESSED_YARD_READY' | 'ERECTED_ON_PIER';
}

export class RecordCubeCompressionTestDto {
  @ApiProperty({ example: 'LAB-SNI-2026-089', description: 'Concrete Specimen Test Code' })
  specimenCode!: string;

  @ApiProperty({ example: 'SEG-001', description: 'Reference Precast Segment ID' })
  segmentId!: string;

  @ApiProperty({ example: 'BATCH-BPP-20261101-04', description: 'Batching Plant Mix Docket Reference' })
  batchDocketNo!: string;

  @ApiProperty({ example: 28, description: 'Curing Age in Days (3, 7, 14, or 28 days)' })
  curingAgeDays!: number;

  @ApiProperty({ example: 50, description: 'Target Design f\'c (MPa)' })
  targetFcMpa!: number;

  @ApiProperty({ example: 965, description: 'Maximum Crushing Load on UTM Machine (kN) for 150x300mm Cylinder' })
  crushingLoadKn!: number;

  @ApiProperty({ example: 54.6, description: 'Measured Compressive Strength f\'c (MPa)' })
  measuredFcMpa!: number;
}

export class RecordTendonStressingDto {
  @ApiProperty({ example: 'SEG-001', description: 'Precast Segment ID' })
  segmentId!: string;

  @ApiProperty({ example: 'TENDON-CABLE-T3 (19 Strands ASTM A416 Grade 270 Low-Relaxation)', description: 'Tendon Cable Number & Strand Spec' })
  tendonCode!: string;

  @ApiProperty({ example: 3680, description: 'Applied Hydraulic Jacking Force (kN)' })
  jackingForceKn!: number;

  @ApiProperty({ example: 425, description: 'Calibrated Hydraulic Manometer Pressure (Bar)' })
  gaugePressureBar!: number;

  @ApiProperty({ example: 268.0, description: 'Theoretical Design Elongation (mm)' })
  theoreticalElongationMm!: number;

  @ApiProperty({ example: 273.5, description: 'Measured Actual Tendon Elongation (mm)' })
  measuredElongationMm!: number;

  @ApiPropertyOptional({ example: 'Ir. Bambang Sudjatmiko, MT (Ahli Utama Teknik Jembatan LPJK)', description: 'Supervising Stressing Engineer' })
  engineerName?: string;
}

export class CertifyLauncherErectionDto {
  @ApiProperty({ example: 'ERC-002', description: 'Erection Log ID' })
  erectionId!: string;

  @ApiProperty({ example: 'Ir. Hendra Wijaya, MT (Chief Bridge Inspector)', description: 'Certifying Inspector' })
  inspectorName!: string;
}
