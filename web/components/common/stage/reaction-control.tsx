"use client";
import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { useCompositionReaction, useUpdateCompositionReaction } from "@/hooks/api";

interface ReactionControlProps {
  compositionId: string;
  compositionTitle?: string;
}

type ReactionValue = "LIKE" | "DISLIKE";

export default function ReactionControl(
  props: ReactionControlProps
): React.ReactElement {
  const { data, isLoading } = useCompositionReaction(props.compositionId);
  const updateReaction = useUpdateCompositionReaction();

  if (isLoading || !data) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  const isLiked = data.userReaction === "LIKE";
  const isDisliked = data.userReaction === "DISLIKE";

  const handleLike = (): void => {
    const title = props.compositionTitle || "Composition";
    const newValue = isLiked ? null : "LIKE";
    
    updateReaction.mutate({
      compositionId: props.compositionId,
      value: newValue,
    }, {
      onSuccess: () => {
        if (newValue === "LIKE") {
          toast.success("Liked!", {
            description: `You liked "${title}"`,
            duration: 2000,
          });
        } else {
          toast.info("Like removed", {
            description: `You removed your like from "${title}"`,
            duration: 2000,
          });
        }
      },
      onError: () => {
        toast.error("Failed to update reaction", {
          description: "Please try again later.",
          duration: 3000,
        });
      },
    });
  };

  const handleDislike = (): void => {
    const title = props.compositionTitle || "Composition";
    const newValue = isDisliked ? null : "DISLIKE";
    
    updateReaction.mutate({
      compositionId: props.compositionId,
      value: newValue,
    }, {
      onSuccess: () => {
        if (newValue === "DISLIKE") {
          toast.error("Disliked", {
            description: `You disliked "${title}"`,
            duration: 2000,
          });
        } else {
          toast.info("Dislike removed", {
            description: `You removed your dislike from "${title}"`,
            duration: 2000,
          });
        }
      },
      onError: () => {
        toast.error("Failed to update reaction", {
          description: "Please try again later.",
          duration: 3000,
        });
      },
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        aria-label="Like"
        onClick={handleLike}
        disabled={updateReaction.isPending}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${
          isLiked
            ? "text-emerald-600 border-emerald-300 bg-emerald-50"
            : "text-slate-600 border-slate-200"
        } ${updateReaction.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ThumbsUp className="size-4" />
        <span className="text-xs">{data.likes}</span>
      </button>
      <button
        aria-label="Dislike"
        onClick={handleDislike}
        disabled={updateReaction.isPending}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${
          isDisliked
            ? "text-rose-600 border-rose-300 bg-rose-50"
            : "text-slate-600 border-slate-200"
        } ${updateReaction.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ThumbsDown className="size-4" />
        <span className="text-xs">{data.dislikes}</span>
      </button>
    </div>
  );
}
