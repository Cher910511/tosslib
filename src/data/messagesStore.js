// ==================== 站内信 · 模拟数据 ====================
// 用户上传软件治理清单后，平台/管理员处理完毕通过站内信回复：
//  - approved     → 该软件已经成功治理入库
//  - blacklisted  → 该软件有高危漏洞已加入黑名单
//  - question     → 有疑问请联系管理员

const STORAGE_KEY = 'tosslib_messages'
const MAX_ITEMS = 200

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
}

/** 演示用种子站内信（归属默认用户 user-super-1，可被 route.query.user 切换） */
const SEED_MESSAGES = [
  { id: 'msg-seed-1', recipientId: 'user-super-1', type: 'approved', softwareName: 'Kafka', time: '2026-08-20 10:30', read: true },
  { id: 'msg-seed-2', recipientId: 'user-super-1', type: 'blacklisted', softwareName: 'Log4j', time: '2026-08-21 14:05', read: false },
  { id: 'msg-seed-3', recipientId: 'user-super-1', type: 'question', softwareName: 'Docker', time: '2026-08-22 09:12', read: false },
]

function seedList() {
  return SEED_MESSAGES.map((m) => ({
    ...MESSAGE_TEMPLATES[m.type](m.softwareName),
    ...m,
  }))
}

function load() {
  let stored = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : null
    if (Array.isArray(list) && list.length > 0) stored = list
  } catch (e) {
    // 读取失败按无存储处理
  }
  const seed = seedList()
  const seedIds = new Set(seed.map((m) => m.id))
  const storedReal = stored.filter((m) => !seedIds.has(m.id))
  return [...seed, ...storedReal]
}

function persist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_ITEMS)))
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

/** 发送站内信：recipientId 收件人，type 见文案模板，softwareName 软件名 */
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
