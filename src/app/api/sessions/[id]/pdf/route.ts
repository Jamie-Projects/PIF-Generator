import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { generatePIF } from '@/lib/pdf';

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
          sections: {
            orderBy: { sectionKey: 'asc' },
          },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const form = session.propertyForm;
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const address = [form.address, form.postcode].filter(Boolean).join(', ');

  const doc = generatePIF(
    address,
    form.sellerName,
    form.sections.map(s => ({
      sectionKey: s.sectionKey,
      title: s.title,
      data: s.data as Record<string, unknown>,
    }))
  );

  const pdfBuffer = doc.output('arraybuffer');

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="PIF-${form.postcode || 'form'}.pdf"`,
    },
  });
}
