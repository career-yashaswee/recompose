import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get completion data for the past year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const completionData = await prisma.compositionProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'SOLVED',
        updatedAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        updatedAt: true,
        compositionId: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    // Group by date and count completions per day
    const dailyCompletions: Record<string, number> = {};
    
    completionData.forEach((completion) => {
      const dateKey = completion.updatedAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyCompletions[dateKey] = (dailyCompletions[dateKey] || 0) + 1;
    });

    // Calculate stats
    const totalCompletions = completionData.length;
    const activeDays = Object.keys(dailyCompletions).length;
    
    // Calculate max streak
    const sortedDates = Object.keys(dailyCompletions).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;
      
      if (nextDate) {
        const daysDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak + 1);
          currentStreak = 0;
        }
      } else {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    }

    return NextResponse.json({
      totalCompletions,
      activeDays,
      maxStreak,
      dailyCompletions,
    });
  } catch (error) {
    console.error('heatmap get error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
