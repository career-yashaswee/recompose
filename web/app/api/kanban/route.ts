import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type KanbanStatus = 'SOURCED' | 'IN_PROGRESS' | 'INTERVIEW';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await prisma.kanbanTask.findMany({
      where: { userId: session.user.id },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    const data = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as
        | 'sourced'
        | 'in_progress'
        | 'interview',
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('kanban get error', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.taskId || !body.status) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { taskId, status, order } = body;

  try {
    // Update the task status and order
    const updatedTask = await prisma.kanbanTask.update({
      where: {
        id: taskId,
        userId: session.user.id, // Ensure user owns the task
      },
      data: {
        status: status.toUpperCase() as KanbanStatus,
        order: order ?? 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status.toLowerCase() as
          | 'sourced'
          | 'in_progress'
          | 'interview',
        order: updatedTask.order,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      },
    });
  } catch (error) {
    console.error('kanban update error', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
