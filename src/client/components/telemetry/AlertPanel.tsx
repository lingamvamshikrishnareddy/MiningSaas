'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { TelemetryAlert } from '@/types/telemetry.types';

interface AlertPanelProps {
  alerts: TelemetryAlert[];
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No active alerts
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Active Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.equipmentId}-${index}`}
            className={`p-3 rounded-lg border ${getAlertColor(alert.alertType)}`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.alertType)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{alert.equipmentName}</p>
                  <Badge className={alert.alertType === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                    {alert.alertType}
                  </Badge>
                </div>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.timestamp).toLocaleString()} • {alert.metric}: {alert.currentValue} (threshold: {alert.threshold})
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
