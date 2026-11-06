import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisbursementItemDto {
  @ApiProperty({ example: 'VND-002' })
  beneficiaryCode: string;

  @ApiProperty({ example: 'PT Krakatau Steel (Persero) Tbk' })
  beneficiaryName: string;

  @ApiProperty({ example: 'Bank BNI' })
  beneficiaryBank: string;

  @ApiProperty({ example: '987-654-3210' })
  beneficiaryAccount: string;

  @ApiProperty({ example: 4250000000, description: 'Nominal transfer (Rp)' })
  amount: number;

  @ApiProperty({ example: 'Pembayaran PO Baja Ulir BJTS Patimban Termin 1' })
  description: string;

  @ApiPropertyOptional({ example: 'PO-2026-0819' })
  referenceNumber?: string;
}

export class CreateBatchDisbursementDto {
  @ApiProperty({ example: 'Batch Transfer Termin Subkon & Supplier IKN Tahap 1' })
  batchTitle: string;

  @ApiProperty({ example: 'Bank Mandiri', enum: ['Bank Mandiri', 'Bank BCA', 'Bank BNI', 'Bank BRI'] })
  bankPartner: 'Bank Mandiri' | 'Bank BCA' | 'Bank BNI' | 'Bank BRI';

  @ApiProperty({ example: '123-00-9876543-2', description: 'Nomor rekening sumber debet' })
  sourceAccountNumber: string;

  @ApiProperty({
    example: 'MATERIAL_SUPPLIER_PO',
    enum: ['SUB_CONTRACTOR_PROGRESS', 'MATERIAL_SUPPLIER_PO', 'LABOR_PAYROLL', 'OPERATIONAL_EXPENSE'],
  })
  category: 'SUB_CONTRACTOR_PROGRESS' | 'MATERIAL_SUPPLIER_PO' | 'LABOR_PAYROLL' | 'OPERATIONAL_EXPENSE';

  @ApiPropertyOptional({ example: 'PRJ-IKN-001' })
  projectId?: string;

  @ApiPropertyOptional({ example: 'Pembangunan Istana Negara IKN Tahap II' })
  projectName?: string;

  @ApiProperty({ example: 'Andi Pratama, S.E. (Treasury Officer)' })
  makerName: string;

  @ApiProperty({ type: [DisbursementItemDto] })
  items: DisbursementItemDto[];

  @ApiPropertyOptional({ example: 'Mohon prioritas eksekusi batch H2H sebelum cut-off kliring RTGS 14:00 WIB.' })
  notes?: string;
}
