/**
 * 使用手册目录树：一级 → 二级 → 三级
 * doc 对应 src/docs/manual/{doc}.md
 */
export const manualToc = [
  {
    id: 'platform-intro',
    title: '平台介绍',
    doc: 'platform-intro',
  },
  {
    id: 'homepage',
    title: '首页',
    doc: 'home',
  },
  {
    id: 'software-library',
    title: '软件库',
    children: [
      { id: 'sl-filter', title: '软件筛选', doc: 'sl-filter' },
      { id: 'sl-detail', title: '软件详情', doc: 'sl-detail' },
    ],
  },
  {
    id: 'component-library',
    title: '组件库',
    doc: 'component-library',
  },
  {
    id: 'assistant',
    title: 'AI 助手',
    children: [
      { id: 'ai-intro', title: 'AI 助手介绍', doc: 'ai-intro' },
      { id: 'ai-guide', title: '使用指南', doc: 'assistant' },
    ],
  },
  {
    id: 'software-manage',
    title: '软件管理',
    children: [
      { id: 'sm-list', title: '软件列表', doc: 'sm-list' },
      { id: 'sm-scan', title: '软件扫描', doc: 'sm-scan' },
    ],
  },

  {
    id: 'organization',
    title: '组织管理',
    children: [
      { id: 'org-detail', title: '组织详情', doc: 'org-detail' },
      { id: 'version-train', title: '版本火车', doc: 'version-train' },
    ],
  },
  {
    id: 'personal-settings',
    title: '个人设置',
    doc: 'personal-settings',
  },
  {
    id: 'feedback',
    title: '需求反馈',
    doc: 'feedback',
  },
  {
    id: 'openapi',
    title: 'OpenAPI 接口',
    children: [
      { id: 'openapi-overview', title: '概览', doc: 'openapi-overview' },
      { id: 'openapi-sca', title: 'SCA 扫描', doc: 'openapi-sca' },
      { id: 'openapi-vuln', title: '漏洞预警', doc: 'openapi-vuln' },
      { id: 'openapi-sbom', title: 'SBOM 生成', doc: 'openapi-sbom' },
      { id: 'openapi-ai', title: 'AI 智能选型助手', doc: 'openapi-ai' },
      { id: 'openapi-license', title: '开源合规分析', doc: 'openapi-license' },
      { id: 'openapi-malware', title: '恶意代码检测', doc: 'openapi-malware' },
      { id: 'openapi-search', title: '组件搜索', doc: 'openapi-search' },
      { id: 'openapi-detail', title: '组件详情', doc: 'openapi-detail' },
      { id: 'openapi-software-search', title: '软件搜索', doc: 'openapi-software-search' },
      { id: 'openapi-software-detail', title: '软件详情', doc: 'openapi-software-detail' },
      { id: 'openapi-report', title: '报告生成', doc: 'openapi-report' },
    ],
  },
]

/** 扁平化所有带 doc 的叶子节点 */
export function flattenManualLeaves(nodes = manualToc, out = []) {
  for (const n of nodes) {
    if (n.doc) out.push(n)
    if (n.children?.length) flattenManualLeaves(n.children, out)
  }
  return out
}

export const manualLeaves = flattenManualLeaves()

export function findLeafByDoc(doc) {
  return manualLeaves.find((l) => l.doc === doc) ?? null
}

export function getDefaultDoc() {
  return manualLeaves[0]?.doc ?? 'software-library'
}

/** 根据 doc 反查一级、二级 id，用于展开侧栏 */
export function findPathToDoc(doc, nodes = manualToc, path = []) {
  for (const n of nodes) {
    const next = [...path, n.id]
    if (n.doc === doc) return next
    if (n.children?.length) {
      const found = findPathToDoc(doc, n.children, next)
      if (found) return found
    }
  }
  return null
}
