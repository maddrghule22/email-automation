import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import { auditService } from '@/lib/audit';

import { PriorityEngine } from './priority-engine';
import { SLAEngine } from './sla-engine';

export interface CreateExceptionInput {
  tenantId: string;
  category: string;
  type: string;
  title: string;
  description?: string;
  sourceType?: string;
  sourceId?: string;
  sourceReference?: string;
  workflowRunId?: string;
  documentId?: string;
  businessRecordType?: string;
  businessRecordId?: string;
  metadata?: Record<string, any>;
  aiAnalysis?: any;
}

export class ExceptionService {
  /**
   * Creates a new Exception Case deterministically.
   * Calculates initial priority and SLA deadlines automatically.
   */
  static async createException(input: CreateExceptionInput, actorId = 'SYSTEM') {
    logger.info({ message: 'Creating exception case', type: input.type, tenantId: input.tenantId });

    return await db.$transaction(async (tx) => {
      // 1. Generate unique identifier
      const prefix = 'EXC';
      const seqRaw = await tx.$queryRaw<any[]>`SELECT count(*) as count FROM "ExceptionCase" WHERE "tenantId" = ${input.tenantId}`;
      const seq = Number(seqRaw?.[0]?.count || 0) + 1000;
      const exceptionNumber = `${prefix}-${seq}`;

      // 2. Calculate priority and SLA
      const priority = PriorityEngine.calculatePriority(input);
      const dueAt = SLAEngine.calculateDeadline(priority);

      // 3. Create Record
      const caseRecord = await tx.exceptionCase.create({
        data: {
          tenantId: input.tenantId,
          exceptionNumber,
          category: input.category,
          type: input.type,
          title: input.title,
          description: input.description,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          sourceReference: input.sourceReference,
          workflowRunId: input.workflowRunId,
          documentId: input.documentId,
          businessRecordType: input.businessRecordType,
          businessRecordId: input.businessRecordId,
          metadata: input.metadata || {},
          aiAnalysis: input.aiAnalysis,
          priority,
          status: 'OPEN',
          dueAt
        }
      });

      // 4. Record History
      await tx.exceptionHistory.create({
        data: {
          tenantId: input.tenantId,
          exceptionCaseId: caseRecord.id,
          actorType: actorId === 'SYSTEM' ? 'SYSTEM' : 'USER',
          actorId,
          action: 'CREATED',
          changes: { status: 'OPEN', priority }
        }
      });

      // 5. Emit Event for downstream queues/notifications
      await eventBus.publish({
        eventId: crypto.randomUUID(),
        eventType: 'exception.created',
        aggregateType: 'ExceptionCase',
        aggregateId: caseRecord.id,
        tenantId: input.tenantId,
        version: 1,
        timestamp: new Date().toISOString(),
        payload: { priority, category: input.category }
      });

      return caseRecord;
    });
  }

  /**
   * State Machine transition engine.
   * Enforces valid paths and captures audit history.
   */
  static async transitionStatus(tenantId: string, caseId: string, newStatus: string, actorId: string, reason?: string) {
    const validTransitions: Record<string, string[]> = {
      'OPEN': ['TRIAGED', 'ASSIGNED', 'CLOSED'],
      'TRIAGED': ['ASSIGNED', 'CLOSED'],
      'ASSIGNED': ['ACKNOWLEDGED', 'IN_PROGRESS'],
      'ACKNOWLEDGED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['WAITING', 'RESOLVED'],
      'WAITING': ['IN_PROGRESS'],
      'RESOLVED': ['VERIFIED', 'REOPENED', 'CLOSED'],
      'VERIFIED': ['CLOSED'],
      'CLOSED': ['REOPENED'],
      'REOPENED': ['IN_PROGRESS', 'ASSIGNED']
    };

    return await db.$transaction(async (tx) => {
      const caseRecord = await tx.exceptionCase.findUnique({ where: { id: caseId, tenantId } });
      if (!caseRecord) throw new Error('Exception Case not found');

      const allowed = validTransitions[caseRecord.status];
      if (!allowed || !allowed.includes(newStatus)) {
        throw new Error(`Invalid exception transition from ${caseRecord.status} to ${newStatus}`);
      }

      const updateData: any = { status: newStatus };
      if (newStatus === 'ACKNOWLEDGED' && !caseRecord.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
      }
      if (newStatus === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
      if (newStatus === 'CLOSED') {
        updateData.closedAt = new Date();
      }

      const updated = await tx.exceptionCase.update({
        where: { id: caseId },
        data: updateData
      });

      await tx.exceptionHistory.create({
        data: {
          tenantId,
          exceptionCaseId: caseId,
          actorType: 'USER',
          actorId,
          action: 'STATUS_CHANGED',
          changes: { oldStatus: caseRecord.status, newStatus, reason }
        }
      });

      await auditService.log({
        actorType: 'USER',
        actorId,
        action: 'exception.status_changed',
        resourceType: 'ExceptionCase',
        resourceId: caseId,
        tenantId,
        metadata: { oldStatus: caseRecord.status, newStatus }
      });

      return updated;
    });
  }
}
