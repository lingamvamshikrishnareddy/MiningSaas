'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['subscription', 'invoices'],
    queryFn: () => subscriptionApi.getInvoices().then((r) => r.data?.data ?? []),
  });

  const invoices: any[] = Array.isArray(invoicesData) ? invoicesData : [];

  const handleDownload = async (inv: any) => {
    setDownloading(inv.id);
    try {
      const res = await subscriptionApi.downloadInvoice(inv.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings/billing')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Billing
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">
          Download your billing history and payment receipts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-gray-500" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No invoices yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Invoices will appear here after your first payment.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => router.push('/settings/billing/plans')}
              >
                View Plans
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 pb-2 text-xs font-medium text-gray-500 uppercase">
                <span>Invoice</span>
                <span>Date</span>
                <span>Plan</span>
                <span>Amount</span>
                <span>Status / Action</span>
              </div>

              {invoices.map((inv: any) => {
                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                const isHighlighted = inv.id === highlightId;

                return (
                  <div
                    key={inv.id}
                    className={`grid grid-cols-5 gap-4 items-center py-4 ${
                      isHighlighted ? 'bg-blue-50 -mx-6 px-6 rounded' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">
                        {inv.subscription?.billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'} billing
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-700">
                        {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Due: {format(new Date(inv.dueDate), 'dd MMM')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-700">
                        {inv.subscription?.tier === 'PROFESSIONAL'
                          ? 'Professional'
                          : inv.subscription?.tier === 'ENTERPRISE'
                          ? 'Enterprise'
                          : 'Basic'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(inv.billingPeriodStart), 'dd MMM')} –{' '}
                        {format(new Date(inv.billingPeriodEnd), 'dd MMM yyyy')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-400">
                        incl. ₹{Number(inv.tax).toLocaleString('en-IN')} GST
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={cfg.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                      {inv.status === 'PAID' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(inv)}
                          disabled={downloading === inv.id}
                          title="Download PDF"
                        >
                          {downloading === inv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        All invoices are in INR and include 18% GST. Contact support@miningops.com for billing queries.
      </p>
    </div>
  );
}
