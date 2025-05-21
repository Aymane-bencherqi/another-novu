import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { GetActivityStats } from '../notifications/usecases/get-activity-stats/get-activity-stats.usecase';
import { GetOrganizations } from '../organization/usecases/get-organizations/get-organizations.usecase';
import { GetMembers } from '../organization/usecases/membership/get-members/get-members.usecase';
import { NotificationModule } from '../notifications/notification.module';
import { OrganizationModule } from '../organization/organization.module';
import { SharedModule } from '../shared/shared.module';
import { MailModule } from '../shared/services/mail/mail.module';

@Module({
  imports: [NotificationModule, OrganizationModule, SharedModule, MailModule],
  controllers: [ReportsController],
  providers: [ReportsService, GetActivityStats, GetOrganizations, GetMembers],
  exports: [ReportsService],
})
export class ReportsModule {}
