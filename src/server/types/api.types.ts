export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  timestamp?: string;
  version?: string;
  [key: string]: any;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type PaginationQuery = PaginationParams;
export type PaginationMetadata = PaginationMeta;

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalCount: total,
    perPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export interface DateRangeParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

export interface FilterParams {
  [key: string]: any;
}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: {
    index: number;
    error: string;
  }[];
}

export interface ExportParams {
  format: 'csv' | 'xlsx' | 'pdf';
  fields?: string[];
  filters?: FilterParams;
}

export interface ImportResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors?: {
    row: number;
    error: string;
  }[];
}