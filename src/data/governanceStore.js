// ==================== 软件治理 · 共享数据 ====================
// 软件治理页与「审批入库」页共用同一份软件列表，保证流程数据闭环：
// 库主在治理页提交入库审核 → 平台管理员在审批页看到「待审批」软件 → 审核通过后状态回写

import { ref } from 'vue'
import { INDICATORS, calcNationalScore } from './govIndicators.js'

export const softwareList = ref([])

/** 已作废软件记录（作废后从软件治理列表移除，记录保留供「我的治理清单」展示） */
export const voidedList = ref([])

let nextId = 1

export function genId() {
  return nextId++
}

// ===== 演示种子数据：为每个治理步骤预置不同状态的软件 =====
function makeIndicatorScores(seed = 8) {
  const scores = {}
  INDICATORS.forEach((ind, idx) => {
    // 基线项全部合格（>0），bl-14 持续供应能力 ≥ 6；增强项也给分
    const base = ind.id === 'bl-14' ? 9 : seed
    const score = Math.max(1, Math.min(10, base + ((idx * 3) % 3) - 1))
    scores[ind.id] = { score, params: {} }
  })
  return scores
}

function seedItem(opts) {
  const now = new Date().toLocaleString('zh-CN')
  const item = {
    id: genId(),
    name: opts.name,
    version: opts.version,
    repoUrl: opts.repoUrl || `https://github.com/example/${opts.name.toLowerCase().replace(/\s+/g, '-')}.git`,
    lang: opts.lang || 'Java',
    license: opts.license || 'Apache-2.0',
    file: opts.file || `${opts.name.toLowerCase().replace(/\s+/g, '-')}-${opts.version}.jar`,
    developer: opts.developer || '—',
    licenseId: opts.license || 'Apache-2.0',
    branch: 'main',
    tag: `v${opts.version}`,
    commitId: opts.commitId || 'abc123def456',
    codeSize: String(opts.codeSize || 120),
    vulnUrl: `https://github.com/example/${opts.name.toLowerCase().replace(/\s+/g, '-')}/security`,
    // 国内备份地址来自治理负责人回传的治理结果，不自动生成；未回传则为空，备份时校验不通过
    mirrorUrl: opts.mirrorUrl || '',
    // 治理负责人：负责本软件治理入库的库主（用于审批入库页展示）
    govOwner: opts.govOwner || '—',
    govOrg: opts.govOrg || '—',
    // 提交人 / 提交组织：来源入库需求清单的反馈人与反馈组织
    submitter: opts.submitter || '',
    submitOrg: opts.submitOrg || '',
    currentStep: opts.currentStep,
    selected: false,
    createdAt: opts.createdAt || '2026-08-12 09:00',
    backupStatus: opts.backupStatus || '待备份',
    assessStatus: opts.assessStatus || '待评估',
    reviewStatus: opts.reviewStatus || '待评审',
    warehouseStatus: opts.warehouseStatus || '待审批',
    riskLevel: opts.riskLevel ?? null,
    vulnCount: opts.vulnCount ?? 0,
    logs: opts.logs ? [{ time: now, level: 'info', msg: '演示种子数据' }, ...opts.logs] : [{ time: now, level: 'info', msg: '演示种子数据' }],
  }
  if (opts.scanProgress != null) item.scanProgress = opts.scanProgress
  if (opts.scaProgress != null) item.scaProgress = opts.scaProgress
  if (opts.copyrightProgress != null) item.copyrightProgress = opts.copyrightProgress
  if (opts.malwareProgress != null) item.malwareProgress = opts.malwareProgress
  if (opts.sbomProgress != null) item.sbomProgress = opts.sbomProgress
  if (opts.vulnProgress != null) item.vulnProgress = opts.vulnProgress
  if (opts.licenseProgress != null) item.licenseProgress = opts.licenseProgress
  if (opts.scored) {
    item.indicatorScores = makeIndicatorScores(opts.scoreSeed)
    item.nationalScore = calcNationalScore(item.indicatorScores)
  }
  if (opts.vulnCount != null) item.vulnCount = opts.vulnCount
  if (opts.sbomCount != null) item.sbomCount = opts.sbomCount
  if (opts.warehouseTime) item.warehouseTime = opts.warehouseTime
  if (opts.reviewComment) item.reviewComment = opts.reviewComment
  if (opts.reviewHistory) item.reviewHistory = opts.reviewHistory
  if (opts.lastSync) item.lastSync = opts.lastSync
  if (opts.rejectReason) item.rejectReason = opts.rejectReason
  if (opts.voidReason) item.voidReason = opts.voidReason
  return item
}

/**
 * 软件物料清单总数：治理模板「依赖清单」为树形 JSON 文本（组件含 child 子组件），
 * 递归统计全部组件数量，用于治理页「软件物料清单总数」列展示。
 */
export function countSbomItems(depsText) {
  let list = []
  try {
    list = JSON.parse(depsText || '[]')
  } catch (err) {
    return 0
  }
  if (!Array.isArray(list)) return 0
  const walk = (nodes) => nodes.reduce((sum, node) => {
    if (!node || typeof node !== 'object') return sum
    return sum + 1 + (Array.isArray(node.child) ? walk(node.child) : 0)
  }, 0)
  return walk(list)
}

export function seedGovernanceData() {
  if (softwareList.value.length) return
  softwareList.value.push(
    // —— 步骤1：源码备份（治理结果随模板回传后直接进入本步骤，等待备份仓库） ——
    // Vue.js 源码原本就托管在 AtomGit，故源码地址与国内备份地址为同一个 AtomGit 地址
    seedItem({ name: 'Vue.js', version: '3.4.21', lang: 'TypeScript', license: 'MIT', file: 'vue-3.4.21.zip', developer: '尤雨溪', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 1, createdAt: '2026-08-12 09:00', submitter: '张建国', submitOrg: '中国工商银行', backupStatus: '备份成功', repoUrl: 'https://atomgit.com/opensource/vuejs-core', mirrorUrl: 'https://atomgit.com/opensource/vuejs-core', lastSync: '2026-08-12 10:20' }),
    // React 源码仅在 GitHub，治理负责人已手动上传至 AtomGit，国内备份地址随治理结果回传
    seedItem({ name: 'React', version: '18.2.0', lang: 'JavaScript', license: 'MIT', file: 'react-18.2.0.zip', developer: 'Meta', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 1, createdAt: '2026-08-11 15:20', submitter: '陈晓峰', submitOrg: '阿里巴巴集团', backupStatus: '待备份', repoUrl: 'https://github.com/facebook/react.git', mirrorUrl: 'https://atomgit.com/opensource/react' }),
    // 回传的国内备份地址非 AtomGit 平台，备份校验不通过 → 备份失败，需修正后重新回传
    seedItem({ name: 'jQuery', version: '3.7.1', lang: 'JavaScript', license: 'MIT', file: 'jquery-3.7.1.zip', developer: 'OpenJS Foundation', govOwner: '王明远', govOrg: '平安科技', currentStep: 1, createdAt: '2026-08-10 09:15', submitter: '王明远', submitOrg: '平安科技', backupStatus: '备份失败', repoUrl: 'https://github.com/jquery/jquery.git', mirrorUrl: 'https://gitcode.com/mirror/jquery', logs: [{ time: '2026-08-10 09:40', level: 'warn', msg: '备份失败：国内备份地址仅支持 AtomGit 平台（当前：https://gitcode.com/mirror/jquery）' }] }),
    // 待备份：治理结果已回传（含 AtomGit 国内备份地址），等待发起源码备份
    seedItem({ name: 'Lodash', version: '4.17.21', lang: 'JavaScript', license: 'MIT', file: 'lodash-4.17.21.zip', developer: 'OpenJS Foundation', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 1, createdAt: '2026-08-13 09:30', submitter: '李思远', submitOrg: '华为技术有限公司', backupStatus: '待备份', repoUrl: 'https://github.com/lodash/lodash.git', mirrorUrl: 'https://atomgit.com/opensource/lodash' }),
    // 待备份：源码原本就托管在 AtomGit，两个地址一致
    seedItem({ name: 'Gitee Go', version: '2.1.0', lang: 'Go', license: 'Apache-2.0', file: 'gitee-go-2.1.0.zip', developer: '开源中国', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 1, createdAt: '2026-08-13 14:05', submitter: '张建国', submitOrg: '中国工商银行', backupStatus: '待备份', repoUrl: 'https://atomgit.com/opensource/gitee-go', mirrorUrl: 'https://atomgit.com/opensource/gitee-go' }),
    // 备份中：校验已通过，正在从 AtomGit 拉取源码包（尚未完成，故无同步时间）
    seedItem({ name: 'Redis', version: '7.2.4', lang: 'C', license: 'BSD-3-Clause', file: 'redis-7.2.4.tar.gz', developer: 'Redis Ltd.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 1, createdAt: '2026-08-12 16:20', submitter: '陈晓峰', submitOrg: '阿里巴巴集团', backupStatus: '备份中', repoUrl: 'https://github.com/redis/redis.git', mirrorUrl: 'https://atomgit.com/opensource/redis', logs: [{ time: '2026-08-12 16:35', level: 'info', msg: '国内备份地址校验通过，开始从 https://atomgit.com/opensource/redis 拉取源码包...' }] }),
    // 备份中：大体积仓库，拉取耗时较长
    seedItem({ name: 'TensorFlow', version: '2.16.1', lang: 'Python', license: 'Apache-2.0', file: 'tensorflow-2.16.1.zip', developer: 'Google', govOwner: '王明远', govOrg: '平安科技', currentStep: 1, createdAt: '2026-08-12 11:40', submitter: '王明远', submitOrg: '平安科技', backupStatus: '备份中', repoUrl: 'https://github.com/tensorflow/tensorflow.git', mirrorUrl: 'https://atomgit.com/opensource/tensorflow', logs: [{ time: '2026-08-12 12:00', level: 'info', msg: '国内备份地址校验通过，开始从 https://atomgit.com/opensource/tensorflow 拉取源码包...' }] }),
    // 备份成功：源码在 GitHub，已手动上传至 AtomGit 后完成备份
    seedItem({ name: 'Guava', version: '33.2.0', lang: 'Java', license: 'Apache-2.0', file: 'guava-33.2.0.jar', developer: 'Google', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 1, createdAt: '2026-08-08 10:15', submitter: '李思远', submitOrg: '华为技术有限公司', backupStatus: '备份成功', repoUrl: 'https://github.com/google/guava.git', mirrorUrl: 'https://atomgit.com/opensource/guava', lastSync: '2026-08-08 11:30' }),
    // 备份成功：源码原本就在 AtomGit，直接复用同一地址完成备份
    seedItem({ name: 'OpenHarmony', version: '4.1.0', lang: 'C/C++', license: 'Apache-2.0', file: 'openharmony-4.1.0.zip', developer: '开放原子开源基金会', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 1, createdAt: '2026-08-07 15:50', submitter: '张建国', submitOrg: '中国工商银行', backupStatus: '备份成功', repoUrl: 'https://atomgit.com/opensource/openharmony', mirrorUrl: 'https://atomgit.com/opensource/openharmony', lastSync: '2026-08-07 16:45' }),
    // 备份失败：回传的国内备份地址为空，校验未通过
    seedItem({ name: 'Hutool', version: '5.8.27', lang: 'Java', license: 'MPL-2.0', file: 'hutool-5.8.27.jar', developer: 'dromara', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 1, createdAt: '2026-08-09 17:20', submitter: '陈晓峰', submitOrg: '阿里巴巴集团', backupStatus: '备份失败', repoUrl: 'https://github.com/dromara/hutool.git', logs: [{ time: '2026-08-09 17:45', level: 'warn', msg: '备份失败：未回传国内备份地址，请先在治理结果中补充后重新回传' }] }),
    // —— 步骤2：软件评分（备份完成 → 自动扫描 + 国标评分） ——
    seedItem({ name: 'Spring Framework', version: '6.1.5', lang: 'Java', license: 'Apache-2.0', file: 'spring-framework-6.1.5.jar', developer: 'VMware', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 2, createdAt: '2026-08-09 14:30', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/spring-framework', lastSync: '2026-08-15 12:10', scaProgress: 100, copyrightProgress: 60, malwareProgress: 0, sbomCount: 34 }),
    seedItem({ name: 'Log4j', version: '2.23.1', lang: 'Java', license: 'Apache-2.0', file: 'log4j-2.23.1.jar', developer: 'Apache', govOwner: '王明远', govOrg: '平安科技', currentStep: 2, createdAt: '2026-08-10 10:05', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/log4j', lastSync: '2026-08-15 11:00', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 3, sbomCount: 12 }),
    // 待扫描：备份已完成，尚未发起扫描（三项检测进度均为 0）
    seedItem({ name: 'MySQL', version: '8.4.0', lang: 'C/C++', license: 'GPL-2.0', file: 'mysql-8.4.0.tar.gz', developer: 'Oracle', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 2, createdAt: '2026-08-14 09:10', backupStatus: '备份成功', repoUrl: 'https://github.com/mysql/mysql-server.git', mirrorUrl: 'https://atomgit.com/opensource/mysql', lastSync: '2026-08-14 10:05', scaProgress: 0, copyrightProgress: 0, malwareProgress: 0, sbomCount: 41 }),
    // 待扫描：源码在 AtomGit，备份完成待扫描
    seedItem({ name: 'Ant Design', version: '5.18.3', lang: 'TypeScript', license: 'MIT', file: 'ant-design-5.18.3.zip', developer: '阿里巴巴集团', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 2, createdAt: '2026-08-14 11:25', backupStatus: '备份成功', repoUrl: 'https://atomgit.com/opensource/ant-design', mirrorUrl: 'https://atomgit.com/opensource/ant-design', lastSync: '2026-08-14 12:00', scaProgress: 0, copyrightProgress: 0, malwareProgress: 0, sbomCount: 26 }),
    // 扫描中：SCA 已完成，版权检测进行中，恶意代码检测未开始
    seedItem({ name: 'Elasticsearch', version: '7.17.22', lang: 'Java', license: 'Elastic-2.0', file: 'elasticsearch-7.17.22.tar.gz', developer: 'Elastic', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 2, createdAt: '2026-08-13 15:40', backupStatus: '备份成功', repoUrl: 'https://github.com/elastic/elasticsearch.git', mirrorUrl: 'https://atomgit.com/opensource/elasticsearch-7', lastSync: '2026-08-13 16:20', scaProgress: 100, copyrightProgress: 45, malwareProgress: 0, sbomCount: 58, assessStatus: '评估中' }),
    // 扫描中：三项检测并行推进中
    seedItem({ name: 'Grafana', version: '11.1.0', lang: 'TypeScript', license: 'AGPL-3.0', file: 'grafana-11.1.0.tar.gz', developer: 'Grafana Labs', govOwner: '王明远', govOrg: '平安科技', currentStep: 2, createdAt: '2026-08-13 10:30', backupStatus: '备份成功', repoUrl: 'https://github.com/grafana/grafana.git', mirrorUrl: 'https://atomgit.com/opensource/grafana', lastSync: '2026-08-13 11:15', scaProgress: 72, copyrightProgress: 38, malwareProgress: 15, sbomCount: 47, assessStatus: '评估中' }),
    // 评估完成：三项检测均成功，国标评分已出（无漏洞）
    seedItem({ name: 'Protobuf', version: '25.3', lang: 'C/C++', license: 'BSD-3-Clause', file: 'protobuf-25.3.tar.gz', developer: 'Google', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 2, createdAt: '2026-08-11 14:20', backupStatus: '备份成功', repoUrl: 'https://github.com/protocolbuffers/protobuf.git', mirrorUrl: 'https://atomgit.com/opensource/protobuf', lastSync: '2026-08-11 15:10', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 0, sbomCount: 8 }),
    // 评估完成：三项检测均成功，检出多个漏洞，国标评分已出
    seedItem({ name: 'Struts2', version: '2.5.33', lang: 'Java', license: 'Apache-2.0', file: 'struts2-2.5.33.jar', developer: 'Apache', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 2, createdAt: '2026-08-10 16:45', backupStatus: '备份成功', repoUrl: 'https://github.com/apache/struts.git', mirrorUrl: 'https://atomgit.com/opensource/struts', lastSync: '2026-08-10 17:30', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 7, sbomCount: 19 }),
    // 评估完成：三项检测均成功，检出少量漏洞
    seedItem({ name: 'Tomcat', version: '10.1.25', lang: 'Java', license: 'Apache-2.0', file: 'tomcat-10.1.25.tar.gz', developer: 'Apache', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 2, createdAt: '2026-08-09 09:50', backupStatus: '备份成功', repoUrl: 'https://github.com/apache/tomcat.git', mirrorUrl: 'https://atomgit.com/opensource/tomcat', lastSync: '2026-08-09 10:40', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 2, sbomCount: 23 }),
    // —— 步骤3：治理成果评估（评分完成，待人工评估意见） ——
    seedItem({ name: 'OpenSSL', version: '3.3.0', lang: 'C', license: 'Apache-2.0', file: 'openssl-3.3.0.tar.gz', developer: 'OpenSSL Software Foundation', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 3, createdAt: '2026-08-06 11:20', repoUrl: 'https://github.com/openssl/openssl.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/openssl', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 4, sbomCount: 15 }),
    // 待评审：评分完成，尚未给出评估意见
    seedItem({ name: 'RabbitMQ', version: '3.13.6', lang: 'Erlang', license: 'MPL-2.0', file: 'rabbitmq-3.13.6.tar.gz', developer: 'Broadcom', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 3, createdAt: '2026-08-08 10:30', repoUrl: 'https://github.com/rabbitmq/rabbitmq-server.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/rabbitmq', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 1, sbomCount: 21 }),
    // 待评审：无漏洞，评分较高，等待评估
    seedItem({ name: 'Fastjson2', version: '2.0.52', lang: 'Java', license: 'Apache-2.0', file: 'fastjson2-2.0.52.jar', developer: '阿里巴巴集团', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 3, createdAt: '2026-08-07 14:15', repoUrl: 'https://github.com/alibaba/fastjson2.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/fastjson2', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 0, sbomCount: 6 }),
    // 评审通过：治理结果合规，已给出评估意见并记录历史
    seedItem({ name: 'PostgreSQL', version: '16.4', lang: 'C', license: 'PostgreSQL', file: 'postgresql-16.4.tar.gz', developer: 'PostgreSQL Global Development Group', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 3, createdAt: '2026-08-05 09:40', repoUrl: 'https://github.com/postgres/postgres.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/postgresql', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 0, sbomCount: 18, reviewStatus: '评审通过', reviewComment: '许可证合规、无高危漏洞，治理结果符合入库要求', reviewHistory: [{ result: '评审通过', opinion: '许可证合规、无高危漏洞，治理结果符合入库要求', operator: '当前用户', timestamp: '2026-08-05 11:20' }] }),
    // 评审通过：存在中低危漏洞但已有修复计划，准予通过
    seedItem({ name: 'Dubbo', version: '3.3.0', lang: 'Java', license: 'Apache-2.0', file: 'dubbo-3.3.0.jar', developer: 'Apache', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 3, createdAt: '2026-08-04 16:05', repoUrl: 'https://github.com/apache/dubbo.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/dubbo', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 2, sbomCount: 29, reviewStatus: '评审通过', reviewComment: '存在 2 个中危漏洞，治理方已提供修复计划，同意通过', reviewHistory: [{ result: '评审不通过', opinion: '中危漏洞未提供修复计划，请补充后重新评估', operator: '当前用户', timestamp: '2026-08-04 17:30' }, { result: '评审通过', opinion: '存在 2 个中危漏洞，治理方已提供修复计划，同意通过', operator: '当前用户', timestamp: '2026-08-05 09:10' }] }),
    // 评审不通过：检出高危漏洞且未修复，退回重新治理
    seedItem({ name: 'Shiro', version: '2.0.2', lang: 'Java', license: 'Apache-2.0', file: 'shiro-2.0.2.jar', developer: 'Apache', govOwner: '王明远', govOrg: '平安科技', currentStep: 3, createdAt: '2026-08-03 11:50', repoUrl: 'https://github.com/apache/shiro.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/shiro', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 6, sbomCount: 14, reviewStatus: '评审不通过', reviewComment: '检出 2 个高危漏洞且未提供修复方案，退回治理方重新处理', reviewHistory: [{ result: '评审不通过', opinion: '检出 2 个高危漏洞且未提供修复方案，退回治理方重新处理', operator: '当前用户', timestamp: '2026-08-03 15:20' }], logs: [{ time: '2026-08-03 15:20', level: 'warn', msg: '评审结果：评审不通过，意见：检出 2 个高危漏洞且未提供修复方案，退回治理方重新处理' }] }),
    // 评审不通过：许可证存在兼容性风险，需重新确认
    seedItem({ name: 'MinIO', version: 'RELEASE.2024-06-13', lang: 'Go', license: 'AGPL-3.0', file: 'minio-2024-06-13.tar.gz', developer: 'MinIO, Inc.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 3, createdAt: '2026-08-02 09:25', repoUrl: 'https://github.com/minio/minio.git', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/opensource/minio', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, vulnCount: 1, sbomCount: 11, reviewStatus: '评审不通过', reviewComment: 'AGPL-3.0 许可证与商用场景存在兼容性风险，需法务确认后重新评估', reviewHistory: [{ result: '评审不通过', opinion: 'AGPL-3.0 许可证与商用场景存在兼容性风险，需法务确认后重新评估', operator: '当前用户', timestamp: '2026-08-02 14:10' }], logs: [{ time: '2026-08-02 14:10', level: 'warn', msg: '评审结果：评审不通过，意见：AGPL-3.0 许可证与商用场景存在兼容性风险，需法务确认后重新评估' }] }),
    // —— 步骤4：提交入库（审核状态：待审批 / 已入库 / 已拒绝） ——
    seedItem({ name: 'Nginx', version: '1.26.0', lang: 'C', license: 'BSD-2-Clause', file: 'nginx-1.26.0.tar.gz', developer: 'NGINX, Inc.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 4, createdAt: '2026-08-03 16:40', repoUrl: 'https://atomgit.com/opensource/nginx', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/nginx', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', reviewComment: '治理结果合规，准予入库', warehouseStatus: '已入库', warehouseTime: '2026-08-10 14:30' }),
    seedItem({ name: 'Elasticsearch', version: '8.15.0', lang: 'Java', license: 'Elastic-2.0', file: 'elasticsearch-8.15.0.tar.gz', developer: 'Elastic', govOwner: '王明远', govOrg: '平安科技', currentStep: 4, createdAt: '2026-07-30 09:30', repoUrl: 'https://atomgit.com/opensource/elasticsearch', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/elasticsearch', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', warehouseStatus: '待审批', vulnCount: 2 }),
    seedItem({ name: 'Kafka', version: '3.9.2', lang: 'Scala', license: 'Apache-2.0', file: 'kafka-3.9.2.tgz', developer: 'Apache', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 4, createdAt: '2026-07-25 14:15', repoUrl: 'https://atomgit.com/opensource/kafka', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/kafka', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', warehouseStatus: '已入库', vulnCount: 0, warehouseTime: '2026-08-02 10:30' }),
    seedItem({ name: 'MongoDB', version: '7.0.12', lang: 'C++', license: 'SSPL-1.0', file: 'mongodb-7.0.12.tgz', developer: 'MongoDB Inc.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 4, createdAt: '2026-07-20 11:00', repoUrl: 'https://atomgit.com/opensource/mongodb', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/mongodb', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', warehouseStatus: '已拒绝', vulnCount: 5, rejectReason: '存在未修复的超危漏洞，且许可证兼容性存疑，需整改后重新提交', logs: [{ time: '2026-07-22 15:20', level: 'warn', msg: '已拒绝，拒绝原因：存在未修复的超危漏洞，且许可证兼容性存疑，需整改后重新提交' }] }),
    // 待审批：评审通过后已提交入库审核，等待平台管理员审批（无漏洞）
    seedItem({ name: 'Vue Router', version: '4.4.0', lang: 'TypeScript', license: 'MIT', file: 'vue-router-4.4.0.zip', developer: '尤雨溪', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 4, createdAt: '2026-08-01 10:20', repoUrl: 'https://atomgit.com/opensource/vue-router', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/vue-router', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', reviewComment: '无高危漏洞，许可证合规，准予提交入库', warehouseStatus: '待审批', vulnCount: 0, sbomCount: 7 }),
    // 待审批：存在低危漏洞，评估通过后提交审核
    seedItem({ name: 'Pinia', version: '2.2.0', lang: 'TypeScript', license: 'MIT', file: 'pinia-2.2.0.zip', developer: '尤雨溪', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 4, createdAt: '2026-08-02 14:35', repoUrl: 'https://atomgit.com/opensource/pinia', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/pinia', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', reviewComment: '仅 1 个低危漏洞且已有修复计划，同意提交入库', warehouseStatus: '待审批', vulnCount: 1, sbomCount: 9 }),
    // 已入库：平台管理员审批通过
    seedItem({ name: 'Zookeeper', version: '3.9.2', lang: 'Java', license: 'Apache-2.0', file: 'zookeeper-3.9.2.tar.gz', developer: 'Apache', govOwner: '王明远', govOrg: '平安科技', currentStep: 4, createdAt: '2026-07-18 09:45', repoUrl: 'https://atomgit.com/opensource/zookeeper', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/zookeeper', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', reviewComment: '治理结果合规，准予入库', warehouseStatus: '已入库', vulnCount: 0, sbomCount: 25, warehouseTime: '2026-07-24 11:10' }),
    // 已入库：许可证合规，平台管理员审批通过
    seedItem({ name: 'MyBatis', version: '3.5.16', lang: 'Java', license: 'Apache-2.0', file: 'mybatis-3.5.16.jar', developer: 'MyBatis', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 4, createdAt: '2026-07-15 15:30', repoUrl: 'https://atomgit.com/opensource/mybatis', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/mybatis', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', reviewComment: '许可证合规、无高危漏洞，准予入库', warehouseStatus: '已入库', vulnCount: 1, sbomCount: 13, warehouseTime: '2026-07-21 09:50' }),
    // 已拒绝：检出高危漏洞，平台管理员拒绝
    seedItem({ name: 'Log4j 1.x', version: '1.2.17', lang: 'Java', license: 'Apache-2.0', file: 'log4j-1.2.17.jar', developer: 'Apache', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 4, createdAt: '2026-07-12 11:15', repoUrl: 'https://atomgit.com/opensource/log4j-1', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/log4j-1', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', warehouseStatus: '已拒绝', vulnCount: 9, sbomCount: 5, rejectReason: '该版本已停止维护且存在多个未修复超危漏洞，禁止入库，建议升级至 2.x', logs: [{ time: '2026-07-14 10:20', level: 'warn', msg: '已拒绝，拒绝原因：该版本已停止维护且存在多个未修复超危漏洞，禁止入库，建议升级至 2.x' }] }),
    // 已拒绝：许可证与商用场景不兼容，平台管理员拒绝
    seedItem({ name: 'CockroachDB', version: '24.1.2', lang: 'Go', license: 'BUSL-1.1', file: 'cockroachdb-24.1.2.tgz', developer: 'Cockroach Labs', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 4, createdAt: '2026-07-10 16:40', repoUrl: 'https://atomgit.com/opensource/cockroachdb', backupStatus: '备份成功', mirrorUrl: 'https://atomgit.com/mirror/cockroachdb', scaProgress: 100, copyrightProgress: 100, malwareProgress: 100, assessStatus: '评估完成', scored: true, reviewStatus: '评审通过', warehouseStatus: '已拒绝', vulnCount: 0, sbomCount: 31, rejectReason: 'BUSL-1.1 许可证限制商用，与业务场景不兼容，不予入库', logs: [{ time: '2026-07-13 14:05', level: 'warn', msg: '已拒绝，拒绝原因：BUSL-1.1 许可证限制商用，与业务场景不兼容，不予入库' }] }),
  )
  // 已作废软件（作废后从软件治理列表移除，记录保留供「我的治理清单」展示）
  if (!voidedList.value.length) {
    voidedList.value.push(
      { id: genId(), name: 'Django', version: '5.0.4', lang: 'Python', license: 'BSD-3-Clause', repoUrl: 'https://github.com/django/django', govOwner: '王明远', govOrg: '平安科技', submitter: '王明远', submitOrg: '平安科技', createdAt: '2026-08-08 09:45', warehouseStatus: '已作废', voidReason: '评估中发现重大许可证风险，按规范作废', warehouseTime: '2026-08-13 15:40', logs: [{ time: '2026-08-13 15:40', level: 'warn', msg: '作废软件：Django v5.0.4，原因：评估中发现重大许可证风险，按规范作废' }] },
      { id: genId(), name: 'Redis', version: '7.2.4', lang: 'C', license: 'BSD-3-Clause', repoUrl: 'https://github.com/redis/redis', govOwner: '李思远', govOrg: '华为技术有限公司', submitter: '李思远', submitOrg: '华为技术有限公司', createdAt: '2026-08-05 10:10', warehouseStatus: '已作废', voidReason: '业务方取消引入，按规范作废', warehouseTime: '2026-08-11 09:20', logs: [{ time: '2026-08-11 09:20', level: 'warn', msg: '作废软件：Redis v7.2.4，原因：业务方取消引入，按规范作废' }] },
      { id: genId(), name: 'RabbitMQ', version: '3.13.6', lang: 'Erlang', license: 'MPL-2.0', repoUrl: 'https://github.com/rabbitmq/rabbitmq-server', govOwner: '李思远', govOrg: '华为技术有限公司', submitter: '李思远', submitOrg: '华为技术有限公司', createdAt: '2026-07-15 09:00', warehouseStatus: '已作废', voidReason: '治理评估不达标，按规范作废', warehouseTime: '2026-07-19 16:40', logs: [{ time: '2026-07-19 16:40', level: 'warn', msg: '作废软件：RabbitMQ v3.13.6，原因：治理评估不达标，按规范作废' }] },
    )
  }
}

/** 待审批软件（已提交入库审核，等待平台管理员审批） */
export function getPendingApprovals() {
  return softwareList.value.filter((i) => i.currentStep === 4 && i.warehouseStatus === '待审批')
}

/** 平台管理员审核入库：待审批 → 已入库 */
export function approveWarehouse(item) {
  const now = new Date().toLocaleString('zh-CN')
  item.warehouseStatus = '已入库'
  item.warehouseTime = now
  if (!item.logs) item.logs = []
  item.logs.push({ time: now, level: 'ok', msg: '平台管理员审核通过，软件已入库' })
  return item
}

/** 平台管理员拒绝：待审批 → 已拒绝（记录拒绝原因） */
export function rejectWarehouse(item, reason = '') {
  const now = new Date().toLocaleString('zh-CN')
  item.warehouseStatus = '已拒绝'
  item.rejectReason = reason || '未填写'
  item.warehouseTime = now
  if (!item.logs) item.logs = []
  item.logs.push({ time: now, level: 'warn', msg: `已拒绝，拒绝原因：${item.rejectReason}` })
  return item
}

/** 作废软件：从软件治理列表移除（审核入库不再可见），记录原因供「我的治理清单」展示，不可恢复 */
export function voidSoftware(item, reason = '') {
  const now = new Date().toLocaleString('zh-CN')
  const record = {
    id: item.id,
    name: item.name,
    version: item.version,
    lang: item.lang,
    license: item.license,
    repoUrl: item.repoUrl,
    govOwner: item.govOwner,
    govOrg: item.govOrg,
    submitter: item.submitter,
    submitOrg: item.submitOrg,
    createdAt: item.createdAt,
    warehouseStatus: '已作废',
    voidReason: reason || '未填写',
    warehouseTime: now,
    logs: [...(item.logs || []), { time: now, level: 'warn', msg: `作废软件：${item.name} v${item.version}，原因：${reason || '未填写'}` }],
  }
  voidedList.value.unshift(record)
  const idx = softwareList.value.indexOf(item)
  if (idx !== -1) softwareList.value.splice(idx, 1)
  return record
}

/**
 * 软件导入模板回传导入：把校验通过的治理结果写入「源码备份」列表。
 * 每条数据带上提交人与提交组织（取自入库需求清单，不采信回传表格内容）；
 * 治理结果（依赖清单、历史漏洞、恶意代码、开发者信息、许可证列表等）直接来自模板，
 * 系统据此自动完成国标评分，无需治理负责人再执行备份 / 扫描 / 评分等手动治理环节。
 */
export function importFromInbound(entries, inbound) {
  const now = new Date().toLocaleString('zh-CN')
  const created = entries.map((e) => {
    // 治理结果：历史漏洞信息 / 恶意代码为 JSON 数组文本，解析出计数用于展示
    let vulnCount = 0
    let riskLevel = null
    try {
      const vulns = JSON.parse(e.vulns || '[]')
      vulnCount = Array.isArray(vulns) ? vulns.length : 0
      const severe = (vulns || []).filter((v) => (v['严重程度'] || '').includes('高') || (v['严重程度'] || '').includes('超危')).length
      if (severe > 0) riskLevel = '高危'
      else if (vulnCount > 0) riskLevel = '中危'
    } catch (err) {
      // 非 JSON 文本按 0 处理
    }
    const hasMalware = /恶意|malicious/i.test(e.malware || '')
    if (hasMalware) riskLevel = '高危'
    const item = {
      id: genId(),
      name: e.name,
      version: e.version,
      repoUrl: e.repoUrl,
      srcPkgUrl: e.srcPkgUrl || e.repoUrl,
      industry: e.industry || '—',
      techStack: e.techStack || '—',
      integrationRisk: e.integrationRisk || '—',
      lang: e.lang,
      license: e.license,
      file: e.file || '—',
      developer: e.developer || '—',
      releaseDate: e.releaseDate || '—',
      homepage: e.homepage || e.repoUrl,
      copyright: e.copyright || '—',
      codeSize: e.codeSize || '—',
      vitality: e.vitality || '—',
      eolDate: e.eolDate || '—',
      versionDesc: e.versionDesc || '—',
      desc: e.desc || '—',
      deps: e.deps || '—',
      sbomCount: countSbomItems(e.deps),
      vulns: e.vulns || '—',
      malware: e.malware || '—',
      devInfo: e.devInfo || '—',
      licenses: e.licenses || e.license,
      licenseId: e.license || '—',
      branch: 'main',
      tag: '—',
      commitId: '—',
      vulnUrl: '—',
      // 国内备份地址：来自治理结果（模板必填，仅支持 AtomGit），不自动生成
      mirrorUrl: e.mirrorUrl || '',
      govOwner: inbound.assignedTo || '—',
      govOrg: inbound.assignedOrgName || '—',
      submitter: inbound.reporter || '—',
      submitOrg: inbound.org || '—',
      currentStep: 1,
      selected: false,
      createdAt: now,
      // 治理结果随模板回传，软件直接进入「源码备份」步骤，后续备份/评分/评估/提交入库在治理页完成
      backupStatus: '待备份',
      assessStatus: '待评估',
      reviewStatus: '待评审',
      warehouseStatus: '待提交审批',
      riskLevel,
      vulnCount,
      logs: [{ time: now, level: 'info', msg: `由 ${inbound.reporter || '—'}（${inbound.org || '—'}）提交，按软件导入模板回传治理结果` }],
    }
    // 系统根据模板治理结果自动完成国标评分（不再手动评分）
    item.indicatorScores = makeIndicatorScores()
    if (vulnCount > 0) {
      // 漏洞指标按实际数量扣分，其余指标保持基线分
      const vulnInd = INDICATORS.find((ind) => ind.group === '漏洞密度')
      if (vulnInd) item.indicatorScores[vulnInd.id] = { score: Math.max(1, 10 - vulnCount), params: { n: vulnCount } }
    }
    if (hasMalware) {
      const mwInd = INDICATORS.find((ind) => ind.group === '恶意代码')
      if (mwInd) item.indicatorScores[mwInd.id] = { score: 1, params: {} }
    }
    item.nationalScore = calcNationalScore(item.indicatorScores)
    return item
  })
  softwareList.value.push(...created)
  return created
}

seedGovernanceData()
