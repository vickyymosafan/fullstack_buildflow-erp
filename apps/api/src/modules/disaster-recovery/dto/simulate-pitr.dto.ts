import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SimulatePitrDto {
  @ApiProperty({ example: '2026-11-06T14:32:00.000Z', description: 'Target titik waktu pemulihan (Timestamp PITR)' })
  targetTimestamp: string;

  @ApiProperty({ example: 'snap-20261106-0000', description: 'ID Base snapshot terdekat sebelum targetTimestamp' })
  sourceSnapshotId: string;

  @ApiProperty({ example: 'buildflow-pitr-sandbox-audit', description: 'Nama instance target sandbox pemulihan' })
  sandboxInstanceName: string;

  @ApiPropertyOptional({ example: true, description: 'Verifikasi integritas kriptografi SHA-256 data pulih', default: true })
  verifyChecksums?: boolean;
}
