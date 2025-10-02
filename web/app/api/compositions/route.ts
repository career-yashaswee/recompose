import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type SortKey = "title" | "difficulty" | "createdAt" | "updatedAt" | "revenue";
type SortOrder = "asc" | "desc";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const difficulty = (searchParams.get("difficulty") || undefined) as
    | "EASY"
    | "MEDIUM"
    | "HARD"
    | undefined;
  const status = (searchParams.get("status") || undefined) as
    | "SOLVED"
    | "ATTEMPTING"
    | "UNSOLVED"
    | undefined;
  const favoriteOnly = searchParams.get("favoriteOnly") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
  const sortKey = (searchParams.get("sortKey") || "updatedAt") as SortKey;
  const sortOrder = (searchParams.get("sortOrder") || "desc") as SortOrder;

  const where: Record<string, unknown> = {};
  if (q) where["title"] = { contains: q, mode: "insensitive" };
  if (difficulty) where["difficulty"] = difficulty;

  if (status) {
    where["progresses"] = { some: { userId: session.user.id, status } };
  }

  if (favoriteOnly) {
    where["favorites"] = { some: { userId: session.user.id } };
  }

  const [total, rows] = await Promise.all([
    prisma.composition.count({ where }),
    prisma.composition.findMany({
      where,
      orderBy: { [sortKey]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        progresses: { where: { userId: session.user.id }, select: { status: true } },
        favorites: { where: { userId: session.user.id }, select: { id: true } },
      },
    }),
  ]);

  const ids = rows.map((r) => r.id);
  // Aggregate likes per composition
  const [likeGroups, userReactions] = await Promise.all([
    ids.length
      ? (prisma as any).compositionReaction.groupBy({
          by: ["compositionId", "value"],
          where: { compositionId: { in: ids }, value: "LIKE" },
          _count: { _all: true },
        })
      : Promise.resolve([] as { compositionId: string; value: string; _count: { _all: number } }[]),
    ids.length
      ? (prisma as any).compositionReaction.findMany({
          where: { compositionId: { in: ids }, userId: session.user.id },
          select: { compositionId: true, value: true },
        })
      : Promise.resolve([] as { compositionId: string; value: string }[]),
  ]);
  const likesMap: Record<string, number> = {};
  for (const g of likeGroups) likesMap[g.compositionId] = g._count._all;
  const userReactionMap: Record<string, "LIKE" | "DISLIKE"> = {};
  for (const ur of userReactions) userReactionMap[ur.compositionId] = ur.value as any;

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    difficulty: r.difficulty,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    isFavorite: r.favorites.length > 0,
    status: r.progresses[0]?.status || null,
    likes: likesMap[r.id] || 0,
    userReaction: userReactionMap[r.id] ?? null,
  }));

  return NextResponse.json({ total, page, pageSize, data });
}


