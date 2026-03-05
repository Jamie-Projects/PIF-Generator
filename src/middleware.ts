import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory rate limiter (works for single-instance deployments)
const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 60_000);

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= max;
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

// Rate limit tiers
const TIERS = [
  { pattern: /^\/api\/auth\/(login|register)$/, max: 10, windowMs: 60_000 },
  { pattern: /^\/api\/chimnie\//, max: 30, windowMs: 60_000 },
  { pattern: /^\/api\/form\//, max: 60, windowMs: 60_000 },
  { pattern: /^\/api\//, max: 120, windowMs: 60_000 },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const ip = getIp(request);
  const tier = TIERS.find(t => t.pattern.test(pathname));
  if (!tier) return NextResponse.next();

  const key = `${ip}:${tier.pattern.source}`;
  if (!checkRateLimit(key, tier.max, tier.windowMs)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
