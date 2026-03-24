'use client';

import Link from 'next/link';
import { CalendarDays, User, DollarSign, Wrench, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency, formatEnumLabel } from '@/lib/formatters';
import { PRIORITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { MaintenanceRecord } from '@/types/maintenance.types';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
}

export default function MaintenanceCard({ record }: MaintenanceCardProps) {
  const priorityColor = PRIORITY_COLORS[record.priority] ?? 'bg-gray-100 text-gray-800';
  const performedByName = record.performedBy
    ? record.performedBy.firstName + ' ' + record.performedBy.lastName
    : null;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">
              {record.equipment?.assetNumber ?? '—'}
            </p>
            <h3 className="font-semibold text-base leading-tight truncate">
              {record.equipment?.name ?? 'Unknown Equipment'}
            </h3>
          </div>
          <StatusBadge value={record.status} type="maintenance" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wrench className="h-3 w-3 flex-shrink-0" />
            <span>{formatEnumLabel(record.maintenanceType)}</span>
          </div>
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', priorityColor)}>
            {formatEnumLabel(record.priority)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {record.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{record.description}</p>
        )}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <span>
              <span className="font-medium text-foreground">Scheduled:</span>{' '}
              {formatDate(record.scheduledDate)}
            </span>
          </div>
          {performedByName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0 text-purple-500" />
              <span>
                <span className="font-medium text-foreground">Performed by:</span>{' '}
                {performedByName}
              </span>
            </div>
          )}
          {record.totalCost != null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 flex-shrink-0 text-green-500" />
              <span>
                <span className="font-medium text-foreground">Total Cost:</span>{' '}
                {formatCurrency(record.totalCost)}
              </span>
            </div>
          )}
        </div>
        {record.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 border-t pt-2">
            {record.notes}
          </p>
        )}
        <div className="mt-auto pt-3 border-t">
          <Link
            href={'/maintenance/' + record.id}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
