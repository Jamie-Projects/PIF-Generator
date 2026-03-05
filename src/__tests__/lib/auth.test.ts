import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateApiKey,
  generateSessionToken,
  generateWebhookSecret,
} from '@/lib/auth';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-unit-tests';
});

describe('Auth utilities', () => {
  test('hashPassword creates a bcrypt hash', async () => {
    const hash = await hashPassword('test-password');
    expect(hash).toBeTruthy();
    expect(hash).not.toBe('test-password');
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('verifyPassword correctly verifies matching password', async () => {
    const hash = await hashPassword('my-secure-password');
    const result = await verifyPassword('my-secure-password', hash);
    expect(result).toBe(true);
  });

  test('verifyPassword rejects wrong password', async () => {
    const hash = await hashPassword('correct-password');
    const result = await verifyPassword('wrong-password', hash);
    expect(result).toBe(false);
  });

  test('generateToken creates a JWT', () => {
    const token = generateToken('company-123');
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  test('verifyToken decodes a valid JWT', () => {
    const token = generateToken('company-456');
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.companyId).toBe('company-456');
  });

  test('verifyToken returns null for invalid JWT', () => {
    const payload = verifyToken('invalid-token');
    expect(payload).toBeNull();
  });

  test('generateApiKey creates a prefixed key', () => {
    const key = generateApiKey();
    expect(key.startsWith('pif_')).toBe(true);
    expect(key.length).toBeGreaterThan(20);
  });

  test('generateApiKey creates unique keys', () => {
    const key1 = generateApiKey();
    const key2 = generateApiKey();
    expect(key1).not.toBe(key2);
  });

  test('generateSessionToken creates a URL-safe token', () => {
    const token = generateSessionToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(10);
    // Should be base64url safe
    expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
  });

  test('generateWebhookSecret creates a prefixed secret', () => {
    const secret = generateWebhookSecret();
    expect(secret.startsWith('whsec_')).toBe(true);
    expect(secret.length).toBeGreaterThan(20);
  });
});
