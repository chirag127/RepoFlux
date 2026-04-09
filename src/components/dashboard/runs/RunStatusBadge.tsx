import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface RunStatusBadgeProps {
  status?: string;
  conclusion?: string | null;
  className?: string;
}

export function RunStatusBadge({ status, conclusion, className }: RunStatusBadgeProps) {
  const isCompleted = status === 'completed';
  const displayConclusion = isCompleted ? conclusion : status;

  return (
    <div className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all",
      status === 'in_progress' ? "bg-info/15 text-info animate-pulse border border-info/20" :
      conclusion === 'success' ? "bg-success/15 text-success border border-success/20" :
      conclusion === 'failure' ? "bg-error/15 text-error border border-error/20" :
      "bg-surface-elevated text-text-muted border border-border",
      className
    )}>
      {status === 'in_progress' && <Activity className="w-2.5 h-2.5" />}
      {displayConclusion || 'Unknown'}
    </div>
  );
}
