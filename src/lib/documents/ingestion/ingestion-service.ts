import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';


interface IngestionPayload {
  tenantId: string;
  sourceType: 'EMAIL' | 'API' | 'UPLOAD' | 'ERP' | 'SFTP';
  sourceIntegrationId?: string;
  sourceReference?: string;
  contentType?: string;
  fileBuffer?: Buffer;
  originalFilename?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export class IngestionService {
  /**
   * Main entrypoint for all data entering the system.
   */
  static async ingest(payload: IngestionPayload) {
    const { tenantId, sourceType, idempotencyKey, fileBuffer, originalFilename, contentType } = payload;
    
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = await db.ingestionRecord.findFirst({
        where: { tenantId, idempotencyKey }
      });
      if (existing) {
        logger.info({ message: 'Ingestion skipped (duplicate idempotency key)', idempotencyKey });
        return existing;
      }
    }

    // 2. File Security (Malware, MIME checking conceptual placeholder)
    if (fileBuffer) {
      if (fileBuffer.length > 50 * 1024 * 1024) {
        throw new Error('File exceeds 50MB limit');
      }
      
      const suspiciousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.vbs', '.js'];
      if (originalFilename && suspiciousExtensions.some(ext => originalFilename.toLowerCase().endsWith(ext))) {
        throw new Error('Dangerous file extension blocked');
      }
    }

    // 3. Storage
    let fileReference = null;
    let contentHash = null;
    if (fileBuffer) {
      // Generate checksum for duplicate detection
      const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(fileBuffer));
      contentHash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
      // e.g. upload to S3
      fileReference = `tenant-${tenantId}/ingestions/${crypto.randomUUID()}-${originalFilename || 'unnamed'}`;
    }

    // 4. Create Ingestion Record
    const record = await db.$transaction(async (tx) => {
      const ingestion = await tx.ingestionRecord.create({
        data: {
          tenantId,
          sourceType,
          sourceIntegrationId: payload.sourceIntegrationId,
          sourceReference: payload.sourceReference,
          contentType,
          fileReference,
          idempotencyKey,
          status: 'QUEUED',
          correlationId: crypto.randomUUID(),
        }
      });

      // 5. Create underlying Document mapping
      if (fileBuffer) {
        const doc = await tx.document.create({
          data: {
            tenantId,
            ingestionId: ingestion.id,
            title: originalFilename || 'Untitled Document',
            originalFilename,
            mimeType: contentType,
            fileSize: fileBuffer.length,
            storageRef: fileReference,
            source: sourceType,
            status: 'QUEUED',
            contentHash,
            metadata: payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : null,
          }
        });

        // 6. Queue Background Job for Pipeline
        await tx.jobRecord.create({
          data: {
            queue: 'document-processing',
            jobType: 'document-pipeline',
            tenantId,
            payload: { documentId: doc.id },
            priority: 10,
            maxRetries: 3
          }
        });
      }

      return ingestion;
    });

    // 7. Emit Domain Event
    await eventBus.publish({
      eventId: crypto.randomUUID(),
      eventType: 'DataIngested',
      aggregateType: 'IngestionRecord',
      aggregateId: record.id,
      tenantId,
      version: 1,
      timestamp: new Date().toISOString(),
      payload: { sourceType, originalFilename }
    });

    return record;
  }
}
