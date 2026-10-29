export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateD1Exception, getD1Exceptions, logD1Audit } from '@/lib/d1';
import { SessionService } from '@/lib/auth/session';
import { AuthorizationService } from '@/lib/auth/authorization';
import { checkAccessSpecifier, RoleIdentifier } from '@/lib/auth/hierarchy-power';
import { ForbiddenError } from '@/lib/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, action } = body; // 'RESOLVED', 'REJECTED', 'ESCALATED'

    let user = { id: 'user-admin-yash', name: 'Yash Salunke', roleId: 'role-super-admin' };
    let tenantId = 'tenant-vorynex-prod';

    try {
      const auth = await AuthorizationService.resolveContext();
      if (auth?.user) user = auth.user;
      if (auth?.tenant) tenantId = auth.tenant.id;
    } catch {
      const session = await SessionService.getSession();
      if (session) {
        user.id = session.userId;
        if (session.tenantId) tenantId = session.tenantId;
      }
    }

    // Find the exception to evaluate financial amount
    const exceptions = await getD1Exceptions(tenantId);
    const exc = exceptions.find((e) => e.id === id);

    if (exc && status === 'RESOLVED') {
      const rawRole = (user.roleId || 'SUPER_ADMIN').toUpperCase();
      const roleKey: RoleIdentifier = rawRole.includes('ADMIN')
        ? 'SUPER_ADMIN'
        : rawRole.includes('MANAGER')
        ? 'OPERATIONS_MANAGER'
        : rawRole.includes('OPERATOR')
        ? 'AUTOMATION_OPERATOR'
        : 'COMPLIANCE_AUDITOR';

      const check = checkAccessSpecifier(roleKey, 'FINANCIAL_APPROVAL', {
        amountUsd: exc.financialImpact,
      });

      if (!check.allowed) {
        throw new ForbiddenError(check.reason || 'Insufficient power level to approve this exception.');
      }
    }

    const updated = await updateD1Exception(id, {
      status: status || 'RESOLVED',
      resolvedBy: `${user.name} (${user.roleId || 'Admin'})`,
    });

    await logD1Audit({
      actorType: 'USER',
      actorId: user.id,
      action: `exception.${(status || 'RESOLVED').toLowerCase()}`,
      resourceType: 'exception',
      resourceId: id,
      tenantId,
      metadata: { financialImpact: exc?.financialImpact, resolvedBy: user.name },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
