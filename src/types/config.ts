export interface GlobalConfig {
  version: number;
  updatedAt: number;
  defaultAgentType: import('./repository').AgentType;
  mcpConfig: {
    enabledServers: string[];
    keys: Record<string, string>; // Keys for specific MCP servers (e.g. CONTEXT7_API_KEY)
  };
  uiPreferences: {
    theme: 'dark' | 'light' | 'system';
    logFontSize: 'sm' | 'base' | 'lg';
    logWordWrap: boolean;
    pollingIntervalMs: number;
  };
}
