import { useState, useEffect } from 'react';
import { useAuth, useRouter, useDeployer } from '@/hooks';
import { Search, Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { listRepos, type GitHubRepo } from '@/lib/github';
import { RepoCard } from '../repos/RepoCard';

export function HomeView() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { installAgentWorkflow } = useDeployer();
  
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstallingId, setIsInstallingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await listRepos(1, 50);
        setRepos(fetched);
      } catch (err) {
        console.error("Failed to load GH repos", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);
  
  const filteredRepos = repos.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    r.name !== `${user?.login}-repoflux-state`
  );

  const handleInstallWorkflow = async (repo: GitHubRepo) => {
    try {
      setIsInstallingId(repo.full_name);
      await installAgentWorkflow(repo.owner.login, repo.name);
      alert(`Workflow installed in ${repo.full_name}! Configuration created.`);
      navigate(`/repo/${repo.owner.login}/${repo.name}`);
    } catch (err) {
      alert(`Installation failed: ${err}`);
    } finally {
      setIsInstallingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black font-display mb-2 text-gradient">Repository Control</h1>
        <p className="text-text-secondary">Attach RepoFlux agents to your GitHub repositories.</p>
      </header>

      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            placeholder="Search your repositories..." 
            className="pl-9 bg-surface border-border focus:border-accent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Terminal className="w-8 h-8 text-accent animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRepos.map(repo => (
            <RepoCard 
              key={repo.id}
              repo={repo}
              onInstall={handleInstallWorkflow}
              isInstalling={isInstallingId === repo.full_name}
            />
          ))}
          
          {filteredRepos.length === 0 && (
             <div className="col-span-full p-12 text-center text-text-muted border border-dashed border-border rounded-xl">
               No repositories found matching "{searchTerm}".
             </div>
          )}
        </div>
      )}
    </div>
  );
}
