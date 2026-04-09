import { ShieldAlert, Info, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GitHubApiError } from '@/lib/github';

export interface Diagnostics {
  error?: GitHubApiError;
  type?: 'permission' | 'trigger' | 'generic';
}

interface Props {
  diagnostics: Diagnostics | null;
  onClose: () => void;
  title?: string;
  onRetry?: () => void;
}

export function TroubleshootingGuide({ diagnostics, onClose, title = "Protocol Interrupted", onRetry }: Props) {
  if (!diagnostics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card max-w-xl w-full p-8 rounded-2xl border-error/20 shadow-[0_0_50px_oklch(0.60_0.20_30_/_0.15)]">
        <header className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
            <ShieldAlert className="w-6 h-6 text-error shadow-glow-error" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-error">{title}</h3>
            <p className="text-sm text-text-muted">The GitHub Secure Uplink failed with a status: {diagnostics.error?.status}</p>
          </div>
        </header>

        <div className="space-y-6 text-sm">
          {diagnostics.type === 'permission' && (
            <div className="space-y-4">
              <p className="text-text">Your Personal Access Token (PAT) lacks the required clearance for this repository. RepoFlux requires **Write Access** to Actions, Secrets, and Workflows.</p>
              <div className="bg-surface/50 p-4 rounded-lg border border-border/50">
                <h4 className="text-xs uppercase font-bold text-accent mb-2 flex items-center gap-2 italic">
                  <Sparkles className="w-3 h-3" /> Recommended Scopes
                </h4>
                <ul className="space-y-2 font-mono text-xs text-text-secondary">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Actions: Write</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Secrets: Write</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full" /> Contents/Workflows: Write</li>
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
                  <p className="text-text-secondary">Ensure the workflow is on the **Default Branch** (main/master). GitHub will not allow manual triggers if they only exist on feature branches.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1"><Zap className="w-4 h-4 text-warning" /></div>
                  <p className="text-text-secondary">Wait 30-60 seconds and try again. Sometimes the indexer lags behind the git push.</p>
                </li>
              </ul>
            </div>
          )}

          {diagnostics.type === 'generic' && (
            <div className="p-4 bg-surface rounded-md border border-border text-error font-mono text-xs break-all max-h-40 overflow-y-auto custom-scrollbar">
              {diagnostics.error?.message}
            </div>
          )}
        </div>

        <footer className="mt-10 flex gap-4 justify-end">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="border-border hover:bg-surface">
              Refresh Matrix
            </Button>
          )}
          <Button onClick={onClose} className="bg-void border border-border hover:bg-surface-hover text-text">
            Dismiss Briefing
          </Button>
        </footer>
      </div>
    </div>
  );
}
