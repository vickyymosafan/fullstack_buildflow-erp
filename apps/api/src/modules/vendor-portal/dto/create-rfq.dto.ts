import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RfqItemDto {
  @ApiProperty({ example: 'Baja Tulangan Sirip BJTS 420B D16' })
  itemName: string;

  @ApiProperty({ example: 'SNI 2052:2017 Panjang 12 meter Sertifikat Mill' })
  spec: string;

  @ApiProperty({ example: 450 })
  quantity: number;

  @ApiProperty({ example: 'TON' })
  uom: string;
}

export class CreateRfqDto {
  @ApiPropertyOptional({ example: 'RFQ-2026-004' })
  rfqNumber?: string;

  @ApiProperty({ example: 'Pengadaan Baja Tulangan Ulir Proyek Pelabuhan Patimban Tahap 2' })
  title: string;

  @ApiProperty({ example: 'PRJ-PTB-002' })
  projectId: string;

  @ApiProperty({ example: 'Pengembangan Pelabuhan Patimban Subang Tahap 2' })
  projectName: string;

  @ApiProperty({ example: 'Baja & Struktur Logam' })
  category: string;

  @ApiProperty({ example: 6500000000 })
  estimatedBudget: number;

  @ApiProperty({ example: '2026-04-15T17:00:00Z' })
  submissionDeadline: string;

  @ApiProperty({ example: 'Stockyard Jetty Patimban, Subang, Jawa Barat' })
  deliveryLocation: string;

  @ApiProperty({ example: '2026-05-01' })
  targetDeliveryDate: string;

  @ApiProperty({ example: 'SILVER_ABOVE', enum: ['ALL', 'GOLD', 'SILVER_ABOVE'] })
  requiredVendorTier: 'ALL' | 'GOLD' | 'SILVER_ABOVE';

  @ApiProperty({ type: [RfqItemDto] })
  items: RfqItemDto[];

  @ApiPropertyOptional({ example: 'Penawaran wajib melampirkan sertifikat mill sheet dan kesanggupan supply bertahap.' })
  notes?: string;
}
