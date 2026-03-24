import { Request, Response, NextFunction } from 'express';
import subscriptionService from '../services/subscription.service';
import invoiceService from '../services/invoice.service';
import razorpayService from '../services/razorpay.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.util';
import { AppError } from '../middleware/error.middleware';
import { BillingCycle, SubscriptionTier } from '@prisma/client';

/**
 * GET /subscriptions/plans — list all plans (public)
 */
export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = subscriptionService.getPlans();
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /subscriptions/current — get current subscription for the org
 */
export const getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const sub = await subscriptionService.getCurrentSubscription(organizationId);
    return sendSuccess(res, sub);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /subscriptions/create-order — create a Razorpay order to upgrade
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const { tier, billingCycle } = req.body as { tier: SubscriptionTier; billingCycle: BillingCycle };

    if (!tier || !billingCycle) {
      throw new AppError('tier and billingCycle are required', 400);
    }

    const order = await subscriptionService.createUpgradeOrder(organizationId, tier, billingCycle);
    return sendCreated(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /subscriptions/verify-payment — verify Razorpay payment & activate
 */
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing Razorpay payment fields', 400);
    }

    const result = await subscriptionService.verifyAndActivate(
      organizationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /subscriptions/cancel — cancel at end of billing period
 */
export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const result = await subscriptionService.cancelSubscription(organizationId);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /subscriptions/webhook — Razorpay webhook handler
 */
export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Skip signature check if webhook secret is not configured (dev only)
    if (process.env.RAZORPAY_WEBHOOK_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET !== 'your_razorpay_webhook_secret_here') {
      const isValid = razorpayService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        return sendError(res, 'Invalid webhook signature', 400);
      }
    }

    const event = req.body.event;
    const entity = req.body.payload?.payment?.entity;
    const orderId = entity?.id ? undefined : req.body.payload?.order?.entity?.id; // order.paid
    const paymentId = entity?.id;
    const paymentOrderId = entity?.order_id;

    if (event === 'payment.captured' || event === 'order.paid') {
      const rOrderId = paymentOrderId || orderId;
      const rPaymentId = paymentId || req.body.payload?.payment?.entity?.id;
      if (rOrderId && rPaymentId) {
        await subscriptionService.activateFromWebhook(rOrderId, rPaymentId);
      }
    }

    if (event === 'payment.failed') {
      if (paymentOrderId) {
        const prisma = (await import('../db/prisma')).default;
        await prisma.payment.updateMany({
          where: { razorpayOrderId: paymentOrderId },
          data: { status: 'FAILED' },
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /subscriptions/payment-status/:orderId — poll payment status (frontend recovery)
 */
export const getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const { orderId } = req.params;
    const status = await subscriptionService.getPaymentStatus(organizationId, orderId);
    return sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
};

// ── Invoices ──

/**
 * GET /invoices — list all invoices for org
 */
export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const invoices = await subscriptionService.getInvoices(organizationId);
    return sendSuccess(res, invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /invoices/:id/download — download PDF invoice
 */
export const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;

    const invoice = await subscriptionService.getInvoice(organizationId, id);
    const pdfBuffer = await invoiceService.generatePDF(id, organizationId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${(invoice as any).invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /invoices/:id — get a single invoice
 */
export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.user!;
    const { id } = req.params;
    const invoice = await subscriptionService.getInvoice(organizationId, id);
    return sendSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
};
