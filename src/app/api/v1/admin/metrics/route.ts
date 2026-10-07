export const runtime = 'edge';
import { AuthorizationService } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api-response';
import { MetricsService } from '@/lib/observability/metrics';

export async function GET() {
  try {
    await AuthorizationService.authorize('admin', 'read');

    const metrics = await MetricsService.getDashboardMetrics();

    return successResponse(metrics);
  } catch (error) {
    return errorResponse(error);
  }
}
