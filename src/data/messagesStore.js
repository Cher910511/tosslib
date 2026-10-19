// ==================== 站内信 · 模拟数据 ====================
// 内容以「版本更新推送」为主：用户订阅了某软件/组件，该软件有新版本入库时发一条提醒
// （见下方 VERSION_RELEASE_EVENTS 与 pushVersionUpdate）。
//
// 另保留三类治理流程通知 —— 它们仍被「审批入库」页调用（WarehouseApprovalView）：
//  - approved     → 该软件已经成功治理入库
//  - blacklisted  → 该软件有高危漏洞已加入黑名单
//  - question     → 有疑问请联系管理员
// 注意：这三类不可删除，否则审批入库页的站内信会因找不到模板而被静默丢弃。

import { SUBSCRIPTIONS, findSubscription } from './subscriptionStore.js'

const STORAGE_KEY = 'tosslib_messages'
const MAX_ITEMS = 200

/**
 * 存储结构版本。
 * 递增时机：种子内容或记录结构发生变化时（与本项目其它 store 的 __seedVersion 口径一致）。
 * 版本 1：站内信内容由「治理回复（approved/blacklisted/question）」改为「版本更新推送」。
 *        必须递增 —— 两版种子的 id 都是 msg-seed-N，仅靠 id 无法区分新旧，
 *        旧版本存储会把新内容整片盖住（已复现）。
 * 版本 2：版本更新文案补上「建议更新到 x.y.z」的行动建议。
 *        文案属于种子内容，同样必须递增 —— 否则浏览器里已存的 v1 数据会继续显示旧文案，
 *        表现为「代码改了但页面没变」（上一版刚踩过这个坑）。
 * 版本 3：文案定稿为「已入库新版本 x.y.z，建议您及时查看版本更新内容，获取最新功能与安全修复」，
 *        同时去掉「您当前订阅版本为 x.y.z」一句。同一原因必须递增。
 */
const SEED_VERSION = 3

/** 站内信文案模板 */
const MESSAGE_TEMPLATES = {
  approved: (name) => ({
    title: '治理入库成功通知',
    content: `【${name}】该软件已经成功治理入库`,
  }),
  blacklisted: (name) => ({
    title: '高危漏洞黑名单通知',
    content: `【${name}】该软件有高危漏洞已加入黑名单`,
  }),
  question: (name) => ({
    title: '清单答疑通知',
    content: `【${name}】有疑问请联系管理员`,
  }),
  /**
   * 版本更新推送：用户订阅的软件 / 组件有新版本入库。
   * 文案结构：变动事实（已入库新版本 x.y.z）→ 行动建议（查看版本更新内容）。
   * @param {object} payload { name, version, kind }
   *   name 软件/组件名；version 本次入库的新版本；kind 「软件」或「组件」
   *   注：记录里仍保留 prevVersion（用户当前订阅版本）字段备用，
   *       但按需求文案不再展示 —— 故此处不参与拼接。
   */
  versionUpdate: ({ name, version, kind }) => ({
    title: '订阅版本更新提醒',
    content: `您订阅的${kind || '软件'}【${name}】已入库新版本 ${version}，建议您及时查看版本更新内容，获取最新功能与安全修复。`,
  }),
}

/**
 * 版本入库事件（驱动「版本更新推送」）。
 * 版本号取自平台已有数据，可溯源（见每行注释），非凭空编造。
 * 其中未订阅的条目**不会**生成站内信 —— 用于体现「仅推订阅项」这条规则。
 */
const VERSION_RELEASE_EVENTS = [
  // 版本火车「Redis Stack 7.4.0」→ 订阅项 Redis 当前 7.2.4
  { name: 'Redis', version: '7.4.0', warehouseTime: '2026-08-12 10:20' },
  // 版本火车「Nginx 1.26.2」→ 订阅项 Nginx 当前 1.26.0
  { name: 'Nginx', version: '1.26.2', warehouseTime: '2026-08-11 16:40' },
  // 版本火车「OpenSSL 3.3.2」→ 订阅项 OpenSSL 当前 3.3.0
  { name: 'OpenSSL', version: '3.3.2', warehouseTime: '2026-08-09 09:05' },
  // 已入库但**未订阅**（订阅清单里没有 Zookeeper）→ 按规则不推送，仅作规则验证用
  { name: 'Zookeeper', version: '3.9.2', warehouseTime: '2026-07-24 11:10' },
]

/** 取名称对应的类型文案（软件 / 组件） */
function kindOf(name) {
  const sub = findSubscription(name)
  if (sub) return sub.type === 'component' ? '组件' : '软件'
  return '软件'
}

/**
 * 演示用种子站内信：由版本入库事件 × 订阅关系推导而来。
 * 仅保留命中了订阅清单的事件，故「未订阅项入库」不会出现在站内信里。
 * 归属默认用户 user-super-1（可被 route.query.user 切换）。
 */
function seedList() {
  return VERSION_RELEASE_EVENTS.filter((e) => SUBSCRIPTIONS.some((s) => s.name.toLowerCase() === e.name.toLowerCase()))
    .map((e, i) => {
      const sub = findSubscription(e.name)
      const prevVersion = sub ? sub.currentVersion : ''
      return {
        id: `msg-seed-${i + 1}`,
        recipientId: 'user-super-1',
        type: 'versionUpdate',
        softwareName: e.name,
        version: e.version,
        prevVersion,
        time: e.warehouseTime,
        // 最新的未读，较早的已读，便于查看未读角标效果
        read: i > 0,
        ...MESSAGE_TEMPLATES.versionUpdate({
          name: e.name,
          version: e.version,
          prevVersion,
          kind: kindOf(e.name),
        }),
      }
    })
}

function load() {
  let stored = []
  /** 存储存在但版本不可用（需清掉重建），用于读取后顺带自愈 */
  let stale = false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    /**
     * 只有「带正确版本号的对象」才算有效存储。
     * 丢弃两种情况：
     *   1. 裸数组 —— 旧格式，没有版本标记，正是改动前写入的那批旧种子；
     *   2. __seedVersion 与当前不一致 —— 结构已变，旧数据不可用。
     * 为什么必须丢弃：站内信内容已由「治理回复」改为「版本更新推送」，
     * 而两版种子的 id 恰好都是 msg-seed-N，若沿用旧数据，新版内容会被旧内容整片盖住
     * （已复现：浏览器里存着旧种子时一直显示旧的治理通知）。
     */
    const isVersioned = parsed && !Array.isArray(parsed) && Number(parsed.__seedVersion) === SEED_VERSION
    if (isVersioned && Array.isArray(parsed.list)) stored = parsed.list
    else if (raw !== null) stale = true // 有存储但版本不匹配 → 待自愈
  } catch (e) {
    // 读取失败按无存储处理
  }
  const seed = seedList()
  const seedIds = new Set(seed.map((m) => m.id))
  const storedById = new Map(stored.map((m) => [m.id, m]))
  /**
   * 种子记录若在存储中已存在（例如已被点开标记为已读），**以存储中的版本为准**，
   * 这样已读状态才能保留。原实现是 [...seed, ...storedReal]（storedReal 排除了
   * 所有种子 id），等于每次读取都用种子覆盖存储，已读状态永远丢失 ——
   * 实测：点开后存储已写入，刷新页面角标又变回未读。
   * 与 inboundRequests.js 的合并口径一致。
   */
  const merged = [...seed.map((m) => storedById.get(m.id) || m), ...stored.filter((m) => !seedIds.has(m.id))]
  /**
   * 自愈：存储版本不匹配时，读取即按当前版本重写一次。
   * 否则旧版本数据会一直躺在 localStorage 里 —— 显示虽已正确（每次读取都丢弃它），
   * 但存储状态与代码不符，排查问题时容易被误导（实测看到 storedVer 仍为旧值）。
   * 与本项目其它 store 的 ensureSeeded 做法一致。
   */
  if (stale) persist(merged)
  return merged
}

function persist(list) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ __seedVersion: SEED_VERSION, list: list.slice(-MAX_ITEMS) }),
    )
  } catch (e) {
    // 存储失败静默降级
  }
}

/** 某用户收到的站内信（含未读/已读） */
export function getMessages(recipientId) {
  return load().filter((m) => m.recipientId === recipientId)
}

/** 某用户未读站内信数量 */
export function getUnreadCount(recipientId) {
  return getMessages(recipientId).filter((m) => !m.read).length
}

/** 发送站内信：recipientId 收件人，type 见文案模板，softwareName 软件名
 *  仅用于 approved / blacklisted / question 三类治理通知（模板接收「名称字符串」）。
 *  版本更新请用 pushVersionUpdate（模板需版本号等结构化参数）。 */
export function sendMessage(recipientId, type, softwareName) {
  const list = load()
  const tpl = MESSAGE_TEMPLATES[type]
  if (!tpl) return
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const msg = {
    id: `msg-${now.getTime()}`,
    recipientId,
    type,
    softwareName,
    time,
    read: false,
    ...tpl(softwareName),
  }
  list.unshift(msg)
  persist(list)
  return msg
}

/**
 * 版本更新推送：某软件/组件有新版本入库时，给**订阅了它**的用户发提醒。
 *
 * 与 sendMessage 的区别：本函数的模板需要结构化参数（新版本号、用户当前版本、类型），
 * 故单独实现而不是复用 sendMessage（后者按「名称字符串」调用模板）。
 *
 * @param {Array<string>|string} recipientIds 收件人（单个或多个）
 * @param {object} payload { name, version, time }
 * @returns {Array<object>} 实际发出的消息（未订阅或参数不全时为空数组）
 */
export function pushVersionUpdate(recipientIds, payload = {}) {
  const name = String(payload.name || '').trim()
  const version = String(payload.version || '').trim()
  if (!name || !version) return []

  // 核心规则：只推用户订阅了的软件 / 组件
  const sub = findSubscription(name)
  if (!sub) return []

  const ids = Array.isArray(recipientIds) ? recipientIds : [recipientIds]
  const list = load()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fallbackTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const sent = []

  ids.filter(Boolean).forEach((recipientId, i) => {
    const msg = {
      // 同一批次多人接收时用序号区分，避免时间戳相同导致 id 冲突
      id: `msg-vu-${now.getTime()}-${i}`,
      recipientId,
      type: 'versionUpdate',
      softwareName: name,
      version,
      prevVersion: sub.currentVersion,
      time: payload.time || fallbackTime,
      read: false,
      ...MESSAGE_TEMPLATES.versionUpdate({
        name,
        version,
        prevVersion: sub.currentVersion,
        kind: sub.type === 'component' ? '组件' : '软件',
      }),
    }
    list.unshift(msg)
    sent.push(msg)
  })

  if (sent.length) persist(list)
  return sent
}

/** 标记单条已读 */
export function markMessageRead(id) {
  const list = load()
  const hit = list.find((m) => m.id === id)
  if (hit) {
    hit.read = true
    persist(list)
  }
}

/** 全部标记已读 */
export function markAllRead(recipientId) {
  const list = load()
  let changed = false
  list.forEach((m) => {
    if (m.recipientId === recipientId && !m.read) {
      m.read = true
      changed = true
    }
  })
  if (changed) persist(list)
}
