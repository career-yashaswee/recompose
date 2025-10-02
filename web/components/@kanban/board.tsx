"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type KanbanStatus = "sourced" | "in_progress" | "interview";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
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

function useSearchFilter(items: Task[]): {
  query: string;
  setQuery: (q: string) => void;
  filtered: Task[];
} {
  const [query, setQuery] = React.useState<string>("");
  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [items, query]);
  return { query, setQuery, filtered };
}

export function KanbanBoard() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch tasks from API
  React.useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      try {
        const response = await fetch("/api/kanban");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const result = await response.json();
        setTasks(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const { query, setQuery, filtered } = useSearchFilter(tasks);

  const onDragStart = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const onDropToColumn = React.useCallback(
    async (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;

      const task = tasks.find((t) => t.id === id);
      if (!task || task.status === status) return;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
        )
      );

      try {
        const response = await fetch("/api/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: id,
            status,
            order: 0, // Will be handled by the system
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const result = await response.json();
        // Update with server response
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? result.task : t))
        );
      } catch (err) {
        // Revert optimistic update on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? task : t))
        );
        setError(err instanceof Error ? err.message : "Failed to update task");
      }
    },
    [tasks]
  );

  const allowDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const itemsFor = React.useCallback(
    (status: KanbanStatus) => filtered.filter((i) => i.status === status),
    [filtered]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
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
              {itemsFor(col.key).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className="mb-2 rounded-lg border p-3 shadow-sm hover:shadow transition-shadow bg-card cursor-move"
                >
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </div>
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

export type { Task, KanbanStatus };
