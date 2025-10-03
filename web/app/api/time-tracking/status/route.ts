import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current active session
    const activeSession = await prisma.userSession.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total time for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = await prisma.dailyTimeTracking.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    // Get total time for this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekData = await prisma.dailyTimeTracking.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: weekStart,
        },
      },
      _sum: {
        totalSeconds: true,
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      activeSession: activeSession
        ? {
            sessionId: activeSession.sessionId,
            startTime: activeSession.startTime,
            lastActive: activeSession.lastActive,
            totalTime: activeSession.totalTime,
          }
        : null,
      today: {
        hours: todayData ? todayData.totalSeconds / 3600 : 0,
        seconds: todayData ? todayData.totalSeconds : 0,
        sessionCount: todayData ? todayData.sessionCount : 0,
      },
      week: {
        hours: (weekData._sum.totalSeconds || 0) / 3600,
        seconds: weekData._sum.totalSeconds || 0,
        activeDays: weekData._count._all || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching time tracking status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time tracking status' },
      { status: 500 }
    );
  }
}
