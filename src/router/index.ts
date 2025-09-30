import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    MainRoutes,
    PublicRoutes
  ]
});

// Match your actual Pinia store
interface AuthStore {
  user: string | null;
  returnUrl: string | null;
  login(username: string, password: string): Promise<void>;
  logout(): void;
}

router.beforeEach(async (to, from, next) => {
  const publicPages = [''];
  const auth: AuthStore = useAuthStore();

  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  if (authRequired && !auth.user) {
    auth.returnUrl = to.fullPath;
    next('/login');
  } else if (auth.user && to.path === '/login') {
    next({
      query: {
        ...to.query,
        redirect: auth.returnUrl !== '/' ? to.fullPath : undefined
      }
    });
  } else {
    next();
  }
});
