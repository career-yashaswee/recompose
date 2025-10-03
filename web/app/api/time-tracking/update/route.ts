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

    // Find the active session
    const userSession = await prisma.userSession.findFirst({
      where: {
        sessionId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!userSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const now = new Date();
    const timeDiff = Math.floor(
      (now.getTime() - userSession.lastActive.getTime()) / 1000
    );

    // Only update if there's meaningful time difference (avoid spam)
    if (timeDiff >= 30) {
      // 30 seconds minimum
      const updatedSession = await prisma.userSession.update({
        where: { id: userSession.id },
        data: {
          lastActive: now,
          totalTime: userSession.totalTime + timeDiff,
        },
      });

      // Update daily tracking
      await updateDailyTracking(session.user.id, timeDiff);

      return NextResponse.json({
        totalTime: updatedSession.totalTime,
        lastActive: updatedSession.lastActive,
      });
    }

    return NextResponse.json({
      totalTime: userSession.totalTime,
      lastActive: userSession.lastActive,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
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
