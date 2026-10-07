export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import db from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('customers', 'read');
    const { tenant } = await AuthorizationService.resolveContext();

    const customer = await db.customer.findFirst({
      where: { id, tenantId: tenant!.id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
      }
    });

    if (!customer) throw new NotFoundError('Customer not found');

    return successResponse(customer);
  } catch (error) {
    return errorResponse(error);
  }
}
