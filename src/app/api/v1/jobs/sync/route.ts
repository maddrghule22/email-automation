export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { SyncWorker } from '@/lib/integrations/sync-worker';
import { successResponse, errorResponse } from '@/lib/api-response';

export const maxDuration = 300; // Allow 5 minutes for syncing emails

export async function POST(request: Request) {
  try {
    // In production, you would authenticate this request (e.g. using a CRON_SECRET token)
    // to prevent unauthorized triggers.
    
    const result = await SyncWorker.runSync();
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  return POST(request);
}
