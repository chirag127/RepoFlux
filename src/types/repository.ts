export type AgentType =
  | 'gemini'
  | 'aider'
  | 'opencode'
  | 'crush'
  | 'qwen'
  | 'goose'
  | 'claude-code'
  | 'codex'
  | 'aider-ollama';

export interface ManagedRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  description: string | null;
  isPrivate: boolean;
  language: string | null;
  stars: number;
  addedAt: number;
  lastRunId?: string;
  lastRunStatus?: string;
  defaultAgentType?: AgentType;
  workflowInstalled: boolean;
  workflowSha?: string;
  deployedSecrets: string[];
}
