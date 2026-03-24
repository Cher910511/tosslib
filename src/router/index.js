import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import AdminShell from '../layouts/AdminShell.vue'
import HomeView from '../views/HomeView.vue'
import DataScreenView from '../views/analytics/DataScreenView.vue'
import ReportTablesView from '../views/analytics/report/ReportTablesView.vue'
import SoftwareHomeView from '../views/software/SoftwareHomeView.vue'
import SoftwareDetailView from '../views/software/SoftwareDetailView.vue'

const routes = [
  /* 部署后默认进入浅色「软件详情」；原态势总览大屏改到 /dash */
  { path: '/', redirect: '/software/detail' },
  {
    path: '/dash',
    component: AppShell,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'analytics/screen', name: 'analytics-screen', component: DataScreenView },
      { path: 'analytics/report', name: 'report-tables', component: ReportTablesView },
      { path: 'analytics/report/visual', redirect: { name: 'analytics-screen' } },
    ],
  },
  /* 兼容旧书签：根路径下曾使用的 analytics 地址 */
  { path: '/analytics/screen', redirect: { name: 'analytics-screen' } },
  { path: '/analytics/report', redirect: { name: 'report-tables' } },
  { path: '/analytics/report/visual', redirect: { name: 'analytics-screen' } },
  {
    path: '/software',
    component: AdminShell,
    children: [
      {
        path: 'home',
        name: 'software-home',
        component: SoftwareHomeView,
        meta: { adminTitle: '首页' },
      },
      {
        path: 'detail',
        name: 'software-detail',
        component: SoftwareDetailView,
        meta: { adminTitle: '软件详情' },
      },
      { path: '', redirect: { name: 'software-detail' } },
    ],
  },
]

export const router = createRouter({
  // 与 vite.config base 一致（GitHub Pages 子路径部署必需）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
