import { useRouter } from '@/hooks';
import { Terminal, LayoutDashboard, Settings, Code2, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  activePath: string;
}

const NavItem = ({ icon: Icon, label, path, activePath }: NavItemProps) => {
  const isActive = activePath === path || (path !== '/' && activePath.startsWith(path));
  
  return (
    <a 
      href={`#${path}`} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
        isActive 
          ? "bg-accent/15 text-accent shadow-[inset_2px_0_0_oklch(0.70_0.18_250)]" 
          : "text-text-secondary hover:bg-surface-hover hover:text-text"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-text-muted group-hover:text-text")} />
      {label}
    </a>
  );
};

export function Sidebar() {
  const { path } = useRouter();

  return (
    <aside className="w-64 flex-shrink-0 bg-surface/50 border-r border-border flex flex-col glass z-10">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent/20 border border-accent/50 flex items-center justify-center glow-accent">
            <Terminal className="w-4 h-4 text-accent" />
          </div>
          <span className="font-bold font-display tracking-tight text-lg">RepoFlux</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-1 mb-8">
          <NavItem icon={LayoutDashboard} label="Repositories" path="/" activePath={path} />
          <NavItem icon={Code2} label="Prompt Templates" path="/templates" activePath={path} />
          <NavItem icon={Cpu} label="Agent Registry" path="/agents" activePath={path} />
          <NavItem icon={Settings} label="Settings" path="/settings" activePath={path} />
        </div>
      </div>

      <div className="p-4 text-xs text-text-muted border-t border-border/50 text-center">
        v0.1.0-alpha
      </div>
    </aside>
  );
}
