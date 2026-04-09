import { GitHubApiError } from './github';

export async function withOptimisticLock<T>(
  readFn: () => Promise<{ content: T | null; sha?: string }>,
  writeFn: (content: T, sha?: string) => Promise<any>,
  updateFn: (currentContent: T | null) => T,
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { content, sha } = await readFn();
      const newContent = updateFn(content);
      await writeFn(newContent, sha);
      return newContent;
    } catch (err: any) {
      if (err instanceof GitHubApiError && err.status === 409) {
        // Conflict - someone else updated the file
        retries++;
        // Calculate random backoff jitter
        const backoff = Math.floor(Math.random() * 500) + 200 * retries;
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
  
  throw new Error(`Failed to update state after ${maxRetries} optimistic lock retries`);
}
