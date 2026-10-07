export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { auditService } from '@/lib/audit';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const sessionInfo = await SessionService.getSession();
    
    if (sessionInfo) {
      await auditService.log({
        actorType: 'USER',
        actorId: sessionInfo.userId,
        action: 'logout',
        resourceType: 'session',
        resourceId: sessionInfo.sessionId,
        tenantId: sessionInfo.tenantId
      });
      
      await SessionService.destroySession();
    }

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
