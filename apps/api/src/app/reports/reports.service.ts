import { Injectable, OnModuleInit } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { GetActivityStats } from '../notifications/usecases/get-activity-stats/get-activity-stats.usecase';
import { GetActivityStatsCommand } from '../notifications/usecases/get-activity-stats/get-activity-stats.command';
import cron from 'node-cron';
import { GetOrganizations } from '../organization/usecases/get-organizations/get-organizations.usecase';
import { GetMembers } from '../organization/usecases/membership/get-members/get-members.usecase';
import { GetMembersCommand } from '../organization/usecases/membership/get-members/get-members.command';
import { MemberRoleEnum, ApiAuthSchemeEnum } from '@novu/shared';
import { MailService } from '../shared/services/mail/mail.service';
import { EnvironmentRepository } from '@novu/dal';

@Injectable()
export class ReportsService implements OnModuleInit {
  private environmentRepository = new EnvironmentRepository();

  constructor(
    private getActivityStats: GetActivityStats,
    private getOrganizations: GetOrganizations,
    private getMembers: GetMembers,
    private mailService: MailService
  ) {}

  async onModuleInit() {
    // Schedule: Every Monday at 8am
    cron.schedule('0 8 * * 1', async () => {
      try {
        // Fetch all organizations (for demo, use a system userId or similar)
        const organizations = await this.getOrganizations.execute({ userId: '' });
        for (const org of organizations) {
          // Fetch all members and filter admins
          const members = await this.getMembers.execute(
            GetMembersCommand.create({
              user: {
                _id: 'system',
                organizationId: org._id,
                permissions: [],
                scheme: ApiAuthSchemeEnum.BEARER,
                environmentId: '',
                roles: [MemberRoleEnum.OSS_ADMIN],
              },
              userId: 'system',
              organizationId: org._id,
            })
          );
          const adminEmails = members
            .filter((m) => m.roles?.includes(MemberRoleEnum.OSS_ADMIN) && m.user?.email)
            .map((m) => m.user.email);
          if (!adminEmails.length) continue;

          // Generate report for this org's default environment
          const environments = await this.environmentRepository.findOrganizationEnvironments(org._id);
          const environmentId = environments.length > 0 ? environments[0]._id : undefined;
          if (!environmentId) continue;
          const buffer = await this.generateReport('pdf', { organizationId: org._id, environmentId });

          // Email the report as attachment
          await this.mailService.sendMail({
            to: adminEmails,
            from: { name: 'Novu Reports', email: 'no-reply@novu.co' },
            subject: 'Weekly Notification Report',
            text: 'Please find attached your weekly notification report.',
            attachments: [
              {
                content: buffer.toString(),
                filename: 'weekly-report.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
              },
            ],
          });
        }
      } catch (err) {
        console.error('[Scheduled Report] Error during scheduled report delivery:', err);
      }
    });
  }

  async generateReport(
    format: 'pdf' | 'excel',
    options: { organizationId: string; environmentId: string }
  ): Promise<Uint8Array> {
    // Aggregate real data from notification statistics
    const stats = await this.getActivityStats.execute(
      GetActivityStatsCommand.create({
        organizationId: options.organizationId,
        environmentId: options.environmentId,
      })
    );

    console.log('Stats:', stats); // Log all available fields

    const data = [
      { label: 'Weekly Sent', value: stats.weeklySent },
      { label: 'Monthly Sent', value: stats.monthlySent },
    ];

    if (format === 'pdf') {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {});
      doc.fontSize(18).text('Notification Report', { align: 'center' });
      doc.moveDown();
      data.forEach((item) => {
        doc.fontSize(12).text(`${item.label}: ${item.value}`);
      });
      doc.end();
      return await new Promise<Uint8Array>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      });
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');
      worksheet.columns = [
        { header: 'Metric', key: 'label', width: 30 },
        { header: 'Value', key: 'value', width: 15 },
      ];
      data.forEach((item) => worksheet.addRow(item));
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }
  }
}
