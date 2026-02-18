import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { sendEmail, buildReminderEmail } from '@/lib/email';

// POST: Send a reminder email for a specific session
export async function POST(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await prisma.formSession.findFirst({
      where: { id: sessionId, companyId },
      include: {
        company: { select: { name: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 });
    }

    if (!session.clientEmail) {
      return NextResponse.json({ error: 'No email address for this client' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const formUrl = `${baseUrl}/form/${session.token}`;

    const email = buildReminderEmail(
      session.clientName || 'there',
      formUrl,
      session.company.name
    );
    email.to = session.clientEmail;

    const sent = await sendEmail(email);

    if (sent) {
      await prisma.formSession.update({
        where: { id: session.id },
        data: { reminderSentAt: new Date() },
      });
    }

    return NextResponse.json({
      success: sent,
      sentTo: session.clientEmail,
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
