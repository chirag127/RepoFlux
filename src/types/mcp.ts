export interface McpServerDefinition {
  type: 'stdio' | 'sse' | 'http';
  command?: string;
  args?: string[];
  serverUrl?: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  disabled?: boolean;
}

export interface McpSettings {
  mcpServers: Record<string, McpServerDefinition>;
}
