import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBastBapDto {
  @ApiProperty({ description: 'Nomor unik Berita Acara resmi', example: 'BAP-TERM-03-2026' })
  docNumber: string;

  @ApiProperty({
    description: 'Jenis Berita Acara konstruksi',
    enum: ['BAP_TERMIN', 'BAST_1_PHO', 'BAST_2_FHO'],
    example: 'BAP_TERMIN',
  })
  docType: string;

  @ApiProperty({
    description: 'Judul resmi Berita Acara',
    example: 'Berita Acara Pembayaran (BAP) Termin Ke-3 Progres Fisik 60%',
  })
  title: string;

  @ApiPropertyOptional({ description: 'Nomor termin pembayaran (khusus BAP)', example: 3 })
  terminNumber?: number;

  @ApiProperty({ description: 'Progres fisik opname yang disepakati bersama (%)', example: 60.0 })
  physicalProgressPercent: number;

  @ApiProperty({ description: 'Nilai bruto tagihan termin yang diajukan (Rp)', example: 4500000000 })
  grossAmount: number;

  @ApiPropertyOptional({ description: 'Persentase potongan retensi garansi (%)', default: 5.0, example: 5.0 })
  retentionPercent?: number;

  @ApiPropertyOptional({ description: 'Nilai potongan retensi (Rp)', example: 225000000 })
  retentionAmount?: number;

  @ApiProperty({ description: 'Nilai neto tagihan setelah retensi (Rp)', example: 4275000000 })
  netAmount: number;

  @ApiPropertyOptional({ description: 'Jumlah item cacat / pending list pada masa PHO (Punch list)', default: 0, example: 0 })
  punchListItemsCount?: number;

  @ApiProperty({ description: 'Tanggal pelaksanaan opname / uji terima bersama (YYYY-MM-DD)', example: '2026-02-28' })
  inspectionDate: string;

  @ApiPropertyOptional({ description: 'Tanggal berakhir masa pemeliharaan retensi (untuk BAST-1 / PHO)', example: '2026-08-31' })
  warrantyExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Nama Kontraktor Utama penandatangan', example: 'PT Adhi Megah Konstruksi' })
  contractorRepresentative?: string;

  @ApiPropertyOptional({ description: 'Nama Konsultan Pengawas MK penandatangan', example: 'PT Ciriajasa MK Mandiri' })
  mkRepresentative?: string;

  @ApiPropertyOptional({ description: 'Nama Pejabat Pembuat Komitmen / Owner penandatangan', example: 'PPK Proyek Nusantara Tower' })
  ownerRepresentative?: string;

  @ApiPropertyOptional({ description: 'Status Berita Acara', default: 'DRAFT', example: 'DRAFT' })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-NSI-2026' })
  projectCode?: string;
}
