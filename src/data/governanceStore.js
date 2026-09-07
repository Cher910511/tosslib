// ==================== 软件治理 · 共享数据 ====================
// 软件治理页与「审批入库」页共用同一份软件列表，保证流程数据闭环：
// 库主在治理页提交入库审核 → 平台管理员在审批页看到「待审批」软件 → 审核通过后状态回写

import { ref } from 'vue'
import { INDICATORS, calcNationalScore } from './govIndicators.js'

export const softwareList = ref([])

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
    mirrorUrl: 'https://gitcode.com/mirror/' + opts.name.toLowerCase().replace(/\s+/g, '-'),
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
  if (opts.warehouseTime) item.warehouseTime = opts.warehouseTime
  if (opts.reviewComment) item.reviewComment = opts.reviewComment
  if (opts.lastSync) item.lastSync = opts.lastSync
  if (opts.rejectReason) item.rejectReason = opts.rejectReason
  return item
}

export function seedGovernanceData() {
  if (softwareList.value.length) return
  softwareList.value.push(
    // —— 步骤1：软件获取（待备份） ——
    seedItem({ name: 'Vue.js', version: '3.4.21', lang: 'TypeScript', license: 'MIT', file: 'vue-3.4.21.zip', developer: '尤雨溪', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 1, createdAt: '2026-08-12 09:00', submitter: '张建国', submitOrg: '中国工商银行' }),
    seedItem({ name: 'React', version: '18.2.0', lang: 'JavaScript', license: 'MIT', file: 'react-18.2.0.zip', developer: 'Meta', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 1, createdAt: '2026-08-11 15:20', submitter: '陈晓峰', submitOrg: '阿里巴巴集团' }),
    // —— 步骤2：引入选型（部分备份完成） ——
    seedItem({ name: 'Log4j', version: '2.23.1', lang: 'Java', license: 'Apache-2.0', file: 'log4j-2.23.1.jar', developer: 'Apache', govOwner: '王明远', govOrg: '平安科技', currentStep: 2, createdAt: '2026-08-10 10:05', backupStatus: '备份成功', mirrorUrl: 'https://gitcode.com/mirror/log4j', lastSync: '2026-08-15 11:00' }),
    seedItem({ name: 'Spring Framework', version: '6.1.5', lang: 'Java', license: 'Apache-2.0', file: 'spring-framework-6.1.5.jar', developer: 'VMware', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 2, createdAt: '2026-08-09 14:30', backupStatus: '备份成功', mirrorUrl: 'https://gitcode.com/mirror/spring-framework', lastSync: '2026-08-15 12:10' }),
    // —— 步骤3：软件技术评估（评估中 / 评估完成） ——
    seedItem({ name: 'Django', version: '5.0.4', lang: 'Python', license: 'BSD-3-Clause', file: 'Django-5.0.4.tar.gz', developer: 'Django Software Foundation', govOwner: '王明远', govOrg: '平安科技', currentStep: 3, createdAt: '2026-08-08 09:45', backupStatus: '备份成功', assessStatus: '评估中', scanProgress: 60, copyrightProgress: 40, malwareProgress: 20, sbomProgress: 60, vulnProgress: 40, licenseProgress: 40 }),
    seedItem({ name: 'OpenSSL', version: '3.3.0', lang: 'C', license: 'Apache-2.0', file: 'openssl-3.3.0.tar.gz', developer: 'OpenSSL Software Foundation', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 3, createdAt: '2026-08-06 11:20', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, sbomProgress: 100, vulnProgress: 100, licenseProgress: 100, scored: true }),
    // —— 步骤4：治理成果验收（待评审 / 评审通过） ——
    seedItem({ name: 'Redis', version: '7.2.4', lang: 'C', license: 'BSD-3-Clause', file: 'redis-7.2.4.tar.gz', developer: 'Redis Ltd.', govOwner: '李思远', govOrg: '华为技术有限公司', currentStep: 4, createdAt: '2026-08-05 10:10', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, scored: true, reviewStatus: '待评审' }),
    seedItem({ name: 'Nginx', version: '1.26.0', lang: 'C', license: 'BSD-2-Clause', file: 'nginx-1.26.0.tar.gz', developer: 'NGINX, Inc.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 4, createdAt: '2026-08-03 16:40', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, scored: true, reviewStatus: '评审通过', reviewComment: '基线指标全部合格，准予入库' }),
    // —— 步骤5：软件入库（待审批 / 已入库） ——
    seedItem({ name: 'Elasticsearch', version: '8.15.0', lang: 'Java', license: 'Elastic-2.0', file: 'elasticsearch-8.15.0.tar.gz', developer: 'Elastic', govOwner: '王明远', govOrg: '平安科技', currentStep: 5, createdAt: '2026-07-30 09:30', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, scored: true, reviewStatus: '评审通过', warehouseStatus: '待审批', vulnCount: 2 }),
    seedItem({ name: 'Kafka', version: '3.9.2', lang: 'Scala', license: 'Apache-2.0', file: 'kafka-3.9.2.tgz', developer: 'Apache', govOwner: '张建国', govOrg: '中国工商银行', currentStep: 5, createdAt: '2026-07-25 14:15', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, scored: true, reviewStatus: '评审通过', warehouseStatus: '已入库', vulnCount: 0, warehouseTime: '2026-08-02 10:30' }),
    seedItem({ name: 'MongoDB', version: '7.0.12', lang: 'C++', license: 'SSPL-1.0', file: 'mongodb-7.0.12.tgz', developer: 'MongoDB Inc.', govOwner: '陈晓峰', govOrg: '阿里巴巴集团', currentStep: 5, createdAt: '2026-07-20 11:00', backupStatus: '备份成功', assessStatus: '评估完成', scanProgress: 100, copyrightProgress: 100, malwareProgress: 100, scored: true, reviewStatus: '评审通过', warehouseStatus: '已拒绝', vulnCount: 5, rejectReason: '存在未修复的超危漏洞，且许可证兼容性存疑，需整改后重新提交', logs: [{ time: '2026-07-22 15:20', level: 'warn', msg: '已拒绝，拒绝原因：存在未修复的超危漏洞，且许可证兼容性存疑，需整改后重新提交' }] }),
  )
}

/** 待审批软件（提交入库审核，等待平台管理员审批） */
export function getPendingApprovals() {
  return softwareList.value.filter((i) => i.currentStep === 5 && i.warehouseStatus === '待审批')
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

/**
 * 清单回传导入：把校验通过的软件写入「软件获取」列表。
 * 每条数据带上提交人与提交组织（取自入库需求清单，不采信回传表格内容）。
 */
export function importFromInbound(entries, inbound) {
  const now = new Date().toLocaleString('zh-CN')
  const created = entries.map((e) => ({
    id: genId(),
    name: e.name,
    version: e.version,
    repoUrl: e.repoUrl,
    lang: e.lang,
    license: e.license,
    file: e.file,
    developer: e.developer || '—',
    licenseId: e.licenseId || e.license,
    branch: e.branch || 'main',
    tag: e.tag || '—',
    commitId: e.commitId || '—',
    codeSize: e.codeSize || '—',
    vulnUrl: e.vulnUrl || '—',
    mirrorUrl: 'https://gitcode.com/mirror/' + e.name.toLowerCase().replace(/\s+/g, '-'),
    govOwner: inbound.assignedTo || '—',
    govOrg: inbound.assignedOrgName || '—',
    submitter: inbound.reporter || '—',
    submitOrg: inbound.org || '—',
    currentStep: 1,
    selected: false,
    createdAt: now,
    backupStatus: '待备份',
    assessStatus: '待评估',
    reviewStatus: '待评审',
    warehouseStatus: '待审批',
    riskLevel: null,
    vulnCount: 0,
    logs: [{ time: now, level: 'info', msg: `由 ${inbound.reporter || '—'}（${inbound.org || '—'}）提交，清单回传导入` }],
  }))
  softwareList.value.push(...created)
  return created
}

seedGovernanceData()
