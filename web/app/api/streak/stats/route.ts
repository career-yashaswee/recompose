import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { todayDateKeyIST, addDays } from '@/lib/utils';

function calcStreaks(sortedDateKeysDesc: string[]): {
  current: number;
  longest: number;
} {
  const todayKey = todayDateKeyIST();
  const toDate = (key: string): Date => new Date(`${key}T00:00:00`);
  let current = 0;
  let longest = 0;
  let expected = toDate(todayKey);
  for (const key of sortedDateKeysDesc) {
    const d = toDate(key);
    if (
      expected.getTime() - d.getTime() === 24 * 60 * 60 * 1000 ||
      expected.getTime() === d.getTime()
    ) {
      current += 1;
      longest = Math.max(longest, current);
      expected = addDays(d, -1);
    } else {
      current = 0;
      expected = addDays(d, -1);
    }
  }
  return { current, longest };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await prisma.compositionCompletion.findMany({
      where: { userId: session.user.id },
      select: { dateKey: true },
      orderBy: { dateKey: 'desc' },
      take: 365, // limit to last year for performance
    });
    const keys = rows.map(r => r.dateKey);
    const { current, longest } = calcStreaks(keys);
    return NextResponse.json({ current, longest });
  } catch (error) {
    console.error('stats error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
