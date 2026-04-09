import naclUtil from 'tweetnacl-util';
import sealedBox from 'tweetnacl-sealedbox-js';

/**
 * Encrypts a secret value using the Repo's public key
 * compatible with GitHub Actions LibSodium sealed box requirement.
 */
export async function encryptSecret(value: string, publicKey: string): Promise<string> {
  const messageBytes = naclUtil.decodeUTF8(value);
  const keyBytes = naclUtil.decodeBase64(publicKey);
  
  const encryptedBytes = sealedBox.seal(messageBytes, keyBytes);
  
  return naclUtil.encodeBase64(encryptedBytes);
}
