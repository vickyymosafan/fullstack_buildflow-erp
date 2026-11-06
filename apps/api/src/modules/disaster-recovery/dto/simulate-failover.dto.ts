import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DrillTypeEnum {
  SIMULATED_UNPLANNED_OUTAGE = 'simulated_unplanned_outage',
  SCHEDULED_SWITCHOVER = 'scheduled_switchover',
  SPLIT_BRAIN_TEST = 'split_brain_test',
}

export class SimulateFailoverDto {
  @ApiProperty({ example: 'pg-replica-jkt-01', description: 'ID Read Replica kandidat yang akan dipromosikan menjadi Master' })
  targetReplicaId: string;

  @ApiProperty({ enum: DrillTypeEnum, default: DrillTypeEnum.SCHEDULED_SWITCHOVER, description: 'Jenis simulasi drill failover' })
  drillType: DrillTypeEnum;

  @ApiPropertyOptional({ example: 5, description: 'Waktu drain koneksi write dalam detik sebelum switchover', default: 5 })
  gracefulDrainSeconds?: number;

  @ApiPropertyOptional({ example: false, description: 'Paksa promosi bila quorum parsial (bypasses safety lock)', default: false })
  forcePromotion?: boolean;
}
