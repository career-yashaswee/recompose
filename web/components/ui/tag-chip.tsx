"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TagChipProps {
  tag: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  variant = "default",
  size = "md",
  className,
  onClick,
  removable = false,
  onRemove,
}) => {
  const baseClasses = "inline-flex items-center gap-1 rounded-full font-medium transition-colors";
  
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const Component = onClick ? "button" : "span";

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <span>{tag}</span>
      {removable && onRemove && (
        <button
          type="button"
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${tag} tag`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Component>
  );
};

export default TagChip;
