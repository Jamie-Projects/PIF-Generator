import crypto from 'crypto';
import { prisma } from './prisma';

export async function fireWebhooks(companyId: string, event: string, payload: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      companyId,
      active: true,
      events: { has: event },
    },
  });

  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const timestamp = Date.now().toString();
      const body = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PIF-Signature': signature,
          'X-PIF-Timestamp': timestamp,
          'X-PIF-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status}`);
      }
    })
  );

  return results;
}
