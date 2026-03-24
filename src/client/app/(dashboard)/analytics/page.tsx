'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  Truck,
  Wrench,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import {
  formatPercentage,
  formatCurrency,
  formatNumber,
} from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AnalyticsPage() {
  const router = useRouter();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard().then((r) => r.data?.data ?? {}),
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['analytics', 'kpi'],
    queryFn: () => analyticsApi.getKPI().then((r) => r.data?.data ?? {}),
  });

  const isLoading = dashboardLoading || kpiLoading;
  const kpi = kpiData as any;
  const dashboard = dashboardData as any;

  const kpis = [
    {
      title: 'Equipment Utilization',
      value: formatPercentage(kpi?.equipmentUtilization ?? dashboard?.equipmentUtilization),
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Average across all active equipment',
      href: '/analytics/fleet',
    },
    {
      title: 'Production This Month',
      value: formatNumber(kpi?.productionThisMonth ?? dashboard?.productionThisMonth),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Total tonnes mined',
      href: '/analytics/production',
    },
    {
      title: 'Maintenance Costs',
      value: formatCurrency(kpi?.maintenanceCosts ?? dashboard?.maintenanceCosts),
      icon: Wrench,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: "This month's maintenance spend",
      href: '/analytics/maintenance',
    },
    {
      title: 'Active Incidents',
      value: String(kpi?.activeIncidents ?? dashboard?.activeIncidents ?? 0),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Open safety incidents',
      href: '/safety/incidents',
    },
  ];

  const subPages = [
    {
      title: 'Fleet Analytics',
      description: 'Equipment utilization and status distribution',
      icon: Truck,
      href: '/analytics/fleet',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Maintenance Analytics',
      description: 'Cost trends and maintenance breakdowns',
      icon: Wrench,
      href: '/analytics/maintenance',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Production Analytics',
      description: 'Production trends by time and site',
      icon: TrendingUp,
      href: '/analytics/production',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Operational insights across fleet, maintenance, and production
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading analytics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(kpi.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold truncate">{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {kpi.description}
                    </p>
                  </div>
                  <div className={`rounded-full p-2 ${kpi.bg} ml-3 flex-shrink-0`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sub-page Navigation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Analytics Sections</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {subPages.map((page) => (
            <Card
              key={page.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(page.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`rounded-full p-2 ${page.bg}`}>
                    <page.icon className={`h-6 w-6 ${page.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-3">{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(page.href);
                  }}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional dashboard metrics */}
      {dashboard && Object.keys(dashboard).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Overview Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {dashboard.totalEquipment !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Total Equipment</p>
                  <p className="text-xl font-bold">{dashboard.totalEquipment}</p>
                </div>
              )}
              {dashboard.operationalEquipment !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Operational</p>
                  <p className="text-xl font-bold">{dashboard.operationalEquipment}</p>
                </div>
              )}
              {dashboard.maintenanceDue !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance Due</p>
                  <p className="text-xl font-bold">{dashboard.maintenanceDue}</p>
                </div>
              )}
              {dashboard.totalSites !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Active Sites</p>
                  <p className="text-xl font-bold">{dashboard.totalSites}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
