/**
 * Multi-agent MCP configuration generator.
 *
 * Central entry point that generates agent-specific
 * config files for all supported AI coding agents.
 * Each agent has its own format:
 *
 *   Gemini CLI    → .gemini/settings.json  (JSON)
 *   Qwen Code     → .qwen/settings.json    (JSON)
 *   Claude Code   → .mcp.json              (JSON)
 *   Goose         → config.yaml            (YAML)
 *   OpenCode      → .opencode.json         (JSON)
 *   Crush         → config.toml            (TOML)
 */
export type {
  TargetAgent,
  CanonicalMcpServer,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';

export {
  CANONICAL_SERVERS,
  getServerById,
  getDefaultServers,
} from './servers';

export {
  generateGeminiConfig,
} from './gemini';

export {
  generateQwenConfig,
} from './qwen';

export {
  generateClaudeCodeConfig,
} from './claude-code';

export {
  generateGooseConfig,
} from './goose';

export {
  generateOpenCodeConfig,
} from './opencode';

export {
  generateCrushConfig,
} from './crush';

import type {
  TargetAgent,
  ConfigGenOptions,
  GeneratedConfig,
} from './types';
import {
  generateGeminiConfig,
} from './gemini';
import {
  generateQwenConfig,
} from './qwen';
import {
  generateClaudeCodeConfig,
} from './claude-code';
import {
  generateGooseConfig,
} from './goose';
import {
  generateOpenCodeConfig,
} from './opencode';
import {
  generateCrushConfig,
} from './crush';

/**
 * Generator dispatch map. Maps each agent to its
 * specific config generator function.
 */
const GENERATORS: Record<
  TargetAgent,
  (opts: ConfigGenOptions) => GeneratedConfig
> = {
  gemini: generateGeminiConfig,
  qwen: generateQwenConfig,
  'claude-code': generateClaudeCodeConfig,
  goose: generateGooseConfig,
  opencode: generateOpenCodeConfig,
  crush: generateCrushConfig,
};

/**
 * Generate config for a single agent.
 */
export function generateConfigForAgent(
  agent: TargetAgent,
  options: ConfigGenOptions,
): GeneratedConfig {
  const generator = GENERATORS[agent];
  if (!generator) {
    throw new Error(
      `Unknown agent: ${agent}`,
    );
  }
  return generator(options);
}

/**
 * Generate configs for ALL supported agents.
 * Returns an array of GeneratedConfig objects.
 */
export function generateAllConfigs(
  options: ConfigGenOptions,
): GeneratedConfig[] {
  return Object.keys(GENERATORS).map(
    (agent) =>
      generateConfigForAgent(
        agent as TargetAgent,
        options,
      ),
  );
}
