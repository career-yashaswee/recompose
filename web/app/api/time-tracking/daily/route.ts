import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get daily time tracking data for the specified number of days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const dailyData = await prisma.dailyTimeTracking.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Fill in missing days with zero values
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingData = dailyData.find(
        (d: { date: Date; totalSeconds: number; sessionCount: number }) =>
          d.date.toISOString().split('T')[0] === dateKey
      );

      result.push({
        date: dateKey,
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: existingData ? existingData.totalSeconds / 3600 : 0,
        seconds: existingData ? existingData.totalSeconds : 0,
        sessionCount: existingData ? existingData.sessionCount : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate total time for this period
    const totalSeconds = result.reduce((sum, day) => sum + day.seconds, 0);
    const totalHours = totalSeconds / 3600;

    return NextResponse.json({
      data: result,
      total: {
        hours: totalHours,
        seconds: totalSeconds,
        days: result.length,
      },
    });
  } catch (error) {
    console.error('Error fetching daily time data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time data' },
      { status: 500 }
    );
  }
}
