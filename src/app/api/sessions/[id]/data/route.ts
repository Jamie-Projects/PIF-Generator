import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await prisma.formSession.findFirst({
    where: { id: params.id, companyId },
    include: {
      propertyForm: {
        include: {
          sections: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Build a lookup of saved section data
  const savedSections = new Map(
    (session.propertyForm?.sections ?? []).map(s => [s.sectionKey, s])
  );

  // Build consistent structure from schema — every field always present
  const sections: Record<string, {
    title: string;
    part: string;
    status: string;
    lastSavedAt: string | null;
    fields: Record<string, unknown>;
  }> = {};

  for (const sectionDef of BASPI_SECTIONS) {
    const saved = savedSections.get(sectionDef.key);
    const savedData = (saved?.data as Record<string, unknown>) ?? {};

    const fields: Record<string, unknown> = {};
    for (const field of sectionDef.fields) {
      const value = savedData[field.key];
      fields[field.key] = value !== undefined ? value : null;
    }

    sections[sectionDef.key] = {
      title: sectionDef.title,
      part: sectionDef.part,
      status: String(saved?.status ?? 'NOT_STARTED'),
      lastSavedAt: saved?.lastSavedAt?.toISOString() ?? null,
      fields,
    };
  }

  return NextResponse.json({
    data: {
      sessionId: session.id,
      status: session.status,
      completedAt: session.completedAt,
      property: {
        address: session.propertyForm?.address ?? null,
        postcode: session.propertyForm?.postcode ?? null,
      },
      seller: {
        name: session.propertyForm?.sellerName ?? null,
        email: session.propertyForm?.sellerEmail ?? null,
      },
      sections,
    },
  });
}
