import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrecastPrestressService } from './precast-prestress.service';
import {
  RegisterPrecastSegmentDto,
  AdvanceSegmentStageDto,
  RecordCubeCompressionTestDto,
  RecordTendonStressingDto,
  CertifyLauncherErectionDto,
} from './dto/precast-prestress.dto';

@ApiTags('Precast Concrete Yard, Post-Tensioning & Material Lab QA/QC')
@Controller('precast-prestress')
export class PrecastPrestressController {
  constructor(private readonly precastPrestressService: PrecastPrestressService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get Executive Summary for Precast Yard, Post-Tensioning Stressing & Concrete Lab QA/QC' })
  @ApiResponse({ status: 200, description: 'Precast & Prestress overview metrics returned.' })
  getOverview() {
    return this.precastPrestressService.getOverview();
  }

  @Get('segments')
  @ApiOperation({ summary: 'List all RFID/QR Precast Girder & Segmental Box Girder units' })
  getSegments() {
    return this.precastPrestressService.getSegments();
  }

  @Post('segments/register')
  @ApiOperation({ summary: 'Register a new Precast Segment with Steam Curing temperature validation (<=75°C DEF limit)' })
  registerSegment(@Body() dto: RegisterPrecastSegmentDto) {
    return this.precastPrestressService.registerSegment(dto);
  }

  @Post('segments/advance-stage')
  @ApiOperation({ summary: 'Advance Precast Segment lifecycle stage (Steam Curing -> Stockyard -> Stressed -> Erected)' })
  advanceSegmentStage(@Body() dto: AdvanceSegmentStageDto) {
    return this.precastPrestressService.advanceSegmentStage(dto);
  }

  @Get('cube-tests')
  @ApiOperation({ summary: 'List all Concrete Cylinder/Cube Compressive Strength tests (SNI 1974:2011)' })
  getCubeTests() {
    return this.precastPrestressService.getCubeTests();
  }

  @Post('cube-tests/record')
  @ApiOperation({ summary: 'Record a Concrete Compressive Strength test and evaluate 80% transfer / 100% design f\'c' })
  recordCubeTest(@Body() dto: RecordCubeCompressionTestDto) {
    return this.precastPrestressService.recordCubeTest(dto);
  }

  @Get('stressing-records')
  @ApiOperation({ summary: 'List all Post-Tensioning Tendon Stressing & Elongation records (SNI 2847:2019)' })
  getStressingRecords() {
    return this.precastPrestressService.getStressingRecords();
  }

  @Post('stressing-records/record')
  @ApiOperation({ summary: 'Record Hydraulic Jacking Force & Tendon Elongation and verify ±7% SNI 2847 tolerance' })
  recordTendonStressing(@Body() dto: RecordTendonStressingDto) {
    return this.precastPrestressService.recordTendonStressing(dto);
  }

  @Get('erection-logs')
  @ApiOperation({ summary: 'List all Heavy-Haul Boogie & Overhead Launching Gantry Erection telemetry logs' })
  getErectionLogs() {
    return this.precastPrestressService.getErectionLogs();
  }

  @Post('erection-logs/certify')
  @ApiOperation({ summary: 'Certify Girder Seating on Elastomeric/Pot Bearing Pad after Launching Gantry erection' })
  certifyLauncherErection(@Body() dto: CertifyLauncherErectionDto) {
    return this.precastPrestressService.certifyLauncherErection(dto);
  }
}
