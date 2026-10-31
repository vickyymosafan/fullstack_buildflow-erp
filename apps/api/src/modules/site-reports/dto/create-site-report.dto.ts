import { ApiProperty } from '@nestjs/swagger';

export class CreateSiteReportDto {
  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode atau ID proyek' })
  projectId!: string;

  @ApiProperty({ example: '2026-11-01', description: 'Tanggal laporan (YYYY-MM-DD)' })
  reportDate!: string;

  @ApiProperty({ example: 'CERAH', description: 'Kondisi cuaca: CERAH, HUJAN, MENDUNG' })
  weather!: string;

  @ApiProperty({ example: 85, description: 'Total tenaga kerja lapangan (mandor, tukang, pembantu)' })
  workerCount!: number;

  @ApiProperty({ example: 'Pengecoran plat lantai zona 2 selesai 140 m3...', description: 'Ringkasan pekerjaan dan kendala' })
  workSummary!: string;
}

