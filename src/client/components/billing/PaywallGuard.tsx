'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Lock, Zap, Crown, ArrowRight } from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

type SubscriptionTier = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

const TIER_ORDER: Record<SubscriptionTier, number> = {
  BASIC: 0,
  PROFESSIONAL: 1,
  ENTERPRISE: 2,
};

const TIER_LABEL: Record<SubscriptionTier, string> = {
  BASIC: 'Basic',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

const TIER_ICON: Record<SubscriptionTier, any> = {
  BASIC: Lock,
  PROFESSIONAL: Zap,
  ENTERPRISE: Crown,
};

interface PaywallGuardProps {
  /** Minimum tier required to see this content */
  requiredTier: SubscriptionTier;
  /** The feature name shown in the upgrade prompt */
  feature: string;
  children: React.ReactNode;
  /** Show a compact inline lock badge instead of full overlay */
  inline?: boolean;
}

export function PaywallGuard({ requiredTier, feature, children, inline = false }: PaywallGuardProps) {
  const router = useRouter();

  const { data: subData } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => subscriptionApi.getCurrent().then((r) => r.data?.data ?? null),
    staleTime: 60_000,
  });

  const currentTier: SubscriptionTier = (subData as any)?.tier ?? 'BASIC';
  const hasAccess = TIER_ORDER[currentTier] >= TIER_ORDER[requiredTier];

  if (hasAccess) return <>{children}</>;

  const Icon = TIER_ICON[requiredTier];

  if (inline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium cursor-pointer hover:bg-amber-100 transition-colors"
        onClick={() => router.push('/settings/billing/plans')}
      >
        <Lock className="h-3 w-3" />
        {TIER_LABEL[requiredTier]}+ only
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 saturate-0">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
            <Icon className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {TIER_LABEL[requiredTier]} Feature
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            <span className="font-medium text-gray-700">{feature}</span> is available on the{' '}
            <span className="font-medium text-amber-600">{TIER_LABEL[requiredTier]}</span> plan and above.
            Upgrade to unlock this and many more features.
          </p>
          <Button onClick={() => router.push('/settings/billing/plans')}>
            Upgrade to {TIER_LABEL[requiredTier]}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-xs text-gray-400 mt-3">
            Starting from ₹4,999/month · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
