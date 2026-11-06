import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluateVendorDto {
  @ApiProperty({ example: 'VND-2026-001' })
  vendorId: string;

  @ApiProperty({ example: 'PRJ-IKN-001' })
  projectId: string;

  @ApiProperty({ example: 'Pembangunan Istana Negara IKN Tahap II' })
  projectName: string;

  @ApiProperty({ example: '2026-Q1' })
  evaluationPeriod: string;

  @ApiProperty({ example: 92, description: 'Skor Mutu / Kualitas Material & Pekerjaan (0-100, bobot 35%)' })
  qualityScore: number;

  @ApiProperty({ example: 88, description: 'Skor Ketepatan Waktu Pengiriman & Progres (0-100, bobot 30%)' })
  deliveryScore: number;

  @ApiProperty({ example: 90, description: 'Skor Kepatuhan K3 & Lingkungan (0-100, bobot 20%)' })
  hseScore: number;

  @ApiProperty({ example: 85, description: 'Skor Daya Saing Harga & Fleksibilitas Finansial (0-100, bobot 15%)' })
  commercialScore: number;

  @ApiProperty({ example: 0, description: 'Jumlah Non-Conformance Report (NCR) selama periode evaluasi' })
  ncrCount: number;

  @ApiProperty({ example: 'Bambang Kusumo, S.T. (Senior Procurement Lead)' })
  evaluatorName: string;

  @ApiPropertyOptional({ example: 'Pengiriman semen sangat konsisten dengan dokumen uji lab beton akurat.' })
  remarks?: string;
}
