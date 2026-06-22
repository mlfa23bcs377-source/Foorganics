import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AdminSession, signIn as apiSignIn, signOut as apiSignOut, getStoredSession } from '../services/authService';

interface AdminAuthContextType {
  session: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getStoredSession());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiSignIn(email, password);
    setSession(data);
  };

  const signOut = async () => {
    await apiSignOut();
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{ session, loading, login, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
