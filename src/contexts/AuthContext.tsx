import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple function to fetch profile
  const fetchProfile = async (userId: string) => {
    const startTime = performance.now();
    try {
      console.log('🔄 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`⏱️ Profile fetch took ${duration.toFixed(2)}ms`);
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
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ Profile fetch failed after ${duration.toFixed(2)}ms:`, error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('✅ Found existing session for user:', session.user.id);
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            console.log('ℹ️ No existing session found');
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (mounted) {
        if (session?.user) {
          console.log('✅ User logged in:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️ User logged out');
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

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