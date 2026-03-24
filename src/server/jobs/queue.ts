import Bull from 'bull';
import redisConfig from '../config/redis';
import logger from '../utils/logger.util';

const defaultJobOptions: Bull.JobOptions = {
  removeOnComplete: 100,
  removeOnFail: 50,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

const createQueue = (name: string) => {
  const queue = new Bull(name, {
    redis: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
    },
    defaultJobOptions,
  });

  queue.on('error', (err) => {
    logger.error(`Queue ${name} error:`, err);
  });

  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} in queue ${name} failed:`, err);
  });

  return queue;
};

export const maintenanceQueue = createQueue('maintenance');
export const reportQueue = createQueue('reports');
export const analyticsQueue = createQueue('analytics');

export default { maintenanceQueue, reportQueue, analyticsQueue };
