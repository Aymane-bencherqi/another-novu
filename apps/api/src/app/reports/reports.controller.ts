import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { UserSession } from '../notifications/../shared/framework/user.decorator';
import { UserSessionData } from '@novu/shared';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  async exportReport(@Query('format') format: 'pdf' | 'excel' = 'pdf', @Res() res: Response) {
    try {
      // Hardcode for debugging
      const organizationId = '67f30867a1b4e056c957263c';
      const environmentId = '67f30867a1b4e056c9572644';

      const reportBuffer = await this.reportsService.generateReport(format, {
        organizationId,
        environmentId,
      });
      const filename = `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      res.setHeader(
        'Content-Type',
        format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.send(reportBuffer);
    } catch (err) {
      console.error('Error in exportReport:', err);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  }
}
