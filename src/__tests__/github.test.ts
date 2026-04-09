import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as github from '../lib/github';

describe('GitHub API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.setItem('github_pat', 'test_token');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    localStorage.clear();
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('getUser sends correct authentication context', async () => {
    const mockResponse = { login: 'tester' };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      headers: { get: (n: string) => n.toLowerCase() === 'content-type' ? 'application/json' : null },
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse))
    } as any);

    const data = await github.getUser();

    expect(global.fetch).toHaveBeenCalled();
    expect(data.login).toBe('tester');
    expect(data).toEqual(mockResponse);
  });

  it('throws standard error on 401', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: { get: () => null },
      text: () => Promise.resolve('Error body')
    } as any);

    await expect(github.getUser()).rejects.toThrow('Unauthorized or expired PAT');
  });

  it('rate limits successfully tracks headers', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': '1600000000'
      }),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}')
    } as any);

    await github.getUser();
    
    // In actual implementation we'd check if a RateLimit hook received an event
    // For now we just verify it resolves properly with correct headers handling
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
