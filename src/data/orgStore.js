// ==================== 组织 · 可变数据层 ====================
// 背景：orgData.js 的 ORGS 是静态导出（内置示例组织，无持久化）。
// 平台管理员需要能「新建组织」，故新建的组织单独存于本模块，
// 由 getOrgs() 把「内置组织 + 新建组织」合并对外提供。
//
// 注意：本模块**不**依赖 orgMembershipData，避免循环引用；
// 把某人设为组织管理员由调用方通过 orgMembershipData.setOrgRole / addOrgMember 完成。

import { ORGS, CURRENT_USER_ID } from './orgData.js'
// permissionData 无任何 import，故此处引用不会形成循环依赖
import { hasRole } from './permissionData.js'

const ORG_KEY = 'tosslib_created_orgs'
const SEED_VERSION = 1

/** 行业选项（新建组织时选择） */
export const INDUSTRY_OPTIONS = [
  '金融', '科技', '能源', '制造', '通信', '医疗', '交通', '政务', '教育', '其他',
]

const pad = (n) => String(n).padStart(2, '0')
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function load() {
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
 *   contactEmail?: string, contactPhone?: string, operator?: string }} opts
 * @returns {{ ok: boolean, reason?: string, org?: Object }}
 */
export function createOrg(opts = {}) {
  const {
    name = '', industry = '其他', description = '',
    contactEmail = '', contactPhone = '', operator = '系统',
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
 * 删除组织（平台管理员专属的便捷入口）。
 *
 * 权限口径已调整：**组织管理员也能删除自己所属的组织**，见
 * orgMembershipData.dissolveOrg —— 那是页面实际调用的编排函数。
 * 本函数保留「平台管理员」这一条口径，用于脚本/回滚等场景。
 *
 * @param {string} orgId 目标组织
 * @param {string} [actorId] 操作人（默认当前用户），用于权限校验
 * @returns {{ ok: boolean, reason?: string }}
 */
export function deleteOrg(orgId, actorId = CURRENT_USER_ID) {
  if (!hasRole(actorId, 'platform-admin')) return { ok: false, reason: '仅平台管理员可删除组织' }
  return deleteOrgRaw(orgId)
}
