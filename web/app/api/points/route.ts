import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get user's total points
    const totalPointsResult = await prisma.userPoint.aggregate({
      where: { userId: session.user.id },
      _sum: { points: true },
    });

    // Get current streak (from streak system)
    const streakData = await prisma.compositionCompletion.findMany({
      where: { userId: session.user.id },
      orderBy: { dateKey: 'desc' },
      take: 365, // Last year
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Check if today is completed
    const todayCompleted = streakData.some(
      completion => completion.dateKey === todayKey
    );

    if (todayCompleted) {
      currentStreak = 1;
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const checkKey = checkDate.toISOString().split('T')[0];
        const dayCompleted = streakData.some(
          completion => completion.dateKey === checkKey
        );

        if (dayCompleted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Check yesterday and backwards
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const checkKey = checkDate.toISOString().split('T')[0];
        const dayCompleted = streakData.some(
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

    // Get recent points history
    const recentPoints = await prisma.userPoint.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        points: true,
        reason: true,
        category: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      totalPoints: totalPointsResult._sum.points || 0,
      currentStreak,
      recentPoints,
    });
  } catch (error) {
    console.error('points get error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { points, reason, category, metadata } = body;

    if (!points || !reason || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userPoint = await prisma.userPoint.create({
      data: {
        userId: session.user.id,
        points: parseInt(points),
        reason,
        category,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true, point: userPoint });
  } catch (error) {
    console.error('points create error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
