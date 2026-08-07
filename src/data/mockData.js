// 平台规模概览
export const platformOverview = {
  repoCount: 24897,
  componentCount: 25000,
  developerCount: 892340,
  licenseCount: 727,
  languageEcosystems: 28,
  huaweiCenterCoverage: 8650,
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

// 近十年漏洞趋势
export const vulnerabilityTrend = [
  { year: '2016', count: 6100 },
  { year: '2017', count: 7320 },
  { year: '2018', count: 8165 },
  { year: '2019', count: 9240 },
  { year: '2020', count: 11890 },
  { year: '2021', count: 18520 },
  { year: '2022', count: 21240 },
  { year: '2023', count: 24890 },
  { year: '2024', count: 26100 },
  { year: '2025', count: 13702 },
]

const components = ['openssl', 'log4j-core', 'spring-core', 'nginx', 'node-fetch', 'axios', 'lodash', 'jquery', 'tomcat', 'mysql-connector', 'guava', 'commons-text', 'fastjson', 'netty', 'redis']
const fixStatuses = ['已修复', '待修复', '部分修复', '调查中']

// 最新漏洞列表（CVE）——字段与「最新漏洞数据」导出格式对齐
// 真实数据字段：comp_name / version_number / comp_vendor / comp_language / comp_platform /
//               vuln_created_at / vuln_modified_at / vuln_score / vuln_public_id / vuln_cwe_id / purl
const compVendors = ['microsoft', 'apache', 'google', 'redis', 'openjs', 'nginx', 'python', 'oracle', 'alibaba', 'square']
const compLanguages = ['Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'Python', 'Go', 'Rust', 'Shell']
const compPlatforms = ['Maven', 'NPM', 'github', 'Packagist', 'Pypi', 'CPAN', 'Nuget', 'Go', 'Debian', 'Rubygems', 'Cargo']
const vulnScores = [10.0, 9.8, 9.1, 8.8, 8.4, 7.8, 7.5, 6.9, 6.5, 5.8, 5.4, 4.9]

export const latestCVEList = Array.from({ length: 24 }, (_, i) => {
  const name = components[i % components.length]
  const vendor = compVendors[i % compVendors.length]
  const platform = compPlatforms[i % compPlatforms.length]
  const lang = compLanguages[i % compLanguages.length]
  const version = `${(i % 5) + 1}.${i % 10}.${i % 20}`
  return {
    comp_name: name,
    version_number: version,
    comp_vendor: vendor,
    comp_language: lang,
    comp_platform: platform,
    vuln_created_at: `2026-05-${String(21 + (i % 4)).padStart(2, '0')}`,
    vuln_modified_at: `2026-05-${String(24 - (i % 4)).padStart(2, '0')}`,
    vuln_score: vulnScores[i % vulnScores.length],
    vuln_public_id: `CVE-2026-${String(40000 + i * 137).slice(-5)}`,
    vuln_cwe_id: `CWE-${680 + (i % 12)}`,
    purl: platform === 'github'
      ? `pkg:github/${vendor}/${name}`
      : `pkg:${platform.toLowerCase()}/${vendor}/${name}`,
  }
})

// 许可证分布
export const licenseDistribution = [
  { name: 'Apache-2.0', value: 32 },
  { name: 'MIT', value: 28 },
  { name: 'GPL-3.0', value: 12 },
  { name: 'BSD-3-Clause', value: 10 },
  { name: 'LGPL-2.1', value: 6 },
  { name: 'MPL-2.0', value: 4 },
  { name: 'EPL-2.0', value: 3 },
  { name: 'ISC', value: 2 },
  { name: 'AGPL-3.0', value: 2 },
  { name: 'BSD-2-Clause', value: 1 },
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

// Scorecard 评分分布（10 个分值区间）
export const scorecardDistribution = [
  { name: '0-1', value: 420 },
  { name: '1-2', value: 680 },
  { name: '2-3', value: 1120 },
  { name: '3-4', value: 1580 },
  { name: '4-5', value: 1850 },
  { name: '5-6', value: 1620 },
  { name: '6-7', value: 890 },
  { name: '7-8', value: 350 },
  { name: '8-9', value: 110 },
  { name: '9-10', value: 30 },
]

// Criticality 评分分布（10 个分值区间，满分 1.0）
export const criticalityDistribution = [
  { name: '0-0.1', value: 380 },
  { name: '0.1-0.2', value: 620 },
  { name: '0.2-0.3', value: 1150 },
  { name: '0.3-0.4', value: 1680 },
  { name: '0.4-0.5', value: 1950 },
  { name: '0.5-0.6', value: 1420 },
  { name: '0.6-0.7', value: 850 },
  { name: '0.7-0.8', value: 380 },
  { name: '0.8-0.9', value: 160 },
  { name: '0.9-1.0', value: 60 },
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

// ========== 漏洞预警卡片数据 ==========
export const vulnerabilityAlertCards = [
  {
    id: 1,
    componentName: 'Deap',
    version: '1.4.3',
    language: 'Python',
    developer: 'Distributed Evolutionary Algorithms in Python',
    alertTitle: '【漏洞预警】Deap-1.4.3存在超危漏洞CVE-2026-50001',
    level: '超危',
    cveId: 'CVE-2026-50001',
    publishDate: '2025-05-04',
    description: '攻击者可通过构造恶意XML触发远程代码执行',
    affiliation: '个人',
  },
  {
    id: 2,
    componentName: 'kubernetes-sigs/controller-runtime',
    version: 'v0.22.4',
    language: 'Go',
    developer: 'Kubernetes SIGs',
    alertTitle: '【漏洞预警】kubernetes-sigs/controller-runtime-v0.22.4存在中危漏洞CVE-2026-50003',
    level: '中危',
    cveId: 'CVE-2026-50003',
    publishDate: '2025-11-03',
    description: '控制器运行时存在权限验证绕过漏洞，可能导致未授权访问',
    affiliation: '组织',
  },
  {
    id: 3,
    componentName: 'Postman Collection SDK',
    version: 'v5.0.2',
    language: 'JavaScript',
    developer: 'Postman Inc.',
    alertTitle: '【漏洞预警】Postman Collection SDK-v5.0.2存在中危漏洞CVE-2026-42308',
    level: '中危',
    cveId: 'CVE-2026-42308',
    publishDate: '2025-03-27',
    description: 'SDK中存在不安全的反序列化漏洞，可能导致远程代码执行',
    affiliation: '组织',
  },
  {
    id: 4,
    componentName: 'egg',
    version: 'v3.30.1',
    language: 'JavaScript',
    developer: 'alibaba',
    alertTitle: '【漏洞预警】egg-v3.30.1存在中危漏洞CVE-2026-42310',
    level: '中危',
    cveId: 'CVE-2026-42310',
    publishDate: '2025-01-19',
    description: '框架中间件存在路径遍历漏洞，可能导致敏感信息泄露',
    affiliation: '组织',
  },
  {
    id: 5,
    componentName: '（未显示名称）',
    version: 'v1.13.0',
    language: 'JavaScript',
    developer: 'Vanilagy',
    alertTitle: '【漏洞预警】Vanilagy-v1.13.0存在高危漏洞CVE-2026-42311',
    level: '高危',
    cveId: 'CVE-2026-42311',
    publishDate: '2025-09-02',
    description: '依赖包中存在原型链污染漏洞，可能导致远程代码执行',
    affiliation: '个人',
  },
  {
    id: 6,
    componentName: 'eslint-plugin-vue',
    version: 'v9.33.0',
    language: 'JavaScript',
    developer: 'Vue',
    alertTitle: '【漏洞预警】eslint-plugin-vue-v9.33.0存在高危漏洞CVE-2026-42311',
    level: '高危',
    cveId: 'CVE-2026-42311',
    publishDate: '2025-03-05',
    description: '插件规则解析存在代码注入风险，建议升级至安全版本',
    affiliation: '组织',
  },
  {
    id: 7,
    componentName: 'tmp',
    version: 'v0.2.5',
    language: 'JavaScript',
    developer: 'KARASZI Istvan',
    alertTitle: '【漏洞预警】tmp-v0.2.5存在高危漏洞CVE-2026-50002',
    level: '高危',
    cveId: 'CVE-2026-50002',
    publishDate: '2020-10-14',
    description: '临时文件处理存在符号链接攻击风险，可能导致权限提升',
    affiliation: '个人',
  },
  {
    id: 8,
    componentName: 'node-forge',
    version: 'v1.3.2',
    language: 'JavaScript',
    developer: 'digitalbazaar',
    alertTitle: '【漏洞预警】node-forge-v1.3.2存在高危漏洞CVE-2026-50002',
    level: '高危',
    cveId: 'CVE-2026-50002',
    publishDate: '2025-11-26',
    description: '加密库中存在缓冲区溢出漏洞，可能导致拒绝服务或远程代码执行',
    affiliation: '组织',
  },
]

// 最新数据动态（安全资讯，可对接 API security_news）——字段与「最新漏洞数据」导出格式对齐
export const securityNews = [
  {
    id: 1,
    comp_name: 'openssl',
    version_number: '3.3.1',
    comp_vendor: 'openssl',
    comp_language: 'C',
    comp_platform: 'github',
    vuln_created_at: '2026-03-01',
    vuln_modified_at: '2026-03-02',
    vuln_score: 9.8,
    vuln_public_id: 'CVE-2026-43075',
    vuln_cwe_id: 'CWE-680',
    purl: 'pkg:github/openssl/openssl',
  },
  {
    id: 2,
    comp_name: 'log4j-core',
    version_number: '2.23.1',
    comp_vendor: 'apache',
    comp_language: 'Java',
    comp_platform: 'Maven',
    vuln_created_at: '2026-02-28',
    vuln_modified_at: '2026-02-28',
    vuln_score: 8.4,
    vuln_public_id: 'CVE-2026-40367',
    vuln_cwe_id: 'CWE-502',
    purl: 'pkg:maven/apache/log4j-core',
  },
  {
    id: 3,
    comp_name: 'redis',
    version_number: '7.2.4',
    comp_vendor: 'redis',
    comp_language: 'C',
    comp_platform: 'github',
    vuln_created_at: '2026-02-25',
    vuln_modified_at: '2026-02-26',
    vuln_score: 7.8,
    vuln_public_id: 'CVE-2026-49844',
    vuln_cwe_id: 'CWE-661',
    purl: 'pkg:github/redis/redis',
  },
  {
    id: 4,
    comp_name: 'mongodb',
    version_number: '7.0.5',
    comp_vendor: 'mongodb',
    comp_language: 'C++',
    comp_platform: 'github',
    vuln_created_at: '2026-02-20',
    vuln_modified_at: '2026-02-21',
    vuln_score: 9.1,
    vuln_public_id: 'CVE-2026-14847',
    vuln_cwe_id: 'CWE-89',
    purl: 'pkg:github/mongodb/mongo',
  },
  {
    id: 5,
    comp_name: 'sevenzip',
    version_number: '24.0.0',
    comp_vendor: '7-zip',
    comp_language: 'C++',
    comp_platform: 'github',
    vuln_created_at: '2026-02-18',
    vuln_modified_at: '2026-02-18',
    vuln_score: 7.5,
    vuln_public_id: 'CVE-2026-11001',
    vuln_cwe_id: 'CWE-680',
    purl: 'pkg:github/ip7z/7zip',
  },
  {
    id: 6,
    comp_name: 'wing-ftp-server',
    version_number: '7.2.5',
    comp_vendor: 'wftpserver',
    comp_language: 'C++',
    comp_platform: 'github',
    vuln_created_at: '2026-02-15',
    vuln_modified_at: '2026-02-16',
    vuln_score: 8.8,
    vuln_public_id: 'CVE-2026-47813',
    vuln_cwe_id: 'CWE-269',
    purl: 'pkg:github/wftpserver/wingftpserver',
  },
]

// 安全与治理
export const securityGovernance = {
  totalDetected: 285600,
  highCount: 1247,         // 高危漏洞数（替代未修复漏洞数）
  maliciousCode: 86,       // 恶意代码检出数（替代漏洞修复率）
  sbomCoverage: 88.3,
  signatureCoverage: 92.6,
}

// 含恶意代码的软件列表（字段：软件/恶意类别/恶意类型/恶意类型小类/威胁等级/置信度/检测结果）
export const malwareSoftwareList = [
  {
    software: '2.43.0.tar.gz',
    category: 'Java',
    type: '恶意行为',
    subType: '木马下载执行',
    threatLevel: '中危',
    confidence: '高',
    result: '疑似存在木马下载执行, 包含: 文件下载行为,命令调用执行行为',
  },
  {
    software: 'fastjson-1.2.47.jar',
    category: 'Java',
    type: '恶意行为',
    subType: '反序列化利用',
    threatLevel: '高危',
    confidence: '高',
    result: '疑似存在反序列化利用链, 包含: JNDI 注入行为,反射调用行为',
  },
  {
    software: 'node_modules.tar.gz',
    category: 'JavaScript',
    type: '恶意代码',
    subType: '信息窃取',
    threatLevel: '高危',
    confidence: '中',
    result: '疑似存在敏感信息窃取, 包含: 环境变量读取,网络外传行为',
  },
  {
    software: 'setup.exe',
    category: 'C/C++',
    type: '恶意行为',
    subType: '权限提升',
    threatLevel: '中危',
    confidence: '中',
    result: '疑似存在权限提升行为, 包含: 注册表篡改,计划任务创建',
  },
  {
    software: 'redis-7.2.4.tar.gz',
    category: 'C',
    type: '恶意行为',
    subType: '后门驻留',
    threatLevel: '低危',
    confidence: '低',
    result: '疑似存在后门驻留行为, 包含: 异常网络端口监听',
  },
]

// —— 数据分析 · 大屏 KPI（风险色：高红 / 中橙 / 低绿）——
export const analyticsKpiMetrics = [
  { id: 'repos', label: '软件制品数', value: 24897, risk: 'low' },
  { id: 'components', label: '制品总数', value: 25000, risk: 'low' },
  { id: 'developers', label: '开发者总数', value: 892340, risk: 'low' },
  {
    id: 'vulns',
    label: '漏洞总数',
    value: vulnerabilityRisk.reduce((s, x) => s + x.value, 0),
    risk: 'high',
  },
  { id: 'licenses', label: '开源许可证', value: 727, risk: 'medium' },
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
  { name: 'MPL-2.0', value: 940 },
  { name: 'EPL-2.0', value: 620 },
  { name: 'ISC', value: 410 },
  { name: 'AGPL-3.0', value: 260 },
  { name: 'BSD-2-Clause', value: 180 },
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

// 漏洞新增趋势（近 12 月）
export const vulnAddedTrend = [
  { label: '2025-08', value: 1860 },
  { label: '2025-09', value: 2140 },
  { label: '2025-10', value: 1980 },
  { label: '2025-11', value: 2420 },
  { label: '2025-12', value: 2260 },
  { label: '2026-01', value: 2680 },
  { label: '2026-02', value: 2540 },
  { label: '2026-03', value: 2910 },
  { label: '2026-04', value: 2760 },
  { label: '2026-05', value: 3120 },
  { label: '2026-06', value: 2980 },
  { label: '2026-07', value: 3350 },
]

// 行业覆盖雷达（与 industrySectors 对齐）
export const industryRadar = {
  indicators: industrySectors.map((d) => ({ name: d.name, max: Math.max(...industrySectors.map((x) => x.value)) + 40 })),
  values: industrySectors.map((d) => d.value),
}

// 依赖链网络（多软件切换：键为软件名；节点分类 0=父节点 / 1=二级依赖 / 2=三级依赖）
// 字段对齐组件依赖接口：component_name/group_id/version/has_children
export const dependencyGraphs = {
  'Spring Boot': {
    nodes: [
      { id: '0', name: 'spring-boot 3.5.12', category: 0, symbolSize: 46 },
      { id: '1', name: 'spring-boot-starter-web', category: 1, symbolSize: 38 },
      { id: '2', name: 'spring-boot-starter-data-jpa', category: 1, symbolSize: 38 },
      { id: '3', name: 'spring-boot-starter-security', category: 1, symbolSize: 38 },
      { id: '4', name: 'spring-boot-starter-test', category: 1, symbolSize: 38 },
      { id: '5', name: 'spring-boot-starter-actuator', category: 1, symbolSize: 36 },
      { id: '6', name: 'spring-web 6.2.17', category: 2, symbolSize: 30 },
      { id: '7', name: 'spring-webmvc 6.2.17', category: 2, symbolSize: 28 },
      { id: '8', name: 'spring-context 6.2.17', category: 2, symbolSize: 28 },
      { id: '9', name: 'spring-core 6.2.17', category: 2, symbolSize: 30 },
      { id: '10', name: 'spring-data-jpa 3.5.10', category: 2, symbolSize: 26 },
      { id: '11', name: 'hibernate-core 6.6.44.Final', category: 2, symbolSize: 26 },
      { id: '12', name: 'spring-security-core 6.5.9', category: 2, symbolSize: 26 },
      { id: '13', name: 'spring-security-web 6.5.9', category: 2, symbolSize: 24 },
      { id: '14', name: 'spring-aop 6.2.17', category: 2, symbolSize: 24 },
      { id: '15', name: 'jackson-databind 2.19.4', category: 2, symbolSize: 26 },
      { id: '16', name: 'spring-test 6.2.17', category: 2, symbolSize: 24 },
      { id: '17', name: 'log4j-core 2.24.3', category: 2, symbolSize: 26 },
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '0', target: '4' },
      { source: '0', target: '5' },
      { source: '1', target: '6' },
      { source: '1', target: '15' },
      { source: '6', target: '7' },
      { source: '7', target: '8' },
      { source: '8', target: '9' },
      { source: '2', target: '10' },
      { source: '10', target: '11' },
      { source: '11', target: '9' },
      { source: '3', target: '12' },
      { source: '12', target: '13' },
      { source: '12', target: '9' },
      { source: '4', target: '16' },
      { source: '16', target: '9' },
      { source: '5', target: '8' },
      { source: '9', target: '14' },
      { source: '8', target: '17' },
    ],
  },
  Redis: {
    nodes: [
      { id: '0', name: 'redis 7.2.4', category: 0, symbolSize: 46 },
      { id: '1', name: 'hiredis 1.2.0', category: 1, symbolSize: 34 },
      { id: '2', name: 'jemalloc 5.3.0', category: 1, symbolSize: 34 },
      { id: '3', name: 'openssl 3.3.0', category: 1, symbolSize: 34 },
      { id: '4', name: 'libuv 1.48.0', category: 1, symbolSize: 32 },
      { id: '5', name: 'lua 5.1.5', category: 2, symbolSize: 28 },
      { id: '6', name: 'libevent 2.1.12', category: 2, symbolSize: 26 },
      { id: '7', name: 'libunwind 1.8.0', category: 2, symbolSize: 26 },
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '0', target: '4' },
      { source: '0', target: '5' },
      { source: '1', target: '6' },
      { source: '2', target: '7' },
      { source: '4', target: '6' },
    ],
  },
  'Vue.js': {
    nodes: [
      { id: '0', name: 'vue 3.5.13', category: 0, symbolSize: 46 },
      { id: '1', name: '@vue/compiler-sfc 3.5.13', category: 1, symbolSize: 36 },
      { id: '2', name: '@vue/compiler-dom 3.5.13', category: 1, symbolSize: 34 },
      { id: '3', name: '@vue/runtime-dom 3.5.13', category: 1, symbolSize: 36 },
      { id: '4', name: '@vue/runtime-core 3.5.13', category: 1, symbolSize: 34 },
      { id: '5', name: '@vue/reactivity 3.5.13', category: 1, symbolSize: 32 },
      { id: '6', name: '@vue/shared 3.5.13', category: 2, symbolSize: 28 },
      { id: '7', name: '@vue/server-renderer 3.5.13', category: 2, symbolSize: 28 },
      { id: '8', name: '@vue/compiler-core 3.5.13', category: 2, symbolSize: 30 },
      { id: '9', name: 'estree-walker 2.0.2', category: 2, symbolSize: 24 },
      { id: '10', name: 'source-map-js 1.2.0', category: 2, symbolSize: 24 },
      { id: '11', name: 'magic-string 0.30.10', category: 2, symbolSize: 24 },
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '0', target: '4' },
      { source: '0', target: '5' },
      { source: '1', target: '8' },
      { source: '2', target: '8' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '5', target: '6' },
      { source: '7', target: '4' },
      { source: '8', target: '9' },
      { source: '8', target: '10' },
      { source: '8', target: '11' },
    ],
  },
  OpenSSL: {
    nodes: [
      { id: '0', name: 'openssl 3.3.0', category: 0, symbolSize: 46 },
      { id: '1', name: 'libcrypto 3.3.0', category: 1, symbolSize: 36 },
      { id: '2', name: 'libssl 3.3.0', category: 1, symbolSize: 36 },
      { id: '3', name: 'zlib 1.3.1', category: 1, symbolSize: 30 },
      { id: '4', name: 'crypto-rand', category: 2, symbolSize: 26 },
      { id: '5', name: 'libcrypto-sha', category: 2, symbolSize: 26 },
      { id: '6', name: 'libcrypto-aes', category: 2, symbolSize: 26 },
      { id: '7', name: 'providers', category: 2, symbolSize: 24 },
      { id: '8', name: 'engines', category: 2, symbolSize: 24 },
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '1', target: '4' },
      { source: '1', target: '5' },
      { source: '1', target: '6' },
      { source: '2', target: '1' },
      { source: '1', target: '7' },
      { source: '1', target: '8' },
    ],
  },
  Nginx: {
    nodes: [
      { id: '0', name: 'nginx 1.26.0', category: 0, symbolSize: 46 },
      { id: '1', name: 'pcre2 10.44', category: 1, symbolSize: 34 },
      { id: '2', name: 'zlib 1.3.1', category: 1, symbolSize: 32 },
      { id: '3', name: 'openssl 3.3.0', category: 1, symbolSize: 36 },
      { id: '4', name: 'http-rewrite-module', category: 2, symbolSize: 28 },
      { id: '5', name: 'http-gzip-module', category: 2, symbolSize: 26 },
      { id: '6', name: 'http-ssl-module', category: 2, symbolSize: 28 },
      { id: '7', name: 'core-module', category: 2, symbolSize: 30 },
      { id: '8', name: 'http-core-module', category: 2, symbolSize: 28 },
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '0', target: '7' },
      { source: '0', target: '8' },
      { source: '1', target: '4' },
      { source: '2', target: '5' },
      { source: '3', target: '6' },
      { source: '7', target: '8' },
    ],
  },
}
// 默认展示第一个软件（兼容旧引用）
export const dependencyGraph = dependencyGraphs['Spring Boot']

// 高危漏洞列表（大屏表格）——按 CVSS 评分 ≥ 7 筛选，字段与「最新漏洞数据」导出格式对齐
export const highVulnDashboardList = (() => {
  const hi = latestCVEList.filter((r) => Number(r.vuln_score) >= 7)
  const src = hi.length ? hi : latestCVEList
  return src.slice(0, 16)
})()

// —— 标准报表 · 表格数据 ——
// 制品统计表：字段对齐组件库表头（制品名称/制品版本/groupId/编程语言/开源许可证/出入库状态）
export const reportComponentStats = [
  {
    name: 'spring-core',
    version: '6.1.5',
    groupId: 'org.springframework',
    language: 'Java',
    license: 'Apache-2.0',
    shelfStatus: '已入库',
  },
  {
    name: 'log4j-core',
    version: '2.23.1',
    groupId: 'org.apache.logging.log4j',
    language: 'Java',
    license: 'Apache-2.0',
    shelfStatus: '已入库',
  },
  {
    name: 'axios',
    version: '1.7.4',
    groupId: 'npm',
    language: 'JavaScript',
    license: 'MIT',
    shelfStatus: '已入库',
  },
  {
    name: 'openssl',
    version: '3.2.1',
    groupId: 'openssl',
    language: 'C',
    license: 'Apache-2.0',
    shelfStatus: '待入库',
  },
  {
    name: 'redis',
    version: '7.2.4',
    groupId: 'redis',
    language: 'C',
    license: 'BSD-3-Clause',
    shelfStatus: '已入库',
  },
  {
    name: 'fastjson',
    version: '2.0.47',
    groupId: 'com.alibaba',
    language: 'Java',
    license: 'Apache-2.0',
    shelfStatus: '待入库',
  },
]

// 软件统计表：字段对齐软件库表头（软件名称/最新版本评分/行业分类/最新版本漏洞数/开发商/编程语言）
export const reportRepoStats = [
  {
    name: 'Kubernetes',
    score: 9.1,
    industry: '云原生',
    vulnCount: 12,
    developer: 'CNCF',
    lang: 'Go',
  },
  {
    name: 'Linux',
    score: 9.6,
    industry: '基础软件',
    vulnCount: 8,
    developer: 'Linus Torvalds',
    lang: 'C',
  },
  {
    name: 'Apache Spark',
    score: 8.7,
    industry: '大数据',
    vulnCount: 5,
    developer: 'Apache',
    lang: 'Scala',
  },
  {
    name: 'VS Code',
    score: 9.3,
    industry: '工具链',
    vulnCount: 3,
    developer: 'Microsoft',
    lang: 'TypeScript',
  },
  {
    name: 'OpenHarmony',
    score: 8.2,
    industry: '物联网',
    vulnCount: 7,
    developer: 'OpenAtom',
    lang: 'C++',
  },
]

export const reportDeveloperStats = [
  { name: 'Alex Chen', country: '中国', repoCount: 38, componentCount: 126 },
  { name: 'Jordan Lee', country: '美国', repoCount: 52, componentCount: 198 },
  { name: 'Samira Khan', country: '印度', repoCount: 29, componentCount: 87 },
  { name: 'Elena Rossi', country: '意大利', repoCount: 21, componentCount: 64 },
  { name: 'Lukas Müller', country: '德国', repoCount: 33, componentCount: 102 },
]

// 漏洞覆盖组件表——字段与「最新漏洞数据」导出格式对齐
export const reportVulnCoverage = [
  {
    comp_name: 'log4j-core',
    version_number: '2.23.1',
    comp_vendor: 'apache',
    comp_language: 'Java',
    comp_platform: 'Maven',
    vuln_created_at: '2026-05-21',
    vuln_modified_at: '2026-05-22',
    vuln_score: 9.1,
    vuln_public_id: 'CVE-2026-11432',
    vuln_cwe_id: 'CWE-502',
    purl: 'pkg:maven/apache/log4j-core',
  },
  {
    comp_name: 'openssl',
    version_number: '3.3.1',
    comp_vendor: 'openssl',
    comp_language: 'C',
    comp_platform: 'github',
    vuln_created_at: '2026-05-21',
    vuln_modified_at: '2026-05-23',
    vuln_score: 8.4,
    vuln_public_id: 'CVE-2026-15467',
    vuln_cwe_id: 'CWE-680',
    purl: 'pkg:github/openssl/openssl',
  },
  {
    comp_name: 'fastjson',
    version_number: '2.0.47',
    comp_vendor: 'alibaba',
    comp_language: 'Java',
    comp_platform: 'Maven',
    vuln_created_at: '2026-05-22',
    vuln_modified_at: '2026-05-24',
    vuln_score: 7.8,
    vuln_public_id: 'CVE-2026-29857',
    vuln_cwe_id: 'CWE-89',
    purl: 'pkg:maven/alibaba/fastjson',
  },
  {
    comp_name: 'redis',
    version_number: '7.2.4',
    comp_vendor: 'redis',
    comp_language: 'C',
    comp_platform: 'github',
    vuln_created_at: '2026-05-23',
    vuln_modified_at: '2026-05-24',
    vuln_score: 9.8,
    vuln_public_id: 'CVE-2026-49844',
    vuln_cwe_id: 'CWE-661',
    purl: 'pkg:github/redis/redis',
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
