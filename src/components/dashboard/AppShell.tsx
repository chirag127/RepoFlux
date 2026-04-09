import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { OfflineBanner } from './layout/OfflineBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex text-text overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <OfflineBanner />
        <Topbar />
        
        {/* Subtle noise and scanlines on main canvas */}
        <div className="absolute inset-0 bg-noise pointer-events-none opacity-50 z-0"></div>
        <div className="absolute inset-0 scanlines pointer-events-none opacity-20 z-0"></div>
        
        {/* Scrollable container for views */}
        <div className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
