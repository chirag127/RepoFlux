import { getRepoPublicKey, createOrUpdateSecret, getRepo } from '../lib/github';
import { encryptSecret } from '../lib/secret-encryptor';
import { installAgentWorkflow as installLibWorkflow, checkWorkflowStatus } from '../lib/workflow-installer';

export function useDeployer() {
  const installAgentWorkflow = async (owner: string, repo: string, defaultBranch?: string) => {
    // 1. Resolve branch without extra API calls if possible
    let branch = defaultBranch;
    if (!branch) {
      const repoInfo = await getRepo(owner, repo);
      branch = repoInfo.default_branch || 'main';
    }

    const { installed, sha } = await checkWorkflowStatus(owner, repo, branch);
    if (!installed || true) { // Always update to ensure latest triggers
      await installLibWorkflow(owner, repo, branch, sha);
      return true;
    }
  };

  const deploySecrets = async (owner: string, repo: string, secretsMap: Record<string, string>) => {
    if (Object.keys(secretsMap).length === 0) return;

    // Get the repo's public key for encryption
    const pubKey = await getRepoPublicKey(owner, repo);

    // Deploy secrets in sequence (or parallel, but sequence is safer for rate limits initially)
    for (const [secretName, secretValue] of Object.entries(secretsMap)) {
      if (!secretValue) continue;
      
      const encrypted = await encryptSecret(secretValue, pubKey.key);
      await createOrUpdateSecret(owner, repo, secretName, encrypted, pubKey.key_id);
    }
  };

  return {
    installAgentWorkflow,
    deploySecrets
  };
}
