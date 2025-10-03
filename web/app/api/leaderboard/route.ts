import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type LeaderboardTimeFilter = 'week' | 'month' | 'all';

export interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  rank: number;
  totalPoints: number;
  compositionsCompleted: number;
  currentStreak: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string | null;
    tier: string;
  }>;
}

/**
 * GET /api/leaderboard - Get leaderboard data with time filtering
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeFilter =
      (searchParams.get('time') as LeaderboardTimeFilter) || 'all';

    // Calculate date range based on filter
    let startDate: Date | null = null;
    const now = new Date();

    switch (timeFilter) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    // Get leaderboard data
    const leaderboardData = await getLeaderboardData(startDate);

    // Get current user's position
    const currentUserRank =
      leaderboardData.findIndex(user => user.id === session.user.id) + 1;

    // Get motivational message data
    const motivationalData = await getMotivationalData(
      session.user.id,
      leaderboardData,
      currentUserRank
    );

    return NextResponse.json({
      leaderboard: leaderboardData,
      currentUserRank,
      motivationalData,
      timeFilter,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getLeaderboardData(
  startDate: Date | null
): Promise<LeaderboardUser[]> {
  // Build points filter
  const pointsFilter = startDate
    ? {
        createdAt: {
          gte: startDate,
        },
      }
    : {};

  // Get all users with their aggregated data
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      points: {
        where: pointsFilter,
        select: {
          points: true,
        },
      },
      compositionProgresses: {
        where: {
          status: 'SOLVED',
          ...(startDate && {
            updatedAt: {
              gte: startDate,
            },
          }),
        },
        select: {
          id: true,
        },
      },
      userBadges: {
        where: {
          isEarned: true,
        },
        select: {
          badge: {
            select: {
              id: true,
              name: true,
              icon: true,
              tier: true,
            },
          },
        },
      },
    },
  });

  // Calculate current streak for each user
  const usersWithStreak = await Promise.all(
    users.map(async user => {
      // Calculate current streak
      const streak = await calculateCurrentStreak(user.id);

      return {
        ...user,
        currentStreak: streak,
      };
    })
  );

  // Calculate total points and compositions completed
  const leaderboardData = usersWithStreak
    .map(user => {
      const totalPoints = user.points.reduce(
        (sum, point) => sum + point.points,
        0
      );
      const compositionsCompleted = user.compositionProgresses.length;

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        totalPoints,
        compositionsCompleted,
        currentStreak: user.currentStreak,
        badges: user.userBadges.map(ub => ({
          id: ub.badge.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          tier: ub.badge.tier,
        })),
        rank: 0, // Will be set after sorting
      };
    })
    .filter(user => user.totalPoints > 0) // Only include users with points
    .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by points descending
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

  return leaderboardData;
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  // Get the most recent completion dates
  const completions = await prisma.compositionCompletion.findMany({
    where: { userId },
    orderBy: { dateKey: 'desc' },
    select: { dateKey: true },
  });

  if (completions.length === 0) return 0;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Check if user completed today
  const currentDate = new Date(today);
  let hasCompletedToday = completions.some(c => c.dateKey === todayKey);

  if (!hasCompletedToday) {
    // If no completion today, check yesterday
    currentDate.setDate(currentDate.getDate() - 1);
    hasCompletedToday = completions.some(
      c => c.dateKey === formatDateKey(currentDate)
    );
    if (!hasCompletedToday) return 0;
  }

  // Count consecutive days
  for (let i = 0; i < completions.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateKey = formatDateKey(expectedDate);

    if (completions[i].dateKey === expectedDateKey) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function getMotivationalData(
  userId: string,
  leaderboardData: LeaderboardUser[],
  currentUserRank: number
) {
  const currentUser = leaderboardData.find(user => user.id === userId);

  if (!currentUser) {
    return {
      message: 'Start completing compositions to join the leaderboard!',
      pointsToNext: 0,
      showMotivation: false,
    };
  }

  // Find the user above current user
  const userAbove = leaderboardData.find(
    user => user.rank === currentUserRank - 1
  );

  if (!userAbove) {
    // User is #1
    return {
      message: "Congratulations! You're #1 on the leaderboard!",
      pointsToNext: 0,
      showMotivation: false,
    };
  }

  const pointsToNext = userAbove.totalPoints - currentUser.totalPoints;

  if (pointsToNext <= 10) {
    return {
      message: `Just ${pointsToNext} points away from rank #${currentUserRank - 1}!`,
      pointsToNext,
      showMotivation: true,
    };
  }

  return {
    message: `Keep going! You're ${pointsToNext} points away from the next rank.`,
    pointsToNext,
    showMotivation: true,
  };
}
