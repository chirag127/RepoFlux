import { useRef, useEffect, useState } from 'react';
import { Terminal, Activity } from 'lucide-react';
import { parseAnsiToHtml } from '@/lib/log-parser';

interface LogViewerProps {
  logs: string;
  isRunning: boolean;
}

export function LogViewer({ logs, isRunning }: LogViewerProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="flex-1 glass-card rounded-xl border border-border flex flex-col overflow-hidden relative shadow-2xl">
      <div className="h-10 bg-surface-elevated border-b border-border flex items-center px-4 justify-between relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error/80 shadow-[0_0_5px_oklch(0.65_0.22_25_/_0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-warning/80"></div>
          <div className="w-3 h-3 rounded-full bg-success/80"></div>
        </div>
        <div className="text-xs font-mono text-text-muted flex items-center gap-2">
          <Terminal className="w-3 h-3" /> repoflux-pty
        </div>
        <div className="w-12"></div>
      </div>

      <div 
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-void p-4 overflow-y-auto custom-scrollbar font-mono text-sm relative"
      >
        <div className="absolute inset-0 scanlines pointer-events-none opacity-20 z-10"></div>
        <div className="relative z-0">
          {logs ? (
            <div 
              className="text-text whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseAnsiToHtml(logs) }}
            />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-text-muted">
              {isRunning ? (
                <>
                  <Activity className="w-8 h-8 text-accent animate-pulse mb-4" />
                  <p className="animate-pulse tracking-widest uppercase text-[10px] font-bold">Establishing Uplink...</p>
                </>
              ) : (
                <p className="text-sm">EndOfFile: No log data available.</p>
              )}
            </div>
          )}
          {isRunning && logs && (
            <div className="mt-4 text-accent"><span className="terminal-cursor"></span></div>
          )}
        </div>
      </div>
    </div>
  );
}
