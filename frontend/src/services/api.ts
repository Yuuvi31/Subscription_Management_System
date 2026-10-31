import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase, isDemoMode } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Centralized Bearer Token interceptor
api.interceptors.request.use(
  async (config) => {
    if (!isDemoMode) {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized Response and Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const customError = {
      message: (error.response?.data as { message?: string })?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export default api;
