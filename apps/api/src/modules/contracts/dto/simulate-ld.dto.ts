import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SimulateLdDto {
  @ApiProperty({ example: 'CTR-001', description: 'ID kontrak acuan' })
  contractId: string;

  @ApiProperty({ example: 45, description: 'Estimasi jumlah hari keterlambatan penyelesaian' })
  delayDays: number;

  @ApiPropertyOptional({ example: 0.001, description: 'Tarif denda harian (1/1000 = 0.001 per hari)' })
  dailyRate?: number;

  @ApiPropertyOptional({ example: 5, description: 'Batas maksimum persentase denda (cap %)' })
  capPercent?: number;

  @ApiPropertyOptional({ example: 450000000000, description: 'Nilai kontrak penyesuaian jika ada addendum' })
  overrideContractValue?: number;

  @ApiPropertyOptional({ example: 15, description: 'Hari klaim EOT (Extension of Time) yang dapat diajukan sebagai pembelaan' })
  eligibleEotDays?: number;
}
