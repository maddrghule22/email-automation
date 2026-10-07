export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import { IngestionService } from '@/lib/documents/ingestion/ingestion-service';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    await AuthorizationService.authorize('documents', 'create');
    const { tenant } = await AuthorizationService.resolveContext();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const record = await IngestionService.ingest({
      tenantId: tenant!.id,
      sourceType: 'UPLOAD',
      fileBuffer: buffer,
      originalFilename: file.name,
      contentType: file.type,
      idempotencyKey: formData.get('idempotencyKey') as string | undefined,
    });

    return successResponse(record, 201);
  } catch (error: any) {
    if (error.message.includes('50MB') || error.message.includes('Dangerous file')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return errorResponse(error);
  }
}
