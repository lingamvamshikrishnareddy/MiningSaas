import { maintenanceQueue, reportQueue, analyticsQueue } from './queue';
import { maintenanceSchedulerProcessor } from './processors/maintenance-scheduler.processor';
import { reportGeneratorProcessor } from './processors/report-generator.processor';
import { dataAggregationProcessor } from './processors/data-aggregation.processor';
import { setupDailyKPIScheduler } from './schedulers/daily-kpi.scheduler';
import { setupNotificationScheduler } from './schedulers/notification.scheduler';
import logger from '../utils/logger.util';

export const setupJobs = () => {
  // Register processors
  maintenanceQueue.process(maintenanceSchedulerProcessor);
  reportQueue.process(reportGeneratorProcessor);
  analyticsQueue.process(dataAggregationProcessor);

  // Setup schedulers
  setupDailyKPIScheduler();
  setupNotificationScheduler();

  logger.info('Job queues and schedulers initialized');
};

export { maintenanceQueue, reportQueue, analyticsQueue };
