/**
 * 扫描引擎注册表
 * 依据《基于可信标准的工具研讨1118》的结论：
 *  - SCA（成分 / 漏洞 / 许可证）：华科 SCA、一所「链图 SBOM 平台」、一所「DeepSBOM」（默认）
 *  - 版权与许可证：目前仅有「可信代码库自研工具」（后续可接入 ScanCode 等）
 *  - 恶意代码：目前仅有「可信代码库自研工具」（后续可接入一所 / 中科院工具）
 *
 * 设计要点：
 *  1. 引擎与扫描类型解耦：一个引擎可覆盖多种类型，类型下可挂多个引擎；
 *  2. 默认值集中在此，页面上只做「用默认 / 改选」；
 *  3. 指标到引擎能力的映射（INDICATOR_CAPABILITY）供「基线核查」判断哪些项能自动判定。
 */

/** 三类扫描（与列表列一一对应） */
export const SCAN_TYPES = [
  { key: 'sca', label: 'SCA 成分与漏洞', short: 'SCA', desc: '成分识别、漏洞检测、许可证识别' },
  { key: 'copyright', label: '版权与许可证', short: '版权', desc: '检测开源许可证识别、版权归属与许可证条款冲突，当前使用可信代码库自研工具' },
  { key: 'malware', label: '恶意代码', short: '恶意代码', desc: '恶意代码、后门与供应链投毒检测' },
]

/** 引擎注册表 */
export const SCAN_ENGINES = [
  {
    id: 'deepsbom',
    name: 'DeepSBOM',
    vendor: '一所',
    version: '1.4.2',
    types: ['sca'],
    capabilities: ['SBOM 生成', '成分识别', '漏洞检测', '许可证识别'],
    note: '1118 研讨结论：作为 SCA 与许可证检测的默认引擎',
  },
  {
    id: 'liantu',
    name: '链图 SBOM 平台',
    vendor: '一所',
    version: '2.1.0',
    types: ['sca'],
    capabilities: ['SBOM 生成与校验', '成分识别', '依赖下载地址确认'],
    note: '适合需要 SBOM 作为交付物、并核对依赖来源的场景',
  },
  {
    id: 'huake',
    name: '华科 SCA',
    vendor: '华中科技大学',
    version: '3.5.0',
    types: ['sca'],
    capabilities: ['漏洞检测', '许可证冲突分析', '二进制成分分析'],
    note: '历史默认引擎，保留可选',
  },
  {
    id: 'self',
    name: '可信代码库自研工具',
    vendor: '平台自研',
    version: '1.0.0',
    types: ['copyright', 'malware'],
    capabilities: ['版权与许可证核查', '恶意代码检测', '敏感信息检测'],
    note: '版权与恶意代码当前唯一可用引擎',
  },
]

/** 各类扫描的默认引擎（可在页面上按批次 / 单条覆盖） */
export const DEFAULT_SCAN_CONFIG = {
  sca: 'deepsbom',
  copyright: 'self',
  malware: 'self',
}

/** 某个扫描类型下可选引擎 */
export function enginesOf(type) {
  return SCAN_ENGINES.filter((e) => e.types.includes(type))
}

export function engineById(id) {
  return SCAN_ENGINES.find((e) => e.id === id) || null
}

export function engineName(id) {
  return engineById(id)?.name || '—'
}

/** 取扫描配置中的引擎（缺省回落到默认值） */
export function engineOfConfig(config, type) {
  const id = (config && config[type]) || DEFAULT_SCAN_CONFIG[type]
  return engineById(id) || engineById(DEFAULT_SCAN_CONFIG[type]) || null
}

/**
 * 指标 → 可自动判定的扫描依赖。
 * auto=true 表示该指标可由扫描引擎直接给出结论；auto=false 需人工判定。
 * type 为依赖的扫描类型（sca / copyright / malware），null 表示无工具支持。
 */
export const INDICATOR_CAPABILITY = {
  // 代码技术安全
  'bl-01': { type: 'sca', auto: true, note: '超危漏洞数量（CVSS 9.0-10.0，未修复）' },
  'bl-02': { type: 'sca', auto: false, note: '漏洞密度需代码千行数，当前人工核算' },
  'bl-03': { type: null, auto: false, note: '依赖修复日期数据，暂人工' },
  'bl-04': { type: null, auto: false, note: '依赖修复日期数据，暂人工' },
  'bl-05': { type: 'malware', auto: true, note: '恶意代码检测（自研引擎）' },
  'bl-06': { type: 'sca', auto: true, note: '依赖项安全（成分与漏洞）' },
  'bl-07': { type: 'malware', auto: true, note: '硬编码凭证与敏感信息' },
  'bl-08': { type: 'sca', auto: false, note: '下载/分发完整性，需校验 https 与签名' },
  // 合法合规
  'bl-09': { type: 'copyright', auto: true, note: '许可证是否明确' },
  'bl-10': { type: 'copyright', auto: false, note: '知识产权风险需法务判定' },
  'bl-11': { type: null, auto: false, note: '违法与不良信息需人工核查' },
  // 供应韧性
  'bl-12': { type: null, auto: false, note: '版本发布状态（Tag 字段辅助）' },
  'bl-13': { type: 'sca', auto: true, note: '源码可获取（依赖下载地址确认）' },
  'bl-14': { type: null, auto: false, note: '持续供应能力需人工判定' },
  'bl-15': { type: null, auto: false, note: '衰退期判定（近 24 个月无正式版本需人工确认）' },
}

/** 基线指标 id 列表（顺序即界面上展示顺序） */
export const BASELINE_IDS = Object.keys(INDICATOR_CAPABILITY)
