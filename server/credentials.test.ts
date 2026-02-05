import { describe, it, expect } from 'vitest';

describe('Credentials Validation', () => {
  it('should validate Supabase credentials', async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(anonKey).toBeDefined();
    expect(supabaseUrl).toContain('supabase.co');
    expect(anonKey).toContain('sb_publishable_');
  });

  it('should validate Meta credentials', async () => {
    const pixelId = process.env.FACEBOOK_PIXEL_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    expect(pixelId).toBeDefined();
    expect(accessToken).toBeDefined();
    expect(pixelId).toMatch(/^\d+$/);
    expect(accessToken).toContain('EAA');
  });

  it('should validate Hotmart webhook secret', () => {
    const hotmartSecret = process.env.HOTMART_WEBHOOK_SECRET;

    expect(hotmartSecret).toBeDefined();
    expect(hotmartSecret?.length).toBeGreaterThan(0);
  });

  it('should validate Supabase Service Role Key', () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(serviceRoleKey).toBeDefined();
    expect(serviceRoleKey).toContain('sb_secret_');
  });

  it('should validate Meta Conversions API endpoint format', async () => {
    const pixelId = process.env.FACEBOOK_PIXEL_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    expect(pixelId).toBeDefined();
    expect(accessToken).toBeDefined();

    // Verify endpoint format
    const endpoint = `https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${accessToken}`;
    expect(endpoint).toContain('graph.facebook.com');
    expect(endpoint).toContain('/events');
  });
});
