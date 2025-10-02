"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type KanbanStatus = "sourced" | "in_progress" | "interview";

type Candidate = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  source?: string;
  status: KanbanStatus;
};

type ColumnConfig = {
  key: KanbanStatus;
  title: string;
  badgeColor: string;
};

const COLUMNS: ColumnConfig[] = [
  {
    key: "sourced",
    title: "SOURCED",
    badgeColor: "bg-amber-200 text-amber-900",
  },
  {
    key: "in_progress",
    title: "IN PROGRESS",
    badgeColor: "bg-blue-200 text-blue-900",
  },
  {
    key: "interview",
    title: "INTERVIEW",
    badgeColor: "bg-purple-200 text-purple-900",
  },
];

function useSearchFilter(items: Candidate[]): {
  query: string;
  setQuery: (q: string) => void;
  filtered: Candidate[];
} {
  const [query, setQuery] = React.useState<string>("");
  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [items, query]);
  return { query, setQuery, filtered };
}

export function KanbanBoard({ initialItems }: { initialItems: Candidate[] }) {
  const [itemsById, setItemsById] = React.useState<Record<string, Candidate>>(
    () => Object.fromEntries(initialItems.map((i) => [i.id, i]))
  );

  const items = React.useMemo(() => Object.values(itemsById), [itemsById]);
  const { query, setQuery, filtered } = useSearchFilter(items);

  const onDragStart = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onDropToColumn = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      setItemsById((prev) => {
        const item = prev[id];
        if (!item || item.status === status) return prev;
        return { ...prev, [id]: { ...item, status } };
      });
    },
    []
  );

  const allowDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const itemsFor = React.useCallback(
    (status: KanbanStatus) => filtered.filter((i) => i.status === status),
    [filtered]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">{col.title}</div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  col.badgeColor
                )}
              >
                {itemsFor(col.key).length}
              </span>
            </div>
            <div
              onDragOver={allowDrop}
              onDrop={(e) => onDropToColumn(e, col.key)}
              className="rounded-lg border bg-background p-2 min-h-64"
            >
              {itemsFor(col.key).map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, c.id)}
                  className="mb-2 rounded-lg border p-3 shadow-sm hover:shadow transition-shadow bg-card"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="size-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {c.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-px w-full bg-border" />
                  <div className="mt-2 text-xs text-muted-foreground">
                    LinkedIn
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Candidate, KanbanStatus };
