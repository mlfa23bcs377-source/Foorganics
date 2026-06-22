import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CustomerSession,
  getStoredCustomerSession,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  updateStoredCustomer,
} from '../services/customerAuthService';
import { Customer } from '../types';

interface CustomerAuthContextType {
  session: CustomerSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomer: (customer: Customer) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredCustomerSession();
    setSession(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginCustomer(email, password);
    setSession(result);
  };

  const register = async (data: Parameters<typeof registerCustomer>[0]) => {
    const result = await registerCustomer(data);
    setSession(result);
  };

  const logout = async () => {
    await logoutCustomer();
    setSession(null);
  };

  const updateCustomer = (customer: Customer) => {
    if (!session) return;
    updateStoredCustomer(customer);
    setSession({ ...session, customer });
  };

  return (
    <CustomerAuthContext.Provider value={{ session, loading, login, register, logout, updateCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextType {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be inside CustomerAuthProvider');
  return ctx;
}
