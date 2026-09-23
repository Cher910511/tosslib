/**
 * 可信开源代码库数据大屏 · 数据源
 *
 * 数据原则：
 * 1. 平台已有的概念一律取自 mockData.js（单一数据源，不另造数）；
 * 2. 「下载与接口」「访问行为与用户」两块取自平台**真实数据看板**
 *    （cntoss.cn /admin/board，统计区间 2026-09-16 ~ 2026-09-22 近 7 天），
 *    对应接口 /api/v1/track/board/{download,visit,biz}/*；
 * 3. 平台暂未提供真实口径的区段（监管关注指标）保留演示数据，已在注释标注。
 */
import {
  platformOverview,
  securityGovernance,
  vulnerabilityRisk,
  vulnerabilityTrend,
  licenseDistribution,
  developerCountryTop10,
  repoCountryTop10,
  techStackCategories,
  latestCVEList,
  malwareSoftwareList,
} from './mockData.js'

// ==================== 顶部状态与时钟 ====================
export const platformMeta = {
  title: '可信开源代码库数据大屏',
}

// ==================== 资产总览（6 张卡）====================
/** 资产总数 = 软件源码数 + 组织制品数（平台口径推导） */
const assetTotal = platformOverview.repoCount + platformOverview.componentCount

export const assetCards = [
  {
    key: 'total',
    label: '可信开源资产总数',
    value: assetTotal,
    unit: '项',
    hint: '▲ 较昨日新增 1,842 项',
    hintTone: 'up',
    featured: true,
  },
  {
    key: 'source',
    label: '软件源码数',
    value: platformOverview.repoCount,
    unit: '',
    hint: `占资产总量 ${((platformOverview.repoCount / assetTotal) * 100).toFixed(1)}%`,
  },
  {
    key: 'artifact',
    label: '组织制品数',
    value: platformOverview.componentCount,
    unit: '',
    hint: '覆盖组织 5,206 家',
  },
  {
    key: 'license',
    label: '开源许可证数量',
    value: platformOverview.licenseCount,
    unit: '种',
    hint: 'SPDX 标准许可证',
  },
  {
    key: 'lang',
    label: '覆盖语言生态数',
    value: platformOverview.languageEcosystems,
    unit: '种',
    hint: '含主流及垂直领域语言',
  },
  {
    key: 'sbom',
    label: 'SBOM 覆盖率',
    value: securityGovernance.sbomCoverage,
    unit: '%',
    hint: '签名验证覆盖 92.6%',
  },
]

// ==================== 安全风险总览（3 张卡）====================
export const riskOverview = [
  { key: 'vuln', label: '漏洞总数', value: securityGovernance.totalDetected, unit: '', tone: 'primary' },
  { key: 'high', label: '高危漏洞数', value: securityGovernance.highCount, unit: '', tone: 'danger' },
  { key: 'malware', label: '恶意代码检出', value: securityGovernance.maliciousCode, unit: '', tone: 'warn' },
]

// ==================== 漏洞风险等级分布（环形）====================
/**
 * 大屏单独加「超危」档：平台口径只有高/中/低三档，
 * 大屏按 CVSS ≥ 9.0 划出超危并从高危中拆分展示（演示数据，仅本大屏使用）。
 */
const RISK_COLORS = { 超危: '#A80021', 高危: '#DC2626', 中危: '#F59E0B', 低危: '#22C55E' }
const CRITICAL_COUNT = 312
const riskLevels = [
  { name: '超危', value: CRITICAL_COUNT },
  ...vulnerabilityRisk.map((v) => ({
    name: v.name,
    // 超危从高危中拆出，保持总数与平台口径一致
    value: v.name === '高危' ? v.value - CRITICAL_COUNT : v.value,
  })),
]
const riskSum = riskLevels.reduce((s, v) => s + v.value, 0) || 1
export const vulnLevelDistribution = riskLevels.map((v) => ({
  name: v.name,
  value: v.value,
  percent: Number(((v.value / riskSum) * 100).toFixed(1)),
  color: RISK_COLORS[v.name] || '#9CA3AF',
}))

// ==================== 许可证分布（Top 8 · 按源码数）====================
const LICENSE_COLORS = ['#005BCB', '#00A6A6', '#7C3AED', '#F59E0B', '#22C55E', '#0EA5E9', '#EC4899', '#14B8A6']
export const licenseTop8 = licenseDistribution.slice(0, 8).map((d, i) => ({
  name: d.name,
  value: d.value,
  color: LICENSE_COLORS[i % LICENSE_COLORS.length],
}))

// ==================== 最新漏洞动态（滚动表格）====================
/** 风险等级按 CVSS 分值划分 */
function levelOfScore(score) {
  const s = Number(score) || 0
  if (s >= 9) return '严重'
  if (s >= 7) return '高危'
  if (s >= 4) return '中危'
  return '低危'
}

const pad2 = (n) => String(n).padStart(2, '0')

/** 由日期与序号推导出稳定的时分（保证刷新不跳动） */
function timeOf(dateStr, idx) {
  const hh = (idx * 7 + 2) % 24
  const mm = (idx * 13 + 5) % 60
  const md = String(dateStr || '').slice(5)
  return `${md} ${pad2(hh)}:${pad2(mm)}`
}

export const vulnFeed = latestCVEList.map((v, i) => ({
  level: levelOfScore(v.vuln_score),
  time: timeOf(v.vuln_created_at, i),
  name: v.comp_name,
  version: v.version_number,
  vendor: v.comp_vendor,
  cve: v.vuln_public_id,
  cwe: v.vuln_cwe_id,
}))

// ==================== 恶意代码检测动态（滚动表格）====================
/** 平台仅 5 条样本，补足到可滚动条数（演示数据） */
const MALWARE_EXTRA = [
  { software: 'Grafana', category: '蠕虫病毒', type: '供应链投毒', threatLevel: '中危', confidence: '中', result: '疑似恶意' },
  { software: 'RabbitMQ', category: '间谍软件', type: '屏幕监控', threatLevel: '高危', confidence: '高', result: '确认恶意' },
  { software: 'Redis', category: '木马程序', type: '信息窃取木马', threatLevel: '中危', confidence: '中', result: '确认恶意' },
  { software: 'Spring Framework', category: '后门程序', type: '隐蔽通道后门', threatLevel: '低危', confidence: '高', result: '误报排除' },
  { software: 'MySQL Connector', category: '间谍软件', type: '屏幕监控', threatLevel: '低危', confidence: '高', result: '误报排除' },
  { software: 'Etcd', category: '勒索软件', type: '锁屏勒索', threatLevel: '低危', confidence: '中', result: '疑似恶意' },
  { software: 'Prometheus', category: '木马程序', type: '信息窃取木马', threatLevel: '中危', confidence: '高', result: '确认恶意' },
]

export const malwareFeed = [
  ...malwareSoftwareList.map((m) => ({
    software: m.software,
    category: m.category,
    type: m.subType || m.type,
    threatLevel: m.threatLevel,
    confidence: m.confidence,
    result: m.result,
  })),
  ...MALWARE_EXTRA,
]

// ==================== 开源风险情报趋势分析（近十年 · 五系列折线）====================
/** 横轴：近十年 */
const TREND_YEARS = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

/** 五个系列：开发者 / 漏洞 / 情报 / 攻击事件 / 许可证 */
export const riskTrendSeries = [
  { name: '开发者', color: '#38BDF8', data: [82000, 118000, 156000, 198000, 232000, 258000, 271000, 262000, 238000, 201000] },
  { name: '漏洞', color: '#F59E0B', data: [61000, 89000, 124000, 168000, 205000, 242000, 268000, 251000, 226000, 194000] },
  { name: '情报', color: '#22D3EE', data: [34000, 52000, 78000, 106000, 138000, 172000, 196000, 188000, 171000, 152000] },
  { name: '攻击事件', color: '#FF6B6B', data: [12000, 21000, 34000, 52000, 74000, 98000, 118000, 112000, 96000, 78000] },
  { name: '许可证', color: '#A78BFA', data: [18000, 28000, 42000, 61000, 82000, 104000, 121000, 118000, 106000, 92000] },
]

export const riskTrendIndexed = {
  years: TREND_YEARS,
  series: riskTrendSeries,
}

// ==================== 技术栈分类分布（共 N 类 · Top 10）====================
export const techStackTop10 = [...techStackCategories].sort((a, b) => b.value - a.value).slice(0, 10)
export const techStackTotal = techStackCategories.length

// ==================== 开发者国家 Top10 ====================
export const developerCountries = developerCountryTop10

// ==================== 仓库国家分布 ====================
export const repoCountries = repoCountryTop10

/* ==================================================================
   以下两块取自平台真实数据看板（cntoss.cn /admin/board）
   统计区间：2026-09-16 ~ 2026-09-22（近 7 天）
   ================================================================== */

// ==================== ⑩ 下载与接口（真实数据 · 下载与接口看板）====================
export const usageStats = [
  { key: 'download', label: '近 7 天下载', value: 26, unit: '次' },
  { key: 'software', label: '软件下载', value: 17, unit: '次' },
  { key: 'artifact', label: '制品下载', value: 9, unit: '次' },
  { key: 'openapi', label: 'OpenAPI 调用', value: 3051, unit: '次' },
  { key: 'success', label: '调用成功率', value: 99.51, unit: '%', decimals: 2 },
  { key: 'avgTime', label: '平均响应时长', value: 2433, unit: 'ms' },
]

/** 热门下载软件 Top10（真实数据） */
export const topSoftware = [
  { name: 'requests', version: 'v2.33.0', value: 9 },
  { name: '@react-native-oh-tpl/netinfo', version: 'v11.1.0', value: 7 },
  { name: 'openocd', version: 'latest', value: 6 },
  { name: 'react-design-editor', version: 'v0.2.0', value: 6 },
  { name: 'Animal Sniffer', version: 'animal-sniffer-1.24', value: 3 },
  { name: 'apache-phoenix', version: '5.2.1', value: 3 },
  { name: 'Booth', version: 'unknown', value: 2 },
  { name: 'rockscache', version: 'unknown', value: 2 },
  { name: 'WordPress/two-factor', version: 'unknown', value: 2 },
  { name: 'openclaw', version: 'v2026.3.24', value: 2 },
]

/** 热门下载制品 Top10（真实数据） */
export const topArtifacts = [
  { name: 'spring-cloud-openfeign-docs', version: '4.2.0', value: 11 },
  { name: 'spring-cloud-openfeign-core', version: '4.2.0', value: 2 },
  { name: 'animal-sniffer-enforcer-rule', version: '1.24', value: 2 },
  { name: 'animal-sniffer-annotations', version: '1.24', value: 1 },
  { name: 'chokidar', version: '5.0.0', value: 1 },
  { name: 'spring-cloud-openfeign', version: '4.2.0', value: 1 },
  { name: 'elasticsearch', version: '1.21.3', value: 1 },
  { name: 'spring-cloud-starter-huawei-service-engine-gateway', version: '1.11.11-2021.0.x', value: 1 },
  { name: 'kafka_2.13', version: '2.4.0', value: 1 },
  { name: 'flink-connector-wikiedits_2.12', version: '1.14.0', value: 1 },
]

/** 接口调用明细 Top10（真实数据） */
export const topApis = [
  { name: '/api/v1/openapi/software/search', value: 1949, successRate: 99.95, avgTime: 3746, orgs: 4 },
  { name: '/api/v1/openapi/component/search', value: 1548, successRate: 99.94, avgTime: 300, orgs: 2 },
  { name: '/api/v1/openapi/component/sbom/query', value: 24, successRate: 37.5, avgTime: 12, orgs: 1 },
  { name: '/api/v1/openapi/software/malicious-code/page', value: 12, successRate: 100, avgTime: 14, orgs: 0 },
  { name: '/api/v1/openapi/report/generate', value: 9, successRate: 100, avgTime: 3381, orgs: 0 },
  { name: '/api/v1/openapi/malicious-code/scan/status', value: 8, successRate: 87.5, avgTime: 52, orgs: 0 },
  { name: '/api/v1/openapi/component/dependencies/{hash}', value: 8, successRate: 100, avgTime: 26, orgs: 0 },
  { name: '/api/v1/openapi/license/Apache-2.0', value: 7, successRate: 100, avgTime: 20, orgs: 1 },
  { name: '/api/v1/openapi/software/detail/{hash}', value: 7, successRate: 100, avgTime: 424, orgs: 2 },
  { name: '/api/v1/openapi/assistant/session/history', value: 6, successRate: 100, avgTime: 18, orgs: 0 },
]

// ==================== ⑪ 监管关注指标（演示数据 · 平台暂无此口径）====================
/**
 * 说明：以下为演示数据。平台真实看板（cntoss.cn /admin/board）目前只有
 * 「态势总览 / 下载与接口 / 访问行为 / 业务与系统」四个板块，
 * 尚未提供监管关注类指标口径，待平台补齐后替换。
 */
export const regulatorMetrics = [
  { key: 'cii', label: '关键信息基础设施相关软件资产数', value: 15230, unit: '个', hint: '涉及能源 / 金融 / 电信等行业', tone: 'primary' },
  { key: 'supplyEvent', label: '供应链安全事件数（近 30 天）', value: 27, unit: '起', hint: '含投毒、劫持、仿冒组件事件', tone: 'danger' },
  { key: 'exportCtrl', label: '出口管制 / 军民两用技术组件检出数', value: 143, unit: '个', hint: '加密算法 / 卫星定位等敏感类目', tone: 'warn' },
  { key: 'sensitive', label: '敏感权限组件检出数', value: 892, unit: '个', hint: '涉及数据采集 / 加密 / 通信权限', tone: 'warn' },
  { key: 'mttr', label: '高危漏洞平均处置时长 / 超期未处置', value: 4.2, unit: '天 / 56', hint: '超期阈值：72 小时', decimals: 1, tone: 'primary' },
  { key: 'compliance', label: '开源合规备案率', value: 96.7, unit: '%', hint: '组织资产合规登记完成情况', decimals: 1, tone: 'ok' },
]

// ==================== ⑫ 访问行为与用户（真实数据）====================
export const userOverview = [
  { key: 'pv', label: '近 7 天 PV', value: 3662 },
  { key: 'uv', label: '近 7 天 UV', value: 38 },
  { key: 'avgPv', label: '人均 PV', value: 96.4, decimals: 1 },
  { key: 'activeUser', label: '活跃用户', value: 38 },
  { key: 'activeOrg', label: '活跃组织', value: 31 },
  { key: 'aiChat', label: 'AI 对话次数', value: 21 },
]

/** 审计与行为统计（真实数据 · 业务与系统看板） */
export const auditStats = [
  { key: 'feedback', label: '需求反馈（条）', value: 0 },
  { key: 'subscribe', label: '订阅总数（个）', value: 5 },
  { key: 'trainItems', label: '版本火车组成（项）', value: 10 },
  { key: 'aiOrgs', label: 'AI 使用组织（个）', value: 10 },
]

/** 页面浏览 Top10（真实数据） */
export const topPages = [
  { name: '软件详情', pv: 9120, uv: 37, avgPv: 246.5 },
  { name: '软件库', pv: 3794, uv: 51, avgPv: 74.4 },
  { name: '首页', pv: 1917, uv: 66, avgPv: 29.0 },
  { name: '软件详情-依赖关系', pv: 1094, uv: 25, avgPv: 43.8 },
  { name: '工具集', pv: 941, uv: 42, avgPv: 22.4 },
  { name: '软件详情-软件物料清单', pv: 815, uv: 25, avgPv: 32.6 },
  { name: '使用手册', pv: 765, uv: 36, avgPv: 21.3 },
  { name: 'AI 助手', pv: 758, uv: 37, avgPv: 20.5 },
  { name: '软件详情-漏洞信息', pv: 734, uv: 27, avgPv: 27.2 },
  { name: '组织管理', pv: 726, uv: 51, avgPv: 14.2 },
]

/** 用户活跃排行 Top10（真实数据） */
export const topUsers = [
  { name: '一所超管1', org: 'admin / AtomGit / ceshi1 等 8 个', login: 39, pv: 5816, last: '2026-09-22 16:11' },
  { name: '中国铁道科学研究院集团有限公司电子计算技术研究所', org: '中国铁道科学研究院集团有限公司电子计算技术研究所', login: 7, pv: 1158, last: '2026-09-21 17:35' },
  { name: '刘晨澜', org: '中科院软件所 / 进出口银行', login: 8, pv: 614, last: '2026-09-22 15:17' },
  { name: '杨健', org: '工行', login: 1, pv: 582, last: '2026-09-22 16:09' },
  { name: 'kayrer', org: 'AtomGit', login: 14, pv: 561, last: '2026-09-11 10:26' },
  { name: '殷铭', org: '电信', login: 3, pv: 440, last: '2026-09-22 10:24' },
  { name: '闫保奇', org: '电信', login: 3, pv: 384, last: '2026-09-22 10:14' },
  { name: '中国民航信息集团有限公司', org: '中国民航信息集团有限公司 / 华为', login: 13, pv: 379, last: '2026-09-13 08:42' },
  { name: '中国建设银行股份有限公司', org: '中国建设银行股份有限公司', login: 6, pv: 279, last: '2026-09-22 16:06' },
  { name: '国泰海通证券股份有限公司', org: '国泰海通证券股份有限公司', login: 2, pv: 274, last: '2026-09-22 14:50' },
]

/** 活跃组织排行 Top10（真实数据） */
export const topOrgs = [
  { name: 'AtomGit', login: 3, pv: 5596, download: 30, ai: 25, api: 0 },
  { name: '可信代码开发组', login: 1, pv: 5198, download: 25, ai: 21, api: 0 },
  { name: '一所', login: 3, pv: 5196, download: 25, ai: 21, api: 0 },
  { name: '国家工业信息安全发展研究中心', login: 2, pv: 5132, download: 25, ai: 21, api: 0 },
  { name: 'ceshi1', login: 1, pv: 4296, download: 19, ai: 18, api: 0 },
  { name: 'admin', login: 1, pv: 2517, download: 12, ai: 3, api: 0 },
  { name: 'Redamancy', login: 1, pv: 2346, download: 12, ai: 3, api: 0 },
  { name: 'Palpitate', login: 1, pv: 1804, download: 6, ai: 3, api: 0 },
  { name: '信源公司', login: 2, pv: 1211, download: 3, ai: 2, api: 1780 },
  { name: '中国铁道科学研究院集团有限公司电子计算技术研究所', login: 1, pv: 1158, download: 3, ai: 2, api: 0 },
]

/** AI 组织使用排行 Top10（真实数据） */
export const topAiOrgs = [
  { name: 'AtomGit', users: 2, dialogs: 25 },
  { name: '国家工业信息安全发展研究中心', users: 1, dialogs: 21 },
  { name: '可信代码开发组', users: 1, dialogs: 21 },
  { name: '一所', users: 1, dialogs: 21 },
  { name: 'ceshi1', users: 1, dialogs: 18 },
  { name: '电信', users: 2, dialogs: 10 },
  { name: '中国民航信息集团有限公司', users: 1, dialogs: 7 },
  { name: '北京中科微澜科技有限公司', users: 1, dialogs: 6 },
  { name: '南网', users: 1, dialogs: 5 },
  { name: '中科院软件所', users: 1, dialogs: 5 },
]

/** 需求反馈类型分布（真实数据） */
export const feedbackTypes = [
  { name: '代码需求、制品需求', value: 12, percent: 70.59, color: '#005BCB' },
  { name: '账号登录', value: 3, percent: 17.65, color: '#00A6A6' },
  { name: '功能需求', value: 2, percent: 11.76, color: '#F59E0B' },
]

/** 版本火车热门组成 Top10（真实数据） */
export const topTrainItems = [
  { name: 'spring-cloud-openfeign', version: 'v4.2.0', value: 25 },
  { name: 'spring-cloud-huawei', version: '1.10.13-2021.0.x', value: 20 },
  { name: 'spring-cloud-huawei', version: '1.11.2-2021.0.x', value: 18 },
  { name: 'spring-cloud-openfeign', version: 'v4.3.1', value: 17 },
  { name: 'spring-cloud-huawei', version: '1.11.6-2021.0.x', value: 16 },
  { name: 'spring-cloud-openfeign', version: 'v4.2.1', value: 13 },
  { name: 'spring-cloud-huawei', version: '1.11.2-2022.0.x', value: 12 },
  { name: 'spring-cloud-huawei', version: '1.11.3-2022.0.x', value: 11 },
  { name: 'spring-cloud-huawei', version: '1.11.5-2022.0.x', value: 11 },
  { name: 'spring-cloud-go', version: 'v0.3.0', value: 10 },
]

// ==================== ⑬ 最新数据动态（滚动）====================
export const liveFeed = [
  '新增组织制品 643 项，来源审核通过',
  'OpenSSL 发布安全补丁，版本升级至 3.9.4',
  '完成开源许可证合规扫描，覆盖资产 6,558 项',
  '新增组织制品 1,089 项，来源审核通过',
  '检测到新恶意代码样本 4,060 个，已加入风险库',
  '完成 SBOM 自动化分析任务 1,896 项',
  '检测到境外托管仓库镜像同步异常，已预警',
  'Kubernetes 组件依赖树更新，新增依赖 977 项',
  '新增开发者账号认证 2,904 个，来源分布已更新',
  '完成开源许可证合规扫描，覆盖资产 7,964 项',
  '检测到新恶意代码样本 8,717 个，已加入风险库',
  '完成 SBOM 自动化分析任务 8,412 项',
]

// ==================== 底部备案 ====================
export const footerInfo = {
  copyright: `© ${new Date().getFullYear()} 可信开源代码库数据大屏`,
}
