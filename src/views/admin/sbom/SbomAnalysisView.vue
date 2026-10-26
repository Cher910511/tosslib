<template>
  <div class="sbom-ana">
    <!-- ==================== 生成记录列表 ==================== -->
    <template v-if="!selected">
      <div class="sba-page-hd">
        <h1 class="sba-title">详情分析</h1>
        <p class="sba-desc">
          查看历史生成的 SBOM 记录，进入后可查看原始内容、转换格式，并分析组件许可证与已知漏洞。
        </p>
      </div>

      <div class="sba-card">
        <div class="sba-card-hd">
          <span class="sba-card-title">生成记录</span>
          <span class="sba-card-count">共 {{ records.length }} 条</span>
        </div>

        <div v-if="records.length === 0" class="sba-empty">
          <p class="sba-empty-text">暂无 SBOM 生成记录</p>
          <RouterLink class="sba-empty-btn" :to="{ name: 'sbom-generate' }">去生成</RouterLink>
        </div>

        <div v-else class="sba-table-wrap">
          <table class="sba-table">
            <thead>
              <tr>
                <th>SBOM ID</th>
                <th>软件名称</th>
                <th>版本</th>
                <th>标准</th>
                <th>输出格式</th>
                <th class="sba-center">组件数</th>
                <th class="sba-center">漏洞</th>
                <th>生成时间</th>
                <th class="sba-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in records" :key="r.id">
                <td><code class="sba-id">{{ r.id }}</code></td>
                <td class="sba-strong">{{ r.name }}</td>
                <td class="sba-muted">{{ r.version }}</td>
                <td><span class="sba-spec">{{ r.spec }} {{ r.specVersion }}</span></td>
                <td class="sba-muted sba-fmt">{{ r.outputFormat }}</td>
                <td class="sba-center">{{ r.components.length }}</td>
                <td class="sba-center">
                  <span class="sba-vuln-num" :class="{ 'is-risk': r.vulnerabilities.length > 0 }">
                    {{ r.vulnerabilities.length }}
                  </span>
                </td>
                <td class="sba-muted sba-nowrap">{{ r.createdAt }}</td>
                <td class="sba-center">
                  <button type="button" class="sba-link" @click="select(r.id)">分析</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ==================== 分析结果 ==================== -->
    <template v-else>
      <!-- 1. 顶部信息与操作区 -->
      <div class="sba-top">
        <div class="sba-top-left">
          <button type="button" class="sba-back" @click="backToList">← 返回记录</button>
          <h1 class="sba-top-title">
            分析结果 <span class="sba-top-dash">—</span>
            <span class="sba-top-name">{{ selected.name }}-{{ selected.version }}</span>
          </h1>
          <p class="sba-top-meta">
            识别组件：<strong>{{ selected.components.length }}</strong> 个
            <span class="sba-dot">·</span>
            <span class="sba-spec">{{ selected.spec }} {{ selected.specVersion }}</span>
            <span class="sba-dot">·</span>
            {{ selected.fileName }}（{{ selected.fileSize }}）
            <span class="sba-dot">·</span>
            {{ selected.createdAt }}
          </p>
        </div>

        <div class="sba-top-actions">
          <button type="button" class="sba-btn sba-btn--ghost" @click="downloadSbom">下载 SBOM</button>
          <button type="button" class="sba-btn sba-btn--ghost" @click="copyRaw">
            {{ copied ? '已复制' : '复制内容' }}
          </button>
          <button type="button" class="sba-btn sba-btn--ghost" :disabled="reanalyzing" @click="reanalyze">
            {{ reanalyzing ? '分析中…' : '重新分析' }}
          </button>
          <div class="sba-report" ref="reportRef">
            <button type="button" class="sba-btn sba-btn--primary" @click="reportOpen = !reportOpen">
              分析报告
              <span class="sba-caret">▾</span>
            </button>
            <Transition name="sba-fade">
              <div v-if="reportOpen" class="sba-menu">
                <button type="button" class="sba-menu-item" @click="pickReport('在线查看')">在线查看报告</button>
                <button type="button" class="sba-menu-item" @click="pickReport('PDF')">导出 PDF</button>
                <button type="button" class="sba-menu-item" @click="pickReport('Word')">导出 Word</button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 2. 分类标签 -->
      <div class="sba-panel sba-inline">
        <div class="sba-inline-body">
          <label class="sba-inline-label">分类标签</label>
          <input
            v-model="tagInput"
            type="text"
            class="sba-input"
            placeholder="输入标签，逗号分隔 (如: 生产环境, Java, 后端服务)"
            @keyup.enter="saveTags"
          />
          <div v-if="savedTags.length" class="sba-tag-list">
            <span v-for="t in savedTags" :key="t" class="sba-chip">{{ t }}</span>
          </div>
        </div>
        <button type="button" class="sba-btn sba-btn--purple" @click="saveTags">保存</button>
      </div>

      <!-- 3. 向 SBOM 提问（AI 辅助） -->
      <div class="sba-panel sba-inline sba-inline--ask">
        <div class="sba-inline-body">
          <label class="sba-inline-label">
            向 SBOM 提问
            <span class="sba-ai-badge">AI 辅助</span>
          </label>
          <input
            v-model="question"
            type="text"
            class="sba-input"
            placeholder="例如: 哪些组件有高危漏洞? 有没有 GPL 组件?"
            @keyup.enter="ask"
          />
        </div>
        <button type="button" class="sba-btn sba-btn--purple" :disabled="asking" @click="ask">
          {{ asking ? '思考中…' : '提问' }}
        </button>
      </div>
      <div v-if="answer" class="sba-answer">
        <span class="sba-answer-hd">AI 回答</span>
        <p class="sba-answer-text">{{ answer }}</p>
      </div>

      <!-- 4. 数据统计概览栏 -->
      <div class="sba-stats">
        <template v-for="group in STAT_GROUPS" :key="group.label">
          <div class="sba-stats-group-label">{{ group.label }}</div>
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="sba-stat"
            :class="{ 'is-active': !!item.target && tab === item.target }"
            :disabled="!item.target"
            @click="jumpTo(item.target)"
          >
            <span class="sba-stat-ico" :style="{ color: item.color, background: item.bg }" v-html="item.icon" />
            <span class="sba-stat-body">
              <span class="sba-stat-name">{{ item.label }}</span>
              <span class="sba-stat-num" :style="{ color: item.value > 0 ? item.color : '#b0b5bd' }">
                {{ item.value }}
              </span>
            </span>
          </button>
        </template>
      </div>

      <!-- 5. SBOM 原始内容（可折叠，默认收起，不挤占明细区） -->
      <div class="sba-raw" :class="{ 'is-collapsed': !rawOpen }">
        <div class="sba-raw-hd">
          <button type="button" class="sba-raw-toggle" @click="rawOpen = !rawOpen">
            <span class="sba-raw-caret" :class="{ 'is-open': rawOpen }">▸</span>
            <span class="sba-raw-title">SBOM 原始内容</span>
          </button>
          <div class="sba-raw-tools">
            <span class="sba-raw-format">{{ currentFormatLabel }}</span>
            <div class="sba-convert" ref="convertRef">
              <button type="button" class="sba-btn sba-btn--convert" @click="convertOpen = !convertOpen">
                转换格式
                <span class="sba-caret">▾</span>
              </button>
              <Transition name="sba-fade">
                <div v-if="convertOpen" class="sba-menu sba-menu--dark">
                  <button
                    v-for="f in fileFormats"
                    :key="f.value"
                    type="button"
                    class="sba-menu-item"
                    :class="{ 'is-active': fileFormat === f.value }"
                    @click="switchFormat(f.value)"
                  >
                    {{ f.label }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
        <pre v-show="rawOpen" class="sba-code"><code v-html="highlighted" /></pre>
      </div>

      <!-- 明细区：由上方统计概览栏切换，不再单独设 Tab 条 -->
      <!-- 组件清单 -->
      <div v-show="tab === 'components'" class="sba-card">
        <div class="sba-table-wrap">
          <table class="sba-table">
            <thead>
              <tr>
                <th>组件名称</th>
                <th>版本</th>
                <th>许可证</th>
                <th>供应商</th>
                <th>类型</th>
                <th>PURL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in selected.components" :key="c.purl">
                <td class="sba-strong">{{ c.name }}</td>
                <td class="sba-muted">{{ c.version }}</td>
                <td><span class="sba-license" :class="licenseClass(c.license)">{{ c.license }}</span></td>
                <td class="sba-muted">{{ c.supplier }}</td>
                <td class="sba-muted">{{ c.type }}</td>
                <td><code class="sba-purl">{{ c.purl }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 许可证 -->
      <div v-show="tab === 'license'" class="sba-card">
        <div class="sba-license-bars">
          <div v-for="l in licenses" :key="l.name" class="sba-license-row">
            <span class="sba-license-name">{{ l.name }}</span>
            <span class="sba-license-type" :class="licenseClass(l.name)">{{ l.type }}</span>
            <div class="sba-license-track">
              <div
                class="sba-license-fill"
                :class="licenseClass(l.name)"
                :style="{ width: barWidth(l.count) }"
              />
            </div>
            <span class="sba-license-count">{{ l.count }}</span>
          </div>
        </div>
      </div>

      <!-- 漏洞 -->
      <div v-show="tab === 'vuln'" class="sba-card">
        <div v-if="selected.vulnerabilities.length === 0" class="sba-empty">
          <p class="sba-empty-text">未发现已知漏洞</p>
        </div>
        <div v-else class="sba-table-wrap">
          <table class="sba-table">
            <thead>
              <tr>
                <th>漏洞编号</th>
                <th>风险等级</th>
                <th class="sba-center">CVSS</th>
                <th>影响组件</th>
                <th>漏洞描述</th>
                <th>修复建议</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in selected.vulnerabilities" :key="v.cve">
                <td><code class="sba-id">{{ v.cve }}</code></td>
                <td><span class="sba-level" :class="'sba-level--' + v.level">{{ v.levelLabel }}</span></td>
                <td class="sba-center sba-cvss" :class="'sba-cvss--' + v.level">{{ v.cvss }}</td>
                <td>
                  <span class="sba-strong">{{ v.component }}</span>
                  <span class="sba-muted"> {{ v.version }}</span>
                </td>
                <td class="sba-desc-cell">{{ v.title }}</td>
                <td class="sba-fix-cell">{{ v.fix }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sbomState, licenseSummary, renderSbom } from '../../../data/sbomStore.js'

const route = useRoute()
const router = useRouter()

const records = computed(() => sbomState.records)
const currentId = ref(typeof route.query.id === 'string' ? route.query.id : '')
const selected = computed(() => records.value.find((r) => r.id === currentId.value) || null)

const licenses = computed(() => (selected.value ? licenseSummary(selected.value) : []))

/* 明细切换：由统计概览栏的组件 / 许可证 / 漏洞项驱动 */
const tab = ref('components')

/* ---------- 顶部操作 ---------- */
const copied = ref(false)
const reanalyzing = ref(false)
const reportOpen = ref(false)
const reportRef = ref(null)

const convertOpen = ref(false)

/* 原始内容默认收起，避免挤占下方明细区 */
const rawOpen = ref(false)
const convertRef = ref(null)

const fileFormat = ref('spdx-json')

const fileFormats = computed(() => {
  if (!selected.value) return []
  return selected.value.spec === 'CycloneDX'
    ? [
        { value: 'cyclonedx-json', label: 'CycloneDX JSON', ext: 'cdx.json' },
        { value: 'cyclonedx-xml', label: 'CycloneDX XML', ext: 'cdx.xml' },
      ]
    : [
        { value: 'spdx-json', label: 'SPDX JSON', ext: 'spdx.json' },
        { value: 'spdx-tag', label: 'SPDX Tag-Value', ext: 'spdx' },
      ]
})

const currentFormatLabel = computed(
  () => fileFormats.value.find((f) => f.value === fileFormat.value)?.label || '',
)

watch(selected, (s) => {
  if (!s) return
  fileFormat.value = s.spec === 'CycloneDX' ? 'cyclonedx-json' : 'spdx-json'
}, { immediate: true })

const rawContent = computed(() =>
  selected.value ? renderSbom(selected.value, fileFormat.value) : '',
)

/* JSON 轻量高亮（内容由本地生成，先转义再着色） */
const highlighted = computed(() => {
  const esc = (t) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc(rawContent.value)
    .replace(/"([^"]+)"(\s*:)/g, '<span class="j-key">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="j-str">"$1"</span>')
    .replace(/:\s*(-?\d+(?:\.\d+)?)(\s*[,}\]])/g, ': <span class="j-num">$1</span>$2')
    .replace(/\b(true|false|null)\b/g, '<span class="j-kw">$1</span>')
})

function currentExt() {
  return fileFormats.value.find((f) => f.value === fileFormat.value)?.ext || 'txt'
}

function switchFormat(v) {
  fileFormat.value = v
  convertOpen.value = false
}

async function copyRaw() {
  try {
    await navigator.clipboard.writeText(rawContent.value)
  } catch {
    /* 剪贴板不可用时静默降级 */
  }
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}

function downloadSbom() {
  if (!selected.value) return
  const blob = new Blob([rawContent.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selected.value.name}-${selected.value.version}.${currentExt()}`
  a.click()
  URL.revokeObjectURL(url)
}

function reanalyze() {
  reanalyzing.value = true
  window.setTimeout(() => { reanalyzing.value = false }, 1200)
}

function pickReport(kind) {
  reportOpen.value = false
  // 报告导出能力待接入，先记录所选类型
  reportKind.value = kind
}

const reportKind = ref('')
/* ---------- 分类标签 ---------- */
const tagInput = ref('')
const savedTags = ref([])

function saveTags() {
  const list = tagInput.value
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)
  if (list.length) savedTags.value = list
}

/* ---------- 向 SBOM 提问 ---------- */
const question = ref('')
const answer = ref('')
const asking = ref(false)

function ask() {
  if (!question.value.trim() || asking.value) return
  asking.value = true
  answer.value = ''
  window.setTimeout(() => {
    const q = question.value
    const highVulns = selected.value.vulnerabilities.filter((v) => v.level === 'critical' || v.level === 'high')
    const gpl = selected.value.components.filter((c) => /GPL/i.test(c.license))
    if (/漏洞|高危|CVE/i.test(q)) {
      answer.value = highVulns.length
        ? `共发现 ${highVulns.length} 个高危及以上漏洞：${highVulns.map((v) => `${v.cve}（${v.component} ${v.version}，CVSS ${v.cvss}）`).join('；')}。建议优先升级修复。`
        : '未发现高危及以上漏洞。'
    } else if (/GPL|许可证|license/i.test(q)) {
      answer.value = gpl.length
        ? `检测到 ${gpl.length} 个 GPL 系许可证组件：${gpl.map((c) => `${c.name} ${c.version}`).join('、')}。分发时需评估传染性义务。`
        : `未发现 GPL 系组件。当前共 ${licenses.value.length} 种许可证：${licenses.value.map((l) => `${l.name}(${l.count})`).join('、')}。`
    } else {
      answer.value = `已解析 ${selected.value.components.length} 个组件、${selected.value.vulnerabilities.length} 个已知漏洞、${licenses.value.length} 种许可证。可继续询问漏洞、许可证或指定组件。`
    }
    asking.value = false
  }, 700)
}

/* ---------- 统计概览 ---------- */
const STAT_GROUPS = computed(() => {
  const r = selected.value
  if (!r) return []
  const poisoned = r.poisoned ?? 0
  return [
    {
      label: 'SBOM',
      items: [
        { key: 'comp', label: '组件', value: r.components.length, color: '#2563eb', bg: '#e8f0fe', target: 'components', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
        { key: 'file', label: '文件', value: 0, color: '#0891b2', bg: '#e0f2fe', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { key: 'frag', label: '片段', value: 0, color: '#7c3aed', bg: '#f1eafe', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
      ],
    },
    {
      label: '依赖',
      items: [
        { key: 'vuln', label: '漏洞', value: r.vulnerabilities.length, color: '#dc2626', bg: '#fdeaea', target: 'vuln', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
        { key: 'poison', label: '投毒', value: poisoned, color: '#ea580c', bg: '#fdf0e6', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>' },
        { key: 'lic', label: '许可证', value: licenses.value.length, color: '#16a34a', bg: '#e7f7ec', target: 'license', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>' },
        { key: 'model', label: 'AI模型', value: 0, color: '#db2777', bg: '#fce7f3', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>' },
        { key: 'dataset', label: '数据集', value: 0, color: '#0d9488', bg: '#e0f2f1', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3Z"/></svg>' },
      ],
    },
    {
      label: 'AI合规',
      items: [
        { key: 'cred', label: '凭证泄露', value: 0, color: '#9333ea', bg: '#f3e8ff', target: '', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5"/></svg>' },
      ],
    },
  ]
})

/* ---------- 跳转明细：直接切换 Tab ---------- */
function jumpTo(target) {
  if (!target) return
  tab.value = target
}

/* ---------- 许可证 ---------- */
function barWidth(count) {
  const max = Math.max(...licenses.value.map((l) => l.count), 1)
  return `${Math.max((count / max) * 100, 6)}%`
}

function licenseClass(name) {
  const map = {
    'GPL-3.0': 'is-danger',
    'GPL-2.0': 'is-danger',
    'AGPL-3.0': 'is-danger',
    'LGPL-2.1': 'is-warn',
    'MPL-2.0': 'is-warn',
    'EPL-1.0': 'is-warn',
  }
  return map[name] || 'is-ok'
}

/* ---------- 选择 / 返回 ---------- */
function select(id) {
  currentId.value = id
  router.replace({ name: 'sbom-analysis', query: { id } })
  window.scrollTo({ top: 0 })
}

function backToList() {
  currentId.value = ''
  router.replace({ name: 'sbom-analysis' })
}

/* ---------- 点击外部关闭下拉 ---------- */
function onDocClick(e) {
  if (reportRef.value && !reportRef.value.contains(e.target)) reportOpen.value = false
  if (convertRef.value && !convertRef.value.contains(e.target)) convertOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.sbom-ana { display: flex; flex-direction: column; gap: 16px; }

/* 列表页 */
.sba-page-hd { margin-bottom: 4px; }
.sba-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sba-desc { font-size: 13px; color: #8b919b; margin: 0; line-height: 1.6; max-width: 660px; }

.sba-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.sba-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #f2f3f5; }
.sba-card-title { font-size: 13px; font-weight: 600; color: #374151; }
.sba-card-count { font-size: 11px; color: #b0b5bd; }

/* 明细切换由统计栏承载 */

.sba-table-wrap { overflow-x: auto; }
.sba-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.sba-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; background: #fafbfc; border-bottom: 1px solid #eef0f2; white-space: nowrap; letter-spacing: .03em; }
.sba-table td { padding: 11px 14px; border-bottom: 1px solid #f5f6f7; color: #4b5563; vertical-align: middle; }
.sba-table tbody tr:last-child td { border-bottom: none; }
.sba-table tbody tr:hover { background: #fafbfc; }
.sba-center { text-align: center !important; }
.sba-strong { font-weight: 600; color: #111827; }
.sba-muted { color: #9ca3af; }
.sba-nowrap { white-space: nowrap; }
.sba-fmt { font-size: 11px; }
.sba-id { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 11px; color: #6b7280; background: #f5f6f7; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.sba-purl { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 10px; color: #9ca3af; }
.sba-spec { font-size: 11px; font-weight: 500; color: #6b7280; background: #f5f6f7; padding: 2px 7px; border-radius: 4px; white-space: nowrap; }
.sba-link { padding: 0; border: none; background: none; font-size: 12px; font-weight: 600; color: #da203e; cursor: pointer; font-family: inherit; }
.sba-link:hover { text-decoration: underline; }
.sba-vuln-num { font-weight: 600; color: #9ca3af; }
.sba-vuln-num.is-risk { color: #e5a850; }

.sba-empty { padding: 48px 20px; text-align: center; }
.sba-empty-text { font-size: 13px; color: #b0b5bd; margin: 0 0 12px; }
.sba-empty-btn { display: inline-block; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #da203e; border: 1px solid rgba(218,32,62,0.3); border-radius: 6px; text-decoration: none; }
.sba-empty-btn:hover { background: rgba(218,32,62,0.05); }

/* ===== 顶部信息与操作区 ===== */
.sba-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; }
.sba-top-left { min-width: 0; }
.sba-back { padding: 3px 10px; font-size: 11px; color: #9ca3af; background: #fff; border: 1px solid #eef0f2; border-radius: 5px; cursor: pointer; font-family: inherit; margin-bottom: 8px; transition: color .2s, border-color .2s; }
.sba-back:hover { color: #da203e; border-color: rgba(218,32,62,0.3); }
.sba-top-title { font-size: 19px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sba-top-dash { color: #d3d7dd; margin: 0 2px; font-weight: 400; }
.sba-top-name { color: #111827; }
.sba-top-meta { font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.8; }
.sba-top-meta strong { color: #374151; }
.sba-dot { margin: 0 5px; color: #d3d7dd; }

.sba-top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
.sba-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; font-size: 12px; font-weight: 500; border-radius: 6px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s, background .2s, opacity .2s; white-space: nowrap; }
.sba-btn:disabled { opacity: .55; cursor: not-allowed; }
.sba-btn--ghost { color: #4b5563; background: #fff; border: 1px solid #e1e4e8; }
.sba-btn--ghost:hover:not(:disabled) { color: #da203e; border-color: rgba(218,32,62,0.45); }
.sba-btn--primary { color: #fff; background: #da203e; border: 1px solid #da203e; }
.sba-btn--primary:hover { background: #c01b36; border-color: #c01b36; }
.sba-btn--purple { color: #fff; background: #7c3aed; border: 1px solid #7c3aed; }
.sba-btn--purple:hover:not(:disabled) { background: #6d28d9; border-color: #6d28d9; }
.sba-btn--convert { color: #e8eaf0; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
.sba-btn--convert:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.32); }
.sba-caret { font-size: 9px; opacity: .8; margin-left: 1px; }

.sba-report, .sba-convert { position: relative; }
.sba-menu { position: absolute; top: calc(100% + 5px); right: 0; z-index: 30; min-width: 148px; padding: 4px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 8px 28px rgba(0,0,0,0.12); display: flex; flex-direction: column; }
.sba-menu--dark { background: #252b38; border-color: rgba(255,255,255,0.14); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
.sba-menu-item { padding: 7px 10px; text-align: left; font-size: 12px; color: #4b5563; background: none; border: none; border-radius: 5px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.sba-menu-item:hover { background: #f5f6f7; color: #da203e; }
.sba-menu--dark .sba-menu-item { color: #c6ccd8; }
.sba-menu--dark .sba-menu-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sba-menu--dark .sba-menu-item.is-active { color: #fff; background: rgba(124,58,237,0.35); }

.sba-fade-enter-active, .sba-fade-leave-active { transition: opacity .18s, transform .18s; }
.sba-fade-enter-from, .sba-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ===== 输入面板 ===== */
.sba-panel { display: flex; align-items: flex-start; gap: 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; }
.sba-inline-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.sba-inline-label { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: #374151; }
.sba-ai-badge { padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; color: #7c3aed; background: rgba(124,58,237,0.09); letter-spacing: .04em; }
.sba-input { width: 100%; padding: 8px 12px; font-size: 12px; color: #111827; background: #fafbfc; border: 1px solid #e5e7eb; border-radius: 6px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color .2s, box-shadow .2s, background .2s; }
.sba-input:focus { background: #fff; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.09); }
.sba-input::placeholder { color: #c4c9d1; }
.sba-panel > .sba-btn { margin-top: 22px; flex-shrink: 0; }
.sba-tag-list { display: flex; flex-wrap: wrap; gap: 5px; }
.sba-chip { padding: 2px 9px; border-radius: 999px; font-size: 10px; font-weight: 500; color: #7c3aed; background: rgba(124,58,237,0.08); }

.sba-answer { padding: 12px 16px; background: rgba(124,58,237,0.035); border: 1px solid rgba(124,58,237,0.18); border-radius: 9px; }
.sba-answer-hd { display: block; font-size: 10px; font-weight: 700; color: #7c3aed; letter-spacing: .06em; margin-bottom: 5px; }
.sba-answer-text { font-size: 12px; line-height: 1.7; color: #4b5563; margin: 0; }

/* ===== 统计概览栏 ===== */
.sba-stats { display: flex; align-items: stretch; gap: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px 10px; overflow-x: auto; flex-wrap: wrap; }
.sba-stats-group-label { display: flex; align-items: center; padding: 0 10px; font-size: 10px; font-weight: 700; color: #b0b5bd; letter-spacing: .06em; white-space: nowrap; }
.sba-stat { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: none; border: none; border-radius: 7px; cursor: pointer; font-family: inherit; transition: background .18s; flex-shrink: 0; }
.sba-stat:hover { background: #f7f8fa; }
.sba-stat.is-active { background: rgba(218,32,62,0.07); }
.sba-stat.is-active .sba-stat-name { color: #da203e; font-weight: 600; }
.sba-stat:disabled { cursor: default; }
.sba-stat:disabled:hover { background: none; }
.sba-stat-ico { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sba-stat-body { display: flex; align-items: baseline; gap: 5px; }
.sba-stat-name { font-size: 11px; color: #8b919b; white-space: nowrap; }
.sba-stat-num { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }

/* ===== SBOM 原始内容 ===== */
.sba-raw { border-radius: 10px; overflow: hidden; background: #1e2430; border: 1px solid #2b3240; }
.sba-raw-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #252b38; border-bottom: 1px solid #2b3240; }
.sba-raw.is-collapsed .sba-raw-hd { border-bottom: none; }
.sba-raw-toggle { display: inline-flex; align-items: center; gap: 7px; padding: 0; background: none; border: none; cursor: pointer; font-family: inherit; }
.sba-raw-caret { font-size: 9px; color: #8b94a6; transition: transform .2s; }
.sba-raw-caret.is-open { transform: rotate(90deg); }
.sba-raw-toggle:hover .sba-raw-title { color: #fff; }
.sba-raw-title { font-size: 12px; font-weight: 600; color: #e8eaf0; transition: color .2s; }
.sba-raw-tools { display: flex; align-items: center; gap: 10px; }
.sba-raw-format { font-size: 10px; color: #8b94a6; font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.sba-code { margin: 0; padding: 14px 18px; max-height: 520px; overflow: auto; font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace; font-size: 11px; line-height: 1.75; color: #b9c2d0; white-space: pre; }
.sba-code :deep(.j-key) { color: #7dd3fc; }
.sba-code :deep(.j-str) { color: #a5e8a1; }
.sba-code :deep(.j-num) { color: #f0b072; }
.sba-code :deep(.j-kw) { color: #c792ea; }

/* ===== 许可证 ===== */
.sba-license-bars { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.sba-license-row { display: grid; grid-template-columns: 110px 56px 1fr 32px; align-items: center; gap: 10px; }
.sba-license-name { font-size: 12px; font-weight: 600; color: #374151; }
.sba-license-type { font-size: 10px; padding: 1px 6px; border-radius: 3px; text-align: center; white-space: nowrap; }
.sba-license-track { height: 6px; border-radius: 3px; background: #f2f3f5; overflow: hidden; }
.sba-license-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.sba-license-count { font-size: 11px; color: #9ca3af; text-align: right; font-variant-numeric: tabular-nums; }
.is-ok { background: rgba(47,158,87,0.1); color: #2f9e57; }
.is-warn { background: rgba(229,168,80,0.12); color: #c98a2e; }
.is-danger { background: rgba(218,32,62,0.1); color: #da203e; }
.sba-license-fill.is-ok { background: #2f9e57; }
.sba-license-fill.is-warn { background: #e5a850; }
.sba-license-fill.is-danger { background: #da203e; }
.sba-license { padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 500; }

/* ===== 漏洞 ===== */
.sba-level { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.sba-level--critical { background: rgba(218,32,62,0.1); color: #da203e; }
.sba-level--high { background: rgba(229,105,80,0.12); color: #d9603f; }
.sba-level--medium { background: rgba(229,168,80,0.12); color: #c98a2e; }
.sba-level--low { background: #f2f3f5; color: #9ca3af; }
.sba-cvss { font-weight: 700; font-variant-numeric: tabular-nums; }
.sba-cvss--critical { color: #da203e; }
.sba-cvss--high { color: #d9603f; }
.sba-cvss--medium { color: #c98a2e; }
.sba-desc-cell { max-width: 220px; }
.sba-fix-cell { font-size: 11px; color: #2f9e57; }

@media (max-width: 900px) {
  .sba-top-actions { width: 100%; }
  .sba-license-row { grid-template-columns: 96px 52px 1fr 28px; }
  .sba-panel { flex-direction: column; }
  .sba-panel > .sba-btn { margin-top: 0; }
}
</style>
