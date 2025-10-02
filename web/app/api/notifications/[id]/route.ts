import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NotificationService } from "@/lib/notification-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const result = await NotificationService.getUserNotifications(session.user.id, {
        limit: 1,
        offset: 0,
      });

      const notification = result.notifications.find(n => n.id === params.id);

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(notification);
    } catch (error) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isRead } = body;

    if (isRead === true) {
      const updatedNotification = await NotificationService.markAsRead(
        session.user.id,
        params.id
      );
      return NextResponse.json(updatedNotification);
    } else {
      return NextResponse.json(
        { error: "Only marking as read is supported" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await NotificationService.deleteNotification(
      session.user.id,
      params.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
