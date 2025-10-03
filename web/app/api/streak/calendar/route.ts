import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/streak/calendar?year=YYYY&month=MM  (month is 1-12)
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || '');
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return NextResponse.json({ error: 'Invalid year/month' }, { status: 400 });
  }

  try {
    const startKey = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(
      Date.UTC(month === 12 ? year + 1 : year, month % 12, 0)
    );
    const endKey = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;

    // Get the daily composition assignments for this month
    const dailyCompositions = await prisma.dailyComposition.findMany({
      where: {
        dateKey: { gte: startKey, lte: endKey },
      },
      select: { dateKey: true, compositionId: true },
    });

    // Get user's progress on all compositions
    const userProgress = await prisma.compositionProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'SOLVED',
        compositionId: {
          in: dailyCompositions.map(dc => dc.compositionId),
        },
      },
      select: { compositionId: true },
    });

    // Create a set of solved composition IDs for efficient lookup
    const solvedCompositionIds = new Set(userProgress.map(up => up.compositionId));

    // Check which daily compositions are completed by checking if user solved them
    const completedDailyCompositions = new Set(
      dailyCompositions
        .filter(dc => solvedCompositionIds.has(dc.compositionId))
        .map(dc => dc.dateKey)
    );

    // Get all days in the month
    const daysInMonth = endDate.getUTCDate();
    const completedDays: number[] = [];
    const missedDays: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Check if there's a daily composition assigned for this date
      const hasDailyComposition = dailyCompositions.some(dc => dc.dateKey === dateKey);
      
      if (hasDailyComposition) {
        if (completedDailyCompositions.has(dateKey)) {
          completedDays.push(day);
        } else {
          // Only mark as missed if the date is in the past
          const today = new Date();
          const currentDate = new Date(year, month - 1, day);
          if (currentDate < today) {
            missedDays.push(day);
          }
        }
      }
    }

    // Calculate streaks - get all daily compositions and check user progress
    const allDailyCompositions = await prisma.dailyComposition.findMany({
      select: { dateKey: true, compositionId: true },
      orderBy: { dateKey: 'desc' },
      take: 365,
    });

    // Get user's progress on all daily compositions
    const allUserProgress = await prisma.compositionProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'SOLVED',
        compositionId: {
          in: allDailyCompositions.map(dc => dc.compositionId),
        },
      },
      select: { compositionId: true },
    });

    const allSolvedCompositionIds = new Set(allUserProgress.map(up => up.compositionId));

    // Filter to only completed daily compositions
    const dailyCompletions = allDailyCompositions.filter(dc => 
      allSolvedCompositionIds.has(dc.compositionId)
    );

    // Calculate current and longest streaks
    const sortedDateKeys = dailyCompletions.map(c => c.dateKey).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Check if today is completed
    const todayCompleted = dailyCompletions.some(c => c.dateKey === todayKey);
    
    if (todayCompleted) {
      currentStreak = 1;
      tempStreak = 1;
      longestStreak = Math.max(longestStreak, tempStreak);

      // Count backwards from today
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const checkKey = checkDate.toISOString().split('T')[0];
        const dayCompleted = dailyCompletions.some(c => c.dateKey === checkKey);
        
        if (dayCompleted) {
          currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak from all completions
    tempStreak = 0;
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

    return NextResponse.json({
      year,
      month,
      completedDays,
      missedDays,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error('calendar error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
