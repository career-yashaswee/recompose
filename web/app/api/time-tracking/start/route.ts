import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';

    // Generate unique session ID
    const sessionId = randomUUID();

    // End any existing active sessions for this user
    await prisma.userSession.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      data: {
        isActive: false,
        endTime: new Date(),
      },
    });

    // Create new session
    const userSession = await prisma.userSession.create({
      data: {
        userId: session.user.id,
        sessionId,
        userAgent,
        ipAddress,
        isActive: true,
      },
    });

    return NextResponse.json({
      sessionId: userSession.sessionId,
      startTime: userSession.startTime,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
