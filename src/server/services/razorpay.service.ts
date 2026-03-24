import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

class RazorpayService {
  /**
   * Create a Razorpay order for a subscription payment
   */
  async createOrder(amount: number, currency: string = 'INR', notes?: Record<string, string>) {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      notes,
    });
    return order;
  }

  /**
   * Verify Razorpay payment signature
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  /**
   * Fetch payment details from Razorpay
   */
  async fetchPayment(paymentId: string) {
    return razorpay.payments.fetch(paymentId);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number) {
    return razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }
}

export default new RazorpayService();
