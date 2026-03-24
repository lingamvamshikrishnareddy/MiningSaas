import { 
  format, 
  parseISO, 
  isValid, 
  addDays, 
  addHours,
  addMonths,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

/**
 * Format date to standard string
 */
export const formatDate = (date: Date | string, formatString: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Format datetime to standard string
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Check if date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfMonth(dateObj);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfMonth(dateObj);
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Subtract days from a date
 */
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subDays(dateObj, days);
};

/**
 * Add months to a date
 */
export const addMonthsToDate = (date: Date | string, months: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(dateObj, months);
};

/**
 * Subtract months from a date
 */
export const subtractMonthsFromDate = (date: Date | string, months: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return subMonths(dateObj, months);
};

/**
 * Get difference in days between two dates
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d1, d2);
};

/**
 * Get difference in hours between two dates
 */
export const getHoursDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(d1, d2);
};

/**
 * Get difference in minutes between two dates
 */
export const getMinutesDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInMinutes(d1, d2);
};

/**
 * Get date range for common periods
 */
export const getDateRange = (period: 'today' | 'yesterday' | 'week' | 'month' | 'year'): {
  startDate: Date;
  endDate: Date;
} => {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    case 'week':
      return {
        startDate: subDays(now, 7),
        endDate: now,
      };
    case 'month':
      return {
        startDate: subMonths(now, 1),
        endDate: now,
      };
    case 'year':
      return {
        startDate: subMonths(now, 12),
        endDate: now,
      };
    default:
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };
  }
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
};

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Convert hours to milliseconds
 */
export const hoursToMilliseconds = (hours: number): number => {
  return hours * 60 * 60 * 1000;
};

/**
 * Convert days to milliseconds
 */
export const daysToMilliseconds = (days: number): number => {
  return days * 24 * 60 * 60 * 1000;
};