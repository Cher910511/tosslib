// ==================== 私有镜像源账号 · 数据层 ====================
// 场景：权限设置页维护「私有镜像源账号」，按组织分配，供组织成员在构建时拉取依赖。
// 每个账号记录：所属组织、登录账号、启用状态，以及该账号的镜像源下载（拉取）日志。
//
// 说明：账号与组织解耦——账号必须归属某个组织，但组织删除后账号仍保留历史数据，
// 列表里组织列退化显示为「组织已删除」，避免误删组织导致账号凭空消失。

import { getOrgs, findOrg } from './orgStore.js'

const STORAGE_KEY = 'tosslib_mirror_accounts'
// 版本 1：初始种子（首次访问自动落库）
const SEED_VERSION = 1

/** 账号状态 */
export const MIRROR_ACCOUNT_STATUS = {
  enabled: '已启用',
  disabled: '已禁用',
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmt(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/** 组织名（组织被删除时给出兜底文案） */
export function mirrorOrgNameOf(orgId) {
  if (!orgId) return '—'
  const org = findOrg(orgId)
  if (org) return org.name
  const hit = getOrgs().find((o) => o.id === orgId)
  return hit ? hit.name : '组织已删除'
}

function buildSeed() {
  const orgs = getOrgs()
  const pick = (i) => (orgs[i % orgs.length] || {}).id || ''
  const packs = ['lodash', 'spring-core', 'fastjson', 'requests', 'echarts', 'mybatis', 'guava', 'axios']
  const users = ['张牧之', '李慕白', '王砚秋', '陈望舒', '周清让', '吴听澜']

  const specs = [
    { name: '研发一组-主账号', orgIndex: 0, login: 'rd1-mirror', enabled: true, days: 26 },
    { name: '研发二组-主账号', orgIndex: 1, login: 'rd2-mirror', enabled: true, days: 24 },
    { name: '测试组-只读账号', orgIndex: 2, login: 'qa-mirror', enabled: true, days: 21 },
    { name: '架构组-共享账号', orgIndex: 3, login: 'arch-mirror', enabled: false, days: 18 },
    { name: '外部合作方-临时账号', orgIndex: 4, login: 'partner-tmp', enabled: false, days: 12 },
    { name: '运维组-主账号', orgIndex: 5, login: 'ops-mirror', enabled: true, days: 9 },
  ]

  return specs.map((s, i) => {
    const logs = []
    const logCount = 6 + ((i * 7) % 12)
    for (let k = 0; k < logCount; k += 1) {
      const pkg = packs[(i + k) % packs.length]
      logs.push({
        time: fmt(daysAgo(s.days - (k % Math.max(1, s.days)) - 1)),
        user: users[(i + k) % users.length],
        packageName: pkg,
        version: `${1 + (k % 3)}.${k % 10}.${k % 5}`,
        size: `${(120 + k * 37) % 4096} KB`,
        result: k % 11 === 5 ? '失败' : '成功',
      })
    }
    logs.sort((a, b) => (a.time < b.time ? 1 : -1))
    return {
      id: `mirror-${i + 1}`,
      name: s.name,
      orgId: pick(s.orgIndex),
      loginName: s.login,
      password: 'Mirror@123',
      enabled: s.enabled,
      remark: '',
      createdAt: fmt(daysAgo(s.days)),
      updatedBy: '系统预置',
      logs,
    }
  })
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== SEED_VERSION || !Array.isArray(parsed.items)) return null
    return parsed.items
  } catch (e) {
    return null
  }
}

function writeRaw(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, items }))
  } catch (e) {
    /* 忽略存储异常，页面仍可用内存态 */
  }
}

/** 全部镜像源账号（含日志） */
export function getMirrorAccounts() {
  const existing = readRaw()
  if (existing) return existing
  const seed = buildSeed()
  writeRaw(seed)
  return seed
}

export function findMirrorAccount(id) {
  return getMirrorAccounts().find((a) => a.id === id) || null
}

/** 顶层列表视图：附组织名与下载统计 */
export function getMirrorAccountList() {
  return getMirrorAccounts().map((a) => ({
    ...a,
    orgName: mirrorOrgNameOf(a.orgId),
    statusName: a.enabled ? MIRROR_ACCOUNT_STATUS.enabled : MIRROR_ACCOUNT_STATUS.disabled,
    downloadCount: a.logs.length,
    lastDownloadAt: a.logs.length ? a.logs[0].time : '',
  }))
}

function nextId(items) {
  let max = 0
  items.forEach((a) => {
    const m = /^mirror-(\d+)$/.exec(a.id || '')
    if (m) max = Math.max(max, Number(m[1]))
  })
  return `mirror-${max + 1}`
}

/** 新建：必须指定所属组织 */
export function createMirrorAccount({ name, orgId, loginName, password, remark = '', operator = '平台管理员' }) {
  const items = getMirrorAccounts()
  const account = {
    id: nextId(items),
    name: (name || '').trim(),
    orgId,
    loginName: (loginName || '').trim(),
    password: password || '',
    enabled: true,
    remark: (remark || '').trim(),
    createdAt: fmt(),
    updatedBy: operator,
    logs: [],
  }
  items.unshift(account)
  writeRaw(items)
  return account
}

export function updateMirrorAccount(id, patch = {}, operator = '平台管理员') {
  const items = getMirrorAccounts()
  const target = items.find((a) => a.id === id)
  if (!target) return null
  Object.assign(target, patch, { updatedBy: operator })
  writeRaw(items)
  return target
}

export function deleteMirrorAccount(id) {
  const items = getMirrorAccounts()
  const next = items.filter((a) => a.id !== id)
  writeRaw(next)
  return next.length !== items.length
}

export function setMirrorAccountEnabled(id, enabled, operator = '平台管理员') {
  return updateMirrorAccount(id, { enabled: !!enabled }, operator)
}

/** 单个账号的下载日志（按时间倒序） */
export function getMirrorDownloadLogs(id) {
  const target = findMirrorAccount(id)
  if (!target) return []
  return [...target.logs].sort((a, b) => (a.time < b.time ? 1 : -1))
}

/** 追加一条下载日志（供镜像源服务拉取时调用） */
export function appendMirrorDownloadLog(id, log = {}) {
  const items = getMirrorAccounts()
  const target = items.find((a) => a.id === id)
  if (!target) return false
  target.logs.unshift({
    time: log.time || fmt(),
    user: log.user || '—',
    packageName: log.packageName || '—',
    version: log.version || '—',
    size: log.size || '—',
    result: log.result || '成功',
  })
  writeRaw(items)
  return true
}

/** 概览统计 */
export function mirrorAccountStats() {
  const list = getMirrorAccountList()
  return {
    total: list.length,
    enabled: list.filter((a) => a.enabled).length,
    disabled: list.filter((a) => !a.enabled).length,
    downloads: list.reduce((sum, a) => sum + a.downloadCount, 0),
  }
}
