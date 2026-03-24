'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { incidentsApi } from '@/lib/api';
import { formatDate, formatEnumLabel } from '@/lib/formatters';
import { INCIDENT_SEVERITY_COLORS, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

export default function SafetyPage() {
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['incidents', 'stats'],
    queryFn: () => incidentsApi.getStats().then((r) => r.data?.data ?? {}),
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () =>
      incidentsApi.getAll({ limit: 5, sort: 'createdAt:desc' }).then((r) => r.data?.data ?? []),
  });

  const kpis = [
    {
      title: 'Incidents This Month',
      value: (stats as any)?.thisMonth ?? 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      title: 'Days Since Last Incident',
      value: (stats as any)?.daysSinceLast ?? '—',
      icon: ShieldCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      title: 'Open Incidents',
      value: (stats as any)?.open ?? 0,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      title: 'Total This Year',
      value: (stats as any)?.thisYear ?? 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  ];

  const severityBreakdown: Record<string, number> =
    (stats as any)?.bySeverity ?? {};

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety</h1>
          <p className="text-sm text-muted-foreground">
            Monitor safety incidents and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/safety/reports')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button onClick={() => router.push('/safety/incidents')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Incidents
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading safety data..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className={`border ${kpi.border}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Incidents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Incidents</CardTitle>
                <CardDescription>Latest 5 reported incidents</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/safety/incidents')}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {incidentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading incidents..." />
                </div>
              ) : (incidents as any[]).length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No incidents reported"
                  description="Great news — no incidents have been recorded."
                />
              ) : (
                <div className="divide-y">
                  {(incidents as any[]).map((incident: any) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 cursor-pointer"
                      onClick={() =>
                        router.push(`/safety/incidents/${incident.id}`)
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {incident.incidentNumber ?? `INC-${incident.id?.slice(-4)}`}
                          </span>
                          <StatusBadge
                            value={incident.severity}
                            type="severity"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {formatEnumLabel(incident.incidentType)} ·{' '}
                          {incident.site?.name ?? incident.location ?? 'Unknown location'}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(incident.incidentDate ?? incident.createdAt)}
                        </p>
                        <StatusBadge
                          value={incident.status}
                          customColors={{
                            OPEN: 'bg-red-100 text-red-800',
                            UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
                            CLOSED: 'bg-green-100 text-green-800',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Severity Breakdown */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Severity Breakdown</CardTitle>
              <CardDescription>Incidents by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <LoadingSpinner size="md" />
              ) : Object.keys(severityBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data available
                </p>
              ) : (
                <ul className="space-y-3">
                  {Object.entries(severityBreakdown).map(([severity, count]) => (
                    <li key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge value={severity} type="severity" />
                      </div>
                      <span className="font-semibold">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push('/safety/incidents')}
              >
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                View All Incidents
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push('/safety/reports')}
              >
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Safety Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
