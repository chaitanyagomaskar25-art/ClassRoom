import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('classroom-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  const responseError = error.response?.data?.error;
  return error.response?.data?.message || (typeof responseError === 'string' ? responseError : responseError?.message) || error.message || 'Something went wrong. Please try again.';
}

export function unwrap(response) {
  return response.data?.data ?? response.data;
}
