export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import db from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    let dbStatus = 'UNKNOWN';
    let dbLatencyMs: null | number = null;
    
    // Check Database Dependency
    try {
      const start = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbStatus = 'UP';
    } catch (e: any) {
      dbStatus = 'DOWN';
      logger.error({ message: 'Readiness check DB failure', error: e.message });
    }

    const overallStatus = dbStatus === 'UP' ? 'UP' : 'DEGRADED';

    const payload = {
      status: overallStatus,
      dependencies: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      }
    };

    if (overallStatus !== 'UP') {
      return NextResponse.json({ success: false, error: { code: 'NOT_READY', message: 'System degraded' }, data: payload }, { status: 503 });
    }

    return successResponse(payload);
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'NOT_READY', message: 'Readiness check failed' } }, { status: 503 });
  }
}
