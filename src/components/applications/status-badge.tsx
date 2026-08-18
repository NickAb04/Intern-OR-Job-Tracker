"use client";

import { STATUS_CONFIG } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          config.color,
          config.textColor,
          className
        )}
      >
        {showDot && (
          <span
            className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
            aria-hidden
          />
        )}
        {config.label}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
