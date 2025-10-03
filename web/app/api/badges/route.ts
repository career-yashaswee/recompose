import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get all badges with user's progress
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get all active badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    // Get user's badge progress
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    });

    // Create a map of user badge progress
    const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub]));

    // Combine badges with user progress
    const badgesWithProgress = badges.map(badge => {
      const userBadge = userBadgeMap.get(badge.id);
      return {
        ...badge,
        userProgress: userBadge || {
          id: null,
          userId: session.user.id,
          badgeId: badge.id,
          isEarned: false,
          progress: 0,
          earnedAt: null,
        },
      };
    });

    return NextResponse.json({ badges: badgesWithProgress });
  } catch (error) {
    console.error('Badges GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

/**
 * Create a new badge (admin only)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, icon, criteria, tier, category } = body;

    if (!name || !description || !criteria || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon,
        criteria,
        tier: tier || 'BRONZE',
        category,
      },
    });

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Badge creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
