import type { GitHubWorkflowRun } from '@/lib/github';
import { RunStatusBadge } from './RunStatusBadge';
import { Clock } from 'lucide-react';

interface RunRowProps {
  run: GitHubWorkflowRun;
  onClick: () => void;
}

export function RunRow({ run, onClick }: RunRowProps) {
  return (
    <div 
      className="p-3 bg-surface/50 border border-border rounded-lg hover:border-accent/40 cursor-pointer transition-all group hover:bg-surface-hover/80"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className="font-mono text-xs font-bold truncate group-hover:text-accent transition-colors">
          {run.name}
        </span>
        <RunStatusBadge status={run.status} conclusion={run.conclusion} />
      </div>
      <div className="text-[10px] text-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {new Date(run.created_at).toLocaleString()}
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent">View Logs &rarr;</span>
      </div>
    </div>
  );
}
