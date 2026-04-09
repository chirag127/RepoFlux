import type { McpSettings } from '../../types/mcp';

// Fallback logic is handled by adding all to config and letting the agent route/query them via its standard MCP context injection.
// Sequential thinking is added by default.
export function generateMcpConfig(enabledServerIds: string[], secretsMap: Record<string, string>): Readonly<McpSettings> {
  const config: McpSettings = {
    mcpServers: {
      'sequential-thinking': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
        type: 'stdio',
      }
    }
  };

  // Docs Fallback Chain (Context7 -> Ref -> Docfork)
  if (enabledServerIds.includes('context7')) {
    config.mcpServers['context7'] = {
      type: 'sse',
      serverUrl: 'https://mcp.context7.com/mcp',
      headers: { 'CONTEXT7_API_KEY': secretsMap['CONTEXT7_API_KEY'] || '${{ secrets.CONTEXT7_API_KEY }}' }
    };
  }

  if (enabledServerIds.includes('ref')) {
    config.mcpServers['ref'] = {
      type: 'sse',
      serverUrl: 'https://api.ref.tools/mcp',
      headers: { 'x-ref-api-key': secretsMap['REF_API_KEY'] || '${{ secrets.REF_API_KEY }}' }
    };
  }

  if (enabledServerIds.includes('docfork')) {
    config.mcpServers['docfork'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'docfork']
    };
  }

  // Web Search Fallback Chain (Exa -> Linkup -> Kindly)
  if (enabledServerIds.includes('exa')) {
    config.mcpServers['exa'] = {
      type: 'sse',
      serverUrl: 'https://mcp.exa.ai/mcp',
      headers: { 'Authorization': `Bearer ${secretsMap['EXA_API_KEY'] || '${{ secrets.EXA_API_KEY }}'}` }
    };
  }

  if (enabledServerIds.includes('linkup')) {
    const key = secretsMap['LINKUP_API_KEY'] || '${{ secrets.LINKUP_API_KEY }}';
    config.mcpServers['linkup'] = {
      type: 'sse',
      serverUrl: `https://mcp.linkup.so/mcp?apiKey=${key}`
    };
  }

  if (enabledServerIds.includes('kindly-web-search')) {
    // Requires UV (Python) to be installed in the runner (handled in workflow if kindly is used)
    config.mcpServers['kindly-web-search'] = {
      type: 'stdio',
      command: 'uvx',
      args: ['--from', 'git+https://github.com/Shelpuk-AI-Technology-Consulting/kindly-web-search-mcp-server', 'kindly-web-search-mcp-server', 'start-mcp-server'],
      env: {
        'SERPER_API_KEY': secretsMap['SERPER_API_KEY'] || '${{ secrets.SERPER_API_KEY }}',
        'TAVILY_API_KEY': secretsMap['TAVILY_API_KEY'] || '${{ secrets.TAVILY_API_KEY }}',
      }
    };
  }

  // Core Code Integrations
  if (enabledServerIds.includes('filesystem')) {
    config.mcpServers['filesystem'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/github/workspace']
    };
  }
  
  if (enabledServerIds.includes('github')) {
    config.mcpServers['github'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { 'GITHUB_TOKEN': '${{ secrets.GITHUB_TOKEN }}' }
    };
  }

  if (enabledServerIds.includes('memory')) {
    config.mcpServers['memory'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory']
    };
  }

  if (enabledServerIds.includes('fetch')) {
    config.mcpServers['fetch'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch']
    };
  }

  return config;
}
