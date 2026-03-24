import logger from '../utils/logger.util';

class EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Email sending not implemented - log instead
    logger.info(`[Email stub] To: ${to}, Subject: ${subject}`);
  }
}

export default new EmailService();
