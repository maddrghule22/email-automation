export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getD1Exceptions } from '@/lib/d1';
import { SessionService } from '@/lib/auth/session';
import { AuthorizationService } from '@/lib/auth/authorization';

export async function GET(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) {
        tenantId = session.tenantId;
      }
    } catch {}

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;

    const exceptions = await getD1Exceptions(tenantId, status);
    
    return successResponse(exceptions);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) tenantId = session.tenantId;
    } catch {}

    const body = await request.json();
    const { getD1Database } = await import('@/lib/d1');
    const d1 = getD1Database();

    const id = crypto.randomUUID();
    const caseNumber = `EXC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    if (d1) {
      await d1
        .prepare('INSERT INTO exceptions (id, tenantId, caseNumber, title, description, category, priority, status, financialImpact, requiredPowerLevel, assignedTo, dueAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(
          id,
          tenantId,
          caseNumber,
          body.title || 'Workflow Exception Case',
          body.description || null,
          body.category || 'OPERATIONS',
          body.priority || 'MEDIUM',
          'OPEN',
          body.financialImpact || 0,
          body.requiredPowerLevel || 50,
          body.assignedTo || 'Unassigned',
          body.dueAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          now
        )
        .run();
    }

    const created = {
      id,
      tenantId,
      caseNumber,
      title: body.title,
      description: body.description,
      priority: body.priority || 'MEDIUM',
      status: 'OPEN',
      financialImpact: body.financialImpact || 0,
      requiredPowerLevel: body.requiredPowerLevel || 50,
      createdAt: now,
    };

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
