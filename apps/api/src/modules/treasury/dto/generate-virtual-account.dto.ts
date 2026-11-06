import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateVirtualAccountDto {
  @ApiProperty({ example: 'Kementerian Pekerjaan Umum dan Perumahan Rakyat (PUPR)' })
  customerName: string;

  @ApiProperty({ example: 'PRJ-IKN-001' })
  projectId: string;

  @ApiProperty({ example: 'Pembangunan Istana Negara IKN Tahap II' })
  projectName: string;

  @ApiProperty({ example: 'Bank Mandiri', enum: ['Bank Mandiri', 'Bank BCA', 'Bank BNI', 'Bank BRI'] })
  bankPartner: 'Bank Mandiri' | 'Bank BCA' | 'Bank BNI' | 'Bank BRI';

  @ApiProperty({ example: 12500000000, description: 'Tagihan termin bruto / netto (Rp)' })
  billAmount: number;

  @ApiProperty({
    example: 'TERMIN_MC',
    enum: ['TERMIN_MC', 'TENDER_DEPOSIT', 'PERFORMANCE_RETENTION', 'OTHER_RECEIVABLE'],
  })
  purpose: 'TERMIN_MC' | 'TENDER_DEPOSIT' | 'PERFORMANCE_RETENTION' | 'OTHER_RECEIVABLE';

  @ApiProperty({ example: 'MC-2026-03-IKN', description: 'Nomor Sertifikat Bulanan / Invoice' })
  invoiceReference: string;

  @ApiProperty({ example: '2026-04-15T23:59:59Z', description: 'Batas kadaluarsa tagihan VA' })
  expiredAt: string;

  @ApiPropertyOptional({ example: 'Penagihan Termin Sertifikat Bulanan MC Ke-3 Proyek Istana Negara IKN' })
  description?: string;
}

