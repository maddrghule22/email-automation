export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { DocumentIngestionService } from '@/lib/documents/ingestion';

export async function GET(request: Request) {
  try {
    await AuthorizationService.authorize('documents', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const url = new URL(request.url);
    const take = Math.min(parseInt(url.searchParams.get('take') || '20', 10), 100);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    const status = url.searchParams.get('status') || undefined;

    let data: any[] = [];
    try {
      const { getD1Documents } = await import('@/lib/d1');
      data = await getD1Documents(tenant!.id, status);
    } catch {}

    if (data.length === 0) {
      try {
        const where: any = { tenantId: tenant!.id };
        if (status) where.status = status;

        data = await db.document.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: take + 1,
          skip,
          select: {
            id: true, title: true, status: true, source: true,
            documentType: true, confidence: true, createdAt: true,
          },
        });
      } catch {
        data = [];
      }
    }

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return successResponse({ data, nextCursor: hasMore ? data[data.length - 1]?.id : undefined });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await AuthorizationService.authorize('documents', 'create');
    const { tenant } = await AuthorizationService.resolveContext();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) throw new Error('File is required');

    const buffer = Buffer.from(await file.arrayBuffer());

    let document: any;
    try {
      document = await DocumentIngestionService.ingest({
        tenantId: tenant!.id,
        source: 'UPLOAD',
        file: buffer,
        fileName: file.name,
        mimeType: file.type,
      });
    } catch {
      // In Edge without full pipeline workers, save directly to D1
      const { createD1Document } = await import('@/lib/d1');
      document = await createD1Document(tenant!.id, {
        title: file.name,
        fileName: file.name,
        mimeType: file.type,
        fileSize: buffer.length,
        status: 'PARSED'
      });
    }

    return successResponse(document, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
