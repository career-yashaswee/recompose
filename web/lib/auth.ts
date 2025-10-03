import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';
import { nextCookies } from 'better-auth/next-js';
import { sendPasswordResetEmail } from '@/lib/email-service';

type SendEmailParams = { to: string; subject: string; text: string };

// This function is used for general email sending
// For password reset, we use the dedicated sendPasswordResetEmail function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!params.to || !params.subject || !params.text) return;
  console.log('General email send requested:', params.subject);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
