'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  Radio,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { telemetryApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LiveTelemetryPage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['telemetry-live'],
    queryFn: () => telemetryApi.getFleetLatest().then((res) => res.data.data),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  const fleetData = data?.data || data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/telemetry">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 animate-pulse">
              <Radio className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time fleet monitoring
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={fleetData.filter((e: any) => e.status === 'online').length > 0 ? 'border-green-200 bg-green-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {fleetData.filter((e: any) => e.status === 'online').length}
                  </p>
                  <p className="text-sm text-green-600">Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={fleetData.filter((e: any) => e.status === 'offline').length > 0 ? 'border-gray-200 bg-gray-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {fleetData.filter((e: any) => e.status === 'offline').length}
                  </p>
                  <p className="text-sm text-gray-500">Offline</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={fleetData.some((e: any) => e.alerts?.length > 0) ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {fleetData.reduce((acc: number, e: any) => acc + (e.alerts?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-red-600">Active Alerts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Equipment Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : fleetData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <Radio className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">No equipment connected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fleetData.map((item: any) => (
            <Link key={item.equipmentId} href={`/telemetry/${item.equipmentId}`}>
              <Card className={`hover:shadow-lg transition-all cursor-pointer h-full ${
                item.status === 'online' ? 'border-green-200' : 'border-gray-200 opacity-75'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{item.equipment?.name || 'Unknown'}</CardTitle>
                    <Badge className={item.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {item.status === 'online' ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      ) : 'Offline'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fuel</span>
                      <span className={`font-medium ${item.fuelLevel < 20 ? 'text-red-600' : ''}`}>
                        {item.fuelLevel || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${item.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${item.fuelLevel || 0}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div>
                        <span className="text-gray-400">Hours</span>
                        <p className="font-medium">{item.engineHours || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Speed</span>
                        <p className="font-medium">{item.speed || 0} km/h</p>
                      </div>
                    </div>
                    
                    {item.alerts && item.alerts.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-red-200">
                        <p className="text-xs text-red-600 font-medium">
                          ⚠️ {item.alerts.length} Alert(s)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Active Alerts Panel */}
      {fleetData.some((e: any) => e.alerts?.length > 0) && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fleetData.filter((e: any) => e.alerts?.length > 0).map((item: any) => (
                item.alerts.map((alert: any, idx: number) => (
                  <div 
                    key={`${item.equipmentId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50"
                  >
                    <div>
                      <p className="font-medium">{item.equipment?.name}</p>
                      <p className="text-sm text-red-600">{alert.message}</p>
                    </div>
                    <Badge className={alert.alertType === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {alert.alertType}
                    </Badge>
                  </div>
                ))
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
