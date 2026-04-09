import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import * as github from '../lib/github';

// Mock the github module
vi.mock('../lib/github', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    getUser: vi.fn(),
  };
});

describe('useAuth hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with null user if no token in localStorage', async () => {
    // Need to avoid the initialization useEffect for a clean slate
    const { result } = renderHook(() => useAuth());
    
    // The useEffect synchronously resolves this to false when no token is present
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in successfully and sets token', async () => {
    const mockUser = { login: 'octocat', name: 'Monalisa Octocat' };
    vi.mocked(github.getUser).mockResolvedValue(mockUser as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('ghp_test_token_123');
    });

    expect(localStorage.getItem('github_pat')).toBe('ghp_test_token_123');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles login failure and clears token', async () => {
    vi.mocked(github.getUser).mockRejectedValue(new Error('Bad credentials'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('ghp_invalid');
    });

    expect(localStorage.getItem('github_pat')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Bad credentials');
  });
  
  it('logs out and clears state', async () => {
    localStorage.setItem('github_pat', 'ghp_exist');
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      result.current.logout();
    });
    
    expect(localStorage.getItem('github_pat')).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
