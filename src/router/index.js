import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import HomeView from '../views/HomeView.vue'
import DataScreenView from '../views/analytics/DataScreenView.vue'
import ReportTablesView from '../views/analytics/report/ReportTablesView.vue'

const routes = [
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'analytics/screen', name: 'analytics-screen', component: DataScreenView },
      { path: 'analytics/report', name: 'report-tables', component: ReportTablesView },
      /* 旧地址：可视化简报已与数据大屏合并 */
      { path: 'analytics/report/visual', redirect: { name: 'analytics-screen' } },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
