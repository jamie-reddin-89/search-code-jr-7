import React from "react";
import React from "react";
import { useTooltips } from "@/contexts/TooltipContext";
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export const Tooltip: React.FC<{ content: string; children: React.ReactElement }> = ({ content, children }) => {
  const { enabled } = useTooltips();
  if (!enabled) return children;

  return (
    <TooltipProvider>
      <RadixTooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>{content}</TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  );
};
