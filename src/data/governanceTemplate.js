// ==================== 软件导入模板 · 共享解析/校验 ====================
// 「软件导入模板.xlsx」为 23 列治理结果模板（sheet 名：软件详情汇总）：
// 治理负责人下载模板 → 填好治理结果 → 在「我的待治理清单」回传，
// 系统按本模块解析并校验（必填项齐全、枚举取值合法、名称+版本与分配清单一致、未与已入库重复）。

import * as XLSX from 'xlsx'
import { patchTemplateXlsx, TEMPLATE_COL_WIDTHS, HYPERLINK_COLUMNS } from './xlsxTemplateStyle.js'

// 模板列（治理结果模板，与「软件导入模板.xlsx」最终版列名、顺序一致，另加回「集成风险」列）
// 所有列均为必填：确实没有内容的填「无」，不要留空
export const TEMPLATE_HEADERS = [
  '软件名称', '软件版本', '托管地址', '国内托管地址', '源码包地址', '技术栈分类', '集成风险', '主语言类型',
  '开发商', '发布日期', '来源地址', 'copyright', '千行代码量（KL）', '软件生命力', '社区EOL日期',
  '版本描述', '主许可证', '软件说明', '依赖清单', '历史漏洞信息', '恶意代码', '开发者信息', '许可证列表',
]

// 表头列名（解析时兼容历史文件带 * 的表头）
export const TEMPLATE_COLUMNS = TEMPLATE_HEADERS.map((h) => h.replace(/\*/g, '').trim())

// ==================== 枚举列的合法取值（校验时按此判断，取值同时写入帮助文档） ====================
/** 技术栈分类 */
export const TECH_STACK_OPTIONS = [
  '大数据分析技术', 'PaaS', '存储及文件系统技术', 'SOA技术', 'Rel-MC', '安全组件', '研发工具',
  '媒体软件技术', '数据压缩技术', '分布式通信技术', '编译器与编程语言技术', 'WEB技术', '分布式中间件',
  '软件兼容性技术', '虚拟化技术', 'openstack', '操作系统技术', '数据库技术', '区块链技术', '搜索技术',
  '可编程逻辑', 'NP', '光器件', '能源', '处理器', '存储器', '交换网', '器件', 'ADDA', '计算硬件网卡',
  '安卓应用与框架', '应用多媒体', '通信协议应用', '软件测试', '通用开发库技术', '人工智能技术',
  '桌面应用与框架技术', '文本处理技术', '鸿蒙应用与框架', '字体技术', '云计算技术',
]
/** 集成风险 */
export const INTEGRATION_RISK_OPTIONS = ['高', '中', '低']
/** 主语言类型 */
export const LANG_OPTIONS = [
  'Python', 'C/C++', 'Java', 'C#', 'JavaScript', 'SQL', 'Go', 'Visual Basic', 'Fortran',
  'Delphi/Object Pascal', 'MATLAB', 'Rust', 'Ruby', 'PHP', 'R', 'Swift', 'Assembly language',
  'Kotlin', 'TypeScript', 'Scala',
]
/** 软件生命力 */
export const VITALITY_OPTIONS = ['成熟期', '衰退期', '成长期']

/** 枚举列 → 合法取值（键为模板列名；主语言类型不限制取值） */
export const ENUM_COLUMNS = {
  技术栈分类: TECH_STACK_OPTIONS,
  集成风险: INTEGRATION_RISK_OPTIONS,
  软件生命力: VITALITY_OPTIONS,
}

/** 国内托管地址：当前仅支持 AtomGit 平台 */
export const MIRROR_HOST = 'atomgit.com'

/** 判断是否 AtomGit 平台地址（国内托管地址目前仅支持 AtomGit） */
export function isAtomGitUrl(url) {
  return new RegExp(`^https?://${MIRROR_HOST.replace('.', '\\.')}/`, 'i').test(String(url || '').trim())
}

// ==================== 示例模板数据（研发提供的一条完整示例，供治理负责人参照填写） ====================
const SAMPLE_DESC = [
  '# Requests',
  '',
  '**Requests** 是一个简单而优雅的 HTTP 库。',
  '',
  '```python',
  '>>> import requests',
  ">>> r = requests.get('https://httpbin.org/basic-auth/user/pass', auth=('user', 'pass'))",
  '>>> r.status_code',
  '200',
  ">>> r.headers['content-type']",
  "'application/json; charset=utf8'",
  ">>> r.encoding",
  "'utf-8'",
  '>>> r.text',
  "'{\"authenticated\": true, ...'",
  '>>> r.json()',
  "{'authenticated': True, ...}",
  '```',
  '',
  'Requests 允许你极其简单地发送 HTTP/1.1 请求。无需手动为 URL 添加查询字符串，也无需对 `PUT` 和 `POST` 数据进行表单编码——不过现在，直接使用 `json` 方法即可！',
  '',
  '## 安装 Requests 与支持的版本',
  '',
  'Requests 可在 PyPI 上获取：',
  '',
  '```console',
  '$ python -m pip install requests',
  '```',
  '',
  'Requests 官方支持 Python 3.10+。',
  '',
  '## 支持的特性与最佳实践',
  '',
  '- Keep-Alive 与连接池',
  '- 国际化域名和 URL',
  '- 带 Cookie 持久化的会话',
  '- 浏览器风格的 TLS/SSL 验证',
  '- 基本认证与摘要认证',
  '- 熟悉的 `dict` 形式 Cookies',
  '- 自动内容解压缩和解码',
  '- 多部分文件上传',
  '- SOCKS 代理支持',
  '- 连接超时',
  '- 流式下载',
  '- 自动遵循 `.netrc`',
  '- 分块 HTTP 请求',
  '',
  '## API 参考与用户指南',
  '',
  'API 参考和用户指南可在 [Read the Docs](https://requests.readthedocs.io) 上获取。',
  '',
  '## 克隆仓库',
  '',
  '```shell',
  'git clone -c fetch.fsck.badTimezone=ignore https://github.com/psf/requests.git',
  '```',
  '',
  '你也可以将此设置应用于全局 Git 配置：',
  '',
  '```shell',
  'git config --global fetch.fsck.badTimezone ignore',
  '```',
].join('\n')

/** 示例行：键为模板列名，值为该列的示例填写内容（JSON 类字段以 JSON 字符串形式写入单元格） */
export const TEMPLATE_SAMPLE_ROW = {
  软件名称: 'requests',
  软件版本: 'v2.0.1',
  托管地址: 'https://github.com/macournoyer/thin',
  // 源码仅在 GitHub 时，需治理负责人手动上传至 AtomGit，此处填 AtomGit 地址
  国内托管地址: 'https://atomgit.com/macournoyer/thin',
  源码包地址: 'https://github.com/macournoyer/thin/archive/refs/tags/v2.0.1.zip',
  技术栈分类: '云计算技术',
  集成风险: '低',
  主语言类型: 'Python',
  开发商: 'Python Software Foundation',
  发布日期: '2026/3/26',
  来源地址: 'https://requests.readthedocs.io/en/latest/',
  copyright: JSON.stringify([
    { 文件: '/src/requests/api.py', copyright: 'copyright (c) 2012 by Kenneth Reitz' },
    { 文件: '/src/requests/__version__.py', copyright: 'Copyright Kenneth Reitz' },
    { 文件: '/src/requests/__init__.py', copyright: 'copyright (c) 2017 by Kenneth Reitz' },
    { 文件: '/ext/LICENSE', copyright: 'Copyright 2019 Kenneth Reitz' },
    { 文件: '/docs/_themes/LICENSE', copyright: 'Copyright (c) 2011 Kenneth Reitz\nCopyright (c) 2010 by Armin Ronacher' },
    { 文件: '/docs/conf.py', copyright: 'copyright MMXVIX. A Kenneth Reitz Project' },
    { 文件: '/NOTICE', copyright: 'Copyright 2019 Kenneth Reitz' },
  ]),
  '千行代码量（KL）': '12',
  软件生命力: '成熟期',
  社区EOL日期: '2021/11/1',
  版本描述: 'A simple, yet elegant, HTTP library.',
  主许可证: 'Apache License 2.0',
  软件说明: SAMPLE_DESC,
  依赖清单: JSON.stringify([
    {
      组件名称: 'yard', 版本: '0.9.28', 编程语言: 'Ruby',
      child: [
        {
          组件名称: 'yard-子组件示例A', 版本: '1.0.0', 编程语言: 'Ruby',
          child: [
            { 组件名称: 'yard-三级示例A1', 版本: '0.5.0', 编程语言: 'Ruby' },
            { 组件名称: 'yard-三级示例A2', 版本: '0.6.0', 编程语言: 'Ruby' },
          ],
        },
        {
          组件名称: 'yard-子组件示例B', 版本: '2.1.0', 编程语言: 'Ruby',
          child: [{ 组件名称: 'yard-三级示例B1', 版本: '1.2.0', 编程语言: 'Ruby' }],
        },
      ],
    },
    {
      组件名称: 'yardstick', 版本: '<1.0', 编程语言: 'Ruby',
      child: [
        {
          组件名称: 'yardstick-子组件示例C', 版本: '0.8.0', 编程语言: 'Ruby',
          child: [{ 组件名称: 'yardstick-三级示例C1', 版本: '0.3.0', 编程语言: 'Ruby' }],
        },
      ],
    },
  ]),
  历史漏洞信息: JSON.stringify([{ CVE编号: 'CVE-2009-3287', 严重程度: '高危', CVSS评分: 7.5 }]),
  恶意代码: JSON.stringify([
    {
      文件名称: 'diff2html-3.4.47.tgz',
      文件位置: 'diff2html-3.4.47.tgz\\>/package/package.json',
      恶意类别: 'JS',
      恶意类型: '恶意行为',
      恶意类型小类: '恶意命令执行',
      威胁等级: '中',
      置信度: '中',
      检测结果: 'Malicious Command Execute',
      关键日志: '疑似恶意代码：\nline[59]:     "coverage:push": "curl -Ls https://coverage.codacy.com/get.sh | bash",',
    },
  ]),
  开发者信息: JSON.stringify([
    { 开发者名称: 'lemoinem', 国家或地区: '美国', 组织或公司: '示例公司A' },
    { 开发者名称: 'zaphod42', 国家或地区: '乌克兰', 组织或公司: '示例公司C' },
    { 开发者名称: 'hasimo', 国家或地区: '日本', 组织或公司: '示例公司D' },
    { 开发者名称: 'ioquatix', 国家或地区: '新西兰', 组织或公司: '示例公司E' },
    { 开发者名称: 'snaury', 国家或地区: '无', 组织或公司: '无' },
  ]),
  许可证列表: JSON.stringify([
    { 许可证名称: 'Apache License 2.0', 许可证类型: 'apache', 是否批准: '已批准' },
    { 许可证名称: 'MIT License', 许可证类型: 'mit', 是否批准: '已批准' },
  ]),
}

// 表头别名（按长度倒序做包含匹配，避免「开源许可证」抢先吃掉「开源许可证ID」）
// 前一组为最终版列名，其余为历史列名兼容
const HEADER_ALIASES = [
  ['name', ['软件名称', '开源软件名称', '名称']],
  ['version', ['软件版本', '版本号', '版本']],
  ['repoUrl', ['托管地址', '源码地址', '来源地址/源码地址', '源码托管地址', '仓库地址']],
  ['mirrorUrl', ['国内托管地址', '备份地址', '镜像地址']],
  ['srcPkgUrl', ['源码包地址', '源码包']],
  ['techStack', ['技术栈分类', '软件类别', '技术栈']],
  ['lang', ['主语言类型', '主语言', '语言']],
  ['developer', ['开发商', '开发者']],
  ['releaseDate', ['发布日期']],
  ['homepage', ['来源地址', 'homepage', '官网地址', '官网']],
  ['copyright', ['copyright', 'CopyRight', '版权']],
  ['codeSize', ['千行代码量（KL）', '千行代码量', '代码量']],
  ['vitality', ['软件生命力', '生命力']],
  ['eolDate', ['社区EOL日期', 'EOL日期', '下线日期']],
  ['versionDesc', ['版本描述']],
  ['license', ['主许可证', '开源许可证', '许可证']],
  ['desc', ['软件说明', '项目描述', '描述']],
  ['deps', ['依赖清单', '依赖']],
  ['vulns', ['历史漏洞信息', '漏洞信息']],
  ['malware', ['恶意代码']],
  ['devInfo', ['开发者信息']],
  ['licenses', ['许可证列表']],
  ['integrationRisk', ['集成风险']],
  ['submitter', ['提交人']],
  ['submitOrg', ['提交组织']],
]

const ALIAS_FLAT = HEADER_ALIASES
  .flatMap(([key, aliases]) => aliases.map((alias) => ({ key, alias: alias.replace(/\*/g, '').replace(/\s+/g, '').toLowerCase() })))
  .sort((a, b) => b.alias.length - a.alias.length)

// 必填列：全部 23 列均为必填，缺任一项即校验失败
export const REQUIRED_KEYS = [
  ['name', '软件名称'], ['version', '软件版本'], ['repoUrl', '托管地址'], ['mirrorUrl', '国内托管地址'],
  ['srcPkgUrl', '源码包地址'], ['techStack', '技术栈分类'], ['integrationRisk', '集成风险'], ['lang', '主语言类型'], ['developer', '开发商'],
  ['releaseDate', '发布日期'], ['homepage', '来源地址'], ['copyright', 'copyright'], ['codeSize', '千行代码量（KL）'],
  ['vitality', '软件生命力'], ['eolDate', '社区EOL日期'], ['versionDesc', '版本描述'], ['license', '主许可证'],
  ['desc', '软件说明'], ['deps', '依赖清单'], ['vulns', '历史漏洞信息'], ['malware', '恶意代码'],
  ['devInfo', '开发者信息'], ['licenses', '许可证列表'],
]

function normHeader(v) {
  return String(v ?? '').replace(/\*/g, '').replace(/\s+/g, '').trim().toLowerCase()
}

/** 匹配表头单元格属于哪一列，返回列 key 或 null */
function matchHeaderKey(cell) {
  const t = normHeader(cell)
  if (!t) return null
  for (const { key, alias } of ALIAS_FLAT) {
    if (t.includes(alias)) return key
  }
  return null
}

/** 从 SheetJS 单元格取值 */
function cellText(v) {
  if (v == null) return ''
  if (typeof v === 'object') {
    if (v.w != null) return String(v.w).trim()
    if (v.v != null) return String(v.v).trim()
    return ''
  }
  return String(v).trim()
}

/**
 * 解析模板工作簿：定位表头行（≥3 个已知列）后逐行提取字段。
 * @returns {Array<Object>} 每行为 { name, version, lang, license, repoUrl, ... }
 */
export function parseGovernanceSheet(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  let headerRow = -1
  const colIdx = {}
  for (let i = 0; i < grid.length && i < 30; i++) {
    const found = {}
    let hit = 0
    grid[i].forEach((cell, c) => {
      const key = matchHeaderKey(cell)
      if (key && !(key in found)) {
        found[key] = c
        hit += 1
      }
    })
    if (hit >= 3) {
      headerRow = i
      Object.assign(colIdx, found)
      break
    }
  }
  if (headerRow === -1) return []
  const out = []
  for (let i = headerRow + 1; i < grid.length; i++) {
    const row = {}
    Object.entries(colIdx).forEach(([key, c]) => {
      row[key] = cellText(grid[i][c])
    })
    if (Object.values(row).every((v) => !v)) continue // 跳过空行
    // excelRow：该数据在表格中的真实行号（表头占第 1 行，数据从第 2 行开始），用于失败明细定位
    row.excelRow = i + 1
    out.push(row)
  }
  return out
}

/**
 * 逐条校验：
 * 1. 模板必填项齐全
 * 2. 枚举列（技术栈分类 / 集成风险 / 软件生命力）取值须在允许范围内
 * 3. 名称+版本能对应上分配清单（忽略大小写）
 * 4. 名称+版本在表格内不重复
 * 5. 未与已入库软件重复（只查 warehouseStatus === '已入库'，在流程中的不算）
 * @param {Array<Object>} rows 解析出的行
 * @param {{ items?: Array, softwareList?: Array }} ctx 校验上下文
 * @returns {Array<Object>} 每行附带 errors: string[]（原因文案）与 failures: Array<{row, field, reason}>（结构化明细）
 */
export function validateGovernanceRows(rows, { items = [], softwareList = [] } = {}) {
  const seen = new Set()
  return rows.map((row) => {
    // failures：结构化失败明细（表格行号 / 字段分类 / 具体原因），用于「回传校验结果」弹窗逐行展示
    const failures = []
    const add = (field, reason) => failures.push({ row: row.excelRow ?? null, field, reason })

    REQUIRED_KEYS.forEach(([key, label]) => {
      if (!row[key]) add('必填项', `${label}为空`)
    })
    // 枚举列取值校验：只提示「取值不在允许范围内」，避免与「必填」重复报错
    Object.entries(ENUM_COLUMNS).forEach(([col, options]) => {
      const value = (row[enumKeyOf(col)] || '').trim()
      if (value && !options.includes(value)) {
        add('枚举取值', `${col}取值不在允许范围内`)
      }
    })
    // 国内托管地址：目前仅支持 AtomGit 平台地址
    const mirror = (row.mirrorUrl || '').trim()
    if (mirror && !isAtomGitUrl(mirror)) {
      add('地址格式', '国内托管地址仅支持 AtomGit 平台地址（须先手动上传至 AtomGit）')
    }
    const name = row.name || ''
    const version = row.version || ''
    if (name && version) {
      const matched = items.some((it) =>
        (it.name || '').toLowerCase() === name.toLowerCase()
        && String(it.version || '').toLowerCase() === version.toLowerCase())
      if (!matched) add('清单匹配', '名称+版本与所选清单不匹配')

      const dupKey = name.toLowerCase() + '@' + version.toLowerCase()
      if (seen.has(dupKey)) add('重复数据', '表格内名称+版本重复')
      else seen.add(dupKey)

      const inLibrary = softwareList.some((s) =>
        (s.name || '').toLowerCase() === name.toLowerCase()
        && String(s.version || '').toLowerCase() === version.toLowerCase()
        && s.warehouseStatus === '已入库')
      if (inLibrary) add('重复数据', '该软件已入库，无需重复治理')
    }
    return { ...row, failures, errors: failures.map((f) => f.reason) }
  })
}

/** 枚举列名 → 解析后的字段 key */
function enumKeyOf(col) {
  const hit = HEADER_ALIASES.find(([, aliases]) => aliases.includes(col))
  return hit ? hit[0] : col
}

/** 判断两个对象是否指向同一软件（名称+版本，忽略大小写） */
export function sameSoftware(a, b) {
  return (a.name || '').toLowerCase() === (b.name || '').toLowerCase()
    && String(a.version || '').toLowerCase() === String(b.version || '').toLowerCase()
}

// ==================== 模板生成 / 导出 ====================

/** 表头行高（与「软件导入模板.xlsx」一致） */
const HEADER_ROW_HEIGHT = 17

/**
 * 生成「软件导入模板」工作簿：表头 + 数据行（与最终版模板一致，表头下直接是数据）。
 * 列宽与最终版模板逐列一致；表头样式（深蓝底白字加粗、居中换行）与冻结窗格
 * 由 patchTemplateXlsx 在写出字节时补齐（SheetJS 社区版不写这些样式）。
 * @param {Array<Object>} rows 按模板列名组织的行对象数组；传空数组则只有表头
 * @returns {Object} SheetJS 工作簿
 */
export function buildTemplateWorkbook(rows = []) {
  const body = rows.map((r) => TEMPLATE_COLUMNS.map((col) => (r?.[col] == null ? '' : String(r[col]))))
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...body])
  ws['!cols'] = TEMPLATE_COL_WIDTHS.map((wch) => ({ wch }))
  ws['!rows'] = [{ hpt: HEADER_ROW_HEIGHT }]
  ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(TEMPLATE_COLUMNS.length - 1)}${body.length + 1}` }
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '软件详情汇总')
  return wb
}

/** 触发浏览器下载 */
function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 收集需要写成超链接的单元格（最终版模板中地址类列为可点击链接）。
 * @param {Array<Object>} rows 按模板列名组织的行
 * @returns {Array<{ref: string, url: string}>}
 */
function collectHyperlinks(rows) {
  const links = []
  const cols = HYPERLINK_COLUMNS
    .map((name) => ({ name, idx: TEMPLATE_COLUMNS.indexOf(name) }))
    .filter((c) => c.idx >= 0)
  rows.forEach((row, r) => {
    // 表头占第 1 行，数据从第 2 行开始
    const rowNo = r + 2
    cols.forEach(({ name, idx }) => {
      const url = String(row?.[name] ?? '').trim()
      if (!/^https?:\/\//i.test(url)) return
      links.push({ ref: `${XLSX.utils.encode_col(idx)}${rowNo}`, url })
    })
  })
  return links
}

/** 导出「软件导入模板」文件（示例模板与预填模板共用同一套样式） */
export function writeTemplate(filename, rows = []) {
  const buf = XLSX.write(buildTemplateWorkbook(rows), { type: 'array', bookType: 'xlsx' })
  const patched = patchTemplateXlsx(buf, {
    headerRow: 1,
    headerHeight: HEADER_ROW_HEIGHT,
    hyperlinks: collectHyperlinks(rows),
  })
  downloadBytes(patched, filename)
}

/** 下载预填模板：按分配清单条目预填软件名称 / 软件版本 / 托管地址，其余治理结果字段留空待填写 */
export function writePrefilledTemplate(filename, items = []) {
  const rows = (items || []).map((item) => ({
    软件名称: item.name ?? '',
    软件版本: item.version ?? '',
    托管地址: item.repoUrl ?? '',
  }))
  writeTemplate(filename, rows)
}

/** 下载示例模板：输出研发提供的一条完整示例数据，供治理负责人参照各列填写格式 */
export function writeSampleTemplate(filename = '软件导入模板-示例.xlsx') {
  writeTemplate(filename, [TEMPLATE_SAMPLE_ROW])
}
