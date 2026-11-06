import { ApiProperty } from '@nestjs/swagger';

export enum ArchiveTargetEnum {
  COLD_MINIO_S3 = 'cold_minio_s3',
  GLACIER_DEEP = 'glacier_deep',
  DETACHED_READ_ONLY = 'detached_read_only',
}

export class ArchivePartitionDto {
  @ApiProperty({ example: 'part-adhimix-2024', description: 'ID Partisi yang akan di-detach & diarsipkan' })
  partitionId: string;

  @ApiProperty({ enum: ArchiveTargetEnum, default: ArchiveTargetEnum.COLD_MINIO_S3, description: 'Target media penyimpanan arsip' })
  targetStorage: ArchiveTargetEnum;

  @ApiProperty({ example: 'Penutupan tahun buku audit 2024 (Retention policy compliance)', description: 'Alasan pengarsipan' })
  reason: string;

  @ApiProperty({ example: 'Ir. Budi Santoso (SRE & Compliance Lead)', description: 'Nama pejabat pengotorisasi' })
  authorizedBy: string;
}
