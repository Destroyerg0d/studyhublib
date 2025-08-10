import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profileData, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createProfile = async (user: User) => {
    try {
      console.log('Creating profile for user:', user.email);
      const profileData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: user.email === 'admin@studyhub.com' || user.email === 'hossenbiddoth@gmail.com' ? 'admin' : 'student',
        verified: user.email === 'admin@studyhub.com' || user.email === 'hossenbiddoth@gmail.com'
      };

      const { error } = await (supabase as any)
        .from('profiles')
        .insert(profileData);

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with a setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            let profileData = await fetchProfile(session.user.id);
            
            // If no profile exists, create one
            if (!profileData) {
              console.log('No profile found, creating new profile');
              profileData = await createProfile(session.user);
            }
            
            if (profileData) {
              console.log('Setting profile:', profileData);
              setProfile(profileData);
            } else {
              // Create a default profile if database operations fail
              const defaultProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: (session.user.email === 'admin@studyhub.com' || session.user.email === 'hossenbiddoth@gmail.com') ? 'admin' : 'student',
                verified: session.user.email === 'admin@studyhub.com' || session.user.email === 'hossenbiddoth@gmail.com'
              } as Profile;
              console.log('Setting default profile:', defaultProfile);
              setProfile(defaultProfile);
            }
            setIsLoading(false);
          }, 100);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      console.log('Login successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Login catch error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting registration for:', email);
      const redirectUrl = `https://thestudyhublib.site/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }

      console.log('Registration successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Registration catch error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting password reset for:', email);

      const redirectUrl = `${window.location.origin}/auth?reset=true`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      console.log('Password reset email sent successfully for:', email);
      return { success: true };
    } catch (error) {
      console.error('Password reset catch error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      login, 
      register, 
      resetPassword,
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
