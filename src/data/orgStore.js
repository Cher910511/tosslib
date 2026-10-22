// ==================== 组织 · 可变数据层 ====================
// 背景：orgData.js 的 ORGS 是静态导出（内置示例组织，无持久化）。
// 平台管理员需要能「新建组织」，故新建的组织单独存于本模块，
// 由 getOrgs() 把「内置组织 + 新建组织」合并对外提供。
//
// 注意：本模块**不**依赖 orgMembershipData，避免循环引用；
// 把某人设为组织管理员由调用方通过 orgMembershipData.setOrgRole / addOrgMember 完成。

import { ORGS, USERS } from './orgData.js'
// permissionData 无任何 import，故此处引用不会形成循环依赖
import { hasRole } from './permissionData.js'

const ORG_KEY = 'tosslib_created_orgs'
const SEED_VERSION = 1
/** 旧版标记位：布尔值，仅记录「注入过」；现改为下方的 id 列表（保留用于迁移） */
const DEMO_SEEDED_KEY = 'tosslib_demo_orgs_seeded'
/**
 * 已注入过的演示组织 id 列表（JSON 数组）。
 * 用它代替布尔开关，才能「缺的补上、删的不复活」——见 ensureDemoOrgs 说明。
 */
const DEMO_OFFERED_KEY = 'tosslib_demo_orgs_offered'
/** 旧版标记位对应的那批 id（迁移时按此认定「历史上注入过」） */
const LEGACY_DEMO_IDS = ['org-demo-01', 'org-demo-02', 'org-demo-03']

/**
 * 是否为演示组织的 id（形如 org-demo-07）。
 * 用户自建组织的 id 形如 org-<base36 时间戳><随机数>，不含连字符分段，
 * 故该判据不会误伤用户数据。
 */
export function isDemoOrgId(orgId) {
  return /^org-demo-\d+$/.test(String(orgId || ''))
}

/** 当前有效的演示组织 id 集合（供上层清理引用了已下线演示组织的成员关系） */
export function getDemoOrgIdSet() {
  return new Set(DEMO_ORG_SPECS.map((s) => s.id))
}

/**
 * 两位补零。
 * 必须定义在 DEMO_ORG_SPECS **之前**：该常量在模块加载期就会调用 demoCreatedAt →
 * pad，而 const 存在暂时性死区（TDZ），放在后面会直接抛
 * 「Cannot access 'pad' before initialization」（已实测踩到）。
 */
const pad = (n) => String(n).padStart(2, '0')

/**
 * 演示用组织（会**一次性注入到存储**，因此可被真正删除）。
 *
 * 为什么注入存储而不是像 ORGS 那样做成静态常量：
 *   getOrgs() = [...ORGS, ...load()]，静态常量会被永远合并回来 —— 删了也复活，
 *   那就永远删不掉，无法用来演示「删除组织」。
 *
 * 为什么需要 createdAt 之类的字段齐全：这些组织在界面上与用户新建的完全同权，
 * 只是数据来源不同。
 *
 * createdByPlatformAdmin 决定删除口径（见 isOrgCreatedByPlatformAdmin）：
 *   true  由平台管理员创建 → 在「组织列表」可删
 *   false 由组织成员创建   → 标「组织自管」，需其组织管理员在「组织管理」中删
 *
 * adminUserId / memberUserIds 仅用于 orgMembershipData 生成成员关系，
 * 不写入组织记录本身（成员关系以 orgMembershipData 为唯一来源）。
 */
/**
 * 演示组织的原始数据表：**36 条**，加上 orgData 的 4 个内置组织，组织列表共 40 条。
 *
 * 用紧凑元组而非完整对象：40 条数据若逐字段展开会有数百行、
 * id/管理员/成员/创建人还大量重复。这里只写「人读得出差异」的四项，
 * 其余（id、创建时间、联系方式、管理员、成员）由下方统一生成。
 *
 * 元组：[名称, 行业, 简介, 创建人类型]
 *   创建人类型 'platform' → 平台管理员创建（createdByPlatformAdmin=true，组织列表可删）
 *              'member'   → 组织成员创建（=false，标「组织自管」，需其组织管理员在组织管理页删）
 *
 * 名称取自公开的真实企业，用于让演示数据看起来可信。
 *
 * **刻意只留 15 条**（对应 15 个非平台管理员账号，每人管 1 个）：
 *   演示组织必须有管理员，若做出 36 个，就只能把 36 份成员关系摊到同样这 15 个账号上，
 *   成员列表的「组织角色」列会每人挂 2~3 个组织、行高被撑到 80px 以上。
 *   15 条时每人恰好 +1 个组织，成员列表保持单行高度。
 */
const DEMO_ORG_DATA = [
  ['中电金信软件', '金融', '中国电子旗下金融科技公司，为银行、保险、证券机构提供核心业务系统与数字化转型服务。', 'platform'],
  ['星环信息科技', '科技', '专注大数据与分布式数据库基础软件，提供企业级数据平台与智能分析解决方案。', 'platform'],
  ['云汉数据技术', '制造', '面向制造业的数据中台服务商，提供设备数据采集、工艺优化与预测性维护能力。', 'member'],
  ['神州数码信息', '科技', '提供云服务、数字化转型与信息技术应用创新整体解决方案。', 'platform'],
  ['太极计算机', '政务', '面向政务与公共事业的信息系统集成商，承建多个省级政务云平台。', 'platform'],
  ['东华软件', '科技', '医疗、金融、能源行业信息化服务商，提供行业应用软件与系统集成。', 'platform'],
  ['用友网络', '科技', '企业管理软件与云服务提供商，覆盖财务、人力、供应链等企业级应用。', 'platform'],
  ['金蝶软件', '科技', '企业云管理服务商，提供财务云、供应链云与智能制造解决方案。', 'platform'],
  ['恒生电子', '金融', '金融行业软件与网络服务提供商，服务证券、基金、银行等金融机构。', 'platform'],
  ['同花顺', '金融', '金融数据与智能投顾服务商，提供行情资讯与量化分析工具。', 'platform'],
  ['东方通', '科技', '中间件与信息安全产品提供商，服务政务、金融等关键行业信息化。', 'member'],
  ['宝信软件', '制造', '工业互联网与智能制造解决方案提供商，深耕钢铁冶金行业信息化。', 'platform'],
  ['中科软', '科技', '保险行业信息化龙头，提供保险核心业务系统与行业应用软件。', 'platform'],
  ['宇信科技', '金融', '银行 IT 解决方案提供商，覆盖信贷、监管报送与数据治理领域。', 'platform'],
  ['长亮科技', '金融', '银行核心系统与互联网金融解决方案提供商，服务多家城商行。', 'platform'],
]

/**
 * 演示组织的管理员轮转池：全部 15 个非平台管理员账号。
 *
 * 为什么轮转全部账号、而不是只用 user-admin-* 那 4 个：
 *   36 个组织若集中在 4 个账号名下，成员列表的「组织角色」列会每人挂 8~9 个组织、
 *   行高被撑到 80px 以上（实测踩到）。轮转后每人约 2~3 个，列表保持清爽。
 */
const DEMO_ADMIN_ROTATION = [
  'user-admin-1', 'user-admin-2', 'user-admin-3', 'user-admin-4',
  'user-mem-1', 'user-mem-2', 'user-mem-3', 'user-mem-4', 'user-mem-5', 'user-mem-6',
  'user-mem-7', 'user-mem-8', 'user-mem-9', 'user-mem-10', 'user-mem-11',
]

/** 演示组织的创建时间：自 2026-01-05 起每 3 天一个，错落开 */
function demoCreatedAt(i) {
  const d = new Date(2026, 0, 5)
  d.setDate(d.getDate() + i * 3)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 生成演示组织规格。
 * 「成员创建」的组织由该账号自己当管理员（与真实流程一致：谁建谁是管理员）；
 * 「平台创建」的组织由平台分配管理员，创建人记为 admin。
 *
 * 刻意**不配普通成员**（memberUserIds 恒为空）：
 *   36 个组织若各配 1~3 名成员，会新增上百条成员关系，全部堆在同样这 15 个账号上，
 *   成员列表的「组织角色」列会被撑到每行 7~10 个组织、行高 80~112px（实测过）。
 *   每个组织只留 1 名管理员，既满足「新建组织必须有一名管理员」的硬约束，
 *   也让成员列表保持可读。
 */
export const DEMO_ORG_SPECS = DEMO_ORG_DATA.map(([name, industry, description, creatorKind], i) => {
  const seq = String(i + 1).padStart(2, '0')
  const isMemberCreated = creatorKind === 'member'
  const adminUserId = DEMO_ADMIN_ROTATION[i % DEMO_ADMIN_ROTATION.length]
  const creatorName = USERS.find((u) => u.id === adminUserId)?.username || 'admin'
  return {
    id: `org-demo-${seq}`,
    name,
    industry,
    description,
    createdAt: demoCreatedAt(i),
    contactEmail: `contact${seq}@demo-org.cn`,
    contactPhone: `400-100-00${seq}`,
    createdBy: isMemberCreated ? creatorName : 'admin',
    createdByPlatformAdmin: !isMemberCreated,
    adminUserId,
    memberUserIds: [],
  }
})

/** 去掉仅用于生成成员关系的字段，得到可持久化的组织记录 */
function toOrgRecord(spec) {
  const { adminUserId, memberUserIds, ...org } = spec
  return {
    avatar: '',
    // 兼容 orgData 结构：成员关系以 orgMembershipData 为准，这里留空数组
    adminIds: [],
    memberIds: [],
    contactEmail: '',
    contactPhone: '',
    description: '',
    ...org,
  }
}

/** 读取「已注入过」的演示组织 id 集合，并处理旧版布尔标记的迁移 */
function readOfferedDemoIds() {
  try {
    const raw = localStorage.getItem(DEMO_OFFERED_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr)
    }
    /**
     * 迁移旧版：早前用的是布尔标记位（注入过就是 '1'），那一版只注入了
     * 最早 3 个演示组织。按其真实历史记为「已注入」，
     * 而不是看当前是否存在 —— 否则用户删掉的那条会被当成「没注入过」而复活。
     */
    if (localStorage.getItem(DEMO_SEEDED_KEY) === '1') return new Set(LEGACY_DEMO_IDS)
  } catch (e) {
    // 读取失败按「未注入过」处理
  }
  return new Set()
}

/**
 * 注入演示组织（**差量补齐**，可反复安全调用）。
 *
 * 判据是「这个 id 是否曾注入过」，而不是布尔的一次性开关：
 *   维护期间演示组织从 3 个扩到 36 个，老用户若只认「已注入过」这个布尔值，
 *   就永远补不到新增的 33 个 —— 而 SEED_MEMBERSHIPS 在模块加载时已按 36 个
 *   生成了成员关系，findOrg 查不到那些组织，成员列表的「组织角色」列
 *   就会显示 org-demo-05 这样的**裸 id**（实测踩到，62 处）。
 *   改为按 id 差量补齐后，两头都能满足：
 *     缺的补上（修裸 id）；用户删过的不复活（其 id 已在 offered 里）。
 */
function ensureDemoOrgs() {
  try {
    const offered = readOfferedDemoIds()
    const raw = localStorage.getItem(ORG_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    const existing = parsed && Array.isArray(parsed.list) && Number(parsed.__seedVersion) === SEED_VERSION
      ? parsed.list
      : []
    /**
     * 先清掉**已下线**的演示组织：演示组织从 36 个缩减到 15 个后，
     * 旧存档里 org-demo-16~36 仍会留在存储中，组织列表会多出 21 条，
     * 其成员关系还会把成员列表的「组织角色」列撑长（实测复现过）。
     * 判据用 id 前缀：用户自建组织的 id 形如 org-<base36时间戳><随机数>，
     * 不会与 org-demo-<数字> 冲突，故不会误删用户的组织。
     */
    const demoIds = new Set(DEMO_ORG_SPECS.map((s) => s.id))
    const kept = existing.filter((o) => !(isDemoOrgId(o.id) && !demoIds.has(o.id)))
    const pruned = existing.length - kept.length

    const ids = new Set(kept.map((o) => o.id))
    // 待补：既没注入过、当前也不存在
    const add = DEMO_ORG_SPECS.filter((s) => !offered.has(s.id) && !ids.has(s.id)).map(toOrgRecord)
    if (add.length || pruned) {
      localStorage.setItem(ORG_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list: [...kept, ...add] }))
    }
    // 记录「已注入过」：本次新增的 + 当前已存在的（老数据里已有但没进过 offered 的）
    const next = new Set(offered)
    add.forEach((o) => next.add(o.id))
    DEMO_ORG_SPECS.forEach((s) => { if (ids.has(s.id)) next.add(s.id) })
    localStorage.setItem(DEMO_OFFERED_KEY, JSON.stringify([...next]))
    // 迁移完成，清掉旧标记位（放在写入之后，写入失败则下次再迁移一次）
    localStorage.removeItem(DEMO_SEEDED_KEY)
  } catch (e) {
    // 存储不可用时静默降级（仅影响演示数据）
  }
}

/** 行业选项（新建组织时选择） */
export const INDUSTRY_OPTIONS = [
  '金融', '科技', '能源', '制造', '通信', '医疗', '交通', '政务', '教育', '其他',
]

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function load() {
  // 首次读取时注入演示组织（有独立标记位，只注入一次）
  ensureDemoOrgs()
  try {
    const raw = localStorage.getItem(ORG_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) {
      if (Number(parsed.__seedVersion) === SEED_VERSION) return parsed.list
      return [] // 结构升级：丢弃过期数据
    }
    if (Array.isArray(parsed)) return []
  } catch (e) {
    // 读取失败按无存储处理
  }
  return []
}

function persist(list) {
  try {
    localStorage.setItem(ORG_KEY, JSON.stringify({ __seedVersion: SEED_VERSION, list }))
  } catch (e) {
    // 存储不可用时静默失败（仅影响持久化）
  }
}

/** 平台管理员新建的组织（按创建时间倒序） */
export function getCreatedOrgs() {
  return load().slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** 全部组织：内置组织 + 新建组织（内置在前，顺序稳定） */
export function getOrgs() {
  return [...ORGS, ...load()]
}

/** 按 id 查组织（含新建组织） */
export function findOrg(orgId) {
  if (!orgId) return null
  return getOrgs().find((o) => o.id === orgId) || null
}

/** 组织名（查不到时回落为 id 本身，便于排查） */
export function orgNameOf(orgId) {
  return findOrg(orgId)?.name || orgId || '—'
}

/**
 * 该组织是否由**平台管理员**创建（用于判定平台级删除权限）。
 *
 * 读的是创建时定格的快照 createdByPlatformAdmin，而不是用 createdBy 反查当前角色 ——
 * 事后反查会让删除权限随他人角色调整而漂移。
 * 内置组织（源码静态数据）没有该字段，视为 false：它本就不由任何用户创建。
 */
export function isOrgCreatedByPlatformAdmin(org) {
  return !!org?.createdByPlatformAdmin
}

/** 组织名是否已被占用（大小写不敏感） */
export function isOrgNameTaken(name) {
  const n = String(name || '').trim().toLowerCase()
  if (!n) return false
  return getOrgs().some((o) => String(o.name || '').trim().toLowerCase() === n)
}

function genOrgId() {
  return `org-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}

/**
 * 新建组织。
 * @param {{ name: string, industry?: string, description?: string,
 *   contactEmail?: string, contactPhone?: string,
 *   operator?: string, operatorId?: string }} opts
 *   operator   创建人用户名（留痕用）
 *   operatorId 创建人账号 id（用于判定其平台角色；operator 是用户名，hasRole 需要 id）
 * @returns {{ ok: boolean, reason?: string, org?: Object }}
 */
export function createOrg(opts = {}) {
  const {
    name = '', industry = '其他', description = '',
    contactEmail = '', contactPhone = '', operator = '系统',
    operatorId = null,
  } = opts

  if (!String(name).trim()) return { ok: false, reason: '请填写组织名称' }
  if (isOrgNameTaken(name)) return { ok: false, reason: '该组织名称已存在，请更换' }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contactEmail).trim())) {
    return { ok: false, reason: '联系邮箱格式不正确' }
  }

  const org = {
    id: genOrgId(),
    name: String(name).trim(),
    description: String(description).trim(),
    avatar: '',
    industry: industry || '其他',
    // 兼容 orgData 结构：成员关系以 orgMembershipData 为准，这里留空数组
    adminIds: [],
    memberIds: [],
    createdAt: today(),
    contactEmail: String(contactEmail).trim(),
    contactPhone: String(contactPhone).trim(),
    createdBy: operator,
    /**
     * 创建者角色快照：创建当时该账号是否为平台管理员。
     *
     * 为什么存快照，而不是事后用 createdBy 反查角色：
     * 「这条组织能否被删除」取决于「是否由平台管理员创建」这一**历史事实**，
     * 而角色是可以变的 —— 事后反查会让删除权限随他人角色调整而漂移
     * （今天能删、明天删不了）。故在创建时定格。
     */
    createdByPlatformAdmin: !!operatorId && hasRole(operatorId, 'platform-admin'),
  }
  const list = load()
  list.push(org)
  persist(list)
  return { ok: true, org }
}

/**
 * 删除组织的**底层实现**：不做权限校验，只做数据完整性保护。
 *
 * 仅供两类调用方使用：
 *   1. orgMembershipData.dissolveOrg —— 编排层，负责权限判定 + 级联清理成员关系；
 *   2. 建组织失败时的回滚（补偿操作，执行者就是刚发起创建的人）。
 *
 * 保护：内置组织不可删（ORGS 来自 orgData 静态导出，本就不在 load() 里，
 * 显式校验是为给出明确原因，而非静默无反应）；只能删本模块创建的组织。
 *
 * 注意：本函数**不**清理成员关系 —— orgMembershipData 已 import 本模块，
 * 反向引用会成环。级联清理由 dissolveOrg 统一编排。
 */
export function deleteOrgRaw(orgId) {
  if (!orgId) return { ok: false, reason: '缺少组织标识' }
  if (ORGS.some((o) => o.id === orgId)) return { ok: false, reason: '内置组织不可删除' }
  const list = load()
  if (!list.some((o) => o.id === orgId)) return { ok: false, reason: '该组织不存在或不可删除' }
  persist(list.filter((o) => o.id !== orgId))
  return { ok: true }
}

/**
 * 已移除：deleteOrg(orgId, actorId) —— 旧的「平台管理员专属删除入口」。
 *
 * 移除原因：
 *   ① 零调用点。页面实际走的是 orgMembershipData.dissolveOrg（组织管理页，
 *      口径「自己任组织管理员」）与 dissolveOrgByPlatformAdmin（权限设置页，
 *      口径「平台管理员 + 该组织由平台创建」）。
 *   ② 它只调 deleteOrgRaw，**不做成员关系级联清理**，会留下指向已不存在组织的
 *      孤儿成员关系（orgMembershipData.removeOrgMemberships 的注释即为此而写）。
 *      留着一个会长出脏数据的导出函数，只等哪天被误用。
 *   ③ 它自带一条与现行口径冲突的权限判断（「仅平台管理员可删除组织」），
 *      与本项目「组织管理页只删自己任组织管理员的」定论相悖。
 *
 * 若将来真需要脚本级删除入口，请基于 dissolveOrg 系列实现，而不是恢复本函数。
 */
