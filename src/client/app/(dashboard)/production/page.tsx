'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Loader2, 
  AlertTriangle,
  Package,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';
import { productionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductionPage() {
  const [search, setSearch] = useState('');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['production-summary'],
    queryFn: () => productionApi.getSummary().then((res) => res.data.data),
  });

  const { data: productionRecords } = useQuery({
    queryKey: ['production-records', search],
    queryFn: () => productionApi.getAll({ search }).then((res) => res.data.data),
  });

  const records = productionRecords?.data || productionRecords || [];
  const summaryData = summary?.data || summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track mining production metrics and targets
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/production/reports">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Production
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Production</p>
                <p className="text-2xl font-bold">
                  {summaryData?.dailyProduction?.toLocaleString() || 0} tonnes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weekly Production</p>
                <p className="text-2xl font-bold">
                  {summaryData?.weeklyProduction?.toLocaleString() || 0} tonnes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Production</p>
                <p className="text-2xl font-bold">
                  {summaryData?.monthlyProduction?.toLocaleString() || 0} tonnes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Target Completion</p>
                <p className="text-2xl font-bold">
                  {summaryData?.targetCompletion?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Production */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No production records found
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 5).map((record: any) => (
                <div 
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{record.oreType || 'Unknown Type'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{record.tonnes?.toLocaleString()} tonnes</p>
                    <p className="text-sm text-gray-500">Grade: {record.grade}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
