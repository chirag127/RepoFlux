/**
 * Goose configuration generator.
 *
 * Goose reads its config from:
 *   ~/.config/goose/config.yaml
 *
 * Key differences from other agents:
 *   - Uses YAML, not JSON
 *   - Root key is `extensions`, not `mcpServers`
 *   - SSE servers use `url`, not `httpUrl`
 *   - Each extension has `enabled: true`
 *   - Timeout is in seconds
 */
import type {
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import { CANONICAL_SERVERS } from './servers';

const GOOSE_CONFIG_PATH =
  '.config/goose/config.yaml';

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

/** Indent a multi-line string by n spaces. */
function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

/**
 * Serialize a canonical server to Goose YAML
 * extension block.
 */
function toGooseYaml(
  server: CanonicalMcpServer,
  secrets: Record<string, string>,
): string {
  const lines: string[] = [];

  if (
    server.transport === 'http' ||
    server.transport === 'sse'
  ) {
    lines.push(`type: sse`);
    let url = server.url || '';
    if (server.id === 'linkup') {
      const key = resolveSecret(
        '${{ secrets.LINKUP_API_KEY }}',
        secrets,
      );
      url = `${url}?apiKey=${key}`;
    }
    lines.push(`url: "${url}"`);

    if (
      server.headers &&
      Object.keys(server.headers).length > 0
    ) {
      lines.push('headers:');
      for (const [k, v] of Object.entries(
        server.headers,
      )) {
        const resolved = resolveSecret(
          v,
          secrets,
        );
        lines.push(`  ${k}: "${resolved}"`);
      }
    }
  } else {
    lines.push(`type: stdio`);
    lines.push(`command: "${server.command}"`);
    if (server.args && server.args.length > 0) {
      lines.push('args:');
      for (const arg of server.args) {
        lines.push(`  - "${arg}"`);
      }
    }
    if (
      server.env &&
      Object.keys(server.env).length > 0
    ) {
      lines.push('env:');
      for (const [k, v] of Object.entries(
        server.env,
      )) {
        const resolved = resolveSecret(
          v,
          secrets,
        );
        lines.push(`  ${k}: "${resolved}"`);
      }
    }
  }

  lines.push('timeout: 300');
  lines.push('enabled: true');

  return lines.join('\n');
}

export function generateGooseConfig(
  options: ConfigGenOptions,
): GeneratedConfig {
  const servers = CANONICAL_SERVERS.filter(
    (s) =>
      options.enabledServerIds.includes(s.id) ||
      s.enabledByDefault,
  );

  let yaml = 'extensions:\n';

  for (const server of servers) {
    const block = toGooseYaml(
      server,
      options.secrets,
    );
    yaml += `  ${server.id}:\n`;
    yaml += indent(block, 4) + '\n\n';
  }

  return {
    agent: 'goose',
    filePath: GOOSE_CONFIG_PATH,
    content: yaml.trimEnd() + '\n',
    format: 'yaml',
  };
}
