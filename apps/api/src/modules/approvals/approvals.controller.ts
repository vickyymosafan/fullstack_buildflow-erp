import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Multi-tier SoD Approval Engine')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Daftar antrean persetujuan tertunda berdasarkan peran pengguna' })
  @ApiResponse({ status: 200, description: 'Antrean approval berhasil diambil' })
  async getPending(@Query('role') role?: string) {
    const data = await this.approvalsService.getPendingApprovals(role);
    return {
      success: true,
      data,
      count: data.length,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('action')
  @ApiOperation({ summary: 'Eksekusi persetujuan (Approve / Reject) dengan pencatatan audit log & SoD' })
  @ApiResponse({ status: 200, description: 'Keputusan berhasil dieksekusi dan dicatat di audit log' })
  async processAction(
    @Body() dto: ApprovalActionDto,
    @Query('role') queryRole?: string,
  ) {
    const data = await this.approvalsService.processApproval(dto, undefined, queryRole || 'DIRECTOR');
    return {
      success: true,
      data,
      message: `Dokumen ${dto.itemId} berhasil di-${dto.action.toLowerCase()}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

