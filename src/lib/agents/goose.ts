import type { AgentExecutor } from '../../types/agent';

export const goose: AgentExecutor = {
  id: 'goose',
  displayName: 'Goose',
  description: 'Block/Square developer agent with heavy MCP focus.',
  requiredSecrets: [],
  optionalSecrets: ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY'],
  freeModelProviders: ['OpenRouter', 'Groq', 'Gemini'],
  supportsMcp: true,
  mcpConfigFile: '/tmp/goose-config.yaml',
  installStep: 'curl -fsSL https://github.com/block/goose/releases/latest/download/install.sh | bash',
  executeCommand: 'goose run --text "{{PROMPT}}" 2>&1',
};
