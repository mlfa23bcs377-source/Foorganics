import api from '../lib/api';
import { Customer } from '../types';

const TOKEN_KEY = 'foorganics_customer_token';
const INFO_KEY = 'foorganics_customer_info';

export interface CustomerSession {
  token: string;
  customer: Customer;
}

export async function registerCustomer(data: {
  fullName: string; email: string; phone?: string; password: string; confirmPassword?: string;
}): Promise<CustomerSession> {
  const { data: res } = await api.post<CustomerSession>('/customer/auth/register', data);
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(INFO_KEY, JSON.stringify(res.customer));
  return res;
}

export async function loginCustomer(email: string, password: string): Promise<CustomerSession> {
  const { data: res } = await api.post<CustomerSession>('/customer/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(INFO_KEY, JSON.stringify(res.customer));
  return res;
}

export async function logoutCustomer(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(INFO_KEY);
}

export function getStoredCustomerSession(): CustomerSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(INFO_KEY);
  if (!token || !raw) return null;
  try {
    return { token, customer: JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function updateStoredCustomer(customer: Customer): void {
  localStorage.setItem(INFO_KEY, JSON.stringify(customer));
}

export function getCustomerAuthHeader(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? `Bearer ${token}` : null;
}

export async function forgotPassword(email: string): Promise<{ message: string; resetUrl?: string; dev_note?: string }> {
  const { data } = await api.post('/customer/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, password: string, confirmPassword: string): Promise<CustomerSession> {
  const { data: res } = await api.post<CustomerSession>('/customer/auth/reset-password', { token, password, confirmPassword });
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(INFO_KEY, JSON.stringify(res.customer));
  return res;
}
