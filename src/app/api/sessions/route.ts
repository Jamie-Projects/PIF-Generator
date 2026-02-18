import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, generateSessionToken } from '@/lib/auth';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';

export async function GET(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const sessions = await prisma.formSession.findMany({
    where: {
      companyId,
      ...(status ? { status: status as 'ACTIVE' | 'COMPLETED' | 'EXPIRED' } : {}),
    },
    include: {
      propertyForm: {
        select: {
          address: true,
          postcode: true,
          sellerName: true,
          sections: {
            select: {
              sectionKey: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = sessions.map(session => {
    const totalSections = BASPI_SECTIONS.length;
    const completedSections = session.propertyForm?.sections.filter(
      s => s.status === 'COMPLETED'
    ).length ?? 0;

    return {
      id: session.id,
      token: session.token,
      externalUserId: session.externalUserId,
      clientName: session.clientName,
      clientEmail: session.clientEmail,
      status: session.status,
      currentStep: session.currentStep,
      progress: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0,
      completedSections,
      totalSections,
      address: session.propertyForm?.address || '',
      postcode: session.propertyForm?.postcode || '',
      lastActivityAt: session.lastActivityAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt,
    };
  });

  return NextResponse.json({ sessions: result });
}

export async function POST(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { externalUserId, clientName, clientEmail } = body;

    const token = generateSessionToken();

    const session = await prisma.formSession.create({
      data: {
        companyId,
        token,
        externalUserId: externalUserId || null,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        propertyForm: {
          create: {
            sections: {
              create: BASPI_SECTIONS.map(section => ({
                sectionKey: section.key,
                title: section.title,
              })),
            },
          },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const formUrl = `${baseUrl}/form/${token}`;

    return NextResponse.json({
      sessionId: session.id,
      token: session.token,
      formUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
