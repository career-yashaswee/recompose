"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface MarkCompleteButtonProps {
  compositionId: string;
  compositionTitle?: string;
  onCompleted?: () => void;
}

export default function MarkCompleteButton(
  props: MarkCompleteButtonProps
): React.ReactElement {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  const handleClick = async (): Promise<void> => {
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/compositions/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: props.compositionId,
          status: "SOLVED",
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update progress");
      }
      
      setMessage("Marked as complete.");
      
      if (props.onCompleted) props.onCompleted();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={submitting}>
        <Check className="size-4" />
        {submitting ? "Marking..." : "Mark this as Complete"}
      </Button>
      {message ? (
        <span className="text-sm text-slate-500">{message}</span>
      ) : null}
    </div>
  );
}
