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
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; success?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchOrCreateProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
      } else {
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use a timeout to prevent potential deadlocks
        setTimeout(() => {
          fetchOrCreateProfile(session.user.id, session.user.email!, session.user.user_metadata?.name);
        }, 100);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (userId: string, email: string, name?: string) => {
    try {
      console.log('Fetching/creating profile for user:', userId, email);
      
      // First try to fetch existing profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it using the service role
        console.log('Creating new profile for:', email);
        
        // Use upsert instead of insert to handle race conditions
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: email,
            name: name || email.split('@')[0],
            role: email === 'admin@studyhub.com' || email === 'hossenbiddoth@gmail.com' ? 'admin' : 'student',
            verified: email === 'admin@studyhub.com' || email === 'hossenbiddoth@gmail.com'
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // If profile creation fails, try to fetch again in case it was created by another process
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (existingProfile) {
            profile = existingProfile;
          } else {
            setLoading(false);
            return;
          }
        } else {
          profile = newProfile;
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      console.log('Profile loaded:', profile);
      setProfile(profile);
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
        window.location.href = '/';
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
    isLoading: loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    register: signUp,
    login: signIn,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
