import type { AgentExecutor } from '../../types/agent';

export const claudeCode: AgentExecutor = {
  id: 'claude-code',
  displayName: 'Claude Code',
  description: 'Anthropic CLI. Routes via OpenRouter for free models.',
  requiredSecrets: ['OPENROUTER_API_KEY'],
  optionalSecrets: [],
  freeModelProviders: ['OpenRouter (:free)'],
  supportsMcp: true,
  mcpConfigFile: '.claude/settings.json',
  installStep: 'npm install -g @anthropic-ai/claude-code',
  executeCommand: 'claude -p "{{PROMPT}}" --allowedTools "Read,Write,Edit,Bash"',
  notes: 'Requires OpenRouter API key as ANTHROPIC_API_KEY context wrapper in Actions run.'
};
