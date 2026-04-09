/**
 * Qwen Code configuration generator.
 *
 * Qwen Code reads its full settings from:
 *   ~/.qwen/settings.json   (global)
 *   .qwen/settings.json     (project)
 *
 * Unlike other agents, Qwen Code's settings.json
 * contains the FULL agent configuration including
 * security, IDE, model, tools, and mcpServers.
 *
 * Format:
 * {
 *   "security": { "auth": { ... } },
 *   "$version": 3,
 *   "ide": { ... },
 *   "model": { ... },
 *   "tools": { ... },
 *   "general": { ... },
 *   "context": { ... },
 *   "mcpServers": {
 *     "name": {
 *       "httpUrl": "...", "headers": {}
 *     },
 *     "name": {
 *       "command": "...", "args": [...]
 *     }
 *   }
 * }
 *
 * Qwen uses `httpUrl` for HTTP/SSE servers.
 * Qwen supports `command`/`args`/`env` for stdio.
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

/** Config file path for Qwen Code. */
const QWEN_CONFIG_PATH =
  '.qwen/settings.json';

/**
 * Resolve a secrets placeholder.
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
 * Map a canonical server to Qwen Code format.
 *
 * Qwen uses `httpUrl` for remote servers (identical
 * to Gemini CLI) and `command`/`args` for stdio.
 */
function toQwenEntry(
  server: CanonicalMcpServer,
  secrets: Record<string, string>,
): Record<string, unknown> {
  if (
    server.transport === 'http' ||
    server.transport === 'sse'
  ) {
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

  // Stdio servers
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
 * Generate the full Qwen Code settings.json.
 *
 * This includes the complete settings structure
 * with security, IDE, model, tools, context, and
 * mcpServers sections. The mcpServers section is
 * populated from the canonical server registry.
 */
export function generateQwenConfig(
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
    mcpServers[server.id] = toQwenEntry(
      server,
      options.secrets,
    );
  }

  // Full Qwen Code settings.json structure
  const config = {
    security: {
      auth: {
        selectedType: 'qwen-oauth',
      },
    },
    $version: 3,
    ide: {
      enabled: true,
      hasSeenNudge: true,
    },
    model: {
      name: 'coder-model',
    },
    tools: {
      approvalMode: 'yolo',
    },
    general: {
      language: 'en',
    },
    context: {
      fileFiltering: {
        respectGitIgnore: false,
        respectQwenIgnore: false,
      },
    },
    mcpServers,
  };

  return {
    agent: 'qwen',
    filePath: QWEN_CONFIG_PATH,
    content: JSON.stringify(config, null, 2),
    format: 'json',
  };
}
