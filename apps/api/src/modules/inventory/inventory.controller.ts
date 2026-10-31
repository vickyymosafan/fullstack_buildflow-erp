import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';

@ApiTags('Inventory & Warehouse Logistics')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('warehouses')
  @ApiOperation({ summary: 'Daftar gudang logistik dan transit proyek' })
  async getWarehouses() {
    const data = await this.inventoryService.getWarehouses();
    return { success: true, data };
  }

  @Get('stock')
  @ApiOperation({ summary: 'Kalkulasi saldo fisik material real-time (Stock on Hand) per gudang' })
  async getStock(@Query('warehouseCode') warehouseCode?: string) {
    const data = await this.inventoryService.getStockOnHand(warehouseCode);
    return { success: true, data, count: data.length };
  }

  @Get('movements')
  @ApiOperation({ summary: 'Buku besar mutasi stok fisik (Immutable Stock Movement Ledger)' })
  async getMovements(@Query('limit') limit?: number) {
    const data = await this.inventoryService.getMovements(limit ? Number(limit) : 20);
    return { success: true, data, count: data.length };
  }

  @Post('goods-receipt')
  @ApiOperation({ summary: 'Pencatatan Surat Penerimaan Barang (GR) dan mutasi stok otomatis' })
  async createReceipt(@Body() dto: CreateGoodsReceiptDto) {
    const data = await this.inventoryService.createGoodsReceipt(dto);
    return { success: true, data, message: 'Barang berhasil diverifikasi masuk gudang dan tercatat di buku besar mutasi stok' };
  }
}

