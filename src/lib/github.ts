export class GitHubApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public url: string
  ) {
    super(`GitHub API Error ${status}: ${message} (${url})`);
    this.name = 'GitHubApiError';
  }
}

// Global rate limit listener for React components
export type RateLimitInfo = { limit: number; remaining: number; reset: number };
let rateLimitListeners: ((info: RateLimitInfo) => void)[] = [];

export const onRateLimitUpdate = (listener: (info: RateLimitInfo) => void) => {
  rateLimitListeners.push(listener);
  return () => {
    rateLimitListeners = rateLimitListeners.filter((l) => l !== listener);
  };
};

const notifyRateLimit = (headers: Headers) => {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (limit && remaining && reset) {
    const info = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10) * 1000,
    };
    rateLimitListeners.forEach((l) => l(info));
  }
};

const getAuthToken = () => {
  // In browser, get from localStorage. In Node (tests/SSR), try process.env
  if (typeof window !== 'undefined') {
    return localStorage.getItem('github_pat') || '';
  }
  return ''; // We will rely on window in this CSR app
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchGitHub<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new GitHubApiError(401, 'No GitHub PAT found', endpoint);
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://api.github.com${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  try {
    const response = await fetch(url, { ...options, headers });
    notifyRateLimit(response.headers);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('github-auth-error'));
      }
      throw new GitHubApiError(401, 'Unauthorized or expired PAT', url);
    }

    if (response.status === 403 || response.status === 429) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        const resetAt = response.headers.get('x-ratelimit-reset');
        const resetMs = resetAt ? parseInt(resetAt, 10) * 1000 - Date.now() : 60000;
        throw new GitHubApiError(403, `API Rate Limit Exceeded. Resets in ${Math.ceil(resetMs / 60000)}m`, url);
      }
      // Secondary rate limit (abuse)
      if (retries > 0) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
        await sleep(delay);
        return fetchGitHub<T>(endpoint, options, retries - 1);
      }
    }

    if (response.status >= 500 && retries > 0) {
      await sleep(1000);
      return fetchGitHub<T>(endpoint, options, retries - 1);
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new GitHubApiError(response.status, errData.message || response.statusText, url);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Handle string/buffer responses (like raw file fetching)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    
    return (await response.text()) as unknown as T;
  } catch (error) {
    if (error instanceof GitHubApiError) throw error;
    throw new GitHubApiError(0, error instanceof Error ? error.message : 'Network error', url);
  }
}

// ==========================================
// API wrappers
// ==========================================
import type { GitHubUser, GitHubRepo, GitHubContent, GitHubWorkflowRun, GitHubJob, RepoPublicKey } from '../types/github';

export type { GitHubUser, GitHubRepo, GitHubContent, GitHubWorkflowRun, GitHubJob, RepoPublicKey };

export const getUser = () => fetchGitHub<GitHubUser>('/user');

export const getRepo = (owner: string, repo: string) => 
  fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`);

export const listRepos = (page = 1, per_page = 100) => 
  fetchGitHub<GitHubRepo[]>(`/user/repos?page=${page}&per_page=${per_page}&sort=updated`);

export const searchRepos = (query: string) => 
  fetchGitHub<{ items: GitHubRepo[] }>(`/search/repositories?q=${encodeURIComponent(query)}`);

export const createRepo = (name: string, description: string, isPrivate: boolean) => 
  fetchGitHub<GitHubRepo>('/user/repos', {
    method: 'POST',
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true })
  });

// Contents API
export const getFile = async (owner: string, repo: string, path: string, branch = 'main') => {
  try {
    return await fetchGitHub<GitHubContent>(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
  }
};

export const writeFile = (owner: string, repo: string, path: string, message: string, contentStr: string, branch = 'main', sha?: string) => {
  // Convert content to base64
  const content = btoa(encodeURIComponent(contentStr).replace(/%([0-9A-F]{2})/g, (_unused, p1) => String.fromCharCode(parseInt(p1, 16))));
  return fetchGitHub<any>(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, branch, sha })
  });
};

export const deleteFile = (owner: string, repo: string, path: string, message: string, sha: string, branch = 'main') => {
  return fetchGitHub<any>(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch })
  });
};

// Workflows API
export const dispatchWorkflow = (owner: string, repo: string, workflowId: string, ref: string, inputs: Record<string, string>) => {
  return fetchGitHub<void>(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref, inputs })
  });
};

export const listWorkflowRuns = (owner: string, repo: string, workflowId: string) => {
  return fetchGitHub<{ workflow_runs: GitHubWorkflowRun[] }>(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=10`);
};

export const getWorkflowRun = (owner: string, repo: string, runId: number) => {
  return fetchGitHub<GitHubWorkflowRun>(`/repos/${owner}/${repo}/actions/runs/${runId}`);
};

export const cancelWorkflowRun = (owner: string, repo: string, runId: number) => {
  return fetchGitHub<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, { method: 'POST' });
};

// Jobs API
export const listJobsForRun = (owner: string, repo: string, runId: number) => {
  return fetchGitHub<{ jobs: GitHubJob[] }>(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
};

export const getJobLogs = async (owner: string, repo: string, jobId: number) => {
  // Returns raw text
  return fetchGitHub<string>(`/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`);
};

// Secrets API
export const getRepoPublicKey = (owner: string, repo: string) => {
  return fetchGitHub<RepoPublicKey>(`/repos/${owner}/${repo}/actions/secrets/public-key`);
};

export const createOrUpdateSecret = (owner: string, repo: string, secretName: string, encryptedValue: string, keyId: string) => {
  return fetchGitHub<void>(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, {
    method: 'PUT',
    body: JSON.stringify({
      encrypted_value: encryptedValue,
      key_id: keyId
    })
  });
};

