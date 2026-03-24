'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  FileText,
  Zap,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  Crown,
} from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const TIER_ICON: Record<string, any> = {
  BASIC: Building2,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  TRIAL: { label: 'Trial', color: 'bg-blue-100 text-blue-700', icon: Zap },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PAST_DUE: { label: 'Past Due', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  CANCELED: { label: 'Canceled', color: 'bg-red-100 text-red-700', icon: XCircle },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const success = searchParams.get('success');

  useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  }, [success, queryClient]);

  const { data: subData, isLoading } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => subscriptionApi.getCurrent().then((r) => r.data?.data ?? null),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['subscription', 'invoices'],
    queryFn: () => subscriptionApi.getInvoices().then((r) => r.data?.data ?? []),
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  });

  const sub: any = subData;
  const invoices: any[] = Array.isArray(invoicesData) ? invoicesData : [];
  const TierIcon = TIER_ICON[sub?.tier ?? 'BASIC'];
  const statusCfg = STATUS_CONFIG[sub?.status ?? 'TRIAL'];
  const StatusIcon = statusCfg?.icon ?? CheckCircle;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your plan, view invoices, and update payment details
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Payment successful!</p>
            <p className="text-sm text-green-700">Your subscription has been activated.</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-36 bg-gray-100 rounded-lg" />
          <div className="h-48 bg-gray-100 rounded-lg" />
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  Current Plan
                </CardTitle>
                <Badge className={statusCfg?.color ?? ''}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusCfg?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {TierIcon && (
                    <div className="p-3 rounded-lg bg-blue-50">
                      <TierIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {sub?.tier === 'BASIC' ? 'Basic (Free)' : sub?.tier === 'PROFESSIONAL' ? 'Professional' : 'Enterprise'}
                    </p>
                    {sub?.billingCycle && sub?.tier !== 'BASIC' && (
                      <p className="text-sm text-gray-500">
                        Billed {sub.billingCycle === 'MONTHLY' ? 'monthly' : 'yearly'}
                      </p>
                    )}
                    {sub?.currentPeriodEnd && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {sub.status === 'TRIAL' ? 'Trial ends' : 'Renews'} on{' '}
                        {format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy')}
                      </p>
                    )}
                    {sub?.cancelAt && (
                      <p className="text-sm text-red-500 mt-0.5">
                        Cancels on {format(new Date(sub.cancelAt), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => router.push('/settings/billing/plans')}>
                    {sub?.tier === 'BASIC' ? 'Upgrade Plan' : 'Change Plan'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  {sub?.status === 'ACTIVE' && sub?.tier !== 'BASIC' && !sub?.cancelAt && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Cancel subscription at period end?')) {
                          cancelMutation.mutate();
                        }
                      }}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan Limits</CardTitle>
              <CardDescription>Your current plan's feature limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Equipment',
                    max: sub?.tier === 'BASIC' ? 5 : sub?.tier === 'PROFESSIONAL' ? 50 : 'Unlimited',
                  },
                  {
                    label: 'Sites',
                    max: sub?.tier === 'BASIC' ? 1 : sub?.tier === 'PROFESSIONAL' ? 5 : 'Unlimited',
                  },
                  {
                    label: 'Team Members',
                    max: sub?.tier === 'BASIC' ? 3 : sub?.tier === 'PROFESSIONAL' ? 20 : 'Unlimited',
                  },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900">{item.max}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Recent Invoices
                </CardTitle>
                {invoices.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/settings/billing/invoices')}
                  >
                    View All
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  No invoices yet. Invoices appear after your first payment.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invoices.slice(0, 5).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(inv.createdAt), 'dd MMM yyyy')} ·{' '}
                          {inv.subscription?.tier}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                        </p>
                        <Badge
                          className={
                            inv.status === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : inv.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {inv.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/settings/billing/invoices?id=${inv.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
