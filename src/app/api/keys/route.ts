import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, generateApiKey } from '@/lib/auth';

export async function GET(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    const apiKey = await prisma.apiKey.create({
      data: {
        companyId,
        key: generateApiKey(),
        name: name || 'API Key',
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
    }, { status: 201 });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const companyId = await authenticateRequest(request);
  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    await prisma.apiKey.deleteMany({
      where: { id: keyId, companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
