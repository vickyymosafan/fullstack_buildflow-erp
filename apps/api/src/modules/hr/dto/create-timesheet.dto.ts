import { ApiProperty } from '@nestjs/swagger';

export class CreateTimesheetDto {
  @ApiProperty({ example: 'EMP-003', description: 'Kode unik karyawan / mandor' })
  employeeCode!: string;

  @ApiProperty({ example: '2026-10-31T08:00:00Z', description: 'Tanggal kerja lapangan' })
  workDate!: string;

  @ApiProperty({ example: 8.0, description: 'Jam kerja reguler (baseline shift 8 jam)' })
  hoursWorked!: number;

  @ApiProperty({ example: 2.0, description: 'Jam lembur tambahan (overtime)' })
  overtimeHours!: number;

  @ApiProperty({ example: 'PEMBESIAN', description: 'Kategori spesialisasi pekerjaan lapangan' })
  taskCategory!: string;

  @ApiProperty({ example: 250000, description: 'Tarif upah harian standar (IDR)' })
  dailyWage!: number;

  @ApiProperty({ example: 'Perakitan tulangan baja pile cap span 4', required: false })
  notes?: string;

  @ApiProperty({ example: 'PRJ-2026-LRT', required: false })
  projectCode?: string;
}

