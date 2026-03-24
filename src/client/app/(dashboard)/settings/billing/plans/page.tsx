'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  Zap,
  Building2,
  Crown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLAN_ICONS: Record<string, any> = {
  Basic: Building2,
  Professional: Zap,
  Enterprise: Crown,
};

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Basic: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  Professional: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300' },
  Enterprise: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-300' },
};

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState<string | null>(null);
  // Tracks the pending order ID so we can poll for payment status if the handler doesn't fire
  const pendingOrderId = useRef<string | null>(null);
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const statusCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionApi.getPlans().then((r) => r.data?.data ?? []),
    retry: 2,
  });

  const { data: currentData } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => subscriptionApi.getCurrent().then((r) => r.data?.data ?? null),
    retry: 1,
  });

  const plans: any[] = plansData ?? [];
  const current: any = currentData;

  // Clean up the status check timer on unmount
  useEffect(() => {
    return () => {
      if (statusCheckTimer.current) clearTimeout(statusCheckTimer.current);
    };
  }, []);

  const checkPaymentStatus = async () => {
    if (!pendingOrderId.current) return;
    setCheckingStatus(true);
    try {
      const res = await subscriptionApi.getPaymentStatus(pendingOrderId.current);
      const { status } = res.data?.data ?? {};
      if (status === 'SUCCESS') {
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        router.push('/settings/billing?success=1');
      } else {
        alert('Payment is still being processed. Please wait a moment and try again, or contact support if the issue persists.');
      }
    } catch {
      alert('Could not check payment status. Please contact support.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleUpgrade = async (plan: any) => {
    if (plan.tier === 'BASIC') return;
    setLoading(plan.tier);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Failed to load payment gateway. Please check your connection.');
        setLoading(null);
        return;
      }

      const res = await subscriptionApi.createOrder(plan.tier, billingCycle);
      const order = res.data?.data;

      // Store the order ID so we can poll if the handler doesn't fire
      pendingOrderId.current = order.orderId;

      // Show "Check Status" button after 45 seconds in case the handler is stuck
      if (statusCheckTimer.current) clearTimeout(statusCheckTimer.current);
      statusCheckTimer.current = setTimeout(() => setShowStatusCheck(true), 45000);

      const options = {
        key: order.keyId,
        // amount is in rupees from our API; Razorpay checkout expects paise
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'MiningOPS',
        description: `${order.plan} Plan - ${order.billingCycle}`,
        order_id: order.orderId,
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : (user as any)?.name,
          email: user?.email,
        },
        theme: { color: '#2563eb' },
        handler: async (response: any) => {
          // Handler fired — clear the "stuck" timer
          if (statusCheckTimer.current) clearTimeout(statusCheckTimer.current);
          setShowStatusCheck(false);
          try {
            await subscriptionApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            router.push('/settings/billing?success=1');
          } catch {
            alert('Payment verification failed. Please contact support.');
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: () => {
            if (statusCheckTimer.current) clearTimeout(statusCheckTimer.current);
            setShowStatusCheck(false);
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.');
        setLoading(null);
      });
      rzp.open();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const isCurrentPlan = (tier: string) => current?.tier === tier;
  const yearlyDiscount = (monthly: number) =>
    monthly > 0 ? Math.round(((monthly * 12 - monthly * 10) / (monthly * 12)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings/billing')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Billing
        </Button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Scale your mining operations with the right plan. Upgrade or downgrade at any time.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className={`text-sm font-medium ${billingCycle === 'MONTHLY' ? 'text-gray-900' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'YEARLY' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'YEARLY' ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly
          </span>
          {billingCycle === 'YEARLY' && (
            <Badge className="bg-green-100 text-green-700 border-green-200">Save ~17%</Badge>
          )}
        </div>
      </div>

      {/* Payment stuck recovery banner */}
      {showStatusCheck && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div>
            <p className="font-medium text-amber-800 text-sm">Payment taking longer than expected?</p>
            <p className="text-xs text-amber-600 mt-0.5">
              If you completed payment but see a processing screen, click below to check status.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0 ml-4"
            onClick={checkPaymentStatus}
            disabled={checkingStatus}
          >
            {checkingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Check Status
          </Button>
        </div>
      )}

      {/* Loading state */}
      {plansLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded" />
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded mt-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {plansError && !plansLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-4 rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Failed to load subscription plans</p>
            <p className="text-sm text-gray-500 mt-1">
              Could not connect to the server. Make sure the backend is running on port 5000.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetchPlans()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Plans grid */}
      {!plansLoading && !plansError && (
        <>
          {plans.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No plans available. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const Icon = PLAN_ICONS[plan.name] ?? Building2;
                const colors = PLAN_COLORS[plan.name] ?? PLAN_COLORS.Basic;
                const isCurrent = isCurrentPlan(plan.tier);
                const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
                const isLoadingThis = loading === plan.tier;

                return (
                  <Card
                    key={plan.tier}
                    className={`relative flex flex-col ${plan.popular ? `border-2 ${colors.border} shadow-md` : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white px-3">Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader className={`rounded-t-lg ${plan.popular ? colors.bg : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`h-5 w-5 ${colors.text}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">{plan.description}</CardDescription>
                        </div>
                      </div>

                      <div className="mt-4">
                        {price === 0 ? (
                          <div className="text-3xl font-bold text-gray-900">Free</div>
                        ) : (
                          <div className="flex items-end gap-1">
                            <span className="text-3xl font-bold text-gray-900">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-gray-500 text-sm mb-1">
                              /{billingCycle === 'YEARLY' ? 'yr' : 'mo'}
                            </span>
                          </div>
                        )}
                        {billingCycle === 'YEARLY' && price > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            ~{yearlyDiscount(plan.monthlyPrice)}% off vs monthly
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col pt-4">
                      <ul className="space-y-2 flex-1">
                        {plan.features?.map((f: string) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                        {plan.limitations?.map((l: string) => (
                          <li key={l} className="flex items-start gap-2 text-sm text-gray-400">
                            <X className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
                            {l}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6">
                        {isCurrent ? (
                          <Button className="w-full" variant="outline" disabled>
                            Current Plan
                          </Button>
                        ) : plan.tier === 'BASIC' ? (
                          <Button className="w-full" variant="outline" disabled>
                            Free — Downgrade
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={plan.popular ? 'default' : 'outline'}
                            onClick={() => handleUpgrade(plan)}
                            disabled={!!loading}
                          >
                            {isLoadingThis ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing…
                              </>
                            ) : (
                              `Upgrade to ${plan.name}`
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        All prices include 18% GST. Payments processed securely via Razorpay.
        Cancel anytime — no lock-in.
      </p>
    </div>
  );
}
