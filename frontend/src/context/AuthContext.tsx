import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (email: string, password: string, name: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ──────────────────────────────────────────────────────────────────
// Hardcoded local accounts (admin, staff, customer)
// These are always available regardless of Supabase configuration.
// ──────────────────────────────────────────────────────────────────
const HARDCODED_ACCOUNTS = [
  {
    identifiers: ['admin', 'admin@brightloop.io'],
    password: '233135',
    profile: {
      id: 'usr-admin-01',
      name: 'System Admin',
      email: 'admin@brightloop.io',
      role: 'ADMIN' as UserRole,
    },
  },
  {
    identifiers: ['x182', 'x182@brightloop.io'],
    password: '1234',
    profile: {
      id: 'usr-staff-01',
      name: 'Staff Member (x182)',
      email: 'x182@brightloop.io',
      role: 'STAFF' as UserRole,
    },
  },
  {
    identifiers: ['yuvraj dutt', 'yuvraj', 'yuvraj.dutt@enterprise.in'],
    password: 'Yuvraj@2007',
    profile: {
      id: 'usr-cust-01',
      name: 'Yuvraj Dutt',
      email: 'yuvraj.dutt@enterprise.in',
      role: 'CUSTOMER' as UserRole,
      customerId: 'cust-01',
    },
  },
];

// Dynamic staff accounts added through the Staff management page
const DYNAMIC_STAFF_KEY = 'loopbill_staff_accounts';

interface DynamicStaffAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
}

function getDynamicStaffAccounts(): DynamicStaffAccount[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_STAFF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function matchHardcoded(identifier: string, password: string): UserProfile | null {
  const cleanId = identifier.trim().toLowerCase();
  for (const account of HARDCODED_ACCOUNTS) {
    if (account.identifiers.includes(cleanId) && password.trim() === account.password) {
      return account.profile;
    }
  }
  return null;
}

function matchDynamicStaff(identifier: string, password: string): UserProfile | null {
  const accounts = getDynamicStaffAccounts();
  const cleanId = identifier.trim().toLowerCase();
  const match = accounts.find(
    (a) =>
      (a.username.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId) &&
      a.password === password.trim()
  );
  if (!match) return null;
  return {
    id: match.id,
    name: match.name,
    email: match.email,
    role: 'STAFF',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyUser = (profile: UserProfile) => {
    setUser(profile);
    setRole(profile.role);
    localStorage.setItem('loopbill_user', JSON.stringify(profile));
  };

  const clearUser = () => {
    setUser(null);
    setRole('ADMIN');
    localStorage.removeItem('loopbill_user');
  };

  // ── Initialise session ───────────────────────────────────────────
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Subscribe to Supabase auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const meta = session.user.user_metadata as {
              name?: string;
              role?: UserRole;
              customerId?: string;
            };
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email ?? '',
              name: meta.name ?? session.user.email ?? 'User',
              role: meta.role ?? 'CUSTOMER',
              customerId: meta.customerId,
            };
            applyUser(profile);
          } else {
            // No Supabase session — try localStorage fallback
            const saved = localStorage.getItem('loopbill_user');
            if (saved) {
              try {
                const parsed = JSON.parse(saved) as UserProfile;
                setUser(parsed);
                setRole(parsed.role);
              } catch {
                clearUser();
              }
            } else {
              setUser(null);
            }
          }
          setIsLoading(false);
        }
      );
      return () => subscription.unsubscribe();
    } else {
      // No Supabase — localStorage only
      const saved = localStorage.getItem('loopbill_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserProfile;
          setUser(parsed);
          setRole(parsed.role);
        } catch {
          localStorage.removeItem('loopbill_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setIsLoading(true);

    // 1. Always try hardcoded accounts first (they bypass Supabase)
    const hardcodedProfile = matchHardcoded(identifier, password);
    if (hardcodedProfile) {
      applyUser(hardcodedProfile);
      setIsLoading(false);
      return { success: true, role: hardcodedProfile.role };
    }

    // 2. Try dynamically-added staff accounts (localStorage)
    const dynamicProfile = matchDynamicStaff(identifier, password);
    if (dynamicProfile) {
      applyUser(dynamicProfile);
      setIsLoading(false);
      return { success: true, role: 'STAFF' };
    }

    // 3. If Supabase is configured, try real auth
    if (isSupabaseConfigured && supabase) {
      // Determine if identifier looks like an email
      const isEmail = identifier.includes('@');
      const emailToUse = isEmail ? identifier.trim() : `${identifier.trim()}@brightloop.io`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password.trim(),
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: 'Invalid credentials. Please verify your username and password.' };
      }

      if (data.user) {
        const meta = data.user.user_metadata as {
          name?: string;
          role?: UserRole;
          customerId?: string;
        };
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? '',
          name: meta.name ?? data.user.email ?? 'User',
          role: meta.role ?? 'CUSTOMER',
          customerId: meta.customerId,
        };
        applyUser(profile);
        setIsLoading(false);
        return { success: true, role: profile.role };
      }
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Please verify your username and password.',
    };
  };

  // ── Register ─────────────────────────────────────────────────────
  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { name, role: 'CUSTOMER' },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email ?? email,
          name,
          role: 'CUSTOMER',
          customerId: `cust-${data.user.id}`,
        };
        applyUser(profile);
        setIsLoading(false);
        return { success: true };
      }
    }

    // Fallback: local registration
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      name,
      role: 'CUSTOMER',
      customerId: `cust-${Date.now()}`,
    };
    applyUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  // ── Forgot Password ──────────────────────────────────────────────
  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true }; // Silently succeed in fallback mode
  };

  // ── Logout ───────────────────────────────────────────────────────
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    clearUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
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
