import { describe, it, expect } from 'vitest';
import { hashData } from './meta-capi';

describe('Meta CAPI Tracking', () => {
  it('should hash email correctly', () => {
    const email = 'test@example.com';
    const hashed = hashData(email);
    
    // SHA-256 hash should be 64 hex characters
    expect(hashed).toBeDefined();
    expect(hashed).toHaveLength(64);
  });

  it('should handle empty data gracefully', () => {
    const hashed = hashData('');
    expect(hashed).toBe('');
  });

  it('should normalize data before hashing', () => {
    const hash1 = hashData('TEST@EXAMPLE.COM');
    const hash2 = hashData('test@example.com');
    const hash3 = hashData('  test@example.com  ');
    
    // All should produce the same hash after normalization
    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it('should produce consistent hashes', () => {
    const email = 'user@example.com';
    const hash1 = hashData(email);
    const hash2 = hashData(email);
    
    // Same input should produce same hash
    expect(hash1).toBe(hash2);
  });
});
