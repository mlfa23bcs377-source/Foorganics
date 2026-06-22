import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CalendarIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { AttendanceRecord, AttendanceStatus, Employee, MonthlyReportRow } from '../types';
import { getAttendance, createAttendance, updateAttendance, deleteAttendance, getMonthlyReport, getEmployeeReport } from '../services/attendanceService';
import { getEmployees } from '../services/employeeService';
import { Modal } from '../components';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

type TabKey = 'daily' | 'monthly' | 'employee';

const ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Half Day', 'Leave'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Present: 'bg-green-100 text-green-700',
    Absent: 'bg-red-100 text-red-700',
    'Half Day': 'bg-yellow-100 text-yellow-700',
    Leave: 'bg-blue-100 text-blue-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-earth-100 text-earth-600'}`}>{status}</span>;
};

const emptyForm = {
  employeeId: '', date: new Date().toISOString().split('T')[0],
  checkInTime: '09:00', checkOutTime: '17:00',
  status: 'Present' as AttendanceStatus, remarks: '',
};

const AdminAttendancePage: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>('daily');

  // ── Common state ────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ── Daily tab ──────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [dailyPage, setDailyPage] = useState(1);
  const [dailyTotalPages, setDailyTotalPages] = useState(1);
  const [dailyTotal, setDailyTotal] = useState(0);

  // ── Monthly tab ────────────────────────────────────────────────────────────
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportRow[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // ── Employee report tab ────────────────────────────────────────────────────
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empReportStart, setEmpReportStart] = useState('');
  const [empReportEnd, setEmpReportEnd] = useState('');
  const [empRecords, setEmpRecords] = useState<any[]>([]);
  const [empSummary, setEmpSummary] = useState<any>(null);
  const [selectedEmpInfo, setSelectedEmpInfo] = useState<any>(null);
  const [loadingEmpReport, setLoadingEmpReport] = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [toDelete, setToDelete] = useState<AttendanceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Handle navigation from Employee Detail page
  useEffect(() => {
    if (location.state?.employeeId) {
      setActiveTab('employee');
      setSelectedEmpId(location.state.employeeId);
    }
  }, [location.state]);

  // Load employees dropdown
  useEffect(() => {
    getEmployees({ limit: 200 })
      .then((r) => setEmployees(r.employees))
      .catch(() => addToast('Failed to load employees', 'error'));
  }, [addToast]);

  // ── Daily attendance load ────────────────────────────────────────────────
  const loadDaily = useCallback(async (p = dailyPage) => {
    setLoadingDaily(true);
    try {
      const res = await getAttendance({
        date: dailyDate,
        status: statusFilter,
        employeeId: empFilter,
        page: p,
        limit: 15,
      });
      setRecords(res.records);
      setDailyTotalPages(res.totalPages);
      setDailyTotal(res.total);
    } catch {
      addToast('Failed to load attendance', 'error');
    } finally {
      setLoadingDaily(false);
    }
  }, [dailyDate, statusFilter, empFilter, dailyPage, addToast]);

  useEffect(() => { if (activeTab === 'daily') loadDaily(); }, [activeTab, loadDaily]);
  useRefreshOnNavigate('/labadmin/attendance', loadDaily);

  // ── Monthly report load ─────────────────────────────────────────────────
  const loadMonthly = useCallback(async () => {
    setLoadingMonthly(true);
    try {
      const res = await getMonthlyReport(monthlyYear, monthlyMonth);
      setMonthlyReport(res.report);
    } catch {
      addToast('Failed to load monthly report', 'error');
    } finally {
      setLoadingMonthly(false);
    }
  }, [monthlyYear, monthlyMonth, addToast]);

  useEffect(() => { if (activeTab === 'monthly') loadMonthly(); }, [activeTab, loadMonthly]);

  // ── Employee report load ─────────────────────────────────────────────────
  const loadEmpReport = useCallback(async () => {
    if (!selectedEmpId) return;
    setLoadingEmpReport(true);
    try {
      const res = await getEmployeeReport(selectedEmpId, { startDate: empReportStart, endDate: empReportEnd, limit: 50 });
      setEmpRecords(res.records);
      setEmpSummary(res.summary);
      setSelectedEmpInfo(res.employee);
    } catch {
      addToast('Failed to load employee report', 'error');
    } finally {
      setLoadingEmpReport(false);
    }
  }, [selectedEmpId, empReportStart, empReportEnd, addToast]);

  useEffect(() => { if (activeTab === 'employee' && selectedEmpId) loadEmpReport(); }, [activeTab, selectedEmpId, loadEmpReport]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: dailyDate });
    setModalOpen(true);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setEditing(rec);
    setForm({
      employeeId: rec.employeeId,
      date: typeof rec.date === 'string' ? rec.date.slice(0, 10) : new Date(rec.date).toISOString().slice(0, 10),
      checkInTime: rec.checkInTime || '',
      checkOutTime: rec.checkOutTime || '',
      status: rec.status,
      remarks: rec.remarks || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        date: form.date,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        status: form.status,
        remarks: form.remarks,
      };
      if (editing) {
        await updateAttendance(editing.id, payload);
        addToast('Attendance updated', 'success');
      } else {
        await createAttendance(payload);
        addToast('Attendance marked', 'success');
      }
      setModalOpen(false);
      await loadDaily(1);
      setDailyPage(1);
    } catch (err: any) {
      addToast(err?.response?.data?.message || err.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAttendance(toDelete.id);
      addToast('Record deleted', 'success');
      setDeleteOpen(false);
      await loadDaily();
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const setF = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const tabs = [
    { key: 'daily' as TabKey, label: 'Daily Attendance', icon: CalendarIcon },
    { key: 'monthly' as TabKey, label: 'Monthly Report', icon: ChartBarIcon },
    { key: 'employee' as TabKey, label: 'Employee Report', icon: UserGroupIcon },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Attendance Management</h1>
          <p className="text-sm text-earth-500 mt-1">Track and manage employee attendance</p>
        </div>
        {activeTab === 'daily' && (
          <button onClick={openCreate} className="flex items-center px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" /> Mark Attendance
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-earth-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key ? 'bg-white text-organic-700 shadow-sm' : 'text-earth-600 hover:text-earth-900'
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── DAILY TAB ────────────────────────────────────────────────────────── */}
      {activeTab === 'daily' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-earth-400" />
                <input type="date" value={dailyDate} onChange={(e) => { setDailyDate(e.target.value); setDailyPage(1); }}
                  className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
              </div>
              <select value={empFilter} onChange={(e) => { setEmpFilter(e.target.value); setDailyPage(1); }}
                className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                <option value="">All Employees</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setDailyPage(1); }}
                className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                <option value="">All Status</option>
                {ATTENDANCE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => loadDaily(1)} className="px-4 py-2 bg-earth-100 text-earth-700 rounded-lg text-sm hover:bg-earth-200">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" /> Filter
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loadingDaily ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-600" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-earth-50 border-b border-earth-200">
                      <tr>
                        {['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Remarks', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium text-earth-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-100">
                      {records.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-earth-400">No attendance records found for this date.</td></tr>
                      ) : records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-earth-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-earth-900">{rec.employee?.fullName || '—'}</p>
                            <p className="text-xs text-earth-400">{rec.employee?.department}</p>
                          </td>
                          <td className="px-4 py-3 text-earth-600">
                            {new Date(rec.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-earth-600">{rec.checkInTime || '—'}</td>
                          <td className="px-4 py-3 text-earth-600">{rec.checkOutTime || '—'}</td>
                          <td className="px-4 py-3 text-earth-600">{rec.workingHours ? `${rec.workingHours}h` : '—'}</td>
                          <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                          <td className="px-4 py-3 text-earth-400 text-xs max-w-32 truncate">{rec.remarks || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(rec)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => { setToDelete(rec); setDeleteOpen(true); }} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {dailyTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-earth-200">
                    <p className="text-sm text-earth-500">{dailyTotal} records</p>
                    <div className="flex gap-2">
                      <button disabled={dailyPage <= 1} onClick={() => { setDailyPage(dailyPage - 1); loadDaily(dailyPage - 1); }}
                        className="px-3 py-1 border border-earth-200 rounded text-sm disabled:opacity-40 hover:bg-earth-50">Prev</button>
                      <button disabled={dailyPage >= dailyTotalPages} onClick={() => { setDailyPage(dailyPage + 1); loadDaily(dailyPage + 1); }}
                        className="px-3 py-1 border border-earth-200 rounded text-sm disabled:opacity-40 hover:bg-earth-50">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MONTHLY TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'monthly' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
            <select value={monthlyMonth} onChange={(e) => setMonthlyMonth(Number(e.target.value))}
              className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={monthlyYear} onChange={(e) => setMonthlyYear(Number(e.target.value))}
              className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
              {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={loadMonthly} className="px-4 py-2 bg-organic-600 text-white rounded-lg text-sm hover:bg-organic-700">
              Load Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loadingMonthly ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-600" /></div>
            ) : monthlyReport.length === 0 ? (
              <div className="text-center py-12 text-earth-400">No active employees or no records found for this month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-earth-50 border-b border-earth-200">
                    <tr>
                      {['Employee', 'Department', 'Present', 'Absent', 'Half Day', 'Leave', 'Hours', 'Attendance %'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-earth-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                    {monthlyReport.map((row) => (
                      <tr key={row.employee.id} className="hover:bg-earth-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-earth-900">{row.employee.fullName}</p>
                          <p className="text-xs text-earth-400 font-mono">{row.employee.employeeId}</p>
                        </td>
                        <td className="px-4 py-3 text-earth-600">{row.employee.department}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{row.present}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{row.absent}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">{row.halfDay}</td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">{row.leave}</td>
                        <td className="px-4 py-3 text-earth-600">{row.totalHours}h</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-earth-100 rounded-full h-1.5 min-w-16">
                              <div className={`h-1.5 rounded-full ${row.attendancePct >= 75 ? 'bg-green-500' : row.attendancePct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${row.attendancePct}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${row.attendancePct >= 75 ? 'text-green-600' : row.attendancePct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {row.attendancePct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EMPLOYEE REPORT TAB ──────────────────────────────────────────────── */}
      {activeTab === 'employee' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
            <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
              <option value="">Select Employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeId})</option>)}
            </select>
            <input type="date" value={empReportStart} onChange={(e) => setEmpReportStart(e.target.value)}
              className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            <span className="text-earth-400 text-sm">to</span>
            <input type="date" value={empReportEnd} onChange={(e) => setEmpReportEnd(e.target.value)}
              className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            <button onClick={loadEmpReport} disabled={!selectedEmpId} className="px-4 py-2 bg-organic-600 text-white rounded-lg text-sm hover:bg-organic-700 disabled:opacity-50">
              Load Report
            </button>
          </div>

          {selectedEmpInfo && empSummary && (
            <div className="mb-4 bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-earth-800 mb-3">
                {selectedEmpInfo.fullName} — {selectedEmpInfo.designation}, {selectedEmpInfo.department}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Present', value: empSummary.present, color: 'text-green-600' },
                  { label: 'Absent', value: empSummary.absent, color: 'text-red-600' },
                  { label: 'Half Day', value: empSummary.halfDay, color: 'text-yellow-600' },
                  { label: 'Leave', value: empSummary.leave, color: 'text-blue-600' },
                  { label: 'Total Hours', value: `${(empSummary.totalHours || 0).toFixed(1)}h`, color: 'text-organic-600' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 bg-earth-50 rounded-lg">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-earth-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loadingEmpReport ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-600" /></div>
            ) : !selectedEmpId ? (
              <div className="text-center py-12 text-earth-400">Select an employee to view their attendance report.</div>
            ) : empRecords.length === 0 ? (
              <div className="text-center py-12 text-earth-400">No attendance records found for this employee.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-earth-50 border-b border-earth-200">
                    <tr>
                      {['Date', 'Check In', 'Check Out', 'Working Hours', 'Status', 'Remarks'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-earth-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                    {empRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-earth-50">
                        <td className="px-4 py-3 text-earth-700 font-medium">
                          {new Date(rec.date).toLocaleDateString('en-PK', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-earth-600">{rec.checkInTime || '—'}</td>
                        <td className="px-4 py-3 text-earth-600">{rec.checkOutTime || '—'}</td>
                        <td className="px-4 py-3 text-earth-600">{rec.workingHours ? `${rec.workingHours}h` : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                        <td className="px-4 py-3 text-earth-400 text-xs">{rec.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Attendance' : 'Mark Attendance'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Employee *</label>
              <select required value={form.employeeId} onChange={setF('employeeId')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeId})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-earth-600 mb-1">Date *</label>
            <input required type="date" value={form.date} onChange={setF('date')}
              className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-earth-600 mb-1">Status *</label>
            <div className="grid grid-cols-2 gap-2">
              {ATTENDANCE_STATUSES.map((s) => (
                <label key={s} className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-sm transition-colors ${
                  form.status === s ? 'border-organic-500 bg-organic-50' : 'border-earth-200 hover:bg-earth-50'
                }`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={setF('status')} className="accent-organic-600" />
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>
          </div>
          {(form.status === 'Present' || form.status === 'Half Day') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-earth-600 mb-1">Check In</label>
                <input type="time" value={form.checkInTime} onChange={setF('checkInTime')}
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-600 mb-1">Check Out</label>
                <input type="time" value={form.checkOutTime} onChange={setF('checkOutTime')}
                  className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-earth-600 mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={setF('remarks')} rows={2} placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-organic-600 text-white rounded-lg hover:bg-organic-700 disabled:opacity-50 font-medium">
            {submitting ? 'Saving...' : editing ? 'Update' : 'Mark Attendance'}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Record" size="sm">
        <p className="text-earth-600 mb-4">Delete this attendance record for <strong>{toDelete?.employee?.fullName}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="flex-1 py-2 border border-earth-200 rounded-lg text-sm hover:bg-earth-50">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAttendancePage;
