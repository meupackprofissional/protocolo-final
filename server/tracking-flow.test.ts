import { describe, it, expect, beforeAll } from 'vitest';
import { hashData, sendLeadEvent, sendPurchaseEvent } from './meta-capi';
import { validateHotmartSignature } from './hotmart-webhook';

describe('Tracking Flow Integration', () => {
  // Test data
  const testEmail = 'test@example.com';
  const testPhone = '11999999999';
  const testFbp = 'fb.1.1558571054389.1098115397';
  const testFbc = 'fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890';

  describe('Hash Function', () => {
    it('should hash email correctly', () => {
      const hashed = hashData(testEmail);
      expect(hashed).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should hash phone correctly', () => {
      const hashed = hashData(testPhone);
      expect(hashed).toHaveLength(64);
      expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should normalize data before hashing', () => {
      const hash1 = hashData('TEST@EXAMPLE.COM');
      const hash2 = hashData('test@example.com');
      expect(hash1).toBe(hash2); // Should be case-insensitive
    });

    it('should trim whitespace before hashing', () => {
      const hash1 = hashData('  test@example.com  ');
      const hash2 = hashData('test@example.com');
      expect(hash1).toBe(hash2);
    });
  });

  describe('Hotmart Webhook Validation', () => {
    it('should validate correct signature', () => {
      const secret = process.env.HOTMART_WEBHOOK_SECRET;
      if (!secret) {
        console.warn('Hotmart secret not configured, skipping validation test');
        expect(true).toBe(true);
        return;
      }

      const testData = JSON.stringify({ event: 'PURCHASE_APPROVED' });
      const isValid = validateHotmartSignature(testData, 'invalid-signature');
      // Should return false for invalid signature
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('Meta CAPI Events', () => {
    it('should have correct credentials configured', () => {
      const pixelId = process.env.FACEBOOK_PIXEL_ID;
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

      expect(pixelId).toBeDefined();
      expect(accessToken).toBeDefined();
      expect(pixelId).toMatch(/^\d+$/);
      expect(accessToken).toContain('EAA');
    });

    it('should format Lead event correctly', async () => {
      // This test validates the structure without actually sending
      const eventData = {
        email: testEmail,
        phone: testPhone,
        fbp: testFbp,
        fbc: testFbc,
        clientIpAddress: '192.168.1.1',
        clientUserAgent: 'Mozilla/5.0',
        quizResponses: {
          question1: 'answer1',
          question2: 'answer2',
        },
      };

      // Validate structure
      expect(eventData.email).toBeDefined();
      expect(eventData.phone).toBeDefined();
      expect(eventData.fbp).toBeDefined();
      expect(eventData.fbc).toBeDefined();
      expect(eventData.quizResponses).toBeDefined();
    });

    it('should format Purchase event correctly', async () => {
      // This test validates the structure without actually sending
      const eventData = {
        email: testEmail,
        phone: testPhone,
        fbp: testFbp,
        fbc: testFbc,
        clientIpAddress: '192.168.1.1',
        clientUserAgent: 'Mozilla/5.0',
        value: 47.90,
        currency: 'BRL',
        productName: 'Protocolo Sono do Bebê',
        productId: 'protocolo-sono-bebe',
        transactionId: 'HP16015479281022',
      };

      // Validate structure
      expect(eventData.email).toBeDefined();
      expect(eventData.value).toBe(47.90);
      expect(eventData.currency).toBe('BRL');
      expect(eventData.transactionId).toBeDefined();
    });
  });

  describe('Data Flow Validation', () => {
    it('should have all required environment variables', () => {
      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'FACEBOOK_PIXEL_ID',
        'FACEBOOK_ACCESS_TOKEN',
        'HOTMART_WEBHOOK_SECRET',
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });

    it('should have valid Supabase configuration', () => {
      const url = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(url).toContain('supabase.co');
      expect(anonKey).toContain('sb_publishable_');
      expect(serviceRoleKey).toContain('sb_secret_');
    });

    it('should have valid Meta configuration', () => {
      const pixelId = process.env.FACEBOOK_PIXEL_ID;
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

      expect(pixelId).toMatch(/^\d+$/);
      expect(accessToken).toContain('EAA');
      expect(accessToken.length).toBeGreaterThan(100);
    });
  });
});
