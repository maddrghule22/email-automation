export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    await AuthorizationService.authorize('transactions', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const url = new URL(request.url);
    const take = Math.min(parseInt(url.searchParams.get('take') || '20', 10), 100);
    const skip = parseInt(url.searchParams.get('skip') || '0', 10);
    const type = url.searchParams.get('type') || 'Invoice';

    if (type !== 'Invoice') {
      return errorResponse(new Error('Currently only Invoice transactions are implemented API-side'));
    }

    const where = { tenantId: tenant!.id };

    const data = await db.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      skip,
      include: { supplier: true },
    });

    const hasMore = data.length > take;
    if (hasMore) data.pop();

    return successResponse({ data, nextCursor: hasMore ? data[data.length - 1]?.id : undefined });
  } catch (error) {
    return errorResponse(error);
  }
}
