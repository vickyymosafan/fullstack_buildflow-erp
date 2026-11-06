import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Link4dScheduleDto {
  @ApiProperty({ example: 'ELE-BP-001', description: 'ID Elemen 3D BIM' })
  elementId: string;

  @ApiProperty({ example: 'WBS-1.1.2', description: 'Kode Work Breakdown Structure (WBS)' })
  wbsCode: string;

  @ApiProperty({ example: 'Pekerjaan Bored Pile Stasiun Harmoni Baris 1-4', description: 'Nama Kegiatan Pekerjaan' })
  activityName: string;

  @ApiProperty({ example: '2026-03-01', description: 'Tanggal Rencana Mulai (YYYY-MM-DD)' })
  plannedStartDate: string;

  @ApiProperty({ example: '2026-03-20', description: 'Tanggal Rencana Selesai (YYYY-MM-DD)' })
  plannedEndDate: string;

  @ApiPropertyOptional({ example: '2026-03-02', description: 'Tanggal Realisasi Mulai (YYYY-MM-DD)' })
  actualStartDate?: string;

  @ApiPropertyOptional({ example: '2026-03-18', description: 'Tanggal Realisasi Selesai (YYYY-MM-DD)' })
  actualEndDate?: string;

  @ApiPropertyOptional({ example: 'COMPLETED', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'] })
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

