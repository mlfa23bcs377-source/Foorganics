import api from '../lib/api';
import { Customer, CustomerOrder, CustomerDashboardStats, CustomerAddress } from '../types';

export interface CustomerOrderListResponse {
  orders: CustomerOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getCustomerProfile(): Promise<Customer> {
  const { data } = await api.get<Customer>('/customer/me');
  return data;
}

export async function updateCustomerProfile(updates: { fullName: string; phone?: string }): Promise<Customer> {
  const { data } = await api.put<Customer>('/customer/me', updates);
  return data;
}

export async function changeCustomerPassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
  await api.put('/customer/me/password', { currentPassword, newPassword, confirmPassword });
}

export async function uploadCustomerProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<{ url: string }>('/customer/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

export async function addAddress(address: Omit<CustomerAddress, 'id'>): Promise<Customer> {
  const { data } = await api.post<Customer>('/customer/me/addresses', address);
  return data;
}

export async function updateAddress(addressId: string, address: Partial<CustomerAddress>): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customer/me/addresses/${addressId}`, address);
  return data;
}

export async function deleteAddress(addressId: string): Promise<Customer> {
  const { data } = await api.delete<Customer>(`/customer/me/addresses/${addressId}`);
  return data;
}

export async function getCustomerDashboard(): Promise<CustomerDashboardStats> {
  const { data } = await api.get<CustomerDashboardStats>('/customer/me/dashboard');
  return data;
}

export async function getMyOrders(params: {
  search?: string; status?: string; page?: number; limit?: number;
}): Promise<CustomerOrderListResponse> {
  const { data } = await api.get<CustomerOrderListResponse>('/customer/me/orders', { params });
  return data;
}

export async function getMyOrderById(id: string): Promise<CustomerOrder> {
  const { data } = await api.get<CustomerOrder>(`/customer/me/orders/${id}`);
  return data;
}

export async function trackOrder(identifier: string): Promise<CustomerOrder> {
  const { data } = await api.get<CustomerOrder>(`/customer/track/${identifier}`);
  return data;
}
