import { ApiProperty } from '@nestjs/swagger';

export class CreateGoodsReceiptDto {
  @ApiProperty({ example: 'PO-2026-088', description: 'Nomor Purchase Order' })
  poNumber!: string;

  @ApiProperty({ example: 'WH-SITE-LRT', description: 'Kode gudang penerima' })
  warehouseCode!: string;

  @ApiProperty({ example: 'GR-2026-1101-01', description: 'Nomor Surat Penerimaan Barang (GR)' })
  receiptNumber!: string;

  @ApiProperty({ example: 'PRD-MAT-001', description: 'Kode produk material' })
  productCode!: string;

  @ApiProperty({ example: 500, description: 'Volume kuantitas barang yang diterima fisik' })
  quantity!: number;

  @ApiProperty({ example: 74000, description: 'Harga satuan material (IDR)' })
  unitCost!: number;
}

