const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Starter',
      path: '/starter',
      component: () => import('@/views/StarterPage.vue')
    },
    {
      name: 'Artists',
      path: '/artists',
      component: () => import('@/views/pages/Artists.vue')
    },
    {
      name: 'ViewArtist',
      path: '/artist/:id',
      component: () => import('@/views/pages/ViewArtist.vue'),
      props: true
    },
    {
      name: 'Releases',
      path: '/releases',
      component: () => import('@/views/pages/Releases.vue')
    },
    {
      name: 'ViewRelease',
      path: '/release/:id',
      component: () => import('@/views/pages/ViewRelease.vue'),
      props: true
    },
    {
      name: 'Labels',
      path: '/labels',
      component: () => import('@/views/pages/Labels.vue')
    },
    {
      name: 'DeliveredList',
      path: '/delivered',
      component: () => import('@/views/pages/DeliveredList.vue')
    },
    {
      name: 'StoreDeliveredList',
      path: '/delivered/:id',
      component: () => import('@/views/pages/ViewDeliveredList.vue')
    },
    {
      name: 'Statements',
      path: '/statements',
      component: () => import('@/views/pages/Statements.vue')
    },
    {
      name: 'ReleaseDeliveredList',
        path: '/delivered/release/:name',
      component: () => import('@/views/pages/DeliveredList.vue')
    }
  ]
};

export default MainRoutes;
