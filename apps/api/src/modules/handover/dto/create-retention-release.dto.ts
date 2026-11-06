import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRetentionReleaseDto {
  @ApiProperty({ description: 'ID Sertifikat BAST Terkait', example: 'bast-01' })
  certificateId: string;

  @ApiProperty({
    description: 'Bentuk Retensi / Jaminan',
    enum: ['CASH_RETENTION', 'MAINTENANCE_BOND'],
    example: 'CASH_RETENTION',
  })
  releaseType: 'CASH_RETENTION' | 'MAINTENANCE_BOND';

  @ApiProperty({ description: 'Nilai Nominal Retensi (Rp)', example: 7125000000 })
  retentionAmount: number;

  @ApiProperty({ description: 'Bank Penerbit / Rekening Tujuan', example: 'Bank Mandiri (Persero) Tbk' })
  bankName: string;

  @ApiPropertyOptional({ description: 'Nomor Sertifikat Bank Garansi Pemeliharaan', example: 'BG-MANDIRI-MNT-2026-9901' })
  bankGuaranteeNumber?: string;

  @ApiPropertyOptional({ description: 'Masa Berlaku Bank Garansi (YYYY-MM-DD)', example: '2026-09-30' })
  guaranteeValidityDate?: string;

  @ApiPropertyOptional({ description: 'Catatan Kelengkapan Berita Acara Rekomendasi Pencairan', example: 'Seluruh punch list cacat mutu terbukti tuntas 100% diverifikasi konsultan pengawas MK.' })
  notes?: string;
}
