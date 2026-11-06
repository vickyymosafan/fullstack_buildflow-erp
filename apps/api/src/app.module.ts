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
import { DocumentsModule } from './modules/documents/documents.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CrmModule } from './modules/crm/crm.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OrchestrationModule } from './modules/orchestration/orchestration.module';
import { HseModule } from './modules/hse/hse.module';
import { SubcontractorsModule } from './modules/subcontractors/subcontractors.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { ChangeOrdersModule } from './modules/change-orders/change-orders.module';
import { OfficialReportsModule } from './modules/official-reports/official-reports.module';
import { JointOperationsModule } from './modules/joint-operations/joint-operations.module';
import { HandoverModule } from './modules/handover/handover.module';
import { CloseoutModule } from './modules/closeout/closeout.module';
import { ExecutiveBiModule } from './modules/executive-bi/executive-bi.module';
import { SustainabilityModule } from './modules/sustainability/sustainability.module';
import { VendorPortalModule } from './modules/vendor-portal/vendor-portal.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { BimModule } from './modules/bim/bim.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { DisasterRecoveryModule } from './modules/disaster-recovery/disaster-recovery.module';

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
    HseModule,
    SubcontractorsModule,
    EquipmentModule,
    ChangeOrdersModule,
    OfficialReportsModule,
    JointOperationsModule,
    HandoverModule,
    CloseoutModule,
    ExecutiveBiModule,
    SustainabilityModule,
    VendorPortalModule,
    TreasuryModule,
    BimModule,
    ContractsModule,
    DisasterRecoveryModule,
    DocumentsModule,
    AnalyticsModule,
    CrmModule,
    SettingsModule,
    OrchestrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
