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

    // Clean up old sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedSessions = await prisma.userSession.deleteMany({
      where: {
        userId: session.user.id,
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isActive: false,
      },
    });

    // Clean up old daily tracking data (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedDailyData = await prisma.dailyTimeTracking.deleteMany({
      where: {
        userId: session.user.id,
        date: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      deletedSessions: deletedSessions.count,
      deletedDailyData: deletedDailyData.count,
    });
  } catch (error) {
    console.error('Error cleaning up time tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup time tracking data' },
      { status: 500 }
    );
  }
}
