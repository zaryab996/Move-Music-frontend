// src/utils/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_PROXY_URL || 'http://127.0.0.1:8000/api'
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  const accessToken = auth.accessToken || localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    if (!auth.refreshToken || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const newAccess = await auth.refreshAccessToken();

        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        auth.logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
