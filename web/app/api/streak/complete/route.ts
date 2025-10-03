import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { todayDateKeyIST } from '@/lib/utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const dateKey = todayDateKeyIST();
  const body = await req.json().catch(() => ({}));
  const compositionId: string | undefined = body?.compositionId;

  try {
    // Get today's daily composition
    const dailyComposition = await prisma.dailyComposition.findUnique({
      where: { dateKey },
      select: { compositionId: true },
    });

    if (!dailyComposition) {
      return NextResponse.json(
        { error: 'No daily composition assigned for today' },
        { status: 400 }
      );
    }

    // Check if the user completed the correct daily composition
    const userProgress = await prisma.compositionProgress.findUnique({
      where: {
        userId_compositionId: {
          userId,
          compositionId: dailyComposition.compositionId,
        },
      },
      select: { status: true },
    });

    if (!userProgress || userProgress.status !== 'SOLVED') {
      return NextResponse.json(
        { error: 'Daily composition not completed yet' },
        { status: 400 }
      );
    }

    // Mark the daily composition as completed for streak tracking
    const created = await prisma.compositionCompletion.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      update: {},
      create: { 
        userId, 
        dateKey, 
        compositionId: dailyComposition.compositionId 
      },
    });

    // Calculate updated streaks
    const allCompletions = await prisma.compositionCompletion.findMany({
      where: { userId },
      select: { dateKey: true, compositionId: true },
      orderBy: { dateKey: 'desc' },
      take: 365,
    });

    const allDailyCompositions = await prisma.dailyComposition.findMany({
      select: { dateKey: true, compositionId: true },
    });

    // Filter to only daily composition completions
    const dailyCompletions = allCompletions.filter(completion => {
      const dailyComp = allDailyCompositions.find(dc => dc.dateKey === completion.dateKey);
      return dailyComp && completion.compositionId === dailyComp.compositionId;
    });

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
    const sortedDateKeys = dailyCompletions.map(c => c.dateKey).sort().reverse();
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

    return NextResponse.json({ 
      success: true, 
      message: 'Daily composition marked as complete',
      currentStreak,
      longestStreak,
      completionId: created.id 
    });
  } catch (error) {
    console.error('complete error', error);
    return NextResponse.json(
      { error: 'Failed to mark complete' },
      { status: 500 }
    );
  }
}
