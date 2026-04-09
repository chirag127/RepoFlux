import { describe, it, expect, vi } from 'vitest';
import { withOptimisticLock } from '../lib/concurrency';
import { GitHubApiError } from '../lib/github';

describe('withOptimisticLock', () => {
  it('succeeds on first try without conflict', async () => {
    const getCurrentStatus = vi.fn().mockResolvedValue({ content: { val: 1 }, sha: 'sha1' });
    const attemptUpdate = vi.fn().mockResolvedValue(true);
    const computeNewState = vi.fn().mockReturnValue({ val: 2 });

    const result = await withOptimisticLock(getCurrentStatus, attemptUpdate, computeNewState);
    
    expect(result).toEqual({ val: 2 });
    expect(getCurrentStatus).toHaveBeenCalledTimes(1);
    expect(attemptUpdate).toHaveBeenCalledTimes(1);
    expect(attemptUpdate).toHaveBeenCalledWith({ val: 2 }, 'sha1');
  });

  it('retries on 409 conflict and succeeds', async () => {
    const getCurrentStatus = vi.fn()
      .mockResolvedValueOnce({ content: { val: 1 }, sha: 'sha1' })
      .mockResolvedValueOnce({ content: { val: 2 }, sha: 'sha2' });
      
    // simulate a 409 conflict on first write, success on second
    const attemptUpdate = vi.fn()
      .mockRejectedValueOnce(new GitHubApiError(409, 'Conflict', '/'))
      .mockResolvedValueOnce(true);
      
    const computeNewState = vi.fn((state) => ({ val: state.val + 1 }));

    const result = await withOptimisticLock(getCurrentStatus, attemptUpdate, computeNewState);
    
    expect(result).toEqual({ val: 3 }); // 2 + 1
    expect(getCurrentStatus).toHaveBeenCalledTimes(2);
    expect(attemptUpdate).toHaveBeenCalledTimes(2);
    expect(attemptUpdate).toHaveBeenNthCalledWith(1, { val: 2 }, 'sha1');
    expect(attemptUpdate).toHaveBeenNthCalledWith(2, { val: 3 }, 'sha2');
  });

  it('fails after max retries', async () => {
    const getCurrentStatus = vi.fn().mockResolvedValue({ content: { val: 1 }, sha: 'shaX' });
    const attemptUpdate = vi.fn().mockRejectedValue(new GitHubApiError(409, 'Conflict', '/'));
    const computeNewState = vi.fn().mockReturnValue({ val: 2 });

    await expect(withOptimisticLock(getCurrentStatus, attemptUpdate, computeNewState, 3))
      .rejects.toThrow('Failed to update state after 3 optimistic lock retries');
      
    expect(getCurrentStatus).toHaveBeenCalledTimes(3);
    expect(attemptUpdate).toHaveBeenCalledTimes(3);
  });
});
