// ==================== 签名验证 · 数据层 ====================
// 需求：用户每次验证后都要留痕，可在「历史签名验证记录」入口中查看历次结果。
//       注意：进入签名验证页**不展示**历次结果，只呈现初始上传态。
//
// 口径说明：
//   1. 本模块只负责记录与持久化，不参与「验证通过与否」的判定
//      （判定仍在页面里，见 SignatureVerifyView 的 drawBinaryResult）。
//   2. 记录按时间倒序对外提供：最新的在最前。
//   3. 种子数据为演示用，文件名取自平台已有组件（与漏洞库口径一致），
//      首次进入即可看到历史记录，不必先自己验一次。
//
// 存储键：tosslib_signature_verify_records

const STORAGE_KEY = 'tosslib_signature_verify_records'

// 版本 1：初版记录结构（含供应方 / 签名算法 / 签名指纹 / 文件哈希等字段）
// 版本 2：只保留真实验证产生的字段（文件名 / 大小 / 签名状态 / 可信状态 / 验证时间）。
//         原先的「供应方」用户上传时并未提供（列表里一直显示占位符「—」）、
//         「签名算法」是硬编码值、「签名指纹 / 文件哈希」是随机生成值 ——
//         三者都不属于真实验证结果，故整体从记录结构中移除。
//         结构与版本 1 不兼容，升级版本号让旧存储失效并重新播种。
// 版本 3：种子扩至 24 条，使「历史签名验证记录」具备可分页的数据量
//         （默认 10 条/页 → 3 页）。旧存储只有 10 条，会让分页器恒为 1 页，
//         故递增版本号让旧存储失效、按新种子重建。
const SEED_VERSION = 3

/** 历史记录条数上限，避免长期使用后无限增长 */
const MAX_ITEMS = 60

/** 每页条数可选档位（与平台其它列表页保持一致：10 / 20 / 50） */
export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10条/页' },
  { value: 20, label: '20条/页' },
  { value: 50, label: '50条/页' },
]

/**
 * 生成一条种子记录。
 * @param {number} idx 序号，用于稳定派生各字段（同一序号每次结果一致）
 * @param {number} daysAgo 距今天数
 */
function makeRecord(idx, daysAgo) {
  // 平台已有组件名（与漏洞库 / 组件库口径一致），派生不同版本凑够 24 条，
  // 使历史列表具备可分页的真实数据量（默认 10 条/页 → 3 页）。
  // 只保留「文件名 + 大小」——供应方属用户未提供的信息，已随字段一并移除。
  const SW = [
    { name: 'openssl-3.0.13.tar.gz', size: 15_204_864 },
    { name: 'log4j-core-2.20.0.jar', size: 1_892_352 },
    { name: 'spring-core-6.1.4.jar', size: 1_671_168 },
    { name: 'nginx-1.25.4.tar.gz', size: 1_258_291 },
    { name: 'tomcat-10.1.19.zip', size: 11_796_480 },
    { name: 'guava-33.1.0-jre.jar', size: 3_055_616 },
    { name: 'netty-all-4.1.107.Final.jar', size: 4_508_672 },
    { name: 'fastjson-2.0.47.jar', size: 1_572_864 },
    { name: 'redis-7.2.4.tar.gz', size: 3_031_040 },
    { name: 'axios-1.6.8.tgz', size: 612_352 },
    { name: 'openssl-3.0.11.tar.gz', size: 15_187_968 },
    { name: 'log4j-core-2.19.0.jar', size: 1_841_152 },
    { name: 'spring-core-6.0.19.jar', size: 1_623_040 },
    { name: 'nginx-1.24.0.tar.gz', size: 1_245_184 },
    { name: 'tomcat-10.0.27.zip', size: 11_534_336 },
    { name: 'guava-32.1.3-jre.jar', size: 3_031_040 },
    { name: 'netty-all-4.1.100.Final.jar', size: 4_456_448 },
    { name: 'fastjson-2.0.43.jar', size: 1_548_288 },
    { name: 'redis-7.0.15.tar.gz', size: 2_985_984 },
    { name: 'axios-1.6.2.tgz', size: 596_992 },
    { name: 'mongodb-7.0.5.tgz', size: 2_621_440 },
    { name: 'sevenzip-19.00.zip', size: 1_193_984 },
    { name: 'commons-text-1.10.0.jar', size: 248_832 },
    { name: 'jquery-3.7.1.zip', size: 296_960 },
  ]
  const sw = SW[idx % SW.length]
  // 让种子既有通过也有未通过：每 4 条留 1 条未通过，其余通过
  const passed = idx % 4 !== 3
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(9 + (idx % 9), (idx * 7) % 60, (idx * 13) % 60, 0)
  const pad = (n) => String(n).padStart(2, '0')
  const at = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return {
    id: `sig-seed-${idx}`,
    fileName: sw.name,
    fileSize: sw.size,
    // 签名状态与可信状态在种子里保持一致（都取决于 passed），便于阅读
    signaturePassed: passed,
    trusted: passed,
    verifiedAt: at,
    // 记录是否为种子（用户真实验证产生的记录不带此字段）
    seed: true,
  }
}

function seedList() {
  // 24 条：天数跨度从今天到约 3 个月前，含通过 / 未通过两种情况。
  // 数量需大于一页（默认 10 条/页），否则分页器永远只有 1 页、功能看不出来。
  const days = [
    0, 1, 2, 4, 6, 8, 11, 13, 16, 19, 22, 25,
    29, 33, 37, 41, 46, 51, 57, 63, 70, 78, 86, 95,
  ]
  return days.map((d, i) => makeRecord(i, d))
}

/**
 * 读取存储原始负载。
 * @returns {{ exists: boolean, list: Array }} exists 表示「当前版本的有效存储已存在」
 */
function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { exists: false, list: [] }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) return { exists: true, list: parsed.list }
      return { exists: false, list: [] } // 结构升级：旧数据失效，重新播种
    }
    if (Array.isArray(parsed)) return { exists: false, list: [] } // 旧格式
  } catch (e) {
    // 读取失败按无存储处理
  }
  return { exists: false, list: [] }
}

function persist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list: list.slice(0, MAX_ITEMS) }))
  } catch (e) {
    // 存储不可用（隐私模式 / 超限）时静默降级为内存态
  }
}

/**
 * 首次访问（或结构升级后）把种子记录落库。
 * 判定依据是「有效存储是否存在」而非「列表是否为空」——
 * 否则用户清空历史后刷新页面，种子记录会复活。
 */
let seeded = false
function ensureSeeded() {
  if (seeded) return
  const { exists } = readRaw()
  if (!exists) persist(seedList())
  seeded = true
}

/**
 * 全部历史记录（时间倒序，最新在前）。
 * 返回的是副本，避免调用方直接改到内部状态。
 */
export function getVerifyRecords() {
  ensureSeeded()
  const { list } = readRaw()
  return [...list]
    .sort((a, b) => String(b.verifiedAt).localeCompare(String(a.verifiedAt)))
    .map((r) => ({ ...r }))
}

/**
 * 新增一条验证记录（用户完成一次验证后调用）。
 *
 * 记录只包含真实验证产生的信息：
 *   - 用户上传的文件信息：fileName / fileSize
 *   - 本次验证结论：signaturePassed / trusted / verifiedAt
 * 不再记录供应方（用户未提供）、签名算法（硬编码）、指纹与哈希（随机生成）——
 * 这些都不是验证结果，展示出来会让用户误以为是真实校验值。
 *
 * @param {object} payload 记录字段，id 与 verifiedAt 缺省时自动生成
 * @returns {object} 写入后的完整记录
 */
export function addVerifyRecord(payload = {}) {
  ensureSeeded()
  const { list } = readRaw()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const record = {
    id: payload.id || `sig-${stamp}-${Math.random().toString(36).slice(2, 7)}`,
    fileName: payload.fileName || '未命名文件',
    fileSize: Number(payload.fileSize) || 0,
    signaturePassed: !!payload.signaturePassed,
    trusted: !!payload.trusted,
    verifiedAt:
      payload.verifiedAt ||
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    seed: false,
  }
  persist([record, ...list])
  return record
}

/** 清空历史记录（保留空存储标记，避免种子复活） */
export function clearVerifyRecords() {
  seeded = true
  persist([])
}
