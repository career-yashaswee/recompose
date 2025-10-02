"use client";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";

type CompositionRow = {
  id: string;
  title: string;
  description?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  status: "SOLVED" | "ATTEMPTING" | "UNSOLVED" | null;
  likes: number;
};

type ApiResponse = {
  total: number;
  page: number;
  pageSize: number;
  data: CompositionRow[];
};

// Provided globally via Providers

function difficultyBadge(d: CompositionRow["difficulty"]): React.ReactElement {
  const color =
    d === "EASY"
      ? "bg-emerald-100 text-emerald-800"
      : d === "MEDIUM"
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";
  return <span className={`px-2 py-1 rounded text-xs ${color}`}>{d}</span>;
}

function statusBadge(s: CompositionRow["status"]): React.ReactElement | null {
  if (!s) return null;
  const map: Record<string, string> = {
    SOLVED: "bg-emerald-100 text-emerald-800",
    ATTEMPTING: "bg-amber-100 text-amber-800",
    UNSOLVED: "bg-slate-100 text-slate-800",
  };
  return <span className={`px-2 py-1 rounded text-xs ${map[s]}`}>{s}</span>;
}

function TableInner(): React.ReactElement {
  const router = useRouter();
  const [q, setQ] = React.useState<string>("");
  const [favoriteOnly, setFavoriteOnly] = React.useState<boolean>(false);
  const [difficulty, setDifficulty] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [pageSize] = React.useState<number>(10);

  const sort = sorting[0];

  const { data, isLoading, refetch } = useQuery<ApiResponse>({
    queryKey: [
      "compositions",
      { q, favoriteOnly, difficulty, status, pageIndex, pageSize, sort },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (favoriteOnly) params.set("favoriteOnly", "true");
      if (difficulty) params.set("difficulty", difficulty);
      if (status) params.set("status", status);
      params.set("page", String(pageIndex + 1));
      params.set("pageSize", String(pageSize));
      if (sort) {
        params.set("sortKey", sort.id);
        params.set("sortOrder", sort.desc ? "desc" : "asc");
      }
      const res = await fetch(`/api/compositions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()) as ApiResponse;
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (payload: {
      compositionId: string;
      favorite: boolean;
    }) => {
      const res = await fetch(`/api/compositions/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to favorite");
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  const columns = React.useMemo<ColumnDef<CompositionRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <span>Product</span>,
        cell: ({ row }) => (
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-slate-200" />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {row.original.title}
              </div>
              <div className="text-xs text-slate-500">
                {row.original.description}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "difficulty",
        header: () => <span>Difficulty</span>,
        cell: ({ row }) => difficultyBadge(row.original.difficulty),
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: ({ row }) => statusBadge(row.original.status),
      },
      {
        id: "likes",
        header: () => <span>Likes</span>,
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <ThumbsUp className="size-4" />
            <span className="text-xs">{row.original.likes}</span>
          </div>
        ),
      },
      {
        id: "favorite",
        header: () => <span>Status</span>,
        cell: ({ row }) => (
          <button
            aria-label="toggle favorite"
            className={`p-2 rounded-full ${
              row.original.isFavorite ? "text-amber-500" : "text-slate-400"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite.mutate({
                compositionId: row.original.id,
                favorite: !row.original.isFavorite,
              });
            }}
          >
            <Star
              className="size-4"
              fill={row.original.isFavorite ? "currentColor" : "none"}
            />
          </button>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: () => <span>Updated</span>,
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString(),
      },
    ],
    [toggleFavorite]
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / data.pageSize) : -1,
  });

  React.useEffect(() => {
    table.setPageIndex(pageIndex);
    table.setPageSize(pageSize);
  }, [pageIndex, pageSize, table]);

  return (
    <div className="space-y-6 flex flex-col min-h-0">
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="text-sm text-slate-500">Total Product</CardHeader>
          <CardContent className="text-2xl font-semibold">201</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-500">Product Revenue</CardHeader>
          <CardContent className="text-2xl font-semibold">$20,432</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-500">Product Sold</CardHeader>
          <CardContent className="text-2xl font-semibold">3,899</CardContent>
        </Card>
      </div> */}

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search compositions..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-56"
        />
        <select
          className="border rounded px-2 py-2"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          className="border rounded px-2 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="SOLVED">Solved</option>
          <option value="ATTEMPTING">Attempting</option>
          <option value="UNSOLVED">Unsolved</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={favoriteOnly}
            onChange={(e) => setFavoriteOnly(e.target.checked)}
          />{" "}
          Favorites
        </label>
        <Button onClick={() => refetch()} variant="secondary">
          Search
        </Button>
      </div>

      {/* Scroll container with sticky header and sticky pagination */}
      <div className="relative flex-1 min-h-0 rounded-md border overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/30">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-slate-600"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
            </thead>
            <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6" colSpan={columns.length}>
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t cursor-pointer hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-900/30 dark:focus:bg-slate-900/30 outline-none"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/stage/compositions/${row.original.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/stage/compositions/${row.original.id}`);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6" colSpan={columns.length}>
                  No results
                </td>
              </tr>
            )}
            </tbody>
          </table>
          {/* Sticky pagination bar at the bottom of the scroll area */}
          <div className="sticky bottom-0 z-10 bg-white/80 dark:bg-slate-950/70 backdrop-blur border-t">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="text-sm text-slate-500">
                Showing {data ? (data.page - 1) * data.pageSize + 1 : 0}-
                {data ? Math.min(data.page * data.pageSize, data.total) : 0} of {data?.total ?? 0}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                >
                  Previous
                </Button>
                <div className="px-3 py-2 border rounded">{(pageIndex + 1).toString()}</div>
                <Button
                  variant="secondary"
                  onClick={() => setPageIndex((p) => p + 1)}
                  disabled={!!data && pageIndex + 1 >= Math.ceil(data.total / data.pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompositionsPage(): React.ReactElement {
  return <TableInner />;
}
