// ==================== 组织身份（成员 × 组织）· 数据层 ====================
// 背景：一个用户可属于多个组织，且在每个组织中的身份可能不同
// （例如李思远 = 华为技术有限公司的组织管理员 + 中国工商银行的普通成员）。
// 因此「组织管理员」不是平台级角色，而是 (用户, 组织) 二元组上的身份，本模块单独存储。
//
// 规则依据 Confluence《成员权限》：
//  1. 组织支持配置多个管理员；
//  2. 组织管理员拥有组织最高权限；
//  3. 组织管理员权限点不允许任何组织成员修改；
//  4. 组织管理员支持设置普通成员为组织管理员，支持取消其他组织管理员身份，不可取消自身；
//  5. 组织管理员不可被普通成员移出组织；
//  6. 组织管理员可将自身身份转移给组织内其他普通成员，转移后原管理员降级为普通成员；
//  7. 组织仅剩一名管理员时，不允许取消其管理员身份/退出/被移除，但允许转移身份。

import { USERS, ORGS, getUserOrgIds } from './orgData.js'
import { findOrg } from './orgStore.js'
import { findExtraUser } from './extraUsers.js'

const STORAGE_KEY = 'tosslib_org_memberships'
const SEED_VERSION = 1

/** 组织身份取值 */
/**
 * 组织级角色（一般人员 / 组织管理员）。
 * id 与 permissionData.ORG_ROLE_OPTIONS 保持一致（member / admin），
 * 名称也保持一致：一般人员 / 组织管理员。
 */
export const ORG_ROLES = [
  { id: 'admin', name: '组织管理员', desc: '拥有组织最高权限，可管理成员、角色权限与组织信息' },
  { id: 'member', name: '一般人员', desc: '组织内的普通使用者，按组织配置的权限点使用组织内功能' },
]

/** 按 id 取组织角色名 */
export function orgRoleName(roleId) {
  return ORG_ROLES.find((r) => r.id === roleId)?.name || '一般人员'
}

/**
 * 种子：从 orgData 的 orgIds 与各组织的 adminIds/memberIds 推导 (用户, 组织) 身份。
 * - 在 adminIds 中 → admin
 * - 其余（含仅在 orgIds 中声明、未列入 memberIds 的）→ member
 * joinedAt 为「加入组织时间」，与 updatedAt（最近一次更新）语义不同，需分别记录。
 */
function buildSeed() {
  const rows = []
  // 按用户顺序给出错落的加入时间，避免所有记录同一天显得失真
  const JOIN_DATES = [
    '2026-07-05 09:12', '2026-07-06 14:20', '2026-07-08 10:35', '2026-07-10 16:48',
    '2026-07-14 09:05', '2026-07-16 11:22', '2026-07-20 15:40', '2026-07-23 10:18',
    '2026-07-27 13:55', '2026-07-30 09:30', '2026-08-03 14:12', '2026-08-05 10:45',
  ]
  let seq = 0
  USERS.forEach((u) => {
    if (u.role === 'superadmin') return // 平台管理员不属于任何组织
    getUserOrgIds(u).forEach((orgId) => {
      const org = ORGS.find((o) => o.id === orgId)
      if (!org) return
      rows.push({
        userId: u.id,
        orgId,
        orgRole: org.adminIds.includes(u.id) ? 'admin' : 'member',
        joinedAt: JOIN_DATES[seq % JOIN_DATES.length],
        updatedBy: '系统初始化',
        updatedAt: '2026-08-01 09:00',
      })
      seq += 1
    })
  })
  return rows
}

const SEED_MEMBERSHIPS = buildSeed()

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) return parsed.list
      return [] // 结构升级：丢弃过期数据
    }
  } catch (e) {
    // 读取失败按无存储处理
  }
  return []
}

function persist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/**
 * 全部组织身份记录（种子 + 存储，按 (userId, orgId) 去重，存储优先）。
 * @returns {Array<{userId: string, orgId: string, orgRole: 'admin'|'member', updatedBy: string, updatedAt: string}>}
 */
export function getMemberships() {
  const stored = load()
  const key = (m) => `${m.userId}@${m.orgId}`
  const storedMap = new Map(stored.map((m) => [key(m), m]))
  const merged = SEED_MEMBERSHIPS.map((s) => storedMap.get(key(s)) || s)
  // 存储中新增的（如通过任免产生的新成员关系）追加
  const seedKeys = new Set(SEED_MEMBERSHIPS.map(key))
  stored.forEach((m) => { if (!seedKeys.has(key(m))) merged.push(m) })
  return merged.map((m) => ({ updatedBy: '—', updatedAt: '—', ...m }))
}

/** 某成员在某组织的身份；无记录返回 null */
export function getMembership(userId, orgId) {
  return getMemberships().find((m) => m.userId === userId && m.orgId === orgId) || null
}

/** 某成员在多个组织中的身份列表（带组织名与身份名，供权限页展示） */
export function getMembershipDetails(userId) {
  return getMemberships()
    .filter((m) => m.userId === userId)
    .map((m) => {
      // 用 findOrg 以支持平台管理员新建的组织（内置组织也在其中）
      const org = findOrg(m.orgId)
      return {
        ...m,
        orgName: org?.name || m.orgId,
        orgRoleName: orgRoleName(m.orgRole),
      }
    })
}

/** 某组织的成员身份列表（带用户信息） */
export function getOrgMemberships(orgId) {
  return getMemberships()
    .filter((m) => m.orgId === orgId)
    .map((m) => {
      // 先查内置账号，再查邀请注册 / 平台新建的账号；
      // 否则这些成员的姓名会回退显示成 userId
      const user = USERS.find((u) => u.id === m.userId) || findExtraUser(m.userId)
      return { ...m, name: user?.name || m.userId, user }
    })
}

/** 某组织的管理员数量 */
export function getOrgAdminCount(orgId) {
  return getMemberships().filter((m) => m.orgId === orgId && m.orgRole === 'admin').length
}

/** 某组织是否只剩一名管理员 */
export function isLastAdmin(userId, orgId) {
  const m = getMembership(userId, orgId)
  return m?.orgRole === 'admin' && getOrgAdminCount(orgId) <= 1
}

/**
 * 校验组织身份变更是否被允许（对应 Confluence 规则 4/5/6/7）。
 * @param {{ userId: string, orgId: string, nextRole: 'admin'|'member', operatorId?: string }} opts
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateOrgRoleChange({ userId, orgId, nextRole }) {
  const current = getMembership(userId, orgId)
  if (!current) return { ok: false, reason: '该成员不在本组织中' }
  if (current.orgRole === nextRole) return { ok: false, reason: '身份未发生变化' }

  // 取消管理员身份
  if (current.orgRole === 'admin' && nextRole === 'member') {
    if (isLastAdmin(userId, orgId)) {
      return { ok: false, reason: '组织仅剩一名管理员，不允许取消其管理员身份（可先转移管理员身份给其他成员）' }
    }
    return { ok: true }
  }
  // 普通成员提升为管理员
  if (current.orgRole === 'member' && nextRole === 'admin') {
    return { ok: true }
  }
  return { ok: false, reason: '不支持的变更' }
}

/**
 * 新增一名组织成员（用于邀请注册建号后落库组织身份）。
 * 与 setOrgRole 不同：这里不校验「身份变更规则」，因为成员尚不存在；
 * 若该成员已有记录则原样保留，避免覆盖已有身份。
 * @returns {{ ok: boolean, record?: Object }}
 */
export function addOrgMember(userId, orgId, orgRole = 'member', operator = '邀请注册') {
  const list = getMemberships()
  const exist = list.find((m) => m.userId === userId && m.orgId === orgId)
  if (exist) return { ok: true, record: exist }
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  // 新增成员：joinedAt 与 updatedAt 同为当前时间（首次加入即首次更新）
  const record = { userId, orgId, orgRole, joinedAt: nowStr, updatedBy: operator, updatedAt: nowStr }
  list.push(record)
  persist(list)
  return { ok: true, record }
}

/**
 * 设置组织身份（含规则校验），并记录最新一次更新的操作人与时间。
 * @returns {{ ok: boolean, reason?: string, record?: Object }}
 */
export function setOrgRole(userId, orgId, nextRole, operator = '组织管理员') {
  const check = validateOrgRoleChange({ userId, orgId, nextRole })
  if (!check.ok) return check

  const list = getMemberships()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  const idx = list.findIndex((m) => m.userId === userId && m.orgId === orgId)
  // 变更组织角色：保留原 joinedAt（加入时间不因角色调整而改变）
  const joinedAt = idx === -1 ? updatedAt : (list[idx].joinedAt || updatedAt)
  const record = { userId, orgId, orgRole: nextRole, joinedAt, updatedBy: operator, updatedAt }
  if (idx === -1) list.push(record)
  else list[idx] = record
  persist(list)
  return { ok: true, record }
}

/**
 * 把成员移出组织（删除该 (用户, 组织) 记录）。
 * 依据《成员权限》规则：组织仅剩一名管理员时，不允许移除该管理员（可先转移身份）。
 * @returns {{ ok: boolean, reason?: string }}
 */
export function removeOrgMember(userId, orgId) {
  const m = getMembership(userId, orgId)
  if (!m) return { ok: false, reason: '该成员不在本组织中' }
  if (m.orgRole === 'admin' && isLastAdmin(userId, orgId)) {
    return { ok: false, reason: '组织仅剩一名管理员，不允许移出（可先转移管理员身份给其他成员）' }
  }
  persist(getMemberships().filter((x) => !(x.userId === userId && x.orgId === orgId)))
  return { ok: true }
}

/**
 * 转移管理员身份：把 fromUserId 的管理员身份转给同组织的普通成员 toUserId，
 * 原管理员自动降级为普通成员（规则 6）。
 */
export function transferOrgAdmin(fromUserId, toUserId, orgId, operator = '组织管理员') {
  const from = getMembership(fromUserId, orgId)
  const to = getMembership(toUserId, orgId)
  if (!from || from.orgRole !== 'admin') return { ok: false, reason: '转出方不是本组织的管理员' }
  if (!to) return { ok: false, reason: '转入方不在本组织中' }
  if (to.orgRole === 'admin') return { ok: false, reason: '转入方已是本组织的管理员' }

  const list = getMemberships()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const write = (userId, orgRole) => {
    const idx = list.findIndex((m) => m.userId === userId && m.orgId === orgId)
    // 转移管理员身份：保留各自原 joinedAt
    const joinedAt = idx === -1 ? updatedAt : (list[idx].joinedAt || updatedAt)
    const rec = { userId, orgId, orgRole, joinedAt, updatedBy: operator, updatedAt }
    if (idx === -1) list.push(rec)
    else list[idx] = rec
  }
  write(toUserId, 'admin')
  write(fromUserId, 'member')
  persist(list)
  return { ok: true }
}
