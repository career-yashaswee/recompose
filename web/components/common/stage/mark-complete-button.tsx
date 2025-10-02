"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useUpdateCompositionProgress } from "@/hooks/api";

interface MarkCompleteButtonProps {
  compositionId: string;
  compositionTitle?: string;
  onCompleted?: () => void;
}

export default function MarkCompleteButton(
  props: MarkCompleteButtonProps
): React.ReactElement {
  const updateProgress = useUpdateCompositionProgress();

  const handleClick = (): void => {
    updateProgress.mutate(
      {
        compositionId: props.compositionId,
        status: "SOLVED",
      },
      {
        onSuccess: () => {
          const title = props.compositionTitle || "Composition";
          toast.success("Composition Completed!", {
            description: `You've successfully completed "${title}". Great job!`,
            duration: 4000,
          });
          if (props.onCompleted) props.onCompleted();
        },
        onError: () => {
          toast.error("Failed to mark as complete", {
            description: "Please try again later.",
            duration: 3000,
          });
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleClick} 
        disabled={updateProgress.isPending}
      >
        <Check className="size-4" />
        {updateProgress.isPending ? "Marking..." : "Mark this as Complete"}
      </Button>
      {updateProgress.isError && (
        <span className="text-sm text-red-500">Failed. Please try again.</span>
      )}
      {updateProgress.isSuccess && (
        <span className="text-sm text-green-500">Marked as complete.</span>
      )}
    </div>
  );
}
