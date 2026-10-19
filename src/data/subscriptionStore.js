// ==================== 用户订阅 · 数据层 ====================
// 说明：本模块集中维护「用户订阅的软件 / 组件」清单，供两处共用，避免重复定义：
//   1. 组织成员工作台（MemberWorkbench）的「我的订阅项目」列表；
//   2. 站内信的「版本更新提醒」——仅对**已订阅**的软件/组件推送新版本入库消息。
//
// 口径：
//   - 普通成员只能订阅其所在组织已发车（版本火车）内的项目，故本清单为演示数据；
//   - currentVersion 为「用户当前订阅的版本」，用于与入库的新版本对比；
//   - 平台暂无「按用户维度」的订阅存储（无后端接口），故此处为静态演示数据，
//     待平台补齐订阅接口后替换为按 recipientId 查询。

/** 订阅项类型：软件 / 组件 */
export const SUBSCRIPTION_TYPES = {
  software: '软件',
  component: '组件',
}

/**
 * 订阅清单（演示数据）。
 * 与版本火车 / 已入库数据中的同名条目保持一致的命名，便于版本比对。
 */
export const SUBSCRIPTIONS = [
  { id: 1, name: 'Spring Boot', type: 'software', currentVersion: '3.5.12', language: 'Java', developer: 'VMware', subscribedAt: '2026-05-12' },
  { id: 2, name: 'Redis', type: 'software', currentVersion: '7.2.4', language: 'C', developer: 'Redis Ltd', subscribedAt: '2026-06-20' },
  { id: 3, name: 'log4j-core', type: 'component', currentVersion: '2.24.3', language: 'Java', developer: 'Apache', subscribedAt: '2026-05-18' },
  { id: 4, name: 'Vue.js', type: 'software', currentVersion: '3.5.13', language: 'TypeScript', developer: 'Evan You', subscribedAt: '2026-07-03' },
  { id: 5, name: 'Kafka', type: 'software', currentVersion: '3.9.2', language: 'Scala', developer: 'Apache', subscribedAt: '2026-07-25' },
  { id: 6, name: 'Nginx', type: 'software', currentVersion: '1.26.0', language: 'C', developer: 'Nginx Inc', subscribedAt: '2026-06-08' },
  { id: 7, name: 'OpenSSL', type: 'component', currentVersion: '3.3.0', language: 'C', developer: 'OpenSSL Project', subscribedAt: '2026-07-12' },
  { id: 8, name: 'spring-core', type: 'component', currentVersion: '6.2.17', language: 'Java', developer: 'VMware', subscribedAt: '2026-05-26' },
  { id: 9, name: 'Elasticsearch', type: 'software', currentVersion: '8.15.0', language: 'Java', developer: 'Elastic', subscribedAt: '2026-07-30' },
  { id: 10, name: 'jackson-databind', type: 'component', currentVersion: '2.19.4', language: 'Java', developer: 'FasterXML', subscribedAt: '2026-06-15' },
]

/** 是否已订阅某软件/组件（按名称，忽略大小写） */
export function isSubscribed(name) {
  const k = String(name || '').trim().toLowerCase()
  if (!k) return false
  return SUBSCRIPTIONS.some((s) => s.name.toLowerCase() === k)
}

/** 按名称取订阅项 */
export function findSubscription(name) {
  const k = String(name || '').trim().toLowerCase()
  return SUBSCRIPTIONS.find((s) => s.name.toLowerCase() === k) || null
}
