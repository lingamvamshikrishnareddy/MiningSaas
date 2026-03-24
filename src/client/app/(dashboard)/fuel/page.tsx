'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Loader2, 
  AlertTriangle,
  Fuel,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import { fuelApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FuelPage() {
  const [search, setSearch] = useState('');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['fuel-summary'],
    queryFn: () => fuelApi.getSummary().then((res) => res.data.data),
  });

  const { data: fuelRecords } = useQuery({
    queryKey: ['fuel-records', search],
    queryFn: () => fuelApi.getAll({ search }).then((res) => res.data.data),
  });

  const records = fuelRecords?.data || fuelRecords || [];
  const summaryData = summary?.data || summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track fuel consumption and costs
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Log Fuel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Fuel className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Consumption</p>
                <p className="text-2xl font-bold">
                  {summaryData?.dailyConsumption?.toLocaleString() || 0} L
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
                <p className="text-sm text-gray-500">Monthly Consumption</p>
                <p className="text-2xl font-bold">
                  {summaryData?.monthlyConsumption?.toLocaleString() || 0} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${summaryData?.totalCost?.toLocaleString() || 0}
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
                <p className="text-sm text-gray-500">Efficiency</p>
                <p className="text-2xl font-bold">
                  {summaryData?.averageEfficiency?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/fuel/logs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Fuel className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Fuel Logs</h3>
                  <p className="text-sm text-gray-500">View all fuel transaction records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/fuel/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Fuel Analytics</h3>
                  <p className="text-sm text-gray-500">Analyze fuel consumption patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Fuel Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Fuel Records</CardTitle>
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
              No fuel records found
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
                      <Fuel className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{record.equipment?.name || 'Unknown Equipment'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{record.quantity} L</p>
                    <p className="text-sm text-gray-500">${record.cost?.toFixed(2)}</p>
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
