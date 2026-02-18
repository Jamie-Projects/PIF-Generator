import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fireWebhooks } from '@/lib/webhooks';

// Called internally when a form is completed via the token-based form
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { token } = body;

    // Verify via token (from client-side form completion)
    const session = await prisma.formSession.findFirst({
      where: { id: params.id, token },
      include: {
        propertyForm: {
          include: { sections: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Mark session and all sections as completed
    await prisma.formSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    if (session.propertyForm) {
      await prisma.formSection.updateMany({
        where: { formId: session.propertyForm.id },
        data: { status: 'COMPLETED' },
      });

      // Stamp server-side IP into declaration section audit trail
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
      const declarationSection = session.propertyForm.sections.find(
        s => s.sectionKey === 'declaration'
      );
      if (declarationSection) {
        const existingData = (declarationSection.data as Record<string, unknown>) || {};
        await prisma.formSection.update({
          where: { id: declarationSection.id },
          data: {
            data: { ...existingData, signature_ip: clientIp },
          },
        });
      }
    }

    // Fire webhooks
    await fireWebhooks(session.companyId, 'session.completed', {
      sessionId: session.id,
      externalUserId: session.externalUserId,
      clientName: session.clientName,
      completedAt: new Date().toISOString(),
      address: session.propertyForm?.address,
      postcode: session.propertyForm?.postcode,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
