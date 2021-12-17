import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('components/Dashboard.vue') },
      { path: 'croptype', component: () => import('pages/croptype.vue') },
      { path: 'vegelist', component: () => import('pages/vegelist.vue') },
      { path: 'vegereview', component: () => import('pages/vegereview.vue') },
      { path: 'fruitlist', component: () => import('pages/fruitlist.vue') },
      { path: 'fruitreview', component: () => import('pages/fruitreview.vue') },
      { path: 'flowerlist', component: () => import('pages/flowerlist.vue') },
      { path: 'flowerreview', component: () => import('pages/flowerreview.vue') },
      { path: 'meatlist', component: () => import('pages/meatlist.vue') },
      { path: 'meatreview', component: () => import('pages/meatreview.vue') },
      { path: 'finalreview', component: () => import('pages/finalreview.vue') },
      { path: 'successpage', component: () => import('pages/successpage.vue') },

    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
