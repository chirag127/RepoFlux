import { describe, it, expect, vi } from 'vitest';
import { checkWorkflowStatus, installAgentWorkflow } from '../lib/workflow-installer';
import * as github from '../lib/github';

vi.mock('../lib/github', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    getFile: vi.fn(),
    writeFile: vi.fn(),
  };
});

describe('workflow installer', () => {
  it('checkWorkflowStatus returns true if workflow exists', async () => {
    vi.mocked(github.getFile).mockResolvedValue({ sha: 'abc1234' } as any);
    
    const result = await checkWorkflowStatus('tester', 'repoflux');
    expect(result.installed).toBe(true);
    expect(github.getFile).toHaveBeenCalledWith('tester', 'repoflux', '.github/workflows/repoflux-agent.yml', 'main');
  });

  it('checkWorkflowStatus returns false if workflow 404s', async () => {
    vi.mocked(github.getFile).mockRejectedValue({ status: 404 });
    
    const result = await checkWorkflowStatus('tester', 'repoflux');
    expect(result.installed).toBe(false);
  });

  it('installAgentWorkflow writes the workflow file via API', async () => {
    vi.mocked(github.writeFile).mockResolvedValue({} as any);
    
    await installAgentWorkflow('tester', 'repoflux');
    expect(github.writeFile).toHaveBeenCalledWith(
      'tester',
      'repoflux',
      '.github/workflows/repoflux-agent.yml',
      'Install RepoFlux Agent Workflow',
      expect.stringContaining('name: RepoFlux — AI Coding Agent'),
      'main',
      undefined
    );
  });
});
