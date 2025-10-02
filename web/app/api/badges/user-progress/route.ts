import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get user's badge progress summary
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get user's badge progress
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Get total badges count
    const totalBadges = await prisma.badge.count({
      where: { isActive: true },
    });

    // Calculate statistics
    const earnedBadges = userBadges.filter(ub => ub.isEarned);
    const inProgressBadges = userBadges.filter(ub => !ub.isEarned && ub.progress > 0);

    // Get badges by category
    const badgesByCategory = userBadges.reduce((acc, userBadge) => {
      const category = userBadge.badge.category;
      if (!acc[category]) {
        acc[category] = { earned: 0, total: 0 };
      }
      acc[category].total++;
      if (userBadge.isEarned) {
        acc[category].earned++;
      }
      return acc;
    }, {} as Record<string, { earned: number; total: number }>);

    return NextResponse.json({
      totalBadges,
      earnedBadges: earnedBadges.length,
      inProgressBadges: inProgressBadges.length,
      badgesByCategory,
      recentBadges: earnedBadges.slice(0, 5), // Last 5 earned badges
    });
  } catch (error) {
    console.error('User badge progress error:', error);
    return NextResponse.json({ error: 'Failed to fetch badge progress' }, { status: 500 });
  }
}
