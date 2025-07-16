
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
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      // Always update session and user immediately
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching/creating profile...');
        // Don't defer this - we need the profile for redirect
        await fetchOrCreateProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing profile');
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        // For other events with existing session, fetch profile
        await fetchOrCreateProfile(session.user);
      } else {
        // No session, clear everything
        setProfile(null);
        setLoading(false);
      }
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log('Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchOrCreateProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      console.log('Fetching profile for user:', user.id, user.email);
      
      // First, try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors if no profile exists

      if (!data && !error) {
        // No profile found, create one
        console.log('No profile found, creating one for:', user.email);
        await createMissingProfile(user);
        return;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        // Still try to create profile if fetch failed
        console.log('Fetch failed, attempting to create profile...');
        await createMissingProfile(user);
        return;
      }

      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error);
      setLoading(false);
    }
  };

  const createMissingProfile = async (user: User) => {
    try {
      console.log('Creating missing profile for user:', user.email);
      
      const profileData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0],
        role: ['admin@studyhub.com', 'hossenbiddoth@gmail.com'].includes(user.email!) ? 'admin' : 'student',
        verified: ['admin@studyhub.com', 'hossenbiddoth@gmail.com'].includes(user.email!) ? true : false
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profile created successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user);
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
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message, success: false };
      }

      // Don't set loading to false here - let the auth state change handle it
      return { error: null, success: true };
    } catch (error) {
      setLoading(false);
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
