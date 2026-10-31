import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';

@ApiTags('Procurement & Subcontractor Tender')
@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('vendors')
  @ApiOperation({ summary: 'Daftar vendor rekanan terdaftar' })
  async getVendors() {
    const data = await this.procurementService.getVendors();
    return { success: true, data };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Daftar Purchase Order (PO) per proyek atau global' })
  async getOrders(@Query('projectId') projectId?: string) {
    const data = await this.procurementService.getPurchaseOrders(projectId);
    return { success: true, data, count: data.length };
  }

  @Post('orders')
  @ApiOperation({ summary: 'Buat Purchase Order baru terikat vendor dan pagu proyek' })
  async createOrder(@Body() dto: CreatePurchaseOrderDto) {
    const data = await this.procurementService.createPurchaseOrder(dto);
    return { success: true, data, message: 'Purchase Order berhasil dibuat (Menunggu Persetujuan)' };
  }
}

