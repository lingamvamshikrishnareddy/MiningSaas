import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  meta?: any;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: any
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  meta?: any
): Response => {
  return sendSuccess(res, data, 201, meta);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Send bad request error (400)
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  details?: any
): Response => {
  return sendError(res, message, 400, details);
};

/**
 * Send unauthorized error (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden error (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): Response => {
  return sendError(res, message, 403);
};

/**
 * Send not found error (404)
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return sendError(res, message, 404);
};

/**
 * Send conflict error (409)
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource conflict'
): Response => {
  return sendError(res, message, 409);
};

/**
 * Send internal server error (500)
 */
export const sendServerError = (
  res: Response,
  message: string = 'Internal server error',
  details?: any
): Response => {
  return sendError(res, message, 500, details);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
): Response => {
  return sendSuccess(res, data, 200, { pagination: meta });
};