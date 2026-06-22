import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getCustomerDashboard, getMyOrders } from '../services/customerService';
import { CustomerDashboardStats, CustomerOrder } from '../types';

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-5">
    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-stone-800">{value}</p>
    {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
  </div>
);

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
  returned: 'bg-stone-100 text-stone-800',
  refunded: 'bg-stone-100 text-stone-800',
};

export default function CustomerDashboardPage() {
  const { session, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CustomerDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { navigate('/login', { state: { returnTo: '/account' } }); return; }
    Promise.all([getCustomerDashboard(), getMyOrders({ limit: 5, page: 1 })])
      .then(([s, o]) => { setStats(s); setRecentOrders(o.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, navigate]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-stone-500">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-organic-800">Foorganic</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/account" className="text-organic-700 font-semibold border-b-2 border-organic-500 pb-0.5">Dashboard</Link>
            <Link to="/account/orders" className="text-stone-600 hover:text-stone-800">My Orders</Link>
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
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Welcome back, {session?.customer.fullName.split(' ')[0]}!</h1>
        <p className="text-stone-500 text-sm mb-8">Here's a summary of your account</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
          <StatCard label="Delivered" value={stats?.completedOrders ?? 0} />
          <StatCard label="In Progress" value={stats?.pendingOrders ?? 0} />
          <StatCard label="Total Spent" value={`Rs ${(stats?.totalSpent ?? 0).toLocaleString()}`} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <Link to="/account/orders" className="text-sm text-organic-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-stone-400">
              <p>No orders yet.</p>
              <Link to="/" className="mt-2 inline-block text-sm text-organic-600 hover:underline">Start shopping</Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <Link key={order.id} to={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{order.orderNumber || order.id.slice(-8)}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-stone-100 text-stone-600'}`}>
                      {STATUS_LABELS[order.order_status] || order.order_status}
                    </span>
                    <p className="text-sm font-semibold text-stone-800">Rs {order.total_amount.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Link to="/account/orders" className="bg-white rounded-xl border border-stone-200 p-5 hover:border-organic-300 hover:shadow-sm transition-all">
            <p className="font-semibold text-stone-800">My Orders</p>
            <p className="text-xs text-stone-500 mt-1">View complete order history</p>
          </Link>
          <Link to="/track" className="bg-white rounded-xl border border-stone-200 p-5 hover:border-organic-300 hover:shadow-sm transition-all">
            <p className="font-semibold text-stone-800">Track Order</p>
            <p className="text-xs text-stone-500 mt-1">Enter tracking number or order ID</p>
          </Link>
          <Link to="/account/profile" className="bg-white rounded-xl border border-stone-200 p-5 hover:border-organic-300 hover:shadow-sm transition-all">
            <p className="font-semibold text-stone-800">My Profile</p>
            <p className="text-xs text-stone-500 mt-1">Manage account & addresses</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

