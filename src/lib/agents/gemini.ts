import type { AgentExecutor } from '../../types/agent';

/**
 * Gemini CLI agent configuration.
 *
 * Config file: .gemini/settings.json
 * Format: JSON with `mcpServers` using `httpUrl`
 * for remote and `command`/`args` for stdio.
 *
 * Free tier: Google AI Studio provides free
 * Gemini API keys with generous limits.
 */
export const gemini: AgentExecutor = {
  id: 'gemini',
  displayName: 'Gemini CLI',
  description:
    'Official Google CLI. Best overall for ' +
    'free tier usage. Supports httpUrl for ' +
    'remote MCP and command/args for stdio.',
  requiredSecrets: ['GEMINI_API_KEY'],
  optionalSecrets: [],
  freeModelProviders: ['Google AI Studio'],
  supportsMcp: true,
  mcpConfigFile: '.gemini/settings.json',
  installStep:
    'npm install -g @google/gemini-cli@latest',
  executeCommand:
    'gemini -p "{{PROMPT}}" --yolo',
};
