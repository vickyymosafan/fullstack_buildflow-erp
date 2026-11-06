import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CacheScopeEnum {
  ALL = 'all',
  TENANT = 'tenant',
  TAG = 'tag',
  KEY = 'key',
}

export class PurgeCacheDto {
  @ApiProperty({ enum: CacheScopeEnum, default: CacheScopeEnum.TAG, description: 'Cakupan pembersihan cache Redis' })
  scope: CacheScopeEnum;

  @ApiPropertyOptional({ example: 'contracts:clauses', description: 'Tag cache spesifik bila scope=tag atau tenantId bila scope=tenant' })
  targetTag?: string;

  @ApiProperty({ example: 'Selesai sinkronisasi master data COA & GL 2026', description: 'Alasan invalidasi cache' })
  reason: string;
}
