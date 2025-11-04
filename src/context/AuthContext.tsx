
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userProfile: { display_name: string; avatar_url?: string } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ display_name: string; avatar_url?: string } | null>(null);
  const { toast } = useToast();

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles
      
      if (error) {
        // Only log actual errors, not "no rows found"
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        return null;
      }
      
      // Return data or null if no profile exists
      return data;
    } catch (error) {
      // Silent fail - profile is optional
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user profile if logged in
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile if logged in
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Session recovery on tab focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          // Try to refresh if session is gone
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          
          if (refreshedSession) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
            console.log('✅ Session recovered on tab focus');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Session heartbeat - check every 5 minutes
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = session.expires_at - now;
        
        // Refresh if less than 10 minutes remaining
        if (timeUntilExpiry < 600) {
          console.log('⚠️ Session expiring soon, refreshing...');
          const { data: { session: newSession } } = await supabase.auth.refreshSession();
          
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            console.log('✅ Session refreshed proactively');
          }
        }
      }
    };

    // Check immediately on mount
    checkAndRefreshSession();
    
    // Check every 5 minutes
    const interval = setInterval(checkAndRefreshSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Error signing in:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Fetch user profile
      let profile = null;
      if (data.user) {
        profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
      }
      
      const displayName = profile?.display_name || data.user?.email?.split('@')[0] || 'there';
      
      toast({
        title: `Welcome back, ${displayName}!`,
        description: "You have successfully signed in.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: displayName,
          }
        }
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Create profile record (optional - fails gracefully if profiles table doesn't exist)
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: displayName,
            });
          
          if (profileError && profileError.code !== '42P01') { // 42P01 = table doesn't exist
            console.warn('Could not create profile (table may not exist):', profileError);
          }
        } catch (err) {
          // Silent fail - profiles are optional
          console.warn('Profile creation skipped (table may not exist)');
        }
      }
      
      toast({
        title: "Account created!",
        description: `Welcome, ${displayName}! Check your email for the confirmation link.`,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    userProfile,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
