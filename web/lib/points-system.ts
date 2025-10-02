import prisma from './prisma';

export interface AwardPointsParams {
  userId: string;
  points: number;
  reason: string;
  category: 'COMPOSITION_COMPLETE' | 'DAILY_STREAK' | 'WEEKLY_STREAK' | 'MONTHLY_STREAK' | 'FIRST_COMPLETION' | 'DIFFICULTY_BONUS' | 'ACHIEVEMENT';
  metadata?: Record<string, unknown>;
}

export async function awardPoints(params: AwardPointsParams): Promise<void> {
  await prisma.userPoint.create({
    data: {
      userId: params.userId,
      points: params.points,
      reason: params.reason,
      category: params.category,
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
    },
  });
}

export async function awardCompositionPoints(
  userId: string,
  compositionId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
): Promise<void> {
  // Base points for completing a composition
  const basePoints = {
    EASY: 10,
    MEDIUM: 20,
    HARD: 30,
  };

  // Award base points
  await awardPoints({
    userId,
    points: basePoints[difficulty],
    reason: `Completed ${difficulty.toLowerCase()} composition`,
    category: 'COMPOSITION_COMPLETE',
    metadata: { compositionId, difficulty },
  });

  // Check if this is the user's first completion
  const existingCompletions = await prisma.compositionProgress.count({
    where: {
      userId,
      status: 'SOLVED',
    },
  });

  if (existingCompletions === 1) {
    // First completion bonus
    await awardPoints({
      userId,
      points: 50,
      reason: 'First composition completed!',
      category: 'FIRST_COMPLETION',
      metadata: { compositionId },
    });
  }

  // Check for streak bonuses
  await checkAndAwardStreakBonuses(userId);
}

async function checkAndAwardStreakBonuses(userId: string): Promise<void> {
  // Get user's completion history
  const completions = await prisma.compositionCompletion.findMany({
    where: { userId },
    orderBy: { dateKey: 'desc' },
    take: 365,
  });

  if (completions.length === 0) return;

  // Calculate current streak
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  
  let currentStreak = 0;
  const todayCompleted = completions.some(completion => completion.dateKey === todayKey);
  
  if (todayCompleted) {
    currentStreak = 1;
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
      const checkKey = checkDate.toISOString().split('T')[0];
      const dayCompleted = completions.some(completion => completion.dateKey === checkKey);
      
      if (dayCompleted) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Check for milestone streaks (only award once)
  const existingStreakPoints = await prisma.userPoint.findMany({
    where: {
      userId,
      category: { in: ['DAILY_STREAK', 'WEEKLY_STREAK', 'MONTHLY_STREAK'] },
    },
    select: { metadata: true },
  });

  const awardedStreaks = existingStreakPoints
    .map(p => p.metadata as Record<string, unknown> | null)
    .filter((m): m is Record<string, unknown> => m !== null)
    .map(m => m.streakLength as number);

  // Daily streak milestones
  if (currentStreak >= 7 && !awardedStreaks.includes(7)) {
    await awardPoints({
      userId,
      points: 25,
      reason: '7-day streak!',
      category: 'DAILY_STREAK',
      metadata: { streakLength: 7 },
    });
  }

  if (currentStreak >= 30 && !awardedStreaks.includes(30)) {
    await awardPoints({
      userId,
      points: 100,
      reason: '30-day streak!',
      category: 'DAILY_STREAK',
      metadata: { streakLength: 30 },
    });
  }

  if (currentStreak >= 100 && !awardedStreaks.includes(100)) {
    await awardPoints({
      userId,
      points: 500,
      reason: '100-day streak!',
      category: 'DAILY_STREAK',
      metadata: { streakLength: 100 },
    });
  }
}
