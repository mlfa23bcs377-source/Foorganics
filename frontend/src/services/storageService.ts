import api from '../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const UPLOADS_BASE = API_URL.replace('/api', '/uploads');

export function isManagedProductImage(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return url.pathname.startsWith('/uploads/');
  } catch {
    return false;
  }
}

export function extractFilenameFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    if (!url.pathname.startsWith('/uploads/')) return null;
    return url.pathname.replace('/uploads/', '');
  } catch {
    return null;
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<{ url: string }>('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!isManagedProductImage(imageUrl)) return;
  const filename = extractFilenameFromUrl(imageUrl);
  if (!filename) return;
  try {
    await api.delete('/products/upload-image', { data: { filename } });
  } catch {
    // best-effort cleanup
  }
}

export function getPublicUrl(filename: string): string {
  return `${UPLOADS_BASE}/${filename}`;
}
