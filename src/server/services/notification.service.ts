import logger from '../utils/logger.util';

class NotificationService {
  async sendNotification(userId: string, message: string): Promise<void> {
    // Notification sending not implemented - log instead
    logger.info(`[Notification stub] User: ${userId}, Message: ${message}`);
  }
}

export default new NotificationService();
