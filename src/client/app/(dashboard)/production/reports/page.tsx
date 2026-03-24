'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  Download,
  BarChart3
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductionReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data, isLoading, error } = useQuery({
    queryKey: ['production-analytics', period],
    queryFn: () => analyticsApi.getProductionTrend({ period }).then((res) => res.data.data),
  });

  const analytics = data?.data || data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/production">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Detailed production analytics and reports
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Period Selector */}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-500">Failed to load reports</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Production</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.total?.toLocaleString() || 0} tonnes
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Average Grade</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics?.averageGrade?.toFixed(2) || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Recovery Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.efficiency?.recoveryRate?.toFixed(1) || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Production by Ore Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Production by Ore Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.byOreType?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.byOreType.map((item: any, index: number) => (
                    <div 
                      key={item.oreType}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <span className="font-medium">{item.oreType}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.tonnes?.toLocaleString()} tonnes</p>
                        <p className="text-sm text-gray-500">Grade: {item.averageGrade}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Production Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Production Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Trend chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
