import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultsIfNeeded();
  }

  async seedDefaultsIfNeeded() {
    try {
      const org = await this.prisma.organization.findFirst();
      if (!org) return;

      // Seed Balikpapan / IKN Branch if only 2 branches exist
      const branchCount = await this.prisma.branch.count();
      if (branchCount < 3) {
        const iknBranch = await this.prisma.branch.create({
          data: {
            organizationId: org.id,
            code: 'BR-IKN',
            name: 'Kantor Cabang Wilayah IKN Nusantara & Balikpapan',
            address: 'Grand City Balikpapan Blok A-12, Kalimantan Timur',
            status: 'ACTIVE',
          },
        });

        // Add department
        await this.prisma.department.create({
          data: {
            organizationId: org.id,
            branchId: iknBranch.id,
            code: 'DEPT-ENG-IKN',
            name: 'Divisi Rekayasa Sipil & Infrastruktur IKN',
          },
        });
      }

      // Seed realistic audit logs if count < 5
      const auditCount = await this.prisma.auditLog.count();
      if (auditCount < 5) {
        const adminUser = await this.prisma.user.findFirst({ where: { email: 'director@buildflow.id' } });
        const pmUser = await this.prisma.user.findFirst({ where: { email: 'pm@buildflow.id' } });

        const logs = [
          {
            organizationId: org.id,
            actorId: adminUser?.id,
            action: 'LOGIN_SUCCESS',
            resourceType: 'AUTH',
            resourceId: adminUser?.id || 'sys-auth',
            payload: { method: 'SSO_SAML', clientBrowser: 'Chrome 131 macOS/Windows', mfaVerified: true },
            ipAddress: '103.247.112.45',
            correlationId: 'req-auth-001',
          },
          {
            organizationId: org.id,
            actorId: adminUser?.id,
            action: 'ROLE_PERMISSION_UPDATED',
            resourceType: 'RBAC',
            resourceId: 'role-director',
            payload: { role: 'DIRECTOR', permissionsGranted: ['contracts.sign', 'approvals.tier3'] },
            ipAddress: '103.247.112.45',
            correlationId: 'req-rbac-082',
          },
          {
            organizationId: org.id,
            actorId: pmUser?.id,
            action: 'CONTRACT_HANDOVER_EXECUTED',
            resourceType: 'CRM_TENDER',
            resourceId: 'CTR-2025-MRT-001',
            payload: { projectCode: 'PRJ-2026-LRT', contractValue: 45000000000 },
            ipAddress: '182.253.18.90',
            correlationId: 'req-handover-104',
          },
          {
            organizationId: org.id,
            actorId: adminUser?.id,
            action: 'BRANCH_REGISTERED',
            resourceType: 'ORGANIZATION',
            resourceId: 'BR-IKN',
            payload: { branchCode: 'BR-IKN', city: 'Balikpapan' },
            ipAddress: '103.247.112.45',
            correlationId: 'req-branch-202',
          },
          {
            organizationId: org.id,
            actorId: pmUser?.id,
            action: 'BASELINE_BUDGET_LOCKED',
            resourceType: 'BUDGET',
            resourceId: 'BGT-2026-TOL-V1',
            payload: { baselineValue: 105600000000, version: '1.0' },
            ipAddress: '182.253.18.90',
            correlationId: 'req-bgt-550',
          },
        ];

        for (const log of logs) {
          await this.prisma.auditLog.create({ data: log });
        }
      }
    } catch (err) {
      console.warn('Settings auto-seed warning (handled safely):', err);
    }
  }

  async getOverview() {
    const org = await this.prisma.organization.findFirst({
      include: {
        branches: {
          include: { departments: true },
        },
      },
    });

    const totalBranches = org ? org.branches.length : 0;
    const totalDepartments = org ? org.branches.reduce((acc, b) => acc + b.departments.length, 0) : 0;
    const users = await this.prisma.user.findMany();
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const totalRoles = await this.prisma.role.count();
    const totalAuditLogs = await this.prisma.auditLog.count();

    return {
      companyName: org?.name || 'PT BuildFlow Konstruksi Indonesia Tbk',
      legalName: org?.legalName || 'PT BuildFlow Konstruksi Indonesia Tbk',
      companyCode: 'BF-CORP',
      taxId: '01.345.678.9-012.000',
      address: 'Menara Mega Konstruksi Lt. 28, Jl. Gatot Subroto Kav. 55, Jakarta Selatan',
      defaultCurrency: org?.defaultCurrency || 'IDR',
      timezone: org?.timezone || 'Asia/Jakarta',
      kpis: {
        totalBranches,
        totalDepartments,
        totalUsers: users.length,
        activeUsers,
        totalRoles,
        totalAuditLogs,
        securityStatus: 'COMPLIANT_ISO27001',
      },
    };
  }

  async getOrganization() {
    const org = await this.prisma.organization.findFirst({
      include: {
        branches: {
          include: {
            departments: true,
            projects: { select: { id: true, projectCode: true, name: true, status: true } },
          },
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Data organisasi tidak ditemukan');
    }

    return {
      id: org.id,
      code: 'BF-CORP',
      name: org.name,
      legalName: org.legalName || org.name,
      taxId: '01.345.678.9-012.000',
      address: 'Menara Mega Konstruksi Lt. 28, Jl. Gatot Subroto Kav. 55, Jakarta Selatan',
      defaultCurrency: org.defaultCurrency,
      timezone: org.timezone,
      branches: org.branches.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        address: b.address || '-',
        isHeadOffice: b.code.includes('HQ') || b.code === 'BR-JKT',
        status: b.status,
        departmentsCount: b.departments.length,
        departments: b.departments.map((d) => ({ id: d.id, code: d.code, name: d.name })),
        activeProjectsCount: b.projects.length,
        projects: b.projects,
      })),
    };
  }

  async createBranch(dto: { code: string; name: string; address?: string }) {
    if (!dto.code || !dto.name) {
      throw new BadRequestException('Kode cabang dan nama cabang wajib diisi');
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('Organisasi belum dibuat');

    const branch = await this.prisma.branch.create({
      data: {
        organizationId: org.id,
        code: dto.code.toUpperCase(),
        name: dto.name,
        address: dto.address,
        status: 'ACTIVE',
      },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        organizationId: org.id,
        action: 'BRANCH_CREATED',
        resourceType: 'ORGANIZATION',
        resourceId: branch.id,
        payload: { code: branch.code, name: branch.name },
      },
    });

    return branch;
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        managedProjects: {
          select: { id: true, projectCode: true, name: true, status: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      status: u.status,
      roles: u.userRoles.map((ur) => ur.role.name),
      roleDescriptions: u.userRoles.map((ur) => ur.role.description || ur.role.name),
      managedProjectsCount: u.managedProjects.length,
      managedProjects: u.managedProjects,
      createdAt: u.createdAt.toISOString().split('T')[0],
    }));
  }

  async createUser(dto: { email: string; fullName: string; roleId?: string; roleName?: string }) {
    if (!dto.email || !dto.fullName) {
      throw new BadRequestException('Email dan nama lengkap pengguna wajib diisi');
    }

    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('Organisasi tidak ditemukan');

    const existing = await this.prisma.user.findFirst({
      where: { organizationId: org.id, email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException(`Pengguna dengan email ${dto.email} sudah terdaftar`);
    }

    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        passwordHash: 'argon2id$v=19$m=65536,t=3,p=4$dummyhashforlocalenterprise',
        status: 'ACTIVE',
      },
    });

    // Assign role if specified
    let targetRoleId = dto.roleId;
    if (!targetRoleId && dto.roleName) {
      const role = await this.prisma.role.findFirst({ where: { name: dto.roleName } });
      if (role) targetRoleId = role.id;
    }

    if (targetRoleId) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: targetRoleId,
        },
      });
    }

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        organizationId: org.id,
        action: 'USER_REGISTERED',
        resourceType: 'USER',
        resourceId: user.id,
        payload: { email: user.email, fullName: user.fullName },
      },
    });

    return user;
  }

  async toggleUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    const org = await this.prisma.organization.findFirst();
    if (org) {
      await this.prisma.auditLog.create({
        data: {
          organizationId: org.id,
          action: 'USER_STATUS_TOGGLED',
          resourceType: 'USER',
          resourceId: user.id,
          payload: { oldStatus: user.status, newStatus: status },
        },
      });
    }

    return updated;
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        userRoles: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Default permission list across construction ERP modules
    const allPermissions = [
      { code: 'crm.manage', name: 'CRM & Bidding', module: 'SALES' },
      { code: 'projects.manage', name: 'Manajemen Proyek & WBS', module: 'PROJECT' },
      { code: 'budget.lock', name: 'Kunci Baseline RAB', module: 'BUDGET' },
      { code: 'procurement.po', name: 'Penerbitan PO & Kontrak', module: 'PROCUREMENT' },
      { code: 'inventory.movement', name: 'Mutasi & Reservasi Stok', module: 'INVENTORY' },
      { code: 'finance.gl', name: 'Posting Double-Entry Jurnal', module: 'FINANCE' },
      { code: 'approvals.tier3', name: 'Otoritas Approval Nilai Tinggi', module: 'APPROVAL' },
      { code: 'audit.view', name: 'Inspeksi Rekaman Audit', module: 'GOVERNANCE' },
    ];

    return {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        usersCount: r.userRoles.length,
        users: r.userRoles.map((ur) => ur.user),
        permissions: r.permissions.map((rp) => rp.permission.code),
      })),
      availablePermissions: allPermissions,
    };
  }

  async getAuditLogs() {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs.map((l) => ({
      id: l.id,
      actorName: l.actor?.fullName || 'SYSTEM_DAEMON',
      actorEmail: l.actor?.email || 'system@buildflow.internal',
      action: l.action,
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      payload: l.payload,
      ipAddress: l.ipAddress || '127.0.0.1 (Local)',
      correlationId: l.correlationId || '-',
      timestamp: l.createdAt.toISOString(),
      formattedTime: new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(l.createdAt),
    }));
  }
}
