export const runtime = 'edge';
import { AuthorizationService } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AlertService } from '@/lib/observability/alerting';

export async function GET(request: Request) {
  try {
    await AuthorizationService.authorize('admin', 'read');

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    const alerts = AlertService.getRecent(limit);

    return successResponse({ alerts, count: alerts.length });
  } catch (error) {
    return errorResponse(error);
  }
}
