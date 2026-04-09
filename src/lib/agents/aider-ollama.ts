import type { AgentExecutor } from '../../types/agent';

export const aiderOllama: AgentExecutor = {
  id: 'aider-ollama',
  displayName: 'Aider (Ollama Local)',
  description: 'Runs completely locally in Actions runner. 100% Free.',
  requiredSecrets: [],
  optionalSecrets: [],
  freeModelProviders: ['Ollama'],
  supportsMcp: false,
  installStep: 'pip install aider-chat --break-system-packages && curl -fsSL https://ollama.com/install.sh | sh && ollama pull codellama:13b',
  executeCommand: 'OLLAMA_API_BASE=http://localhost:11434 aider --model ollama/codellama:13b --message "{{PROMPT}}" --yes --no-git',
};
