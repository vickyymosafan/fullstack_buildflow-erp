import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfitDistributionDto {
  @ApiPropertyOptional({ description: 'Kode KSO', example: 'KSO-IKN-PK3-2026' })
  ksoCode?: string;

  @ApiProperty({ description: 'Label tahapan distribusi laba / termin', example: 'Distribusi Dividen Laba Bersih Opname Termin Ke-3 (Prestasi 60%)' })
  periodLabel: string;

  @ApiProperty({ description: 'Nilai bruto pendapatan termin yang diterima dari Owner (Rp)', example: 28500000000 })
  grossRevenue: number;

  @ApiProperty({ description: 'Total pengeluaran biaya langsung & biaya bersama terverifikasi (Rp)', example: 21375000000 })
  totalSharedCost: number;

  @ApiPropertyOptional({ description: 'Potongan cadangan retensi 5% (Rp)', example: 1425000000 })
  retentionReserve?: number;

  @ApiPropertyOptional({ description: 'Tanggal eksekusi distribusi (YYYY-MM-DD)', example: '2026-03-05' })
  distributionDate?: string;

  @ApiPropertyOptional({ description: 'Catatan rekomendasi auditor independen / rapat pengurus KSO', example: 'Disetujui dalam Risalah Rapat Pengurus KSO No. 12/KSO/III/2026' })
  notes?: string;
}

