import type { AgentExecutor } from '../../types/agent';
import type { AgentType } from '../../types/repository';

import { gemini } from './gemini';
import { aider } from './aider';
import { opencode } from './opencode';
import { crush } from './crush';
import { qwen } from './qwen';
import { goose } from './goose';
import { claudeCode } from './claude-code';
import { codex } from './codex';
import { aiderOllama } from './aider-ollama';

export const AGENT_REGISTRY: Record<AgentType, AgentExecutor> = {
  gemini,
  aider,
  opencode,
  crush,
  qwen,
  goose,
  'claude-code': claudeCode,
  codex,
  'aider-ollama': aiderOllama,
};
