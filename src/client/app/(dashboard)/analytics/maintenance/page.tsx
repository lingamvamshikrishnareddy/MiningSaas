'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wrench, TrendingUp, BarChart2 } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatCurrency, formatEnumLabel } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export default function MaintenanceAnalyticsPage() {
  const router = useRouter();

  const { data: costTrendData, isLoading } = useQuery({
    queryKey: ['analytics', 'maintenance-cost-trend'],
    queryFn: () =>
      analyticsApi.getMaintenanceCostTrend().then((r) => r.data?.data ?? {}),
  });

  const data = costTrendData as any;

  // Trend line chart data
  const trendData = (data?.trend ?? data?.costTrend ?? []).map((point: any) => ({
    label: point.month ?? point.period ?? point.date,
    value: point.cost ?? point.total ?? 0,
  }));

  // By type bar chart data
  const byTypeData = Object.entries(data?.byType ?? {}).map(
    ([type, cost]) => ({
      label: formatEnumLabel(type),
      value: typeof cost === 'number' ? cost : 0,
    })
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading maintenance analytics..." />
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
          <h1 className="text-2xl font-bold tracking-tight">
            Maintenance Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Cost trends and breakdown by maintenance type
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Cost (MTD)',
              value: formatCurrency(data.summary.totalMtd ?? data.summary.thisMonth),
            },
            {
              label: 'Total Cost (YTD)',
              value: formatCurrency(data.summary.totalYtd ?? data.summary.thisYear),
            },
            {
              label: 'Avg Cost per Job',
              value: formatCurrency(data.summary.avgCostPerJob),
            },
            {
              label: 'Total Jobs',
              value: String(data.summary.totalJobs ?? 0),
            },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Maintenance Cost Trend
          </CardTitle>
          <CardDescription>Monthly maintenance costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No trend data available"
              description="Cost trend data is not available yet."
            />
          ) : (
            <div className="h-72">
              <LineChart
                data={trendData}
                xKey="label"
                yKey="value"
                title="Cost (USD)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            Cost by Maintenance Type
          </CardTitle>
          <CardDescription>
            Total spend broken down by maintenance category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {byTypeData.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No type breakdown available"
              description="Cost by type data is not available."
            />
          ) : (
            <div className="h-72">
              <BarChart
                data={byTypeData}
                xKey="label"
                yKey="value"
                title="Cost (USD)"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
