import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { authenticateRequest, generateSessionToken } from '@/lib/auth';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';
import {
  getPropertyByAddress,
  normaliseChimnieResponse,
  mapToBaspiFields,
  countPrepopulatedFields,
  estimateTimeSaved,
} from '@/lib/chimnie';

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
    const {
      externalUserId, clientName, clientEmail,
      propertyAddress, propertyPostcode,
      sellerName, sellerEmail,
      autocompleteSession,
    } = body;

    if (!propertyAddress || !propertyPostcode) {
      return NextResponse.json(
        { error: 'propertyAddress and propertyPostcode are required' },
        { status: 400 }
      );
    }

    const token = generateSessionToken();

    // Create session + form + sections
    const session = await prisma.formSession.create({
      data: {
        companyId,
        token,
        externalUserId: externalUserId || null,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        propertyForm: {
          create: {
            address: propertyAddress,
            postcode: propertyPostcode,
            sellerName: sellerName || '',
            sellerEmail: sellerEmail || '',
            sections: {
              create: BASPI_SECTIONS.map(section => ({
                sectionKey: section.key,
                title: section.title,
              })),
            },
          },
        },
      },
      include: {
        propertyForm: {
          select: {
            id: true,
            sections: {
              select: { id: true, sectionKey: true },
            },
          },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const formUrl = `${baseUrl}/form/${token}`;

    // Attempt Chimnie lookup and prepopulation
    let chimnieStatus: 'prepopulated' | 'not_found' | 'unavailable' | 'skipped' = 'skipped';
    let chimnieMessage: string | undefined;
    let fieldCount = 0;
    let timeSaved = 0;

    try {
      const raw = await getPropertyByAddress(propertyAddress, autocompleteSession);
      const normalised = normaliseChimnieResponse(raw);
      const mapped = mapToBaspiFields(normalised);
      fieldCount = countPrepopulatedFields(mapped);
      timeSaved = estimateTimeSaved(fieldCount);

      if (fieldCount > 0 && session.propertyForm) {
        // Write prepopulated data into each matching section
        const sectionMap = new Map(
          session.propertyForm.sections.map(s => [s.sectionKey, s.id])
        );

        const updates = Object.entries(mapped)
          .filter(([key]) => sectionMap.has(key))
          .map(([key, data]) =>
            prisma.formSection.update({
              where: { id: sectionMap.get(key)! },
              data: {
                data: data as Prisma.InputJsonValue,
                status: 'IN_PROGRESS',
                lastSavedAt: new Date(),
              },
            })
          );

        if (updates.length > 0) {
          await prisma.$transaction(updates);
        }

        chimnieStatus = 'prepopulated';
      } else {
        chimnieStatus = 'not_found';
        chimnieMessage = 'Property found but no mappable data available.';
      }
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        chimnieStatus = 'not_found';
        chimnieMessage = 'Property not found in Chimnie. The seller will need to fill in all fields manually.';
      } else {
        chimnieStatus = 'unavailable';
        chimnieMessage = 'Chimnie service unavailable. The seller will need to fill in all fields manually.';
        console.error('Chimnie lookup failed during session creation:', error);
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      token: session.token,
      formUrl,
      property: {
        address: propertyAddress,
        postcode: propertyPostcode,
      },
      chimnieStatus,
      chimnieMessage,
      fieldCount,
      timeSaved,
    }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
