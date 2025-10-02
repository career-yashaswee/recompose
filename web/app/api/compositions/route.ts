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

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    difficulty: r.difficulty,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    isFavorite: r.favorites.length > 0,
    status: r.progresses[0]?.status || null,
  }));

  return NextResponse.json({ total, page, pageSize, data });
}


