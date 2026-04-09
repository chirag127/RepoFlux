import type { AgentExecutor } from '../../types/agent';

/**
 * Qwen Code agent configuration.
 *
 * Config file: .qwen/settings.json
 * Format: Full JSON with security, ide, model,
 * tools, context, and mcpServers sections.
 * Uses `httpUrl` for remote MCP servers and
 * `command`/`args` for stdio.
 *
 * Free tier: DashScope (Alibaba) provides free
 * Qwen API keys with excellent coding models.
 * Qwen Code is the most feature-complete free
 * coding agent available.
 */
export const qwen: AgentExecutor = {
  id: 'qwen',
  displayName: 'Qwen Code',
  description:
    'Alibaba CLI for Qwen models. Full ' +
    'settings.json with security, ide, model, ' +
    'tools, context, and mcpServers. Uses ' +
    'httpUrl for remote MCP.',
  requiredSecrets: ['QWEN_API_KEY'],
  optionalSecrets: ['OPENROUTER_API_KEY'],
  freeModelProviders: [
    'DashScope',
    'OpenRouter',
  ],
  supportsMcp: true,
  mcpConfigFile: '.qwen/settings.json',
  installStep:
    'npm install -g @anthropic-ai/claude-code' +
    ' || npm install -g qwen-code',
  executeCommand:
    'qwen -p "{{PROMPT}}" --yolo',
};
