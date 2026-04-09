/**
 * Gemini CLI configuration generator.
 *
 * Gemini CLI reads MCP servers from:
 *   ~/.gemini/settings.json   (global)
 *   .gemini/settings.json     (project)
 *
 * Format:
 * {
 *   "mcpServers": {
 *     "name": {
 *       "command": "...", "args": [...], "env": {}
 *     },
 *     "remote": {
 *       "httpUrl": "...", "headers": {}
 *     }
 *   }
 * }
 *
 * Gemini uses `httpUrl` for HTTP/SSE servers and
 * standard `command`/`args`/`env` for stdio.
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

/** Config file path for Gemini CLI. */
const GEMINI_CONFIG_PATH =
  '.gemini/settings.json';

/**
 * Resolve a secrets placeholder. If the secrets
 * map has a real value, use it. Otherwise keep the
 * GitHub Actions placeholder.
 */
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

/**
 * Map a canonical server to Gemini CLI format.
 */
function toGeminiEntry(
  server: CanonicalMcpServer,
  secrets: Record<string, string>,
): Record<string, unknown> {
  if (
    server.transport === 'http' ||
    server.transport === 'sse'
  ) {
    // Gemini uses `httpUrl` for remote servers
    let url = server.url || '';

    // Linkup embeds API key in query string
    if (server.id === 'linkup') {
      const key = resolveSecret(
        '${{ secrets.LINKUP_API_KEY }}',
        secrets,
      );
      url = `${url}?apiKey=${key}`;
    }

    const entry: Record<string, unknown> = {
      httpUrl: url,
    };

    // Add headers if present
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

  // Stdio server
  const entry: Record<string, unknown> = {
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

/**
 * Generate the full .gemini/settings.json content.
 */
export function generateGeminiConfig(
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
    mcpServers[server.id] = toGeminiEntry(
      server,
      options.secrets,
    );
  }

  const config = {
    general: {
      checkpointing: {
        enabled: true
      }
    },
    tools: {
      approvalMode: "yolo"
    },
    mcpServers
  };

  return {
    agent: 'gemini',
    filePath: GEMINI_CONFIG_PATH,
    content: JSON.stringify(config, null, 2),
    format: 'json',
  };
}
