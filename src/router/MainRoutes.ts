const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/releases', // 👈 Redirect root `/main` to `/releases`
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      path: '/', // 👈 when someone visits `/`
      redirect: '/releases' // 👈 redirect to releases
    },
    {
      name: 'LandingPage',
      path: '/main',
      redirect: '/releases' // 👈 optional, ensures main route redirects too
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
    },
    {
      name: 'MyProfile',
      path: '/Profile',
      component: () => import('@/views/pages/Profile.vue')
    },
    {
      name: 'Invoices',
      path: '/invoices',
      component: () => import('@/views/pages/Invoices.vue')
    },
    {
      name: 'AddInvoices',
      path: '/invoice/statements',
      component: () => import('@/views/pages/InvoiceStatements.vue')
    },
    {
      name: 'Trends',
      path: '/trends',
      component: () => import('@/views/pages/Trends.vue')
    }
  ]
};

export default MainRoutes;
