import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPlans,
  getCurrent,
  createOrder,
  verifyPayment,
  cancelSubscription,
  webhook,
  getInvoices,
  getInvoice,
  downloadInvoice,
  getPaymentStatus,
} from '../controllers/subscription.controller';

const router = Router();

// Public
router.get('/plans', getPlans);

// Webhook (raw body needed — no auth)
router.post('/webhook', webhook);

// Authenticated subscription routes
router.use(authenticate);

router.get('/current', getCurrent);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/cancel', cancelSubscription);
router.get('/payment-status/:orderId', getPaymentStatus);

// Invoice routes
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.get('/invoices/:id/download', downloadInvoice);

export default router;
