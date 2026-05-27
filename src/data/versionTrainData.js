// ==================== 版本火车 · 模拟数据 ====================

// 1. 技术评审结果（待入库的软件列表 - 模拟从 Excel 导入）
export const reviewResults = [
  { id: 1, name: 'Apache Kafka', lang: 'Java', stars: 28500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '成熟度较高，社区活跃，建议入库', reviewedAt: '2026-05-20' },
  { id: 2, name: 'Elasticsearch', lang: 'Java', stars: 69200, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '主流搜索引擎组件，安全合规', reviewedAt: '2026-05-20' },
  { id: 3, name: 'Redis Stack', lang: 'C', stars: 52000, license: 'BSD-3-Clause', scanStatus: '已扫描', riskLevel: '中', reviewResult: '通过', reviewOpinion: '需关注集群版许可限制', reviewedAt: '2026-05-20' },
  { id: 4, name: 'Prometheus', lang: 'Go', stars: 54500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '监控生态核心组件，推荐入库', reviewedAt: '2026-05-20' },
  { id: 5, name: 'Grafana', lang: 'TypeScript', stars: 64000, license: 'AGPL-3.0', scanStatus: '已扫描', riskLevel: '中', reviewResult: '不通过', reviewOpinion: 'AGPL 许可存在合规风险，需法务复核', reviewedAt: '2026-05-20' },
  { id: 6, name: 'etcd', lang: 'Go', stars: 47500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '分布式系统核心组件，建议入库', reviewedAt: '2026-05-20' },
  { id: 7, name: 'Consul', lang: 'Go', stars: 28500, license: 'MPL-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '服务网格基础组件，已通过安全扫描', reviewedAt: '2026-05-20' },
  { id: 8, name: 'RabbitMQ', lang: 'Erlang', stars: 12000, license: 'MPL-2.0', scanStatus: '已扫描', riskLevel: '中', reviewResult: '不通过', reviewOpinion: 'Erlang 语言生态缺少维护者，暂缓入库', reviewedAt: '2026-05-20' },
  { id: 9, name: 'MinIO', lang: 'Go', stars: 48500, license: 'AGPL-3.0', scanStatus: '已扫描', riskLevel: '中', reviewResult: '通过', reviewOpinion: '对象存储场景刚需，AGPL 经法务确认可接受', reviewedAt: '2026-05-21' },
  { id: 10, name: 'Apache Flink', lang: 'Java', stars: 24000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '流式计算核心组件，安全合规', reviewedAt: '2026-05-21' },
  { id: 11, name: 'Nginx', lang: 'C', stars: 23000, license: 'BSD-2-Clause', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '反向代理核心组件，建议入库', reviewedAt: '2026-05-21' },
  { id: 12, name: 'PostgreSQL', lang: 'C', stars: 16000, license: 'PostgreSQL', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '关系型数据库核心组件，安全合规', reviewedAt: '2026-05-21' },
  { id: 13, name: 'MySQL', lang: 'C++', stars: 11000, license: 'GPL-2.0', scanStatus: '已扫描', riskLevel: '中', reviewResult: '待定', reviewOpinion: 'GPL 许可需法务确认合规边界', reviewedAt: '2026-05-21' },
  { id: 14, name: 'MongoDB', lang: 'C++', stars: 26000, license: 'SSPL', scanStatus: '已扫描', riskLevel: '高', reviewResult: '不通过', reviewOpinion: 'SSPL 许可存在较大法律风险', reviewedAt: '2026-05-21' },
  { id: 15, name: 'Node.js', lang: 'JavaScript', stars: 106000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '运行时核心依赖，强烈建议入库', reviewedAt: '2026-05-21' },
  { id: 16, name: 'Python', lang: 'Python', stars: 62000, license: 'PSF', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: 'Python 运行时基础组件，安全合规', reviewedAt: '2026-05-21' },
  { id: 17, name: 'Go', lang: 'Go', stars: 124000, license: 'BSD-3-Clause', scanStatus: '已扫描', riskLevel: '低', reviewResult: '待定', reviewOpinion: 'Go 编译器，需确认供应链完整性', reviewedAt: '2026-05-22' },
  { id: 18, name: 'Rust', lang: 'Rust', stars: 98000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '系统编程基础组件，建议入库', reviewedAt: '2026-05-22' },
  { id: 19, name: 'Vue.js', lang: 'TypeScript', stars: 208000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '前端框架核心组件，推荐入库', reviewedAt: '2026-05-22' },
  { id: 20, name: 'React', lang: 'JavaScript', stars: 228000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '前端生态核心组件，建议入库', reviewedAt: '2026-05-22' },
  { id: 21, name: 'Angular', lang: 'TypeScript', stars: 96000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '不通过', reviewOpinion: '版本碎片化严重，暂缓入库', reviewedAt: '2026-05-22' },
  { id: 22, name: 'Spring Boot', lang: 'Java', stars: 75000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '微服务基础框架，强烈建议入库', reviewedAt: '2026-05-22' },
  { id: 23, name: 'Apache Dubbo', lang: 'Java', stars: 40000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: 'RPC 框架核心组件，安全合规', reviewedAt: '2026-05-22' },
  { id: 24, name: 'MyBatis', lang: 'Java', stars: 19500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '待定', reviewOpinion: 'ORM 框架，需评估与现有架构兼容性', reviewedAt: '2026-05-22' },
  { id: 25, name: 'Apache Tomcat', lang: 'Java', stars: 7400, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: 'Servlet 容器基础组件，建议入库', reviewedAt: '2026-05-22' },
  { id: 26, name: 'Nacos', lang: 'Java', stars: 30000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '服务发现与配置核心组件', reviewedAt: '2026-05-22' },
  { id: 27, name: 'Sentinel', lang: 'Java', stars: 22500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '流量管控组件，安全合规', reviewedAt: '2026-05-22' },
  { id: 28, name: 'Apache SkyWalking', lang: 'Java', stars: 24000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '待定', reviewOpinion: 'APM 工具，需验证与现有监控体系兼容性', reviewedAt: '2026-05-23' },
  { id: 29, name: 'Zipkin', lang: 'Java', stars: 17000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '链路追踪组件，建议入库', reviewedAt: '2026-05-23' },
  { id: 30, name: 'Jenkins', lang: 'Java', stars: 23000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: 'CI/CD 核心组件，推荐入库', reviewedAt: '2026-05-23' },
  { id: 31, name: 'Harbor', lang: 'Go', stars: 24000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '镜像仓库核心组件，安全合规', reviewedAt: '2026-05-23' },
  { id: 32, name: 'Kubernetes', lang: 'Go', stars: 111000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '容器编排核心组件，强烈建议入库', reviewedAt: '2026-05-23' },
  { id: 33, name: 'Docker', lang: 'Go', stars: 69000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '容器运行时核心组件', reviewedAt: '2026-05-23' },
  { id: 34, name: 'containerd', lang: 'Go', stars: 17000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '容器运行时标准组件', reviewedAt: '2026-05-23' },
  { id: 35, name: 'CoreDNS', lang: 'Go', stars: 12000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: 'DNS 服务组件，建议入库', reviewedAt: '2026-05-23' },
  { id: 36, name: 'Calico', lang: 'Go', stars: 6000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '待定', reviewOpinion: '网络插件，需验证 CNI 兼容性', reviewedAt: '2026-05-23' },
  { id: 37, name: 'Istio', lang: 'Go', stars: 36000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '中', reviewResult: '通过', reviewOpinion: '服务网格核心组件，注意资源消耗', reviewedAt: '2026-05-23' },
  { id: 38, name: 'Envoy', lang: 'C++', stars: 25000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '代理核心组件，建议入库', reviewedAt: '2026-05-23' },
  { id: 39, name: 'Apache ZooKeeper', lang: 'Java', stars: 12000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '不通过', reviewOpinion: '已被 etcd/Nacos 取代，不建议入库', reviewedAt: '2026-05-23' },
  { id: 40, name: 'Apache Hadoop', lang: 'Java', stars: 14500, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '大数据基础组件，建议入库', reviewedAt: '2026-05-23' },
  { id: 41, name: 'Apache Spark', lang: 'Scala', stars: 39000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '计算引擎核心组件', reviewedAt: '2026-05-23' },
  { id: 42, name: 'Apache HBase', lang: 'Java', stars: 5200, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '待定', reviewOpinion: 'NoSQL 数据库，需评估当前使用场景', reviewedAt: '2026-05-24' },
  { id: 43, name: 'Cassandra', lang: 'Java', stars: 9000, license: 'Apache-2.0', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '分布式数据库组件', reviewedAt: '2026-05-24' },
  { id: 44, name: 'Neo4j', lang: 'Java', stars: 13000, license: 'GPL-3.0', scanStatus: '已扫描', riskLevel: '高', reviewResult: '不通过', reviewOpinion: 'GPL-3.0 许可存在合规风险', reviewedAt: '2026-05-24' },
  { id: 45, name: 'Vite', lang: 'TypeScript', stars: 68000, license: 'MIT', scanStatus: '已扫描', riskLevel: '低', reviewResult: '通过', reviewOpinion: '前端构建工具，建议入库', reviewedAt: '2026-05-24' },
]

// 2. 版本火车列表
export const versionTrains = [
  {
    id: 'VT-2026-001',
    name: '2026年Q2首次发车',
    status: '待发车',
    createdAt: '2026-05-25',
    softwareList: [
      { id: 1, name: 'Apache Kafka', version: '3.9.0', status: '待发布', scanned: true },
      { id: 2, name: 'Elasticsearch', version: '8.15.0', status: '待发布', scanned: true },
      { id: 3, name: 'Redis Stack', version: '7.4.0', status: '待发布', scanned: true },
      { id: 4, name: 'Prometheus', version: '2.54.0', status: '待发布', scanned: true },
      { id: 5, name: 'etcd', version: '3.5.15', status: '待发布', scanned: true },
      { id: 6, name: 'Consul', version: '1.19.0', status: '待发布', scanned: true },
      { id: 7, name: 'MinIO', version: 'RELEASE.2026-05', status: '待发布', scanned: true },
      { id: 8, name: 'Apache Flink', version: '2.0.0', status: '待发布', scanned: true },
    ],
  },
  {
    id: 'VT-2026-002',
    name: '2026年Q2安全补丁包',
    status: '待发车',
    createdAt: '2026-05-24',
    softwareList: [
      { id: 9, name: 'OpenSSL', version: '3.3.2', status: '待发布', scanned: true },
      { id: 10, name: 'log4j-core', version: '2.24.0', status: '待发布', scanned: true },
    ],
  },
]

// 3. 发车历史
export const releaseHistory = [
  {
    id: 'VT-2025-004',
    name: '2025年Q4补丁包',
    versionNum: 'v4.2.0',
    releaseTime: '2025-12-20 10:00:00',
    endTime: '2026-06-20 23:59:59',
    status: '已发车',
    softwareCount: 6,
  },
  {
    id: 'VT-2025-003',
    name: '2025年Q3首次发车',
    versionNum: 'v4.1.0',
    releaseTime: '2025-09-15 10:00:00',
    endTime: '2026-03-15 23:59:59',
    status: '已过期',
    softwareCount: 12,
  },
  {
    id: 'VT-2025-002',
    name: '2025年Q2安全补丁包',
    versionNum: 'v4.0.1',
    releaseTime: '2025-06-01 10:00:00',
    endTime: '2025-12-01 23:59:59',
    status: '已过期',
    softwareCount: 4,
  },
]

// 4. 补丁计划 · CVE 预警
export const patchPlanCVEList = [
  { id: 1, cveId: 'CVE-2026-28473', level: '高危', component: 'OpenSSL', version: '3.3.1', publishTime: '2026-05-24', description: '证书解析缓冲区溢出远程代码执行', affected: true, action: '待处理' },
  { id: 2, cveId: 'CVE-2026-27115', level: '严重', component: 'log4j-core', version: '2.23.1', publishTime: '2026-05-23', description: 'JNDI 注入远程代码执行漏洞', affected: true, action: '待处理' },
  { id: 3, cveId: 'CVE-2026-25890', level: '高危', component: 'Apache Kafka', version: '3.8.0', publishTime: '2026-05-22', description: 'KRaft 模式权限绕过漏洞', affected: true, action: '已下架' },
  { id: 4, cveId: 'CVE-2026-24771', level: '中危', component: 'Redis Stack', version: '7.2.0', publishTime: '2026-05-20', description: '集群模式内存泄漏导致拒绝服务', affected: false, action: '无需处理' },
  { id: 5, cveId: 'CVE-2026-23349', level: '高危', component: 'Consul', version: '1.18.0', publishTime: '2026-05-18', description: '服务注册中心 API 认证绕过', affected: false, action: '版本已更新' },
]

// 5. 补丁通知记录
export const patchNotificationHistory = [
  { id: 1, trainId: 'VT-2025-004', cveId: 'CVE-2025-49844', component: 'Redis', affectedVersions: '7.2.0', notifyTime: '2025-12-21 14:00:00', action: '下架通知已发送', status: '已完成' },
  { id: 2, trainId: 'VT-2025-003', cveId: 'CVE-2025-15467', component: 'OpenSSL', affectedVersions: '3.0.0-3.2.0', notifyTime: '2025-09-16 09:30:00', action: '补丁升级通知已发送', status: '已完成' },
]
