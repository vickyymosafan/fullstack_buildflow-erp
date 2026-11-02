import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('overview')
  async getOverview() {
    return this.crmService.getOverview();
  }

  @Get('clients')
  async getClients() {
    return this.crmService.getClients();
  }

  @Post('clients')
  async createClient(
    @Body()
    body: {
      name: string;
      legalName?: string;
      email?: string;
      phone?: string;
      address?: string;
    },
  ) {
    return this.crmService.createClient(body);
  }

  @Get('contracts')
  async getContracts() {
    return this.crmService.getContracts();
  }

  @Post('contracts')
  async createContract(
    @Body()
    body: {
      clientId: string;
      contractNumber: string;
      title: string;
      contractValue: number;
      startDate: string;
      endDate: string;
      status?: string;
    },
  ) {
    return this.crmService.createContract(body);
  }

  @Get('tenders')
  async getTenders() {
    return this.crmService.getTenders();
  }

  @Post('tenders')
  async createTender(
    @Body()
    body: {
      title: string;
      clientName: string;
      category?: 'INFRASTRUCTURE' | 'BUILDING' | 'INDUSTRIAL' | 'COMMERCIAL';
      ownerType?: 'BUMN' | 'PEMERINTAH' | 'SWASTA';
      estimatedValue: number;
      bidBondAmount?: number;
      submissionDeadline: string;
      notes?: string;
    },
  ) {
    return this.crmService.createTender(body);
  }

  @Patch('tenders/:id/stage')
  async updateTenderStage(
    @Param('id') id: string,
    @Body() body: { stage: 'AANWIJZING' | 'PROPOSAL_SUBMITTED' | 'NEGOTIATION' | 'WON' | 'LOST' },
  ) {
    return this.crmService.updateTenderStage(id, body.stage);
  }

  @Post('tenders/handover')
  async handoverToProject(
    @Body()
    body: {
      tenderId?: string;
      contractId?: string;
      projectCode: string;
      projectName: string;
      plannedStart?: string;
      plannedEnd?: string;
    },
  ) {
    return this.crmService.handoverToProject(body);
  }
}

