import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PredictDisputeDto {
  @ApiProperty({ example: 'CTR-001', description: 'ID kontrak acuan' })
  contractId: string;

  @ApiProperty({ example: 0.82, description: 'Schedule Performance Index (SPI EVM Proyek saat ini)' })
  schedulePerformanceIndex: number;

  @ApiProperty({ example: 75, description: 'Umur piutang tagihan termin MC yang belum dibayar owner (hari)' })
  unpaidInvoicesAgingDays: number;

  @ApiProperty({ example: 4, description: 'Jumlah Change Order / CCO yang belum disetujui owner' })
  unapprovedChangeOrdersCount: number;

  @ApiPropertyOptional({ example: 2, description: 'Jumlah peristiwa Force Majeure atau cuaca ekstrem' })
  forceMajeureEventsCount?: number;

  @ApiPropertyOptional({ example: 20, description: 'Keterlambatan penyerahan lahan / site access oleh owner (hari)' })
  siteAccessDelayDays?: number;

  @ApiPropertyOptional({ example: 'BANI_ARBITRATION', description: 'Klausul forum penyelesaian sengketa' })
  forumClause?: string;
}
