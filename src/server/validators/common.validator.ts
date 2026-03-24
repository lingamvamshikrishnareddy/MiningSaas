import { body, param, query } from 'express-validator';

export const uuidParam = (paramName: string = 'id') =>
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`);

export const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('sortBy must be a string'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

export const dateRangeQuery = [
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
];

export const searchQuery = query('search').optional().isString().trim().isLength({ max: 100 });
