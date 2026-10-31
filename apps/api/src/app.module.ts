import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { SiteReportsModule } from './modules/site-reports/site-reports.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    BudgetsModule,
    SiteReportsModule,
    ApprovalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
