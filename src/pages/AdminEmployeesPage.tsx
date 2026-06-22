import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon,
  EyeIcon, UserGroupIcon, CurrencyDollarIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Employee, EmployeeStats, DEPARTMENTS } from '../types';
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getEmployeeStats, uploadProfileImage,
} from '../services/employeeService';
import { Modal } from '../components';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract'] as const;
const GENDERS = ['Male', 'Female', 'Other'] as const;

const emptyForm = {
  fullName: '', email: '', phone: '', gender: 'Male' as const,
  dateOfBirth: '', designation: '', department: 'HR' as const,
  joiningDate: new Date().toISOString().split('T')[0],
  address: '', salary: '', employmentType: 'Full-Time' as const, status: 'Active' as const,
  profileImage: '',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cls = status === 'Active'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const cls = type === 'Full-Time' ? 'bg-blue-100 text-blue-700'
    : type === 'Part-Time' ? 'bg-yellow-100 text-yellow-700'
    : 'bg-purple-100 text-purple-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{type}</span>;
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-earth-500">{label}</p>
      <p className="text-2xl font-bold text-earth-900">{value}</p>
    </div>
  </div>
);

const AdminEmployeesPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async (p = page) => {
    try {
      const [list, st] = await Promise.all([
        getEmployees({ search, department: filterDept, status: filterStatus, page: p, limit: 10 }),
        getEmployeeStats(),
      ]);
      setEmployees(list.employees);
      setTotal(list.total);
      setTotalPages(list.totalPages);
      setStats(st);
    } catch {
      addToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterDept, filterStatus, page, addToast]);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/employees', load);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setModalOpen(true); };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setImagePreview(emp.profileImage || '');
    setImageFile(null);
    setForm({
      fullName: emp.fullName, email: emp.email, phone: emp.phone,
      gender: emp.gender as any, dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : '',
      designation: emp.designation, department: emp.department as any,
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
      address: emp.address || '', salary: String(emp.salary),
      employmentType: emp.employmentType as any, status: emp.status as any,
      profileImage: emp.profileImage || '',
    });
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      let profileImage = form.profileImage;
      if (imageFile) profileImage = await uploadProfileImage(imageFile);

      const payload = {
        fullName: form.fullName, email: form.email, phone: form.phone,
        gender: form.gender, dateOfBirth: form.dateOfBirth || null,
        designation: form.designation, department: form.department,
        joiningDate: form.joiningDate, address: form.address,
        salary: parseFloat(form.salary) || 0,
        employmentType: form.employmentType, status: form.status, profileImage,
      };

      if (editing) {
        await updateEmployee(editing.id, payload);
        addToast('Employee updated', 'success');
      } else {
        await createEmployee(payload);
        addToast('Employee added', 'success');
      }

      setModalOpen(false);
      resetForm();
      await load(1);
      setPage(1);
    } catch (err: any) {
      addToast(err?.response?.data?.message || err.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEmployee(toDelete.id);
      addToast('Employee deleted', 'success');
      setDeleteOpen(false);
      await load(1);
      setPage(1);
    } catch {
      addToast('Failed to delete employee', 'error');
    }
  };

  const setF = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Employee Management</h1>
          <p className="text-sm text-earth-500 mt-1">Manage your team — {total} employee{total !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Employee
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Employees" value={stats.totalEmployees} icon={UserGroupIcon} color="bg-blue-500" />
          <StatCard label="Active Employees" value={stats.activeEmployees} icon={CheckCircleIcon} color="bg-green-500" />
          <StatCard label="Present Today" value={stats.presentToday} icon={CheckCircleIcon} color="bg-organic-500" />
          <StatCard label="Monthly Salary" value={`₨${Number(stats.totalSalaryExpense).toLocaleString()}`} icon={CurrencyDollarIcon} color="bg-purple-500" />
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full pl-9 pr-4 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none"
            />
          </div>
          <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-organic-600 text-white rounded-lg text-sm hover:bg-organic-700">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-earth-50 border-b border-earth-200">
              <tr>
                {['ID', 'Employee', 'Department', 'Designation', 'Type', 'Salary', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-earth-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {employees.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-earth-400">No employees found</td></tr>
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-earth-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-organic-700 font-medium">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-organic-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {emp.profileImage
                          ? <img src={emp.profileImage} alt="" className="h-full w-full object-cover" />
                          : <span className="text-organic-700 font-semibold text-xs">{emp.fullName.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="font-medium text-earth-900">{emp.fullName}</p>
                        <p className="text-earth-400 text-xs">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-earth-600">{emp.department}</td>
                  <td className="px-4 py-3 text-earth-600">{emp.designation}</td>
                  <td className="px-4 py-3"><TypeBadge type={emp.employmentType} /></td>
                  <td className="px-4 py-3 text-earth-900 font-medium">₨{Number(emp.salary).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/labadmin/employees/${emp.id}`)}
                        className="p-1.5 bg-earth-100 text-earth-600 rounded hover:bg-earth-200" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(emp)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setToDelete(emp); setDeleteOpen(true); }}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-earth-200">
            <p className="text-sm text-earth-500">Page {page} of {totalPages} ({total} records)</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}
                className="px-3 py-1 border border-earth-200 rounded text-sm disabled:opacity-40 hover:bg-earth-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); load(page + 1); }}
                className="px-3 py-1 border border-earth-200 rounded text-sm disabled:opacity-40 hover:bg-earth-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Profile image */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Profile Image (optional)</label>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-organic-100 flex items-center justify-center overflow-hidden">
                {imagePreview
                  ? <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  : <span className="text-organic-600 font-bold text-lg">{form.fullName.charAt(0).toUpperCase() || '?'}</span>}
              </div>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-earth-600 mb-1">Full Name *</label>
              <input required value={form.fullName} onChange={setF('fullName')} placeholder="John Doe"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={setF('email')} placeholder="john@company.com"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Phone *</label>
              <input required value={form.phone} onChange={setF('phone')} placeholder="+92-300-1234567"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Gender *</label>
              <select value={form.gender} onChange={setF('gender')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={setF('dateOfBirth')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Department *</label>
              <select value={form.department} onChange={setF('department')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Designation *</label>
              <input required value={form.designation} onChange={setF('designation')} placeholder="Software Engineer"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Joining Date</label>
              <input type="date" value={form.joiningDate} onChange={setF('joiningDate')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Salary (₨) *</label>
              <input required type="number" min="0" value={form.salary} onChange={setF('salary')} placeholder="50000"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Employment Type *</label>
              <select value={form.employmentType} onChange={setF('employmentType')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-600 mb-1">Status</label>
              <select value={form.status} onChange={setF('status')}
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-earth-600 mb-1">Address</label>
              <textarea value={form.address} onChange={setF('address')} rows={2} placeholder="123 Main St, City"
                className="w-full px-3 py-2 border border-earth-200 rounded-lg text-sm focus:ring-2 focus:ring-organic-400 outline-none resize-none" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-organic-600 text-white rounded-lg hover:bg-organic-700 disabled:opacity-50 font-medium transition-colors">
            {submitting ? 'Saving...' : editing ? 'Update Employee' : 'Add Employee'}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Employee" size="sm">
        <p className="text-earth-600 mb-4">Are you sure you want to delete <strong>{toDelete?.fullName}</strong>? This will also remove all their attendance records.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="flex-1 py-2 border border-earth-200 rounded-lg text-sm hover:bg-earth-50">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEmployeesPage;
