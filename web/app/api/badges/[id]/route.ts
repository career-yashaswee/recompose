import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get a specific badge with user's progress
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Get user's progress for this badge
    const userBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: session.user.id,
          badgeId: id,
        },
      },
    });

    return NextResponse.json({
      badge,
      userProgress: userBadge || {
        id: null,
        userId: session.user.id,
        badgeId: id,
        isEarned: false,
        progress: 0,
        earnedAt: null,
      },
    });
  } catch (error) {
    console.error('Badge GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    );
  }
}

/**
 * Update a badge (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, icon, criteria, tier, category, isActive } =
      body;

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon !== undefined && { icon }),
        ...(criteria && { criteria }),
        ...(tier && { tier }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Badge update error:', error);
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    );
  }
}

/**
 * Delete a badge (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.badge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Badge delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete badge' },
      { status: 500 }
    );
  }
}
