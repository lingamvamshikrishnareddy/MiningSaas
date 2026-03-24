'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatEnumLabel, formatPercentage } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export default function FleetAnalyticsPage() {
  const router = useRouter();

  const { data: utilizationData, isLoading } = useQuery({
    queryKey: ['analytics', 'equipment-utilization'],
    queryFn: () =>
      analyticsApi.getEquipmentUtilization().then((r) => r.data?.data ?? {}),
  });

  const data = utilizationData as any;

  // Utilization by equipment type — bar chart
  const utilizationByType = Object.entries(
    data?.byType ?? {}
  ).map(([type, utilization]) => ({
    label: formatEnumLabel(type),
    value: typeof utilization === 'number' ? Math.round(utilization) : 0,
  }));

  // Equipment status distribution — pie chart
  const statusDistribution = Object.entries(
    data?.statusDistribution ?? data?.byStatus ?? {}
  ).map(([status, count]) => ({
    label: formatEnumLabel(status),
    value: count as number,
  }));

  // Array form of utilization
  const utilizationArray: any[] = data?.equipment ?? data?.byEquipment ?? [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading fleet analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/analytics')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Equipment utilization and status distribution
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Average Utilization</p>
              <p className="mt-1 text-3xl font-bold">
                {formatPercentage(data.summary.averageUtilization)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
              <p className="mt-1 text-3xl font-bold">{data.summary.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Operational</p>
              <p className="mt-1 text-3xl font-bold">{data.summary.operational ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Utilization by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              Utilization by Equipment Type
            </CardTitle>
            <CardDescription>Average utilization percentage per type</CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationByType.length === 0 ? (
              <EmptyState
                icon={BarChart2}
                title="No utilization data"
                description="Utilization data is not available."
              />
            ) : (
              <div className="h-72">
                <BarChart
                  data={utilizationByType}
                  xKey="label"
                  yKey="value"
                  title="Utilization %"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-purple-500" />
              Equipment Status Distribution
            </CardTitle>
            <CardDescription>Current status breakdown of all equipment</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No status data"
                description="Equipment status data is not available."
              />
            ) : (
              <div className="h-72">
                <PieChart
                  data={statusDistribution}
                  nameKey="label"
                  valueKey="value"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Equipment Table */}
      {utilizationArray.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Utilization Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Equipment</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Type</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {utilizationArray.map((item: any) => (
                    <tr key={item.id ?? item.equipmentId}>
                      <td className="py-2 font-medium">{item.name}</td>
                      <td className="py-2">{formatEnumLabel(item.type ?? item.equipmentType)}</td>
                      <td className="py-2">{formatEnumLabel(item.status)}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(item.utilization ?? 0, 100)}%` }}
                            />
                          </div>
                          <span>{formatPercentage(item.utilization)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
