import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Supplier } from '../types';
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/supplierService';
import { Modal } from '../components';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const sortSuppliers = (items: Supplier[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

const AdminSuppliersPage: React.FC = () => {
  const { addToast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '' });

  const load = useCallback(async () => {
    try {
      setSuppliers(sortSuppliers(await getAllSuppliers()));
    } catch {
      addToast('Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/suppliers', load);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', contact_person: '', phone: '', email: '' });
    setModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, contact_person: s.contact_person, phone: s.phone, email: s.email || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editing) {
        const updated = await updateSupplier(editing.id, form);
        setSuppliers((prev) => sortSuppliers(prev.map((s) => (s.id === updated.id ? updated : s))));
        addToast('Supplier updated', 'success');
      } else {
        const created = await createSupplier(form);
        setSuppliers((prev) => sortSuppliers([...prev, created]));
        addToast('Supplier created', 'success');
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to save supplier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSupplier(toDelete.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== toDelete.id));
      addToast('Supplier deleted', 'success');
      setDeleteModalOpen(false);
      await load();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to delete supplier', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-earth-900">Suppliers</h1>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-earth-200">
          <thead className="bg-earth-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-earth-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-earth-500">
                  No suppliers yet. Click &quot;Add Supplier&quot; to create one.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm">{s.contact_person}</td>
                  <td className="px-6 py-4 text-sm">{s.phone}</td>
                  <td className="px-6 py-4 text-sm">{s.email || '—'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-5 w-5 inline" /></button>
                    <button onClick={() => { setToDelete(s); setDeleteModalOpen(true); }} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input required placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <button type="submit" disabled={submitting} className="w-full btn-primary py-2 disabled:opacity-50">
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Supplier" size="sm">
        <p className="mb-4">Delete <strong>{toDelete?.name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="flex-1 bg-red-600 text-white rounded-lg py-2">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSuppliersPage;
