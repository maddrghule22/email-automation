export const runtime = 'edge';
import { successResponse } from '@/lib/api-response';

export async function GET() {
  // Liveness check: Is the Node process itself running and accepting HTTP connections?
  // MUST NOT query DB or queues, to prevent spurious restarts during backend latency spikes.
  return successResponse({
    status: 'UP',
    version: '0.2.0',
    timestamp: new Date().toISOString()
  });
}
