// src/utils/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_PROXY_URL || 'http://127.0.0.1:8000/api'
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();

  // Prefer store, fallback to localStorage
  const accessToken = auth.accessToken || localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
api.interceptors.response.use(
  async (response) => {
    const auth = useAuthStore();

    // Some APIs return 200 + error payload
    if (response.data?.code === 'token_not_valid' && auth.refreshToken) {
      try {
        const newAccess = await auth.refreshAccessToken();
        if (newAccess) {
          // retry original request with new token
          const originalRequest = response.config;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (e) {
        console.error('[Axios Interceptor] Refresh failed', e);
      }
    }

    return response;
  },
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    if (error.response?.status === 401 && auth.refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await auth.refreshAccessToken();
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
