import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type Body = { compositionId: string; favorite: boolean };

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.compositionId || typeof body.favorite !== 'boolean')
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { compositionId, favorite } = body;
  try {
    if (favorite) {
      await prisma.compositionFavorite.upsert({
        where: {
          userId_compositionId: { userId: session.user.id, compositionId },
        },
        update: {},
        create: { userId: session.user.id, compositionId },
      });
    } else {
      await prisma.compositionFavorite.deleteMany({
        where: { userId: session.user.id, compositionId },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('favorite toggle error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
