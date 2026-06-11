<template>
  <div class="detail-page">
    <!-- 返回 -->
    <div class="detail-topbar">
      <button type="button" class="detail-back" @click="$router.push({ name: 'admin-gov' })">
        &larr; 返回工作台
      </button>
      <h1 class="detail-title">{{ software.name }} <span class="detail-version">v{{ software.version }}</span></h1>
    </div>

    <!-- ===== 步骤流 ===== -->
    <nav class="detail-steps">
      <div
        v-for="(step, si) in steps"
        :key="step.key"
        class="detail-step"
        :class="{
          'is-active': activeStep === si,
          'is-done': step.done,
        }"
        @click="activeStep = si"
      >
        <div class="detail-step-indicator">
          <span class="detail-step-num">{{ step.done ? '' : si + 1 }}</span>
          <div v-if="si < steps.length - 1" class="detail-step-line" :class="{ 'line-done': step.done }" />
        </div>
        <div class="detail-step-body">
          <div class="detail-step-title">{{ step.label }}</div>
          <div v-if="step.status" class="detail-step-status">{{ step.status }}</div>
        </div>
      </div>
    </nav>

    <!-- ===== 步骤内容 ===== -->

    <!-- 步骤1：软件获取 -->
    <div v-show="activeStep === 0" class="detail-card">
      <h2 class="detail-card-title">软件获取</h2>
      <div class="detail-grid">
        <div class="detail-field">
          <label class="detail-label">软件名称</label>
          <span class="detail-value">{{ software.name }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">版本</label>
          <span class="detail-value">{{ software.version }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">源仓库地址</label>
          <code class="detail-value detail-code">{{ software.repoUrl }}</code>
        </div>
        <div class="detail-field">
          <label class="detail-label">获取时间</label>
          <span class="detail-value">{{ software.createdAt || '--' }}</span>
        </div>
      </div>
    </div>

    <!-- 步骤2：引入选型 — 源码备份 -->
    <div v-show="activeStep === 1" class="detail-card">
      <h2 class="detail-card-title">源码备份</h2>
      <div class="detail-grid">
        <div class="detail-field">
          <label class="detail-label">源仓库地址</label>
          <code class="detail-value detail-code">{{ software.repoUrl }}</code>
        </div>
        <div class="detail-field">
          <label class="detail-label">镜像仓地址</label>
          <code class="detail-value detail-code">{{ software.mirrorUrl || '--' }}</code>
        </div>
        <div class="detail-field">
          <label class="detail-label">最近同步时间</label>
          <span class="detail-value">{{ software.lastSync || '--' }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">备份状态</label>
          <span class="gov-badge" :class="'badge--' + backupClass">{{ software.backupStatus }}</span>
        </div>
      </div>
      <div class="detail-sub-section">
        <h3 class="detail-sub-title">同步日志</h3>
        <div class="detail-log-list">
          <div v-for="(l, i) in syncLogs" :key="i" class="detail-log-row">
            <span class="detail-log-time">{{ l.time }}</span>
            <span class="detail-log-msg">{{ l.msg }}</span>
          </div>
          <p v-if="syncLogs.length === 0" class="detail-empty-text">暂无日志</p>
        </div>
      </div>
    </div>

    <!-- 步骤3：软件技术评估 -->
    <div v-show="activeStep === 2" class="detail-card">
      <h2 class="detail-card-title">技术评估</h2>

      <div class="detail-grid detail-grid--4">
        <div class="detail-field">
          <label class="detail-label">编程语言</label>
          <span class="detail-value">{{ softwareInfo.lang || '--' }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">开源许可证</label>
          <span class="detail-value">{{ softwareInfo.license || '--' }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">Star 数</label>
          <span class="detail-value">{{ softwareInfo.stars || '--' }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">最新版本</label>
          <span class="detail-value">{{ software.version }}</span>
        </div>
      </div>

      <div class="detail-assess-grid">
        <!-- SBOM -->
        <div class="detail-assess-card" @click="expandSection('sbom')">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">SBOM</span>
            <span class="detail-assess-count">{{ sbomData.length }} 个组件</span>
            <span class="detail-assess-toggle">{{ expandSbom ? '收起' : '展开' }}</span>
          </div>
          <div v-if="expandSbom" class="detail-assess-body">
            <table class="gov-table gov-table--sm">
              <thead><tr><th>组件名称</th><th>版本</th><th>许可证</th></tr></thead>
              <tbody>
                <tr v-for="c in sbomData" :key="c.name"><td>{{ c.name }}</td><td>{{ c.version }}</td><td>{{ c.license }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 漏洞 -->
        <div class="detail-assess-card" @click="expandSection('vuln')">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">漏洞分析</span>
            <span class="detail-assess-count">{{ vulnData.length }} 个</span>
            <span class="detail-assess-toggle">{{ expandVuln ? '收起' : '展开' }}</span>
          </div>
          <div v-if="expandVuln" class="detail-assess-body">
            <table class="gov-table gov-table--sm">
              <thead><tr><th>CVE</th><th>严重等级</th><th>CVSS</th><th>状态</th></tr></thead>
              <tbody>
                <tr v-for="v in vulnData" :key="v.cve">
                  <td class="detail-link" @click.stop>{{ v.cve }}</td>
                  <td><span class="gov-risk" :class="'risk--' + v.level">{{ v.level }}</span></td>
                  <td>{{ v.cvss }}</td>
                  <td>{{ v.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 许可证 -->
        <div class="detail-assess-card" @click="expandSection('license')">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">许可证分析</span>
            <span class="detail-assess-count">{{ licenseData.length }} 项</span>
            <span class="detail-assess-toggle">{{ expandLicense ? '收起' : '展开' }}</span>
          </div>
          <div v-if="expandLicense" class="detail-assess-body">
            <table class="gov-table gov-table--sm">
              <thead><tr><th>许可证</th><th>类型</th><th>兼容性</th></tr></thead>
              <tbody>
                <tr v-for="l in licenseData" :key="l.name"><td>{{ l.name }}</td><td>{{ l.type }}</td><td>{{ l.compat }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 恶意代码 -->
        <div class="detail-assess-card">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">恶意代码扫描</span>
            <span class="detail-assess-count" :class="{ 'has-warn': malwareWarn }">{{ malwareWarn ? '发现可疑' : '未发现' }}</span>
          </div>
        </div>
        <!-- 组件分析 -->
        <div class="detail-assess-card">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">组件分析</span>
            <span class="detail-assess-count">{{ componentAnalysis.length }} 项</span>
          </div>
        </div>
        <!-- 二进制包 -->
        <div class="detail-assess-card">
          <div class="detail-assess-hd">
            <span class="detail-assess-name">二进制包备份</span>
            <span class="detail-assess-count">{{ binaryBackup ? '已备份' : '未备份' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤4：可信开源治理成果验收 -->
    <div v-show="activeStep === 3" class="detail-card">
      <h2 class="detail-card-title">成果验收</h2>
      <div class="detail-grid">
        <div class="detail-field">
          <label class="detail-label">验收状态</label>
          <span class="gov-badge" :class="'badge--' + (software.reviewStatus === '评审通过' ? 'ok' : 'warn')">{{ software.reviewStatus }}</span>
        </div>
        <div class="detail-field">
          <label class="detail-label">风险等级</label>
          <span v-if="software.riskLevel" class="gov-risk" :class="'risk--' + software.riskLevel">{{ software.riskLevel }}</span>
          <span v-else class="detail-value">--</span>
        </div>
      </div>
      <div class="detail-sub-section">
        <h3 class="detail-sub-title">治理报告</h3>
        <div class="detail-report-list">
          <div class="detail-report-item">
            <span class="detail-report-name">SBOM 报告</span>
            <span class="gov-badge badge--ok">已生成</span>
          </div>
          <div class="detail-report-item">
            <span class="detail-report-name">漏洞扫描报告</span>
            <span class="gov-badge badge--ok">已生成</span>
          </div>
          <div class="detail-report-item">
            <span class="detail-report-name">许可证分析报告</span>
            <span class="gov-badge badge--ok">已生成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤5：处理意见反馈 -->
    <div v-show="activeStep === 4" class="detail-card">
      <h2 class="detail-card-title">意见反馈</h2>

      <div class="detail-review-actions">
        <button type="button" class="gov-btn gov-btn--primary" @click="openReviewDialog('通过')">通过</button>
        <button type="button" class="gov-btn" @click="openReviewDialog('有条件通过')">有条件通过</button>
        <button type="button" class="gov-btn gov-btn--danger" @click="openReviewDialog('不通过')">不通过</button>
      </div>

      <div v-if="currentReview" class="detail-result-card" :class="'result--' + currentReview.result">
        <div class="detail-result-hd">
          <span class="detail-result-badge">{{ currentReview.result }}</span>
          <span class="detail-result-time">{{ currentReview.time }}</span>
        </div>
        <p class="detail-result-opinion">{{ currentReview.opinion }}</p>
      </div>

      <div class="detail-sub-section">
        <h3 class="detail-sub-title">历史评审记录</h3>
        <div v-for="r in reviewHistory" :key="r.time" class="detail-history-row">
          <span class="detail-review-badge" :class="'rev--' + r.result">{{ r.result }}</span>
          <span class="detail-review-opinion">{{ r.opinion || '--' }}</span>
          <span class="detail-review-time">{{ r.time }}</span>
          <span class="detail-review-operator">{{ r.operator }}</span>
        </div>
        <p v-if="reviewHistory.length === 0" class="detail-empty-text">暂无评审记录</p>
      </div>
    </div>

    <!-- 步骤6：软件入库 -->
    <div v-show="activeStep === 5" class="detail-card">
      <h2 class="detail-card-title">软件入库</h2>

      <div class="detail-actions-bar">
        <button type="button" class="gov-btn gov-btn--primary" @click="confirmEntry">确认入库</button>
        <button type="button" class="gov-btn gov-btn--danger" @click="returnForReview">退回重新治理</button>
      </div>

      <div class="detail-sub-section">
        <h3 class="detail-sub-title">状态流转历史</h3>
        <div class="detail-timeline">
          <div v-for="(t, i) in timeline" :key="i" class="detail-timeline-item">
            <div class="detail-timeline-dot" :class="'dot--' + t.level" />
            <div class="detail-timeline-body">
              <span class="detail-timeline-action">{{ t.action }}</span>
              <span class="detail-timeline-time">{{ t.time }}</span>
              <p v-if="t.note" class="detail-timeline-note">{{ t.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 评审弹窗 ===== -->
    <Teleport to="body">
      <div v-if="reviewDialog" class="gov-overlay" @click.self="reviewDialog = null">
        <div class="gov-modal" style="width:440px;">
          <div class="gov-modal-hd">
            <h3 class="gov-modal-title">评审：{{ reviewDialog }}</h3>
            <button type="button" class="gov-modal-close" @click="reviewDialog = null">&times;</button>
          </div>
          <div class="gov-modal-body">
            <textarea v-model="reviewOpinion" class="gov-textarea" rows="4" placeholder="请输入评审意见..." />
          </div>
          <div class="gov-modal-ft">
            <button type="button" class="gov-btn" @click="reviewDialog = null">取消</button>
            <button type="button" class="gov-btn gov-btn--primary" @click="submitReview">确认提交</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const software = reactive({
  id: Number(route.params.id) || 1,
  name: 'Vue.js',
  version: '3.4.21',
  repoUrl: 'https://github.com/vuejs/core.git',
  mirrorUrl: '/data/mirror/trusted-oss/vuejs-core',
  lastSync: '2025-05-10 10:08:23',
  createdAt: '2025-05-10',
  backupStatus: '备份成功',
  govStatus: '待评审',
  reviewStatus: '评审通过',
  riskLevel: '低',
})

const softwareInfo = reactive({
  lang: 'TypeScript',
  license: 'MIT',
  stars: '48.1k',
})

const sbomData = [
  { name: '@vue/compiler-sfc', version: '3.4.21', license: 'MIT' },
  { name: '@vue/reactivity', version: '3.4.21', license: 'MIT' },
  { name: '@vue/runtime-core', version: '3.4.21', license: 'MIT' },
  { name: '@vue/runtime-dom', version: '3.4.21', license: 'MIT' },
  { name: '@vue/server-renderer', version: '3.4.21', license: 'MIT' },
  { name: '@vue/shared', version: '3.4.21', license: 'MIT' },
  { name: 'magic-string', version: '0.30.10', license: 'MIT' },
  { name: 'estree-walker', version: '2.0.2', license: 'MIT' },
  { name: 'source-map-js', version: '1.2.0', license: 'BSD-3-Clause' },
]
const vulnData = [
  { cve: 'CVE-2025-1234', level: '低', cvss: '3.2', status: '已修复' },
  { cve: 'CVE-2025-5678', level: '中', cvss: '5.6', status: '已修复' },
]
const licenseData = [
  { name: 'MIT', type: '宽松', compat: '兼容' },
  { name: 'BSD-3-Clause', type: '宽松', compat: '兼容' },
]
const malwareWarn = ref(false)
const componentAnalysis = ref(['vue', 'vue-router', 'vuex', 'pinia'])
const binaryBackup = ref(true)

const expandSbom = ref(true)
const expandVuln = ref(true)
const expandLicense = ref(false)

function expandSection(section) {
  if (section === 'sbom') expandSbom.value = !expandSbom.value
  if (section === 'vuln') expandVuln.value = !expandVuln.value
  if (section === 'license') expandLicense.value = !expandLicense.value
}

const steps = reactive([
  { key: 'acquire', label: '软件获取', status: '已获取', done: true },
  { key: 'select', label: '引入选型', status: '备份成功', done: true },
  { key: 'assess', label: '软件技术评估', status: '已完成', done: true },
  { key: 'review', label: '成果验收', status: '评审通过', done: false },
  { key: 'feedback', label: '处理意见反馈', status: '待处理', done: false },
  { key: 'warehouse', label: '软件入库', status: '待入库', done: false },
])

const activeStep = ref(3)

const backupClass = computed(() => {
  const map = { '待备份': 'warn', '备份中': 'run', '备份成功': 'ok', '备份失败': 'fail' }
  return map[software.backupStatus] || 'warn'
})

const syncLogs = [
  { time: '2025-05-10 10:05:12', msg: 'git clone --mirror https://github.com/vuejs/core.git' },
  { time: '2025-05-10 10:06:30', msg: '已克隆 48.2 MB，共 15630 个提交' },
  { time: '2025-05-10 10:07:45', msg: '创建镜像仓引用 /data/mirror/trusted-oss/vuejs-core' },
  { time: '2025-05-10 10:08:23', msg: '同步完成，镜像仓已就绪' },
]

// 评审状态
const reviewDialog = ref(null)
const reviewOpinion = ref('')
const currentReview = ref(null)
const reviewHistory = ref([
  { result: '通过', opinion: '代码质量良好，无高危漏洞，建议引入。', time: '2025-05-10 11:00', operator: '张三' },
])

function openReviewDialog(result) {
  reviewDialog.value = result
  reviewOpinion.value = ''
}
function submitReview() {
  const result = reviewDialog.value
  currentReview.value = {
    result,
    opinion: reviewOpinion.value || (result === '通过' ? '同意入库' : '需整改后重新评审'),
    time: new Date().toLocaleString('zh-CN'),
  }
  reviewHistory.value.unshift({
    result,
    opinion: reviewOpinion.value || (result === '通过' ? '同意入库' : '需整改后重新评审'),
    time: currentReview.value.time,
    operator: '当前用户',
  })
  const feedbackIdx = steps.findIndex(s => s.key === 'feedback')
  if (result === '通过' || result === '有条件通过') {
    steps[feedbackIdx].done = true
    steps[feedbackIdx].status = result
    steps[feedbackIdx + 1].status = '待入库'
    software.govStatus = '评审通过'
    activeStep.value = 5
  } else {
    steps[feedbackIdx].done = false
    steps[feedbackIdx].status = '不通过'
  }
  reviewDialog.value = null
}

// 时间线
const timeline = ref([
  { action: '软件获取', time: '2025-05-10 09:30', level: 'info', note: '通过命令行工具获取' },
  { action: '源码备份完成', time: '2025-05-10 10:08', level: 'ok', note: '镜像仓已同步' },
  { action: 'SCA 扫描完成', time: '2025-05-10 10:25', level: 'ok', note: '未发现高危漏洞' },
  { action: '技术评审通过', time: '2025-05-10 11:00', level: 'ok', note: '评审人：张三' },
  { action: '软件入库', time: '--', level: 'pending', note: '等待确认入库' },
])

function confirmEntry() {
  timeline.value.push({ action: '软件已入库', time: new Date().toLocaleString('zh-CN'), level: 'ok', note: '入库完成，状态：待发布' })
  software.govStatus = '已入库'
  steps[5].done = true
  steps[5].status = '已入库'
}

function returnForReview() {
  timeline.value.push({ action: '退回重新治理', time: new Date().toLocaleString('zh-CN'), level: 'warn', note: '已退回，需要重新评估' })
  software.govStatus = '待评估'
  steps[5].done = false
  steps[5].status = '已退回'
  steps[4].done = false
  steps[4].status = '待评审'
  activeStep.value = 2
}
</script>

<style scoped>
/* ===== 页面 ===== */
.detail-page {
  padding: 20px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== 顶栏 ===== */
.detail-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.detail-back {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
}
.detail-back:hover { border-color: #da203e; color: #da203e; }
.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}
.detail-version { font-weight: 400; font-size: 15px; color: #6b7280; margin-left: 4px; }

/* ===== 步骤流 ===== */
.detail-steps {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: 20px 20px;
  overflow-x: auto;
}
.detail-step {
  flex: 1;
  min-width: 100px;
  display: flex;
  gap: 10px;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s;
}
.detail-step:hover { opacity: 0.75; }
.detail-step.is-active, .detail-step.is-done { opacity: 1; }
.detail-step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.detail-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  background: #e5e7eb;
  color: #9ca3af;
  flex-shrink: 0;
  transition: all 0.15s;
}
.detail-step.is-active .detail-step-num { background: #da203e; color: #fff; }
.detail-step.is-done .detail-step-num { background: #16a34a; color: #fff; }
.detail-step-line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: #e5e7eb;
  border-radius: 1px;
}
.detail-step-line.line-done { background: #16a34a; }
.detail-step-body { padding-top: 2px; }
.detail-step-title { font-size: 12px; font-weight: 600; color: #1f2937; white-space: nowrap; }
.detail-step-status { font-size: 11px; color: #6b7280; margin-top: 2px; }

/* ===== 卡片 ===== */
.detail-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}
.detail-card-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

/* ===== 字段网格 ===== */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.detail-grid--4 { grid-template-columns: repeat(4, 1fr); }
.detail-field { }
.detail-label { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 3px; letter-spacing: 0.02em; }
.detail-value { font-size: 14px; color: #374151; }
.detail-code {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: #374151;
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 4px;
}

/* ===== 子区域 ===== */
.detail-sub-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
.detail-sub-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

/* ===== 日志列表 ===== */
.detail-log-list { max-height: 200px; overflow-y: auto; }
.detail-log-row {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  font-size: 12px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  border-bottom: 1px solid #f9fafb;
}
.detail-log-time { color: #9ca3af; white-space: nowrap; min-width: 100px; }
.detail-log-msg { color: #374151; }
.detail-empty-text { color: #9ca3af; font-size: 13px; text-align: center; padding: 24px; margin: 0; }

/* ===== 治理报告列表 ===== */
.detail-report-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-report-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.detail-report-name { font-size: 13px; color: #374151; font-weight: 500; }

/* ===== 评估卡片网格 ===== */
.detail-assess-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.detail-assess-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.detail-assess-card:hover { border-color: #da203e; }
.detail-assess-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
}
.detail-assess-name { font-size: 13px; font-weight: 600; color: #374151; flex: 1; }
.detail-assess-count {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}
.detail-assess-count.has-warn { background: #fee2e2; color: #dc2626; }
.detail-assess-toggle {
  font-size: 11px;
  color: #9ca3af;
}
.detail-assess-body {
  padding: 0 14px 12px;
  border-top: 1px solid #f3f4f6;
}

/* ===== 评审 ===== */
.detail-review-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.detail-result-card {
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 16px;
}
.result--通过 { background: #f0fdf4; border-color: #bbf7d0; }
.result--有条件通过 { background: #fffbeb; border-color: #fde68a; }
.result--不通过 { background: #fef2f2; border-color: #fecaca; }
.detail-result-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.detail-result-badge { font-size: 13px; font-weight: 600; }
.result--通过 .detail-result-badge { color: #16a34a; }
.result--有条件通过 .detail-result-badge { color: #d97706; }
.result--不通过 .detail-result-badge { color: #dc2626; }
.detail-result-time { font-size: 12px; color: #6b7280; }
.detail-result-opinion { margin: 0; font-size: 13px; color: #374151; }
.detail-history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.detail-review-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
.rev--通过 { background: #dcfce7; color: #16a34a; }
.rev--有条件通过 { background: #fef3c7; color: #d97706; }
.rev--不通过 { background: #fee2e2; color: #dc2626; }
.detail-review-opinion { flex: 1; color: #374151; }
.detail-review-time { color: #9ca3af; font-size: 12px; min-width: 120px; }
.detail-review-operator { color: #6b7280; font-size: 12px; min-width: 60px; text-align: right; }

/* ===== 入库操作 ===== */
.detail-actions-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* ===== 时间线 ===== */
.detail-timeline {
  position: relative;
  padding-left: 20px;
}
.detail-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: #e5e7eb;
  border-radius: 1px;
}
.detail-timeline-item {
  position: relative;
  padding: 0 0 16px 16px;
}
.detail-timeline-item:last-child { padding-bottom: 0; }
.detail-timeline-dot {
  position: absolute;
  left: -16px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid #fff;
  z-index: 1;
}
.dot--info { background: #6b7280; }
.dot--ok { background: #16a34a; }
.dot--warn { background: #d97706; }
.dot--fail { background: #dc2626; }
.dot--pending { background: #e5e7eb; }
.detail-timeline-body { }
.detail-timeline-action { font-size: 13px; font-weight: 500; color: #374151; }
.detail-timeline-time { font-size: 11px; color: #9ca3af; margin-left: 8px; }
.detail-timeline-note { margin: 2px 0 0; font-size: 12px; color: #6b7280; }

/* ===== 公共控件 ===== */
.gov-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
  font-family: inherit;
}
.gov-btn:hover { border-color: #da203e; color: #da203e; }
.gov-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.gov-btn--primary:hover { background: #b81830; border-color: #b81830; color: #fff; }
.gov-btn--danger {
  background: #fff;
  color: #dc2626;
  border-color: #fecaca;
}
.gov-btn--danger:hover { background: #fef2f2; border-color: #dc2626; }

.gov-table--sm { font-size: 12px; }
.gov-table--sm th { padding: 6px 10px; font-weight: 500; }
.gov-table--sm td { padding: 6px 10px; }
.gov-risk {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
.risk--高 { background: #fee2e2; color: #dc2626; }
.risk--中 { background: #fef3c7; color: #d97706; }
.risk--低 { background: #dcfce7; color: #16a34a; }
.gov-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.badge--ok { background: #dcfce7; color: #16a34a; }
.badge--warn { background: #fef3c7; color: #d97706; }
.badge--fail { background: #fee2e2; color: #dc2626; }
.badge--run { background: #dbeafe; color: #2563eb; }
.badge--pending { background: #f3f4f6; color: #6b7280; }

.gov-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
}
.gov-modal {
  margin: auto;
  background: #fff;
  border-radius: 10px;
  width: 520px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.gov-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.gov-modal-title { margin: 0; font-size: 15px; font-weight: 600; color: #1f2937; }
.gov-modal-close { padding: 4px 8px; border: none; background: none; font-size: 18px; color: #9ca3af; cursor: pointer; border-radius: 4px; line-height: 1; }
.gov-modal-close:hover { background: #f3f4f6; color: #374151; }
.gov-modal-body { padding: 16px 20px; }
.gov-modal-ft { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #e5e7eb; }
.gov-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}
.gov-textarea:focus { border-color: #da203e; }

.detail-link { color: #da203e; cursor: pointer; font-weight: 500; }
.detail-link:hover { text-decoration: underline; }
</style>
