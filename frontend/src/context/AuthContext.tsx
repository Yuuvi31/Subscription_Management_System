import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isDemoMode } from '../services/supabase';
import { DEMO_USERS } from '../services/mockData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDemo = isDemoMode;

  useEffect(() => {
    if (isDemo) {
      // In demo mode, default to Admin
      setUser(DEMO_USERS.ADMIN);
      setRole('ADMIN');
      setIsLoading(false);
      return;
    }

    // Supabase Auth session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Query user profile from Supabase users/profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback default role
        const fallback: UserProfile = {
          id: userId,
          email,
          name: email.split('@')[0],
          role: 'CUSTOMER',
        };
        setUser(fallback);
        setRole('CUSTOMER');
      } else {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          name: data.name || email.split('@')[0],
          role: (data.role as UserRole) || 'CUSTOMER',
          customerId: data.customer_id,
        };
        setUser(profile);
        setRole(profile.role);
      }
    } catch {
      setUser({
        id: userId,
        email,
        name: email.split('@')[0],
        role: 'CUSTOMER',
      });
      setRole('CUSTOMER');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    if (isDemo) {
      // Find matching mock user or fallback
      let matchedRole: UserRole = 'ADMIN';
      if (email.includes('staff')) matchedRole = 'STAFF';
      else if (email.includes('cust') || email.includes('apex')) matchedRole = 'CUSTOMER';

      const demoUser = DEMO_USERS[matchedRole];
      setUser({ ...demoUser, email });
      setRole(matchedRole);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    if (isDemo) {
      const newUser: UserProfile = {
        id: `demo-${Date.now()}`,
        email,
        name,
        role: 'CUSTOMER', // Default registration is always CUSTOMER
      };
      setUser(newUser);
      setRole('CUSTOMER');
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'CUSTOMER', // Strict client signup role
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          name,
          role: 'CUSTOMER',
        });
        setRole('CUSTOMER');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email: string) => {
    if (isDemo) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    if (!isDemo) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const setDemoRole = (newRole: UserRole) => {
    if (isDemo) {
      setRole(newRole);
      setUser(DEMO_USERS[newRole]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isDemo,
        login,
        register,
        logout,
        forgotPassword,
        setDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
