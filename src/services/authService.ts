import api from '../lib/api';

const TOKEN_KEY = 'foorganics_token';
const EMAIL_KEY = 'foorganics_email';

export interface AdminSession {
  token: string;
  email: string;
}

export async function signIn(email: string, password: string): Promise<AdminSession> {
  const { data } = await api.post<AdminSession>('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EMAIL_KEY, data.email);
  return data;
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function getStoredSession(): AdminSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  if (!token || !email) return null;
  return { token, email };
}
