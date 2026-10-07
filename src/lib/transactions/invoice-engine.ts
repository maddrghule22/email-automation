import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import Decimal from 'decimal.js';


export class InvoiceEngine {
  /**
   * Safely converts a validated Document into a financial Invoice record.
   * Runs atomically inside a transaction.
   */
  static async createFromDocument(documentId: string, tenantId: string) {
    logger.info({ message: 'Creating Invoice from Document', documentId });

    return await db.$transaction(async (tx) => {
      const doc = await tx.document.findUnique({
        where: { id: documentId, tenantId },
      });

      if (!doc || doc.status !== 'COMPLETED' || doc.documentType !== 'INVOICE') {
        throw new Error('Document is not ready or not an invoice');
      }

      const data = doc.extractedData as any;
      if (!data || !data.invoiceNumber || !data.totalAmount) {
        throw new Error('Document extraction missing required financial fields');
      }

      // Concurrency check (handled by DB unique constraint on tenantId + supplierId + invoiceNumber, but we double check)
      const existing = await tx.invoice.findFirst({
        where: { tenantId, invoiceNumber: data.invoiceNumber, supplierId: data.supplierId }
      });
      if (existing) throw new Error('Duplicate invoice number for this supplier');

      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber: data.invoiceNumber,
          documentId: doc.id,
          supplierId: data.supplierId,
          customerId: data.customerId,
          date: data.invoiceDate ? new Date(data.invoiceDate) : null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          currency: data.currency || 'USD',
          subtotal: data.subtotal || 0,
          taxAmount: data.taxAmount || 0,
          discountAmount: data.discountAmount || 0,
          totalAmount: data.totalAmount || 0,
          status: 'DRAFT', // Explicit state machine starting point
        }
      });

      // Create Lines
      if (data.lineItems && Array.isArray(data.lineItems)) {
        await tx.invoiceLine.createMany({
          data: data.lineItems.map((line: any) => ({
            invoiceId: invoice.id,
            description: line.description || 'Unknown Item',
            quantity: line.quantity || 1,
            unitPrice: line.unitPrice || 0,
            totalAmount: line.total || (line.quantity * line.unitPrice) || 0,
          }))
        });
      }

      // Emit Domain Event
      await eventBus.publish({
        eventId: crypto.randomUUID(),
        eventType: 'INVOICE_CREATED',
        aggregateType: 'Invoice',
        aggregateId: invoice.id,
        tenantId,
        version: 1,
        timestamp: new Date().toISOString(),
        payload: { sourceDocumentId: doc.id, totalAmount: data.totalAmount }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          actorType: 'SYSTEM',
          actorId: 'transaction-engine',
          action: 'ENTITY_CREATED',
          resourceType: 'Invoice',
          resourceId: invoice.id,
          metadata: { source: 'DOCUMENT', documentId }
        }
      });

      return invoice;
    });
  }

  /**
   * Centralized State Machine for Invoices
   */
  static async transitionState(invoiceId: string, tenantId: string, newState: string, actorId: string) {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['PENDING_APPROVAL', 'APPROVED', 'CANCELLED'],
      'PENDING_APPROVAL': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['ISSUED', 'CANCELLED'],
      'ISSUED': ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'],
      'PARTIALLY_PAID': ['PAID'],
    };

    return await db.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId, tenantId } });
      if (!invoice) throw new Error('Invoice not found');

      const allowed = validTransitions[invoice.status];
      if (!allowed || !allowed.includes(newState)) {
        throw new Error(`Invalid state transition from ${invoice.status} to ${newState}`);
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newState }
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorType: 'USER',
          actorId,
          action: 'STATUS_CHANGED',
          resourceType: 'Invoice',
          resourceId: invoice.id,
          metadata: { oldState: invoice.status, newState }
        }
      });

      await eventBus.publish({
        eventId: crypto.randomUUID(),
        eventType: `INVOICE_${newState}`,
        aggregateType: 'Invoice',
        aggregateId: invoice.id,
        tenantId,
        version: 1,
        timestamp: new Date().toISOString(),
        payload: {}
      });

      return invoice;
    });
  }
}
