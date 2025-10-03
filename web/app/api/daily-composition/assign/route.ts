import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { dateKey, compositionId } = body;

  if (!dateKey || !compositionId) {
    return NextResponse.json(
      { error: 'dateKey and compositionId are required' },
      { status: 400 }
    );
  }

  try {
    // Check if composition exists
    const composition = await prisma.composition.findUnique({
      where: { id: compositionId },
      select: { id: true, title: true },
    });

    if (!composition) {
      return NextResponse.json(
        { error: 'Composition not found' },
        { status: 404 }
      );
    }

    // Assign the daily composition
    const dailyComposition = await prisma.dailyComposition.upsert({
      where: { dateKey },
      update: {
        compositionId,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        dateKey,
        compositionId,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Daily composition assigned for ${dateKey}`,
      dailyComposition: {
        id: dailyComposition.id,
        dateKey: dailyComposition.dateKey,
        composition: {
          id: composition.id,
          title: composition.title,
        },
      },
    });
  } catch (error) {
    console.error('assign daily composition error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
