import { ApiProperty } from '@nestjs/swagger';

export class CreateSpkDto {
  @ApiProperty({ example: 'SPK-2026-STR-01', description: 'Nomor SPK' })
  spkNumber!: string;

  @ApiProperty({ example: 'PT Sinar Baja Konstruksi', description: 'Nama subkontraktor / mandor' })
  subconName!: string;

  @ApiProperty({ example: 'Pekerjaan Pembesian & Bekisting Kolom Tower A', description: 'Lingkup pekerjaan' })
  scopeOfWork!: string;

  @ApiProperty({ example: 'STRUKTUR', description: 'Kategori pekerjaan (STRUKTUR, MEP, ARSITEKTUR, PONDASI)' })
  category!: string;

  @ApiProperty({ example: 2450000000, description: 'Nilai kontrak SPK (Rp)' })
  contractValue!: number;

  @ApiProperty({ example: 10, description: 'Persentase uang muka (%)', required: false })
  downPaymentPercent?: number;

  @ApiProperty({ example: 5, description: 'Persentase retensi garansi (%)', required: false })
  retentionPercent?: number;

  @ApiProperty({ example: '2026-01-15', description: 'Tanggal mulai' })
  startDate!: string;

  @ApiProperty({ example: '2026-08-30', description: 'Tanggal selesai' })
  endDate!: string;

  @ApiProperty({ example: 'H. Sudirman, S.T.', description: 'Nama PIC / Supervisor Subkon' })
  picName!: string;

  @ApiProperty({ example: '0812-8899-1001', description: 'Nomor telepon PIC', required: false })
  picPhone?: string;

  @ApiProperty({ example: 'PRJ-2026-IKN-PK3', description: 'Kode proyek', required: false })
  projectCode?: string;
}
