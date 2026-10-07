export const runtime = 'edge';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { AuthorizationService } from '@/lib/auth/authorization';
import { SessionService } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * List all organizations the user belongs to.
 */
export async function GET(request: Request) {
  try {
    const session = await SessionService.getSession();
    if (!session) throw new Error('Unauthorized');

    const memberships = await db.membership.findMany({
      where: { userId: session.userId, status: 'Active' },
      include: {
        tenant: true,
        role: true,
      },
    });

    const organizations = memberships.map(m => ({
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      role: m.role?.name || "UNKNOWN",
      status: m.tenant.status,
      isActiveContext: m.tenant.id === session.tenantId,
    }));

    return successResponse(organizations);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Switch active organization context in the session.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId } = body;
    
    if (!tenantId) throw new Error('tenantId is required');

    // This service call now properly validates membership to prevent IDOR
    await SessionService.setTenantContext(tenantId);
    
    return successResponse({ message: 'Organization context switched successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
