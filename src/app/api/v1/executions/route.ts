export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    await AuthorizationService.authorize('workflows', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const url = new URL(request.url);
    const take = Math.min(parseInt(url.searchParams.get('take') || '20', 10), 100);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    const status = url.searchParams.get('status') || undefined;
    const workflowId = url.searchParams.get('workflowId') || undefined;

    const where: any = { tenantId: tenant!.id };
    if (status) where.status = status;
    if (workflowId) {
      where.version = { workflowId };
    }

    const data = await db.workflowRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      skip,
      include: {
        version: {
          select: { version: true, workflowId: true },
        },
      },
    });

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return successResponse({
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
