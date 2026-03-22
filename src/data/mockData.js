// 平台规模概览
export const platformOverview = {
  repoCount: 8650,
  componentCount: 25000,
  developerCount: 892340,
  hostingPlatforms: 12,
  languageEcosystems: 28,
  huaweiCenterCoverage: 3750,
}

export const developerCountryData = [
  { name: 'China', value: 118000 },
  { name: 'United States', value: 92000 },
  { name: 'Germany', value: 48000 },
  { name: 'United Kingdom', value: 42000 },
  { name: 'Japan', value: 38000 },
  { name: 'France', value: 35000 },
  { name: 'India', value: 62000 },
  { name: 'Canada', value: 28000 },
  { name: 'Russia', value: 22000 },
  { name: 'Brazil', value: 18000 },
  { name: 'South Korea', value: 26000 },
  { name: 'Australia', value: 15000 },
  { name: 'Netherlands', value: 19000 },
  { name: 'Israel', value: 12000 },
  { name: 'Singapore', value: 8000 },
  { name: 'Spain', value: 14000 },
  { name: 'Italy', value: 16000 },
  { name: 'Sweden', value: 11000 },
  { name: 'Poland', value: 13000 },
  { name: 'Ukraine', value: 9000 },
]
export const repoCountryData = [
  { name: 'United States', value: 420000 },
  { name: 'China', value: 380000 },
  { name: 'Germany', value: 195000 },
  { name: 'United Kingdom', value: 168000 },
  { name: 'France', value: 142000 },
  { name: 'Japan', value: 128000 },
  { name: 'India', value: 98000 },
  { name: 'Canada', value: 88000 },
  { name: 'Russia', value: 72000 },
  { name: 'Brazil', value: 55000 },
  { name: 'South Korea', value: 62000 },
  { name: 'Australia', value: 48000 },
  { name: 'Netherlands', value: 52000 },
  { name: 'Israel', value: 38000 },
  { name: 'Singapore', value: 28000 },
  { name: 'Spain', value: 45000 },
  { name: 'Italy', value: 41000 },
  { name: 'Sweden', value: 35000 },
  { name: 'Poland', value: 39000 },
  { name: 'Ukraine', value: 26000 },
]

// 漏洞风险分布（高 < 中 < 低）
export const vulnerabilityRisk = [
  { name: '高危', value: 1247 },
  { name: '中危', value: 3892 },
  { name: '低危', value: 8563 },
]

// 近五年漏洞趋势
export const vulnerabilityTrend = [
  { year: '2021', count: 18520 },
  { year: '2022', count: 21240 },
  { year: '2023', count: 24890 },
  { year: '2024', count: 26100 },
  { year: '2025', count: 13702 },
]

const cveLevels = ['高危', '中危', '低危', '低危', '中危', '低危', '高危', '中危', '低危', '中危', '低危', '低危', '中危', '低危', '高危', '中危', '低危', '中危', '低危', '低危', '中危', '低危', '中危', '低危']
const components = ['openssl', 'log4j-core', 'spring-core', 'nginx', 'node-fetch', 'axios', 'lodash', 'jquery', 'tomcat', 'mysql-connector', 'guava', 'commons-text', 'fastjson', 'netty', 'redis']
const fixStatuses = ['已修复', '待修复', '部分修复', '调查中']
const vulnDescriptions = [
  '远程代码执行风险，建议升级至安全版本',
  '敏感信息泄露，需限制暴露面并打补丁',
  '拒绝服务攻击向量，影响高并发场景',
  '权限提升漏洞，需校验访问控制策略',
  '依赖链传递风险，建议 SBOM 扫描与替换',
]

// 最新漏洞列表（CVE）
export const latestCVEList = Array.from({ length: 24 }, (_, i) => ({
  cveId: `CVE-2025-${String(10000 + i * 437).slice(-5)}`,
  component: components[i % components.length] + (i > 14 ? `@${(i % 5) + 1}.${i % 10}.${i % 20}` : ''),
  level: cveLevels[i % cveLevels.length],
  publishTime: new Date(Date.UTC(2025, 2, 19 - Math.floor(i / 2))).toISOString().slice(0, 10),
  fixStatus: fixStatuses[i % fixStatuses.length],
  description: vulnDescriptions[i % vulnDescriptions.length],
}))

// 许可证分布
export const licenseDistribution = [
  { name: 'Apache-2.0', value: 32 },
  { name: 'MIT', value: 28 },
  { name: 'GPL-3.0', value: 12 },
  { name: 'BSD-3-Clause', value: 10 },
  { name: 'LGPL-2.1', value: 6 },
  { name: '其他', value: 10 },
]

// 覆盖行业领域（柱状）
export const industrySectors = [
  { name: '能源', value: 285 },
  { name: '交通', value: 198 },
  { name: '金融', value: 176 },
  { name: '通信', value: 142 },
  { name: '政务', value: 168 },
  { name: '教育', value: 312 },
  { name: '医疗', value: 95 },
  { name: '水利', value: 134 },
  { name: '工业', value: 134 },
]

// 关键行业标签云
export const keyIndustries = ['能源', '交通', '金融', '通信', '政务', '教育', '医疗', '水利', '工业']

// 开发者国家 Top10
export const developerCountryTop10 = [
  { name: '中国', value: 285000 },
  { name: '美国', value: 198000 },
  { name: '印度', value: 125000 },
  { name: '德国', value: 78000 },
  { name: '英国', value: 62000 },
  { name: '日本', value: 58000 },
  { name: '法国', value: 45000 },
  { name: '巴西', value: 42000 },
  { name: '俄罗斯', value: 38000 },
  { name: '加拿大', value: 35000 },
]

// 仓库所属国家 Top10
export const repoCountryTop10 = [
  { name: '美国', value: 892000 },
  { name: '中国', value: 654000 },
  { name: '德国', value: 312000 },
  { name: '英国', value: 285000 },
  { name: '法国', value: 198000 },
  { name: '日本', value: 176000 },
  { name: '印度', value: 165000 },
  { name: '加拿大', value: 142000 },
  { name: '俄罗斯', value: 128000 },
  { name: '巴西', value: 98000 },
]

// 最新数据动态（安全资讯，可对接 API security_news）
export const securityNews = [
  {
    id: 1,
    level: '高危',
    title: 'OpenSSL 2026安全更新：发现多个缓冲区溢出漏洞',
    content: '影响主流加密组件，涉及证书解析与加密通信场景，官方已发布修复版本',
    cve: ['CVE-2025-15467', 'CVE-2025-11187'],
    component: 'OpenSSL',
    status: '已修复',
    time: '2026-03-01 10:20:00',
  },
  {
    id: 2,
    level: '严重',
    title: 'Chrome曝光0day漏洞（CVE-2026-2441）',
    content: '漏洞已被攻击者利用，可能导致远程代码执行与数据泄露风险',
    cve: ['CVE-2026-2441'],
    component: 'Chrome',
    status: '已被利用',
    time: '2026-02-28 08:15:00',
  },
  {
    id: 3,
    level: '高危',
    title: 'Redis发现远程执行漏洞',
    content: '漏洞可能导致攻击者获取服务器控制权限，影响大规模部署实例',
    cve: ['CVE-2025-49844'],
    component: 'Redis',
    status: '待修复',
    time: '2026-02-25 14:30:00',
  },
  {
    id: 4,
    level: '高危',
    title: 'MongoDB漏洞导致敏感数据泄露风险',
    content: '攻击者可通过漏洞获取数据库凭证信息，已影响数万实例',
    cve: ['CVE-2025-14847'],
    component: 'MongoDB',
    status: '部分修复',
    time: '2026-02-20 09:40:00',
  },
  {
    id: 5,
    level: '中危',
    title: '7-Zip压缩组件存在远程代码执行风险',
    content: '通过构造恶意压缩包触发漏洞，建议及时升级版本',
    cve: ['CVE-2025-11001', 'CVE-2025-11002'],
    component: '7-Zip',
    status: '已修复',
    time: '2026-02-18 16:10:00',
  },
  {
    id: 6,
    level: '高危',
    title: 'Wing FTP Server漏洞被列入已利用漏洞清单',
    content: '漏洞已被攻击利用，可能导致敏感信息泄露及权限提升',
    cve: ['CVE-2025-47813'],
    component: 'Wing FTP Server',
    status: '已被利用',
    time: '2026-02-15 11:25:00',
  },
]

// 安全与治理
export const securityGovernance = {
  totalDetected: 285600,
  unfixed: 12480,
  fixRate: 95.6,
  sbomCoverage: 88.3,
  highRiskComponents: 3420,
}

// —— 数据分析 · 大屏 KPI（风险色：高红 / 中橙 / 低绿）——
export const analyticsKpiMetrics = [
  { id: 'repos', label: '仓库总数', value: 8650, risk: 'low' },
  { id: 'components', label: '组件总数', value: 25000, risk: 'low' },
  { id: 'developers', label: '开发者总数', value: 892340, risk: 'low' },
  {
    id: 'vulns',
    label: '漏洞总数',
    value: vulnerabilityRisk.reduce((s, x) => s + x.value, 0),
    risk: 'high',
  },
  { id: 'licenses', label: '许可证类型数', value: 156, risk: 'medium' },
]

// 主语言占比（饼图）
export const languageDistribution = [
  { name: 'Java', value: 26 },
  { name: 'JavaScript/TS', value: 22 },
  { name: 'Python', value: 14 },
  { name: 'Go', value: 11 },
  { name: 'C/C++', value: 9 },
  { name: 'Rust', value: 6 },
  { name: '其他', value: 12 },
]

// 许可证分布柱状（数量）
export const licenseBarCounts = [
  { name: 'Apache-2.0', value: 8200 },
  { name: 'MIT', value: 7100 },
  { name: 'GPL-3.0', value: 3100 },
  { name: 'BSD-3-Clause', value: 2550 },
  { name: 'LGPL-2.1', value: 1520 },
  { name: '其他', value: 2530 },
]

// 开发者活跃度（近 12 月提交趋势）
export const developerActivityTrend = [
  { label: '2024-04', value: 128400 },
  { label: '2024-05', value: 132100 },
  { label: '2024-06', value: 135800 },
  { label: '2024-07', value: 141200 },
  { label: '2024-08', value: 138900 },
  { label: '2024-09', value: 145600 },
  { label: '2024-10', value: 149200 },
  { label: '2024-11', value: 152800 },
  { label: '2024-12', value: 156400 },
  { label: '2025-01', value: 151100 },
  { label: '2025-02', value: 158300 },
  { label: '2025-03', value: 162050 },
]

// 行业覆盖雷达（与 industrySectors 对齐）
export const industryRadar = {
  indicators: industrySectors.map((d) => ({ name: d.name, max: Math.max(...industrySectors.map((x) => x.value)) + 40 })),
  values: industrySectors.map((d) => d.value),
}

// 依赖链网络（可选展示）
export const dependencyGraph = {
  nodes: [
    { id: '0', name: 'spring-boot', category: 0, symbolSize: 42 },
    { id: '1', name: 'log4j-core', category: 1, symbolSize: 36 },
    { id: '2', name: 'netty', category: 0, symbolSize: 30 },
    { id: '3', name: 'jackson', category: 0, symbolSize: 28 },
    { id: '4', name: 'tomcat', category: 2, symbolSize: 34 },
    { id: '5', name: 'openssl', category: 1, symbolSize: 38 },
  ],
  links: [
    { source: '0', target: '1' },
    { source: '0', target: '2' },
    { source: '0', target: '3' },
    { source: '4', target: '2' },
    { source: '5', target: '4' },
    { source: '1', target: '3' },
  ],
}

// 高危漏洞列表（大屏表格）
export const highVulnDashboardList = (() => {
  const hi = latestCVEList.filter((r) => r.level === '高危')
  const src = hi.length ? hi : latestCVEList
  return src.slice(0, 16).map((r, i) => ({
    ...r,
    fixStatus: r.fixStatus || fixStatuses[i % fixStatuses.length],
  }))
})()

// —— 标准报表 · 表格数据 ——
export const reportComponentStats = [
  {
    name: 'spring-core',
    version: '6.1.5',
    groupId: 'org.springframework',
    language: 'Java',
    license: 'Apache-2.0',
    industry: '政务',
  },
  {
    name: 'log4j-core',
    version: '2.23.1',
    groupId: 'org.apache.logging.log4j',
    language: 'Java',
    license: 'Apache-2.0',
    industry: '金融',
  },
  {
    name: 'axios',
    version: '1.7.4',
    groupId: 'npm',
    language: 'JavaScript',
    license: 'MIT',
    industry: '互联网',
  },
  {
    name: 'openssl',
    version: '3.2.1',
    groupId: 'openssl',
    language: 'C',
    license: 'Apache-2.0',
    industry: '通信',
  },
  {
    name: 'redis',
    version: '7.2.4',
    groupId: 'redis',
    language: 'C',
    license: 'BSD-3-Clause',
    industry: '工业',
  },
  {
    name: 'fastjson',
    version: '2.0.47',
    groupId: 'com.alibaba',
    language: 'Java',
    license: 'Apache-2.0',
    industry: '教育',
  },
]

export const reportRepoStats = [
  {
    name: 'kubernetes/kubernetes',
    platform: 'GitHub',
    country: '美国',
    industry: '云原生',
    devCount: 3120,
  },
  {
    name: 'torvalds/linux',
    platform: 'GitHub',
    country: '美国',
    industry: '基础软件',
    devCount: 18500,
  },
  {
    name: 'apache/spark',
    platform: 'GitHub',
    country: '美国',
    industry: '大数据',
    devCount: 980,
  },
  {
    name: 'microsoft/vscode',
    platform: 'GitHub',
    country: '美国',
    industry: '工具链',
    devCount: 2100,
  },
  {
    name: 'openharmony/docs',
    platform: 'Gitee',
    country: '中国',
    industry: '物联网',
    devCount: 420,
  },
]

export const reportDeveloperStats = [
  { name: 'Alex Chen', country: '中国', repoCount: 38, componentCount: 126 },
  { name: 'Jordan Lee', country: '美国', repoCount: 52, componentCount: 198 },
  { name: 'Samira Khan', country: '印度', repoCount: 29, componentCount: 87 },
  { name: 'Elena Rossi', country: '意大利', repoCount: 21, componentCount: 64 },
  { name: 'Lukas Müller', country: '德国', repoCount: 33, componentCount: 102 },
]

export const reportVulnCoverage = [
  {
    component: 'log4j-core',
    cves: 'CVE-2025-11432; CVE-2024-45105',
    level: '高危',
    fixStatus: '已修复',
  },
  {
    component: 'openssl',
    cves: 'CVE-2025-15467',
    level: '高危',
    fixStatus: '部分修复',
  },
  {
    component: 'fastjson',
    cves: 'CVE-2024-29857',
    level: '中危',
    fixStatus: '待修复',
  },
  {
    component: 'redis',
    cves: 'CVE-2025-49844',
    level: '高危',
    fixStatus: '调查中',
  },
]

export const reportAnnualTrends = [
  {
    year: '2021',
    vulnTotal: 18520,
    high: 2100,
    medium: 6200,
    low: 10220,
    newRepos: 1200,
    newComponents: 4200,
  },
  {
    year: '2022',
    vulnTotal: 21240,
    high: 2400,
    medium: 7100,
    low: 11740,
    newRepos: 1450,
    newComponents: 5100,
  },
  {
    year: '2023',
    vulnTotal: 24890,
    high: 2900,
    medium: 8400,
    low: 13590,
    newRepos: 1680,
    newComponents: 6200,
  },
  {
    year: '2024',
    vulnTotal: 26100,
    high: 3100,
    medium: 8900,
    low: 14100,
    newRepos: 1820,
    newComponents: 6800,
  },
  {
    year: '2025',
    vulnTotal: 13702,
    high: 1247,
    medium: 3892,
    low: 8563,
    newRepos: 920,
    newComponents: 3400,
  },
]
