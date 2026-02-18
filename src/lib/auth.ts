import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(companyId: string): string {
  return jwt.sign({ companyId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { companyId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { companyId: string };
  } catch {
    return null;
  }
}

export function generateApiKey(): string {
  return `pif_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

export async function authenticateRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  // Try Bearer token (JWT from dashboard login)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    return payload?.companyId ?? null;
  }

  // Try API key
  if (authHeader.startsWith('ApiKey ')) {
    const key = authHeader.slice(7);
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (apiKey && apiKey.active) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });
      return apiKey.companyId;
    }
  }

  return null;
}
