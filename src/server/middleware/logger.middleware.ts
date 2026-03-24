import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
      userId: req.user?.id || 'anonymous',
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', logData);
    } else {
      logger.info('Request', logData);
    }
  });

  next();
};

/**
 * Detailed request logger (for debugging)
 */
export const detailedRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  logger.debug('Incoming Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress,
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug('Response Sent', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};