import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import AdminShell from '../layouts/AdminShell.vue'
import HomeView from '../views/HomeView.vue'
import DataScreenView from '../views/analytics/DataScreenView.vue'
import ReportTablesView from '../views/analytics/report/ReportTablesView.vue'
import SoftwareHomeView from '../views/software/SoftwareHomeView.vue'
import SoftwareLibraryView from '../views/software/SoftwareLibraryView.vue'
import SoftwareDetailView from '../views/software/SoftwareDetailView.vue'
import SoftwareManageView from '../views/software/SoftwareManageView.vue'
import SoftwareVersionView from '../views/software/SoftwareVersionView.vue'
import SoftwareScanView from '../views/software/SoftwareScanView.vue'
import ScanResultView from '../views/software/ScanResultView.vue'
import ComponentLibraryView from '../views/component-lib/ComponentLibraryView.vue'
import ComponentDetailView from '../views/component-lib/ComponentDetailView.vue'
import CodeAssistantView from '../views/assistant/CodeAssistantView.vue'
import { DETAIL_LANG_KEYS } from '../data/componentDetailLang.js'

const legacyLangDetailRedirects = DETAIL_LANG_KEYS.map((key) => ({
  path: `components/detail/${key}`,
  redirect: { name: 'component-detail', params: { id: 'vertx-web-sstore-cookie' } },
}))

const routes = [
  /* 部署后默认进入浅色「软件详情」；原态势总览大屏改到 /dash */
  { path: '/', redirect: '/software/home' },
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
        path: 'library',
        name: 'software-library',
        component: SoftwareLibraryView,
        meta: { adminTitle: '软件库' },
      },
      {
        path: 'components',
        name: 'component-library',
        component: ComponentLibraryView,
        meta: { adminTitle: '组件库' },
      },
      {
        path: 'assistant',
        name: 'code-assistant',
        component: CodeAssistantView,
        meta: { adminTitle: 'AI 助手' },
      },
      {
        path: 'components/detail',
        redirect: { name: 'component-detail', params: { id: 'vertx-web-sstore-cookie' } },
      },
      ...legacyLangDetailRedirects,
      {
        path: 'components/detail/:id',
        name: 'component-detail',
        component: ComponentDetailView,
        meta: {
          adminTitle: '组件详情',
          isComponentDetail: true,
        },
      },
      {
        path: 'detail',
        name: 'software-detail',
        component: SoftwareDetailView,
        meta: { adminTitle: '软件详情' },
      },
      {
        path: 'manage',
        name: 'software-manage',
        component: SoftwareManageView,
        meta: { adminTitle: '软件管理' },
      },
      {
        path: 'manage/version/:softwareId',
        name: 'software-version',
        component: SoftwareVersionView,
        meta: { adminTitle: '版本详情' },
      },
      {
        path: 'scan',
        name: 'software-scan',
        component: SoftwareScanView,
        meta: { adminTitle: '软件扫描' },
      },
      {
        path: 'scan/result',
        name: 'scan-result',
        component: ScanResultView,
        meta: { adminTitle: '扫描结果' },
      },
      { path: '', redirect: { name: 'software-home' } },
    ],
  },
]

export const router = createRouter({
  // 与 vite.config base 一致（GitHub Pages 子路径部署必需）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
