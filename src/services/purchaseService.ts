import api from '../lib/api';
import { PurchaseOrder } from '../types';

export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data } = await api.get<PurchaseOrder[]>('/purchase-orders');
  return data;
}

export async function createPurchaseOrder(
  order: Omit<PurchaseOrder, 'id' | 'status' | 'ordered_at' | 'received_at' | 'supplier' | 'product'>
): Promise<PurchaseOrder> {
  const { data } = await api.post<PurchaseOrder>('/purchase-orders', order);
  return data;
}

export async function markPurchaseReceived(id: string): Promise<void> {
  await api.patch(`/purchase-orders/${id}/receive`);
}
