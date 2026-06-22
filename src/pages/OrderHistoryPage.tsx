import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getMyOrders } from '../services/customerService';
import { CustomerOrder } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned', refunded: 'Refunded',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-stone-100 text-stone-700',
  refunded: 'bg-stone-100 text-stone-700',
};

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OrderHistoryPage() {
  const { session, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await getMyOrders({ search, status, page, limit: 10 });
      setOrders(res.orders);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch { }
    finally { setLoading(false); }
  }, [session, search, status, page]);

  useEffect(() => { if (!session) { navigate('/login', { state: { returnTo: '/account/orders' } }); return; } }, [session, navigate]);
  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-organic-800">Foorganic</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/account" className="text-stone-600 hover:text-stone-800">Dashboard</Link>
            <Link to="/account/orders" className="text-organic-700 font-semibold border-b-2 border-organic-500 pb-0.5">My Orders</Link>
            <Link to="/track" className="text-stone-600 hover:text-stone-800">Track Order</Link>
            <Link to="/account/profile" className="text-stone-600 hover:text-stone-800">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 hidden sm:block">{session?.customer.fullName}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">My Orders</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text" placeholder="Search by order # or tracking #"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800 text-sm"
          />
          <select
            value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-700 text-sm"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s ? (STATUS_LABELS[s] || s) : 'All Statuses'}</option>)}
          </select>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 py-16 text-center text-stone-400">
            <p className="text-lg">No orders found</p>
            <Link to="/" className="mt-3 inline-block text-sm text-organic-600 hover:underline">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/account/orders/${order.id}`}
                className="block bg-white rounded-xl border border-stone-200 hover:border-organic-300 hover:shadow-sm transition-all p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-stone-800">{order.orderNumber || `#${order.id.slice(-8)}`}</p>
                    {order.trackingNumber && <p className="text-xs text-stone-400 mt-0.5">TRK: {order.trackingNumber}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-stone-100 text-stone-600'}`}>
                      {STATUS_LABELS[order.order_status] || order.order_status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'COD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-stone-500">
                  <span>{new Date(order.order_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-semibold text-stone-800">Rs {order.total_amount.toLocaleString()}</span>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-2 text-xs text-stone-400">
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    {order.order_items[0].product && ` — ${order.order_items[0].product.name}${order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ''}`}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-organic-600 text-white' : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-50'}`}
              >{p}</button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-stone-400 mt-4">{total} order{total !== 1 ? 's' : ''} total</p>
      </div>
    </div>
  );
}

