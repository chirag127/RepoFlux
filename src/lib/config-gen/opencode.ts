/**
 * OpenCode configuration generator.
 *
 * OpenCode reads its config from:
 *   ~/.config/opencode/opencode.json (global)
 *   .opencode.json (project root)
 *
 * Format:
 * {
 *   "mcpServers": {
 *     "name": {
 *       "command": "...",
 *       "args": [...],
 *       "type": "stdio",
 *       "env": {}
 *     }
 *   }
 * }
 *
 * OpenCode uses `type: "stdio"` explicitly. For
 * remote it is similar to Claude's format.
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

const OPENCODE_CONFIG_PATH = '.opencode.json';

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

function toOpenCodeEntry(
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
      type: 'sse',
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

export function generateOpenCodeConfig(
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
    mcpServers[server.id] = toOpenCodeEntry(
      server,
      options.secrets,
    );
  }

  return {
    agent: 'opencode',
    filePath: OPENCODE_CONFIG_PATH,
    content: JSON.stringify(
      { mcpServers },
      null,
      2,
    ),
    format: 'json',
  };
}
