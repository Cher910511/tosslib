const STORAGE_KEY = 'tosslib.adminSearchHistory'
const MAX_PER_TYPE = 10

/** 演示用软件名，接入接口后可删除 */
export const SOFTWARE_CATALOG = [
  'werkzeug',
  'flask',
  'django',
  'requests',
  'numpy',
  'pandas',
  'celery',
  'redis-py',
  'gunicorn',
  'uvicorn',
  'fastapi',
  'sqlalchemy',
]

/** 演示用组件名（与组件库可点进详情的条目一致，便于顶部搜索匹配） */
export const COMPONENT_CATALOG = [
  'vertx-web-sstore-cookie',
  'requests',
  'openssl',
  'axios',
  'vue',
  'gin',
  'tokio',
  'kotlinx-coroutines-core',
  'akka-http',
  'thumbnailator',
  'twelvemonkeys-imageio',
  'imgscalr',
]

function norm(s) {
  return String(s).trim().toLowerCase()
}

export function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

/**
 * @param {'software' | 'component'} type
 * @param {string} text
 */
export function addSearchHistory(type, text) {
  const t = String(text).trim()
  if (!t) return
  let prev = loadSearchHistory()
  const n = norm(t)
  prev = prev.filter((x) => !(x.type === type && norm(x.text) === n))
  prev.push({ type, text: t, ts: Date.now() })
  const sw = prev
    .filter((x) => x.type === 'software')
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_PER_TYPE)
  const cp = prev
    .filter((x) => x.type === 'component')
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_PER_TYPE)
  persist([...sw, ...cp].sort((a, b) => b.ts - a.ts))
}

export function historyByType(type, limit = MAX_PER_TYPE) {
  return loadSearchHistory()
    .filter((x) => x.type === type)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
}

export function matchCatalog(query, catalog) {
  const q = norm(query)
  if (!q) return []
  return catalog.filter((name) => norm(name).includes(q))
}
