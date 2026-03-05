import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(companyId: string): string {
  return jwt.sign({ companyId }, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): { companyId: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { companyId: string };
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

  let companyId: string | null = null;

  // Try Bearer token (JWT from dashboard login)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    companyId = payload?.companyId ?? null;
  }

  // Try API key
  if (!companyId && authHeader.startsWith('ApiKey ')) {
    const key = authHeader.slice(7);
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (apiKey && apiKey.active) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });
      companyId = apiKey.companyId;
    }
  }

  if (!companyId) return null;

  // Check company is approved
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { approved: true },
  });
  if (!company?.approved) return null;

  return companyId;
}

export async function isAdmin(companyId: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { email: true },
  });
  return company?.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function authenticateAdmin(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload?.companyId) return null;
  const admin = await isAdmin(payload.companyId);
  return admin ? payload.companyId : null;
}
