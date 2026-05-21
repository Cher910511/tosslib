/**
 * 贡献者 commit 看板：演示数据结构。
 * 接入接口后改为请求返回的 JSON，字段保持一致即可复用 UI。
 *
 * @typedef {{ date: string, value: number }} ContribCommitPoint
 * @typedef {{
 *   rank: number
 *   name: string
 *   login: string
 *   commits: number
 *   additions: number
 *   deletions: number
 *   series: ContribCommitPoint[]
 * }} ContribCommitRow
 */

const MS_DAY = 86400000

export const contribCommitViewRange = {
  start: '2026-03-18',
  end: '2026-05-12',
}

function parseYMD(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatYMD(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 按固定步长生成日期轴（接口也可直接返回完整 series，不必用此函数） */
export function buildTimeline(startStr, endStr, stepDays = 7) {
  const dates = []
  let t = parseYMD(startStr).getTime()
  const end = parseYMD(endStr).getTime()
  while (t <= end) {
    dates.push(formatYMD(new Date(t)))
    t += stepDays * MS_DAY
  }
  return dates
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildSeriesForRow(rank, dates, chartPeak) {
  const rnd = mulberry32(rank * 1103515245 + 12345)
  const phase = rank * 0.7
  return dates.map((date, i) => {
    const wave = (Math.sin((i / Math.max(1, dates.length - 1)) * Math.PI * 1.8 + phase) + 1) * 0.35
    const noise = rnd() * 0.65 + 0.2
    const v = Math.round(chartPeak * wave * noise)
    return { date, value: Math.max(0, v) }
  })
}

const timeline = buildTimeline(contribCommitViewRange.start, contribCommitViewRange.end, 7)

/** @type {Omit<ContribCommitRow, 'series'>[]} */
const rawRows = [
  { rank: 1, name: '赵涵', login: 'zohan', commits: 790, additions: 97089, deletions: 38591, peak: 118 },
  { rank: 2, name: '张敏', login: 'zmin', commits: 412, additions: 42100, deletions: 18234, peak: 62 },
  { rank: 3, name: '李想', login: 'lixiang', commits: 305, additions: 28900, deletions: 12005, peak: 48 },
  { rank: 4, name: '王磊', login: 'wanglei', commits: 198, additions: 15420, deletions: 9021, peak: 32 },
  { rank: 5, name: '陈晨', login: 'chenchen', commits: 156, additions: 12100, deletions: 6400, peak: 24 },
  { rank: 6, name: '刘洋', login: 'liuyang', commits: 98, additions: 8200, deletions: 4100, peak: 16 },
  { rank: 7, name: '赵琪', login: 'zhaoqi', commits: 54, additions: 3900, deletions: 2100, peak: 10 },
  { rank: 8, name: '周宁', login: 'zhouning', commits: 12, additions: 890, deletions: 420, peak: 4 },
  { rank: 9, name: '吴迪', login: 'wudi', commits: 7, additions: 310, deletions: 180, peak: 3 },
  { rank: 10, name: '孙悦', login: 'sunyue', commits: 156, additions: 11200, deletions: 5300, peak: 22 },
  { rank: 11, name: '马东', login: 'madong', commits: 89, additions: 6400, deletions: 2900, peak: 14 },
  { rank: 12, name: '韩雪', login: 'hanxue', commits: 43, additions: 2800, deletions: 1500, peak: 8 },
]

/** @type {ContribCommitRow[]} */
export const contribCommitList = rawRows.map(({ peak, ...rest }) => ({
  ...rest,
  series: buildSeriesForRow(rest.rank, timeline, peak),
}))

/**
 * 按起止日期裁剪序列（仅前端筛选演示；接口侧分页/筛选更佳）
 * @param {ContribCommitRow[]} list
 * @param {string} start
 * @param {string} end
 */
export function filterContribSeriesByRange(list, start, end) {
  if (!start || !end) return list
  const lo = start <= end ? start : end
  const hi = start <= end ? end : start
  return list.map((row) => ({
    ...row,
    series: row.series.filter((p) => p.date >= lo && p.date <= hi),
  }))
}
