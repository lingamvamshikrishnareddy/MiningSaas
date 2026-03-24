'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, BarChart2, MapPin } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatNumber } from '@/lib/formatters';
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

export default function ProductionAnalyticsPage() {
  const router = useRouter();

  const { data: productionData, isLoading } = useQuery({
    queryKey: ['analytics', 'production-trend'],
    queryFn: () =>
      analyticsApi.getProductionTrend().then((r) => r.data?.data ?? {}),
  });

  const data = productionData as any;

  // Production over time — line chart
  const trendData = (data?.trend ?? data?.productionTrend ?? []).map(
    (point: any) => ({
      label: point.date ?? point.period ?? point.month,
      value: point.quantity ?? point.total ?? 0,
    })
  );

  // Production by site — bar chart
  const bySiteData = (data?.bySite ?? []).map((item: any) => ({
    label: item.siteName ?? item.name ?? item.site,
    value: item.quantity ?? item.total ?? 0,
  }));

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading production analytics..." />
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
            Production Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Production trends over time and by site
          </p>
        </div>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Production Today',
              value: `${formatNumber(data.summary.today)} t`,
            },
            {
              label: 'Production MTD',
              value: `${formatNumber(data.summary.thisMonth)} t`,
            },
            {
              label: 'Production YTD',
              value: `${formatNumber(data.summary.thisYear)} t`,
            },
            {
              label: 'Active Sites',
              value: String(data.summary.activeSites ?? 0),
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

      {/* Production Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Production Over Time
          </CardTitle>
          <CardDescription>Total production volume by period</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No production trend data"
              description="Production trend data is not available yet."
            />
          ) : (
            <div className="h-72">
              <LineChart
                data={trendData}
                xKey="label"
                yKey="value"
                title="Production (t)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production by Site */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Production by Site
          </CardTitle>
          <CardDescription>Total production per mining site</CardDescription>
        </CardHeader>
        <CardContent>
          {bySiteData.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No site data available"
              description="Site production data is not available."
            />
          ) : (
            <div className="h-72">
              <BarChart
                data={bySiteData}
                xKey="label"
                yKey="value"
                title="Production (t)"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
