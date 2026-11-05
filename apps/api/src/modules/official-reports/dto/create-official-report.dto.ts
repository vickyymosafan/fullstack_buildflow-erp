import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficialReportDto {
  @ApiProperty({ description: 'Nomor resmi dokumen laporan berkala', example: 'LAP-MG-2026-018' })
  reportNumber: string;

  @ApiProperty({
    description: 'Tipe periode laporan',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    example: 'WEEKLY',
  })
  reportType: string;

  @ApiProperty({ description: 'Nomor urut periode (contoh: Minggu ke-18, Bulan ke-4)', example: 18 })
  periodNumber: number;

  @ApiProperty({ description: 'Tanggal awal periode pelaporan (YYYY-MM-DD)', example: '2026-02-23' })
  startDate: string;

  @ApiProperty({ description: 'Tanggal akhir periode pelaporan (YYYY-MM-DD)', example: '2026-03-01' })
  endDate: string;

  @ApiProperty({
    description: 'Judul laporan resmi konstruksi',
    example: 'Laporan Mingguan Progres Fisik Struktur Lantai 12-14 & Fasad Tower',
  })
  title: string;

  @ApiProperty({ description: 'Progres fisik kumulatif riil lapangan (%)', example: 68.5 })
  cumulativeProgressPercent: number;

  @ApiProperty({ description: 'Progres fisik target rencana rencana baseline (%)', example: 65.0 })
  plannedProgressPercent: number;

  @ApiProperty({ description: 'Ringkasan pekerjaan utama yang diselesaikan', example: 'Pengecoran plat lantai 14, instalasi curtain wall fasad utara lantai 8-10, dan pemipaan MEP basement 2' })
  workSummary: string;

  @ApiPropertyOptional({ description: 'Ringkasan cuaca mingguan / harian', example: '5 hari cerah berawan, 2 hari hujan sore (rata-rata 2.5 jam)' })
  weatherSummary?: string;

  @ApiPropertyOptional({ description: 'Total serapan tenaga kerja kumulatif (Man-Days)', example: 450 })
  manpowerCount?: number;

  @ApiPropertyOptional({ description: 'Catatan kendala teknis dan rencana aksi mitigasi', example: 'Pengiriman marmer import tertunda 3 hari akibat cuaca pelabuhan, percepatan dengan lembur fabrikasi rangka' })
  issuesSummary?: string;

  @ApiPropertyOptional({ description: 'Nama Penanggung Jawab Lapangan Kontraktor (Project Manager)', example: 'Ir. Agus Wijaya, M.T.' })
  contractorPic?: string;

  @ApiPropertyOptional({ description: 'Nama Konsultan Pengawas / Manajemen Konstruksi (Team Leader MK)', example: 'Ir. Hendra Prasetyo (Konsultan MK)' })
  mkPic?: string;

  @ApiPropertyOptional({ description: 'Status awal laporan', default: 'SUBMITTED', example: 'SUBMITTED' })
  status?: string;

  @ApiPropertyOptional({ description: 'Kode proyek aktif', example: 'PRJ-NSI-2026' })
  projectCode?: string;
}

