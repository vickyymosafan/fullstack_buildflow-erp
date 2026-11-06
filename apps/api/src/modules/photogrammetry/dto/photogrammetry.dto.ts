import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterFlightMissionDto {
  @ApiProperty({ example: 'MSN-IKN-2026-009', description: 'Unique Drone Flight Mission Code' })
  missionCode!: string;

  @ApiProperty({ example: 'PRJ-IKN-TOL-3A', description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ example: 'Tol IKN Seksi 3A (STA 12+000 - STA 15+500)', description: 'Project Name & Corridor' })
  projectName!: string;

  @ApiProperty({ example: 'DJI Matrice 350 RTK + Zenmuse L2 LiDAR', description: 'UAV Aircraft & Sensor Payload' })
  uavModel!: string;

  @ApiProperty({ example: 'Capt. Raka Pratama (Sertifikat Pilot Drone Kemenhub #DKPPU-8841)', description: 'Certified Remote Pilot in Command' })
  pilotName!: string;

  @ApiProperty({ example: 95, description: 'Flight Altitude AGL in meters (max 120m KKOP limit without special NOTAM)' })
  altitudeAglMeters!: number;

  @ApiProperty({ example: 80, description: 'Front/Side Image Overlap Percentage (%)' })
  overlapPct!: number;

  @ApiProperty({ example: 1.4, description: 'Target Ground Sampling Distance (GSD) in cm/pixel' })
  gsdCmPerPx!: number;

  @ApiProperty({ example: 12, description: 'Number of RTK Ground Control Points (GCP) verified' })
  gcpCount!: number;

  @ApiPropertyOptional({ example: 'NOTAM-BMKG-IKN-0412/26', description: 'Optional AirNav/KKOP NOTAM Permit Reference' })
  notamPermitRef?: string;
}

export class CompleteMissionProcessingDto {
  @ApiProperty({ example: 'MSN-003', description: 'Mission ID to complete photogrammetry & LiDAR processing' })
  missionId!: string;

  @ApiProperty({ example: 48500000, description: 'Total Dense Point Cloud points generated' })
  densePointsCount!: number;

  @ApiProperty({ example: 1.65, description: 'Measured RTK RMSE accuracy in cm (must be <= 3.0 cm for opname)' })
  rmseAccuracyCm!: number;
}

export class CalculateEarthworkVolumeDto {
  @ApiProperty({ example: 'STA 13+200 - STA 14+000 (Zona Galian Tebing B)', description: 'Corridor / Stationing Segment' })
  corridorSegment!: string;

  @ApiProperty({ example: 'PRJ-IKN-TOL-3A', description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ example: 'MSN-001', description: 'Reference Drone Mission ID' })
  missionId!: string;

  @ApiProperty({ example: 42500, description: 'BOQ Contract Target Cut Volume (m3)' })
  boqTargetCutM3!: number;

  @ApiProperty({ example: 39800, description: 'Measured DSM/DTM Point Cloud Cut Volume (m3)' })
  measuredCutM3!: number;

  @ApiProperty({ example: 28000, description: 'BOQ Contract Target Fill/Embankment Volume (m3)' })
  boqTargetFillM3!: number;

  @ApiProperty({ example: 27450, description: 'Measured DSM/DTM Point Cloud Fill Volume (m3)' })
  measuredFillM3!: number;

  @ApiProperty({ example: 1.12, description: 'Soil Swell/Shrinkage Compaction Factor' })
  compactionFactor!: number;
}

export class RunAiVisualInspectionDto {
  @ApiProperty({ example: 'Pilar Pier P-14 Jembatan Sungai Wain', description: 'Structural Element Inspected' })
  structureElement!: string;

  @ApiProperty({ example: 'PRJ-IKN-TOL-3A', description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ example: 'MSN-002', description: 'Reference Drone Mission ID' })
  missionId!: string;

  @ApiProperty({
    example: 'STRUCTURAL_CRACK',
    enum: ['STRUCTURAL_CRACK', 'CONCRETE_SPALLING', 'EXPOSED_REBAR_CORROSION', 'WATER_SEEPAGE_HONEYCOMB'],
    description: 'Detected Defect Classification by YOLOv8/Vision AI',
  })
  defectType!: 'STRUCTURAL_CRACK' | 'CONCRETE_SPALLING' | 'EXPOSED_REBAR_CORROSION' | 'WATER_SEEPAGE_HONEYCOMB';

  @ApiProperty({ example: 0.45, description: 'Measured Crack Width in millimeters (mm) via Close-Range Photogrammetry' })
  crackWidthMm!: number;

  @ApiProperty({ example: 1.85, description: 'Defect Length / Area Extent (m or m2)' })
  defectExtentMeters!: number;

  @ApiProperty({ example: 96.4, description: 'Computer Vision AI Confidence Score (%)' })
  aiConfidencePct!: number;
}

export class ResolveAiDefectDto {
  @ApiProperty({ example: 'CV-DEF-001', description: 'AI Visual Defect ID' })
  defectId!: string;

  @ApiProperty({ example: 'Ir. Hendra Wijaya, MT (Lead Structural QA/QC)', description: 'Inspector Name' })
  inspectorName!: string;

  @ApiProperty({
    example: 'Injeksi Epoxy Sikadur-52 ID bertekanan rendah & grouting permukaan selesai diverifikasi.',
    description: 'Structural Remediation Action Taken',
  })
  remediationNotes!: string;
}
