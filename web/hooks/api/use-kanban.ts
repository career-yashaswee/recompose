"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: "sourced" | "in_progress" | "interview";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanResponse {
  data: KanbanTask[];
}

export interface UpdateTaskRequest {
  taskId: string;
  status: "sourced" | "in_progress" | "interview";
  order?: number;
}

export interface UpdateTaskResponse {
  success: boolean;
  task: KanbanTask;
}

// Query Keys
export const kanbanKeys = {
  all: ["kanban"] as const,
  tasks: () => [...kanbanKeys.all, "tasks"] as const,
};

// API Functions
const fetchKanbanTasks = async (): Promise<KanbanResponse> => {
  const response = await fetch("/api/kanban");
  if (!response.ok) throw new Error("Failed to fetch kanban tasks");
  return response.json();
};

const updateKanbanTask = async (data: UpdateTaskRequest): Promise<UpdateTaskResponse> => {
  const response = await fetch("/api/kanban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update kanban task");
  return response.json();
};

// Hooks
export const useKanbanTasks = () => {
  return useQuery({
    queryKey: kanbanKeys.tasks(),
    queryFn: fetchKanbanTasks,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Mutations
export const useUpdateKanbanTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateKanbanTask,
    onMutate: async ({ taskId, status, order }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kanbanKeys.tasks() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<KanbanResponse>(kanbanKeys.tasks());

      // Optimistically update
      if (previousTasks) {
        const updatedTasks = {
          ...previousTasks,
          data: previousTasks.data.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  order: order ?? task.order,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        };
        queryClient.setQueryData(kanbanKeys.tasks(), updatedTasks);
      }

      return { previousTasks, taskId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(kanbanKeys.tasks(), context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: kanbanKeys.tasks() });
    },
  });
};
