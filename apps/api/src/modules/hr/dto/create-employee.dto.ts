import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-009', description: 'Kode unik pegawai / mandor' })
  employeeCode!: string;

  @ApiProperty({ example: 'Rahmat Hidayat', description: 'Nama lengkap tenaga kerja' })
  fullName!: string;

  @ApiProperty({ example: 'Mandor Finishing & Arsitektural', description: 'Jabatan / Keahlian spesialisasi' })
  jobTitle!: string;

  @ApiProperty({ example: 'DEP-OPS', description: 'Kode departemen penempatan', required: false })
  departmentCode?: string;
}

