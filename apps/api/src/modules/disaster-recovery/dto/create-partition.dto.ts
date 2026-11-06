import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PartitionKeyEnum {
  FISCAL_YEAR = 'fiscal_year',
  TENANT_ID = 'tenant_id',
  PROJECT_CODE = 'project_code',
}

export class CreatePartitionDto {
  @ApiProperty({ example: 'tenant_adhimix', description: 'ID Tenant atau Entitas KSO' })
  tenantId: string;

  @ApiProperty({ example: 'PT Adhimix Precast Indonesia', description: 'Nama Resmi Tenant' })
  tenantName: string;

  @ApiProperty({ example: 2026, description: 'Tahun Anggaran Pembukuan' })
  fiscalYear: number;

  @ApiProperty({ example: 'tenant_adhimix_2026', description: 'Nama schema PostgreSQL yang dipartisi' })
  schemaName: string;

  @ApiProperty({ enum: PartitionKeyEnum, default: PartitionKeyEnum.FISCAL_YEAR, description: 'Metode partisi' })
  partitionKey: PartitionKeyEnum;

  @ApiProperty({ example: ['general_ledger', 'journal_entries', 'inventory_logs', 'site_daily_logs'], description: 'Daftar tabel yang masuk partisi' })
  tables: string[];

  @ApiPropertyOptional({ example: 84, description: 'Masa retensi data aktif dalam bulan (default 7 tahun / 84 bulan sesuai PSAK/PUPR)', default: 84 })
  retentionMonths?: number;
}
