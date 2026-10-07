import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import Decimal from 'decimal.js';


export class PaymentEngine {
  /**
   * Safe financial allocation of a payment across one or more invoices.
   * Ensures no over-allocation using exact Decimal.js math.
   */
  static async allocatePayment(tenantId: string, paymentId: string, allocations: { invoiceId: string, amount: number }[], actorId: string) {
    logger.info({ message: 'Allocating payment', paymentId, allocationsCount: allocations.length });

    return await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId, tenantId }, include: { allocations: true } });
      if (!payment) throw new Error('Payment not found');
      if (payment.status !== 'COMPLETED') throw new Error('Cannot allocate a non-completed payment');

      let totalAllocated = new Decimal(0);
      payment.allocations.forEach(a => totalAllocated = totalAllocated.plus(new Decimal(a.amount)));
      
      let newAllocationTotal = new Decimal(0);
      allocations.forEach(a => newAllocationTotal = newAllocationTotal.plus(new Decimal(a.amount)));

      const paymentTotal = new Decimal(payment.amount);
      if (totalAllocated.plus(newAllocationTotal).greaterThan(paymentTotal)) {
        throw new Error('Payment over-allocation detected. Allocation exceeds payment amount.');
      }

      for (const allocation of allocations) {
        const invoice = await tx.invoice.findUnique({ where: { id: allocation.invoiceId, tenantId } });
        if (!invoice) throw new Error(`Invoice ${allocation.invoiceId} not found`);

        const invoiceTotal = new Decimal(invoice.totalAmount);
        
        // Find existing allocations for this invoice across ALL payments
        const existingAllocations = await tx.paymentAllocation.findMany({ where: { invoiceId: invoice.id } });
        let invoicePaidSoFar = new Decimal(0);
        existingAllocations.forEach(a => invoicePaidSoFar = invoicePaidSoFar.plus(new Decimal(a.amount)));

        const allocatingAmount = new Decimal(allocation.amount);

        if (invoicePaidSoFar.plus(allocatingAmount).greaterThan(invoiceTotal)) {
          throw new Error(`Allocation of ${allocation.amount} exceeds remaining balance on Invoice ${invoice.id}`);
        }

        // Create Allocation
        await tx.paymentAllocation.create({
          data: {
            paymentId,
            invoiceId: invoice.id,
            amount: allocatingAmount
          }
        });

        // Determine if invoice is fully paid
        const isFullyPaid = invoicePaidSoFar.plus(allocatingAmount).equals(invoiceTotal);
        if (isFullyPaid) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID' }
          });
        } else {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PARTIALLY_PAID' }
          });
        }

        await eventBus.publish({
          eventId: crypto.randomUUID(),
          eventType: 'PAYMENT_ALLOCATED',
          aggregateType: 'Payment',
          aggregateId: paymentId,
          tenantId,
          version: 1,
          timestamp: new Date().toISOString(),
          payload: { invoiceId: invoice.id, amount: allocatingAmount.toNumber() }
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          actorType: 'USER',
          actorId,
          action: 'PAYMENT_ALLOCATED',
          resourceType: 'Payment',
          resourceId: payment.id,
          metadata: { allocations }
        }
      });

      return true;
    });
  }
}
