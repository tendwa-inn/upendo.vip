import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'upendo-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'upendo-app',
    },
  },
  db: {
    schema: 'public',
  },
});

// Add global error handling for network requests
const originalFetch = supabase.from;
supabase.from = (table: string) => {
  const query = originalFetch.call(supabase, table);
  
  // Add catch handler to suppress network abort errors
  const originalThen = query.then?.bind(query);
  if (originalThen) {
    query.then = (onfulfilled?: any, onrejected?: any) => {
      const wrappedOnrejected = (error: any) => {
        // Suppress network abort errors (user navigated away, etc.)
        if (error?.message?.includes('aborted') || 
            error?.message?.includes('network') ||
            error?.code === 'ABORT_ERR') {
          console.warn(`Supabase request to ${table} was aborted (likely user navigation)`);
          return Promise.resolve({ data: null, error: null });
        }
        
        // Let other errors propagate
        if (onrejected) {
          return onrejected(error);
        }
        throw error;
      };
      
      return originalThen(onfulfilled, wrappedOnrejected);
    };
  }
  
  return query;
};

// Auth state change handler (silent)

// Channel subscription wrapper - always propagate status to callback
const originalChannel = supabase.channel;
supabase.channel = (name: string) => {
  const channel = originalChannel.call(supabase, name);

  const originalSubscribe = channel.subscribe.bind(channel);
  channel.subscribe = (callback?: (status: string, err?: Error) => void) => {
    const wrappedCallback = (status: string, err?: Error) => {
      if (err) {
        console.error(`Realtime channel [${name}] error:`, err.message);
      }
      // Always call the callback so stores get SUBSCRIBED/CHANNEL_ERROR/TIMED_OUT status
      if (callback) callback(status, err);
    };

    return originalSubscribe(wrappedCallback);
  };

  return channel;
};

// Override the signOut method to handle network aborts gracefully
const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
supabase.auth.signOut = async (options?: { scope?: 'global' | 'local' }) => {
  try {
    // Try to sign out, but don't fail if network is aborted
    const result = await originalSignOut(options);
    return result;
  } catch (error: any) {
    // Handle network abort errors silently
    if (error?.message?.includes('aborted') || 
        error?.message?.includes('network') ||
        error?.code === 'ABORT_ERR' ||
        error?.name === 'AbortError') {
      console.warn('Auth signOut aborted (likely due to page navigation)');
      // Return success-like response to prevent errors
      return { error: null };
    }
    // Re-throw other errors
    throw error;
  }
};
