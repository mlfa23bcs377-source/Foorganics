import api from '../lib/api';
import { Supplier } from '../types';

export async function getAllSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>('/suppliers');
  return data;
}

export async function createSupplier(
  supplier: Omit<Supplier, 'id' | 'created_at'>
): Promise<Supplier> {
  const { data } = await api.post<Supplier>('/suppliers', supplier);
  return data;
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const { data } = await api.put<Supplier>(`/suppliers/${id}`, updates);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}
