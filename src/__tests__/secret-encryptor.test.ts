import { describe, it, expect } from 'vitest';
import { encryptSecret } from '../lib/secret-encryptor';

describe('secret encryptor', () => {
  it('encrypts a value against a public key', async () => {
    // We mock a realistic ed25519 public key as base64
    const mockPublicKey = '0123456789012345678901234567890123456789123=';
    const secretValue = 'super_secret_value123';
    
    // We cannot easily decrypt sealedbox without the private key, 
    // so we verify that it runs without throwing and returns a base64 string
    const result = await encryptSecret(secretValue, mockPublicKey);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(secretValue.length); // Overhead of sealed box
    
    // Check if it's base64 encoded
    expect(() => atob(result)).not.toThrow();
  });
});
