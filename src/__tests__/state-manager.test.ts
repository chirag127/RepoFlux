import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as state from '../lib/state-manager';
import * as github from '../lib/github';

// Mock github API calls
vi.mock('../lib/github', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    getUser: vi.fn(),
    getRepo: vi.fn(),
    createRepo: vi.fn(),
    getFile: vi.fn(),
    writeFile: vi.fn()
  };
});

describe('State Manager', () => {
  const mockUser = { login: 'tester' };
  const repoName = 'tester-repoflux-state';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.getUser).mockResolvedValue(mockUser as any);
  });

  it('initStateRepo creates repository if it does not exist', async () => {
    vi.mocked(github.getFile).mockRejectedValue({ status: 404, message: 'Not Found' });
    vi.mocked(github.createRepo).mockResolvedValue({} as any);

    await state.initStateRepo();

    expect(github.getFile).toHaveBeenCalledWith('tester', repoName, 'README.md');
    expect(github.createRepo).toHaveBeenCalledWith(repoName, expect.any(String), true);
  });

  it('initStateRepo skips creation if it exists', async () => {
    vi.mocked(github.getFile).mockResolvedValue({} as any);

    await state.initStateRepo();

    expect(github.getFile).toHaveBeenCalledWith('tester', repoName, 'README.md');
    expect(github.createRepo).not.toHaveBeenCalled();
  });

  it('readStateFile correctly decodes base64 content', async () => {
    const mockContent = btoa(JSON.stringify({ key: 'val' }));
    vi.mocked(github.getFile).mockResolvedValue({
      content: mockContent,
      sha: 'abc'
    } as any);

    const result = await state.readStateFile('test.json');

    expect(result.content).toEqual({ key: 'val' });
    expect(result.sha).toBe('abc');
  });

  it('readStateFile handles missing files', async () => {
    vi.mocked(github.getFile).mockRejectedValue({ status: 404, message: 'Not found' });

    const result = await state.readStateFile('missing.json');

    expect(result.content).toBeNull();
    expect(result.sha).toBeUndefined();
  });
});
