import React, { useEffect, useState, useCallback } from 'react';
import { getSalaries, createSalaryRecord, updateSalaryRecord, bulkCreateSalaries } from '../services/financeService';
import type { SalaryRecord } from '../types';
import { getEmployees } from '../services/employeeService';
import type { Employee } from '../types';

const rs = (n: number) => `Rs ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-800',
  Partial: 'bg-amber-100 text-amber-800',
  Pending: 'bg-red-100 text-red-800',
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(m: string) {
  const [year, mon] = m.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[parseInt(mon) - 1]} ${year}`;
}

export default function AdminSalariesPage() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState(currentMonth());
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ employeeId: '', month: currentMonth(), salaryAmount: '', paidAmount: '0', notes: '' });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const [payModal, setPayModal] = useState<SalaryRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);

  const [bulkMonth, setBulkMonth] = useState(currentMonth());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalaries({ month: monthFilter || undefined, status: statusFilter || undefined, page, limit: 15 });
      setRecords(res.salaries);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch { }
    setLoading(false);
  }, [monthFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getEmployees({ limit: 200, status: 'Active' }).then(data => setEmployees(data.employees || [])).catch(() => {});
  }, []);

  const totalPayable = records.reduce((s, r) => s + r.salaryAmount, 0);
  const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending = records.reduce((s, r) => s + r.remainingAmount, 0);

  const openAdd = () => { setAddForm({ employeeId: '', month: currentMonth(), salaryAmount: '', paidAmount: '0', notes: '' }); setAddError(''); setShowAddModal(true); };

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    setAddForm(f => ({ ...f, employeeId: empId, salaryAmount: emp ? String(emp.salary) : '' }));
  };

  const handleAdd = async () => {
    if (!addForm.employeeId || !addForm.month || !addForm.salaryAmount) { setAddError('Employee, month, and salary amount are required'); return; }
    setSaving(true); setAddError('');
    try {
      await createSalaryRecord({ ...addForm, salaryAmount: parseFloat(addForm.salaryAmount), paidAmount: parseFloat(addForm.paidAmount || '0') });
      setShowAddModal(false); load();
    } catch (err: any) { setAddError(err?.response?.data?.message || 'Failed to create record'); }
    setSaving(false);
  };

  const openPay = (rec: SalaryRecord) => {
    setPayModal(rec);
    setPayAmount(String(rec.remainingAmount));
    setPayError('');
  };

  const handlePay = async () => {
    if (!payModal) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) { setPayError('Enter a valid amount'); return; }
    if (amount > payModal.remainingAmount) { setPayError(`Cannot pay more than remaining Rs ${payModal.remainingAmount}`); return; }
    setPaying(true); setPayError('');
    try {
      await updateSalaryRecord(payModal.id, { paidAmount: payModal.paidAmount + amount });
      setPayModal(null); load();
    } catch (err: any) { setPayError(err?.response?.data?.message || 'Update failed'); }
    setPaying(false);
  };

  const handleBulk = async () => {
    if (!bulkMonth) return;
    setBulkLoading(true); setBulkMsg('');
    try {
      const res = await bulkCreateSalaries(bulkMonth);
      setBulkMsg(res.message);
      if (monthFilter === bulkMonth) load();
    } catch (err: any) { setBulkMsg(err?.response?.data?.message || 'Failed'); }
    setBulkLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Salary Management</h1>
          <p className="text-stone-500 text-sm mt-1">{total} records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openAdd} className="px-4 py-2 bg-organic-600 hover:bg-organic-700 text-white text-sm font-medium rounded-lg">
            + Add Record
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Payable', value: rs(totalPayable), color: 'text-stone-800' },
          { label: 'Total Paid', value: rs(totalPaid), color: 'text-green-700' },
          { label: 'Total Pending', value: rs(totalPending), color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-xs text-stone-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 mt-1">filtered by month</p>
          </div>
        ))}
      </div>

      {/* Bulk Generate */}
      <div className="bg-earth-50 border border-earth-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-sm font-medium text-stone-700">Bulk Generate Salaries</p>
          <p className="text-xs text-stone-400 mt-0.5">Create salary records for all active employees for a month</p>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <input type="month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
          />
          <button onClick={handleBulk} disabled={bulkLoading} className="px-4 py-2 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
            {bulkLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {bulkMsg && <p className="text-sm text-stone-600 w-full">{bulkMsg}</p>}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
        </select>
        <button onClick={() => { setMonthFilter(''); setStatusFilter(''); setPage(1); }}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
        >Clear</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p>No salary records found</p>
            <button onClick={openAdd} className="mt-2 text-sm text-organic-600 hover:underline">Add a record</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-50 border-b border-stone-200">
                <tr>
                  {['Employee', 'Month', 'Salary', 'Paid', 'Remaining', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-earth-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{rec.employee?.fullName || 'N/A'}</p>
                      <p className="text-xs text-stone-400">{rec.employee?.employeeId} · {rec.employee?.department}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-sm">{formatMonth(rec.month)}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{rs(rec.salaryAmount)}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{rs(rec.paidAmount)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{rs(rec.remainingAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[rec.paymentStatus]}`}>
                        {rec.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rec.paymentStatus !== 'Paid' && (
                        <button onClick={() => openPay(rec)} className="text-xs text-organic-600 hover:text-organic-800 font-medium">Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-organic-600 text-white' : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-50'}`}
            >{p}</button>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-5">Add Salary Record</h2>
            {addError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{addError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Employee *</label>
                <select value={addForm.employeeId} onChange={e => handleEmployeeChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
                >
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Month *</label>
                  <input type="month" value={addForm.month} onChange={e => setAddForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Salary Amount *</label>
                  <input type="number" min="0" value={addForm.salaryAmount} onChange={e => setAddForm(f => ({ ...f, salaryAmount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Amount Already Paid</label>
                <input type="number" min="0" value={addForm.paidAmount} onChange={e => setAddForm(f => ({ ...f, paidAmount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <input type="text" value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                {saving ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-1">Record Payment</h2>
            <p className="text-stone-500 text-sm mb-5">{payModal.employee?.fullName} · {formatMonth(payModal.month)}</p>
            <div className="bg-earth-50 rounded-lg p-3 mb-4 grid grid-cols-3 text-center text-sm">
              <div><p className="text-stone-400 text-xs">Total</p><p className="font-bold text-stone-800">{rs(payModal.salaryAmount)}</p></div>
              <div><p className="text-stone-400 text-xs">Paid</p><p className="font-bold text-green-700">{rs(payModal.paidAmount)}</p></div>
              <div><p className="text-stone-400 text-xs">Remaining</p><p className="font-bold text-red-600">{rs(payModal.remainingAmount)}</p></div>
            </div>
            {payError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">{payError}</div>}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Payment Amount (Rs)</label>
              <input type="number" min="1" max={payModal.remainingAmount} value={payAmount} onChange={e => setPayAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
              <button onClick={handlePay} disabled={paying} className="flex-1 py-2.5 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                {paying ? 'Saving...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
