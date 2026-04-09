import type { AgentExecutor } from '../../types/agent';

export const codex: AgentExecutor = {
  id: 'codex',
  displayName: 'Codex CLI',
  description: 'OpenAI legacy CLI, usable with free models via OpenRouter.',
  requiredSecrets: ['OPENROUTER_API_KEY'],
  optionalSecrets: [],
  freeModelProviders: ['OpenRouter (:free)'],
  supportsMcp: false,
  installStep: 'npm install -g @openai/codex',
  executeCommand: 'codex exec --full-auto "{{PROMPT}}"',
};
