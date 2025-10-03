import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { todayDateKeyIST } from '@/lib/utils';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const dateKey = todayDateKeyIST();

    // Get today's daily composition
    const dailyComposition = await prisma.dailyComposition.findUnique({
      where: { dateKey },
      include: {
        composition: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            tags: true,
          },
        },
      },
    });

    if (!dailyComposition) {
      return NextResponse.json(
        { error: 'No daily composition assigned for today' },
        { status: 404 }
      );
    }

    // Check user's progress on this composition
    const userProgress = await prisma.compositionProgress.findUnique({
      where: {
        userId_compositionId: {
          userId: session.user.id,
          compositionId: dailyComposition.compositionId,
        },
      },
      select: { status: true },
    });

    // Check if user has already marked today's daily composition as complete
    const completion = await prisma.compositionCompletion.findUnique({
      where: {
        userId_dateKey: {
          userId: session.user.id,
          dateKey,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({
      dateKey,
      composition: dailyComposition.composition,
      userProgress: userProgress?.status || 'UNSOLVED',
      isCompleted: completion !== null,
      completionId: completion?.id || null,
    });
  } catch (error) {
    console.error('daily composition error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
