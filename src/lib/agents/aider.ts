import type { AgentExecutor } from '../../types/agent';

export const aider: AgentExecutor = {
  id: 'aider',
  displayName: 'Aider',
  description: 'Powerful pair programmer. Uses native repomap instead of MCP.',
  requiredSecrets: [],
  optionalSecrets: ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'MISTRAL_API_KEY', 'CEREBRAS_API_KEY'],
  freeModelProviders: ['Gemini', 'Groq', 'OpenRouter', 'Mistral', 'Cerebras'],
  supportsMcp: false,
  installStep: 'pip install aider-chat --break-system-packages',
  executeCommand: 'aider --model {{MODEL_OVERRIDE}} --message "{{PROMPT}}" --yes --no-git',
};
