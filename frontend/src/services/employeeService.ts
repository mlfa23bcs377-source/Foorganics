import api from '../lib/api';
import { Employee, EmployeeStats } from '../types';

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EmployeeDetailResponse extends Employee {
  stats: { totalDays: number; presentDays: number };
  recentAttendance: {
    id: string; date: string; checkInTime: string; checkOutTime: string;
    workingHours: number; status: string; remarks: string;
  }[];
}

export async function getEmployees(params: {
  search?: string; department?: string; status?: string; page?: number; limit?: number;
}): Promise<EmployeeListResponse> {
  const { data } = await api.get<EmployeeListResponse>('/employees', { params });
  return data;
}

export async function getEmployeeById(id: string): Promise<EmployeeDetailResponse> {
  const { data } = await api.get<EmployeeDetailResponse>(`/employees/${id}`);
  return data;
}

export async function createEmployee(
  employee: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>
): Promise<Employee> {
  const { data } = await api.post<Employee>('/employees', employee);
  return data;
}

export async function updateEmployee(
  id: string,
  updates: Partial<Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>>
): Promise<Employee> {
  const { data } = await api.put<Employee>(`/employees/${id}`, updates);
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function getEmployeeStats(): Promise<EmployeeStats> {
  const { data } = await api.get<EmployeeStats>('/employees/stats');
  return data;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<{ url: string }>('/employees/upload-profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
