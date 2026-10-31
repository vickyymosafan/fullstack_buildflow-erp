import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { SiteReportsModule } from './modules/site-reports/site-reports.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HRModule } from './modules/hr/hr.module';
import { QualityModule } from './modules/quality/quality.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    BudgetsModule,
    SiteReportsModule,
    ApprovalsModule,
    ProcurementModule,
    InventoryModule,
    FinanceModule,
    HRModule,
    QualityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
