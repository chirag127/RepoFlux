import { useState, useEffect } from 'react';
import { useRouter, usePoller } from '@/hooks';
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { getWorkflowRun, listJobsForRun, getJobLogs, type GitHubWorkflowRun, type GitHubJob } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { LogViewer } from '../logs/LogViewer';

export function RunViewer({ owner, name, runIdStr }: { owner: string, name: string, runIdStr: string }) {
  const { navigate } = useRouter();
  const runId = parseInt(runIdStr, 10);
  
  const [run, setRun] = useState<GitHubWorkflowRun | null>(null);
  const [job, setJob] = useState<GitHubJob | null>(null);
  const [rawLogs, setRawLogs] = useState<string>('');

  const pollRun = async () => {
    const runData = await getWorkflowRun(owner, name, runId);
    setRun(runData);
    
    const jobsData = await listJobsForRun(owner, name, runId);
    if (jobsData.jobs.length > 0) {
      setJob(jobsData.jobs[0]);
      try {
        const logs = await getJobLogs(owner, name, jobsData.jobs[0].id);
        setRawLogs(logs);
      } catch (err) {
        // logs might not be available yet
      }
    }
    
    return runData;
  };

  const isRunning = run?.status === 'in_progress' || run?.status === 'queued';
  const { isPolling, trigger } = usePoller(pollRun, 3000, isRunning);

  useEffect(() => {
    trigger();
  }, [trigger]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-screen max-h-screen">
      <header className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/repo/${owner}/${name}`)} className="p-2 hover:bg-surface rounded-md transition-colors text-text-muted">
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-text flex items-center gap-2">
              Mission Log: <span className="text-accent">{run?.name || runIdStr}</span>
            </h1>
            <p className="text-sm text-text-muted">
              {owner}/{name} • {job?.name || 'run-agent'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${
              run?.status === 'in_progress' ? 'bg-info/10 text-info border border-info/20' :
              run?.conclusion === 'success' ? 'bg-success/10 text-success border border-success/20' :
              run?.conclusion === 'failure' ? 'bg-error/10 text-error border border-error/20' :
              'bg-surface border border-border text-text-muted'
          }`}>
            {run?.status === 'in_progress' && <Activity className="w-3 h-3 animate-pulse" />}
            {run?.status === 'completed' ? run.conclusion : run?.status || 'Unknown'}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => trigger()} 
            disabled={isPolling}
            className="bg-surface text-text hover:bg-surface-hover"
          >
            <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-accent' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface/30 glass-card rounded-md border border-border/50 font-mono text-sm">
        {job?.steps && job.steps.length > 0 ? (
          <div className="space-y-3">
            {job.steps.map(step => (
              <div key={step.number} className="flex flex-col border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {step.status === 'in_progress' ? (
                      <Activity className="w-4 h-4 text-accent animate-pulse" />
                    ) : step.conclusion === 'success' ? (
                      <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center text-success text-[10px]">✓</div>
                    ) : step.conclusion === 'failure' ? (
                      <div className="w-4 h-4 rounded-full bg-error/20 flex items-center justify-center text-error text-[10px]">!</div>
                    ) : step.status === 'queued' ? (
                      <div className="w-4 h-4 rounded-full border border-text-muted flex items-center justify-center"></div>
                    ) : (
                       <div className="w-4 h-4"></div>
                    )}
                    <span className={`font-semibold ${step.status === 'in_progress' ? 'text-accent' : step.conclusion === 'failure' ? 'text-error' : 'text-text'}`}>
                      {step.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {step.status === 'completed' ? step.conclusion : step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LogViewer logs={rawLogs} isRunning={isRunning} />
        )}
        
        {/* Only show raw logs if present and not overridden by steps view, or if completed */}
        {rawLogs && job?.status === 'completed' && (
          <div className="mt-8 border-t border-border/50 pt-4">
             <h3 className="text-xs uppercase text-text-muted mb-4 font-bold border-b border-border/50 pb-2">Full Execution Log</h3>
             <LogViewer logs={rawLogs} isRunning={false} />
          </div>
        )}
      </div>
    </div>
  );
}
