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

import { USERS, ORGS, getUserOrgIds, CURRENT_USER_ID } from './orgData.js'
import { findOrg, deleteOrgRaw, isOrgCreatedByPlatformAdmin, isDemoOrgId, getDemoOrgIdSet, DEMO_ORG_SPECS } from './orgStore.js'
import { findExtraUser } from './extraUsers.js'
import { hasRole } from './permissionData.js'

const STORAGE_KEY = 'tosslib_org_memberships'
/**
 * 存储结构版本。递增即让旧存储失效、按新种子重建。
 *
 * 版本 1：初版种子。
 * 版本 2：演示组织由「各配 1~3 名普通成员」精简为「只留 1 名管理员」。
 *        必须递增 —— 旧的普通成员记录存在 localStorage 里，而 getMemberships()
 *        会把「不在种子里的存储记录」当作新增追加回来，仅改种子不会让它们消失。
 *        实测：不递增时仍残留 36 条演示组织的普通成员记录，
 *        成员列表的「组织角色」列继续被撑长（正是本次要修的问题）。
 */
const SEED_VERSION = 2

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
  /**
   * 演示组织（orgStore.DEMO_ORG_SPECS）的成员关系。
   * 这些组织的 id 不出现在任何用户的 orgIds 里（它们是「已创建的组织」，
   * 不是 orgData 里的内置示例），故不会被上面的循环覆盖 —— 必须单独补，
   * 否则组织列表里它们会显示「管理员 0 人 / 成员 0 人」，
   * 且「最后一名管理员不可移除」等规则因无管理人而失去意义。
   */
  DEMO_ORG_SPECS.forEach((spec) => {
    const joinedAt = `${spec.createdAt} 10:00`
    if (spec.adminUserId) {
      rows.push({
        userId: spec.adminUserId,
        orgId: spec.id,
        orgRole: 'admin',
        joinedAt,
        updatedBy: '系统初始化',
        updatedAt: '2026-08-01 09:00',
      })
    }
    ;(spec.memberUserIds || []).forEach((userId) => {
      rows.push({
        userId,
        orgId: spec.id,
        orgRole: 'member',
        joinedAt,
        updatedBy: '系统初始化',
        updatedAt: '2026-08-01 09:00',
      })
    })
  })
  return rows
}

const SEED_MEMBERSHIPS = buildSeed()

/** (用户, 组织) 联合主键 */
function keyOf(m) {
  return `${m.userId}@${m.orgId}`
}

/**
 * 清理指向**已下线演示组织**的成员关系（可反复安全调用）。
 *
 * 背景：演示组织从 36 个缩减到 15 个后，旧存档里 org-demo-16~36 的成员关系
 *   仍留在 localStorage 中，而 getMemberships() 会把「不在种子里的存储记录」
 *   当作新增追加回来 —— 实测：不清理时残留 21 条，成员列表的「组织角色」列
 *   会显示 org-demo-16 这样的裸 id，且每行组织数被撑长。
 *
 * 只删「演示类型 id 且已不在当前演示集合中」的记录：
 *   用户自建组织的成员关系（id 形如 org-<时间戳>）一律不动，
 *   用户对数据的既有修改（如自己加的成员）也不会因此丢失。
 */
function pruneStaleDemoMemberships() {
  try {
    const demoSet = getDemoOrgIdSet()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.list)) return
    const kept = parsed.list.filter((m) => !(isDemoOrgId(m.orgId) && !demoSet.has(m.orgId)))
    if (kept.length === parsed.list.length) return
    // 按既有结构写回，保留 removed 标记（否则「移出成员」会失效）
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      __seedVersion: Number(parsed.__seedVersion) || SEED_VERSION,
      list: kept,
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
    }))
  } catch (e) {
    // 读取/写入失败按无需清理处理
  }
}

/**
 * 读取存储：返回 { list, removed }。
 * removed 是「已删除的种子记录」的联合主键列表 —— 见 persist 的说明。
 */
function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) {
        return { list: parsed.list, removed: Array.isArray(parsed.removed) ? parsed.removed : [] }
      }
      return { list: [], removed: [] } // 结构升级：丢弃过期数据
    }
  } catch (e) {
    // 读取失败按无存储处理
  }
  return { list: [], removed: [] }
}

function load() {
  return readRaw().list
}

/**
 * 写入存储，并**自动推导删除标记**。
 *
 * 为什么需要删除标记：种子成员（SEED_MEMBERSHIPS）是凭空生成的基准数据，
 * 而 getMemberships() 每次都会把种子合并回来。若只从 list 里剔除，
 * 下次读取时该记录会被种子重新补上 —— 实测确认：移出种子成员、级联清理
 * 种子成员都因此完全失效（调用返回 ok:true，但记录仍在）。
 * 故在写入时记录「哪些种子键被删掉了」，读取时据此过滤。
 *
 * 推导方式刻意做成自动的：调用方只需照常传「期望的完整列表」，
 * 无需理解标记机制，既有的 addOrgMember / setOrgRole / removeOrgMember
 * 等调用点都不用改。重新加回某个种子键时（如再次邀请该成员），
 * 该键重新出现在 list 中，标记随之自动清除。
 */
function persist(list) {
  try {
    const present = new Set(list.map(keyOf))
    const removed = SEED_MEMBERSHIPS.map(keyOf).filter((k) => !present.has(k))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list, removed }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/**
 * 全部组织身份记录（种子 + 存储，按 (userId, orgId) 去重，存储优先）。
 * @returns {Array<{userId: string, orgId: string, orgRole: 'admin'|'member', updatedBy: string, updatedAt: string}>}
 */
export function getMemberships() {
  // 先清掉指向已下线演示组织的残留记录（无残留时立即返回，开销可忽略）
  pruneStaleDemoMemberships()
  const { list: stored, removed } = readRaw()
  const removedSet = new Set(removed)
  const storedMap = new Map(stored.map((m) => [keyOf(m), m]))
  // 被删掉的种子记录不再合并回来（否则「移出成员」「级联清理」都会失效）
  const merged = SEED_MEMBERSHIPS
    .filter((s) => !removedSet.has(keyOf(s)))
    .map((s) => storedMap.get(keyOf(s)) || s)
  // 存储中新增的（如通过任免产生的新成员关系）追加
  const seedKeys = new Set(SEED_MEMBERSHIPS.map(keyOf))
  stored.forEach((m) => { if (!seedKeys.has(keyOf(m))) merged.push(m) })
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
  // 平台管理员**可以**拥有组织归属（平台角色与组织角色是两套独立体系）：
  // 项目种子数据本身就有此组合（周雅琴 = 平台管理员 + org-002 成员），
  // 且「组织管理」页新建组织后创建者要直接成为该组织管理员，必须放开这条。
  // 注意：平台**角色**的锁定（guardPlatformAdminChange）依然有效，两者不要混为一谈。
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
  // 平台管理员的组织归属同样可改（理由见 addOrgMember）
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
  // 平台管理员的组织归属同样可移出（理由见 addOrgMember）
  const m = getMembership(userId, orgId)
  if (!m) return { ok: false, reason: '该成员不在本组织中' }
  if (m.orgRole === 'admin' && isLastAdmin(userId, orgId)) {
    return { ok: false, reason: '组织仅剩一名管理员，不允许移出（可先转移管理员身份给其他成员）' }
  }
  persist(getMemberships().filter((x) => !(x.userId === userId && x.orgId === orgId)))
  return { ok: true }
}

/**
 * 批量清理某组织的全部成员关系（供「删除组织」级联调用）。
 *
 * 为什么需要：组织的成员关系单独存于本模块，删组织时若不清理，会留下孤儿记录
 *   （组织已不存在，成员关系仍指向它）—— 实测确认原 deleteOrg 就会留下这种残留。
 *
 * 与 removeOrgMember 的区别：
 *   - removeOrgMember 是「移出某个成员」，受「最后一名管理员不可移除」与
 *     「平台管理员组织归属锁定」两条守卫约束；
 *   - 本函数是「组织整体消亡」，成员关系随之失去意义，故不加上述守卫
 *     —— 否则会因守卫拦截而清不干净。
 *
 * @returns {{ ok: boolean, removed: number }} removed 为清理掉的成员关系条数
 */
export function removeOrgMemberships(orgId) {
  if (!orgId) return { ok: false, removed: 0 }
  const list = getMemberships()
  const kept = list.filter((m) => m.orgId !== orgId)
  const removed = list.length - kept.length
  if (removed > 0) persist(kept)
  return { ok: true, removed }
}

/**
 * 删除组织（编排层）：权限判定 + 级联清理成员关系 + 删除组织。
 *
 * 权限口径（对应「组织管理」页 = 我的组织）：
 *   **只有该组织的管理员**可以删除。
 *   平台管理员不再享受跨组织豁免 —— 组织管理页展示的是「我所属的组织」，
 *   能在这里动手删的，应当是我确实在管的那个。平台级清理走
 *   dissolveOrgByPlatformAdmin（「组织列表」Tab）。
 *
 * 为什么放在本模块而不是 orgStore：
 *   本模块已 import orgStore（单向依赖）。若把编排逻辑写进 orgStore，
 *   就需要反向 import 本模块，形成循环引用。故此处单向调用 orgStore 的
 *   deleteOrgRaw（无权限校验的底层实现）。
 *
 * 顺序不可颠倒：先删组织、后清成员关系的话，中途失败会留下无归属的成员关系。
 * 这里先做权限与存在性校验，再删组织，最后清理成员关系。
 *
 * @param {string} orgId 目标组织
 * @param {string} [actorId] 操作人（默认取当前登录用户）
 * @returns {{ ok: boolean, reason?: string }}
 */
export function dissolveOrg(orgId, actorId) {
  if (!orgId) return { ok: false, reason: '缺少组织标识' }
  const actor = actorId || CURRENT_USER_ID

  const myRole = getMembership(actor, orgId)?.orgRole
  if (myRole !== 'admin') {
    // 提示区分两种情形，便于用户判断该找谁
    const joined = !!getMembership(actor, orgId)
    return {
      ok: false,
      reason: joined
        ? '仅组织管理员可删除本组织'
        : '您不是该组织的成员，无法删除',
    }
  }

  // 先删组织：deleteOrgRaw 会校验「内置组织不可删」「组织必须存在」，
  // 若这里先清了成员关系却删不掉组织，成员关系就白清了。
  const res = deleteOrgRaw(orgId)
  if (!res.ok) return res

  // 组织已删 → 清理其成员关系，避免留下孤儿数据
  removeOrgMemberships(orgId)
  return { ok: true }
}

/**
 * 删除组织（平台视角，对应「平台权限设置 → 组织列表」）。
 *
 * 权限口径：**仅平台管理员**可调用，且**只能删由平台管理员创建的组织**。
 *   理由：组织列表是平台级管理入口，但组织一旦是成员自己在「组织管理」页建的，
 *   那它就是那个组织自己的资产 —— 平台管理员不应越权删掉它，
 *   要删应由该组织的管理员在自己那边删。
 *
 * @param {string} orgId 目标组织
 * @param {string} [actorId] 操作人（默认取当前登录用户）
 * @returns {{ ok: boolean, reason?: string }}
 */
export function dissolveOrgByPlatformAdmin(orgId, actorId) {
  if (!orgId) return { ok: false, reason: '缺少组织标识' }
  const actor = actorId || CURRENT_USER_ID
  if (!hasRole(actor, 'platform-admin')) return { ok: false, reason: '仅平台管理员可删除组织' }

  const org = findOrg(orgId)
  if (!org) return { ok: false, reason: '该组织不存在' }
  if (!isOrgCreatedByPlatformAdmin(org)) {
    return {
      ok: false,
      reason: '该组织由组织成员创建，请由该组织的管理员在「组织管理」中删除',
    }
  }

  const res = deleteOrgRaw(orgId)
  if (!res.ok) return res
  removeOrgMemberships(orgId)
  return { ok: true }
}

/**
 * 账号被删除时，清理其在**所有组织**中的身份（供 accountData.deleteAccount 级联调用）。
 *
 * 为什么需要：成员关系与账号分开存储。账号删除后若不清理，会留下指向
 *   已不存在账号的成员关系（实测确认：user 字段为 null 的幽灵记录），
 *   而这条幽灵记录还会参与「最后一名管理员」判定（isLastAdmin 按记录条数算），
 *   导致该组织被卡死 —— 既移不掉，也改不了管理员。
 *
 * 边界（与规则 7 一致）：若该账号是某组织的**唯一**管理员，
 *   直接清理会让该组织失去管理员，与「组织必须有一名管理员」冲突，
 *   故拒绝并提示先转移管理员身份，而不是把组织变成无人管理。
 *
 * 与 removeOrgMember 的区别：本函数针对**账号整体注销**，
 *   故一次清理其在全部组织中的身份，且不受「平台管理员组织归属锁定」守卫约束
 *   —— 账号已不存在，再谈「组织归属不可修改」没有意义。
 *
 * @returns {{ ok: boolean, reason?: string, removed?: number, blockedOrgIds?: string[] }}
 */
export function removeUserMemberships(userId) {
  if (!userId) return { ok: false, reason: '缺少账号标识' }
  const list = getMemberships()
  const mine = list.filter((m) => m.userId === userId)

  // 唯一管理员检测：该账号是 admin，且所在组织只有他一个 admin
  const soleAdminOf = mine
    .filter((m) => m.orgRole === 'admin' && getOrgAdminCount(m.orgId) <= 1)
    .map((m) => m.orgId)
  if (soleAdminOf.length) {
    const names = soleAdminOf.map((id) => findOrg(id)?.name || id).join('、')
    return {
      ok: false,
      reason: `该账号是「${names}」的唯一管理员，请先转移管理员身份再删除账号`,
      blockedOrgIds: soleAdminOf,
      removed: 0,
    }
  }

  const kept = list.filter((m) => m.userId !== userId)
  const removed = list.length - kept.length
  if (removed > 0) persist(kept)
  return { ok: true, removed }
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
