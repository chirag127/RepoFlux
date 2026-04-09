import { useState, useEffect } from 'react';
import { useAuth, useRouter } from '@/hooks';
import { Play, Activity, Clock, Terminal, Github, Bot, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { getRepo, dispatchWorkflow, listWorkflowRuns, getRepoPublicKey, createOrUpdateSecret, getWorkflow, type GitHubWorkflowRun, type GitHubWorkflow, GitHubApiError } from '@/lib/github';
import { encryptSecret } from '@/lib/secret-encryptor';
import type { AgentType } from '@/types/repository';
import { RunRow } from '../runs/RunRow';
import { AlertCircle, ShieldAlert, Zap, Info, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { TroubleshootingGuide } from '../diagnostics/TroubleshootingGuide';

export function RepoDetailView({ owner, name }: { owner: string, name: string }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('gemini');
  const [isDispatching, setIsDispatching] = useState(false);
  const [runs, setRuns] = useState<GitHubWorkflowRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [workflow, setWorkflow] = useState<GitHubWorkflow | null>(null);
  const [isVerifyingWorkflow, setIsVerifyingWorkflow] = useState(true);
  const [diagnostics, setDiagnostics] = useState<{
    error?: GitHubApiError;
    type?: 'permission' | 'trigger' | 'generic';
  } | null>(null);

  useEffect(() => {
    async function loadRepoAndWorkflow() {
      try {
        const repo = await getRepo(owner, name);
        
        // Check for workflow on default branch
        try {
          const wfData = await getWorkflow(owner, name, 'repoflux-agent.yml');
          setWorkflow(wfData);
        } catch (wfErr) {
          console.warn("Workflow not found in registry yet");
        }

        const data = await listWorkflowRuns(owner, name, 'repoflux-agent.yml');
        setRuns(data.workflow_runs || []);
      } catch (err) {
        console.error("Initial load failed", err);
      } finally {
        setIsLoadingRuns(false);
        setIsVerifyingWorkflow(false);
      }
    }
    loadRepoAndWorkflow();
  }, [owner, name]);

  const handleDispatch = async () => {
    if (!prompt.trim()) return;
    setIsDispatching(true);
    setDiagnostics(null);

    try {
      const repo = await getRepo(owner, name);
      const inputs = {
        run_id: `run-${Date.now()}`,
        prompt,
        agent_type: selectedAgent,
        state_repo: `${user?.login}-repoflux-state`,
        branch: repo.default_branch || 'main',
      };

      // Push required secrets to the repository dynamically
      const requiredSecrets = AGENT_REGISTRY[selectedAgent].requiredSecrets || [];
      if (requiredSecrets.length > 0) {
        const pk = await getRepoPublicKey(owner, name);
        for (const secretName of requiredSecrets) {
          const val = localStorage.getItem(`repoflux_key_${secretName}`);
          if (val) {
            const encryptedValue = await encryptSecret(val, pk.key);
            await createOrUpdateSecret(owner, name, secretName, encryptedValue, pk.key_id);
          } else {
             console.warn(`Warning: Missing ${secretName} in Settings!`);
          }
        }
      }

      await dispatchWorkflow(owner, name, 'repoflux-agent.yml', repo.default_branch || 'main', inputs);
      alert('Mission Dispatched! Agent is spinning up on GitHub Actions.');
      setPrompt('');
      
      setTimeout(async () => {
        const data = await listWorkflowRuns(owner, name, 'repoflux-agent.yml').catch(() => ({ workflow_runs: [] }));
        setRuns(data.workflow_runs);
      }, 5000);
      
    } catch (err) {
      if (err instanceof GitHubApiError) {
        if (err.isPermissionError) setDiagnostics({ error: err, type: 'permission' });
        else if (err.isTriggerError) setDiagnostics({ error: err, type: 'trigger' });
        else setDiagnostics({ error: err, type: 'generic' });
      } else {
        alert(`Dispatch failed: ${err}`);
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const activeAgent = AGENT_REGISTRY[selectedAgent];

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-surface rounded-md transition-colors text-text-muted">
           ←
        </button>
        <div>
          <h1 className="text-3xl font-bold font-display text-text">{owner}/{name}</h1>
          <a href={`https://github.com/${owner}/${name}`} target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text flex items-center gap-1 mt-1">
            <Github className="w-3 h-3" /> View on GitHub
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-accent" /> Dispatch Agent
            </h2>
            
            <div className="mb-4">
               <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">Agent OS</label>
               <Select value={selectedAgent} onValueChange={(val) => setSelectedAgent(val as AgentType)}>
                <SelectTrigger className="bg-surface border-border focus:ring-accent w-[280px]">
                  <SelectValue placeholder="Select an Agent" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AGENT_REGISTRY).map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-text-secondary" />
                        <span>{a.displayName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted mt-2">{activeAgent.description}</p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">Mission Prompt</label>
              <Textarea 
                placeholder="Describe the feature to build, bug to fix, or refactor to perform..." 
                className="h-40 bg-surface border-border focus:border-accent font-mono text-sm resize-none custom-scrollbar"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-warning">
                <Key className="w-3 h-3" /> Required Secrets: {activeAgent.requiredSecrets.join(', ') || 'None'}
              </div>
              <Button 
                onClick={handleDispatch} 
                disabled={isDispatching || !prompt.trim() || isVerifyingWorkflow}
                className="bg-accent hover:bg-accent/90 text-white font-bold px-8 shadow-[0_0_20px_oklch(0.70_0.18_250_/_0.2)]"
              >
                {isVerifyingWorkflow ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Trigger...
                  </div>
                ) : isDispatching ? 'Initializing...' : <><Play className="w-4 h-4 mr-2" /> Execute Protocol</>}
              </Button>
            </div>
            
            {!isVerifyingWorkflow && !workflow && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  **Trigger Offline:** GitHub hasn't registered a manual trigger for this repository yet. If you just Infiltrated, wait 30s.
                </p>
              </div>
            )}
          </div>
        </div>

        <TroubleshootingGuide 
          diagnostics={diagnostics} 
          onClose={() => setDiagnostics(null)} 
          onRetry={() => window.location.reload()}
        />

        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-info" /> Agent Telemetry
            </h2>
            
            {isLoadingRuns ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
              </div>
            ) : runs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg mt-2">
                <Clock className="w-8 h-8 text-text-muted mb-2 opacity-50" />
                <p className="text-sm text-text-muted">No telemetry logs found for this repository.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {runs.map(run => (
                  <RunRow 
                    key={run.id}
                    run={run}
                    onClick={() => navigate(`/repo/${owner}/${name}/run/${run.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
