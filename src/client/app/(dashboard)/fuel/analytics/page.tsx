'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Fuel,
  DollarSign,
  Calendar
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FuelAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data, isLoading, error } = useQuery({
    queryKey: ['fuel-analytics', period],
    queryFn: () => analyticsApi.getFuelTrend({ period }).then((res) => res.data.data),
  });

  const analytics = data?.data || data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/fuel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fuel Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze fuel consumption patterns and trends
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={period === 'daily' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('daily')}
          >
            Daily
          </Button>
          <Button 
            variant={period === 'weekly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </Button>
          <Button 
            variant={period === 'monthly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-500">Failed to load analytics</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Consumption</p>
                    <p className="text-2xl font-bold">
                      {analytics?.totalConsumption?.toLocaleString() || 0} L
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Fuel className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.totalCost?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Efficiency</p>
                    <p className="text-2xl font-bold">
                      {analytics?.averageEfficiency?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Cost per Liter</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.costPerLiter?.toFixed(2) || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization will appear here</p>
                  <p className="text-sm text-gray-400">Connect to a charting library for visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Consumers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Fuel Consumers</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.topConsumers?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topConsumers.map((item: any, index: number) => (
                    <div 
                      key={item.equipmentId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{item.equipmentName}</p>
                          <p className="text-sm text-gray-500">{item.consumption} L</p>
                        </div>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.consumption / analytics.topConsumers[0].consumption) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
