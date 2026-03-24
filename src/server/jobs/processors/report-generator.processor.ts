import { Job } from 'bull';
import logger from '../../utils/logger.util';

export interface ReportGeneratorJob {
  type: 'daily_summary' | 'weekly_report' | 'monthly_report';
  organizationId: string;
  siteId?: string;
}

export const reportGeneratorProcessor = async (job: Job<ReportGeneratorJob>) => {
  const { type, organizationId } = job.data;
  logger.info(`Generating report: ${type} for org: ${organizationId}`);
  // Report generation logic would go here
  return { generated: true, type, organizationId };
};
