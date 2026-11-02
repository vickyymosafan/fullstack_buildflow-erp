export class PoMatchingDto {
  poNumber!: string;
  warehouseCode!: string;
  receiptNumber!: string;
  invoiceNumber!: string;
  productCode!: string;
  receivedQuantity!: number;
  unitCost!: number;
  invoiceAmount!: number;
  receivedBy?: string;
  notes?: string;
}

