import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExecutiveBiService } from './executive-bi.service';
import { CreateDirectiveDto } from './dto/create-directive.dto';
import { SimulateScenarioDto } from './dto/simulate-scenario.dto';

@ApiTags('Executive BI & Multi-Project Forecasting')
@Controller('executive-bi')
export class ExecutiveBiController {
  constructor(private readonly executiveBiService: ExecutiveBiService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dapatkan ringkasan metrik eksekutif portofolio, gross margin, dan cashflow runway' })
  getSummary() {
    return this.executiveBiService.getSummary();
  }

  @Get('forecasts')
  @ApiOperation({ summary: 'Daftar proyeksi EVM, CPI, SPI, EAC, dan risiko multi-proyek' })
  getProjectForecasts(
    @Query('sector') sector?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('search') search?: string,
  ) {
    return this.executiveBiService.getProjectForecasts(sector, riskLevel, search);
  }

  @Get('cashflow-runway')
  @ApiOperation({ summary: 'Proyeksi arus kas likuiditas multi-proyek 6 bulan mendatang' })
  getCashflowRunway() {
    return this.executiveBiService.getCashflowRunway();
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simulasi skenario makro finansial What-If Analysis untuk margin dan runway' })
  simulateScenario(@Body() dto: SimulateScenarioDto) {
    return this.executiveBiService.simulateScenario(dto);
  }

  @Get('directives')
  @ApiOperation({ summary: 'Daftar arahan dan instruksi strategis dewan direksi / BOD' })
  getDirectives(@Query('status') status?: string) {
    return this.executiveBiService.getDirectives(status);
  }

  @Post('directives')
  @ApiOperation({ summary: 'Terbitkan arahan strategis direksi baru untuk proyek bermasalah' })
  createDirective(@Body() dto: CreateDirectiveDto) {
    return this.executiveBiService.createDirective(dto);
  }

  @Patch('directives/:id/resolve')
  @ApiOperation({ summary: 'Tandai arahan direksi telah ditindaklanjuti dan diselesaikan' })
  resolveDirective(@Param('id') id: string) {
    return this.executiveBiService.resolveDirective(id);
  }
}

