import { buildReminderEmail } from '@/lib/email';

describe('Email utilities', () => {
  test('buildReminderEmail creates an email with correct subject', () => {
    const email = buildReminderEmail('John', 'https://example.com/form/abc', 'Test Estate Agents');
    expect(email.subject).toContain('Property Information Form');
  });

  test('buildReminderEmail includes client name in body', () => {
    const email = buildReminderEmail('John', 'https://example.com/form/abc', 'Test Estate Agents');
    expect(email.html).toContain('John');
  });

  test('buildReminderEmail includes form URL in body', () => {
    const formUrl = 'https://example.com/form/abc123';
    const email = buildReminderEmail('Jane', formUrl, 'Test Co');
    expect(email.html).toContain(formUrl);
  });

  test('buildReminderEmail includes company name in body', () => {
    const email = buildReminderEmail('Client', 'https://example.com', 'Smith & Partners');
    expect(email.html).toContain('Smith & Partners');
  });

  test('buildReminderEmail has empty to field (set by caller)', () => {
    const email = buildReminderEmail('Test', 'https://example.com', 'Co');
    expect(email.to).toBe('');
  });
});
