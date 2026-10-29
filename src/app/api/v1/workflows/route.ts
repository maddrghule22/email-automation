export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getD1Workflows, createD1Workflow } from '@/lib/d1';
import { SessionService } from '@/lib/auth/session';
import { checkAccessSpecifier, RoleIdentifier } from '@/lib/auth/hierarchy-power';
import { ForbiddenError, ValidationError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) {
        tenantId = session.tenantId;
      }
    } catch {}

    const workflows = await getD1Workflows(tenantId);
    
    return successResponse({
      data: workflows,
      pagination: {
        total: workflows.length,
        hasMore: false,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    let roleKey: RoleIdentifier = 'SUPER_ADMIN';

    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) tenantId = session.tenantId;
    } catch {}

    // Check Access Specifier: Level 3 (Manager) or higher required to create workflows
    const check = checkAccessSpecifier(roleKey, 'WORKFLOW_CREATE');
    if (!check.allowed) {
      throw new ForbiddenError(check.reason || 'Insufficient power level to create workflows.');
    }

    const body = await request.json();
    if (!body.name) {
      throw new ValidationError('Workflow name is required');
    }

    const workflow = await createD1Workflow(tenantId, {
      name: body.name,
      description: body.description,
    });

    return successResponse(workflow, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
