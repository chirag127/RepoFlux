import { RateLimitBadge } from './RateLimitBadge';
import { UserBadge } from './UserBadge';
import { useRouter } from '@/hooks';
import { ChevronRight, Home } from 'lucide-react';

export function Topbar() {
  const { path } = useRouter();

  const getBreadcrumbs = () => {
    const parts = path.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      path: '/' + parts.slice(0, i + 1).join('/')
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 flex-shrink-0 border-b border-border/50 bg-void/50 backdrop-blur-md flex items-center justify-between px-8 relative z-40">
      <div className="flex items-center gap-2 overflow-hidden">
        <a href="#/" className="text-text-muted hover:text-text transition-colors">
          <Home className="w-4 h-4" />
        </a>
        
        {breadcrumbs.length > 0 && <ChevronRight className="w-4 h-4 text-text-muted/50" />}
        
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.path} className="flex items-center gap-2 min-w-0">
            <a 
              href={`#${crumb.path}`} 
              className={`text-sm font-medium truncate ${i === breadcrumbs.length - 1 ? 'text-text' : 'text-text-muted hover:text-text transition-colors'}`}
            >
              {crumb.label}
            </a>
            {i < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-text-muted/50" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <RateLimitBadge />
        <div className="w-px h-6 bg-border/50" />
        <UserBadge />
      </div>
    </header>
  );
}
