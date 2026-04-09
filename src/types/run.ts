import type { AgentType } from './repository';

export type RunStatus =
  | 'queued'
  | 'dispatched'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentRun {
  id: string;
  repositoryId: string;
  repositoryFullName: string;
  prompt: string;
  status: RunStatus;
  agentType: AgentType;
  branch: string;
  workflowRunId?: number;
  jobId?: number;
  createdAt: number;
  dispatchedAt?: number;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  commitSha?: string;
  commitUrl?: string;
  logUrl?: string;
  error?: string;
  templateId?: string;
}
