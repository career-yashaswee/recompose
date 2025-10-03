import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get recent compositions that the user has interacted with (solved, attempting, or has progress)
    const recentCompositions = await prisma.compositionProgress.findMany({
      where: {
        userId: session.user.id,
        // Only get compositions where user has some progress (not just unsolved)
        status: {
          in: ['SOLVED', 'ATTEMPTING'],
        },
      },
      include: {
        composition: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            tags: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20, // Limit to 20 most recent
    });

    // Transform the data to match the expected format
    const data = recentCompositions.map(progress => ({
      id: progress.composition.id,
      title: progress.composition.title,
      difficulty: progress.composition.difficulty,
      status: progress.status,
      completedAt: progress.updatedAt,
      tags: progress.composition.tags || [],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching recent compositions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent compositions' },
      { status: 500 }
    );
  }
}
