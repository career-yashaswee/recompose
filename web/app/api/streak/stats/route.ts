import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get all daily compositions
    const allDailyCompositions = await prisma.dailyComposition.findMany({
      select: { dateKey: true, compositionId: true },
      orderBy: { dateKey: 'desc' },
      take: 365, // limit to last year for performance
    });

    // Get user's progress on all daily compositions
    const userProgress = await prisma.compositionProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'SOLVED',
        compositionId: {
          in: allDailyCompositions.map(dc => dc.compositionId),
        },
      },
      select: { compositionId: true },
    });

    const solvedCompositionIds = new Set(
      userProgress.map(up => up.compositionId)
    );

    // Filter to only completed daily compositions
    const dailyCompletions = allDailyCompositions.filter(dc =>
      solvedCompositionIds.has(dc.compositionId)
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    const todayCompleted = dailyCompletions.some(c => c.dateKey === todayKey);

    if (todayCompleted) {
      currentStreak = 1;
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const checkKey = checkDate.toISOString().split('T')[0];
        const dayCompleted = dailyCompletions.some(c => c.dateKey === checkKey);

        if (dayCompleted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    const sortedDateKeys = dailyCompletions
      .map(c => c.dateKey)
      .sort()
      .reverse();
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDateKeys.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(sortedDateKeys[i]);
        const prevDate = new Date(sortedDateKeys[i - 1]);
        const daysDiff = Math.floor(
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate total completed and completion rate
    const totalCompleted = dailyCompletions.length;
    const totalDailyCompositions = allDailyCompositions.length;
    const completionRate =
      totalDailyCompositions > 0
        ? (totalCompleted / totalDailyCompositions) * 100
        : 0;

    return NextResponse.json({
      currentStreak,
      longestStreak,
      totalCompleted,
      completionRate: Math.round(completionRate * 100) / 100,
    });
  } catch (error) {
    console.error('stats error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
