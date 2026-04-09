/**
 * Legacy MCP config generator — delegates to the
 * new multi-agent config-gen system.
 *
 * This module is kept for backward compatibility.
 * New code should import from `@/lib/config-gen`.
 */
import type { McpSettings } from '../../types/mcp';
import {
  generateGeminiConfig,
  type ConfigGenOptions,
} from '../config-gen';

/**
 * Generate MCP config in the legacy format.
 *
 * Uses Gemini CLI format as the default since it
 * matches the original RepoFlux internal format.
 */
export function generateMcpConfig(
  enabledServerIds: string[],
  secretsMap: Record<string, string>,
): Readonly<McpSettings> {
  const options: ConfigGenOptions = {
    enabledServerIds,
    secrets: secretsMap,
    isGitHubActions: true,
  };

  const result = generateGeminiConfig(options);
  const parsed = JSON.parse(result.content);

  // Map Gemini format back to McpSettings
  const mcpServers: McpSettings['mcpServers'] =
    {};

  for (const [key, val] of Object.entries(
    parsed.mcpServers,
  )) {
    const v = val as Record<string, unknown>;
    if (v.httpUrl) {
      mcpServers[key] = {
        type: 'sse',
        serverUrl: v.httpUrl as string,
        headers: (v.headers as Record<
          string,
          string
        >) || undefined,
      };
    } else {
      mcpServers[key] = {
        type: 'stdio',
        command: v.command as string,
        args: v.args as string[],
        env: (v.env as Record<
          string,
          string
        >) || undefined,
      };
    }
  }

  return { mcpServers };
}
