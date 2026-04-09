/**
 * Crush (Charmbracelet) configuration generator.
 *
 * Crush reads MCP config from a TOML file.
 * The path can be set via CRUSH_CONFIG env var;
 * default is ~/.config/crush/config.toml.
 *
 * Format (TOML):
 * [mcp.servers.name]
 * command = "npx"
 * args = ["-y", "server-name"]
 *
 * [mcp.servers.name.env]
 * KEY = "value"
 *
 * Remote servers use:
 * [mcp.servers.name]
 * url = "https://..."
 *
 * [mcp.servers.name.headers]
 * Authorization = "Bearer ..."
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

const CRUSH_CONFIG_PATH =
  '.config/crush/config.toml';

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
 * Escape a string for TOML double-quoted value.
 */
function tomlEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function toCrushToml(
  server: CanonicalMcpServer,
  secrets: Record<string, string>,
): string {
  const id = server.id;
  const lines: string[] = [];

  lines.push(`[mcp.servers.${id}]`);

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
    lines.push(`url = "${tomlEscape(url)}"`);

    if (
      server.headers &&
      Object.keys(server.headers).length > 0
    ) {
      lines.push('');
      lines.push(
        `[mcp.servers.${id}.headers]`,
      );
      for (const [k, v] of Object.entries(
        server.headers,
      )) {
        const resolved = resolveSecret(
          v,
          secrets,
        );
        lines.push(
          `${k} = "${tomlEscape(resolved)}"`,
        );
      }
    }
  } else {
    lines.push(
      `command = "${server.command}"`,
    );
    if (server.args && server.args.length > 0) {
      const argsStr = server.args
        .map((a) => `"${tomlEscape(a)}"`)
        .join(', ');
      lines.push(`args = [${argsStr}]`);
    }

    if (
      server.env &&
      Object.keys(server.env).length > 0
    ) {
      lines.push('');
      lines.push(
        `[mcp.servers.${id}.env]`,
      );
      for (const [k, v] of Object.entries(
        server.env,
      )) {
        const resolved = resolveSecret(
          v,
          secrets,
        );
        lines.push(
          `${k} = "${tomlEscape(resolved)}"`,
        );
      }
    }
  }

  return lines.join('\n');
}

export function generateCrushConfig(
  options: ConfigGenOptions,
): GeneratedConfig {
  const servers = CANONICAL_SERVERS.filter(
    (s) =>
      options.enabledServerIds.includes(s.id) ||
      s.enabledByDefault,
  );

  const blocks = servers.map((s) =>
    toCrushToml(s, options.secrets),
  );

  return {
    agent: 'crush',
    filePath: CRUSH_CONFIG_PATH,
    content: blocks.join('\n\n') + '\n',
    format: 'toml',
  };
}
