import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunClashCheckDto {
  @ApiProperty({ example: 'PRJ-MRT-001', description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ example: 'MOD-STR-001', description: 'ID Model 3D Disiplin A (e.g. Struktur)' })
  sourceModelId: string;

  @ApiProperty({ example: 'MOD-MEP-001', description: 'ID Model 3D Disiplin B (e.g. MEP)' })
  targetModelId: string;

  @ApiProperty({ example: 25, description: 'Batas toleransi benturan dalam milimeter (mm)' })
  toleranceMm: number;

  @ApiProperty({ example: 'HARD_CLASH', enum: ['HARD_CLASH', 'SOFT_CLEARANCE', 'DUPLICATE_GEOMETRY'] })
  clashType: 'HARD_CLASH' | 'SOFT_CLEARANCE' | 'DUPLICATE_GEOMETRY';

  @ApiPropertyOptional({ example: 'Ir. Dwi Prasetyo, S.T. (BIM Coordinator)', description: 'Eksekutor Analisis' })
  executedByName?: string;
}

