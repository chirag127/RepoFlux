import type { AgentType } from './repository';

export interface AgentExecutor {
  id: AgentType;
  displayName: string;
  description: string;
  requiredSecrets: string[];
  optionalSecrets: string[];
  freeModelProviders: string[];
  supportsMcp: boolean;
  mcpConfigFile?: string;
  installStep: string;
  executeCommand: string;
  headlessFlag?: string;
  notes?: string;
}

export interface AgentConfig {
  type: AgentType;
  modelOverride?: string;
  apiKeys: Record<string, string>;
}
