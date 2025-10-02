"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import MarkCompleteButton from "@/components/common/stage/mark-complete-button";
import ReactionControl from "@/components/common/stage/reaction-control";
import { CheckCircle2 } from "lucide-react";

interface CompositionStatusControlProps {
  compositionId: string;
}

type Status = "SOLVED" | "ATTEMPTING" | "UNSOLVED" | null;

export default function CompositionStatusControl(props: CompositionStatusControlProps): React.ReactElement {
  const { data, isLoading, refetch } = useQuery<{ status: Status }>({
    queryKey: ["composition-status", props.compositionId],
    queryFn: async () => {
      const res = await fetch(`/api/compositions/progress?compositionId=${props.compositionId}`);
      if (!res.ok) throw new Error("Failed to fetch status");
      return (await res.json()) as { status: Status };
    },
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading status...</div>;
  }

  return (
    <div className="flex items-center gap-3">
      {data?.status === "SOLVED" ? (
        <div className="inline-flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="size-5" />
          <span className="font-medium">Solved</span>
        </div>
      ) : (
        <MarkCompleteButton compositionId={props.compositionId} onCompleted={() => refetch()} />
      )}
      <ReactionControl compositionId={props.compositionId} />
    </div>
  );
}


