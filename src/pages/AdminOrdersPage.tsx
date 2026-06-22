import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import {
  getAllOrders,
  updateOrderStatus,
  markPaymentReceived,
} from '../services/orderService';
import { Modal } from '../components';
import StatusBadge from '../components/admin/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useRefreshOnNavigate } from '../hooks/useRefreshOnNavigate';

const AdminOrdersPage: React.FC = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await getAllOrders());
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);
  useRefreshOnNavigate('/labadmin/orders', load);

  const filtered = orders.filter((o) => {
    if (filter === 'pending') return o.order_status === 'pending';
    if (filter === 'paid') return o.payment_status === 'paid';
    return true;
  });

  const handleStatusChange = async (id: string, status: Order['order_status']) => {
    try {
      await updateOrderStatus(id, status);
      addToast('Order status updated', 'success');
      await load();
      if (selected?.id === id) setSelected({ ...selected, order_status: status });
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaymentReceived(id);
      addToast('Payment marked as received', 'success');
      await load();
    } catch {
      addToast('Failed to update payment', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Orders & Payments</h1>
          <p className="text-sm text-earth-500 mt-1">Manage customer orders and payment status</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Orders</option>
          <option value="pending">Pending Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-earth-200">
          <thead className="bg-earth-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Order Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200">
            {filtered.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                <td className="px-6 py-4 text-sm">₨{Number(order.total_amount).toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={order.order_status} /></td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.payment_status} />
                  {order.payment_method && (
                    <span className="block text-xs text-earth-400 mt-1 capitalize">{order.payment_method.replace('_', ' ')}</span>
                  )}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => setSelected(order)} className="text-organic-600 text-sm hover:underline">View</button>
                  {order.payment_status === 'unpaid' && (
                    <button onClick={() => handleMarkPaid(order.id)} className="text-green-600 text-sm hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-earth-500">Customer:</span> {selected.customer_name}</div>
              <div><span className="text-earth-500">Phone:</span> {selected.phone_number}</div>
              <div className="col-span-2"><span className="text-earth-500">Address:</span> {selected.address}</div>
              <div><span className="text-earth-500">Total:</span> ₨{Number(selected.total_amount).toLocaleString()}</div>
              <div><span className="text-earth-500">Date:</span> {new Date(selected.order_date).toLocaleString()}</div>
            </div>
            <h3 className="font-medium">Items</h3>
            <ul className="divide-y border rounded-lg">
              {(selected.order_items || []).map((item) => (
                <li key={item.id} className="px-4 py-2 flex justify-between text-sm">
                  <span>{item.product?.name || item.product_id} x {item.quantity}</span>
                  <span>₨{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div>
              <label className="block text-sm font-medium mb-2">Update Order Status</label>
              <select
                value={selected.order_status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value as Order['order_status'])}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
