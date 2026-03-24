'use client';

import { Radio, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveTelemetryData {
  equipmentId: string;
  equipmentName: string;
  status: 'online' | 'offline';
  fuelLevel: number;
  engineHours: number;
  speed: number;
  alerts: number;
  lastUpdate: Date;
}

interface LiveDashboardProps {
  data: LiveTelemetryData[];
}

export default function LiveDashboard({ data }: LiveDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <Card 
          key={item.equipmentId}
          className={item.status === 'online' ? 'border-green-200' : 'border-gray-200'}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.equipmentName}</CardTitle>
              <Badge className={item.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {item.status === 'online' ? (
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
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
                  {item.fuelLevel}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${item.fuelLevel}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div>
                  <span className="text-gray-400">Hours</span>
                  <p className="font-medium">{item.engineHours}</p>
                </div>
                <div>
                  <span className="text-gray-400">Speed</span>
                  <p className="font-medium">{item.speed} km/h</p>
                </div>
              </div>
              
              {item.alerts > 0 && (
                <div className="pt-2 mt-2 border-t border-red-200 flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  {item.alerts} Alert(s)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
