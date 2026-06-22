import api from '../lib/api';
import { Product, StoreProduct, toStoreProduct } from '../types';

export async function getListedProducts(): Promise<StoreProduct[]> {
  const { data } = await api.get<Product[]>('/products/listed');
  return data.map(toStoreProduct);
}

export async function getProductById(id: string): Promise<StoreProduct | null> {
  try {
    const { data } = await api.get<Product>(`/products/listed/${id}`);
    return toStoreProduct(data);
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products');
  return data;
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'supplier'>
): Promise<Product> {
  const { data } = await api.post<Product>('/products', product);
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'supplier'>>
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, updates);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function toggleListed(id: string, isListed: boolean): Promise<void> {
  await api.patch(`/products/${id}/toggle-listed`, { is_listed: isListed });
}

export async function getProductCount(): Promise<number> {
  const { data } = await api.get<{ totalProducts: number; listedProducts: number }>('/products/stats');
  return data.totalProducts;
}

export async function getListedCount(): Promise<number> {
  const { data } = await api.get<{ totalProducts: number; listedProducts: number }>('/products/stats');
  return data.listedProducts;
}
