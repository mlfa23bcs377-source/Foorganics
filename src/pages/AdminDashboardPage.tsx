import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Order } from '../types';
import { getDashboardStats, getAllOrders } from '../services/orderService';
import StatsCard from '../components/admin/StatsCard';
import StatusBadge from '../components/admin/StatusBadge';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    listedProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [statsData, orders] = await Promise.all([getDashboardStats(), getAllOrders()]);
      setStats(statsData);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/dashboard', load);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard title="Total Products" value={stats.totalProducts} icon={<ShoppingBagIcon className="h-6 w-6" />} />
        <StatsCard title="Listed Products" value={stats.listedProducts} icon={<TagIcon className="h-6 w-6" />} color="blue" />
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={<ClipboardDocumentListIcon className="h-6 w-6" />} color="blue" />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={<ClockIcon className="h-6 w-6" />} color="yellow" />
        <StatsCard
          title="Revenue (Paid)"
          value={`₨${stats.totalRevenue.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-earth-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/labadmin/suppliers', label: 'Suppliers' },
            { to: '/labadmin/purchases', label: 'Purchases' },
            { to: '/labadmin/inventory', label: 'Inventory' },
            { to: '/labadmin/products', label: 'Listings' },
            { to: '/labadmin/orders', label: 'Orders' },
            { to: '/products', label: 'View Store' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-3 text-center text-sm font-medium rounded-lg bg-organic-600 text-white hover:bg-organic-700"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-earth-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-earth-900">Recent Orders</h2>
          <Link to="/labadmin/orders" className="text-organic-600 text-sm hover:text-organic-700">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-center text-earth-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-earth-200">
              <thead className="bg-earth-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm">₨{Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.order_status} /></td>
                    <td className="px-6 py-4"><StatusBadge status={order.payment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
