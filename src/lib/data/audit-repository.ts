// ============================================================================
// Audit Repository — Append-only, immutable audit log access
// ============================================================================

import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-repository';
import { PaginationParams, PaginatedResult } from './types';

interface AuditFilters {
  actorId?: string;
  resourceType?: string;
  action?: string;
  from?: Date;
  to?: Date;
}

interface CreateAuditEntry {
  actorType: 'USER' | 'SYSTEM' | 'AGENT';
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

export class AuditRepository extends BaseRepository {
  /**
   * Append an audit log entry. This is the ONLY write operation.
   * Audit logs are immutable — no update or delete is ever provided.
   */
  async create(entry: CreateAuditEntry): Promise<string> {
    try {
      const { logD1Audit } = await import('@/lib/d1');
      await logD1Audit({
        actorType: entry.actorType,
        actorId: entry.actorId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        tenantId: this.tenantId,
        metadata: entry.metadata,
      });
      return crypto.randomUUID();
    } catch {}

    try {
      const record = await this.db.auditLog.create({
        data: {
          tenantId: this.tenantId,
          actorType: entry.actorType,
          actorId: entry.actorId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          metadata: entry.metadata as Prisma.InputJsonValue,
          requestId: entry.requestId,
        },
      });
      return record.id;
    } catch {
      return crypto.randomUUID();
    }
  }

  /**
   * List audit logs for this tenant with optional filters and cursor pagination.
   */
  async listByTenant(
    pagination?: PaginationParams,
    filters?: AuditFilters
  ): Promise<PaginatedResult<any>> {
    const { take, skip, cursor } = this.enforcePagination(pagination);

    const where: Record<string, unknown> = { tenantId: this.tenantId };
    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.resourceType) where.resourceType = filters.resourceType;
    if (filters?.action) where.action = filters.action;
    if (filters?.from || filters?.to) {
      where.timestamp = {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      };
    }

    const [data, totalCount] = await this.db.$transaction([
      this.db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: take + 1, // Fetch one extra to determine if there's a next page
        skip,
        cursor,
      }),
      this.db.auditLog.count({ where }),
    ]);

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
      totalCount,
    };
  }

  /**
   * Find all audit entries for a specific resource.
   */
  async findByResource(
    resourceType: string,
    resourceId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<any>> {
    const { take, skip, cursor } = this.enforcePagination(pagination);

    const where = {
      tenantId: this.tenantId,
      resourceType,
      resourceId,
    };

    const data = await this.db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: take + 1,
      skip,
      cursor,
    });

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
    };
  }

  // NOTE: No update() or delete() methods. Audit logs are immutable.
}
