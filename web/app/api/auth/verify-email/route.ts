import { NextRequest, NextResponse } from 'next/server';
import { generateOTPFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/verify-email - Verify email with OTP code
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { token, otpCode, email } = body;

    console.log('Email verification request:', {
      email,
      otpCode,
      token: token ? 'present' : 'missing',
    });

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // If token is provided, use Better Auth's built-in verification
    if (token && token !== 'placeholder-token') {
      try {
        const auth = await import('@/lib/auth');
        await auth.auth.api.verifyEmail({
          query: { token },
          headers: request.headers,
        });

        console.log('Token verification successful for:', email);

        return NextResponse.json({
          success: true,
          message: 'Email verified successfully',
          verified: true,
        });
      } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 400 }
        );
      }
    }

    // Fallback to OTP verification
    if (!otpCode || !/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Valid 6-digit OTP code is required' },
        { status: 400 }
      );
    }

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Find the verification record for this user's email
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return NextResponse.json(
        {
          error:
            'No valid verification token found. Please request a new verification email.',
        },
        { status: 400 }
      );
    }

    console.log('Found verification token:', verification.value);

    // Generate expected OTP from the stored token
    const expectedOTP = generateOTPFromToken(verification.value);
    console.log('Expected OTP:', expectedOTP, 'Received OTP:', otpCode);

    // Validate the OTP
    if (otpCode !== expectedOTP) {
      return NextResponse.json(
        {
          error:
            'Invalid verification code. Please check your email and try again.',
        },
        { status: 400 }
      );
    }

    // Mark the user's email as verified
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });

      // Delete the used verification token
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      console.log('Email verification completed for:', email);

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        verified: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
        },
      });
    } catch (error) {
      console.error('Email verification failed:', error);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
