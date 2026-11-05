import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChangeOrdersService } from './change-orders.service';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderStatusDto } from './dto/update-change-order-status.dto';
import { CreateClaimDto } from './dto/create-claim.dto';

@ApiTags('Contract Change Orders & Variation Orders')
@Controller('change-orders')
export class ChangeOrdersController {
  constructor(private readonly changeOrdersService: ChangeOrdersService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan KPI CCO, net dampak biaya, dan perpanjangan waktu EoT' })
  @ApiQuery({ name: 'projectCode', required: false })
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.changeOrdersService.getSummary(projectCode);
  }

  @Get('claims')
  @ApiOperation({ summary: 'Mendapatkan daftar klaim konstruksi dan perpanjangan waktu (EoT)' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getClaims(
    @Query('projectCode') projectCode?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.changeOrdersService.getClaims(projectCode, category, status);
  }

  @Post('claims')
  @ApiOperation({ summary: 'Mengajukan klaim kompensasi waktu atau biaya konstruksi baru' })
  async createClaim(@Body() dto: CreateClaimDto) {
    return this.changeOrdersService.createClaim(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar tiket CCO / Variation Order' })
  @ApiQuery({ name: 'projectCode', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'changeType', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getChangeOrders(
    @Query('projectCode') projectCode?: string,
    @Query('status') status?: string,
    @Query('changeType') changeType?: string,
    @Query('search') search?: string,
  ) {
    return this.changeOrdersService.getChangeOrders(projectCode, status, changeType, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail tiket CCO beserta rincian item tambah/kurang' })
  async getChangeOrderById(@Param('id') id: string) {
    return this.changeOrdersService.getChangeOrderById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Mengajukan tiket CCO / Variation Order baru' })
  async createChangeOrder(@Body() dto: CreateChangeOrderDto) {
    return this.changeOrdersService.createChangeOrder(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Memperbarui status review dan persetujuan bertingkat CCO (MK/Owner)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateChangeOrderStatusDto,
  ) {
    return this.changeOrdersService.updateStatus(id, dto);
  }
}
