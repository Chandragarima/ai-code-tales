import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  allow_contact: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple function to fetch profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('🔄 Profile query result:', { data, error, hasData: !!data });

      if (error) {
        console.error('❌ Profile fetch error:', error);
        setProfile(null);
        return;
      }

      if (data) {
        console.log('✅ Profile fetched successfully:', data);
        setProfile(data);
      } else {
        console.log('⚠️ No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error(`❌ Profile fetch failed:`, error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!mounted) return;
      
      // Update session and user synchronously
      setSession(session);
      setUser(session?.user ?? null);
      
      // Defer profile fetching to avoid blocking auth state updates
      if (session?.user) {
        console.log('✅ User logged in:', session.user.id);
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        console.log('ℹ️ User logged out');
        setProfile(null);
      }
      
      setLoading(false);
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('✅ Found existing session for user:', session.user.id);
            setTimeout(() => {
              if (mounted) {
                fetchProfile(session.user.id);
              }
            }, 0);
          } else {
            console.log('ℹ️ No existing session found');
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('🔄 Attempting sign up...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Remove emailRedirectTo to avoid redirect issues
      });

      console.log('🔄 Sign up result:', { data, error, hasUser: !!data?.user });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🔄 Signing out...');
    try {
      // Clear state immediately
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.log('ℹ️ Sign out completed (with potential timeout)');
      // State is already cleared, so we're good
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile...');
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
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