import prisma from '../db/prisma';
import { AppError } from '../middleware/error.middleware';
import razorpayService from './razorpay.service';
import { SubscriptionTier, BillingCycle } from '@prisma/client';
import { addMonths, addYears } from 'date-fns';

// Plan definitions
export const PLANS = {
  BASIC: {
    tier: 'BASIC' as SubscriptionTier,
    name: 'Basic',
    description: 'For small mining operations getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxEquipment: 5,
    maxSites: 1,
    maxUsers: 3,
    popular: false,
    features: [
      'Up to 5 equipment',
      '1 mining site',
      '3 team members',
      'Equipment tracking',
      'Basic maintenance scheduling',
      'Email support',
    ],
    limitations: ['No telemetry', 'No analytics', 'No fuel management'],
  },
  PROFESSIONAL: {
    tier: 'PROFESSIONAL' as SubscriptionTier,
    name: 'Professional',
    description: 'For growing mining companies with active fleets',
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    maxEquipment: 50,
    maxSites: 5,
    maxUsers: 20,
    popular: true,
    features: [
      'Up to 50 equipment',
      '5 mining sites',
      '20 team members',
      'Full fleet management',
      'Advanced maintenance',
      'Telemetry & IoT monitoring',
      'Production tracking',
      'Fuel management',
      'Safety & incident reports',
      'Analytics dashboard',
      'Priority email support',
    ],
    limitations: [],
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE' as SubscriptionTier,
    name: 'Enterprise',
    description: 'For large-scale mining operations at full capacity',
    monthlyPrice: 14999,
    yearlyPrice: 149999,
    maxEquipment: -1,
    maxSites: -1,
    maxUsers: -1,
    popular: false,
    features: [
      'Unlimited equipment',
      'Unlimited mining sites',
      'Unlimited team members',
      'All Professional features',
      'Custom integrations & API access',
      'Dedicated account manager',
      '99.9% SLA uptime guarantee',
      '24/7 phone & priority support',
      'Custom reports & exports',
      'White-label options',
    ],
    limitations: [],
  },
};

const TAX_RATE = 0.18; // 18% GST

class SubscriptionService {
  getPlans() {
    return Object.values(PLANS);
  }

  getPlanByTier(tier: SubscriptionTier) {
    return PLANS[tier];
  }

  /**
   * Get current subscription for an organization
   */
  async getCurrentSubscription(organizationId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!sub) {
      // Auto-create a BASIC trial subscription
      return this.createTrialSubscription(organizationId);
    }

    return sub;
  }

  /**
   * Create a free trial / BASIC subscription on first login
   */
  async createTrialSubscription(organizationId: string) {
    const now = new Date();
    const trialEnd = addMonths(now, 1); // 30-day trial

    return prisma.subscription.create({
      data: {
        organizationId,
        tier: 'BASIC',
        status: 'TRIAL',
        billingCycle: 'MONTHLY',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialEndsAt: trialEnd,
      },
    });
  }

  /**
   * Create Razorpay order for upgrading to a paid plan
   */
  async createUpgradeOrder(
    organizationId: string,
    tier: SubscriptionTier,
    billingCycle: BillingCycle
  ) {
    const plan = PLANS[tier];
    if (!plan) throw new AppError('Invalid plan', 400);
    if (tier === 'BASIC') throw new AppError('Basic plan is free', 400);

    const baseAmount =
      billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
    const tax = parseFloat((baseAmount * TAX_RATE).toFixed(2));
    const total = parseFloat((baseAmount + tax).toFixed(2));

    const order = await razorpayService.createOrder(total, 'INR', {
      organizationId,
      tier,
      billingCycle,
    });

    // Store pending payment with tier and billingCycle for reliable verification later
    const sub = await this.getCurrentSubscription(organizationId);
    await prisma.payment.create({
      data: {
        organizationId,
        subscriptionId: sub.id,
        razorpayOrderId: order.id,
        amount: baseAmount,
        currency: 'INR',
        tier,
        billingCycle,
        status: 'PENDING',
      },
    });

    return {
      orderId: order.id,
      amount: total,
      baseAmount,
      tax,
      currency: 'INR',
      plan: plan.name,
      billingCycle,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify payment and activate subscription
   */
  async verifyAndActivate(
    organizationId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const isValid = razorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!isValid) throw new AppError('Invalid payment signature', 400);

    // Find the pending payment (tier/billingCycle stored at order creation time)
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { subscription: true },
    });
    if (!payment) throw new AppError('Payment record not found', 404);

    const tier = payment.tier as SubscriptionTier;
    const billingCycle = payment.billingCycle as BillingCycle;
    if (!tier || !billingCycle) throw new AppError('Payment metadata missing. Please contact support.', 400);

    const now = new Date();
    const periodEnd =
      billingCycle === 'YEARLY' ? addYears(now, 1) : addMonths(now, 1);

    const plan = PLANS[tier];
    const baseAmount = Number(payment.amount);
    const tax = parseFloat((baseAmount * TAX_RATE).toFixed(2));
    const total = parseFloat((baseAmount + tax).toFixed(2));

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Activate in a transaction
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'SUCCESS',
        },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          tier,
          status: 'ACTIVE',
          billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEndsAt: null,
        },
      }),
      prisma.organization.update({
        where: { id: organizationId },
        data: { subscription: tier },
      }),
      prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId,
          subscriptionId: payment.subscriptionId,
          paymentId: payment.id,
          amount: baseAmount,
          tax,
          totalAmount: total,
          status: 'PAID',
          billingPeriodStart: now,
          billingPeriodEnd: periodEnd,
          dueDate: now,
          paidAt: now,
        },
      }),
    ]);

    return {
      success: true,
      tier,
      plan: plan.name,
      invoiceNumber,
    };
  }

  /**
   * Activate subscription from a webhook event (no client-side signature — webhook sig already verified)
   */
  async activateFromWebhook(razorpayOrderId: string, razorpayPaymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { subscription: true },
    });
    if (!payment) return; // order not ours — silently ignore

    // Already activated — idempotent
    if (payment.status === 'SUCCESS') return;

    const tier = payment.tier as SubscriptionTier;
    const billingCycle = payment.billingCycle as BillingCycle;
    if (!tier || !billingCycle) return;

    const now = new Date();
    const periodEnd = billingCycle === 'YEARLY' ? addYears(now, 1) : addMonths(now, 1);
    const plan = PLANS[tier];
    const baseAmount = Number(payment.amount);
    const tax = parseFloat((baseAmount * TAX_RATE).toFixed(2));
    const total = parseFloat((baseAmount + tax).toFixed(2));

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${now.getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId },
        data: { razorpayPaymentId, status: 'SUCCESS' },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { tier, status: 'ACTIVE', billingCycle, currentPeriodStart: now, currentPeriodEnd: periodEnd, trialEndsAt: null },
      }),
      prisma.organization.update({
        where: { id: payment.organizationId },
        data: { subscription: tier },
      }),
      prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId: payment.organizationId,
          subscriptionId: payment.subscriptionId,
          paymentId: payment.id,
          amount: baseAmount,
          tax,
          totalAmount: total,
          status: 'PAID',
          billingPeriodStart: now,
          billingPeriodEnd: periodEnd,
          dueDate: now,
          paidAt: now,
        },
      }),
    ]);
  }

  /**
   * Check the status of a pending payment by Razorpay order ID.
   * Used by the frontend to recover if the checkout handler didn't fire.
   */
  async getPaymentStatus(organizationId: string, razorpayOrderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });
    if (!payment || payment.organizationId !== organizationId) {
      throw new AppError('Payment not found', 404);
    }
    return { status: payment.status, tier: payment.tier, billingCycle: payment.billingCycle };
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(organizationId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId },
    });
    if (!sub) throw new AppError('No active subscription', 404);

    return prisma.subscription.update({
      where: { organizationId },
      data: {
        cancelAt: sub.currentPeriodEnd,
        status: 'CANCELED',
      },
    });
  }

  /**
   * List invoices for an organization
   */
  async getInvoices(organizationId: string) {
    return prisma.invoice.findMany({
      where: { organizationId },
      include: { payment: true, subscription: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single invoice
   */
  async getInvoice(organizationId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        payment: true,
        subscription: true,
        organization: {
          include: { users: { where: { role: 'ADMIN' }, take: 1 } },
        },
      } as any,
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  }

  /**
   * Check if organization can use a feature based on their plan
   */
  async checkFeatureAccess(
    organizationId: string,
    feature: 'equipment' | 'sites' | 'users' | 'telemetry' | 'analytics' | 'fuel'
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { subscription: true },
    });
    if (!org) throw new AppError('Organization not found', 404);

    const tier = org.subscription;
    const plan = PLANS[tier];

    // BASIC tier restrictions
    if (tier === 'BASIC') {
      if (feature === 'telemetry' || feature === 'analytics' || feature === 'fuel') {
        return { allowed: false, reason: `${feature} requires Professional or Enterprise plan`, requiredTier: 'PROFESSIONAL' };
      }
    }

    return { allowed: true };
  }

  /**
   * Check equipment limit
   */
  async checkEquipmentLimit(organizationId: string): Promise<{ allowed: boolean; current: number; max: number }> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { subscription: true },
    });
    if (!org) throw new AppError('Organization not found', 404);

    const plan = PLANS[org.subscription];
    const current = await prisma.equipment.count({
      where: { site: { organizationId }, isActive: true },
    });

    if (plan.maxEquipment === -1) return { allowed: true, current, max: -1 };
    return { allowed: current < plan.maxEquipment, current, max: plan.maxEquipment };
  }
}

export default new SubscriptionService();
