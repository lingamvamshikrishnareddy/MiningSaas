import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_SIZE || '20');
const MAX_LIMIT = parseInt(process.env.MAX_PAGE_SIZE || '100');

/**
 * Extract pagination parameters from request
 */
export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Calculate pagination metadata
 */
export const getPaginationMeta = (
  page: number,
  limit: number,
  totalCount: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    totalCount,
    perPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  totalCount: number
): PaginatedResponse<T> => {
  return {
    data,
    meta: getPaginationMeta(page, limit, totalCount),
  };
};

/**
 * Get Prisma pagination object
 */
export const getPrismaPagination = (params: PaginationParams) => {
  return {
    skip: params.skip,
    take: params.limit,
  };
};

/**
 * Extract sorting parameters from request
 */
export interface SortParams {
  orderBy: Record<string, 'asc' | 'desc'>;
}

export const getSortParams = (
  req: Request,
  allowedFields: string[] = [],
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortParams => {
  const sortBy = (req.query.sortBy as string) || defaultField;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || defaultOrder;

  // Validate sort field
  const field = allowedFields.length > 0 && !allowedFields.includes(sortBy)
    ? defaultField
    : sortBy;

  return {
    orderBy: { [field]: sortOrder },
  };
};

/**
 * Extract filter parameters from request
 */
export const getFilterParams = (
  req: Request,
  allowedFilters: string[] = []
): Record<string, any> => {
  const filters: Record<string, any> = {};

  allowedFilters.forEach((filter) => {
    if (req.query[filter] !== undefined) {
      filters[filter] = req.query[filter];
    }
  });

  return filters;
};

/**
 * Build Prisma where clause from search term
 */
export const buildSearchWhere = (
  searchTerm: string | undefined,
  searchFields: string[]
): any => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }

  return {
    OR: searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    })),
  };
};