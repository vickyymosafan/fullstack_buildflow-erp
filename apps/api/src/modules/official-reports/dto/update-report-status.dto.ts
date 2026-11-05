import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'Status persetujuan laporan resmi',
    enum: ['DRAFT', 'SUBMITTED', 'VERIFIED_MK', 'APPROVED_OWNER', 'FINALIZED', 'REVISION_REQUESTED'],
    example: 'VERIFIED_MK',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Catatan hasil evaluasi, verifikasi opname, atau rekomendasi perbaikan dari MK / Owner',
    example: 'Perhitungan opname volume beton lantai 14 telah dicek silang dengan tiket batching plant dan disetujui.',
  })
  reviewerNotes?: string;

  @ApiPropertyOptional({
    description: 'Progres fisik yang disahkan konsultan pengawas MK (%)',
    example: 68.5,
  })
  approvedProgressPercent?: number;

  @ApiProperty({
    description: 'Nama pejabat penelaah / penandatangan',
    example: 'Ir. Hendra Prasetyo (Team Leader Konsultan MK)',
  })
  verifiedBy: string;
}

