import { useState, useEffect } from 'react';
import { getUser, type GitHubUser } from '../lib/github';

export function useAuth() {
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth errors thrown by our fetch wrapper
    const handleAuthError = () => {
      logout();
      setError('GitHub Token is invalid or expired.');
    };
    window.addEventListener('github-auth-error', handleAuthError);
    return () => window.removeEventListener('github-auth-error', handleAuthError);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('github_pat');
    if (stored) {
      setToken(stored);
      verifyAndSetUser(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAndSetUser = async (pat: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // We temporarily set it in localStorage so the fetchGitHub wrapper uses it
      localStorage.setItem('github_pat', pat);
      const userData = await getUser();
      setUser(userData);
      setToken(pat);
    } catch (err: any) {
      localStorage.removeItem('github_pat');
      setToken('');
      setUser(null);
      setError(err.message || 'Failed to authenticate with GitHub.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (pat: string) => {
    await verifyAndSetUser(pat);
  };

  const logout = () => {
    localStorage.removeItem('github_pat');
    setToken('');
    setUser(null);
  };

  return { token, user, isLoading, error, login, logout };
}
