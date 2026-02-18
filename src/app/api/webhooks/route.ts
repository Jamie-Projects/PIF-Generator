import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, generateWebhookSecret } from '@/lib/auth';

export async function GET(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { companyId },
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, events } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const secret = generateWebhookSecret();

    const webhook = await prisma.webhook.create({
      data: {
        companyId,
        url,
        events: events || ['session.completed'],
        secret,
      },
    });

    return NextResponse.json({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
    }, { status: 201 });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');
    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    await prisma.webhook.deleteMany({
      where: { id: webhookId, companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
