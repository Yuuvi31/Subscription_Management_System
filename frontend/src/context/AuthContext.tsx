import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../services/mockData';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in localStorage
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
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setIsLoading(true);
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Admin verification: admin / 233135
    if ((cleanId === 'admin' || cleanId === 'admin@brightloop.io') && cleanPass === '233135') {
      const adminProfile: UserProfile = {
        id: 'usr-admin-01',
        name: 'System Admin',
        email: 'admin@brightloop.io',
        role: 'ADMIN',
      };
      setUser(adminProfile);
      setRole('ADMIN');
      localStorage.setItem('loopbill_user', JSON.stringify(adminProfile));
      setIsLoading(false);
      return { success: true, role: 'ADMIN' };
    }

    // 2. Staff verification: x182 / 1234
    if ((cleanId === 'x182' || cleanId === 'x182@brightloop.io') && cleanPass === '1234') {
      const staffProfile: UserProfile = {
        id: 'usr-staff-01',
        name: 'Staff Member (x182)',
        email: 'x182@brightloop.io',
        role: 'STAFF',
      };
      setUser(staffProfile);
      setRole('STAFF');
      localStorage.setItem('loopbill_user', JSON.stringify(staffProfile));
      setIsLoading(false);
      return { success: true, role: 'STAFF' };
    }

    // 3. Customer verification: Yuvraj Dutt / Yuvraj@2007
    if (
      (cleanId === 'yuvraj dutt' || cleanId === 'yuvraj' || cleanId === 'yuvraj.dutt@enterprise.in') &&
      cleanPass === 'Yuvraj@2007'
    ) {
      const custProfile: UserProfile = {
        id: 'usr-cust-01',
        name: 'Yuvraj Dutt',
        email: 'yuvraj.dutt@enterprise.in',
        role: 'CUSTOMER',
        customerId: 'cust-01',
      };
      setUser(custProfile);
      setRole('CUSTOMER');
      localStorage.setItem('loopbill_user', JSON.stringify(custProfile));
      setIsLoading(false);
      return { success: true, role: 'CUSTOMER' };
    }

    // If invalid
    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Please enter the assigned username/email and password.',
    };
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: 'CUSTOMER',
      customerId: `cust-${Date.now()}`,
    };
    setUser(newUser);
    setRole('CUSTOMER');
    localStorage.setItem('loopbill_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const forgotPassword = async (_email: string) => {
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('loopbill_user');
    setUser(null);
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
