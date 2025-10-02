"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ReactionControlProps {
  compositionId: string;
}

type ReactionValue = "LIKE" | "DISLIKE";

export default function ReactionControl(
  props: ReactionControlProps
): React.ReactElement {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{
    likes: number;
    dislikes: number;
    userReaction: ReactionValue | null;
  }>({
    queryKey: ["composition-reaction", props.compositionId],
    queryFn: async () => {
      const res = await fetch(
        `/api/compositions/reaction?compositionId=${props.compositionId}`
      );
      if (!res.ok) throw new Error("Failed to fetch reactions");
      return (await res.json()) as {
        likes: number;
        dislikes: number;
        userReaction: ReactionValue | null;
      };
    },
  });

  const mutateReaction = useMutation({
    mutationFn: async (value: ReactionValue | null) => {
      const res = await fetch(`/api/compositions/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: props.compositionId, value }),
      });
      if (!res.ok) throw new Error("Failed to set reaction");
      return (await res.json()) as {
        ok: boolean;
        likes: number;
        dislikes: number;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["composition-reaction", props.compositionId],
      });
    },
  });

  if (isLoading || !data) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  const isLiked = data.userReaction === "LIKE";
  const isDisliked = data.userReaction === "DISLIKE";

  const handleLike = (): void => {
    mutateReaction.mutate(isLiked ? null : "LIKE");
  };
  const handleDislike = (): void => {
    mutateReaction.mutate(isDisliked ? null : "DISLIKE");
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        aria-label="Like"
        onClick={handleLike}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${
          isLiked
            ? "text-emerald-600 border-emerald-300 bg-emerald-50"
            : "text-slate-600 border-slate-200"
        }`}
      >
        <ThumbsUp className="size-4" />
        <span className="text-xs">{data.likes}</span>
      </button>
      <button
        aria-label="Dislike"
        onClick={handleDislike}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${
          isDisliked
            ? "text-rose-600 border-rose-300 bg-rose-50"
            : "text-slate-600 border-slate-200"
        }`}
      >
        <ThumbsDown className="size-4" />
        <span className="text-xs">{data.dislikes}</span>
      </button>
    </div>
  );
}
