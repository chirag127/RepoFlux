export interface McpServerRegistryItem {
  id: string;
  name: string;
  description: string;
  type: 'stdio' | 'sse';
  requiresSecrets: string[];
}

export const MCP_SERVER_DEFINITIONS: Record<string, McpServerRegistryItem> = {
  'sequential-thinking': {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Autonomous reasoning loop for complex problem solving.',
    type: 'stdio',
    requiresSecrets: []
  },
  'context7': {
    id: 'context7',
    name: 'Context7',
    description: 'Premium documentation and code examples registry.',
    type: 'sse',
    requiresSecrets: ['CONTEXT7_API_KEY']
  },
  'ref': {
    id: 'ref',
    name: 'Ref Tools',
    description: 'Documentation search and reading via Ref API.',
    type: 'sse',
    requiresSecrets: ['REF_API_KEY']
  },
  'docfork': {
    id: 'docfork',
    name: 'Docfork',
    description: 'Official library documentation search via Docfork.',
    type: 'stdio',
    requiresSecrets: []
  },
  'exa': {
    id: 'exa',
    name: 'Exa AI',
    description: 'AI-native web search and research.',
    type: 'sse',
    requiresSecrets: ['EXA_API_KEY']
  },
  'linkup': {
    id: 'linkup',
    name: 'Linkup',
    description: 'Fast, reliable web search and scraping.',
    type: 'sse',
    requiresSecrets: ['LINKUP_API_KEY']
  },
  'kindly-web-search': {
    id: 'kindly-web-search',
    name: 'Kindly Search',
    description: 'Redundant search via Serper and Tavily.',
    type: 'stdio',
    requiresSecrets: ['SERPER_API_KEY', 'TAVILY_API_KEY']
  },
  'filesystem': {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Local file read/write operations.',
    type: 'stdio',
    requiresSecrets: []
  },
  'github': {
    id: 'github',
    name: 'GitHub API',
    description: 'Direct repository read/write access.',
    type: 'stdio',
    requiresSecrets: []
  },
  'memory': {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent contextual memory for agents.',
    type: 'stdio',
    requiresSecrets: []
  },
  'fetch': {
    id: 'fetch',
    name: 'Fetch Utilities',
    description: 'Generic HTTP fetch capabilities.',
    type: 'stdio',
    requiresSecrets: []
  }
};
