import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { todayDateKeyIST } from '@/lib/utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const dateKey = todayDateKeyIST();
  const body = await req.json().catch(() => ({}));
  const compositionId: string | undefined = body?.compositionId;

  try {
    const created = await prisma.compositionCompletion.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      update: {},
      create: { userId, dateKey, compositionId },
    });
    return NextResponse.json({ ok: true, completionId: created.id });
  } catch (error) {
    console.error('complete error', error);
    return NextResponse.json(
      { error: 'Failed to mark complete' },
      { status: 500 }
    );
  }
}
