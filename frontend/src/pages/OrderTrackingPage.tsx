import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { trackOrder } from '../services/customerService';
import { CustomerOrder } from '../types';

const ALL_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed',
  'shipped', 'out_for_delivery', 'delivered',
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned', refunded: 'Refunded',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '📋', confirmed: '✅', processing: '⚙️',
  packed: '📦', shipped: '🚚', out_for_delivery: '🛵', delivered: '🏠',
  cancelled: '✗', returned: '↩', refunded: '💳',
};

const TERMINAL_STATUSES = new Set(['delivered', 'cancelled', 'returned', 'refunded']);

function TrackingTimeline({ order }: { order: CustomerOrder }) {
  const isCancelled = TERMINAL_STATUSES.has(order.order_status) && order.order_status !== 'delivered';
  const displayStatuses = isCancelled ? ALL_STATUSES : ALL_STATUSES;
  const currentIdx = displayStatuses.indexOf(order.order_status);

  return (
    <div className="mt-6">
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-2xl mb-2">{STATUS_ICONS[order.order_status] || '✗'}</p>
          <p className="font-semibold text-red-700">{STATUS_LABELS[order.order_status] || order.order_status}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-start justify-between">
            {displayStatuses.map((s, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={s} className="flex flex-col items-center flex-1 relative">
                  {idx > 0 && (
                    <div className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2 ${done ? 'bg-organic-500' : 'bg-stone-200'}`} />
                  )}
                  {idx < displayStatuses.length - 1 && (
                    <div className={`absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2 ${idx < currentIdx ? 'bg-organic-500' : 'bg-stone-200'}`} />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    active ? 'bg-organic-600 text-white ring-4 ring-organic-100' :
                    done ? 'bg-organic-500 text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    {done ? (active ? STATUS_ICONS[s] || '•' : '✓') : STATUS_ICONS[s] || '○'}
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

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Status History</h3>
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
    </div>
  );
}

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const result = await trackOrder(identifier.trim());
      setOrder(result);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Order not found. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-organic-800">Foorganic</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-stone-600 hover:text-stone-800">Shop</Link>
            <Link to="/account" className="text-stone-600 hover:text-stone-800">My Account</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-800">Track Your Order</h1>
          <p className="text-stone-500 mt-2">Enter your order number or tracking number below</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="e.g. ORD-000001 or TRK-..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
          />
          <button
            type="submit" disabled={loading || !identifier.trim()}
            className="px-6 py-3 bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {order && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            {/* Order Summary */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-100 mb-6">
              <div>
                <p className="text-lg font-bold text-stone-800">{order.orderNumber || order.id}</p>
                {order.trackingNumber && (
                  <p className="text-sm text-stone-400 mt-0.5">Tracking: {order.trackingNumber}</p>
                )}
                <p className="text-sm text-stone-500 mt-1">
                  Placed on {new Date(order.order_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-stone-800">Rs {order.total_amount.toLocaleString()}</p>
                <p className="text-sm text-stone-400">
                  {order.payment_status === 'paid' ? 'Paid' : 'Cash on Delivery'}
                </p>
              </div>
            </div>

            {/* Recipient */}
            <div className="text-sm text-stone-600 mb-6">
              <p className="font-medium text-stone-700">Delivering to</p>
              <p className="mt-1">{order.customer_name}</p>
              <p className="text-stone-400">{order.address}</p>
            </div>

            {/* Timeline */}
            <TrackingTimeline order={order} />
          </div>
        )}
      </div>
    </div>
  );
}

