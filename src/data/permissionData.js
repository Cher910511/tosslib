// ==================== 平台权限设置 · 数据层 ====================
// 依据材料整理：
// - 「功能权限说明-0908-V1」Sheet2：平台一级菜单对各角色的可见性矩阵；
// - 「用户设置说明」中的岗位（工程师用户、入库审核员、看护专家、检测员、监管员等）
//   不作为独立层级，统一归入下列角色，仅作为该角色「覆盖岗位」展示。
// - 成员与角色的绑定关系存 localStorage，供「权限设置」页维护。

import { CURRENT_USER_ID } from './orgData.js'

const STORAGE_KEY = 'tosslib_member_roles'
// 版本 3：从平台角色中移除「组织管理员」（改为 (人,组织) 上的组织身份，见 orgMembershipData.js）
// 版本 4：平台角色改为多选（platformRole → platformRoles 数组），一人可同时持多个角色，权限取并集
// 版本 5：修正「人人有角色」不变量（补齐 6 名组织普通成员的基线角色）
// 版本 6：角色模型重构 —— 平台角色收敛为 5 个（「一般人员」下沉为组织角色）、
//          新增互斥规则与平台管理员自改保护，平台角色允许为空（组织角色可单独成立）
// 版本 7：取消互斥规则（角色可自由叠加）+ 补充多平台角色种子数据
// 版本 8：删除「系统运营」平台角色（并入平台管理员），种子成员随之调整
const SEED_VERSION = 8

// ==================== 角色模型（两类独立身份，不可混用） ====================
// 铁律：平台角色列只出现平台角色；组织角色只出现在组织归属里。
// 任何页面都不允许把「审核人员、一般人员」这类混合值放进同一格。
//
// 账号 → 平台角色：一对多（可多选，各角色权限取并集）
// 账号 → 组织：多对多
// 账号 → 组织内角色：每个组织一个

/**
 * 平台级角色（平台管理员 / 审核人员 / 治理人员 / 监管人员）。
 * posts 为该角色覆盖的岗位（仅作说明展示，不参与权限计算）。
 */
export const PLATFORM_ROLES = [
  {
    id: 'audit-expert',
    name: '审核人员',
    group: '治理和看护',
    posts: ['出入库审核员'],
    desc: '审核代码入库/出库合规性，负责治理任务分配与入库审核确认',
  },
  {
    id: 'governor',
    name: '治理人员',
    group: '治理和看护',
    posts: ['看护专家', '检测员'],
    desc: '评估代码风险、执行检测、上传治理成果',
  },
  {
    id: 'regulator',
    name: '监管人员',
    group: '监管人员',
    posts: ['风险预警', '平台运营监管员'],
    desc: '监控安全风险、发起预警、监督平台运营规范性',
  },
  {
    id: 'platform-admin',
    name: '平台管理员',
    group: '平台运营',
    posts: ['平台运营人员', '平台超级管理员'],
    desc: '平台运营方与超级管理员，拥有全部功能权限，可维护平台权限设置',
  },
]

/**
 * 组织级角色（一般人员 / 组织管理员）。
 * 组织角色按 (账号, 组织) 存储，同一账号在不同组织可有不同角色。
 * 与 orgMembershipData.ORG_ROLES 的 id 保持一致（member / admin）。
 */
export const ORG_ROLE_OPTIONS = [
  {
    id: 'member',
    name: '一般人员',
    group: '组织级角色',
    // 覆盖岗位：取自《用户设置说明》——企业用户可开通并管理下属「工程师用户」
    posts: ['组织级角色'],
    desc: '组织内的普通使用者：提出代码需求、查阅下载代码',
  },
  {
    id: 'admin',
    name: '组织管理员',
    group: '组织级角色',
    posts: ['组织级角色'],
    desc: '组织最高权限：管理组织成员、组织角色权限与组织信息',
  },
]

/**
 * 平台角色互斥规则：已按业务要求取消互斥，所有角色均可自由叠加。
 * 保留此常量与 validateRoleMutex 仅为兼容既有调用点；如需恢复互斥，
 * 在此按 [角色A, 角色B] 成对添加即可，各处校验会自动生效。
 */
export const ROLE_MUTEX = []

/** 按角色 id 取角色定义（含平台角色与组织角色） */
export function getRole(roleId) {
  return PLATFORM_ROLES.find((r) => r.id === roleId)
    || ORG_ROLE_OPTIONS.find((r) => r.id === roleId)
    || null
}

/** 按角色 id 取角色名（未分配时返回「未分配」） */
export function roleName(roleId) {
  return getRole(roleId)?.name || '未分配'
}

/** 是否为平台角色 */
export function isPlatformRole(roleId) {
  return PLATFORM_ROLES.some((r) => r.id === roleId)
}

/** 是否为组织角色 */
export function isOrgRole(roleId) {
  return ORG_ROLE_OPTIONS.some((r) => r.id === roleId)
}

/**
 * 校验一组平台角色是否违反互斥规则。
 * 当前 ROLE_MUTEX 为空 → 任意角色组合均合法（全部可叠加）。
 * @returns {{ ok: boolean, conflict?: [string, string], reason?: string }}
 */
export function validateRoleMutex(roleIds = []) {
  const set = new Set(roleIds)
  for (const [a, b] of ROLE_MUTEX) {
    if (set.has(a) && set.has(b)) {
      return {
        ok: false,
        conflict: [a, b],
        reason: `「${roleName(a)}」与「${roleName(b)}」互斥，请先取消其中一个`,
      }
    }
  }
  return { ok: true }
}

/** 岗位 → 所属角色名（供参考展示） */
export function roleOfPost(postName) {
  const hit = PLATFORM_ROLES.find((r) => (r.posts || []).includes(postName))
  return hit ? hit.name : '—'
}

// ==================== 菜单权限矩阵 ====================
// 行 = 一级菜单，列 = 角色。列分两组**展示**（组织级 / 平台级），两组在权限配置上完全同权、均可编辑。
// 单元格只有两态：true=可访问(√) / false=不可访问(空)。
// 取值严格对齐《功能权限说明-0908-V1》Sheet2。

/** 矩阵列：组织级角色 + 平台级角色（仅分组展示，编辑权限一致） */
export const MATRIX_ROLES = [
  ...ORG_ROLE_OPTIONS.map((r) => ({ ...r, groupTag: '组织级角色' })),
  ...PLATFORM_ROLES,
]

/**
 * 矩阵中不可编辑的单元格：仅平台管理员列（恒为全部权限）。
 */
export function isMatrixCellLocked(menuId, roleId) {
  return roleId === 'platform-admin'
}

/**
 * 平台功能菜单与各角色权限。
 * grants 内为可访问(√)的角色 id，其余角色为不可访问(空)。
 * 角色 id：组织级 member/admin；平台级 audit-expert/governor/regulator/ops/platform-admin。
 * 取值严格对齐《功能权限说明-0908-V1》Sheet2。
 */
export const MENU_PERMISSIONS = [
  { id: 'data-screen', name: '数据大屏', desc: '平台数据可视化大屏，图表化展示软件、漏洞、风险、许可证等统计分析', grants: ['regulator'] },
  { id: 'sentiment', name: '舆情分析', desc: '实时感知和展示开源舆情大事记、实时舆情、热门舆情、漏洞信息等', grants: ['regulator'] },
  { id: 'data-board', name: '数据看板', desc: '根据监管需要定制标准化统计报表，支撑指标核算与定期汇报', grants: ['regulator'] },
  { id: 'home', name: '首页', desc: '平台首页：风险预警、优质软件推荐、软件检索入口等', grants: ['member', 'admin'] },
  { id: 'software-library', name: '软件库', desc: '软件检索与软件详细信息展示（版本、依赖、漏洞、SBOM、许可证等）', grants: ['member', 'admin', 'audit-expert'] },
  { id: 'artifact-library', name: '制品库', desc: '制品检索与版本信息、依赖路径、SBOM 展示，支持版本比对与依赖风险分析', grants: ['member', 'admin', 'audit-expert'] },
  { id: 'ai-assistant', name: 'AI 助手', desc: '智能助手，辅助完成开源选型、组件比对、合规校验等', grants: ['member', 'admin', 'audit-expert'] },
  { id: 'signature-verify', name: '签名验证', desc: '软件、组件的签名验证，支持签名文件上传、验证执行与结果查看', grants: ['member', 'admin'] },
  { id: 'gov-tools', name: '治理工具', desc: '治理功能与流水线集成，覆盖软件组成分析、漏洞检测、许可证合规、SBOM 生成', grants: ['member', 'admin'] },
  { id: 'dev-tools', name: '研发工具', desc: '全链路开源治理工具集：软件超级工厂、VSCode 插件、Notebook 等', grants: ['member', 'admin'] },
  { id: 'org-manage', name: '组织管理', desc: '组织驾驶舱、企业认证、成员邀请、成员管理、预警信息、版本火车等', grants: ['admin'] },
  { id: 'code-demand', name: '软件入库需求反馈', desc: '上传需入库的软件列表，与看护团队治理功能联动', grants: ['admin'] },
  { id: 'care-assign', name: '软件看护-入库需求反馈分配', desc: '接收平台分配的用户软件治理需求，分配治理任务', grants: ['audit-expert'] },
  // 我的待治理清单：治理人员查看分配给自己的治理任务；平台管理员可见
  { id: 'my-governance-tasks', name: '软件看护-我的待治理清单', desc: '治理人员查看分配给自己的治理任务', grants: ['governor'] },
  { id: 'care-govern', name: '软件看护-软件看护与治理', desc: '软件更新感知与治理，上传治理成果', grants: ['governor'] },
  { id: 'care-approve', name: '软件看护-审批入库', desc: '对治理成果进行验收并确认入库', grants: ['audit-expert'] },
  { id: 'admin-console', name: '后台管理', desc: '超级管理员操作界面：软件出入库管理、企业认证审核等', grants: [] },
  { id: 'admin-alert', name: '后台管理-漏洞预警', desc: '发起风险预警，提交软件出入库申请', grants: ['governor'] },
  { id: 'admin-outbound', name: '后台管理-软件出入库', desc: '审核软件出库申请', grants: ['audit-expert', 'regulator'] },
  // 个人设置：所有角色均可访问（个人账户相关）
  { id: 'personal-settings', name: '个人设置', desc: '个人信息、订阅列表、预警信息等个人账户设置', grants: ['member', 'admin', 'audit-expert', 'governor', 'regulator'] },
  // 我的反馈清单：仅组织管理员可见（本组织提交的需求反馈及状态）
  { id: 'my-feedback', name: '个人设置-我的反馈清单', desc: '查看提交的软件需求反馈及处理状态', grants: ['admin'] },
  // 密钥管理：与「治理工具」同权限（能访问治理工具者即可管理密钥）
  { id: 'api-keys', name: '密钥管理', desc: '管理访问平台 API 的密钥，用于治理工具与流水线集成', grants: ['member', 'admin'] },
  { id: 'manual', name: '使用手册', desc: '平台使用帮助文档入口，覆盖功能使用说明与常见问题', grants: ['member', 'admin', 'audit-expert', 'governor', 'regulator'] },
]

/** 把矩阵展开为 { menuId: { roleId: boolean } }，平台管理员默认全开 */
export function buildPermissionMatrix() {
  const matrix = {}
  MENU_PERMISSIONS.forEach((menu) => {
    matrix[menu.id] = {}
    // 遍历 MATRIX_ROLES，保证矩阵列与表头一致
    MATRIX_ROLES.forEach((role) => {
      // 平台管理员恒为全部权限
      matrix[menu.id][role.id] = role.id === 'platform-admin'
        ? true
        : menu.grants.includes(role.id)
    })
  })
  return matrix
}

// ==================== 成员角色绑定（localStorage） ====================
/**
 * 平台角色为多选：一个成员可同时持有多个角色，其可用菜单取各角色权限的并集。
 * 典型场景：某工程师既是一般人员（查软件库），又被派为治理人员（做安全治理）。
 * @typedef {{ userId: string, platformRoles: string[], updatedBy: string, updatedAt: string }} MemberRole
 */

/**
 * 种子绑定：平台角色（组织角色另见 orgMembershipData）。
 * 一个账号可以「无平台角色但有组织角色」，这同样合法；故此处允许空数组。
 * updatedBy/updatedAt 表示该绑定「最新一次更新」由谁在何时完成。
 */
const SEED_MEMBERS = [
  { userId: 'user-super-1', platformRoles: ['platform-admin'], updatedBy: '系统初始化', updatedAt: '2026-08-01 09:00' },
  // 组织管理员：无平台角色，其权限来自组织归属（组织级角色 = 组织管理员）
  { userId: 'user-admin-1', platformRoles: [], updatedBy: 'admin', updatedAt: '2026-08-01 09:10' },
  { userId: 'user-admin-2', platformRoles: ['audit-expert'], updatedBy: 'admin', updatedAt: '2026-08-02 10:20' },
  // 治理人员 + 监管人员：多平台角色示例（互斥规则已取消，可自由叠加）
  { userId: 'user-admin-3', platformRoles: ['governor', 'regulator'], updatedBy: 'admin', updatedAt: '2026-08-02 10:25' },
  { userId: 'user-admin-4', platformRoles: ['regulator'], updatedBy: 'admin', updatedAt: '2026-08-03 14:05' },
  // 以下均为组织成员：无平台角色，权限来自组织归属（组织级角色 = 一般人员）
  { userId: 'user-mem-1', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-05 11:30' },
  { userId: 'user-mem-2', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-05 11:32' },
  { userId: 'user-mem-3', platformRoles: ['governor', 'audit-expert'], updatedBy: 'admin', updatedAt: '2026-08-06 16:40' },
  { userId: 'user-mem-4', platformRoles: ['platform-admin', 'audit-expert'], updatedBy: 'admin', updatedAt: '2026-08-06 16:45' },
  { userId: 'user-mem-5', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-08 09:15' },
  { userId: 'user-mem-6', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-10 10:05' },
  { userId: 'user-mem-7', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-10 10:08' },
  { userId: 'user-mem-8', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-11 09:20' },
  { userId: 'user-mem-9', platformRoles: [], updatedBy: 'zhangjianguo', updatedAt: '2026-08-11 09:22' },
  { userId: 'user-mem-10', platformRoles: [], updatedBy: 'chenxiaofeng', updatedAt: '2026-08-12 14:30' },
  { userId: 'user-mem-11', platformRoles: [], updatedBy: 'chenxiaofeng', updatedAt: '2026-08-12 14:33' },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) return parsed.list
      return [] // 结构升级：丢弃过期种子绑定，回到初始态
    }
    if (Array.isArray(parsed)) return [] // 旧格式，按过期处理
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
 * 归一化：兼容旧的单值 platformRole，统一为 platformRoles 数组。
 * 只保留合法的**平台角色** id（组织角色不存于此）；允许为空数组
 * —— 「无平台角色但有组织角色」是合法状态，账号合法性由 accountData 统一判定。
 */
function normalize(m) {
  const roles = Array.isArray(m.platformRoles)
    ? m.platformRoles
    : (m.platformRole ? [m.platformRole] : [])
  const valid = PLATFORM_ROLES.map((r) => r.id)
  const cleaned = [...new Set(roles)].filter((r) => valid.includes(r))
  return {
    ...m,
    platformRoles: cleaned,
    updatedBy: m.updatedBy || '—',
    updatedAt: m.updatedAt || '—',
  }
}

/** 读取全部成员角色绑定（无存储时回落到种子数据） */
export function getMemberRoles() {
  const stored = load()
  if (!stored.length) return SEED_MEMBERS.map(normalize)
  const storedIds = new Set(stored.map((m) => m.userId))
  // 种子成员未出现在存储中时补齐，避免新种子成员丢失
  const merged = stored.concat(SEED_MEMBERS.filter((m) => !storedIds.has(m.userId)))
  return merged.map(normalize).filter((m) => m.userId)
}

/** 按用户取绑定（无记录时返回 null） */
export function getMemberRole(userId) {
  return getMemberRoles().find((m) => m.userId === userId) || null
}

/** 取某成员的角色 id 数组（无记录返回空数组） */
export function getMemberRolesOf(userId) {
  return getMemberRole(userId)?.platformRoles || []
}

/** 某成员是否持有某角色 */
export function hasRole(userId, roleId) {
  return getMemberRolesOf(userId).includes(roleId)
}

/** 某成员可用菜单的并集（按各角色权限矩阵取并集） */
export function getMenuIdsOfMember(userId) {
  const roles = getMemberRolesOf(userId)
  const matrix = getPermissionMatrix()
  return MENU_PERMISSIONS
    .filter((menu) => roles.some((r) => matrix[menu.id]?.[r]))
    .map((menu) => menu.id)
}

/** 内部：写入角色数组，记录最新一次更新的操作人与时间 */
function writeRoles(userId, platformRoles, operator) {
  const list = getMemberRoles()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const idx = list.findIndex((m) => m.userId === userId)
  // 角色清空时直接移除记录，回到「未分配」
  if (!platformRoles.length) {
    if (idx !== -1) list.splice(idx, 1)
    persist(list)
    return null
  }
  const next = { userId, platformRoles: [...new Set(platformRoles)], updatedBy: operator, updatedAt }
  if (idx === -1) list.push(next)
  else list[idx] = next
  persist(list)
  return next
}

/**
 * 设置某成员的全部角色（整体覆盖）。传空数组即撤销全部角色。
 * @param {string} userId
 * @param {{ platformRoles?: string[], platformRole?: string, operator?: string }} opts
 *   兼容旧调用：传 platformRole 字符串时等价于单角色
 */
/**
 * 平台管理员自改保护：平台管理员不能给自己增删平台角色，只能由其他平台管理员操作。
 * @returns {{ ok: boolean, reason?: string }}
 */
export function guardSelfPlatformAdminChange(userId) {
  const isAdmin = getMemberRolesOf(userId).includes('platform-admin')
  if (isAdmin && userId === CURRENT_USER_ID) {
    return { ok: false, reason: '平台管理员不能修改自己的平台角色，请由其他平台管理员操作' }
  }
  return { ok: true }
}

/** 设置某成员的全部平台角色（整体覆盖）。传空数组即撤销全部平台角色。 */
export function setMemberRoles(userId, { platformRoles, platformRole, operator = '系统' }) {
  const guard = guardSelfPlatformAdminChange(userId)
  if (!guard.ok) return guard
  const roles = Array.isArray(platformRoles)
    ? platformRoles
    : (platformRole ? [platformRole] : [])
  // 互斥校验
  const mutex = validateRoleMutex(roles)
  if (!mutex.ok) return { ok: false, reason: mutex.reason }
  return { ok: true, record: writeRoles(userId, roles, operator) }
}

/** 追加一个平台角色（不影响该成员已有角色） */
export function addRole(userId, roleId, operator = '系统') {
  const guard = guardSelfPlatformAdminChange(userId)
  if (!guard.ok) return guard
  const current = getMemberRolesOf(userId)
  if (current.includes(roleId)) return { ok: true, record: getMemberRole(userId) }
  const next = [...current, roleId]
  const mutex = validateRoleMutex(next)
  if (!mutex.ok) return { ok: false, reason: mutex.reason }
  return { ok: true, record: writeRoles(userId, next, operator) }
}

/**
 * 移除一个平台角色（其余平台角色保留）。
 * 注意：是否允许「平台角色清空」由账号合法性统一判定（accountData）——
 * 只要该账号在某个组织里有组织角色，就仍然合法，故此处不再拦截。
 */
export function removeRole(userId, roleId, operator = '系统') {
  const guard = guardSelfPlatformAdminChange(userId)
  if (!guard.ok) return guard
  const current = getMemberRolesOf(userId)
  const next = current.filter((r) => r !== roleId)
  return { ok: true, record: writeRoles(userId, next, operator) }
}

/** 替换平台角色：把某成员的平台角色整体设为指定集合（可为空） */
export function replaceRoles(userId, roleIds, operator = '系统') {
  const guard = guardSelfPlatformAdminChange(userId)
  if (!guard.ok) return guard
  const roles = [...new Set(roleIds || [])]
  const mutex = validateRoleMutex(roles)
  if (!mutex.ok) return { ok: false, reason: mutex.reason }
  return { ok: true, record: writeRoles(userId, roles, operator) }
}

/** 撤销某成员的全部平台角色（回到「未分配」状态） */
export function removeMemberRole(userId) {
  const list = getMemberRoles().filter((m) => m.userId !== userId)
  persist(list)
}

/** 统计各平台角色的成员数（一人多角色时分别计入各角色） */
export function countByPlatformRole() {
  const counts = {}
  PLATFORM_ROLES.forEach((r) => { counts[r.id] = 0 })
  getMemberRoles().forEach((m) => {
    (m.platformRoles || []).forEach((r) => {
      if (counts[r] != null) counts[r] += 1
    })
  })
  return counts
}

// ==================== 权限矩阵（可编辑 + 配置表锁定） ====================
// 默认值由「角色-功能」配置表推导；手工调整落库为布尔值覆盖。
// 锁定规则（见 isMatrixCellLocked）：仅平台管理员列恒为全开，不接受修改。
const MATRIX_KEY = 'tosslib_permission_matrix'
const LOG_KEY = 'tosslib_permission_log'
/** 日志种子版本：变更种子内容时递增，使旧日志让位新种子
 *  版本 3：角色改名（审核专家→审核人员、监管机构→监管人员），旧日志需让位 */
const LOG_SEED_VERSION = 3
/** 更新日志保留条数上限 */
const LOG_LIMIT = 200

const pad2 = (n) => String(n).padStart(2, '0')
function fmtNow() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 读取权限矩阵：配置表默认值 + 允许范围内的手工覆盖 */
export function getPermissionMatrix() {
  const base = buildPermissionMatrix()
  try {
    const raw = localStorage.getItem(MATRIX_KEY)
    const saved = raw ? JSON.parse(raw) : null
    if (saved && typeof saved === 'object') {
      MENU_PERMISSIONS.forEach((menu) => {
        MATRIX_ROLES.forEach((role) => {
          if (isMatrixCellLocked(menu.id, role.id)) return
          const v = saved[menu.id]?.[role.id]
          if (typeof v === 'boolean') base[menu.id][role.id] = v
        })
      })
    }
  } catch (e) {
    // 读取失败时使用配置表默认值
  }
  return base
}

/** 保存权限矩阵：锁定单元格不落盘（保持配置表定义） */
export function setPermissionMatrix(matrix) {
  try {
    const out = {}
    MENU_PERMISSIONS.forEach((menu) => {
      const row = {}
      MATRIX_ROLES.forEach((role) => {
        if (isMatrixCellLocked(menu.id, role.id)) return
        const v = matrix[menu.id]?.[role.id]
        if (typeof v === 'boolean') row[role.id] = v
      })
      out[menu.id] = row
    })
    localStorage.setItem(MATRIX_KEY, JSON.stringify(out))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/* ===== 权限矩阵更新日志 ===== */
/**
 * @typedef {{ at: string, operator: string, type: 'cell'|'reset',
 *   menuName?: string, roleName?: string, before?: boolean, after?: boolean,
 *   count?: number, summary: string }} PermissionLog
 */

/**
 * 更新日志种子：让日志面板初次打开就有真实记录可看。
 * 仅首次访问（或版本升级后）落库；用户点「清空日志」后不会再复活。
 */
const SEED_LOGS = [
  {
    at: '2026-08-28 16:20', operator: 'admin', type: 'cell',
    menuName: '软件看护-我的待治理清单', roleName: '治理人员', before: false, after: true,
    summary: '为「治理人员」开通「软件看护-我的待治理清单」',
  },
  {
    at: '2026-08-28 16:12', operator: 'admin', type: 'cell',
    menuName: '密钥管理', roleName: '一般人员', before: false, after: true,
    summary: '为「一般人员」开通「密钥管理」',
  },
  {
    at: '2026-08-27 10:35', operator: 'admin', type: 'cell',
    menuName: '个人设置-我的反馈清单', roleName: '审核人员', before: true, after: false,
    summary: '为「审核人员」关闭「个人设置-我的反馈清单」',
  },
  {
    at: '2026-08-26 15:08', operator: 'zhangjianguo', type: 'cell',
    menuName: '后台管理-软件出入库', roleName: '监管人员', before: false, after: true,
    summary: '为「监管人员」开通「后台管理-软件出入库」',
  },
  {
    at: '2026-08-25 09:40', operator: 'admin', type: 'reset', count: 3,
    summary: '恢复默认权限矩阵（清除 3 项手工调整）',
  },
  {
    at: '2026-08-22 14:26', operator: 'admin', type: 'cell',
    menuName: '数据大屏', roleName: '组织管理员', before: true, after: false,
    summary: '为「组织管理员」关闭「数据大屏」',
  },
  {
    at: '2026-08-20 11:02', operator: 'chenxiaofeng', type: 'cell',
    menuName: '治理工具', roleName: '组织管理员', before: false, after: true,
    summary: '为「组织管理员」开通「治理工具」',
  },
]

/** 读取更新日志（最新在前） */
export function getPermissionLogs() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === LOG_SEED_VERSION) return parsed.list
      // 结构/种子升级：旧日志作废，回到种子
      return seedLogs()
    }
    if (Array.isArray(parsed)) return seedLogs()
  } catch (e) {
    // 读取失败按无日志处理
  }
  return seedLogs()
}

/** 首次访问时把日志种子落库（落库后即为普通记录，清空后不会复活） */
let logSeeded = false
function seedLogs() {
  const list = SEED_LOGS.map((x) => ({ ...x }))
  if (!logSeeded) {
    logSeeded = true
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify({ __seedVersion: LOG_SEED_VERSION, list }))
    } catch (e) {
      // 存储不可用时静默失败
    }
  }
  return list
}

/** 追加一条日志（最新在前，超出上限截断） */
function appendLog(entry) {
  const list = getPermissionLogs()
  list.unshift(entry)
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify({ __seedVersion: LOG_SEED_VERSION, list: list.slice(0, LOG_LIMIT) }))
  } catch (e) {
    // 存储不可用时静默失败
  }
}

/** 记录一次单元格变更 */
export function logPermissionCell({ menuId, roleId, before, after, operator }) {
  const menu = MENU_PERMISSIONS.find((m) => m.id === menuId)
  const role = MATRIX_ROLES.find((r) => r.id === roleId)
  const menuName = menu?.name || menuId
  const roleName = role?.name || roleId
  appendLog({
    at: fmtNow(),
    operator,
    type: 'cell',
    menuName,
    roleName,
    before: !!before,
    after: !!after,
    summary: `为「${roleName}」${after ? '开通' : '关闭'}「${menuName}」`,
  })
}

/** 记录一次「恢复默认」 */
export function logPermissionReset({ count = 0, operator }) {
  appendLog({
    at: fmtNow(),
    operator,
    type: 'reset',
    count,
    summary: `恢复默认权限矩阵（清除 ${count} 项手工调整）`,
  })
}

/**
 * 清空更新日志。
 * 注意：必须写入「空列表」而不是 removeItem —— 否则下次读取因找不到存储而回落种子，
 * 导致清空后种子记录复活。
 */
export function clearPermissionLogs() {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify({ __seedVersion: LOG_SEED_VERSION, list: [] }))
  } catch (e) {
    // 存储不可用时静默失败
  }
}

/** 当前手工覆盖的单元格数量（用于「恢复默认」提示） */
export function countMatrixOverrides() {
  let n = 0
  try {
    const raw = localStorage.getItem(MATRIX_KEY)
    const saved = raw ? JSON.parse(raw) : null
    if (saved && typeof saved === 'object') {
      const base = buildPermissionMatrix()
      MENU_PERMISSIONS.forEach((menu) => {
        MATRIX_ROLES.forEach((role) => {
          if (isMatrixCellLocked(menu.id, role.id)) return
          const v = saved[menu.id]?.[role.id]
          if (typeof v === 'boolean' && v !== base[menu.id][role.id]) n += 1
        })
      })
    }
  } catch (e) {
    // 读取失败按 0 处理
  }
  return n
}

/** 恢复默认：清除全部手工覆盖，回到配置表定义 */
export function resetPermissionMatrix() {
  try {
    localStorage.removeItem(MATRIX_KEY)
  } catch (e) {
    // 存储不可用时静默失败
  }
  return buildPermissionMatrix()
}

/** 矩阵单元格三态：'yes' 可访问 / 'no' 不可访问 / 'cond' 条件可访问 */
export function matrixCellState(value) {
  if (value === true) return 'yes'
  if (value === false || value == null) return 'no'
  return 'cond'
}

/** 取矩阵单元格的条件说明（非条件态返回空串） */
export function matrixCellScope(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return value.scope || ''
  return ''
}
