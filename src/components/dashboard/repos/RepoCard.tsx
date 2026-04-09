import type { GitHubRepo } from '@/lib/github';
import { Code, ExternalLink, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepoCardProps {
  repo: GitHubRepo;
  onInstall: (repo: GitHubRepo) => void;
  isInstalling: boolean;
}

export function RepoCard({ repo, onInstall, isInstalling }: RepoCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/15 transition-all"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
            <Code className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-lg truncate max-w-[180px]" title={repo.name}>{repo.name}</h3>
            <span className="text-xs text-text-muted flex items-center gap-1">
              {repo.private ? <span className="text-warning">Private</span> : 'Public'}
              {repo.language && <><span className="text-border mx-1">•</span>{repo.language}</>}
            </span>
          </div>
        </div>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="p-2 text-text-muted hover:text-text transition-colors">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 relative z-10">
        {repo.description || 'No description provided.'}
      </p>

      <div className="pt-4 border-t border-border/50 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <Activity className="w-3 h-3" /> Ready
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          className="bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white transition-all glow-hover shadow-[0_0_15px_oklch(0.70_0.18_250_/_0.15)]"
          onClick={() => onInstall(repo)}
          disabled={isInstalling}
        >
          {isInstalling ? 'Attaching...' : <><Plus className="w-4 h-4 mr-1" /> Attach Agent</>}
        </Button>
      </div>
    </div>
  );
}
