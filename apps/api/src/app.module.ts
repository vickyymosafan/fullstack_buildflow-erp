import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

