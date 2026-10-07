import db from '@/lib/db';
import { logger } from '@/lib/logger';


export class OutboundWebhookService {
  /**
   * Dispatches an event to all subscribed outbound webhooks for a tenant.
   */
  static async dispatchEvent(tenantId: string, eventType: string, payload: any) {
    // 1. Find active webhooks for this event type
    const webhooks = await db.integrationWebhook.findMany({
      where: {
        tenantId,
        direction: 'OUTBOUND',
        enabled: true,
        events: {
          has: eventType
        }
      }
    });

    if (webhooks.length === 0) return;

    // 2. Queue delivery jobs
    for (const webhook of webhooks) {
      await db.jobRecord.create({
        data: {
          queue: 'webhook-delivery',
          jobType: 'outbound-webhook',
          tenantId,
          payload: {
            webhookId: webhook.id,
            eventType,
            data: payload,
          },
          maxRetries: 3
        }
      });
      logger.info({ message: 'Outbound webhook queued', webhookId: webhook.id, eventType });
    }
  }

  /**
   * Worker handler that actually sends the webhook
   */
  static async deliverWebhook(webhookId: string, eventType: string, data: any) {
    const webhook = await db.integrationWebhook.findUnique({
      where: { id: webhookId }
    });

    if (!webhook || !webhook.endpoint) throw new Error('Invalid webhook configuration');

    // Create Delivery Record
    const delivery = await db.integrationWebhookDelivery.create({
      data: {
        webhookId,
        tenantId: webhook.tenantId,
        status: 'PENDING',
        payload: { eventType, data },
      }
    });

    try {
      // Create Payload and Signature
      const timestamp = Date.now().toString();
      const body = JSON.stringify({ eventType, data, timestamp });
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Vorynex-Event': eventType,
        'X-Vorynex-Timestamp': timestamp
      };

      if (webhook.signingSecret) {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          enc.encode(webhook.signingSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sigBuf = await crypto.subtle.sign(
          'HMAC',
          key,
          enc.encode(`${timestamp}.${body}`)
        );
        const signature = Array.from(new Uint8Array(sigBuf), b => b.toString(16).padStart(2, '0')).join('');
        headers['X-Vorynex-Signature'] = `t=${timestamp},v1=${signature}`;
      }

      // 3. Transmit (with timeout and SSRF protection)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // SSRF protection
      const url = new URL(webhook.endpoint);
      if (url.hostname === 'localhost' || url.hostname.startsWith('127.')) {
        throw new Error('Internal addresses blocked');
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      await db.integrationWebhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: response.ok ? 'SUCCESS' : 'FAILED',
          responseCode: response.status,
          completedAt: new Date()
        }
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}`);
      }

    } catch (error: any) {
      await db.integrationWebhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date()
        }
      });
      // Rethrow to trigger exponential backoff in the JobWorker
      throw error;
    }
  }
}
