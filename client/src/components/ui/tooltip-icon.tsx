
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TooltipIconProps {
  content: string;
  className?: string;
  iconClassName?: string;
}

export function TooltipIcon({ content, className = "", iconClassName = "w-4 h-4 text-gray-400 hover:text-gray-600" }: TooltipIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className={`cursor-help transition-colors ${iconClassName}`} />
      </TooltipTrigger>
      <TooltipContent className={className}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
