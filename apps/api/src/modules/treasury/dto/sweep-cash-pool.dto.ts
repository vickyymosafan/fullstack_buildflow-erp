import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SweepCashPoolDto {
  @ApiProperty({ example: 'POLL-2026-01' })
  poolGroupId: string;

  @ApiProperty({ example: '123-00-5544332-1', description: 'Rekening sub operasional sumber sweeping' })
  sourceAccountNumber: string;

  @ApiProperty({ example: '123-00-9876543-2', description: 'Rekening induk master holding target' })
  targetAccountNumber: string;

  @ApiProperty({ example: 4500000000, description: 'Nominal sweeping dana (Rp)' })
  amount: number;

  @ApiProperty({
    example: 'SWEEPING_TO_MASTER',
    enum: ['SWEEPING_TO_MASTER', 'TOP_UP_MINIMUM_BALANCE', 'KSO_PROFIT_SPLIT'],
  })
  sweepType: 'SWEEPING_TO_MASTER' | 'TOP_UP_MINIMUM_BALANCE' | 'KSO_PROFIT_SPLIT';

  @ApiProperty({ example: 'Dewi Rahmawati, S.E. (Head of Corporate Treasury)' })
  authorizedBy: string;

  @ApiPropertyOptional({ example: 'End of day automatic balance sweep back to Master Escrow Pool' })
  remarks?: string;
}

