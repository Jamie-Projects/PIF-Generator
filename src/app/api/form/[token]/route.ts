import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';

// GET: Load form data for a token-based session (client access)
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const session = await prisma.formSession.findUnique({
    where: { token: params.token },
    include: {
      company: { select: { name: true } },
      propertyForm: {
        include: {
          sections: {
            orderBy: { sectionKey: 'asc' },
          },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  if (session.status === 'EXPIRED') {
    return NextResponse.json({ error: 'This form has expired' }, { status: 410 });
  }

  // Sort sections according to BASPI_SECTIONS order
  const sectionOrder = BASPI_SECTIONS.map(s => s.key);
  const sortedSections = session.propertyForm?.sections
    .slice()
    .sort((a, b) => sectionOrder.indexOf(a.sectionKey) - sectionOrder.indexOf(b.sectionKey));

  return NextResponse.json({
    sessionId: session.id,
    companyName: session.company.name,
    status: session.status,
    currentStep: session.currentStep,
    form: {
      id: session.propertyForm?.id,
      address: session.propertyForm?.address,
      postcode: session.propertyForm?.postcode,
      sellerName: session.propertyForm?.sellerName,
      sellerEmail: session.propertyForm?.sellerEmail,
    },
    sections: sortedSections?.map(s => ({
      id: s.id,
      sectionKey: s.sectionKey,
      title: s.title,
      status: s.status,
      data: s.data,
      lastSavedAt: s.lastSavedAt,
    })),
  });
}

// PUT: Save section data (auto-save from client form)
export async function PUT(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await prisma.formSession.findUnique({
      where: { token: params.token },
      include: {
        propertyForm: true,
      },
    });

    if (!session || session.status === 'EXPIRED') {
      return NextResponse.json({ error: 'Form not found or expired' }, { status: 404 });
    }

    const body = await request.json();
    const { sectionKey, data, currentStep, formDetails } = body;

    // Update form-level details if provided
    if (formDetails && session.propertyForm) {
      await prisma.propertyForm.update({
        where: { id: session.propertyForm.id },
        data: {
          address: formDetails.address ?? undefined,
          postcode: formDetails.postcode ?? undefined,
          sellerName: formDetails.sellerName ?? undefined,
          sellerEmail: formDetails.sellerEmail ?? undefined,
        },
      });
    }

    // Update section data if provided
    if (sectionKey && session.propertyForm) {
      const hasData = data && Object.keys(data).length > 0;
      await prisma.formSection.updateMany({
        where: {
          formId: session.propertyForm.id,
          sectionKey,
        },
        data: {
          data: data ?? {},
          status: hasData ? 'IN_PROGRESS' : 'NOT_STARTED',
          lastSavedAt: new Date(),
        },
      });
    }

    // Update session
    await prisma.formSession.update({
      where: { id: session.id },
      data: {
        currentStep: currentStep ?? session.currentStep,
        lastActivityAt: new Date(),
        status: session.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Save form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
