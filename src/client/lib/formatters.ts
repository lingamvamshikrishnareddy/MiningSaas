import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined, pattern = 'dd MMM yyyy'): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, pattern);
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, 'dd MMM yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount: number | null | undefined, currency = 'USD'): string => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatNumber = (value: number | null | undefined, decimals = 0): string => {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);
};

export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value == null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatWeight = (tonnes: number | null | undefined): string => {
  if (tonnes == null) return 'N/A';
  if (tonnes >= 1000000) return `${(tonnes / 1000000).toFixed(2)}Mt`;
  if (tonnes >= 1000) return `${(tonnes / 1000).toFixed(2)}kt`;
  return `${tonnes.toFixed(2)}t`;
};

export const formatHours = (hours: number | null | undefined): string => {
  if (hours == null) return 'N/A';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatEnumLabel = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
