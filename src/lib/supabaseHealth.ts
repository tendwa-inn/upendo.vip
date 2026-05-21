import { supabase } from './supabaseClient';

export interface SupabaseHealth {
  healthy: boolean;
  error?: any;
  responseTime?: number;
}

/**
 * Check if Supabase connection is healthy by performing a simple query
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const startTime = Date.now();

  try {
    // Test with a simple, lightweight query
    const { data, error } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const responseTime = Date.now() - startTime;

    if (error) {
      return { healthy: false, error, responseTime };
    }

    return { healthy: true, responseTime };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { healthy: false, error, responseTime };
  }
}

/**
 * Wait for Supabase to become healthy with retry logic
 */
export async function waitForSupabase(maxRetries = 10, delay = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const health = await checkSupabaseHealth();

    if (health.healthy) {
      return true;
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('Supabase connection failed after all retries');
  return false;
}

/**
 * Test specific table access
 */
export async function testTableAccess(tableName: string): Promise<SupabaseHealth> {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .maybeSingle();

    const responseTime = Date.now() - startTime;

    if (error) {
      return { healthy: false, error, responseTime };
    }

    return { healthy: true, responseTime };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { healthy: false, error, responseTime };
  }
}