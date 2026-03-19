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

// 最新漏洞列表（CVE）
export const latestCVEList = Array.from({ length: 24 }, (_, i) => ({
  cveId: `CVE-2025-${String(10000 + i * 437).slice(-5)}`,
  component: components[i % components.length] + (i > 14 ? `@${(i % 5) + 1}.${i % 10}.${i % 20}` : ''),
  level: cveLevels[i % cveLevels.length],
  publishTime: new Date(Date.UTC(2025, 2, 19 - Math.floor(i / 2))).toISOString().slice(0, 10),
}))

// 许可证分布
export const licenseDistribution = [
  { name: 'Apache-2.0', value: 32 },
  { name: 'MIT', value: 28 },
  { name: 'GPL-3.0', value: 12 },
  { name: 'BSD-3-Clause', value: 10 },
  { name: 'LGPL-2.1', value: 6 },
  { name: '其他', value: 12 },
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
