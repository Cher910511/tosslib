/**
 * 扫描节点与工具注册表（按 0929 对接一所后的结论整理）
 *
 * 设计要点：
 *  1. 页面上的「扫描流程」按**节点**展示，一个节点对应一类产出物；
 *  2. 节点与工具解耦：一个节点可挂多个工具（如漏洞/依赖/SBOM/许可证/组件详情都可用
 *     华科 SCA、链图 SBOM、DeepSBOM 三家），只有一个可用工具时下拉里就只有一项；
 *  3. 演示环境只有三路可模拟的进度（成分 sca / 版权 copyright / 恶意代码 malware），
 *     所以每个节点带 progress 字段，指向它跟随哪一路进度；
 *  4. INDICATOR_CAPABILITY 仍按「成分/版权/恶意代码」三类描述指标能力，
 *     需要取引擎时用 nodeForCapabilityType() 换算到节点。
 */

/** 12 个扫描节点（顺序即流程条上的展示顺序） */
export const SCAN_NODES = [
  {
    key: 'profile',
    label: '基础画像',
    short: '基础画像',
    data: 'README、开发商、版本描述',
    desc: 'README、主语言、开发商、发布日期、版本描述',
    tools: ['github-api'],
    progress: 'sca',
  },
  {
    key: 'copyright',
    label: '版权报告',
    short: '版权报告',
    data: 'Copyright 版权归属',
    desc: '版权归属与版权声明识别，输出 Copyright 报告',
    tools: ['scancode'],
    progress: 'copyright',
  },
  {
    key: 'codesize',
    label: '代码量',
    short: '代码量',
    data: '千行代码量统计',
    desc: '千行代码量统计',
    tools: ['cloc'],
    progress: 'sca',
  },
  {
    key: 'eol',
    label: '社区 EOL 日期',
    short: 'EOL',
    data: '停止维护日期',
    desc: '开源软件社区版停止官方维护与支持的截止日期',
    tools: ['eol-db'],
    progress: 'copyright',
  },
  {
    key: 'rules',
    label: '综合画像',
    short: '综合画像',
    data: '软件类别、生命力、集成风险',
    desc: '开源软件综合画像：软件类别、软件生命力、集成风险',
    tools: ['rule-kb'],
    progress: 'copyright',
  },
  {
    key: 'vuln',
    label: '漏洞信息',
    short: '漏洞',
    data: '漏洞等级、修复建议',
    desc: '超危漏洞、修复建议与关联组件',
    tools: ['huake', 'liantu', 'deepsbom'],
    progress: 'sca',
  },
  {
    key: 'malware',
    label: '恶意代码',
    short: '恶意代码',
    data: '恶意代码、后门、投毒',
    desc: '恶意代码、后门与供应链投毒检测',
    tools: ['huawei-malware'],
    progress: 'malware',
  },
  {
    key: 'sbom',
    label: '软件物料清单',
    short: 'SBOM',
    data: '依赖关系、SBOM、PURL',
    desc: '依赖树、PURL、组件依赖关系图谱',
    tools: ['huake', 'liantu', 'deepsbom'],
    progress: 'sca',
  },
  {
    key: 'contributors',
    label: '贡献者信息',
    short: '贡献者',
    data: '国家及组织分布',
    desc: '贡献者国家分布与组织分布',
    tools: ['contributor'],
    progress: 'copyright',
  },
  {
    key: 'license',
    label: '许可证信息',
    short: '许可证',
    data: '主许可证、许可证冲突',
    desc: '主许可证、依赖许可证列表与冲突分析',
    tools: ['huake', 'liantu', 'deepsbom'],
    progress: 'copyright',
  },
  {
    key: 'sensitive',
    label: '敏感信息',
    short: '敏感信息',
    data: '硬编码凭证、密钥泄露',
    desc: '扫描源码中的硬编码密钥、口令与敏感配置泄露',
    tools: ['sensitive-scan'],
    progress: 'malware',
  },
  {
    key: 'content',
    label: '内容安全',
    short: '内容安全',
    data: '意识形态、不良信息',
    desc: '不良信息与意识形态风险检测',
    tools: ['shumei', 'yisuo-content'],
    progress: 'copyright',
  },
]

/** 工具注册表 */
export const SCAN_ENGINES = [
  {
    id: 'github-api',
    name: '第三方公共 API',
    vendor: 'GitHub / AtomGit API',
    version: 'v3',
    nodes: ['profile'],
    capabilities: ['README', '主语言识别', '开发商识别', '版本描述'],
    note: 'README、主语言、开发商、版本描述均由公共 API 获取；Gitee / GitLab 无对应接口时回落自建爬虫',
  },
  {
    id: 'scancode',
    name: 'ScanCode Toolkit',
    vendor: '自研部署',
    version: '32.0',
    nodes: ['copyright'],
    capabilities: ['Copyright 报告', '许可证文本识别'],
    note: '自部署的开源合规扫描引擎，产出 copyright 报告',
  },
  {
    id: 'cloc',
    name: 'cloc 代码统计',
    vendor: '自研部署',
    version: '1.98',
    nodes: ['codesize'],
    capabilities: ['代码行数', '按语言拆分'],
    note: '本地部署，统计千行代码量（KL）',
  },
  {
    id: 'eol-db',
    name: '生命周期情报库',
    vendor: '自建',
    version: '1.0',
    nodes: ['eol'],
    capabilities: ['社区 EOL 日期'],
    note: '参考 endoflife.date 规则自建，提供社区 EOL 日期',
  },
  {
    id: 'rule-kb',
    name: '治理规则知识库',
    vendor: '自建',
    version: '1.0',
    nodes: ['rules'],
    capabilities: ['软件类别', '软件生命力', '集成风险'],
    note: '参考厂商给出的判定规则：软件类别由文档 + AI 处理，生命力三态，集成风险按主许可证划分',
  },
  {
    id: 'huake',
    name: '华科 SCA',
    vendor: '华中科技大学',
    version: '3.5.0',
    nodes: ['vuln', 'sbom', 'license'],
    capabilities: ['漏洞检测', '成分识别', '依赖分析', '许可证识别'],
    note: '默认用于漏洞信息、软件物料清单与许可证信息',
  },
  {
    id: 'liantu',
    name: '链图 SBOM 平台',
    vendor: '一所',
    version: '2.1.0',
    nodes: ['vuln', 'sbom', 'license'],
    capabilities: ['SBOM 生成与校验', '成分识别', '依赖下载地址确认'],
    note: '适合以 SBOM 作为交付物、需要核对依赖来源的场景',
  },
  {
    id: 'deepsbom',
    name: 'DeepSBOM',
    vendor: '一所',
    version: '1.4.2',
    nodes: ['vuln', 'sbom', 'license'],
    capabilities: ['SBOM 生成', '成分识别', '漏洞检测', '许可证识别'],
    note: '一所 SBOM 平台，可作为备选工具',
  },
  {
    id: 'huawei-malware',
    name: '华为云恶意代码扫描',
    vendor: '华为云',
    version: '2.0',
    nodes: ['malware'],
    capabilities: ['恶意代码检测', '后门检测', '供应链投毒检测'],
    note: '当前唯一可用引擎；并发能力受限，大批量需排队',
  },
  {
    id: 'contributor',
    name: '贡献者画像采集',
    vendor: '自建',
    version: '1.0',
    nodes: ['contributors'],
    capabilities: ['贡献者国家分布', '贡献者组织分布'],
    note: '自建采集工具，Gitee / GitLab 暂无方案时由本地画像库补齐',
  },
  {
    id: 'sensitive-scan',
    name: '敏感信息检测',
    vendor: '自建',
    version: '1.0',
    nodes: ['sensitive'],
    capabilities: ['硬编码凭证', '密钥泄露', '敏感配置'],
    note: '自建规则引擎，扫描源码与配置文件中的硬编码密钥、口令',
  },
  {
    id: 'shumei',
    name: '数美检测',
    vendor: '数美科技',
    version: '3.0',
    nodes: ['content'],
    capabilities: ['不良信息检测', '意识形态风险'],
    note: '第三方内容安全服务，检出内容按人工复核把关',
  },
  {
    id: 'yisuo-content',
    name: '一所内容安全检测',
    vendor: '一所',
    version: '1.0',
    nodes: ['content'],
    capabilities: ['不良信息检测', '意识形态风险'],
    note: '一所提供的第三方检测能力，可作为数美检测的备选',
  },
]

/** 各节点的默认工具 */
export const DEFAULT_SCAN_CONFIG = SCAN_NODES.reduce((acc, node) => {
  acc[node.key] = node.tools[0]
  return acc
}, {})

/**
 * 联动组：这几个节点共用同一套工具（华科 SCA / 链图 SBOM / DeepSBOM 三家能力互通），
 * 一次选择即同时作用于组内全部节点，弹窗里只出现一个下拉，不做逐项拆分。
 */
export const SCAN_LINK_GROUPS = [
  {
    key: 'comp-license',
    label: '成分与许可证类工具',
    desc: '该工具同时用于下列节点，选择后一并生效（三家工具能力互通，不拆开单独配置）',
    tools: ['huake', 'liantu', 'deepsbom'],
    nodes: ['vuln', 'sbom', 'license'],
  },
]

/** 节点所属联动组（无则返回 null） */
export function groupOfNode(nodeKey) {
  return SCAN_LINK_GROUPS.find((g) => g.nodes.includes(nodeKey)) || null
}

/** 联动组内节点名（用于弹窗里的说明文案） */
export function groupNodeLabels(group) {
  return group.nodes
    .map((key) => SCAN_NODES.find((n) => n.key === key)?.label || key)
    .join('、')
}

/** 指标能力类型（成分/版权/恶意代码）→ 取哪个节点的引擎配置 */
export const CAPABILITY_NODE = {
  sca: 'vuln',
  copyright: 'license',
  malware: 'malware',
}

export function nodeForCapabilityType(type) {
  return CAPABILITY_NODE[type] || null
}

/** 某节点下可选工具 */
export function enginesOf(nodeKey) {
  return SCAN_ENGINES.filter((e) => (e.nodes || []).includes(nodeKey))
}

export function nodeByKey(key) {
  return SCAN_NODES.find((n) => n.key === key) || null
}

export function engineById(id) {
  return SCAN_ENGINES.find((e) => e.id === id) || null
}

export function engineName(id) {
  return engineById(id)?.name || '—'
}

/**
 * 对外展示名：自研 / 自建的工具不暴露具体名称，统一显示「可信开源代码库工具」，
 * 第三方工具仍显示各自名称。
 */
export function engineDisplayName(id) {
  const engine = engineById(id)
  if (!engine) return '—'
  const vendor = engine.vendor || ''
  const internal = vendor.includes('自研') || vendor.includes('自建')
  return internal ? '可信开源代码库工具' : engine.name
}

/** 取配置里某节点的工具（缺省回落到该节点的默认工具） */
export function engineOfConfig(config, nodeKey) {
  const fallback = DEFAULT_SCAN_CONFIG[nodeKey]
  const id = (config && config[nodeKey]) || fallback
  const hit = engineById(id)
  if (hit && (hit.nodes || []).includes(nodeKey)) return hit
  return engineById(fallback) || null
}

/** 兼容旧配置：把 { sca, copyright, malware } 迁移为按节点配置 */
export function normalizeScanConfig(config) {
  const base = { ...DEFAULT_SCAN_CONFIG }
  if (config) {
    SCAN_NODES.forEach((node) => {
      // 候选：节点键 → 旧字段（sca/copyright/malware）。只有「工具存在且覆盖该节点」才沿用，
      // 否则回落默认值——避免历史配置里已下线/不适配的工具 id 让下拉框显示空白。
      const picked = [config[node.key], config[node.progress]].find((id) => {
        if (!id) return false
        const engine = engineById(id)
        return !!engine && (engine.nodes || []).includes(node.key)
      })
      if (picked) base[node.key] = picked
    })
  }
  return base
}

/**
 * 指标 → 可自动判定的扫描依赖。
 * auto=true 表示该指标可由扫描节点直接给出结论；auto=false 需人工判定。
 * type 为能力类型（sca / copyright / malware）。
 */
export const INDICATOR_CAPABILITY = {
  // 代码技术安全
  'bl-01': { type: 'sca', auto: true, note: '超危漏洞数量（CVSS 9.0-10.0，未修复）' },
  'bl-02': { type: 'sca', auto: false, note: '漏洞密度需代码千行数，当前人工核算' },
  'bl-03': { type: null, auto: false, note: '依赖修复日期数据，暂人工' },
  'bl-04': { type: null, auto: false, note: '依赖修复日期数据，暂人工' },
  'bl-05': { type: 'malware', auto: true, note: '恶意代码检测（华为云恶意代码扫描）' },
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