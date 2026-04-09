/**
 * Claude Code configuration generator.
 *
 * Claude Code reads MCP servers from:
 *   .mcp.json (project root, committable)
 *   ~/.claude.json (user scope)
 *
 * Format:
 * {
 *   "mcpServers": {
 *     "name": {
 *       "type": "stdio",
 *       "command": "...",
 *       "args": [...],
 *       "env": {}
 *     }
 *   }
 * }
 *
 * Claude Code uses `type` field explicitly.
 * Remote servers use `"type": "http"` with a `url`.
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

const CLAUDE_CONFIG_PATH = '.mcp.json';

function resolveSecret(
  template: string,
  secrets: Record<string, string>,
): string {
  const match = template.match(
    /\$\{\{\s*secrets\.(\w+)\s*\}\}/,
  );
  if (match) {
    const key = match[1];
    return secrets[key] || template;
  }
  return secrets[template] || template;
}

function toClaudeEntry(
  server: CanonicalMcpServer,
  secrets: Record<string, string>,
): Record<string, unknown> {
  if (
    server.transport === 'http' ||
    server.transport === 'sse'
  ) {
    let url = server.url || '';
    if (server.id === 'linkup') {
      const key = resolveSecret(
        '${{ secrets.LINKUP_API_KEY }}',
        secrets,
      );
      url = `${url}?apiKey=${key}`;
    }

    const entry: Record<string, unknown> = {
      type: 'http',
      url,
    };

    if (
      server.headers &&
      Object.keys(server.headers).length > 0
    ) {
      const resolved: Record<string, string> = {};
      for (const [k, v] of Object.entries(
        server.headers,
      )) {
        resolved[k] = resolveSecret(v, secrets);
      }
      entry.headers = resolved;
    }

    return entry;
  }

  const entry: Record<string, unknown> = {
    type: 'stdio',
    command: server.command,
    args: server.args,
  };

  if (
    server.env &&
    Object.keys(server.env).length > 0
  ) {
    const resolved: Record<string, string> = {};
    for (const [k, v] of Object.entries(
      server.env,
    )) {
      resolved[k] = resolveSecret(v, secrets);
    }
    entry.env = resolved;
  }

  return entry;
}

export function generateClaudeCodeConfig(
  options: ConfigGenOptions,
): GeneratedConfig {
  const servers = CANONICAL_SERVERS.filter(
    (s) =>
      options.enabledServerIds.includes(s.id) ||
      s.enabledByDefault,
  );

  const mcpServers: Record<
    string,
    Record<string, unknown>
  > = {};
  for (const server of servers) {
    mcpServers[server.id] = toClaudeEntry(
      server,
      options.secrets,
    );
  }

  return {
    agent: 'claude-code',
    filePath: CLAUDE_CONFIG_PATH,
    content: JSON.stringify(
      { mcpServers },
      null,
      2,
    ),
    format: 'json',
  };
}
