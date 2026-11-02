import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SubcontractorsService } from './subcontractors.service';
import { CreateSpkDto } from './dto/create-spk.dto';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { CreateMcDto } from './dto/create-mc.dto';
import { UpdateMcStatusDto } from './dto/update-mc-status.dto';

@Controller('subcontractors')
export class SubcontractorsController {
  constructor(private readonly service: SubcontractorsService) {}

  @Get('summary')
  async getSummary(@Query('projectCode') projectCode?: string) {
    return this.service.getSummary(projectCode);
  }

  @Get('spk')
  async getSpkList(@Query('projectCode') projectCode?: string) {
    return this.service.getSpkList(projectCode);
  }

  @Post('spk')
  async createSpk(@Body() dto: CreateSpkDto) {
    return this.service.createSpk(dto);
  }

  @Get('opname')
  async getOpnameList(@Query('projectCode') projectCode?: string) {
    return this.service.getOpnameList(projectCode);
  }

  @Post('opname')
  async createOpname(@Body() dto: CreateOpnameDto) {
    return this.service.createOpname(dto);
  }

  @Get('mc')
  async getMcList(@Query('projectCode') projectCode?: string) {
    return this.service.getMcList(projectCode);
  }

  @Post('mc')
  async createMc(@Body() dto: CreateMcDto) {
    return this.service.createMc(dto);
  }

  @Patch('mc/:id/status')
  async updateMcStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMcStatusDto,
  ) {
    return this.service.updateMcStatus(id, dto);
  }

  @Get('vendors')
  async getVendors() {
    return this.service.getVendors();
  }
}
