import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type DifficultyStats = {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  attempting: number;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const [totals, solvedByDifficulty, attemptingCount] = await Promise.all([
      prisma.composition.groupBy({
        by: ["difficulty"],
        _count: { difficulty: true },
      }),
      prisma.compositionProgress.findMany({
        where: { userId, status: "SOLVED" },
        select: { compositionId: true },
      }).then(async (rows) => {
        const solvedIds = rows.map((r) => r.compositionId);
        if (solvedIds.length === 0) return [] as { difficulty: string; _count: { id: number } }[];
        const groups = await prisma.composition.groupBy({
          by: ["difficulty"],
          where: { id: { in: solvedIds } },
          _count: { id: true },
        });
        return groups;
      }),
      prisma.compositionProgress.count({ where: { userId, status: "ATTEMPTING" } }),
    ]);

    const totalsMap: Record<string, number> = {};
    for (const t of totals) totalsMap[t.difficulty] = t._count.difficulty;

    const solvedMap: Record<string, number> = {};
    for (const s of solvedByDifficulty) solvedMap[s.difficulty] = s._count.id;

    const result: DifficultyStats = {
      easy: { solved: solvedMap["EASY"] || 0, total: totalsMap["EASY"] || 0 },
      medium: {
        solved: solvedMap["MEDIUM"] || 0,
        total: totalsMap["MEDIUM"] || 0,
      },
      hard: { solved: solvedMap["HARD"] || 0, total: totalsMap["HARD"] || 0 },
      attempting: attemptingCount,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("compositions stats error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


