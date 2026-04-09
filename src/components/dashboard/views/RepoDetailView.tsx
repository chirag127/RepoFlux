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

  // Troubleshooting Modal / Inline Guide
  const TroubleshootingGuide = () => {
    if (!diagnostics) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="glass-card max-w-xl w-full p-8 rounded-2xl border-error/20 shadow-[0_0_50px_oklch(0.60_0.20_30_/_0.15)]">
          <header className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
              <ShieldAlert className="w-6 h-6 text-error shadow-glow-error" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-error">Protocol Interrupted</h3>
              <p className="text-sm text-text-muted">The GitHub Secure Uplink failed with a status: {diagnostics.error?.status}</p>
            </div>
          </header>

          <div className="space-y-6 text-sm">
            {diagnostics.type === 'permission' && (
              <div className="space-y-4">
                <p className="text-text">Your Personal Access Token (PAT) lacks the required clearance for this repository. RepoFlux requires **Write Access** to Actions and Secrets.</p>
                <div className="bg-surface/50 p-4 rounded-lg border border-border/50">
                  <h4 className="text-xs uppercase font-bold text-accent mb-2 flex items-center gap-2 italic">
                    <Sparkles className="w-3 h-3" /> Recommended Scopes
                  </h4>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Actions: Write</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Secrets: Write</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Contents: Write</li>
                  </ul>
                </div>
                <p className="text-text-muted italic">Visit <a href="https://github.com/settings/tokens" target="_blank" className="text-accent underline">GitHub Settings</a> to update your token permissions.</p>
              </div>
            )}

            {diagnostics.type === 'trigger' && (
              <div className="space-y-4">
                <p className="text-text">GitHub has not yet activated the `workflow_dispatch` trigger for this repository. This usually happens while the Actions Indexer is processing the file.</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="mt-1"><Info className="w-4 h-4 text-info" /></div>
                    <p>Ensure the workflow is on the **Default Branch** (main/master). GitHub will not allow manual triggers if they only exist on feature branches.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1"><Zap className="w-4 h-4 text-warning" /></div>
                    <p>Wait 30-60 seconds and try again. Sometimes the indexer lags behind the git push.</p>
                  </li>
                </ul>
                <div className="flex gap-4 pt-2">
                   <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">Refresh Control Plane</Button>
                </div>
              </div>
            )}

            {diagnostics.type === 'generic' && (
              <div className="p-4 bg-surface rounded-md border border-border text-error font-mono text-xs">
                {diagnostics.error?.message}
              </div>
            )}
          </div>

          <footer className="mt-10 flex justify-end">
            <Button onClick={() => setDiagnostics(null)} className="bg-void border border-border hover:bg-surface-hover text-text">
              Close Intelligence Report
            </Button>
          </footer>
        </div>
      </div>
    );
  };

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

        <TroubleshootingGuide />

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
