import api from '../lib/api';
import type { Expense, SalaryRecord, FinanceDashboard } from '../types';

export const getFinanceDashboard = (): Promise<FinanceDashboard> =>
  api.get('/finance/dashboard').then(r => r.data);

export const getRevenue = (params?: Record<string, string>) =>
  api.get('/finance/revenue', { params }).then(r => r.data);

export const getProfit = (params?: Record<string, string>) =>
  api.get('/finance/profit', { params }).then(r => r.data);

export const getFinanceReports = (params?: Record<string, string>) =>
  api.get('/finance/reports', { params }).then(r => r.data);

// Expenses
export const getExpenses = (params?: Record<string, any>) =>
  api.get('/expenses', { params }).then(r => r.data) as Promise<{ expenses: Expense[]; total: number; totalPages: number; page: number }>;

export const createExpense = (data: Partial<Expense>) =>
  api.post<Expense>('/expenses', data).then(r => r.data);

export const updateExpense = (id: string, data: Partial<Expense>) =>
  api.put<Expense>(`/expenses/${id}`, data).then(r => r.data);

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`).then(r => r.data);

// Salaries
export const getSalaries = (params?: Record<string, any>) =>
  api.get('/salaries', { params }).then(r => r.data) as Promise<{ salaries: SalaryRecord[]; total: number; totalPages: number; page: number }>;

export const createSalaryRecord = (data: Record<string, any>) =>
  api.post<SalaryRecord>('/salaries', data).then(r => r.data);

export const updateSalaryRecord = (id: string, data: Record<string, any>) =>
  api.put<SalaryRecord>(`/salaries/${id}`, data).then(r => r.data);

export const bulkCreateSalaries = (month: string) =>
  api.post('/salaries/bulk-create', { month }).then(r => r.data);
