/**
 * Legacy MCP server definitions.
 *
 * @deprecated Use `src/lib/config-gen/servers.ts`
 * for the canonical registry. This file remains
 * for backward compat with existing UI components.
 */
export interface McpServerRegistryItem {
  id: string;
  name: string;
  description: string;
  type: 'stdio' | 'sse';
  requiresSecrets: string[];
}

export const MCP_SERVER_DEFINITIONS:
  Record<string, McpServerRegistryItem> = {
  'sequential-thinking': {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description:
      'Autonomous reasoning loop.',
    type: 'stdio',
    requiresSecrets: [],
  },
  'context7': {
    id: 'context7',
    name: 'Context7',
    description:
      'Premium docs and code examples.',
    type: 'sse',
    requiresSecrets: ['CONTEXT7_API_KEY'],
  },
  'ref': {
    id: 'ref',
    name: 'Ref Tools',
    description:
      'Documentation search and reading.',
    type: 'sse',
    requiresSecrets: ['REF_API_KEY'],
  },
  'docfork': {
    id: 'docfork',
    name: 'Docfork',
    description:
      'Official library docs search.',
    type: 'stdio',
    requiresSecrets: [],
  },
  'exa': {
    id: 'exa',
    name: 'Exa AI',
    description: 'AI-native web search.',
    type: 'sse',
    requiresSecrets: [],
  },
  'linkup': {
    id: 'linkup',
    name: 'Linkup',
    description:
      'Fast web search and scraping.',
    type: 'sse',
    requiresSecrets: ['LINKUP_API_KEY'],
  },
  'kindly-web-search': {
    id: 'kindly-web-search',
    name: 'Kindly Search',
    description:
      'Multi-provider search (Serper + Tavily).',
    type: 'stdio',
    requiresSecrets: [
      'SERPER_API_KEY',
      'TAVILY_API_KEY',
    ],
  },
  'filesystem': {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Local file read/write.',
    type: 'stdio',
    requiresSecrets: [],
  },
  'github': {
    id: 'github',
    name: 'GitHub API',
    description:
      'Direct repository read/write.',
    type: 'stdio',
    requiresSecrets: [],
  },
  'memory': {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent context memory.',
    type: 'stdio',
    requiresSecrets: [],
  },
  'fetch': {
    id: 'fetch',
    name: 'Fetch',
    description: 'Generic HTTP fetch.',
    type: 'stdio',
    requiresSecrets: [],
  },
};
