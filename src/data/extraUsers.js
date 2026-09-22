// ==================== 补充账号读取（只读） ====================
// 背景：orgData.js 的 USERS 是静态内置账号。邀请注册（inviteData）与平台新建（accountData）
// 产生的账号不在其中，但组织成员列表、权限页等处需要按 userId 解析出姓名，
// 否则会显示成 userId。
//
// 依赖方向说明：inviteData → orgMembershipData，accountData → inviteData + orgMembershipData，
// 因此 orgMembershipData **不能**反过来 import 它们（会形成循环依赖）。
// 本模块不 import 任何业务模块，直接只读这两个来源的 localStorage，从而安全地打破循环。

const REGISTER_KEY = 'tosslib_registered_users'
const ACCOUNT_KEY = 'tosslib_created_accounts'

/**
 * 宽松读取：只取 list 数组，忽略 __seedVersion。
 * 姓名解析属展示用途，宽松读取可避免版本升级时姓名回退成 userId。
 */
function readList(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && Array.isArray(parsed.list)) return parsed.list
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    // 读取失败按无数据处理
  }
  return []
}

/** 邀请注册 + 平台新建的全部账号 */
export function getExtraUsers() {
  return [...readList(REGISTER_KEY), ...readList(ACCOUNT_KEY)]
}

/** 按 userId 查补充账号（找不到返回 null） */
export function findExtraUser(userId) {
  if (!userId) return null
  return getExtraUsers().find((u) => u.id === userId) || null
}

/** 按 userId 查补充账号姓名 */
export function extraUserName(userId) {
  return findExtraUser(userId)?.name || ''
}
