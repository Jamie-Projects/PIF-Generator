import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, generateApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && email.toLowerCase() === adminEmail.toLowerCase();

    const company = await prisma.company.create({
      data: {
        name,
        email,
        passwordHash,
        approved: !!isAdmin,
        apiKeys: {
          create: {
            key: generateApiKey(),
            name: 'Default',
          },
        },
      },
      include: {
        apiKeys: true,
      },
    });

    const token = generateToken(company.id);

    return NextResponse.json({
      token,
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        approved: company.approved,
      },
      apiKey: company.apiKeys[0].key,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
