export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { message: string; details?: any };
  meta?: { pagination?: PaginationMeta };
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

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface QueryState {
  isLoading: boolean;
  isError: boolean;
  error?: string;
}
