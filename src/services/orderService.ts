import api from '../lib/api';
import { Order, DashboardStats, PaymentMethod } from '../types';

export interface CreateOrderResult {
  id: string;
  orderNumber?: string;
  trackingNumber?: string;
}

export async function createOrder(
  customerName: string,
  phoneNumber: string,
  address: string,
  paymentMethod: PaymentMethod,
  items: { product_id: string; quantity: number }[],
  opts?: { customerId?: string; guestEmail?: string }
): Promise<CreateOrderResult> {
  const { data } = await api.post<CreateOrderResult>('/orders', {
    customer_name: customerName,
    phone_number: phoneNumber,
    address,
    payment_method: paymentMethod,
    items,
    customerId: opts?.customerId,
    guestEmail: opts?.guestEmail,
  });
  return data;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders');
  return data;
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['order_status'],
  note?: string
): Promise<void> {
  await api.patch(`/orders/${id}/status`, { order_status: orderStatus, note });
}

export async function markPaymentReceived(id: string): Promise<void> {
  await api.patch(`/orders/${id}/mark-paid`);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/orders/dashboard-stats');
  return data;
}
