import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Terminal, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthWall({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, login } = useAuth();
  const [patInput, setPatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patInput.trim()) return;
    setIsSubmitting(true);
    await login(patInput.trim());
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void">
        <Terminal className="w-12 h-12 text-accent animate-pulse mb-4" />
        <p className="text-text-muted font-mono animate-pulse">Initializing Control Plane...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void scanlines p-4">
        <div className="w-full max-w-md glass-elevated rounded-xl p-8 border hover:border-accent/50 transition-colors duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] group-hover:bg-accent/20 transition-colors"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-lg glow-accent">
              <Shield className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold font-display text-center mb-2 text-text">Access Required</h2>
          <p className="text-center text-text-muted text-sm mb-8">
            RepoFlux operates entirely client-side. Please provide a GitHub Personal Access Token (classic with `repo` scope or fine-grained) to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="pat" className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <Key className="w-3 h-3" /> GitHub PAT
              </label>
              <Input 
                id="pat"
                type="password" 
                placeholder="ghp_********************************" 
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                className="bg-surface/50 border-border focus:border-accent font-mono text-sm"
                autoComplete="off"
              />
            </div>
            
            {error && (
              <div className="p-3 rounded bg-error/10 border border-error/20 text-error text-xs font-mono">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
              disabled={isSubmitting || !patInput.trim()}
            >
              {isSubmitting ? 'Authenticating...' : 'Establish Secure Connection'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-xs text-info hover:underline">
              Generate a new token →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
