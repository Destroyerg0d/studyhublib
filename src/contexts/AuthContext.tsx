
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('Creating/updating profile for user:', user.email);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          role: user.email === 'admin@studyhub.com' || user.email === 'hossenbiddoth@gmail.com' ? 'admin' : 'student',
          verified: user.email === 'admin@studyhub.com' || user.email === 'hossenbiddoth@gmail.com'
        }, { 
          onConflict: 'id' 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating profile:', error);
        return null;
      }

      console.log('Profile created/updated:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          console.log('Found existing session for:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          const profile = await createOrUpdateProfile(session.user);
          if (profile && mounted) {
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setSession(session);
        setUser(session.user);
        
        const profile = await createOrUpdateProfile(session.user);
        if (profile && mounted) {
          setProfile(profile);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error: error.message, success: false };
      }

      console.log('Sign in successful:', email);
      return { error: null, success: true };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: 'An unexpected error occurred', success: false };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (error) {
        return { error: error.message, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      return { error: 'An unexpected error occurred', success: false };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Alias for signOut to maintain compatibility
  const logout = signOut;

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
