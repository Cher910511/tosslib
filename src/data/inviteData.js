// ==================== 邀请注册 · 数据层 ====================
// 背景：平台注册入口已关闭，账号此前只能由内部人员手工创建。
// 本模块实现「邀请链接自助注册」：发起方生成带 token 的邀请链接，
// 被邀请人自助填资料完成注册，自动加入目标组织并继承预设角色，内部人员无需代建账号。
//
// 说明：orgData.js 的 USERS/ORGS 为静态导出（无持久化），
// 因此通过邀请注册产生的账号单独存于本模块，并由 getRegisteredUsers() 对外提供。

import { addOrgMember } from './orgMembershipData.js'

const INVITE_KEY = 'tosslib_invites'
const REGISTER_KEY = 'tosslib_registered_users'
const SEED_VERSION = 1

/** 邀请链接有效期选项（天） */
export const EXPIRE_OPTIONS = [
  { value: 1, label: '1 天' },
  { value: 7, label: '7 天' },
  { value: 30, label: '30 天' },
  { value: 0, label: '永久有效' },
]

/** 可使用次数选项 */
export const USE_OPTIONS = [
  { value: 1, label: '1 次（单人）' },
  { value: 5, label: '5 次' },
  { value: 20, label: '20 次' },
  { value: 0, label: '不限次数' },
]

// ==================== 工具 ====================
const pad = (n) => String(n).padStart(2, '0')
function fmt(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 生成随机 token（优先用 crypto，保证不可猜测） */
function genToken() {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function readStore(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) return parsed.list
      return [] // 结构升级：丢弃过期数据
    }
    if (Array.isArray(parsed)) return [] // 旧格式按过期处理
  } catch (e) {
    // 读取失败按无存储处理
  }
  return []
}

function writeStore(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify({ __seedVersion: SEED_VERSION, list }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

// ==================== 邀请记录 ====================
/**
 * @typedef {{ token: string, orgId: string|null, orgName: string,
 *   platformRoles: string[], orgRole: 'admin'|'member'|null,
 *   expiresAt: string|null, maxUses: number, usedCount: number,
 *   createdBy: string, createdAt: string,
 *   updatedBy: string, updatedAt: string,
 *   note: string, revoked: boolean }} Invite
 */

/** 种子邀请：让页面初始就有各状态的样例，便于查看状态与「更新人/更新时间」 */
const SEED_INVITES = [
  {
    token: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    orgId: 'org-001',
    orgName: '中国工商银行',
    platformRoles: [],
    orgRole: 'member',
    expiresAt: '2026-12-31 23:59',
    maxUses: 5,
    usedCount: 1,
    createdBy: 'zhangjianguo',
    createdAt: '2026-08-12 10:20',
    updatedBy: 'zhaoxiaoming',
    updatedAt: '2026-08-15 14:35',
    note: '组织成员邀请',
    revoked: false,
  },
  {
    token: 'b2c3d4e5f60718293a4b5c6d7e8f901a',
    orgId: 'org-002',
    orgName: '平安科技',
    platformRoles: ['audit-expert'],
    orgRole: 'member',
    expiresAt: '2026-11-30 23:59',
    maxUses: 1,
    usedCount: 0,
    createdBy: 'admin',
    createdAt: '2026-08-20 09:05',
    updatedBy: 'admin',
    updatedAt: '2026-08-20 09:05',
    note: '审核专家定向邀请',
    revoked: false,
  },
  {
    token: 'c3d4e5f60718293a4b5c6d7e8f901a2b',
    orgId: 'org-003',
    orgName: '华为技术有限公司',
    platformRoles: ['governor'],
    orgRole: 'member',
    expiresAt: '2026-10-31 23:59',
    maxUses: 20,
    usedCount: 3,
    createdBy: 'admin',
    createdAt: '2026-08-05 15:40',
    updatedBy: 'admin',
    updatedAt: '2026-08-22 11:10',
    note: '治理人员批量邀请（已撤销）',
    revoked: true,
  },
  {
    token: 'd4e5f60718293a4b5c6d7e8f901a2b3c',
    orgId: 'org-004',
    orgName: '阿里巴巴集团',
    platformRoles: [],
    orgRole: 'member',
    expiresAt: '2026-12-15 23:59',
    maxUses: 1,
    usedCount: 1,
    createdBy: 'chenxiaofeng',
    createdAt: '2026-08-02 16:30',
    updatedBy: 'yangsiqi',
    updatedAt: '2026-08-03 09:25',
    note: '单人邀请（已用尽）',
    revoked: false,
  },
  {
    token: 'e5f60718293a4b5c6d7e8f901a2b3c4d',
    orgId: 'org-001',
    orgName: '中国工商银行',
    // 组织内角色（库主）属于「组织身份」，不是平台角色
    platformRoles: [],
    orgRole: 'admin',
    expiresAt: '2026-01-31 23:59',
    maxUses: 5,
    usedCount: 0,
    createdBy: 'zhangjianguo',
    createdAt: '2026-01-10 09:00',
    updatedBy: 'zhangjianguo',
    updatedAt: '2026-01-10 09:00',
    note: '过期邀请示例',
    revoked: false,
  },
]

/** 读取邀请存储负载（含被删除的种子 token，避免删除后又被种子补回） */
function readInvitePayload() {
  try {
    const raw = localStorage.getItem(INVITE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) {
        return { list: parsed.list, removedSeeds: parsed.removedSeeds || [] }
      }
      return { list: [], removedSeeds: [] } // 结构升级：丢弃过期数据
    }
  } catch (e) {
    // 读取失败按无存储处理
  }
  return { list: [], removedSeeds: [] }
}

function writeInvitePayload({ list, removedSeeds }) {
  try {
    localStorage.setItem(INVITE_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list, removedSeeds }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/** 补全「最新一次更新」字段：无记录时回落到创建人/创建时间 */
function withUpdateInfo(inv) {
  return {
    ...inv,
    updatedBy: inv.updatedBy || inv.createdBy || '—',
    updatedAt: inv.updatedAt || inv.createdAt || '—',
  }
}

/** 读取全部邀请记录（种子 + 用户新建，按创建时间倒序） */
export function getInvites() {
  const { list, removedSeeds } = readInvitePayload()
  const storedTokens = new Set(list.map((i) => i.token))
  const seeds = SEED_INVITES
    .filter((s) => !removedSeeds.includes(s.token) && !storedTokens.has(s.token))
  return [...list, ...seeds]
    .map(withUpdateInfo)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** 按 token 取邀请记录 */
export function getInviteByToken(token) {
  if (!token) return null
  return getInvites().find((i) => i.token === token) || null
}

/**
 * 生成邀请链接。
 * @param {{ orgId?: string|null, orgName?: string,
 *   platformRoles?: string[], platformRole?: string,
 *   orgRole?: 'admin'|'member'|null,
 *   expireDays?: number, maxUses?: number, createdBy?: string, note?: string }} opts
 *   platformRole 为兼容旧调用（等价于单角色）
 */
export function createInvite(opts = {}) {
  const {
    orgId = null, orgName = '—',
    platformRoles, platformRole,
    orgRole = null,
    expireDays = 7, maxUses = 1, createdBy = '当前用户', note = '',
  } = opts
  // 归一化：数组优先，兼容旧的单值字符串。
  // 允许为空——组织成员靠「组织角色」成立，无需平台角色（账号合法性由 accountData 统一判定）。
  // 注意过滤掉已下线的角色 id（如旧数据里的 'general'），避免出现非法平台角色。
  const VALID = ['audit-expert', 'governor', 'regulator', 'platform-admin']
  const roles = Array.isArray(platformRoles)
    ? platformRoles
    : (platformRole ? [platformRole] : [])
  const normalized = [...new Set(roles)].filter((r) => VALID.includes(r))
  const now = new Date()
  const expiresAt = Number(expireDays) > 0
    ? fmt(new Date(now.getTime() + Number(expireDays) * 24 * 60 * 60 * 1000))
    : null
  const invite = {
    token: genToken(),
    orgId,
    orgName,
    platformRoles: normalized,
    orgRole,
    expiresAt,
    maxUses: Number(maxUses) || 0,
    usedCount: 0,
    createdBy,
    createdAt: fmt(now),
    // 最新一次更新：创建即首次更新
    updatedBy: createdBy,
    updatedAt: fmt(now),
    note,
    revoked: false,
  }
  const payload = readInvitePayload()
  payload.list.push(invite)
  writeInvitePayload(payload)
  return invite
}

/**
 * 撤销邀请（撤销后链接立即失效），并记录最新一次更新的操作人与时间。
 * 种子邀请的撤销结果以「存储中的同 token 记录」落地。
 */
export function revokeInvite(token, operator = '系统') {
  const payload = readInvitePayload()
  const idx = payload.list.findIndex((i) => i.token === token)
  const now = fmt(new Date())
  if (idx !== -1) {
    payload.list[idx].revoked = true
    payload.list[idx].updatedBy = operator
    payload.list[idx].updatedAt = now
  } else {
    // 目标是种子邀请：复制一份到存储中再标记撤销
    const seed = SEED_INVITES.find((s) => s.token === token)
    if (seed) payload.list.push({ ...seed, revoked: true, updatedBy: operator, updatedAt: now })
  }
  writeInvitePayload(payload)
}

/** 删除邀请记录（种子邀请记入 removedSeeds，避免被种子补回） */
export function deleteInvite(token) {
  const payload = readInvitePayload()
  payload.list = payload.list.filter((i) => i.token !== token)
  if (SEED_INVITES.some((s) => s.token === token) && !payload.removedSeeds.includes(token)) {
    payload.removedSeeds.push(token)
  }
  writeInvitePayload(payload)
}

/**
 * 校验邀请链接可用性。
 * @returns {{ ok: boolean, reason?: string, invite: Invite|null }}
 */
export function validateInvite(token) {
  const invite = getInviteByToken(token)
  if (!invite) return { ok: false, reason: '邀请链接不存在或已被删除', invite: null }
  if (invite.revoked) return { ok: false, reason: '该邀请已被撤销，请联系邀请人重新生成', invite }
  if (invite.expiresAt && new Date(invite.expiresAt.replace(/-/g, '/')) < new Date()) {
    return { ok: false, reason: '邀请链接已过期，请联系邀请人重新生成', invite }
  }
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
    return { ok: false, reason: '邀请链接使用次数已用尽，请联系邀请人重新生成', invite }
  }
  return { ok: true, invite }
}

/** 邀请状态：用于列表展示 */
export function inviteStatus(invite) {
  if (invite.revoked) return '已撤销'
  if (invite.expiresAt && new Date(invite.expiresAt.replace(/-/g, '/')) < new Date()) return '已过期'
  if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) return '已用尽'
  return '有效'
}

// ==================== 通过邀请注册的账号 ====================
/** 读取通过邀请注册产生的账号 */
export function getRegisteredUsers() {
  return readStore(REGISTER_KEY)
}

/** 邮箱是否已被注册（含邀请注册的账号） */
export function isEmailTaken(email) {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return false
  return getRegisteredUsers().some((u) => (u.email || '').toLowerCase() === e)
}

/**
 * 接受邀请：创建账号并加入目标组织、继承预设角色。
 * 使用次数在成功后 +1。
 * @returns {{ ok: boolean, reason?: string, user?: Object, invite?: Invite }}
 */
export function acceptInvite(token, profile = {}) {
  const check = validateInvite(token)
  if (!check.ok) return { ok: false, reason: check.reason }
  const invite = check.invite
  const { name = '', email = '', phone = '' } = profile
  if (!name.trim()) return { ok: false, reason: '请填写姓名' }
  if (!email.trim()) return { ok: false, reason: '请填写邮箱' }
  if (isEmailTaken(email)) return { ok: false, reason: '该邮箱已注册，请直接登录或更换邮箱' }

  const now = new Date()
  const user = {
    id: `user-invited-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    // 账号模型统一为「用户名 / 密码 / 头像」：邀请注册以邮箱作为用户名（登录账号）
    username: email.trim(),
    email: email.trim(),
    phone: phone.trim(),
    avatar: '',
    // 通过邀请加入的账号按组织成员处理；平台角色继承邀请预设（多选，可为空）。
    // 账号合法性：组织角色已足够成立，故此处不再兜底给平台角色。
    role: 'member',
    orgId: invite.orgId,
    orgIds: invite.orgId ? [invite.orgId] : [],
    orgMemberships: invite.orgId ? [{ orgId: invite.orgId, orgRole: invite.orgRole || 'member' }] : [],
    platformRoles: (invite.platformRoles || []).slice(),
    // 留痕：发起人为邀请人，完成注册的是被邀请人本人
    createdBy: invite.createdBy || '—',
    createdAt: fmt(now),
    updatedBy: email.trim(),
    updatedAt: fmt(now),
    invitedBy: invite.createdBy,
    inviteToken: invite.token,
  }
  const users = readStore(REGISTER_KEY)
  users.push(user)
  writeStore(REGISTER_KEY, users)

  // 落库组织身份：否则新账号不会出现在「组织管理 → 组织成员」列表中
  if (invite.orgId) {
    addOrgMember(user.id, invite.orgId, invite.orgRole || 'member', '邀请注册')
  }

  // 使用次数 +1；该行状态发生变化，刷新「最新一次更新」为注册人
  const payload = readInvitePayload()
  const idx = payload.list.findIndex((i) => i.token === token)
  if (idx !== -1) {
    payload.list[idx].usedCount += 1
    payload.list[idx].updatedBy = user.name
    payload.list[idx].updatedAt = fmt(now)
  } else {
    // 种子邀请被使用：复制到存储中并累加次数
    const seed = SEED_INVITES.find((s) => s.token === token)
    if (seed) {
      payload.list.push({ ...seed, usedCount: seed.usedCount + 1, updatedBy: user.name, updatedAt: fmt(now) })
    }
  }
  writeInvitePayload(payload)
  return { ok: true, user, invite }
}

// ==================== 邀请链接地址 ====================
/** 生成可复制的邀请链接（按 BASE_URL 拼子路径，兼容 GitHub Pages 部署） */
export function buildInviteUrl(token) {
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${base}/invite/${token}`
}
