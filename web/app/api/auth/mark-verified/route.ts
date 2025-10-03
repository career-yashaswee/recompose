import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/mark-verified - Mark user's email as verified
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Marking email as verified for:', email);

    try {
      // Update the user's email verification status in the database
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });

      console.log('Email marked as verified for user:', updatedUser.id);

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
        },
      });
    } catch (error) {
      console.error('Failed to mark email as verified:', error);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in mark verified API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
