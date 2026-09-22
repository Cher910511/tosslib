// ==================== 头像工具 ====================
// 平台没有真实用户上传的头像，这里按用户稳定分配一张本地插画头像（public/avatars/*.svg）。
// 关键：路径必须带 BASE_URL 前缀 —— 项目部署在 GitHub Pages 子路径（/<仓库名>/）下，
// 若写成根绝对路径 /avatars/xx.svg 会 404（手册图片曾踩过此坑）。

const AVATAR_COUNT = 8

/** 头像文件名列表（1 基序号） */
const AVATAR_FILES = Array.from(
  { length: AVATAR_COUNT },
  (_, i) => `avatar-${String(i + 1).padStart(2, '0')}.svg`,
)

/** 按字符串生成稳定索引（同名/同 id 始终得到同一张头像） */
function hashIndex(seed) {
  const s = String(seed || '')
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % AVATAR_COUNT
}

/**
 * 取用户头像地址。
 * @param {{id?: string, name?: string, avatar?: string}|string} user 用户对象或其标识
 * @returns {string} 头像 URL（带 BASE_URL 前缀）
 */
export function avatarUrl(user) {
  // 兼容不同的标识字段：id（账号）/ userId（成员行）/ name（兜底）
  const seed = typeof user === 'string'
    ? user
    : (user?.id || user?.userId || user?.name || '')
  // 若用户自带 avatar 字段（未来支持真实上传），优先使用
  const custom = typeof user === 'object' ? user?.avatar : ''
  const file = custom || AVATAR_FILES[hashIndex(seed)]
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')
  return `${base}/avatars/${file}`
}

/** 姓名首字（头像加载失败时的兜底文字） */
export function avatarLetter(user) {
  const name = typeof user === 'string' ? user : (user?.name || user?.username || '')
  return name ? name.charAt(0) : '?'
}
