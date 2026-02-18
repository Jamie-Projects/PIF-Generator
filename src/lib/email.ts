// Email service abstraction
// In production, plug in SendGrid, AWS SES, Postmark, etc.
// For now, logs emails to console.

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // Check for email provider configuration
  if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid(params);
  }

  // Default: log to console (development mode)
  console.log('=== EMAIL (dev mode) ===');
  console.log(`To: ${params.to}`);
  console.log(`Subject: ${params.subject}`);
  console.log(`Body: ${params.html}`);
  console.log('========================');
  return true;
}

async function sendViaSendGrid(params: EmailParams): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@pif-generator.com' },
        subject: params.subject,
        content: [{ type: 'text/html', value: params.html }],
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('SendGrid email failed:', error);
    return false;
  }
}

export function buildReminderEmail(clientName: string, formUrl: string, companyName: string): EmailParams {
  return {
    to: '', // will be set by caller
    subject: `Reminder: Please complete your Property Information Form`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Property Information Form Reminder</h2>
        <p>Hi ${clientName || 'there'},</p>
        <p>You have an incomplete Property Information Form from <strong>${companyName}</strong>.</p>
        <p>You can pick up right where you left off - all your progress has been saved.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${formUrl}"
             style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Continue Your Form
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If you've already completed this form, please disregard this email.</p>
      </div>
    `,
  };
}
