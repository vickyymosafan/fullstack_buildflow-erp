import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OrchestrationService } from './orchestration.service';
import { HandoverTenderDto } from './dto/handover-tender.dto';
import { PoMatchingDto } from './dto/po-matching.dto';
import { SiteApprovalDto } from './dto/site-approval.dto';

@Controller('orchestration')
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}

  @Get('overview')
  getOverview() {
    return this.orchestrationService.getOverview();
  }

  @Post('tender-won-to-project')
  @HttpCode(HttpStatus.CREATED)
  handoverTenderToProject(@Body() dto: HandoverTenderDto) {
    return this.orchestrationService.handoverTenderToProject(dto);
  }

  @Post('po-receipt-and-matching')
  @HttpCode(HttpStatus.OK)
  orchestratePoReceiptAndMatching(@Body() dto: PoMatchingDto) {
    return this.orchestrationService.orchestratePoReceiptAndMatching(dto);
  }

  @Post('site-report-approval-and-progress')
  @HttpCode(HttpStatus.OK)
  orchestrateSiteReportApproval(@Body() dto: SiteApprovalDto) {
    return this.orchestrationService.orchestrateSiteReportApproval(dto);
  }
}

