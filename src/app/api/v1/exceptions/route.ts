export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { ExceptionService } from '@/lib/exceptions/exception-service';
import { successResponse, errorResponse } from '@/lib/api-response';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    // In production, AuthorizationService.resolveContext() determines tenant
    const tenantId = 'tenant_1'; 
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    const where: any = { tenantId };
    if (status) where.status = status;
    else where.status = { notIn: ['CLOSED', 'RESOLVED'] }; // Default inbox

    const exceptions = await db.exceptionCase.findMany({
      where,
      orderBy: [
        { priority: 'asc' }, // Will need enum sorting or manual priority map sorting in real prod, assume string sort for mockup
        { dueAt: 'asc' }
      ],
      take: 50
    });
    
    return successResponse(exceptions);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = 'tenant_1';
    const body = await request.json();
    
    const exc = await ExceptionService.createException({
      tenantId,
      ...body
    });
    return successResponse(exc, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
