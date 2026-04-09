import { getRepoPublicKey, createOrUpdateSecret } from '../lib/github';
import { encryptSecret } from '../lib/secret-encryptor';
import { installAgentWorkflow as installLibWorkflow, checkWorkflowStatus } from '../lib/workflow-installer';

export function useDeployer() {
  const installAgentWorkflow = async (owner: string, repo: string, branch = 'main') => {
    const { installed, sha } = await checkWorkflowStatus(owner, repo, branch);
    if (!installed) {
      await installLibWorkflow(owner, repo, branch, sha);
      return true;
    }
    return false; // Already installed
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
