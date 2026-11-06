import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Bank Mandiri' })
  bankName: string;

  @ApiProperty({ example: '123-00-9876543-2' })
  accountNumber: string;

  @ApiProperty({ example: 'PT BuildFlow Konstruksi Persada (Master Escrow)' })
  accountHolder: string;

  @ApiProperty({
    example: 'MASTER_HOLDING',
    enum: ['MASTER_HOLDING', 'PROJECT_OPERATIONAL', 'KSO_ESCROW', 'TAX_RESERVE'],
  })
  accountType: 'MASTER_HOLDING' | 'PROJECT_OPERATIONAL' | 'KSO_ESCROW' | 'TAX_RESERVE';

  @ApiProperty({ example: 'IDR' })
  currency: string;

  @ApiProperty({ example: 45000000000, description: 'Saldo awal rekening (Rp)' })
  currentBalance: number;

  @ApiPropertyOptional({ example: 5000000000, description: 'Batas saldo minimum untuk target balancing (Rp)' })
  minimumBalanceTarget?: number;

  @ApiPropertyOptional({ example: 'PRJ-IKN-001' })
  projectId?: string;

  @ApiPropertyOptional({ example: 'Pembangunan Istana Negara IKN Tahap II' })
  projectName?: string;

  @ApiPropertyOptional({ example: 'KC Jakarta Plaza Mandiri' })
  branchOffice?: string;

  @ApiProperty({ example: true, description: 'Status integrasi Host-to-Host (H2H)' })
  isH2HConnected: boolean;
}

