import { cn } from '../../lib/utils';
import { formatEnumLabel } from '../../lib/formatters';
import {
  EQUIPMENT_STATUS_COLORS,
  MAINTENANCE_STATUS_COLORS,
  INCIDENT_SEVERITY_COLORS,
  PRIORITY_COLORS,
} from '../../lib/constants';

type BadgeType = 'equipment' | 'maintenance' | 'severity' | 'priority' | 'custom';

interface StatusBadgeProps {
  value: string;
  type?: BadgeType;
  className?: string;
  customColors?: Record<string, string>;
}

const getColorClasses = (value: string, type: BadgeType, customColors?: Record<string, string>): string => {
  if (customColors) return customColors[value] || 'bg-gray-100 text-gray-800';
  switch (type) {
    case 'equipment': return EQUIPMENT_STATUS_COLORS[value] || 'bg-gray-100 text-gray-800';
    case 'maintenance': return MAINTENANCE_STATUS_COLORS[value] || 'bg-gray-100 text-gray-800';
    case 'severity': return INCIDENT_SEVERITY_COLORS[value] || 'bg-gray-100 text-gray-800';
    case 'priority': return PRIORITY_COLORS[value] || 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function StatusBadge({ value, type = 'custom', className, customColors }: StatusBadgeProps) {
  const colorClasses = getColorClasses(value, type, customColors);
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClasses, className)}>
      {formatEnumLabel(value)}
    </span>
  );
}
