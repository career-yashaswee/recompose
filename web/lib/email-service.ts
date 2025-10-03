import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

/**
 * Sends a password reset email using Resend
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName = 'User',
}: PasswordResetEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: 'Reset your password - Recompose',
    html: generatePasswordResetHTML(resetUrl, userName),
    text: generatePasswordResetText(resetUrl, userName),
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Generates HTML content for password reset email
 */
function generatePasswordResetHTML(resetUrl: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
        .link-fallback {
          word-break: break-all;
          color: #2563eb;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Recompose</div>
          <h1 class="title">Reset Your Password</h1>
          <p class="subtitle">We received a request to reset your password</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>We received a request to reset your password for your Recompose account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}" class="link-fallback">${resetUrl}</a></p>
          
          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>If you continue to have problems, please contact our support team.</p>
          
          <p>Best regards,<br>The Recompose Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from Recompose. If you didn't request this email, you can safely ignore it.</p>
          <p>&copy; ${new Date().getFullYear()} Recompose. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text content for password reset email
 */
function generatePasswordResetText(resetUrl: string, userName: string): string {
  return `
Reset Your Password - Recompose

Hi ${userName},

We received a request to reset your password for your Recompose account. If you made this request, click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

If you continue to have problems, please contact our support team.

Best regards,
The Recompose Team

---
This email was sent from Recompose. If you didn't request this email, you can safely ignore it.
© ${new Date().getFullYear()} Recompose. All rights reserved.
  `.trim();
}

/**
 * Generic email sending function for other use cases
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  if (!html && !text) {
    throw new Error('Either html or text content must be provided');
  }

  let emailOptions: CreateEmailOptions;

  if (html && text) {
    emailOptions = {
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    };
  } else if (html) {
    emailOptions = {
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    };
  } else {
    emailOptions = {
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      text: text!,
    };
  }

  const { error } = await resend.emails.send(emailOptions);

  if (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
