// ==================== 软件入库需求反馈 · 模拟数据 ====================
// 流程：普通成员提交 → 平台管理员分配 → 库主补全治理 → 平台管理员最终入库审批
// 状态机：待分配 → 已分配 → 待审核 → 已审核 → 已入库

/**
 * @typedef {{ id: string, org: string, reporter: string, contact: string,
 *   fileName: string, itemCount: number, createdAt: string,
 *   status: '待分配'|'已分配'|'治理中'|'待审核'|'已审核'|'已入库',
 *   assignedOrgId?: string, assignedOrgName?: string,
 *   assignedTo?: string, assignedAt?: string,
 *   returnStatus?: '回传中'|'成功'|'失败', returnOkCount?: number, returnFailCount?: number, returnedAt?: string,
 *   returnFailures?: Array<{ row: number, field: string, reason: string }>,
 *   items: Array<{ name: string, version: string, url: string, scene: string }> }} InboundRequest
 */

const STORAGE_KEY = 'tosslib_inbound_requests'
const MAX_ITEMS = 200
/**
 * 种子数据版本号：种子结构变化（新增字段/状态等）时必须 +1。
 * 存储中的种子覆盖记录若版本不符，视为过期并丢弃，避免旧结构覆盖新种子字段
 * （例如旧数据没有 returnFailures / 「回传中」状态，会让失败原因点不开）。
 * 用户真实提交的清单不受影响，始终保留。
 */
const SEED_VERSION = 2

// 演示用开源软件清单池：种子清单的解析明细从这里取，保证查看详情有足够数据
const DEMO_ITEMS = [
  { name: 'Spring Boot', version: '3.5.12', url: 'https://github.com/spring-projects/spring-boot', scene: '企业级 Java Web 应用快速开发与微服务' },
  { name: 'Spring Framework', version: '6.2.17', url: 'https://github.com/spring-projects/spring-framework', scene: 'Java 企业应用基础框架与依赖注入' },
  { name: 'Redis', version: '7.2.4', url: 'https://github.com/redis/redis', scene: '缓存、消息队列、分布式锁' },
  { name: 'Vue.js', version: '3.5.13', url: 'https://github.com/vuejs/core', scene: '前端单页应用与组件化开发' },
  { name: 'React', version: '18.3.1', url: 'https://github.com/facebook/react', scene: '前端用户界面组件化开发' },
  { name: 'OpenSSL', version: '3.3.0', url: 'https://github.com/openssl/openssl', scene: 'TLS/SSL 加密通信与数字证书' },
  { name: 'Apache Log4j2', version: '2.24.3', url: 'https://github.com/apache/logging-log4j2', scene: 'Java 日志记录与审计' },
  { name: 'Nginx', version: '1.26.0', url: 'https://github.com/nginx/nginx', scene: '反向代理、负载均衡、静态资源服务' },
  { name: 'Apache Kafka', version: '3.9.2', url: 'https://github.com/apache/kafka', scene: '分布式消息流平台与事件驱动架构' },
  { name: 'Elasticsearch', version: '8.15.0', url: 'https://github.com/elastic/elasticsearch', scene: '全文检索、日志分析与数据搜索' },
  { name: 'Docker', version: '27.1.1', url: 'https://github.com/moby/moby', scene: '应用容器化打包、分发与运行' },
  { name: 'Kubernetes', version: '1.31.0', url: 'https://github.com/kubernetes/kubernetes', scene: '容器编排、集群管理与自动部署' },
  { name: 'PostgreSQL', version: '16.3', url: 'https://github.com/postgres/postgres', scene: '关系型数据库存储与事务处理' },
  { name: 'MySQL', version: '8.4.0', url: 'https://github.com/mysql/mysql', scene: '关系型数据库存储与高可用架构' },
  { name: 'MongoDB', version: '7.0.12', url: 'https://github.com/mongodb/mongo', scene: '文档型 NoSQL 数据库' },
  { name: 'Apache Tomcat', version: '10.1.33', url: 'https://github.com/apache/tomcat', scene: 'Java Servlet 容器与 Web 应用托管' },
  { name: 'Node.js', version: '20.15.1', url: 'https://github.com/nodejs/node', scene: '服务端 JavaScript 运行时' },
  { name: 'Python', version: '3.12.4', url: 'https://github.com/python/cpython', scene: '通用编程、数据分析与人工智能' },
  { name: 'Grafana', version: '11.1.0', url: 'https://github.com/grafana/grafana', scene: '监控指标可视化与仪表盘' },
  { name: 'Prometheus', version: '2.54.0', url: 'https://github.com/prometheus/prometheus', scene: '云原生监控与指标采集' },
  { name: 'RabbitMQ', version: '3.13.6', url: 'https://github.com/rabbitmq/rabbitmq-server', scene: '消息队列与异步任务解耦' },
  { name: 'Apache ZooKeeper', version: '3.9.2', url: 'https://github.com/apache/zookeeper', scene: '分布式协调服务与配置管理' },
  { name: 'Hadoop', version: '3.4.0', url: 'https://github.com/apache/hadoop', scene: '大数据分布式存储与计算' },
  { name: 'Spark', version: '3.5.1', url: 'https://github.com/apache/spark', scene: '大数据批处理与流式计算' },
  { name: 'Flink', version: '1.19.0', url: 'https://github.com/apache/flink', scene: '实时流处理引擎' },
  { name: 'Apache Hive', version: '4.0.0', url: 'https://github.com/apache/hive', scene: '数据仓库与 SQL 分析' },
  { name: 'HBase', version: '2.5.8', url: 'https://github.com/apache/hbase', scene: '海量数据分布式列存储' },
  { name: 'Cassandra', version: '5.0.0', url: 'https://github.com/apache/cassandra', scene: '高可用分布式 NoSQL 数据库' },
  { name: 'etcd', version: '3.5.15', url: 'https://github.com/etcd-io/etcd', scene: '分布式键值存储与服务发现' },
  { name: 'Consul', version: '1.19.1', url: 'https://github.com/hashicorp/consul', scene: '服务注册发现与配置中心' },
]

// 演示种子数据：覆盖状态机各环节，保证各角色演示时都有内容可看
const SEED_REQUESTS = [
  // —— 待分配：平台管理员待处理 ——
  {
    id: 'ir-seed-1',
    org: '阿里巴巴集团',
    reporter: '陈晓峰',
    contact: '13800000004',
    fileName: '阿里-入库需求清单-0901.xlsx',
    createdAt: '2026-09-02 10:32',
    status: '待分配',
    items: DEMO_ITEMS.slice(0, 8),
  },
  {
    id: 'ir-seed-2',
    org: '中国工商银行',
    reporter: '张建国',
    contact: '13800000001',
    fileName: '工行-软件入库需求反馈.xlsx',
    createdAt: '2026-09-01 09:15',
    status: '待分配',
    items: DEMO_ITEMS.slice(8, 18),
  },
  // —— 已分配：库主待补全 ——
  {
    id: 'ir-seed-3',
    org: '平安科技',
    reporter: '王明远',
    contact: '13700000003',
    fileName: '平安-开源软件需求清单.xlsx',
    createdAt: '2026-08-29 14:05',
    status: '已分配',
    assignedOrgId: 'org-002',
    assignedOrgName: '平安科技',
    assignedTo: '王明远',
    assignedAt: '2026-08-30 10:00',
    // 最近一次回传：2 条软件未通过校验，整份未导入，清单仍为「待回传」，可修正后重传
    returnStatus: '失败',
    returnOkCount: 0,
    returnFailCount: 2,
    returnedAt: '2026-08-31 16:20',
    // 失败明细：行号为 Excel 行号（第 1 行是表头，数据从第 2 行开始）
    returnFailures: [
      { row: 3, field: '必填项', reason: 'AtomGit 开源社区源码托管地址为空' },
      { row: 7, field: '必填项', reason: 'AtomGit 开源社区源码托管地址为空' },
    ],
    items: DEMO_ITEMS.slice(10, 20),
  },
  // —— 已分配但尚未回传：列表「回传状态」显示「待回传」 ——
  {
    id: 'ir-seed-7',
    org: '阿里巴巴集团',
    reporter: '陈晓峰',
    contact: '13600000004',
    fileName: '阿里-开源软件需求清单.xlsx',
    createdAt: '2026-09-02 10:20',
    status: '已分配',
    assignedOrgId: 'org-004',
    assignedOrgName: '阿里巴巴集团',
    assignedTo: '陈晓峰',
    assignedAt: '2026-09-03 09:00',
    items: DEMO_ITEMS.slice(18, 26),
  },
  // —— 回传中：文件已提交，正在校验/导入，尚未出结果 ——
  {
    id: 'ir-seed-8',
    org: '华为技术有限公司',
    reporter: '李思远',
    contact: '13900000002',
    fileName: '华为-开源软件需求清单-0904.xlsx',
    createdAt: '2026-09-04 09:10',
    status: '已分配',
    assignedOrgId: 'org-003',
    assignedOrgName: '华为技术有限公司',
    assignedTo: '李思远',
    assignedAt: '2026-09-04 10:00',
    returnStatus: '回传中',
    returnedAt: '2026-09-04 14:35',
    items: DEMO_ITEMS.slice(3, 12),
  },
  // —— 待审核：库主已在软件治理中流转并提交审核 ——
  {
    id: 'ir-seed-4',
    org: '华为技术有限公司',
    reporter: '李思远',
    contact: '13900000002',
    fileName: '华为-入库清单-20260820.xlsx',
    createdAt: '2026-08-20 14:05',
    status: '待审核',
    assignedOrgId: 'org-003',
    assignedOrgName: '华为技术有限公司',
    assignedTo: '李思远',
    assignedAt: '2026-08-21 09:30',
    returnStatus: '成功',
    returnOkCount: 10,
    returnFailCount: 0,
    returnedAt: '2026-08-22 09:40',
    items: DEMO_ITEMS.slice(5, 15),
  },
  // —— 已审核：库主治理完成，平台已审核通过 ——
  {
    id: 'ir-seed-5',
    org: '中国工商银行',
    reporter: '张建国',
    contact: '13800000001',
    fileName: '工行-治理完成清单-0818.xlsx',
    createdAt: '2026-08-18 09:47',
    status: '已审核',
    assignedOrgId: 'org-001',
    assignedOrgName: '中国工商银行',
    assignedTo: '张建国',
    assignedAt: '2026-08-19 11:00',
    returnStatus: '成功',
    returnOkCount: 10,
    returnFailCount: 0,
    returnedAt: '2026-08-20 10:12',
    items: DEMO_ITEMS.slice(2, 12),
  },
  // —— 已入库：全流程完成 ——
  {
    id: 'ir-seed-6',
    org: '平安科技',
    reporter: '王明远',
    contact: '13700000003',
    fileName: '平安-已完成入库清单-0810.xlsx',
    createdAt: '2026-08-10 16:20',
    status: '已入库',
    assignedOrgId: 'org-002',
    assignedOrgName: '平安科技',
    assignedTo: '王明远',
    assignedAt: '2026-08-11 09:00',
    returnStatus: '成功',
    returnOkCount: 5,
    returnFailCount: 0,
    returnedAt: '2026-08-12 15:30',
    items: DEMO_ITEMS.slice(0, 5),
  },
]

function seedList() {
  return SEED_REQUESTS.map((r) => ({
    ...r,
    itemCount: r.items.length,
    items: r.items.map((item) => ({ ...item })),
  }))
}

function load() {
  let stored = []
  let storedSeedVersion = 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) {
      // 旧格式：直接存数组（无版本号），按版本 0 处理
      stored = parsed
    } else if (parsed && Array.isArray(parsed.list)) {
      stored = parsed.list
      storedSeedVersion = Number(parsed.__seedVersion) || 0
    }
  } catch (e) {
    // 读取失败按无存储处理
  }
  const seed = seedList()
  const seedIds = new Set(seed.map((r) => r.id))
  // 用户真实提交的清单始终保留（id 不在种子内）
  const storedReal = stored.filter((r) => !seedIds.has(r.id))
  // 种子覆盖仅在版本一致时采用：版本不符说明存储的是旧结构（可能缺字段/状态），
  // 直接丢弃以免覆盖新种子数据；用户已做的修改在版本升级后回到种子初始态，属预期行为。
  if (storedSeedVersion !== SEED_VERSION) return [...seed, ...storedReal]
  const storedById = new Map(stored.map((r) => [r.id, r]))
  // 种子记录若已被修改（回传结果、状态变更等），以存储中的版本为准
  const mergedSeed = seed.map((r) => storedById.get(r.id) || r)
  return [...mergedSeed, ...storedReal]
}

function persist(list) {
  try {
    // 带种子版本号写入，供下次读取判断存储结构是否过期
    const payload = { __seedVersion: SEED_VERSION, list: list.slice(-MAX_ITEMS) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    // 存储失败（超限等）时静默降级为内存态
  }
}

export function getInboundRequests() {
  return load()
}

/** 普通成员提交：初始状态为「待分配」 */
export function addInboundRequest(payload) {
  const list = load()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const record = {
    id: `ir-${now.getTime()}`,
    opinion: payload.opinion || '',
    org: '',
    reporter: '',
    contact: '',
    fileName: payload.fileName,
    itemCount: payload.items.length,
    createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    status: '待分配',
    items: payload.items,
  }
  list.unshift(record)
  persist(list)
  return record
}

/** 平台管理员分配：指定目标组织及其库主 */
export function assignInboundRequest(id, { orgId, orgName, assignee }) {
  const list = load()
  const idx = list.findIndex((r) => r.id === id)
  if (idx !== -1) {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    list[idx].status = '已分配'
    list[idx].assignedOrgId = orgId
    list[idx].assignedOrgName = orgName
    list[idx].assignedTo = assignee
    list[idx].assignedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    persist(list)
  }
}

/** 更新清单状态（待审核 / 已审核 / 已入库 等） */
export function updateInboundStatus(id, status) {
  const list = load()
  const idx = list.findIndex((r) => r.id === id)
  if (idx !== -1) {
    list[idx].status = status
    persist(list)
  }
}

/** 回写清单的回传结果：回传状态（回传中/成功/失败）、成功条数、失败条数、失败明细与回传时间 */
export function updateInboundReturn(id, { status, okCount = 0, failCount = 0, failures = null }) {
  const list = load()
  const idx = list.findIndex((r) => r.id === id)
  if (idx !== -1) {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    list[idx].returnStatus = status
    list[idx].returnOkCount = okCount
    list[idx].returnFailCount = failCount
    // 失败明细：校验未通过时记录逐行原因，供列表「失败条数」点击查看
    if (failures) list[idx].returnFailures = failures
    else if (status === '成功') delete list[idx].returnFailures
    list[idx].returnedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    persist(list)
  }
}
