import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import subscriptionService, { PLANS } from './subscription.service';
import { SubscriptionTier } from '@prisma/client';

class InvoiceService {
  /**
   * Generate a PDF invoice and return as buffer
   */
  async generatePDF(invoiceId: string, organizationId: string): Promise<Buffer> {
    const invoice = await subscriptionService.getInvoice(organizationId, invoiceId) as any;
    const plan = PLANS[invoice.subscription.tier as SubscriptionTier];

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 100; // minus margins

      // ── Header ──
      doc.rect(0, 0, doc.page.width, 80).fill('#1e293b');
      doc.fillColor('#f59e0b')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('MiningOPS', 50, 25);
      doc.fillColor('#94a3b8')
        .fontSize(10)
        .font('Helvetica')
        .text('Mining Operations Management Platform', 50, 50);
      doc.fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 30, { align: 'right', width: pageWidth - 350 });

      doc.moveDown(3);

      // ── Invoice meta ──
      doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
      doc.text('Invoice Number:', 50, 110);
      doc.text('Issue Date:', 50, 128);
      doc.text('Due Date:', 50, 146);
      doc.text('Status:', 50, 164);

      doc.fillColor('#475569').font('Helvetica');
      doc.text(invoice.invoiceNumber, 170, 110);
      doc.text(format(new Date(invoice.createdAt), 'dd MMM yyyy'), 170, 128);
      doc.text(format(new Date(invoice.dueDate), 'dd MMM yyyy'), 170, 146);
      doc
        .fillColor(invoice.status === 'PAID' ? '#16a34a' : '#dc2626')
        .text(invoice.status, 170, 164);

      // ── Bill To ──
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(11);
      doc.text('Bill To:', 350, 110);
      doc.fillColor('#475569').font('Helvetica').fontSize(10);
      doc.text((invoice as any).organization?.name ?? 'Organization', 350, 128);
      const adminUser = (invoice as any).organization?.users?.[0];
      if (adminUser) {
        doc.text(`${adminUser.firstName} ${adminUser.lastName}`, 350, 144);
        doc.text(adminUser.email, 350, 160);
      }

      // Separator line
      doc.moveTo(50, 195).lineTo(doc.page.width - 50, 195).strokeColor('#e2e8f0').stroke();

      // ── Billing Period ──
      doc.fillColor('#64748b').fontSize(9).font('Helvetica');
      doc.text(
        `Billing Period: ${format(new Date(invoice.billingPeriodStart), 'dd MMM yyyy')} – ${format(new Date(invoice.billingPeriodEnd), 'dd MMM yyyy')}`,
        50, 205
      );

      // ── Table header ──
      doc.rect(50, 225, pageWidth, 24).fill('#f1f5f9');
      doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 60, 232);
      doc.text('Plan', 280, 232);
      doc.text('Cycle', 380, 232);
      doc.text('Amount', 480, 232, { align: 'right', width: 60 });

      // ── Table row ──
      doc.rect(50, 249, pageWidth, 30).fill('#ffffff').stroke('#e2e8f0');
      doc.fillColor('#1e293b').font('Helvetica').fontSize(10);
      doc.text(`${plan?.name ?? invoice.subscription.tier} Subscription`, 60, 259);
      doc.text(plan?.name ?? invoice.subscription.tier, 280, 259);
      doc.text(invoice.subscription.billingCycle, 380, 259);
      doc.text(`₹${Number(invoice.amount).toLocaleString('en-IN')}`, 480, 259, { align: 'right', width: 60 });

      // ── Totals ──
      const totalsY = 310;
      doc.moveTo(350, totalsY).lineTo(doc.page.width - 50, totalsY).strokeColor('#e2e8f0').stroke();

      doc.fillColor('#475569').font('Helvetica').fontSize(10);
      doc.text('Subtotal:', 380, totalsY + 10);
      doc.text(`₹${Number(invoice.amount).toLocaleString('en-IN')}`, 480, totalsY + 10, { align: 'right', width: 60 });

      doc.text('GST (18%):', 380, totalsY + 28);
      doc.text(`₹${Number(invoice.tax).toLocaleString('en-IN')}`, 480, totalsY + 28, { align: 'right', width: 60 });

      doc.moveTo(380, totalsY + 50).lineTo(doc.page.width - 50, totalsY + 50).strokeColor('#94a3b8').stroke();

      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(12);
      doc.text('Total:', 380, totalsY + 58);
      doc.text(`₹${Number(invoice.totalAmount).toLocaleString('en-IN')}`, 480, totalsY + 58, { align: 'right', width: 60 });

      if (invoice.status === 'PAID' && invoice.paidAt) {
        doc.fillColor('#16a34a').font('Helvetica').fontSize(10);
        doc.text(`Paid on ${format(new Date(invoice.paidAt), 'dd MMM yyyy')}`, 380, totalsY + 80);
      }

      // ── Payment details ──
      if (invoice.payment?.razorpayPaymentId) {
        doc.fillColor('#64748b').font('Helvetica').fontSize(9);
        doc.text(`Razorpay Payment ID: ${invoice.payment.razorpayPaymentId}`, 50, totalsY + 80);
      }

      // ── Footer ──
      const footerY = doc.page.height - 80;
      doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor('#e2e8f0').stroke();
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(8);
      doc.text(
        'MiningOPS · Mining Operations Management Platform · support@miningops.com',
        50, footerY + 12,
        { align: 'center', width: pageWidth }
      );
      doc.text(
        'This is a computer-generated invoice and does not require a signature.',
        50, footerY + 26,
        { align: 'center', width: pageWidth }
      );

      doc.end();
    });
  }
}

export default new InvoiceService();
