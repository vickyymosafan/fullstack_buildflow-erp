import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInitiativeDto {
  @ApiProperty({ description: 'ID Proyek Konstruksi' })
  projectId: string;

  @ApiProperty({ description: 'Nama Program Dekarbonisasi / Inisiatif Hijau' })
  initiativeName: string;

  @ApiProperty({
    description: 'Kategori Inisiatif Hijau',
    enum: [
      'RENEWABLE_ENERGY',
      'LOW_CARBON_MATERIAL',
      'WASTE_REDUCTION',
      'WATER_RECYCLING',
      'GREEN_AFFORESTATION',
    ],
  })
  category:
    | 'RENEWABLE_ENERGY'
    | 'LOW_CARBON_MATERIAL'
    | 'WASTE_REDUCTION'
    | 'WATER_RECYCLING'
    | 'GREEN_AFFORESTATION';

  @ApiProperty({ description: 'Target Reduksi Emisi (Ton CO2e)' })
  targetReductionTonsCO2e: number;

  @ApiProperty({ description: 'Estimasi Nilai Investasi Hijau (IDR)' })
  estimatedInvestment: number;

  @ApiProperty({ description: 'Target Tanggal Penyelesaian (ISO String)' })
  targetCompletionDate: string;

  @ApiProperty({ description: 'Penanggung Jawab Lapangan (e.g. Lead Sustainability / Site Manager)' })
  responsibleLead: string;

  @ApiProperty({ description: 'Uraian teknis implementasi dan metodologi verifikasi' })
  description: string;
}

