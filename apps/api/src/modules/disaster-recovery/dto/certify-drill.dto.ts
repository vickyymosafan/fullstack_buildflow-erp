import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertifyDrillDto {
  @ApiProperty({ example: 'drill-20261106-01', description: 'ID Simulasi Drill Failover/PITR' })
  drillId: string;

  @ApiProperty({ example: 'Auditor Eksternal BSI / TUV Rheinland Indonesia', description: 'Nama Auditor / Lembaga Sertifikasi' })
  auditorName: string;

  @ApiProperty({ example: 'ISO 22301:2019 (Business Continuity) & ISO 27001:2022', description: 'Standar Kepatuhan yang Diverifikasi' })
  complianceStandard: string;

  @ApiPropertyOptional({ example: 'RPO terverifikasi 42 detik (Target < 300s), RTO terverifikasi 3 menit 18 detik (Target < 900s). Zero data loss terbukti.', description: 'Catatan hasil audit' })
  notes?: string;
}
