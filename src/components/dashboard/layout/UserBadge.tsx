import { useAuth } from '@/hooks';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserBadge() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors outline-none group text-left">
          <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border border-border group-hover:border-accent transition-colors" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-sm font-medium truncate max-w-[120px]">{user.name || user.login}</span>
            <span className="text-xs text-text-muted truncate">@{user.login}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass border-border shadow-2xl">
        <DropdownMenuLabel className="font-display">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="focus:bg-surface-hover cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem 
          onClick={logout}
          className="text-error focus:bg-error/10 focus:text-error cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
