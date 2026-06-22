import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { getAllProducts } from '../services/productService';
import StatusBadge from '../components/admin/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const AdminInventoryPage: React.FC = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setProducts(await getAllProducts());
    } catch {
      addToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/inventory', load);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Inventory</h1>
          <p className="text-sm text-earth-500 mt-1">Current stock levels across all products</p>
        </div>
        <Link to="/labadmin/purchases" className="px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700 text-sm">
          Restock via Purchase Order
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-earth-200">
          <thead className="bg-earth-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Cost Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Listed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-earth-500">
                  No products in inventory yet. Add products from Product Listings.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={p.stock_quantity < 5 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm">{p.supplier?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={p.stock_quantity < 5 ? 'text-red-600 font-semibold' : ''}>
                      {p.stock_quantity}
                      {p.stock_quantity < 5 && ' (Low)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">₨{Number(p.cost_price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.is_listed ? 'listed' : 'unlisted'} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
