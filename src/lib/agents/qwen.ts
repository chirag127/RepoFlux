import type { AgentExecutor } from '../../types/agent';

export const qwen: AgentExecutor = {
  id: 'qwen',
  displayName: 'Qwen Code',
  description: 'Alibaba CLI specialized for Qwen models.',
  requiredSecrets: ['QWEN_API_KEY'],
  optionalSecrets: ['OPENROUTER_API_KEY'],
  freeModelProviders: ['DashScope', 'OpenRouter'],
  supportsMcp: true,
  mcpConfigFile: '.qwen/settings.json',
  installStep: 'npm install -g @qwen-code/qwen-code@latest',
  executeCommand: 'qwen -p "{{PROMPT}}" --yolo',
};
