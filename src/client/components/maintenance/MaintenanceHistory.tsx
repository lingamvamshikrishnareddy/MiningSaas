'use client';

import Link from 'next/link';
import { CheckCircle, Clock, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MaintenanceResponse } from '@/types/maintenance.types';
import { MAINTENANCE_STATUS_COLORS } from '@/lib/constants';

interface MaintenanceHistoryProps {
  records: MaintenanceResponse[];
}

export default function MaintenanceHistory({ records }: MaintenanceHistoryProps) {
  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Link key={record.id} href={`/maintenance/${record.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{record.equipment?.name || 'Unknown Equipment'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${MAINTENANCE_STATUS_COLORS[record.status]}`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{record.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(record.completedAt || record.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {record.maintenanceType}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
