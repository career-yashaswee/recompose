import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/notification-service';
import { NextRequest, NextResponse } from 'next/server';

type Body = {
  compositionId: string;
  status: 'SOLVED' | 'ATTEMPTING' | 'UNSOLVED';
};

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
    const row = await prisma.compositionProgress.findUnique({
      where: {
        userId_compositionId: { userId: session.user.id, compositionId },
      },
      select: { status: true },
    });
    return NextResponse.json({ status: row?.status ?? null });
  } catch (error) {
    console.error('progress get error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.compositionId || !body.status) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { compositionId, status } = body;

  try {
    const row = await prisma.compositionProgress.upsert({
      where: {
        userId_compositionId: { userId: session.user.id, compositionId },
      },
      update: { status },
      create: { userId: session.user.id, compositionId, status },
    });

    // If status is SOLVED, create a notification
    if (status === 'SOLVED') {
      try {
        // Get composition title
        const composition = await prisma.composition.findUnique({
          where: { id: compositionId },
          select: { title: true },
        });

        const compositionTitle = composition?.title || 'Composition';

        // Create notification in database
        await NotificationService.notifyCompositionCompleted(
          session.user.id,
          compositionTitle,
          compositionId
        );
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    console.error('Progress set error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
