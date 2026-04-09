import type { AgentExecutor } from '../../types/agent';

export const crush: AgentExecutor = {
  id: 'crush',
  displayName: 'Crush',
  description: 'Charmbracelet terminal tool. Fast and elegant.',
  requiredSecrets: [],
  optionalSecrets: ['OPENROUTER_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY'],
  freeModelProviders: ['OpenRouter', 'Gemini', 'Groq'],
  supportsMcp: true,
  mcpConfigFile: '/tmp/crush-config.toml',
  installStep: 'curl -sS https://charm.sh/install-crush.sh | sh',
  executeCommand: 'crush --prompt "{{PROMPT}}" --yes 2>&1',
};
