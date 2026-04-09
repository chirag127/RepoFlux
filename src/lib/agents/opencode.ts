import type { AgentExecutor } from '../../types/agent';

export const opencode: AgentExecutor = {
  id: 'opencode',
  displayName: 'OpenCode',
  description: 'Multi-provider terminal agent with robust MCP support.',
  requiredSecrets: [],
  optionalSecrets: ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'CEREBRAS_API_KEY'],
  freeModelProviders: ['OpenRouter', 'Groq', 'Gemini'],
  supportsMcp: true,
  mcpConfigFile: '.opencode/config.json',
  installStep: 'curl -fsSL https://opencode.ai/install | bash',
  executeCommand: 'opencode -p "{{PROMPT}}" -f json -q',
};
