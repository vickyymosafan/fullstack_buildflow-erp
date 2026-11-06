import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitBidDto {
  @ApiProperty({ example: 'RFQ-2026-001' })
  rfqId: string;

  @ApiProperty({ example: 'VND-2026-002' })
  vendorId: string;

  @ApiProperty({ example: 'PT Krakatau Steel (Persero) Tbk' })
  vendorName: string;

  @ApiProperty({ example: 6250000000, description: 'Harga penawaran total (Rp)' })
  quotedAmount: number;

  @ApiProperty({ example: 14, description: 'Lead time pengiriman (hari)' })
  deliveryLeadTimeDays: number;

  @ApiProperty({ example: 12, description: 'Masa garansi kualitas (bulan)' })
  warrantyMonths: number;

  @ApiProperty({ example: 'SKBDN 90 hari setelah BAST Material lengkap' })
  paymentTerms: string;

  @ApiPropertyOptional({ example: 78.5, description: 'Persentase Tingkat Komponen Dalam Negeri (TKDN)' })
  tkdnPercentage?: number;

  @ApiPropertyOptional({ example: 'Penawaran mencakup ongkos kirim franko proyek Patimban.' })
  technicalNotes?: string;
}
