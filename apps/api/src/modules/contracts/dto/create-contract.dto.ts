import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty({ example: 'CTR-MRT-2026-001', description: 'Nomor kontrak resmi' })
  contractNumber: string;

  @ApiProperty({ example: 'Pembangunan Stasiun MRT Bawah Tanah Harmoni', description: 'Judul perjanjian kontrak' })
  title: string;

  @ApiProperty({ example: 'PT MRT Jakarta (Perseroda)', description: 'Nama pemilik proyek / Bouwheer' })
  clientName: string;

  @ApiProperty({
    example: 'FIDIC_RED',
    enum: ['FIDIC_RED', 'FIDIC_YELLOW', 'FIDIC_SILVER', 'LPSE_PUPR', 'PRIVATE_TURNKEY'],
    description: 'Standar format kontrak'
  })
  contractType: string;

  @ApiProperty({ example: 450000000000, description: 'Nilai kontrak (IDR)' })
  contractValue: number;

  @ApiProperty({ example: '2026-01-15', description: 'Tanggal mulai efektif kontrak' })
  startDate: string;

  @ApiProperty({ example: '2027-06-30', description: 'Tanggal selesai target kontrak' })
  endDate: string;

  @ApiPropertyOptional({ example: 5, description: 'Persentase retensi jaminan pemeliharaan' })
  retentionPercent?: number;

  @ApiPropertyOptional({ example: 12, description: 'Masa pemeliharaan dalam bulan (DNP)' })
  defectNotificationPeriodMonths?: number;

  @ApiPropertyOptional({ example: 0.001, description: 'Tarif denda keterlambatan per hari (1/1000 = 0.001)' })
  liquidatedDamagesRatePerDay?: number;

  @ApiPropertyOptional({ example: 5, description: 'Maksimum batas denda keterlambatan (cap %)' })
  liquidatedDamagesCapPercent?: number;

  @ApiProperty({
    example: 'BANI_ARBITRATION',
    enum: ['BANI_ARBITRATION', 'DISTRICT_COURT', 'DAB_ADJUDICATION', 'MEDIATION'],
    description: 'Forum penyelesaian sengketa'
  })
  disputeResolutionForum: string;

  @ApiPropertyOptional({ example: 'PRJ-MRT-2026', description: 'ID referensi proyek' })
  projectId?: string;
}

