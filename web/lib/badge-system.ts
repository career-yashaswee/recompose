import prisma from './prisma';

export interface BadgeCriteria {
  type:
    | 'compositions_completed'
    | 'compositions_liked'
    | 'streak_days'
    | 'points_earned';
  count: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface BadgeProgress {
  badgeId: string;
  userId: string;
  currentProgress: number;
  requiredProgress: number;
  isEarned: boolean;
}

/**
 * Initialize default badges if they don't exist
 */
export async function initializeDefaultBadges(): Promise<void> {
  try {
    // Check if badges already exist
    const existingBadges = await prisma.badge.count();
    if (existingBadges > 0) return;

    // Create default badges
    const defaultBadges = [
      {
        name: 'Composition Starter',
        description: 'Complete your first 5 compositions',
        icon: '🎯',
        criteria: {
          type: 'compositions_completed',
          count: 5,
        },
        tier: 'BRONZE' as const,
        category: 'COMPOSITION' as const,
      },
      {
        name: 'Composition Lover',
        description: 'Like 5 compositions on the platform',
        icon: '❤️',
        criteria: {
          type: 'compositions_liked',
          count: 5,
        },
        tier: 'BRONZE' as const,
        category: 'ENGAGEMENT' as const,
      },
    ];

    for (const badgeData of defaultBadges) {
      await prisma.badge.create({
        data: {
          ...badgeData,
          criteria: JSON.parse(JSON.stringify(badgeData.criteria)),
        },
      });
    }

    console.log('Default badges initialized');
  } catch (error) {
    console.error('Error initializing default badges:', error);
  }
}

/**
 * Update user's badge progress based on activity
 */
export async function updateBadgeProgress(
  userId: string,
  activityType:
    | 'compositions_completed'
    | 'compositions_liked'
    | 'streak_days'
    | 'points_earned',
  increment: number = 1
): Promise<void> {
  try {
    // Get all active badges that match this activity type
    const badges = await prisma.badge.findMany({
      where: {
        isActive: true,
      },
    });

    for (const badge of badges) {
      const criteria = badge.criteria as unknown as BadgeCriteria;

      if (criteria.type === activityType) {
        // Get or create user badge progress
        let userBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
        });

        if (!userBadge) {
          userBadge = await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              progress: 0,
              isEarned: false,
            },
          });
        }

        // Skip if already earned
        if (userBadge.isEarned) continue;

        // Update progress
        const newProgress = userBadge.progress + increment;
        const isEarned = newProgress >= criteria.count;

        await prisma.userBadge.update({
          where: { id: userBadge.id },
          data: {
            progress: newProgress,
            isEarned,
            earnedAt: isEarned ? new Date() : null,
          },
        });

        // If badge was just earned, create a notification
        if (isEarned && !userBadge.isEarned) {
          await createBadgeNotification(userId, badge);
        }
      }
    }
  } catch (error) {
    console.error('Error updating badge progress:', error);
  }
}

/**
 * Create a notification when a badge is earned
 */
async function createBadgeNotification(
  userId: string,
  badge: { id: string; name: string; icon?: string | null }
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'SUCCESS',
        title: '🎉 Badge Earned!',
        message: `Congratulations! You've earned the "${badge.name}" badge.`,
        category: 'USER',
        metadata: {
          badgeId: badge.id,
          badgeName: badge.name,
          badgeIcon: badge.icon,
        },
      },
    });
  } catch (error) {
    console.error('Error creating badge notification:', error);
  }
}

/**
 * Get user's badge progress for a specific badge
 */
export async function getUserBadgeProgress(
  userId: string,
  badgeId: string
): Promise<BadgeProgress | null> {
  try {
    const userBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
      include: { badge: true },
    });

    if (!userBadge) return null;

    const criteria = userBadge.badge.criteria as unknown as BadgeCriteria;

    return {
      badgeId: userBadge.badgeId,
      userId: userBadge.userId,
      currentProgress: userBadge.progress,
      requiredProgress: criteria.count,
      isEarned: userBadge.isEarned,
    };
  } catch (error) {
    console.error('Error getting user badge progress:', error);
    return null;
  }
}

/**
 * Get all user's badge progress
 */
export async function getAllUserBadgeProgress(
  userId: string
): Promise<BadgeProgress[]> {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    return userBadges.map(userBadge => {
      const criteria = userBadge.badge.criteria as unknown as BadgeCriteria;
      return {
        badgeId: userBadge.badgeId,
        userId: userBadge.userId,
        currentProgress: userBadge.progress,
        requiredProgress: criteria.count,
        isEarned: userBadge.isEarned,
      };
    });
  } catch (error) {
    console.error('Error getting all user badge progress:', error);
    return [];
  }
}

/**
 * Calculate current progress for a badge based on user activity
 */
export async function calculateBadgeProgress(
  userId: string,
  badgeId: string
): Promise<number> {
  try {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) return 0;

    const criteria = badge.criteria as unknown as BadgeCriteria;

    switch (criteria.type) {
      case 'compositions_completed':
        return await prisma.compositionProgress.count({
          where: {
            userId,
            status: 'SOLVED',
          },
        });

      case 'compositions_liked':
        return await prisma.compositionReaction.count({
          where: {
            userId,
            value: 'LIKE',
          },
        });

      case 'streak_days':
        // Calculate current streak (similar to points system)
        const completions = await prisma.compositionCompletion.findMany({
          where: { userId },
          orderBy: { dateKey: 'desc' },
          take: 365,
        });

        if (completions.length === 0) return 0;

        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];

        let currentStreak = 0;
        const todayCompleted = completions.some(
          completion => completion.dateKey === todayKey
        );

        if (todayCompleted) {
          currentStreak = 1;
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - 1);

          while (true) {
            const checkKey = checkDate.toISOString().split('T')[0];
            const dayCompleted = completions.some(
              completion => completion.dateKey === checkKey
            );

            if (dayCompleted) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        return currentStreak;

      case 'points_earned':
        const totalPoints = await prisma.userPoint.aggregate({
          where: { userId },
          _sum: { points: true },
        });
        return totalPoints._sum.points || 0;

      default:
        return 0;
    }
  } catch (error) {
    console.error('Error calculating badge progress:', error);
    return 0;
  }
}
