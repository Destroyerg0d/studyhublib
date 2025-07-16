
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
  isLoading: boolean; // Alias for loading
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; success?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  // Aliases for backward compatibility
  register: (email: string, password: string, name: string) => Promise<{ error: any; success?: boolean }>;
  login: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer profile fetching to prevent deadlocks
        setTimeout(() => {
          fetchOrCreateProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreateProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (userId: string, email: string, name?: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('No profile found, creating one for user:', userId);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: email,
              name: name || email.split('@')[0],
              role: email === 'admin@studyhub.com' || email === 'hossenbiddoth@gmail.com' ? 'admin' : 'student',
              verified: email === 'admin@studyhub.com' || email === 'hossenbiddoth@gmail.com'
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('Profile created:', newProfile);
            setProfile(newProfile);
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else if (data) {
        console.log('Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user.id, user.email!, user.user_metadata?.name);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
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
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      return { error: 'An unexpected error occurred', success: false };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }

      return { error: error?.message || null };
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  // Listen for real-time profile updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated via realtime:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value = {
    user,
    profile,
    session,
    loading,
    isLoading: loading, // Alias
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    // Aliases for backward compatibility
    register: signUp,
    login: signIn,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
