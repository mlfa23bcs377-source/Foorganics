import api from '../lib/api';
import { AttendanceRecord, AttendanceStatus, MonthlyReportRow } from '../types';

export interface AttendanceListResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EmployeeReportResponse {
  employee: { id: string; employeeId: string; fullName: string; department: string; designation: string };
  records: { id: string; date: string; checkInTime: string; checkOutTime: string; workingHours: number; status: string; remarks: string }[];
  summary: { present: number; absent: number; halfDay: number; leave: number; totalHours: number };
  total: number;
  page: number;
  totalPages: number;
}

export async function getAttendance(params: {
  employeeId?: string; date?: string; startDate?: string; endDate?: string;
  status?: string; page?: number; limit?: number;
}): Promise<AttendanceListResponse> {
  const { data } = await api.get<AttendanceListResponse>('/attendance', { params });
  return data;
}

export async function createAttendance(payload: {
  employeeId: string; date: string; checkInTime: string; checkOutTime: string;
  status: AttendanceStatus; remarks: string;
}): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/attendance', payload);
  return data;
}

export async function updateAttendance(
  id: string,
  payload: { checkInTime: string; checkOutTime: string; status: AttendanceStatus; remarks: string }
): Promise<AttendanceRecord> {
  const { data } = await api.put<AttendanceRecord>(`/attendance/${id}`, payload);
  return data;
}

export async function deleteAttendance(id: string): Promise<void> {
  await api.delete(`/attendance/${id}`);
}

export async function getMonthlyReport(year: number, month: number): Promise<{
  year: number; month: number; report: MonthlyReportRow[];
}> {
  const { data } = await api.get('/attendance/report/monthly', { params: { year, month } });
  return data;
}

export async function getEmployeeReport(
  employeeId: string,
  params: { startDate?: string; endDate?: string; page?: number; limit?: number }
): Promise<EmployeeReportResponse> {
  const { data } = await api.get<EmployeeReportResponse>(`/attendance/report/employee/${employeeId}`, { params });
  return data;
}
