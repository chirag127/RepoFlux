import type { AgentExecutor } from '../../types/agent';

export const gemini: AgentExecutor = {
  id: 'gemini',
  displayName: 'Gemini CLI',
  description: 'Official Google CLI. Best overall for free tier usage.',
  requiredSecrets: ['GEMINI_API_KEY'],
  optionalSecrets: [],
  freeModelProviders: ['Google AI Studio'],
  supportsMcp: true,
  mcpConfigFile: '.gemini/settings.json',
  installStep: 'npm install -g @google/gemini-cli@latest',
  executeCommand: 'gemini -p "{{PROMPT}}" --non-interactive',
};
