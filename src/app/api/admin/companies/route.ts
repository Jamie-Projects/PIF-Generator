import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const adminId = await authenticateAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      approved: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ companies });
}

export async function PATCH(request: Request) {
  const adminId = await authenticateAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { companyId, approved } = await request.json();
  if (!companyId || typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'companyId and approved are required' }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: companyId },
    data: { approved },
    select: { id: true, name: true, email: true, approved: true },
  });

  return NextResponse.json({ company });
}
