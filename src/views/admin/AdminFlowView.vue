<template>
  <div class="flow-page">
    <!-- 步骤指示器 -->
    <nav class="flow-steps" aria-label="工作流步骤">
      <button
        v-for="(s, i) in steps"
        :key="s.key"
        type="button"
        class="flow-step"
        :class="{ 'is-active': activeStep === i, 'is-done': s.done }"
        @click="activeStep = i"
      >
        <span class="flow-step-num">{{ s.done ? '✓' : i + 1 }}</span>
        <span class="flow-step-label">{{ s.label }}</span>
      </button>
    </nav>

    <!-- 步骤内容 -->
    <section class="flow-body">
      <!-- ============ 步骤1：软件获取 ============ -->
      <div v-show="activeStep === 0" class="flow-card">
        <div class="flow-card-hd">
          <h2 class="flow-card-title">1. 软件获取</h2>
          <p class="flow-card-desc">运行命令行工具，从主站获取热门开源软件列表</p>
        </div>

        <div class="flow-card-actions">
          <button
            type="button"
            class="flow-btn flow-btn--primary"
            :disabled="step1Running"
            @click="runStep1"
          >
            <span v-if="step1Running" class="flow-spinner" />
            {{ step1Running ? '执行中…' : '执行脚本' }}
          </button>
          <button
            v-if="step1Done && step1Data.length > 0"
            type="button"
            class="flow-btn flow-btn--outline"
            @click="exportExcel(step1Data, '热门软件列表')"
          >
            导出 Excel
          </button>
        </div>

        <div v-if="step1Running" class="flow-progress">
          <div class="flow-progress-bar">
            <div class="flow-progress-fill" :style="{ width: step1Progress + '%' }" />
          </div>
          <span class="flow-progress-text">{{ step1Progress }}%</span>
        </div>

        <div v-if="step1Done" class="flow-result">
          <div class="flow-result-badge step-ok">✓ 获取成功</div>
          <table v-if="step1Data.length > 0" class="flow-table">
            <thead>
              <tr>
                <th>软件名称</th>
                <th>编程语言</th>
                <th>开源许可证</th>
                <th>Star 数</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in step1Data" :key="row.name">
                <td class="flow-link" @click="viewSoftware(row.name)">{{ row.name }}</td>
                <td>{{ row.lang }}</td>
                <td>{{ row.license }}</td>
                <td>{{ row.stars }}</td>
                <td class="flow-desc">{{ row.description }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="flow-empty">暂无数据</p>
        </div>
      </div>

      <!-- ============ 步骤2：引入选型 ============ -->
      <div v-show="activeStep === 1" class="flow-card">
        <div class="flow-card-hd">
          <h2 class="flow-card-title">2. 引入选型</h2>
          <p class="flow-card-desc">拉取源码备份，在本地建立镜像仓库</p>
        </div>

        <div class="flow-card-actions">
          <button
            type="button"
            class="flow-btn flow-btn--primary"
            :disabled="step2Running"
            @click="runStep2"
          >
            <span v-if="step2Running" class="flow-spinner" />
            {{ step2Running ? '拉取中…' : '拉取源码并建立镜像仓' }}
          </button>
          <RouterLink
            v-if="step2Done"
            class="flow-btn flow-btn--outline"
            to="/software/manage"
          >
            查看软件管理
          </RouterLink>
        </div>

        <div v-if="step2Running" class="flow-progress">
          <div class="flow-progress-bar">
            <div class="flow-progress-fill" :style="{ width: step2Progress + '%' }" />
          </div>
          <span class="flow-progress-text">{{ step2Progress }}%</span>
        </div>

        <div v-if="step2Done" class="flow-result">
          <div class="flow-result-badge step-ok">✓ 镜像仓建立完成</div>
          <p class="flow-summary">共备份 <strong>{{ step2Data.count }}</strong> 个软件源码，已同步至本地镜像仓库</p>
          <div class="flow-mirror-info">
            <span class="flow-mirror-label">镜像仓路径：</span>
            <code class="flow-mirror-path">{{ step2Data.mirrorPath }}</code>
          </div>
        </div>
      </div>

      <!-- ============ 步骤3：软件技术评估 ============ -->
      <div v-show="activeStep === 2" class="flow-card">
        <div class="flow-card-hd">
          <h2 class="flow-card-title">3. 软件技术评估</h2>
          <p class="flow-card-desc">执行多项扫描：基础信息、恶意代码、SCA（SBOM/漏洞/许可证）</p>
        </div>

        <!-- 子任务列表 -->
        <div class="flow-subtasks">
          <div
            v-for="(task, ti) in step3Tasks"
            :key="ti"
            class="flow-subtask"
            :class="{ 'is-running': task.running, 'is-done': task.done, 'is-fail': task.fail }"
          >
            <div class="flow-subtask-hd">
              <span class="flow-subtask-icon">
                <template v-if="task.done">✓</template>
                <template v-else-if="task.running">
                  <span class="flow-spinner flow-spinner--sm" />
                </template>
                <template v-else>◌</template>
              </span>
              <span class="flow-subtask-name">{{ task.name }}</span>
              <span v-if="task.done && task.result" class="flow-subtask-status">{{ task.result }}</span>
            </div>
            <button
              type="button"
              class="flow-btn flow-btn--sm"
              :disabled="task.running || task.done"
              @click="runStep3Task(ti)"
            >
              {{ task.running ? '执行中…' : task.done ? '已完成' : '执行' }}
            </button>
          </div>
        </div>

        <div class="flow-card-actions flow-card-actions--sub">
          <RouterLink class="flow-btn flow-btn--outline" to="/software/scan">
            查看完整扫描记录
          </RouterLink>
          <RouterLink class="flow-btn flow-btn--outline" to="/software/scan-details">
            查看扫描明细
          </RouterLink>
          <RouterLink class="flow-btn flow-btn--outline" to="/software/detection-report">
            查看检测报告
          </RouterLink>
        </div>
      </div>

      <!-- ============ 步骤4：可信开源治理成果验收 ============ -->
      <div v-show="activeStep === 3" class="flow-card">
        <div class="flow-card-hd">
          <h2 class="flow-card-title">4. 可信开源治理成果验收</h2>
          <p class="flow-card-desc">技术评审后流转状态（线下流程），上传评审结果</p>
        </div>

        <div class="flow-card-actions">
          <label class="flow-upload-btn">
            <input type="file" accept=".xlsx,.xls" hidden @change="handleReviewUpload" />
            <span class="flow-btn flow-btn--primary">上传评审结果 Excel</span>
          </label>
          <button
            v-if="step4ReviewResult"
            type="button"
            class="flow-btn flow-btn--outline"
            @click="step4ReviewResult = null"
          >
            清除
          </button>
        </div>

        <div v-if="step4ReviewResult" class="flow-result">
          <div class="flow-result-badge step-ok">✓ 已上传</div>
          <p class="flow-summary">文件：<strong>{{ step4ReviewResult.name }}</strong></p>
          <p class="flow-summary">上传时间：{{ step4ReviewResult.time }}</p>
          <div class="flow-review-table-wrap">
            <table class="flow-table">
              <thead>
                <tr>
                  <th>软件名称</th>
                  <th>版本</th>
                  <th>评审意见</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in step4ReviewData" :key="r.name">
                  <td>{{ r.name }}</td>
                  <td>{{ r.version }}</td>
                  <td>{{ r.opinion }}</td>
                  <td>
                    <span class="flow-review-badge" :class="r.passed ? 'badge-pass' : 'badge-fail'">
                      {{ r.passed ? '通过' : '不通过' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============ 步骤5：软件入库 ============ -->
      <div v-show="activeStep === 4" class="flow-card">
        <div class="flow-card-hd">
          <h2 class="flow-card-title">5. 软件入库</h2>
          <p class="flow-card-desc">按审核意见入库为待发布，审核意见保留每次记录</p>
        </div>

        <div class="flow-card-actions">
          <button
            type="button"
            class="flow-btn flow-btn--primary"
            :disabled="step5Running"
            @click="runStep5"
          >
            <span v-if="step5Running" class="flow-spinner" />
            执行入库
          </button>
          <RouterLink class="flow-btn flow-btn--outline" to="/software/manage/approval">
            软件出入库管理
          </RouterLink>
        </div>

        <div v-if="step5Running" class="flow-progress">
          <div class="flow-progress-bar">
            <div class="flow-progress-fill" :style="{ width: step5Progress + '%' }" />
          </div>
          <span class="flow-progress-text">{{ step5Progress }}%</span>
        </div>

        <div v-if="step5Done" class="flow-result">
          <div class="flow-result-badge step-ok">✓ 入库完成</div>
          <p class="flow-summary">
            待发布软件 <strong>{{ step5PendingList.length }}</strong> 个，已入库 <strong>{{ step5DoneCount }}</strong> 个
          </p>

          <h3 class="flow-sub-title">待发布列表</h3>
          <table class="flow-table">
            <thead>
              <tr>
                <th>软件名称</th>
                <th>版本</th>
                <th>入库时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in step5PendingList" :key="item.name + item.version">
                <td>{{ item.name }}</td>
                <td>{{ item.version }}</td>
                <td>{{ item.time }}</td>
                <td>
                  <span class="flow-review-badge badge-pass">{{ item.status }}</span>
                </td>
                <td>
                  <button type="button" class="flow-btn flow-btn--sm" @click="publishItem(item)">
                    发布
                  </button>
                </td>
              </tr>
              <tr v-if="step5PendingList.length === 0">
                <td colspan="5" class="flow-empty">暂无待发布软件</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ==================== 步骤定义 ==================== */
const steps = reactive([
  { key: 'acquire', label: '软件获取', done: false },
  { key: 'select', label: '引入选型', done: false },
  { key: 'assess', label: '技术评估', done: false },
  { key: 'review', label: '治理成果验收', done: false },
  { key: 'publish', label: '软件入库', done: false },
])
const activeStep = ref(0)

/* ==================== 步骤1：软件获取 ==================== */
const step1Running = ref(false)
const step1Progress = ref(0)
const step1Done = ref(false)
const step1Data = ref([])

function runStep1() {
  step1Running.value = true
  step1Progress.value = 0
  step1Data.value = []
  const interval = setInterval(() => {
    step1Progress.value += Math.floor(Math.random() * 15) + 5
    if (step1Progress.value >= 100) {
      clearInterval(interval)
      step1Progress.value = 100
      // 模拟获取到的软件列表
      step1Data.value = [
        { name: 'Spring Framework', lang: 'Java', license: 'Apache-2.0', stars: '56.2k', description: '企业级 Java 应用框架' },
        { name: 'Vue.js', lang: 'TypeScript', license: 'MIT', stars: '48.1k', description: '渐进式前端 UI 框架' },
        { name: 'Django', lang: 'Python', license: 'BSD-3-Clause', stars: '81.4k', description: '高并发 Python Web 框架' },
        { name: 'Express.js', lang: 'JavaScript', license: 'MIT', stars: '65.0k', description: 'Node.js Web 应用框架' },
        { name: 'Log4j', lang: 'Java', license: 'Apache-2.0', stars: '2.5k', description: 'Java 日志框架（热点关注）' },
        { name: 'curl', lang: 'C', license: 'curl', stars: '36.1k', description: '命令行 HTTP 工具库' },
        { name: 'OpenSSL', lang: 'C', license: 'Apache-2.0', stars: '26.5k', description: 'SSL/TLS 加密库' },
        { name: 'Redis', lang: 'C', license: 'BSD-3-Clause', stars: '67.6k', description: '内存键值数据库' },
        { name: 'Nginx', lang: 'C', license: 'BSD-2-Clause', stars: '26.5k', description: '高性能 HTTP/反向代理服务器' },
        { name: 'Kubernetes', lang: 'Go', license: 'Apache-2.0', stars: '112k', description: '容器编排平台' },
      ]
      setTimeout(() => {
        step1Running.value = false
        step1Done.value = true
        steps[0].done = true
      }, 500)
    }
  }, 300)
}

function viewSoftware(name) {
  router.push({ name: 'software-detail' })
}

/* ==================== 步骤2：引入选型 ==================== */
const step2Running = ref(false)
const step2Progress = ref(0)
const step2Done = ref(false)
const step2Data = ref({ count: 0, mirrorPath: '' })

function runStep2() {
  step2Running.value = true
  step2Progress.value = 0
  const interval = setInterval(() => {
    step2Progress.value += Math.floor(Math.random() * 10) + 3
    if (step2Progress.value >= 100) {
      clearInterval(interval)
      step2Progress.value = 100
      step2Data.value = {
        count: step1Data.value.length || 8,
        mirrorPath: '/data/mirror/trusted-oss/' + new Date().toISOString().slice(0, 10),
      }
      setTimeout(() => {
        step2Running.value = false
        step2Done.value = true
        steps[1].done = true
      }, 500)
    }
  }, 400)
}

/* ==================== 步骤3：技术评估 ==================== */
const step3Tasks = reactive([
  { name: '获取软件基础信息', done: false, running: false, fail: false, result: '' },
  { name: 'SCA 扫描（SBOM、漏洞、许可证）', done: false, running: false, fail: false, result: '' },
  { name: '恶意代码扫描', done: false, running: false, fail: false, result: '' },
  { name: '组件技术评估（基本信息、SBOM）', done: false, running: false, fail: false, result: '' },
  { name: '组件二进制包备份', done: false, running: false, fail: false, result: '' },
  { name: '组件治理', done: false, running: false, fail: false, result: '' },
])
const step3AllDone = ref(false)

function runStep3Task(idx) {
  const task = step3Tasks[idx]
  task.running = true
  const time = 800 + Math.random() * 1200
  setTimeout(() => {
    task.running = false
    const outcomes = ['通过', '通过', '通过', '警告', '通过']
    task.done = true
    task.result = outcomes[idx] || '通过'
    // 检查是否全部完成
    step3AllDone.value = step3Tasks.every(t => t.done)
    if (step3AllDone.value) {
      steps[2].done = true
    }
  }, time)
}

/* ==================== 步骤4：成果验收 ==================== */
const step4ReviewResult = ref(null)
const step4ReviewData = ref([])

function handleReviewUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  step4ReviewResult.value = {
    name: file.name,
    time: new Date().toLocaleString('zh-CN'),
  }
  step4ReviewData.value = [
    { name: 'Vue.js', version: '3.4.21', opinion: '合规，建议引入', passed: true },
    { name: 'Express.js', version: '4.19.2', opinion: '合规，建议引入', passed: true },
    { name: 'Log4j', version: '2.23.1', opinion: '高危漏洞未修复，暂缓入库', passed: false },
    { name: 'Redis', version: '7.2.4', opinion: '合规，建议引入', passed: true },
    { name: 'curl', version: '8.7.1', opinion: '合规，建议引入', passed: true },
  ]
  steps[3].done = true
  e.target.value = ''
}

/* ==================== 步骤5：软件入库 ==================== */
const step5Running = ref(false)
const step5Progress = ref(0)
const step5Done = ref(false)
const step5DoneCount = ref(0)
const step5PendingList = ref([])

function runStep5() {
  step5Running.value = true
  step5Progress.value = 0
  const passedItems = step4ReviewData.value.filter(r => r.passed)
  step5PendingList.value = []
  step5DoneCount.value = 0
  const interval = setInterval(() => {
    step5Progress.value += Math.floor(Math.random() * 12) + 5
    if (step5Progress.value >= 100) {
      clearInterval(interval)
      step5Progress.value = 100
      step5DoneCount.value = passedItems.length
      step5PendingList.value = passedItems.map(r => ({
        name: r.name,
        version: r.version,
        time: new Date().toLocaleString('zh-CN'),
        status: '待发布',
      }))
      setTimeout(() => {
        step5Running.value = false
        step5Done.value = true
        steps[4].done = true
      }, 500)
    }
  }, 300)
}

function publishItem(item) {
  item.status = '已发布'
}

/* ==================== 通用 ==================== */
function exportExcel(data, title) {
  // 模拟导出 CSV
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(r => headers.map(h => `"${r[h] || ''}"`).join(',')),
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* ==================== 步骤指示器 ==================== */
.flow-steps {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.flow-step {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #9ca3af;
  position: relative;
  transition: all 0.2s;
}
.flow-step + .flow-step {
  border-left: 1px solid #e5e7eb;
}
.flow-step:hover {
  background: #f9fafb;
}
.flow-step.is-active {
  background: rgba(218, 32, 62, 0.06);
  color: #da203e;
  font-weight: 600;
}
.flow-step.is-done {
  color: #16a34a;
}
.flow-step.is-done.is-active {
  background: #f0fdf4;
  color: #16a34a;
}
/* 当前步骤底部红色指示线 */
.flow-step.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #da203e;
  border-radius: 1px 1px 0 0;
}

.flow-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  background: #e5e7eb;
  color: #9ca3af;
  flex-shrink: 0;
}
.flow-step.is-active .flow-step-num {
  background: #da203e;
  color: #fff;
}
.flow-step.is-done .flow-step-num {
  background: #16a34a;
  color: #fff;
}

.flow-step-label {
  white-space: nowrap;
}

/* ==================== 卡片 ==================== */
.flow-body {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 320px;
}

.flow-card-hd {
  margin-bottom: 20px;
}

.flow-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
}

.flow-card-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.flow-card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.flow-card-actions--sub {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* ==================== 按钮 ==================== */
.flow-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  color: #374151;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  text-decoration: none;
  white-space: nowrap;
  box-sizing: border-box;
}
.flow-btn:hover {
  border-color: #da203e;
  color: #da203e;
}
.flow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.flow-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.flow-btn--primary:hover:not(:disabled) {
  background: #b81830;
  border-color: #b81830;
  color: #fff;
}
.flow-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #e5e7eb;
}
.flow-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}
.flow-btn--sm {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
}

.flow-upload-btn {
  cursor: pointer;
  display: inline-flex;
}

/* ==================== 进度条 ==================== */
.flow-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.flow-progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.flow-progress-fill {
  height: 100%;
  background: #da203e;
  border-radius: 4px;
  transition: width 0.3s;
}
.flow-progress-text {
  font-size: 13px;
  color: #6b7280;
  min-width: 40px;
}

/* ==================== 结果 ==================== */
.flow-result {
  margin-top: 8px;
}
.flow-result-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
}
.step-ok {
  background: #f0fdf4;
  color: #16a34a;
}
.step-fail {
  background: #fef2f2;
  color: #dc2626;
}

.flow-summary {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 6px;
}

.flow-mirror-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(218, 32, 62, 0.05);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.flow-mirror-label {
  font-size: 13px;
  color: #6b7280;
}
.flow-mirror-path {
  font-size: 13px;
  color: #da203e;
  background: rgba(218, 32, 62, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.flow-sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 18px 0 10px;
}

/* ==================== 表格 ==================== */
.flow-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.flow-table th {
  text-align: left;
  padding: 12px 16px;
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}
.flow-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}
.flow-table tbody tr:hover {
  background: #f9fafb;
}
.flow-link {
  color: #da203e;
  cursor: pointer;
  font-weight: 500;
}
.flow-link:hover {
  text-decoration: underline;
}
.flow-desc {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flow-empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}

/* ==================== 子任务（步骤3） ==================== */
.flow-subtasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flow-subtask {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.15s;
}
.flow-subtask:hover {
  border-color: #da203e;
}
.flow-subtask.is-done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.flow-subtask.is-done:hover {
  border-color: #86efac;
}
.flow-subtask.is-running {
  background: rgba(218, 32, 62, 0.04);
  border-color: #fecaca;
}
.flow-subtask.is-fail {
  background: #fef2f2;
  border-color: #fecaca;
}
.flow-subtask-hd {
  display: flex;
  align-items: center;
  gap: 10px;
}
.flow-subtask-icon {
  width: 22px;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
}
.is-done .flow-subtask-icon {
  color: #16a34a;
  font-weight: 700;
}
.flow-subtask-name {
  font-size: 14px;
  color: #374151;
}
.flow-subtask-status {
  font-size: 12px;
  color: #6b7280;
  background: #fff;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* ==================== 评审结果徽标 ==================== */
.flow-review-table-wrap {
  margin-top: 12px;
  overflow-x: auto;
}
.flow-review-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.badge-pass {
  background: #dcfce7;
  color: #16a34a;
}
.badge-fail {
  background: #fee2e2;
  color: #dc2626;
}

/* ==================== 加载动画 ==================== */
.flow-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: flow-spin 0.6s linear infinite;
}
.flow-spinner--sm {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  border-color: rgba(218, 32, 62, 0.2);
  border-top-color: #da203e;
}
@keyframes flow-spin {
  to { transform: rotate(360deg); }
}
</style>
