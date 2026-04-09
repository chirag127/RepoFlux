import { AuthWall } from './AuthWall';
import { AppShell } from './AppShell';
import { useRouter } from '@/hooks';

import { HomeView } from './views/HomeView';
import { RepoDetailView } from './views/RepoDetailView';
import { SettingsView } from './views/SettingsView';
import { RunViewer } from './views/RunViewer';
import { TemplatesView } from './views/TemplatesView';
import { AddRepoView } from './views/AddRepoView';

// Placeholder Views for less critical features
const AgentsView = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-3xl font-black font-display mb-2 text-gradient">Agent Registry</h1>
    <p className="text-text-secondary mb-8">Review the capabilities of the 9 integrated AI agents.</p>
    <div className="p-12 border border-dashed border-border rounded-xl text-center text-text-muted">
      Coming Soon in v1.1. (See Settings for Configuration)
    </div>
  </div>
);

export function DashboardApp() {
  const { matches, segments, path } = useRouter();

  let CurrentView = HomeView;
  let props = {};

  if (matches.isSettings) {
    CurrentView = SettingsView;
  } else if (path === '/templates') {
    CurrentView = TemplatesView;
  } else if (path === '/agents') {
    CurrentView = AgentsView;
  } else if (path === '/repo/add') {
    CurrentView = AddRepoView;
  } else if (matches.isRepoDetail) {
    // Check if it's a run detail: repo/:owner/:name/run/:id
    if (segments[3] === 'run' && segments[4]) {
      CurrentView = RunViewer as any;
      props = { owner: matches.repoOwner, name: matches.repoName, runIdStr: segments[4] };
    } else {
      CurrentView = RepoDetailView as any;
      props = { owner: matches.repoOwner, name: matches.repoName };
    }
  }

  return (
    <AuthWall>
      <AppShell>
        <CurrentView {...props} />
      </AppShell>
    </AuthWall>
  );
}
