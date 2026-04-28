import { supabase } from './supabaseClient';

export async function checkSupabaseHealth() {
  try {
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase health check failed:', error);
      return { healthy: false, error: error.message };
    }
    
    console.log('Supabase health check passed');
    return { healthy: true };
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return { healthy: false, error: error.message };
  }
}

export async function waitForSupabase(maxRetries = 10, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const health = await checkSupabaseHealth();
      if (health.healthy) {
        console.log('Supabase is ready!');
        return true;
      }
    } catch (error) {
      console.log(`Supabase health check failed: ${error}`);
    }
    
    console.log(`Waiting for Supabase... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.error('Supabase failed to become ready after', maxRetries, 'attempts');
  return false;
}