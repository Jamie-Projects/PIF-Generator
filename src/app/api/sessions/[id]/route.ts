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

  return NextResponse.json({ session });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.formSession.deleteMany({
    where: { id: params.id, companyId },
  });

  return NextResponse.json({ success: true });
}
