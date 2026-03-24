import cron from 'node-cron';
import { maintenanceQueue } from '../queue';
import logger from '../../utils/logger.util';

export const setupNotificationScheduler = () => {
  // Check for overdue maintenance every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Checking for overdue maintenance');
    await maintenanceQueue.add({
      type: 'check_overdue',
    });
  });

  logger.info('Notification scheduler initialized');
};
