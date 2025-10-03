import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Find the session (active or inactive)
    const userSession = await prisma.userSession.findFirst({
      where: {
        sessionId,
        userId: session.user.id,
      },
    });

    if (!userSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // If session is already ended, return current state
    if (!userSession.isActive) {
      return NextResponse.json({
        totalTime: userSession.totalTime,
        endTime: userSession.endTime,
        message: 'Session was already ended',
      });
    }

    const now = new Date();
    const finalTimeDiff = Math.floor(
      (now.getTime() - userSession.lastActive.getTime()) / 1000
    );

    // End the session
    const endedSession = await prisma.userSession.update({
      where: { id: userSession.id },
      data: {
        isActive: false,
        endTime: now,
        totalTime: userSession.totalTime + finalTimeDiff,
        lastActive: now,
      },
    });

    // Update daily tracking with final time
    await updateDailyTracking(session.user.id, finalTimeDiff);

    return NextResponse.json({
      totalTime: endedSession.totalTime,
      endTime: endedSession.endTime,
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

async function updateDailyTracking(userId: string, seconds: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day

  await prisma.dailyTimeTracking.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      totalSeconds: {
        increment: seconds,
      },
    },
    create: {
      userId,
      date: today,
      totalSeconds: seconds,
      sessionCount: 1,
    },
  });
}
