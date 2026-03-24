'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity,
  AlertTriangle,
  Loader2,
  Radio,
  MapPin,
  Gauge,
  Thermometer,
  Fuel
} from 'lucide-react';
import { telemetryApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TelemetryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['telemetry-fleet'],
    queryFn: () => telemetryApi.getFleetLatest().then((res) => res.data.data),
  });

  const fleetData = data?.data || data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telemetry</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time equipment monitoring and alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/telemetry/live">
            <Button variant="outline">
              <Radio className="w-4 h-4 mr-2" />
              Live Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Online</p>
                <p className="text-2xl font-bold">
                  {fleetData.filter((e: any) => e.status === 'online').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-100">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Offline</p>
                <p className="text-2xl font-bold">
                  {fleetData.filter((e: any) => e.status === 'offline').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {fleetData.reduce((acc: number, e: any) => acc + (e.alerts?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Gauge className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Equipment</p>
                <p className="text-2xl font-bold">{fleetData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-500">Failed to load telemetry data</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : fleetData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <Activity className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">No equipment telemetry data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleetData.map((item: any) => (
            <Link key={item.equipmentId} href={`/telemetry/${item.equipmentId}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{item.equipment?.name || 'Unknown'}</CardTitle>
                      <p className="text-sm text-gray-500">{item.equipment?.assetNumber}</p>
                    </div>
                    <Badge className={item.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-gray-400" />
                      <span>{item.engineHours || 0} hrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-gray-400" />
                      <span>{item.fuelLevel || 0}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      <span>{item.coolantTemp || 0}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{item.speed || 0} km/h</span>
                    </div>
                  </div>
                  
                  {item.alerts && item.alerts.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-red-600 font-medium">
                        {item.alerts.length} Active Alert(s)
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    Last Update: {item.lastUpdate ? new Date(item.lastUpdate).toLocaleTimeString() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
