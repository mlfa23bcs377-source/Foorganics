import React, { useEffect, useState, useCallback } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/financeService';
import type { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../types';

const rs = (n: number) => `Rs ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, string> = {
  Rent: 'bg-green-100 text-green-800', Utilities: 'bg-cyan-100 text-cyan-800',
  Internet: 'bg-violet-100 text-violet-800', Marketing: 'bg-red-100 text-red-800',
  Transportation: 'bg-amber-100 text-amber-800', Inventory: 'bg-blue-100 text-blue-800',
  'Employee Salary': 'bg-emerald-100 text-emerald-800', Maintenance: 'bg-purple-100 text-purple-800',
  'Office Supplies': 'bg-indigo-100 text-indigo-800', Other: 'bg-stone-100 text-stone-700',
};

const EMPTY_FORM = { title: '', category: 'Other' as ExpenseCategory, amount: '', description: '', expenseDate: new Date().toISOString().slice(0, 10) };

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExpenses({ search, category: category || undefined, startDate: startDate || undefined, endDate: endDate || undefined, page, limit: 15 });
      setExpenses(res.expenses);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch { }
    setLoading(false);
  }, [search, category, startDate, endDate, page]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ title: e.title, category: e.category, amount: String(e.amount), description: e.description || '', expenseDate: e.expenseDate.slice(0, 10) });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.amount || !form.category) { setFormError('Title, category and amount are required'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) await updateExpense(editing.id, payload);
      else await createExpense(payload);
      setShowModal(false);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteExpense(deleteId); setDeleteId(''); load(); } catch { }
    setDeleting(false);
  };

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Expense Management</h1>
          <p className="text-stone-500 text-sm mt-1">{total} records · {rs(totalAmount)} shown</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-organic-600 hover:bg-organic-700 text-white text-sm font-medium rounded-lg">
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input type="text" placeholder="Search by title..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400"
          />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
          />
          <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg">No expenses found</p>
            <button onClick={openAdd} className="mt-3 text-sm text-organic-600 hover:underline">Add your first expense</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-50 border-b border-stone-200">
                <tr>
                  {['Title', 'Category', 'Amount', 'Date', 'Description', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-earth-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-800">{exp.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[exp.category] || 'bg-stone-100 text-stone-600'}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{rs(exp.amount)}</td>
                    <td className="px-4 py-3 text-stone-500 text-sm">
                      {new Date(exp.expenseDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-sm max-w-[180px] truncate">{exp.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(exp)} className="text-xs text-organic-600 hover:text-organic-800 font-medium">Edit</button>
                        <button onClick={() => setDeleteId(exp.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-5">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800 text-sm"
                  placeholder="e.g. Office Rent – June"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-700 text-sm"
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Amount (Rs) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date *</label>
                <input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-400 text-stone-800 text-sm resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm hover:bg-stone-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="text-lg font-bold text-stone-800 mb-2">Delete Expense?</p>
            <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId('')} className="flex-1 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
