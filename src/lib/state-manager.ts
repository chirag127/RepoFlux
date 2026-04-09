import { getFile, writeFile, deleteFile, getUser, createRepo } from './github';
import type { GitHubContent } from '../types/github';


export const initStateRepo = async () => {
  const user = await getUser();
  const repoName = `${user.login}-repoflux-state`;
  
  try {
    // Check if it exists by trying to get the README
    await getFile(user.login, repoName, 'README.md');
    return true; // Exists
  } catch (err: any) {
    if (err.status === 404) {
      // Create it
      await createRepo(
        repoName,
        'RepoFlux State Repository - Do not modify manually',
        true // private
      );
      
      // Initialize with config
      await writeFile(
        user.login,
        repoName,
        'config.json',
        'Initial RepoFlux config',
        JSON.stringify({ version: 1, updatedAt: Date.now() }, null, 2)
      );
      
      return true;
    }
    throw err;
  }
};

export const readStateFile = async <T>(path: string): Promise<{ content: T | null; sha?: string }> => {
  const user = await getUser();
  const repoName = `${user.login}-repoflux-state`;
  
  let file: GitHubContent | null = null;
  try {
    file = await getFile(user.login, repoName, path) as GitHubContent;
  } catch (err: any) {
    if (err.status === 404) return { content: null };
    throw err;
  }
  
  if (!file) return { content: null };
  
  const decodedStr = decodeURIComponent(atob(file.content).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  try {
    return { content: JSON.parse(decodedStr) as T, sha: file.sha };
  } catch {
    return { content: decodedStr as unknown as T, sha: file.sha };
  }
};

export const writeStateFile = async <T>(path: string, content: T, sha?: string, message = 'Update state') => {
  const user = await getUser();
  const repoName = `${user.login}-repoflux-state`;
  
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  return writeFile(user.login, repoName, path, message, contentStr, 'main', sha);
};

export const deleteStateFile = async (path: string, sha: string, message = 'Delete state') => {
  const user = await getUser();
  const repoName = `${user.login}-repoflux-state`;
  
  return deleteFile(user.login, repoName, path, message, sha);
};

export const listStateDirectory = async (path: string): Promise<GitHubContent[]> => {
  const user = await getUser();
  const repoName = `${user.login}-repoflux-state`;
  
  const res = await getFile(user.login, repoName, path);
  if (Array.isArray(res)) return res;
  return [];
};
