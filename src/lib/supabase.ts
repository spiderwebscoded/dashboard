import { createClient } from '@supabase/supabase-js';

// Hardcoded defaults to use when environment variables are missing
// Your Supabase project URL should look like: https://ukopqhxczcjjyxoxqgqs.supabase.co
// The anon key can be found in your Supabase dashboard under Project Settings > API
const fallbackUrl = 'https://ukopqhxczcjjyxoxqgqs.supabase.co'; 
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrb3BxaHhjemNqanl4b3hxZ3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODM2OTUsImV4cCI6MjA3NTE1OTY5NX0.-5Cs3_p911KmGfXwoIZwwbLu1nrPGtdhbs0wr1Y67Lo'; // This is the key you provided

// Get values from environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

// Create the Supabase client with enhanced session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage
    storage: window.localStorage,
    
    // Automatically refresh tokens before expiration
    autoRefreshToken: true,
    
    // Persist session across page reloads
    persistSession: true,
    
    // Detect session in URL (for magic links, OAuth)
    detectSessionInUrl: true,
    
    // Use PKCE flow for better security
    flowType: 'pkce',
    
    // Custom storage key to avoid conflicts
    storageKey: 'spider-dashboard-auth',
  },
});

// Log configuration status
console.log('Supabase initialization:', {
  usingEnvVars: !!import.meta.env.VITE_SUPABASE_URL,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL,
  authConfig: 'enhanced with auto-refresh and persistence',
});

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Helper: Manually refresh session if needed
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
    
    console.log('✅ Session refreshed manually');
    return session;
  } catch (err) {
    console.error('Session refresh error:', err);
    return null;
  }
};
