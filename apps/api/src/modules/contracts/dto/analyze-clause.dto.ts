import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeClauseDto {
  @ApiProperty({ example: 'CTR-001', description: 'ID kontrak acuan' })
  contractId: string;

  @ApiProperty({ example: 'Klausul 8.7', description: 'Nomor pasal / sub-clause' })
  clauseNumber: string;

  @ApiProperty({ example: 'Penalti Keterlambatan dan Batas Denda', description: 'Judul pasal klausul' })
  clauseTitle: string;

  @ApiProperty({
    example: 'Jika Kontraktor gagal menyelesaikan pekerjaan dalam Waktu Penyelesaian, Kontraktor wajib membayar Denda Keterlambatan sebesar 2 per mil per hari tanpa batas maksimum.',
    description: 'Teks lengkap klausul kontrak yang dianalisis oleh AI'
  })
  clauseText: string;

  @ApiProperty({
    example: 'LIQUIDATED_DAMAGES',
    enum: [
      'LIQUIDATED_DAMAGES',
      'EXTENSION_OF_TIME',
      'PRICE_ESCALATION',
      'TERMINATION',
      'DEFECTS_LIABILITY',
      'FORCE_MAJEURE',
      'PAYMENT_TERMS',
      'DISPUTE_RESOLUTION'
    ],
    description: 'Kategori klausul kontrak'
  })
  clauseCategory: string;

  @ApiPropertyOptional({ example: 'FIDIC_RED', description: 'Format standar hukum pembanding' })
  benchmarkStandard?: string;
}

