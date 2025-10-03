import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * POST /api/auth/resend-verification - Resend email verification
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use Better Auth to resend verification email
    try {
      await auth.api.sendVerificationEmail({
        body: { email },
        headers: request.headers,
      });
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
