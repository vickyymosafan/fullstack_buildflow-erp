import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID Pengguna yang melakukan aksi' })
  userId: string;

  @ApiProperty({ description: 'Nama Pengguna' })
  userName: string;

  @ApiProperty({ description: 'Peran Pengguna (e.g. Quantity Surveyor, MK Consultant, PPK)' })
  userRole: string;

  @ApiProperty({ description: 'Jenis aksi audit', enum: ['CREATE', 'UPDATE', 'ENDORSE', 'APPROVE', 'DISCHARGE', 'VERIFY', 'EXPORT'] })
  action: 'CREATE' | 'UPDATE' | 'ENDORSE' | 'APPROVE' | 'DISCHARGE' | 'VERIFY' | 'EXPORT';

  @ApiProperty({ description: 'Nama modul / resource (e.g. FinalAccount, AsBuilt, Handover)' })
  module: string;

  @ApiProperty({ description: 'ID entitas resource yang terdampak' })
  resourceId: string;

  @ApiProperty({ description: 'Uraian rincian tindakan audit' })
  description: string;

  @ApiPropertyOptional({ description: 'Alamat IP pengguna' })
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Status hasil operasi (SUCCESS, WARNING, FAILED)' })
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
}
