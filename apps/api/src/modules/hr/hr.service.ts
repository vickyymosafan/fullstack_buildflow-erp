import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class HRService {
  constructor(private prisma: PrismaService) {}

  async getEmployees() {
    const employees = await this.prisma.employee.findMany({
      include: {
        department: true,
        timesheets: {
          select: { id: true, hoursWorked: true, overtimeHours: true },
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    return employees.map((emp) => {
      const totalHours = emp.timesheets.reduce(
        (sum, t) => sum + Number(t.hoursWorked) + Number(t.overtimeHours),
        0
      );
      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        jobTitle: emp.jobTitle,
        departmentCode: emp.department?.code || '-',
        departmentName: emp.department?.name || '-',
        status: emp.status,
        totalHoursLogged: totalHours,
        timesheetCount: emp.timesheets.length,
      };
    });
  }

  async getTimesheets(limit = 50) {
    const timesheets = await this.prisma.timesheet.findMany({
      take: limit,
      include: {
        employee: {
          include: { department: true },
        },
        project: true,
      },
      orderBy: { workDate: 'desc' },
    });

    return timesheets.map((t) => {
      const regularWage = Number(t.dailyWage);
      const hourlyRate = regularWage / 8;
      const overtimeWage = Number(t.overtimeHours) * hourlyRate * 1.5;
      const totalGrossPay = regularWage + overtimeWage;

      return {
        id: t.id,
        employeeCode: t.employee.employeeCode,
        employeeName: t.employee.fullName,
        jobTitle: t.employee.jobTitle,
        departmentName: t.employee.department?.name || '-',
        projectCode: t.project?.projectCode || 'PRJ-2026-LRT',
        workDate: t.workDate,
        hoursWorked: Number(t.hoursWorked),
        overtimeHours: Number(t.overtimeHours),
        taskCategory: t.taskCategory,
        status: t.status,
        dailyWage: regularWage,
        overtimePay: Math.round(overtimeWage),
        totalGrossPay: Math.round(totalGrossPay),
        notes: t.notes,
      };
    });
  }

  async getSummary() {
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
    });

    const timesheets = await this.prisma.timesheet.findMany();

    const totalHeadcount = employees.length;
    let totalHoursWorked = 0;
    let totalWageExpense = 0;

    for (const t of timesheets) {
      const regularHours = Number(t.hoursWorked);
      const otHours = Number(t.overtimeHours);
      totalHoursWorked += regularHours + otHours;

      const regularWage = Number(t.dailyWage);
      const hourlyRate = regularWage / 8;
      const otPay = otHours * hourlyRate * 1.5;
      totalWageExpense += regularWage + otPay;
    }

    const todayStr = new Date('2026-10-31').toISOString().split('T')[0];
    const todayRecords = timesheets.filter(
      (t) => t.workDate.toISOString().split('T')[0] === todayStr
    );

    return {
      totalHeadcount,
      activeOnSiteToday: todayRecords.length,
      totalHoursWorked,
      totalWageExpense: Math.round(totalWageExpense),
      attendanceRate:
        totalHeadcount > 0
          ? Math.round((todayRecords.length / totalHeadcount) * 100)
          : 0,
    };
  }

  async createTimesheet(dto: CreateTimesheetDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeCode: dto.employeeCode },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan kode ${dto.employeeCode} tidak ditemukan`);
    }

    let projectId: string | undefined;
    const lrtProject = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode || 'PRJ-2026-LRT' },
    });
    if (lrtProject) projectId = lrtProject.id;

    const workDate = new Date(dto.workDate);

    // Upsert timesheet for this employee on this date
    return this.prisma.timesheet.upsert({
      where: {
        employeeId_workDate: {
          employeeId: employee.id,
          workDate,
        },
      },
      update: {
        hoursWorked: dto.hoursWorked,
        overtimeHours: dto.overtimeHours,
        taskCategory: dto.taskCategory,
        dailyWage: dto.dailyWage,
        notes: dto.notes,
        status: 'APPROVED',
      },
      create: {
        employeeId: employee.id,
        projectId,
        workDate,
        hoursWorked: dto.hoursWorked,
        overtimeHours: dto.overtimeHours,
        taskCategory: dto.taskCategory,
        dailyWage: dto.dailyWage,
        notes: dto.notes,
        status: 'APPROVED',
      },
    });
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeCode: dto.employeeCode },
    });
    if (existing) {
      throw new ConflictException(`Kode pegawai ${dto.employeeCode} sudah digunakan`);
    }

    let departmentId: string | undefined;
    if (dto.departmentCode) {
      const dep = await this.prisma.department.findFirst({
        where: { code: dto.departmentCode },
      });
      if (dep) departmentId = dep.id;
    }

    return this.prisma.employee.create({
      data: {
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        jobTitle: dto.jobTitle,
        departmentId,
        status: 'ACTIVE',
      },
    });
  }
}

