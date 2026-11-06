import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHandoverCertificateDto {
  @ApiProperty({ description: 'Kode Proyek', example: 'PRJ-2026-IKN-PK3' })
  projectCode: string;

  @ApiProperty({
    description: 'Tipe Berita Acara Serah Terima',
    enum: ['PHO_BAST_1', 'FHO_BAST_2'],
    example: 'PHO_BAST_1',
  })
  certificateType: 'PHO_BAST_1' | 'FHO_BAST_2';

  @ApiProperty({ description: 'Nomor Berita Acara', example: 'BAST-PHO-2026-001' })
  certificateNumber: string;

  @ApiProperty({ description: 'Judul / Uraian Serah Terima', example: 'Serah Terima Pertama (PHO) Pekerjaan Struktur & Finishing Istana Presiden IKN' })
  title: string;

  @ApiProperty({ description: 'Tanggal Serah Terima (YYYY-MM-DD)', example: '2026-03-31' })
  handoverDate: string;

  @ApiProperty({ description: 'Persentase Kemajuan Fisik Lapangan (%)', example: 100 })
  workProgressPercent: number;

  @ApiProperty({ description: 'Durasi Masa Pemeliharaan / Garansi (Bulan)', example: 6 })
  warrantyPeriodMonths: number;

  @ApiProperty({ description: 'Ketua Tim Panitia Peneliti Pelaksanaan Kontrak (PPHP / Direksi Teknis)', example: 'Ir. Danang Wicaksono, M.Eng.' })
  committeeChair: string;

  @ApiProperty({ description: 'Perwakilan Kontraktor Pelaksana', example: 'Ir. Agus Wijaya, M.T. (Project Manager)' })
  contractorRepresentative: string;

  @ApiProperty({ description: 'Pejabat Pembuat Komitmen (PPK Owner)', example: 'Dr. Hendra Gunawan, S.T., M.T. (PPK PUPR)' })
  ownerSignatory: string;

  @ApiPropertyOptional({ description: 'Catatan Kelengkapan Dokumen / As-Built Drawings', example: 'Seluruh dokumen as-built drawings, manual operation & maintenance, dan garansi peralatan MEP telah diserahkan lengkap.' })
  notes?: string;
}
