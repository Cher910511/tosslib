import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import AdminShell from '../layouts/AdminShell.vue'
import HomeView from '../views/HomeView.vue'
import WorkbenchView from '../views/WorkbenchView.vue'
import DataScreenView from '../views/analytics/DataScreenView.vue'
import ReportTablesView from '../views/analytics/report/ReportTablesView.vue'
import SoftwareHomeView from '../views/software/SoftwareHomeView.vue'
import SoftwareLibraryView from '../views/software/SoftwareLibraryView.vue'
import SoftwareDetailView from '../views/software/SoftwareDetailView.vue'
import SoftwareManageView from '../views/software/SoftwareManageView.vue'
import SoftwareVersionView from '../views/software/SoftwareVersionView.vue'
import SoftwareScanView from '../views/software/SoftwareScanView.vue'
import ScanResultView from '../views/software/ScanResultView.vue'
import SignatureVerifyView from '../views/software/SignatureVerifyView.vue'
import DetectionReportView from '../views/software/DetectionReportView.vue'
import ScanDetailsView from '../views/software/ScanDetailsView.vue'
import SoftwareApprovalView from '../views/software/SoftwareApprovalView.vue'
import VersionTrainTreeView from '../views/version-train/VersionTrainTreeView.vue'
import VersionTrainReleaseView from '../views/version-train/VersionTrainReleaseView.vue'
import PatchPlanView from '../views/version-train/PatchPlanView.vue'
import ComponentLibraryView from '../views/component-lib/ComponentLibraryView.vue'
import ComponentDetailView from '../views/component-lib/ComponentDetailView.vue'
import CodeAssistantView from '../views/assistant/CodeAssistantView.vue'
import AdminGovernanceView from '../views/admin/AdminGovernanceView.vue'
import AdminGovernanceDetail from '../views/admin/AdminGovernanceDetail.vue'
import VulnerabilityAlertView from '../views/admin/VulnerabilityAlertView.vue'
import SendAlertHistoryView from '../views/admin/SendAlertHistoryView.vue'
import OpenApiToolsView from '../views/admin/OpenApiToolsView.vue'
import BoardsPage from '../views/admin/report/BoardsPage.vue'
import OpenApiDocView from '../views/admin/OpenApiDocView.vue'
import ApiKeyManageView from '../views/admin/ApiKeyManageView.vue'
import ToolsetView from '../views/admin/ToolsetView.vue'
import PersonalSettingsView from '../views/admin/PersonalSettingsView.vue'
import StandardBuildView from '../views/standard/StandardBuildView.vue'
import IntelVulnView from '../views/intel/IntelVulnView.vue'
import IntelOpiView from '../views/intel/IntelOpiView.vue'
import UserManualView from '../views/manual/UserManualView.vue'
import OrgListView from '../views/org/OrgListView.vue'
import OrgDetailView from '../views/org/OrgDetailView.vue'
import RequirementFeedbackView from '../views/software/RequirementFeedbackView.vue'
import InboundRequestView from '../views/software/InboundRequestView.vue'
import FeedbackAuditView from '../views/admin/FeedbackAuditView.vue'
import { DETAIL_LANG_KEYS } from '../data/componentDetailLang.js'

const legacyLangDetailRedirects = DETAIL_LANG_KEYS.map((key) => ({
  path: `components/detail/${key}`,
  redirect: { name: 'component-detail', params: { id: 'vertx-web-sstore-cookie' } },
}))

const routes = [
  /* 登录后默认进入「工作台」（按当前用户角色渲染普通成员/组织管理员视图） */
  { path: '/', redirect: '/software/workbench' },
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
        path: 'workbench',
        name: 'workbench',
        component: WorkbenchView,
        meta: { adminTitle: '工作台' },
      },
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
      {
        path: 'signature-verify',
        name: 'signature-verify',
        component: SignatureVerifyView,
        meta: { adminTitle: '签名验证' },
      },
      {
        path: 'detection-report',
        name: 'detection-report',
        component: DetectionReportView,
        meta: { adminTitle: '检测报告' },
      },
      {
        path: 'manage/approval',
        name: 'software-approval',
        component: SoftwareApprovalView,
        meta: { adminTitle: '软件出入库' },
      },
      // ==================== 组织管理 ====================
      {
        path: 'org',
        name: 'org-list',
        component: OrgListView,
        meta: { adminTitle: '组织管理' },
      },
      {
        path: 'org/:orgId',
        name: 'org-detail',
        component: OrgDetailView,
        meta: { adminTitle: '组织详情' },
      },
      // ==================== 需求反馈 ====================
      {
        path: 'feedback',
        name: 'requirement-feedback',
        component: RequirementFeedbackView,
        meta: { adminTitle: '需求反馈' },
      },
      // 开源软件项目入库需求清单（需求反馈下的子页面）
      {
        path: 'feedback/inbound-request',
        name: 'inbound-request',
        component: InboundRequestView,
        meta: { adminTitle: '开源软件项目入库需求清单' },
      },
      // ==================== 反馈与审核（后台管理） ====================
      {
        path: 'feedback-audit',
        name: 'feedback-audit',
        component: FeedbackAuditView,
        meta: { adminTitle: '反馈与审核' },
      },
      // ==================== OpenAPI ====================
      {
        path: 'openapi-tools',
        name: 'openapi-tools',
        component: OpenApiToolsView,
        meta: { adminTitle: 'OpenAPI' },
      },
      {
        path: 'openapi-doc/:docId?',
        name: 'openapi-doc',
        component: OpenApiDocView,
        meta: { adminTitle: 'OpenAPI 文档' },
      },
      {
        path: 'api-keys',
        name: 'api-keys',
        component: ApiKeyManageView,
        meta: { adminTitle: '密钥管理' },
      },
      // ==================== 工具集 ====================
      {
        path: 'toolset',
        name: 'toolset',
        component: ToolsetView,
        meta: { adminTitle: '工具集' },
      },
      // ==================== 数据看板 ====================
      {
        path: 'board',
        name: 'board',
        component: BoardsPage,
        meta: { adminTitle: '数据看板' },
      },
      // ==================== 个人设置 ====================
      {
        path: 'personal-settings',
        name: 'personal-settings',
        component: PersonalSettingsView,
        meta: { adminTitle: '个人设置' },
      },
      // ==================== 指标配置 ====================
      {
        path: 'standard-build',
        name: 'standard-build',
        component: StandardBuildView,
        meta: { adminTitle: '指标配置' },
      },
      // ==================== 版本火车 ====================
      {
        path: 'version-train-tree',
        name: 'version-train-tree',
        component: VersionTrainTreeView,
        meta: { adminTitle: '版本火车信息树' },
      },
      {
        path: 'version-train-release',
        name: 'version-train-release',
        component: VersionTrainReleaseView,
        meta: { adminTitle: '版本火车发车' },
      },
      {
        path: 'patch-plan',
        name: 'patch-plan',
        component: PatchPlanView,
        meta: { adminTitle: '软件出入库' },
      },
      {
        path: 'scan-details',
        name: 'scan-details',
        component: ScanDetailsView,
        meta: { adminTitle: '扫描明细' },
      },
      {
        path: 'vulnerability-alert',
        name: 'vulnerability-alert',
        component: VulnerabilityAlertView,
        meta: { adminTitle: '漏洞预警' },
      },
      {
        path: 'send-alert-history',
        name: 'send-alert-history',
        component: SendAlertHistoryView,
        meta: { adminTitle: '预警发送历史' },
      },
      // ==================== 软件治理 ====================
      {
        path: 'admin-flow',
        name: 'admin-gov',
        component: AdminGovernanceView,
        meta: { adminTitle: '软件治理' },
      },
      {
        path: 'admin-flow/:id',
        name: 'admin-gov-detail',
        component: AdminGovernanceDetail,
        meta: { adminTitle: '软件详情' },
      },
      // ==================== 安全情报中心 ====================
      {
        path: 'intel-vuln',
        name: 'intel-vuln',
        component: IntelVulnView,
        meta: { adminTitle: '漏洞库' },
      },
      {
        path: 'intel-opi',
        name: 'intel-opi',
        component: IntelOpiView,
        meta: { adminTitle: '舆情库' },
      },
      { path: '', redirect: { name: 'software-home' } },
    ],
  },
  {
    path: '/software/manual/:docId?',
    name: 'user-manual',
    component: UserManualView,
    meta: { title: '使用手册' },
  },
]

export const router = createRouter({
  // 与 vite.config base 一致（GitHub Pages 子路径部署必需）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
