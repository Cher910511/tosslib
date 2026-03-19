/**
 * 后续接入真实 API 时，在此封装请求并替换 mock 数据。
 * 示例：
 * export async function fetchDashboard() {
 *   const res = await fetch('/api/dashboard')
 *   return res.json()
 * }
 */
export async function fetchDashboard() {
  return import('../data/mockData.js')
}
