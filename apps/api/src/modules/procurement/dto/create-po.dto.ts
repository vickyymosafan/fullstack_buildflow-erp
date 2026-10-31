import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'PRJ-2026-LRT', description: 'Kode proyek tujuan pengadaan' })
  projectCode!: string;

  @ApiProperty({ example: 'VND-001', description: 'Kode vendor rekanan terdaftar' })
  vendorCode!: string;

  @ApiProperty({ example: 'PO-2026-105', description: 'Nomor Purchase Order' })
  poNumber!: string;

  @ApiProperty({ example: 145000000, description: 'Nilai bruto Purchase Order (IDR)' })
  totalAmount!: number;
}

