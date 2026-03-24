'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Bell,
  Clock,
  ArrowRight,
  Activity,
  Zap,
} from 'lucide-react';
import { analyticsApi, maintenanceApi, equipmentApi } from '@/lib/api';
import {
  formatDate,
  formatRelativeTime,
  formatEnumLabel,
  formatNumber,
} from '@/lib/formatters';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard().then((r) => r.data?.data ?? {}),
    refetchInterval: 60_000,
  });

  const { data: upcomingMaintenance = [], isLoading: maintenanceLoading } =
    useQuery({
      queryKey: ['maintenance', 'upcoming', 7],
      queryFn: () =>
        maintenanceApi.getUpcoming(7).then((r) => {
          const d = (r as any).data?.data;
          return Array.isArray(d) ? d : [];
        }),
    });

  const { data: fleetOverview, isLoading: fleetLoading } = useQuery({
    queryKey: ['equipment', 'fleet-overview'],
    queryFn: () =>
      equipmentApi.getFleetOverview().then((r) => r.data?.data ?? {}),
  });

  const dashboard = dashboardData as any;
  const fleet = fleetOverview as any;

  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? 'there';

  const kpis = [
    {
      title: 'Active Equipment',
      value: formatNumber(
        dashboard?.activeEquipment ?? fleet?.operational ?? 0
      ),
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      href: ROUTES.EQUIPMENT,
    },
    {
      title: 'Maintenance Due',
      value: formatNumber(
        dashboard?.maintenanceDue ?? (upcomingMaintenance as any[]).length
      ),
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      href: ROUTES.MAINTENANCE,
    },
    {
      title: 'Production Today',
      value: `${formatNumber(dashboard?.productionToday ?? 0)} t`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      href: ROUTES.PRODUCTION,
    },
    {
      title: 'Active Incidents',
      value: formatNumber(dashboard?.activeIncidents ?? 0),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      gradient: 'from-red-500 to-rose-500',
      shadow: 'shadow-red-500/20',
      href: ROUTES.SAFETY,
    },
  ];

  // Fleet status bar chart data
  const fleetStatusData = Object.entries(
    fleet?.byStatus ?? dashboard?.fleetStatus ?? {}
  ).map(([status, count]) => ({
    label: formatEnumLabel(status),
    value: count as number,
  }));

  // Production trend for last 7 days
  const productionTrend = (
    dashboard?.productionTrend ??
    dashboard?.weeklyProduction ??
    []
  ).map((point: any) => ({
    label: point.date ?? point.period ?? point.day,
    value: point.quantity ?? point.total ?? 0,
  }));

  // Active telemetry alerts
  const alerts: any[] = dashboard?.alerts ?? dashboard?.activeAlerts ?? [];

  const isLoading = dashboardLoading || fleetLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-amber-600">{firstName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening across your mining operations today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">Systems Online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">Real-time Data</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading dashboard..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(kpi.href)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fleet Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    Fleet Overview
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Equipment count by operational status
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => router.push(ROUTES.EQUIPMENT)}
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {fleetLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : fleetStatusData.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="No fleet data"
                  description="Fleet overview data is not available."
                />
              ) : (
                <div className="h-64">
                  <BarChart
                    data={fleetStatusData}
                    xKey="label"
                    yKey="value"
                    title="Equipment Count"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production Trend */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-emerald-50">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    Production Trend
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Daily production for the last 7 days
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => router.push(ROUTES.PRODUCTION)}
                >
                  Details
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {dashboardLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : productionTrend.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No production data"
                  description="Production trend data is not available."
                />
              ) : (
                <div className="h-64">
                  <LineChart
                    data={productionTrend}
                    xKey="label"
                    yKey="value"
                    title="Tonnes"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Maintenance */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  Upcoming Maintenance
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500"
                  onClick={() => router.push(ROUTES.MAINTENANCE)}
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {maintenanceLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (upcomingMaintenance as any[]).length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted-foreground text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-slate-300" />
                  </div>
                  No upcoming maintenance in the next 7 days.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(upcomingMaintenance as any[]).slice(0, 5).map((m: any) => (
                    <li
                      key={m.id}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`${ROUTES.MAINTENANCE}/${m.id}`)
                      }
                    >
                      <div className="mt-0.5 rounded-xl bg-amber-50 p-2 flex-shrink-0">
                        <Wrench className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-slate-900">
                          {m.equipment?.name ?? 'Unknown Equipment'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatEnumLabel(m.maintenanceType)} ·{' '}
                          {formatDate(m.scheduledDate)}
                        </p>
                      </div>
                      <StatusBadge value={m.status} type="maintenance" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-50">
                  <Bell className="h-4 w-4 text-red-600" />
                </div>
                Active Alerts
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {alerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboardLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted-foreground text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-300" />
                  </div>
                  No active alerts. All systems operational.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {alerts.slice(0, 5).map((alert: any, idx: number) => (
                    <li key={alert.id ?? idx} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-red-50 p-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate text-slate-900">
                            {alert.message ?? alert.title ?? 'Alert'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {alert.equipment?.name ?? alert.equipmentName} ·{' '}
                            {alert.createdAt
                              ? formatRelativeTime(alert.createdAt)
                              : ''}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
