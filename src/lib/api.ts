import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isCustomerRoute = url.startsWith('/customer');
  const token = isCustomerRoute
    ? localStorage.getItem('foorganics_customer_token')
    : localStorage.getItem('foorganics_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
