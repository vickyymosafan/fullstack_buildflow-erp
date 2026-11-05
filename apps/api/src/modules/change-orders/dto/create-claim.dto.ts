import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClaimDto {
  @ApiProperty({ description: 'Nomor unik tiket klaim konstruksi', example: 'CLM-2026-001' })
  claimNumber: string;

  @ApiProperty({
    description: 'Judul klaim kompensasi waktu atau biaya',
    example: 'Klaim Perpanjangan Waktu Hujan Ekstrim Siklon Tropis',
  })
  title: string;

  @ApiProperty({
    description: 'Kategori dasar klaim konstruksi',
    enum: [
      'RAIN_DELAY',
      'FORCE_MAJEURE',
      'SITE_CONDITION',
      'PRICE_ESCALATION',
      'DELAY_OWNER_DRAWING',
    ],
    example: 'RAIN_DELAY',
  })
  claimCategory: string;

  @ApiProperty({
    description: 'Tanggal pengajuan resmi klaim (YYYY-MM-DD)',
    example: '2026-02-15',
  })
  submittedDate: string;

  @ApiProperty({
    description: 'Jumlah hari perpanjangan waktu kerja yang dituntut (Hari Kalender)',
    example: 18,
  })
  requestedDays: number;

  @ApiProperty({
    description: 'Tuntutan kompensasi biaya finansial / kerugian standby (Rp)',
    example: 0,
  })
  requestedCost: number;

  @ApiProperty({
    description: 'Deskripsi bukti otentik pendukung klaim (BMKG, Berita Acara Lapangan, Log Cuaca)',
    example: 'Laporan resmi stasiun BMKG Maritim dengan curah hujan > 150mm/hari selama 18 hari kumulatif',
  })
  evidenceDescription: string;

  @ApiPropertyOptional({
    description: 'ID CCO terkait apabila klaim terintegrasi dengan perubahan kontrak',
    example: null,
  })
  changeOrderId?: string;

  @ApiPropertyOptional({
    description: 'Status klaim konstruksi',
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED',
    example: 'SUBMITTED',
  })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-2026-001' })
  projectCode?: string;
}

