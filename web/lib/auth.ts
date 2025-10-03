import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';
import { nextCookies } from 'better-auth/next-js';
import {
  sendPasswordResetEmail,
  sendEmailVerification,
} from '@/lib/email-service';
import crypto from 'crypto';

type SendEmailParams = { to: string; subject: string; text: string };

// This function is used for general email sending
// For password reset, we use the dedicated sendPasswordResetEmail function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!params.to || !params.subject || !params.text) return;
  console.log('General email send requested:', params.subject);
}

/**
 * Generates a 6-digit OTP from a token
 */
export function generateOTPFromToken(token: string): string {
  // Create a hash from the token
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  // Take the first 6 characters and convert to number, then format as 6-digit string
  const otpNumber = parseInt(hash.substring(0, 8), 16) % 1000000;
  return otpNumber.toString().padStart(6, '0');
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false, // Disable auto sign-in to require email verification
    requireEmailVerification: true, // This is required for email verification to work
    sendResetPassword: async ({ user, url }): Promise<void> => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl: url,
          userName: user.name || 'User',
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
      }
    },
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true, // This is the key setting that was missing!
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({
      user,
      token,
    }: {
      user: { email: string; name?: string };
      token: string;
    }): Promise<void> => {
      try {
        console.log('=== EMAIL VERIFICATION TRIGGERED ===');
        console.log('Sending verification email to:', user.email);
        console.log('Verification token:', token);

        // Generate a 6-digit OTP from the token
        const otpCode = generateOTPFromToken(token);
        console.log('Generated OTP:', otpCode);

        // Create verification URL with token
        const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
        const verificationUrl = `${baseURL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
        console.log('Verification URL:', verificationUrl);

        await sendEmailVerification({
          to: user.email,
          otpCode,
          userName: user.name || 'User',
          verificationUrl,
        });

        console.log('Verification email sent successfully to:', user.email);
        console.log('=== EMAIL VERIFICATION COMPLETED ===');
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
      }
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
