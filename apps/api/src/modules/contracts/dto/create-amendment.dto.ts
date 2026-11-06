import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmendmentDto {
  @ApiProperty({ example: 'CTR-001', description: 'ID kontrak acuan' })
  contractId: string;

  @ApiProperty({ example: 'ADD-01', description: 'Nomor addendum kontrak' })
  amendmentNumber: string;

  @ApiProperty({ example: 'Addendum Waktu & Pekerjaan Tambah Galian Basement', description: 'Judul addendum' })
  title: string;

  @ApiProperty({
    example: 'SCOPE_CHANGE',
    enum: ['SCOPE_CHANGE', 'TIME_EXTENSION_EOT', 'COST_ADJUSTMENT', 'TERMS_REVISION'],
    description: 'Tipe perubahan amandemen'
  })
  amendmentType: string;

  @ApiProperty({ example: 12500000000, description: 'Penambahan / pengurangan nilai kontrak (IDR)' })
  costDelta: number;

  @ApiProperty({ example: 30, description: 'Tambahan hari kerja perpanjangan waktu (EOT)' })
  eotDays: number;

  @ApiProperty({ example: '2026-06-01', description: 'Tanggal penandatanganan addendum' })
  effectiveDate: string;

  @ApiProperty({ example: 'Budi Santoso, ST (PPK MRT Jakarta)', description: 'Pihak penandatangan dari pemilik' })
  signedByClient: string;

  @ApiProperty({ example: 'Ir. Hendra Wijaya (Project Director BuildFlow)', description: 'Pihak penandatangan dari kontraktor' })
  signedByContractor: string;

  @ApiPropertyOptional({ example: 'Penyesuaian galian akibat relokasi utilitas pipa gas PGN dan penambahan masa kerja 30 hari.', description: 'Keterangan latar belakang addendum' })
  description?: string;
}

