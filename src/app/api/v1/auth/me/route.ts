export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { AuthorizationService } from '@/lib/auth/authorization';
import { getD1AuthContext, getD1AllTenants } from '@/lib/d1';
import { HIERARCHY_ROLES, RoleIdentifier } from '@/lib/auth/hierarchy-power';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await SessionService.getSession();
    let authContext: any = null;

    if (session) {
      try {
        authContext = await AuthorizationService.resolveContext();
      } catch {
        authContext = await getD1AuthContext(session.userId, session.tenantId);
      }
    }

    // Default executive databrick context if not signed in
    if (!authContext) {
      authContext = await getD1AuthContext('user-admin-yash', 'tenant-vorynex-prod');
    }

    const allBricks = await getD1AllTenants();

    const user = authContext?.user || {
      id: 'user-admin-yash',
      email: 'admin@vorynex.com',
      name: 'Yash Salunke',
    };

    const tenant = authContext?.tenant || {
      id: 'tenant-vorynex-prod',
      name: 'Vorynex Global Enterprise',
      slug: 'vorynex-enterprise',
    };

    const rawRole = authContext?.roles?.[0] || {};
    const roleKey = (
      rawRole.name?.toUpperCase().includes('ADMIN')
        ? 'SUPER_ADMIN'
        : rawRole.name?.toUpperCase().includes('MANAGER')
        ? 'OPERATIONS_MANAGER'
        : rawRole.name?.toUpperCase().includes('OPERATOR')
        ? 'AUTOMATION_OPERATOR'
        : 'COMPLIANCE_AUDITOR'
    ) as RoleIdentifier;

    const powerRole = HIERARCHY_ROLES[roleKey] || HIERARCHY_ROLES.SUPER_ADMIN;

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      databrick: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status || 'Active',
      },
      role: powerRole,
      allDatabricks: allBricks,
      hierarchy: Object.values(HIERARCHY_ROLES),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
