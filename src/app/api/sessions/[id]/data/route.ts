import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

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

  // Flatten all section data into a single object
  const formData: Record<string, unknown> = {
    address: session.propertyForm?.address,
    postcode: session.propertyForm?.postcode,
    sellerName: session.propertyForm?.sellerName,
    sellerEmail: session.propertyForm?.sellerEmail,
    status: session.status,
    completedAt: session.completedAt,
  };

  const sections: Record<string, unknown> = {};
  for (const section of session.propertyForm?.sections ?? []) {
    sections[section.sectionKey] = {
      status: section.status,
      data: section.data,
      lastSavedAt: section.lastSavedAt,
    };
  }

  formData.sections = sections;

  return NextResponse.json({ data: formData });
}
