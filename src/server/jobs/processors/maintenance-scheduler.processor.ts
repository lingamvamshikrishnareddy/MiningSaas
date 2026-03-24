import { Job } from 'bull';
import prisma from '../../db/prisma';
import logger from '../../utils/logger.util';

export interface MaintenanceSchedulerJob {
  type: 'check_overdue' | 'schedule_preventive';
  organizationId?: string;
}

export const maintenanceSchedulerProcessor = async (job: Job<MaintenanceSchedulerJob>) => {
  const { type } = job.data;
  logger.info(`Processing maintenance job: ${type}`);

  if (type === 'check_overdue') {
    const result = await prisma.maintenanceRecord.updateMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    });
    logger.info(`Marked ${result.count} maintenance records as overdue`);
    return { markedOverdue: result.count };
  }

  return { processed: true };
};
