import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Achievement } from '@/lib/types';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  if (!achievement) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1 py-0',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-2'
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="secondary" 
          className={`${sizeClasses[size]} cursor-help bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200`}
        >
          <span className="mr-1">{achievement.icon}</span>
          {size !== 'sm' && achievement.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-sm text-muted-foreground">{achievement.description}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}