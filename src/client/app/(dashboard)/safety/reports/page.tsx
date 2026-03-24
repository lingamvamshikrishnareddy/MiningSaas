'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { formatEnumLabel } from '@/lib/formatters';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export default function SafetyReportsPage() {
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['analytics', 'safety-metrics'],
    queryFn: () => analyticsApi.getSafetyMetrics().then((r) => r.data?.data ?? {}),
  });

  const metrics = metricsData as any;

  // Normalise incident trend for LineChart
  const trendData = (metrics?.incidentTrend ?? []).map((point: any) => ({
    label: point.month ?? point.period ?? point.date,
    value: point.count ?? point.total ?? 0,
  }));

  // By type for PieChart
  const byTypeData = Object.entries(metrics?.byType ?? {}).map(
    ([type, count]) => ({
      label: formatEnumLabel(type),
      value: count as number,
    })
  );

  // By severity for BarChart
  const bySeverityData = Object.entries(metrics?.bySeverity ?? {}).map(
    ([severity, count]) => ({
      label: formatEnumLabel(severity),
      value: count as number,
    })
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading safety reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Safety Reports</h1>
        <p className="text-sm text-muted-foreground">
          Visualise incident trends, types, and severity distributions
        </p>
      </div>

      {/* Summary KPIs */}
      {metrics?.summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Incidents', value: metrics.summary.total ?? 0 },
            { label: 'This Month', value: metrics.summary.thisMonth ?? 0 },
            { label: 'Open', value: metrics.summary.open ?? 0 },
            { label: 'Closed', value: metrics.summary.closed ?? 0 },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Incident Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Incident Trend
          </CardTitle>
          <CardDescription>Monthly incident count over time</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No trend data available"
              description="Not enough data to display the incident trend."
            />
          ) : (
            <div className="h-72">
              <LineChart
                data={trendData}
                xKey="label"
                yKey="value"
                title="Incidents per Month"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-purple-500" />
              Incidents by Type
            </CardTitle>
            <CardDescription>
              Distribution of incidents across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {byTypeData.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No type data available"
                description="No incident type breakdown available."
              />
            ) : (
              <div className="h-72">
                <PieChart data={byTypeData} nameKey="label" valueKey="value" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-500" />
              Incidents by Severity
            </CardTitle>
            <CardDescription>
              Count of incidents at each severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bySeverityData.length === 0 ? (
              <EmptyState
                icon={BarChart2}
                title="No severity data available"
                description="No severity breakdown available."
              />
            ) : (
              <div className="h-72">
                <BarChart
                  data={bySeverityData}
                  xKey="label"
                  yKey="value"
                  title="By Severity"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
