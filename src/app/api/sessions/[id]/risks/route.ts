import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { analyseRisks } from '@/lib/riskAnalysis';

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
        include: { sections: true },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const sections = (session.propertyForm?.sections ?? []).map(s => ({
    sectionKey: s.sectionKey,
    data: s.data as Record<string, unknown>,
  }));

  const summary = analyseRisks(
    sections,
    session.propertyForm?.address || '',
    session.propertyForm?.sellerName || ''
  );

  return NextResponse.json({
    risks: {
      generatedAt: summary.generatedAt,
      propertyAddress: summary.propertyAddress,
      sellerName: summary.sellerName,
      totalChecked: summary.totalChecked,
      redFlags: summary.redFlags.map(f => ({
        level: f.level,
        section: f.section,
        field: f.field,
        summary: f.summary,
        advice: f.advice,
      })),
      amberFlags: summary.amberFlags.map(f => ({
        level: f.level,
        section: f.section,
        field: f.field,
        summary: f.summary,
        advice: f.advice,
      })),
      greenCount: summary.greenCount,
    },
  });
}
