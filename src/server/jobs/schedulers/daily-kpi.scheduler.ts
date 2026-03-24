import cron from 'node-cron';
import { analyticsQueue } from '../queue';
import prisma from '../../db/prisma';
import logger from '../../utils/logger.util';

export const setupDailyKPIScheduler = () => {
  // Run daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    logger.info('Running daily KPI aggregation');

    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const org of organizations) {
      await analyticsQueue.add({
        type: 'daily_kpi',
        organizationId: org.id,
      });
    }

    logger.info(`Scheduled KPI jobs for ${organizations.length} organizations`);
  });

  logger.info('Daily KPI scheduler initialized');
};
