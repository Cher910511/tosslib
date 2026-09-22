// ==================== 平台账号开通 · 数据层 ====================
// 账号合法性铁律：一个账号必须至少满足以下之一，否则为「未分配账号」，不合法：
//   ① 有至少一个平台角色；② 在至少一个组织里有组织角色。
//
// 背景：平台注册入口已关闭。新成员的账号来源分两类：
//   1. 平台级角色（审核专家 / 治理人员 / 监管机构 / 平台管理员）——由平台管理员在
//      「权限设置 → 新建账号」中直接建号并设置角色，不走邀请链接；
//   2. 组织成员——由组织管理员发送邀请链接自助注册（见 inviteData.js）。
//
// 说明：orgData.js 的 USERS 为静态导出（无持久化），
// 新建的账号存于本模块，与静态 USERS、邀请注册账号一起由 getAllAccounts() 对外提供。

import { USERS } from './orgData.js'
import { getRegisteredUsers } from './inviteData.js'
import { addOrgMember, getMemberships } from './orgMembershipData.js'
import { getMemberRoles, getMemberRolesOf, validateRoleMutex, setMemberRoles, isPlatformRole } from './permissionData.js'
import { findOrg } from './orgStore.js'

const ACCOUNT_KEY = 'tosslib_created_accounts'
const DISABLED_KEY = 'tosslib_disabled_accounts'
// 版本 2：新增「已新建账号」种子数据（首次访问自动落库，不再是空列表）
// 版本 3：账号模型统一为「用户名/密码/头像」—— loginName 改名 username、去掉 email/phone；
//         旧版本存储里没有 username 字段，会导致列表「用户名」列为空，故必须升版本让旧数据失效
// 版本 4：账号即用户名（改中文）+ 种子补初始密码，供列表「密码」列加密展示与复制
// 版本 5：种子补充「已禁用」「未分配」两种状态的账号，使列表三态均可查看
const SEED_VERSION = 5

/** 新建账号时可选的机构类型（对应《用户设置说明》的一级用户） */
export const INSTITUTION_TYPES = [
  { id: 'enterprise', name: '企业用户', desc: '需求汇总与下属管理' },
  { id: 'audit', name: '审核机构', desc: '入库 / 出库审核管理' },
  { id: 'care', name: '看护机构', desc: '代码质量看护' },
  { id: 'inspect', name: '检测机构', desc: '代码检测任务管理与确认' },
  { id: 'regulator', name: '监管机构', desc: '平台运行与风险监督管理' },
]

/** 账号状态三态 */
export const ACCOUNT_STATUS = {
  normal: { id: 'normal', name: '正常' },
  unassigned: { id: 'unassigned', name: '未分配' },
  disabled: { id: 'disabled', name: '已禁用' },
}

/** 账号状态中文名 */
export function accountStatusName(status) {
  return ACCOUNT_STATUS[status]?.name || '正常'
}

const pad = (n) => String(n).padStart(2, '0')
function fmt(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 种子账号：让「已新建账号」列表初始就有数据。
 * 与 createAccount 产出的结构保持一致；platformRoles 会一并写入共享角色存储。
 * 账号即用户名（中文），password 用于列表「密码」列的加密展示与复制。
 */
const SEED_ACCOUNTS = [
  {
    id: 'user-created-seed-1',
    name: '孙审核',
    username: '孙审核',
    password: 'Sk@2026Audit',
    avatar: '',
    role: 'member',
    orgId: null,
    orgIds: [],
    orgMemberships: [],
    platformRoles: ['audit-expert'],
    institution: 'audit',
    createdBy: 'admin',
    createdAt: '2026-08-18 10:20',
    updatedBy: 'admin',
    updatedAt: '2026-08-18 10:20',
  },
  {
    id: 'user-created-seed-2',
    name: '周治理',
    username: '周治理',
    password: 'Zg@2026Care',
    avatar: '',
    role: 'member',
    orgId: null,
    orgIds: [],
    orgMemberships: [],
    platformRoles: ['governor'],
    institution: 'care',
    createdBy: 'admin',
    createdAt: '2026-08-20 14:05',
    updatedBy: 'admin',
    updatedAt: '2026-08-20 14:05',
  },
  {
    id: 'user-created-seed-3',
    name: '吴监管',
    username: '吴监管',
    password: 'Wjg@2026Reg',
    avatar: '',
    role: 'member',
    orgId: null,
    orgIds: [],
    orgMemberships: [],
    platformRoles: ['regulator'],
    institution: 'regulator',
    createdBy: 'admin',
    createdAt: '2026-08-22 09:40',
    updatedBy: 'admin',
    updatedAt: '2026-08-22 09:40',
  },
  {
    id: 'user-created-seed-4',
    name: '郑运营',
    username: '郑运营',
    password: 'Zyy@2026Ops',
    avatar: '',
    role: 'member',
    orgId: null,
    orgIds: [],
    orgMemberships: [],
    platformRoles: ['platform-admin'],
    institution: null,
    createdBy: 'admin',
    createdAt: '2026-08-25 16:30',
    updatedBy: 'admin',
    updatedAt: '2026-08-25 16:30',
  },
  {
    id: 'user-created-seed-5',
    name: '王库主',
    username: '王库主',
    password: 'Wkz@2026Icbc',
    avatar: '',
    role: 'owner',
    orgId: 'org-001',
    orgIds: ['org-001'],
    orgMemberships: [{ orgId: 'org-001', orgRole: 'admin' }],
    // 组织管理员不是平台角色，其权限来自组织归属
    platformRoles: [],
    institution: 'enterprise',
    createdBy: 'admin',
    createdAt: '2026-08-28 11:15',
    updatedBy: 'admin',
    updatedAt: '2026-08-28 11:15',
  },
  // 「已禁用」示例：角色与组织归属都保留，仅账号被停用（无法登录）
  {
    id: 'user-created-seed-6',
    name: '孙停用',
    username: '孙停用',
    password: 'Sty@2026Off',
    avatar: '',
    role: 'member',
    orgId: 'org-002',
    orgIds: ['org-002'],
    orgMemberships: [{ orgId: 'org-002', orgRole: 'member' }],
    platformRoles: ['governor'],
    institution: 'care',
    createdBy: 'admin',
    createdAt: '2026-09-01 09:30',
    updatedBy: 'admin',
    updatedAt: '2026-09-05 14:20',
  },
  // 「未分配」示例：既无平台角色、也无组织角色（账号不合法，无法登录）
  {
    id: 'user-created-seed-7',
    name: '周未分配',
    username: '周未分配',
    password: 'Zwf@2026New',
    avatar: '',
    role: 'member',
    orgId: null,
    orgIds: [],
    orgMemberships: [],
    platformRoles: [],
    institution: null,
    createdBy: 'admin',
    createdAt: '2026-09-03 16:45',
    updatedBy: 'admin',
    updatedAt: '2026-09-03 16:45',
  },
]

/** 种子中被禁用的账号（仅记录 userId，禁用状态单独存一个 key） */
const SEED_DISABLED_IDS = ['user-created-seed-6']

/**
 * 读取存储原始负载。
 * @returns {{ exists: boolean, list: Array }} exists 表示「当前版本的有效存储已存在」
 */
function readRaw() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
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

function load() {
  return readRaw().list
}

function persist(list) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/**
 * 首次访问（或结构升级后）把种子账号落库。
 * 判定依据是「有效存储是否存在」，而不是「列表是否为空」——
 * 否则用户把账号全删光后刷新页面，种子账号会复活。
 */
let seeded = false
function ensureSeeded() {
  if (seeded) return
  seeded = true
  if (readRaw().exists) return
  const list = SEED_ACCOUNTS.map((a) => ({ ...a }))
  persist(list)
  // 禁用状态单独存一个 key：种子里的禁用账号需一并落库，否则列表显示不出「已禁用」
  writeDisabled([...SEED_DISABLED_IDS])
  // 同步：平台角色写入共享角色存储；组织身份写入组织成员存储
  list.forEach((u) => {
    if (u.platformRoles?.length) setMemberRoles(u.id, { platformRoles: u.platformRoles, operator: '系统初始化' })
    ;(u.orgMemberships || []).forEach((m) => addOrgMember(u.id, m.orgId, m.orgRole || 'member', '系统初始化'))
  })
}

/** 平台管理员新建的账号列表（按创建时间倒序；首次访问自动落种子） */
export function getCreatedAccounts() {
  ensureSeeded()
  return load()
    .map(normalizeAccount)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/**
 * 兼容归一化：早期数据用 loginName，账号模型统一后为 username。
 * 兜底映射避免历史数据导致「用户名」列为空（只显示头像）。
 */
function normalizeAccount(u) {
  const username = u.username || u.loginName || u.email || ''
  return {
    ...u,
    username,
    // 展示名兜底：姓名 → 用户名（成员列表/组织成员列表均以 name 渲染）
    name: u.name || username,
  }
}

/* ===== 禁用状态 ===== */
function readDisabled() {
  try {
    const raw = localStorage.getItem(DISABLED_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) return parsed.list
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    // 读取失败按无数据
  }
  return []
}

function writeDisabled(list) {
  try {
    localStorage.setItem(DISABLED_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list }))
  } catch (e) {
    // 存储不可用时静默失败
  }
}

/** 已禁用的账号 id 列表 */
export function getDisabledIds() {
  return readDisabled()
}

/** 账号是否已禁用 */
export function isAccountDisabled(userId) {
  return readDisabled().includes(userId)
}

/** 禁用 / 启用账号 */
export function setAccountDisabled(userId, disabled, operator = '系统') {
  const list = readDisabled()
  const next = disabled
    ? [...new Set([...list, userId])]
    : list.filter((id) => id !== userId)
  writeDisabled(next)
  // 留痕：写回新建账号的更新人/时间（内置账号无记录则跳过）
  touchAccount(userId, operator)
  return { ok: true }
}

/** 写入更新人/更新时间（仅对平台新建的账号生效） */
export function touchAccount(userId, operator = '系统') {
  const list = load()
  const idx = list.findIndex((u) => u.id === userId)
  if (idx === -1) return
  list[idx] = { ...list[idx], updatedBy: operator, updatedAt: fmt(new Date()) }
  persist(list)
}

/**
 * 账号合法性：有平台角色 或 在至少一个组织里有组织角色。
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateAccountValidity(userId) {
  const hasPlatform = getMemberRolesOf(userId).length > 0
  const hasOrg = getMemberships().some((m) => m.userId === userId)
  if (!hasPlatform && !hasOrg) {
    return { ok: false, reason: '账号必须至少拥有一个平台角色或一个组织角色' }
  }
  return { ok: true }
}

/**
 * 账号状态：已禁用 > 未分配 > 正常
 * @returns {'normal'|'unassigned'|'disabled'}
 */
export function getAccountStatus(userId) {
  if (isAccountDisabled(userId)) return 'disabled'
  const hasPlatform = getMemberRolesOf(userId).length > 0
  const hasOrg = getMemberships().some((m) => m.userId === userId)
  return (!hasPlatform && !hasOrg) ? 'unassigned' : 'normal'
}

/**
 * 登录校验：按用户名（即登录账号）判断该账号当前是否允许登录。
 * 校验顺序与优先级：账号不存在 → 已禁用 → 未分配角色。
 * 注意：已禁用优先于未分配——被禁用的账号一律提示「该账号已禁用」，
 * 不向登录方暴露其角色分配情况。
 * @param {string} username 用户名（登录账号）
 * @returns {{ ok: boolean, reason?: string, status?: string, userId?: string }}
 */
export function validateLogin(username) {
  const name = String(username || '').trim().toLowerCase()
  if (!name) return { ok: false, reason: '请输入用户名' }

  const user = getAllAccounts().find(
    (u) => String(u.username || u.email || '').trim().toLowerCase() === name,
  )
  if (!user) return { ok: false, reason: '账号不存在' }

  const status = getAccountStatus(user.id)
  if (status === 'disabled') return { ok: false, reason: '该账号已禁用', status, userId: user.id }
  if (status === 'unassigned') {
    return { ok: false, reason: '该账号未分配角色，请联系平台管理员', status, userId: user.id }
  }
  return { ok: true, status, userId: user.id }
}

/**
 * 用户名是否已被占用：跨「新建账号」与「邀请注册账号」查重（大小写不敏感）。
 * 邀请注册的账号以邮箱作为登录标识，故一并纳入比对。
 */
export function isLoginNameTaken(username) {
  const n = String(username || '').trim().toLowerCase()
  if (!n) return false
  const inCreated = load().some((u) => String(u.username || '').trim().toLowerCase() === n)
  if (inCreated) return true
  // 邀请注册的账号：优先取 username，兼容早期以 email 作为登录标识的数据
  return getRegisteredUsers().some((u) => {
    const key = String(u.username || u.email || '').trim().toLowerCase()
    return key === n
  })
}

/** 生成账号 ID */
function genUserId() {
  return `user-created-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}

/**
 * 生成初始密码：12 位，含大小写字母、数字与符号，避免歧义字符（0/O、1/l/I）。
 * 用于「新建账号」留空密码时自动生成，保证密码列始终有值可复制。
 */
function genPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digit = '23456789'
  const symbol = '@#$%&*'
  const all = upper + lower + digit + symbol
  const pick = (s) => s[Math.floor(Math.random() * s.length)]
  // 先各取一位保证字符类型齐全，再补足长度后打乱
  const chars = [pick(upper), pick(lower), pick(digit), pick(symbol)]
  while (chars.length < 12) chars.push(pick(all))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

/**
 * 新建平台账号。
 * 账号信息只有三项：用户名（即登录账号）/ 密码 / 头像。
 * @param {{ name?: string, username: string, password?: string, avatar?: string,
 *   platformRoles?: string[], institution?: string|null,
 *   orgMemberships?: Array<{orgId: string, orgRole: 'admin'|'member'}>,
 *   orgId?: string|null, orgRole?: 'admin'|'member'|null, operator?: string }} opts
 *   orgId/orgRole 为兼容旧的单组织调用
 * @returns {{ ok: boolean, reason?: string, user?: Object }}
 */
export function createAccount(opts = {}) {
  const {
    name = '', username = '', password = '', avatar = '',
    platformRoles = [], institution = null,
    orgMemberships, orgId = null, orgRole = null, operator = '系统',
  } = opts

  // 归一化组织归属：新格式数组优先，兼容旧的单组织参数
  const orgList = Array.isArray(orgMemberships)
    ? orgMemberships.filter((m) => m && m.orgId)
    : (orgId ? [{ orgId, orgRole: orgRole || 'member' }] : [])

  // 用户名即登录账号，必填且平台唯一
  if (!String(username).trim()) return { ok: false, reason: '请填写用户名' }
  if (isLoginNameTaken(username)) return { ok: false, reason: '用户名已存在，请更换' }

  // 铁律：平台角色 与 组织归属 至少填一项。
  // 先过滤掉非法/已下线的角色 id（如旧数据里的 'ops'、'general'），避免脏角色落库。
  const roles = [...new Set(platformRoles)].filter((r) => isPlatformRole(r))
  if (!roles.length && !orgList.length) {
    return { ok: false, reason: '必须至少分配平台角色或加入一个组织' }
  }
  // 互斥规则
  const mutex = validateRoleMutex(roles)
  if (!mutex.ok) return { ok: false, reason: mutex.reason }
  // 每条组织归属必须选组织角色，且组织必须存在
  for (const m of orgList) {
    if (!findOrg(m.orgId)) return { ok: false, reason: '所选组织不存在' }
    if (!m.orgRole) return { ok: false, reason: '请为每个组织选择组织角色' }
  }

  const now = new Date()
  const primaryOrg = orgList[0]?.orgId || null
  const user = {
    id: genUserId(),
    // 姓名可选：未填时用用户名充当展示名（成员列表/组织成员等处均以 name 渲染）
    name: String(name).trim() || String(username).trim(),
    username: String(username).trim(),
    // 密码留空时自动生成，与表单「留空则系统生成」的承诺一致，
    // 也保证「已新建账号」列表的密码列始终可复制
    password: String(password || '').trim() || genPassword(),
    avatar: String(avatar || ''),
    // 主组织身份决定 role 字段（兼容既有页面按 role 渲染的逻辑）
    role: orgList[0]?.orgRole === 'admin' ? 'owner' : 'member',
    orgId: primaryOrg,
    orgIds: orgList.map((m) => m.orgId),
    orgMemberships: orgList.map((m) => ({ orgId: m.orgId, orgRole: m.orgRole || 'member' })),
    platformRoles: roles,
    institution,
    createdBy: operator,
    createdAt: fmt(now),
    updatedBy: operator,
    updatedAt: fmt(now),
  }

  const list = load()
  list.push(user)
  persist(list)

  // 平台角色写入共享角色存储（permissionData）：保证成员列表 / 角色设置 / 权限矩阵
  // 使用的是同一份数据，否则账号状态会被误判为「未分配」
  if (roles.length) {
    setMemberRoles(user.id, { platformRoles: roles, operator })
  }

  // 落库组织身份，使其出现在「组织管理 → 组织成员」列表中
  orgList.forEach((m) => addOrgMember(user.id, m.orgId, m.orgRole || 'member', operator))
  return { ok: true, user }
}

/** 删除新建的账号（仅限本模块创建的账号），并清理禁用标记 */
export function deleteAccount(userId) {
  persist(load().filter((u) => u.id !== userId))
  writeDisabled(readDisabled().filter((id) => id !== userId))
}

/**
 * 平台上的全部账号（静态 USERS + 邀请注册 + 平台新建），并附带：
 *   platformRoles 平台角色（只含平台角色）、orgCount 组织数、status 账号状态。
 * 静态 USERS 在前，保证既有顺序稳定。
 */
export function getAllAccounts() {
  ensureSeeded()
  const roleMap = new Map(getMemberRoles().map((m) => [m.userId, m.platformRoles || []]))
  const orgCountMap = new Map()
  getMemberships().forEach((m) => {
    orgCountMap.set(m.userId, (orgCountMap.get(m.userId) || 0) + 1)
  })
  const disabled = new Set(getDisabledIds())

  const decorate = (u, source) => {
    const platformRoles = roleMap.get(u.id) || []
    const orgCount = orgCountMap.get(u.id) || 0
    let status = 'normal'
    if (disabled.has(u.id)) status = 'disabled'
    else if (!platformRoles.length && !orgCount) status = 'unassigned'
    return {
      ...u,
      accountSource: source,
      platformRoles,
      orgCount,
      status,
      statusName: accountStatusName(status),
    }
  }

  return [
    ...USERS.map((u) => decorate(u, 'builtin')),
    ...getRegisteredUsers().map((u) => decorate(u, 'invite')),
    ...load().map((u) => decorate(u, 'created')),
  ]
}

/** 账号来源文案（列表展示用） */
export function accountSourceName(source) {
  return { builtin: '系统内置', invite: '邀请注册', created: '平台新建' }[source] || '—'
}
