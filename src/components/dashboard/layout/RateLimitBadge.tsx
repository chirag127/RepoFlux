import { useRateLimit } from '@/hooks';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function RateLimitBadge() {
  const rateLimit = useRateLimit();

  if (!rateLimit) return null;

  const percent = Math.round((rateLimit.remaining / rateLimit.limit) * 100);
  const isLow = percent < 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border cursor-help hover:border-accent transition-colors">
            <Activity className={cn("w-3.5 h-3.5", isLow ? "text-error animate-pulse" : "text-success")} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">GitHub API</span>
                <span className={cn("text-xs font-mono font-bold", isLow ? "text-error" : "text-text")}>{rateLimit.remaining}</span>
              </div>
              <div className="w-20 h-1 bg-void rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", isLow ? "bg-error" : "bg-success")} 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="glass border-border">
          <p className="text-xs">Remaining: <span className="font-bold">{rateLimit.remaining}</span> / {rateLimit.limit}</p>
          <p className="text-[10px] text-text-muted mt-1">Resets at {new Date(rateLimit.reset * 1000).toLocaleTimeString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
