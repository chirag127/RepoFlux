/**
 * Canonical MCP server registry.
 *
 * This is the single source of truth for all MCP
 * servers available in RepoFlux. Each agent-specific
 * generator maps these entries to its own format.
 *
 * Browser paths use GitHub Actions runner defaults
 * (Ubuntu) for CI/CD compatibility.
 */
import type { CanonicalMcpServer } from './types';

/**
 * Default Chrome path on GitHub Actions Ubuntu
 * runners. The `google-chrome-stable` binary is
 * pre-installed on `ubuntu-latest`.
 */
const GHA_CHROME_PATH =
  '/usr/bin/google-chrome-stable';

export const CANONICAL_SERVERS: CanonicalMcpServer[] =
  [
    // ─── Documentation Fallback Chain ───
    {
      id: 'context7',
      name: 'Context7',
      description:
        'Premium documentation and code examples.',
      transport: 'http',
      url: 'https://mcp.context7.com/mcp',
      headers: {
        CONTEXT7_API_KEY:
          '${{ secrets.CONTEXT7_API_KEY }}',
      },
      enabledByDefault: true,
    },
    {
      id: 'ref',
      name: 'Ref Tools',
      description:
        'Documentation search and reading.',
      transport: 'http',
      url: 'https://api.ref.tools/mcp',
      headers: {
        'x-ref-api-key':
          '${{ secrets.REF_API_KEY }}',
      },
      enabledByDefault: true,
    },
    {
      id: 'docfork',
      name: 'Docfork',
      description:
        'Official versioned library docs search.',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', 'docfork'],
      enabledByDefault: true,
    },

    // ─── Web Search Fallback Chain ───
    {
      id: 'exa',
      name: 'Exa AI',
      description: 'AI-native web search.',
      transport: 'http',
      url: 'https://mcp.exa.ai/mcp',
      headers: {},
      enabledByDefault: true,
    },
    {
      id: 'linkup',
      name: 'Linkup',
      description:
        'Fast web search and scraping.',
      transport: 'http',
      url: 'https://mcp.linkup.so/mcp',
      headers: {},
      enabledByDefault: true,
    },
    {
      id: 'kindly-web-search',
      name: 'Kindly Search',
      description:
        'Multi-provider search (Serper + Tavily).',
      transport: 'stdio',
      command: 'uvx',
      args: [
        '--from',
        'git+https://github.com/' +
          'Shelpuk-AI-Technology-Consulting/' +
          'kindly-web-search-mcp-server',
        'kindly-web-search-mcp-server',
        'start-mcp-server',
      ],
      env: {
        SERPER_API_KEY:
          '${{ secrets.SERPER_API_KEY }}',
        TAVILY_API_KEY:
          '${{ secrets.TAVILY_API_KEY }}',
        KINDLY_BROWSER_EXECUTABLE_PATH:
          GHA_CHROME_PATH,
      },
      enabledByDefault: true,
    },

    // ─── Reasoning ───
    {
      id: 'sequential-thinking',
      name: 'Sequential Thinking',
      description:
        'Autonomous reasoning loop for problems.',
      transport: 'stdio',
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/' +
          'server-sequential-thinking',
      ],
      enabledByDefault: true,
    },

    // ─── Core Code Integrations ───
    {
      id: 'filesystem',
      name: 'Filesystem',
      description: 'Local file read/write.',
      transport: 'stdio',
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        '/github/workspace',
      ],
      enabledByDefault: false,
    },
    {
      id: 'github',
      name: 'GitHub API',
      description:
        'Direct repository read/write access.',
      transport: 'stdio',
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-github',
      ],
      env: {
        GITHUB_TOKEN:
          '${{ secrets.GITHUB_TOKEN }}',
      },
      enabledByDefault: false,
    },
    {
      id: 'memory',
      name: 'Memory',
      description:
        'Persistent context memory for agents.',
      transport: 'stdio',
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-memory',
      ],
      enabledByDefault: false,
    },
    {
      id: 'fetch',
      name: 'Fetch',
      description: 'Generic HTTP fetch.',
      transport: 'stdio',
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-fetch',
      ],
      enabledByDefault: false,
    },
  ];

/**
 * Lookup a canonical server by its id.
 */
export function getServerById(
  id: string,
): CanonicalMcpServer | undefined {
  return CANONICAL_SERVERS.find(
    (s) => s.id === id,
  );
}

/**
 * Get all servers that are enabled by default.
 */
export function getDefaultServers():
  CanonicalMcpServer[] {
  return CANONICAL_SERVERS.filter(
    (s) => s.enabledByDefault,
  );
}
