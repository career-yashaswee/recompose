import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateBadgeProgress } from '@/lib/badge-system';
import { NextRequest, NextResponse } from 'next/server';

type ReactionValue = 'LIKE' | 'DISLIKE';
type PostBody = { compositionId: string; value: ReactionValue | null };

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const compositionId = searchParams.get('compositionId');
  if (!compositionId)
    return NextResponse.json(
      { error: 'compositionId required' },
      { status: 400 }
    );

  try {
    const [likes, dislikes, userReaction] = await Promise.all([
      prisma.compositionReaction.count({
        where: { compositionId, value: 'LIKE' },
      }),
      prisma.compositionReaction.count({
        where: { compositionId, value: 'DISLIKE' },
      }),
      prisma.compositionReaction.findUnique({
        where: {
          userId_compositionId: { userId: session.user.id, compositionId },
        },
        select: { value: true },
      }),
    ]);

    return NextResponse.json({
      likes,
      dislikes,
      userReaction: userReaction?.value ?? null,
    });
  } catch (error) {
    console.error('reaction get error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body || !body.compositionId)
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { compositionId, value } = body;
  try {
    if (value === null) {
      await prisma.compositionReaction.deleteMany({
        where: { userId: session.user.id, compositionId },
      });
    } else {
      // Check if this is a new like (not an update from dislike to like)
      const existingReaction = await prisma.compositionReaction.findUnique({
        where: {
          userId_compositionId: { userId: session.user.id, compositionId },
        },
        select: { value: true },
      });

      await prisma.compositionReaction.upsert({
        where: {
          userId_compositionId: { userId: session.user.id, compositionId },
        },
        update: { value },
        create: { userId: session.user.id, compositionId, value },
      });

      // Update badge progress for new likes only
      if (
        value === 'LIKE' &&
        (!existingReaction || existingReaction.value !== 'LIKE')
      ) {
        await updateBadgeProgress(session.user.id, 'compositions_liked', 1);
      }
    }
    const [likes, dislikes] = await Promise.all([
      prisma.compositionReaction.count({
        where: { compositionId, value: 'LIKE' },
      }),
      prisma.compositionReaction.count({
        where: { compositionId, value: 'DISLIKE' },
      }),
    ]);
    return NextResponse.json({ ok: true, likes, dislikes });
  } catch (error) {
    console.error('reaction set error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
