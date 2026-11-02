import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('overview')
  async getOverview() {
    return this.settingsService.getOverview();
  }

  @Get('organization')
  async getOrganization() {
    return this.settingsService.getOrganization();
  }

  @Post('branches')
  async createBranch(
    @Body()
    body: {
      code: string;
      name: string;
      address?: string;
      isHeadOffice?: boolean;
    },
  ) {
    return this.settingsService.createBranch(body);
  }

  @Get('users')
  async getUsers() {
    return this.settingsService.getUsers();
  }

  @Post('users')
  async createUser(
    @Body()
    body: {
      email: string;
      fullName: string;
      roleId?: string;
      roleName?: string;
    },
  ) {
    return this.settingsService.createUser(body);
  }

  @Patch('users/:id/status')
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' },
  ) {
    return this.settingsService.toggleUserStatus(id, body.status);
  }

  @Get('roles')
  async getRoles() {
    return this.settingsService.getRoles();
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.settingsService.getAuditLogs();
  }
}

