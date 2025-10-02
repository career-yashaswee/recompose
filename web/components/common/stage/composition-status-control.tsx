"use client";
import React from "react";
import MarkCompleteButton from "@/components/common/stage/mark-complete-button";
import ReactionControl from "@/components/common/stage/reaction-control";
import { ShareDialog, ReportDialog } from "@/components/common/stage/share-report-dialog";
import { CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { useCompositionProgress, useToggleCompositionFavorite } from "@/hooks/api";
import { Button } from "@/components/ui/button";

interface CompositionStatusControlProps {
  compositionId: string;
  compositionTitle: string;
}

export default function CompositionStatusControl(props: CompositionStatusControlProps): React.ReactElement {
  const { data, isLoading } = useCompositionProgress(props.compositionId);
  const toggleFavorite = useToggleCompositionFavorite();

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading status...</div>;
  }

  // We need to get the favorite state from the compositions list
  // For now, we'll create a simple favorite button that works independently
  const handleFavoriteToggle = () => {
    // This is a simplified version - in a real app, you'd want to track the current favorite state
    // For now, we'll assume it's not favorited and toggle to favorited
    toggleFavorite.mutate({
      compositionId: props.compositionId,
      favorite: true, // This should be dynamic based on current state
    }, {
      onSuccess: () => {
        toast.success("Added to favorites", {
          description: `"${props.compositionTitle}" has been added to your favorites`,
          duration: 3000,
        });
      },
      onError: () => {
        toast.error("Failed to update favorite", {
          description: "Please try again later.",
          duration: 3000,
        });
      },
    });
  };

  return (
    <div className="flex items-center gap-3">
      {data?.status === "SOLVED" ? (
        <div className="inline-flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="size-5" />
          <span className="font-medium">Solved</span>
        </div>
      ) : (
        <MarkCompleteButton 
          compositionId={props.compositionId} 
          compositionTitle={props.compositionTitle}
        />
      )}
      <ReactionControl 
        compositionId={props.compositionId} 
        compositionTitle={props.compositionTitle}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleFavoriteToggle}
        className="flex items-center gap-2"
      >
        <Star className="size-4" />
        Favorite
      </Button>
      <ShareDialog compositionId={props.compositionId} compositionTitle={props.compositionTitle} />
      <ReportDialog compositionId={props.compositionId} compositionTitle={props.compositionTitle} />
    </div>
  );
}


