import { defineStore } from 'pinia';
import api from '@/utils/axios';
import { useRouter } from 'vue-router';

const router = useRouter();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: (localStorage.getItem('accessToken') as string | null) || null,
    refreshToken: (localStorage.getItem('refreshToken') as string | null) || null,
    user: (localStorage.getItem('user') as string | null) || null,
    returnUrl: null as string | null
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await api.post('/auth/obtain-token', { username, password });
        this.accessToken = res.data.access;
        this.refreshToken = res.data.refresh;
        this.user = username;

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
        if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken);
        if (this.user) localStorage.setItem('user', this.user);

        router.push(this.returnUrl || '/dashboard');
      } catch (err: any) {
        throw err.response?.data || { message: 'Login failed' };
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) return null;
      try {
        const res = await api.post('/auth/refresh-token', { refresh: this.refreshToken });
        this.accessToken = res.data.access;

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);

        return this.accessToken;
      } catch (err) {
        this.logout();
        return null;
      }
    },

    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      router.push('/login');
    }
  }
});
