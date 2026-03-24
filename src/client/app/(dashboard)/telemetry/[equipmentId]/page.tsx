'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Activity,
  Gauge,
  Thermometer,
  Fuel,
  MapPin,
  Zap,
  AlertCircle
} from 'lucide-react';
import { telemetryApi, equipmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TelemetryDetailPageProps {
  params: Promise<{ equipmentId: string }>;
}

export default function TelemetryDetailPage({ params }: TelemetryDetailPageProps) {
  const { equipmentId } = use(params);
  
  const { data: equipment } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => equipmentApi.getById(equipmentId).then((res) => res.data.data),
    enabled: !!equipmentId,
  });

  const { data: telemetry, isLoading } = useQuery({
    queryKey: ['telemetry-latest', equipmentId],
    queryFn: () => telemetryApi.getLatest(equipmentId).then((res) => res.data.data),
    enabled: !!equipmentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: averages } = useQuery({
    queryKey: ['telemetry-averages', equipmentId],
    queryFn: () => telemetryApi.getAverages(equipmentId, 24).then((res) => res.data.data),
    enabled: !!equipmentId,
  });

  const telemetryData = telemetry?.data || telemetry;
  const equipmentData = equipment?.data || equipment;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
            <div className="p-2 rounded-lg bg-blue-100">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {equipmentData?.name || 'Equipment Telemetry'}
              </h1>
              <p className="text-sm text-gray-500">
                Asset #: {equipmentData?.assetNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={telemetryData?.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {telemetryData?.status || 'offline'}
          </Badge>
          <span className="text-sm text-gray-500">
            Last update: {telemetryData?.timestamp ? new Date(telemetryData.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Active Alerts */}
      {telemetryData?.warningCodes && telemetryData.warningCodes.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Active Warning Codes</p>
                <p className="text-sm text-red-600">{telemetryData.warningCodes.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Gauge className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Engine Hours</p>
                <p className="text-2xl font-bold">{telemetryData?.engineHours?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Fuel className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Fuel Level</p>
                <p className="text-2xl font-bold">{telemetryData?.fuelLevel?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Engine Temp</p>
                <p className="text-2xl font-bold">{telemetryData?.engineTemp || 0}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Battery Voltage</p>
                <p className="text-2xl font-bold">{telemetryData?.batteryVoltage?.toFixed(1) || 0}V</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Speed</p>
                <p className="text-lg font-semibold">{telemetryData?.speed || 0} km/h</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Oil Pressure</p>
                <p className="text-lg font-semibold">{telemetryData?.oilPressure || 0} PSI</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Coolant Temp</p>
                <p className="text-lg font-semibold">{telemetryData?.coolantTemp || 0}°C</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Vibration</p>
                <p className="text-lg font-semibold">{telemetryData?.vibration?.toFixed(2) || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Hydraulic Pressure</p>
                <p className="text-lg font-semibold">{telemetryData?.hydraulicPressure || 0} PSI</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Altitude</p>
                <p className="text-lg font-semibold">{telemetryData?.altitude || 0} m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {telemetryData?.latitude && telemetryData?.longitude ? (
              <div className="h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map visualization</p>
                  <p className="text-sm text-gray-400">
                    {telemetryData.latitude.toFixed(6)}, {telemetryData.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No location data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 24hr Averages */}
      {averages && (
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Avg Fuel</p>
                <p className="text-lg font-semibold">{averages.fuelLevel?.toFixed(1) || 0}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Avg Speed</p>
                <p className="text-lg font-semibold">{averages.speed?.toFixed(1) || 0} km/h</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Avg Temp</p>
                <p className="text-lg font-semibold">{averages.engineTemp?.toFixed(1) || 0}°C</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Avg Oil</p>
                <p className="text-lg font-semibold">{averages.oilPressure?.toFixed(1) || 0} PSI</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Avg Battery</p>
                <p className="text-lg font-semibold">{averages.batteryVoltage?.toFixed(1) || 0}V</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
