import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getMyOrderById } from '../services/customerService';
import { CustomerOrder } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
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

const TIMELINE_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) { navigate('/login', { state: { returnTo: `/account/orders/${id}` } }); return; }
    if (!id) return;
    getMyOrderById(id)
      .then(setOrder)
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [session, id, navigate]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const isTerminal = order && ['cancelled', 'returned', 'refunded'].includes(order.order_status);
  const currentIdx = order ? TIMELINE_STATUSES.indexOf(order.order_status) : -1;

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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/account/orders" className="text-stone-400 hover:text-stone-600 text-sm">← My Orders</Link>
        </div>

        {loading && <div className="text-center py-20 text-stone-400">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">{error}</div>}

        {order && (
          <>
            {/* Header */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-800">{order.orderNumber || `#${order.id.slice(-8)}`}</h1>
                  {order.trackingNumber && (
                    <p className="text-sm text-stone-400 mt-0.5">Tracking: {order.trackingNumber}</p>
                  )}
                  <p className="text-sm text-stone-500 mt-1">
                    {new Date(order.order_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-stone-100 text-stone-600'}`}>
                    {STATUS_LABELS[order.order_status] || order.order_status}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Deliver To</p>
                  <p className="font-medium text-stone-700">{order.customer_name}</p>
                  <p className="text-stone-500">{order.address}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Order Total</p>
                  <p className="text-2xl font-bold text-stone-800">Rs {order.total_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            {!isTerminal && currentIdx >= 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
                <h2 className="font-semibold text-stone-800 mb-6">Tracking</h2>
                <div className="flex items-start justify-between overflow-x-auto pb-2">
                  {TIMELINE_STATUSES.map((s, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    return (
                      <div key={s} className="flex flex-col items-center flex-1 relative min-w-[60px]">
                        {idx > 0 && (
                          <div className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2 ${done ? 'bg-organic-500' : 'bg-stone-200'}`} />
                        )}
                        {idx < TIMELINE_STATUSES.length - 1 && (
                          <div className={`absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2 ${idx < currentIdx ? 'bg-organic-500' : 'bg-stone-200'}`} />
                        )}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          active ? 'bg-organic-600 text-white ring-4 ring-organic-100' :
                          done ? 'bg-organic-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          {done ? '✓' : '○'}
                        </div>
                        <p className={`text-xs mt-2 text-center leading-tight ${active ? 'font-semibold text-organic-700' : done ? 'text-stone-600' : 'text-stone-400'}`}>
                          {STATUS_LABELS[s]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
              <h2 className="font-semibold text-stone-800 mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.product?.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl border border-stone-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity} × Rs {item.unit_price.toLocaleString()}</p>
                    </div>
                    <p className="font-semibold text-stone-800 whitespace-nowrap">
                      Rs {(item.quantity * item.unit_price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between">
                <span className="font-semibold text-stone-700">Total</span>
                <span className="font-bold text-stone-800 text-lg">Rs {order.total_amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <h2 className="font-semibold text-stone-800 mb-4">Status History</h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-organic-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-stone-700">{STATUS_LABELS[h.status] || h.status}</p>
                        {h.note && <p className="text-stone-400 text-xs">{h.note}</p>}
                        <p className="text-stone-400 text-xs">{new Date(h.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

