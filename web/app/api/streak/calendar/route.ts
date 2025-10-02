import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/streak/calendar?year=YYYY&month=MM  (month is 1-12)
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || '');
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return NextResponse.json({ error: 'Invalid year/month' }, { status: 400 });
  }

  try {
    const startKey = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(
      Date.UTC(month === 12 ? year + 1 : year, month % 12, 0)
    );
    const endKey = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;

    const rows = await prisma.compositionCompletion.findMany({
      where: {
        userId: session.user.id,
        dateKey: { gte: startKey, lte: endKey },
      },
      select: { dateKey: true },
    });
    const keys = rows.map(r => r.dateKey);
    return NextResponse.json({ dates: keys });
  } catch (error) {
    console.error('calendar error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
