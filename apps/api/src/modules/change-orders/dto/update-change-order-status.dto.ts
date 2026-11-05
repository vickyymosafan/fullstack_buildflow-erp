import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChangeOrderStatusDto {
  @ApiProperty({
    description: 'Status persetujuan CCO yang baru',
    enum: ['SUBMITTED', 'REVIEW_MK', 'APPROVED_OWNER', 'REJECTED', 'EXECUTED'],
    example: 'APPROVED_OWNER',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Catatan teknis / evaluasi dari konsultan MK atau Owner',
    example: 'Disetujui berdasarkan Berita Acara Rapat Evaluasi Teknis No. BA-MK-042/2026',
  })
  reviewerNotes?: string;

  @ApiPropertyOptional({
    description: 'Nilai dampak biaya final yang disetujui (Rp)',
    example: 485000000,
  })
  approvedCostImpact?: number;

  @ApiPropertyOptional({
    description: 'Jumlah hari perpanjangan waktu kerja yang disetujui (EoT Hari)',
    example: 14,
  })
  approvedTimeImpactDays?: number;

  @ApiPropertyOptional({
    description: 'Nama reviewer / approver yang memvalidasi',
    example: 'Ir. Hendra Prasetyo (Konsultan MK)',
  })
  reviewedBy?: string;
}

