import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Product, Supplier } from '../types';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleListed,
} from '../services/productService';
import { getAllSuppliers } from '../services/supplierService';
import { deleteProductImage, uploadProductImage } from '../services/storageService';
import { Modal } from '../components';
import StatusBadge from '../components/admin/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const categories = ['Sauces', 'Sweeteners', 'Oils', 'Spices', 'Grains', 'Dairy', 'Other'];

const AdminProductsPage: React.FC = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewBlobRef = useRef<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Sauces',
    description: '',
    cost_price: '',
    selling_price: '',
    supplier_id: '',
    stock_quantity: '0',
  });

  const load = useCallback(async () => {
    try {
      const [prod, sup] = await Promise.all([getAllProducts(), getAllSuppliers()]);
      setProducts(prod);
      setSuppliers(sup);
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/products', load);

  useEffect(() => {
    return () => {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
      }
    };
  }, []);

  const resetImageState = () => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const refreshSuppliers = async () => {
    try {
      setSuppliers(await getAllSuppliers());
    } catch {
      addToast('Failed to refresh suppliers', 'error');
    }
  };

  const openCreate = async () => {
    setEditing(null);
    setForm({ name: '', category: 'Sauces', description: '', cost_price: '', selling_price: '', supplier_id: '', stock_quantity: '0' });
    resetImageState();
    await refreshSuppliers();
    setModalOpen(true);
  };

  const openEdit = async (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      cost_price: String(p.cost_price),
      selling_price: String(p.selling_price),
      supplier_id: p.supplier_id || '',
      stock_quantity: String(p.stock_quantity),
    });
    resetImageState();
    setExistingImageUrl(p.image_url || '');
    setImagePreview(p.image_url || '');
    await refreshSuppliers();
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewBlobRef.current = previewUrl;
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      const previousImageUrl = existingImageUrl;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        supplier_id: form.supplier_id || null,
        stock_quantity: parseInt(form.stock_quantity, 10) || 0,
        image_url: imageUrl,
        is_listed: editing?.is_listed ?? false,
      };

      if (editing) {
        const updated = await updateProduct(editing.id, payload);
        setProducts((prev) => [updated, ...prev.filter((p) => p.id !== updated.id)]);
        if (imageFile && previousImageUrl && previousImageUrl !== imageUrl) {
          try {
            await deleteProductImage(previousImageUrl);
          } catch {
            // Product is saved; old image cleanup is best-effort
          }
        }
        addToast('Product updated', 'success');
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        addToast('Product created', 'success');
      }

      resetImageState();
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleListed = async (p: Product) => {
    try {
      await toggleListed(p.id, !p.is_listed);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_listed: !p.is_listed } : item))
      );
      addToast(p.is_listed ? 'Product unlisted' : 'Product listed on store', 'success');
      await load();
    } catch {
      addToast('Failed to update listing', 'error');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
      addToast('Product deleted', 'success');
      setDeleteOpen(false);
      await load();
    } catch {
      addToast('Failed to delete product', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Product Listings</h1>
          <p className="text-sm text-earth-500 mt-1">Manage store products and publish to customers</p>
        </div>
        <button onClick={() => void openCreate()} className="flex items-center px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-earth-500">
            No products yet. Click &quot;Add Product&quot; to create one.
          </div>
        ) : (
          products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-40 bg-earth-100">
              <img src={p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-earth-900">{p.name}</h3>
                <StatusBadge status={p.is_listed ? 'listed' : 'unlisted'} />
              </div>
              <p className="text-sm text-earth-500 mb-1">{p.category}</p>
              <p className="text-sm text-earth-600 mb-2">Stock: {p.stock_quantity}</p>
              <p className="text-lg font-bold text-organic-700 mb-3">₨{Number(p.selling_price).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void openEdit(p)} className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"><PencilIcon className="h-4 w-4 inline" /> Edit</button>
                <button onClick={() => handleToggleListed(p)} className="flex-1 px-2 py-1 bg-organic-100 text-organic-700 rounded text-sm">
                  {p.is_listed ? 'Unlist' : 'List'}
                </button>
                <button onClick={() => { setToDelete(p); setDeleteOpen(true); }} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"><TrashIcon className="h-4 w-4 inline" /></button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            {imagePreview && <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded mb-2" />}
            <input
              ref={fileInputRef}
              key={editing?.id ?? 'new'}
              type="file"
              accept="image/*"
              onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
              onChange={handleImageSelect}
              className="text-sm"
            />
          </div>
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" placeholder="Cost price (₨)" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <input required type="number" step="0.01" placeholder="Selling price (₨)" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className="px-4 py-2 border rounded-lg" />
          </div>
          <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select supplier (optional)</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {!editing && (
            <input type="number" min="0" placeholder="Initial stock" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          )}
          <button type="submit" disabled={submitting} className="w-full btn-primary py-2 disabled:opacity-50">
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Product" size="sm">
        <p className="mb-4">Delete <strong>{toDelete?.name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="flex-1 bg-red-600 text-white rounded-lg py-2">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
