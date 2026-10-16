<template>
  <div class="sig-page">
    <header class="sig-hero">
      <div class="sig-hero-text">
        <h1 class="sig-title">签名认证</h1>
        <p class="sig-lead">上传待验证的源码包或组件包，通过签名校验验证下载来源真实性，并结合安全检测评估软件可信度。</p>
      </div>
      <!-- 原右侧「验」字徽标已按需求移除，该位置改为历史记录入口。
           注：入口只保留这一处 —— 原先标题下方另有一个「历史签名验证记录」按钮，
           两者打开的是同一个弹窗，并存属重复入口，故已合并。 -->
      <button type="button" class="sig-btn sig-btn--ghost sig-hero-history" @click="openHistory">
        查看历史记录
        <span v-if="recordCount" class="sig-hero-history-count">{{ recordCount }}</span>
      </button>
    </header>

    <ol class="sig-steps" aria-label="流程">
      <li
        class="sig-step"
        :class="{
          'is-active': step1Active,
          'is-done': step1Done,
        }"
      >
        <span class="sig-step-idx">{{ step1Done ? '✓' : '1' }}</span>
        <span class="sig-step-label">上传文件</span>
      </li>
      <li class="sig-step-line" :class="{ 'is-active': line1Active }" />
      <li
        class="sig-step"
        :class="{
          'is-active': step2Active,
          'is-done': step2Done,
        }"
      >
        <span class="sig-step-idx">{{ step2Done ? '✓' : '2' }}</span>
        <span class="sig-step-label">扫描文件</span>
      </li>
      <li class="sig-step-line" :class="{ 'is-active': line2Active }" />
      <li
        class="sig-step"
        :class="{
          'is-active': step3Active,
          'is-done': step3Done,
        }"
      >
        <span class="sig-step-idx">{{ step3Done ? '✓' : '3' }}</span>
        <span class="sig-step-label">查看结果</span>
      </li>
    </ol>

    <!-- 进入本页即呈现初始上传态：不展示历次结果，历史结果统一走标题区右侧「查看历史记录」入口 -->
    <section v-show="phase === 'idle'" class="sig-card" aria-labelledby="sig-upload-title">
      <!-- 标题不与上方步骤标签「上传文件」重复，改为面向动作的措辞 -->
      <h2 id="sig-upload-title" class="sig-card-title">选择待验证文件</h2>
      <p class="sig-card-desc">选择后将自动上传至平台，上传成功后可提交验证。</p>

      <div
        class="sig-drop"
        :class="{ 'is-drag': dragOver, 'has-file': !!selectedFile, 'is-busy': localUploading }"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="onDropZoneKey"
        @keydown.space.prevent="onDropZoneKey"
        @dragenter.prevent="dragOver = true"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
        @click="onDropZoneClick"
      >
        <input
          ref="fileInputRef"
          type="file"
          class="sig-file-input"
          accept="*/*"
          @change="onFileInput"
        />
        <div v-if="!selectedFile" class="sig-drop-empty">
          <span class="sig-drop-icon" aria-hidden="true">⎗</span>
          <p class="sig-drop-title">拖拽文件到此处，或点击选择</p>
          <p class="sig-drop-hint">支持zip、tar、gz、bz2、rar、7z等格式。单文件不超过 96&nbsp;MB。</p>
        </div>
        <div v-else class="sig-drop-file">
          <span class="sig-file-icon" aria-hidden="true">▣</span>
          <div class="sig-file-meta">
            <p class="sig-file-name">{{ selectedFile.name }}</p>
            <p class="sig-file-size">{{ formatSize(selectedFile.size) }}</p>
          </div>
          <button type="button" class="sig-file-clear" @click.stop="clearFile">移除</button>
        </div>
      </div>

      <div v-if="selectedFile && !fileError" class="sig-file-upload-below">
        <template v-if="localUploading">
          <p class="sig-file-upload-status">正在上传…</p>
          <div class="sig-progress-track">
            <div class="sig-progress-fill" :style="{ width: uploadProgress + '%' }" />
          </div>
          <div class="sig-progress-meta">
            <span>{{ uploadProgress }}%</span>
            <span class="sig-progress-bytes">{{ uploadedBytesLabel }}</span>
          </div>
        </template>
        <p v-else-if="uploadReady" class="sig-file-upload-status sig-file-upload-status--ok">上传完成，可提交验证</p>
      </div>

      <p v-if="fileError" class="sig-error" role="alert">{{ fileError }}</p>

      <div class="sig-actions">
        <button type="button" class="sig-btn sig-btn--ghost" :disabled="!selectedFile || localUploading" @click="clearFile">
          清空
        </button>
        <button
          type="button"
          class="sig-btn sig-btn--primary"
          :disabled="!canSubmitVerify"
          @click="startVerify"
        >
          提交验证
        </button>
      </div>
    </section>

    <section v-show="phase === 'scanning'" class="sig-card sig-card--progress" aria-live="polite">
      <h2 class="sig-card-title">正在扫描文件</h2>
      <p class="sig-card-desc">平台正在分析安装包，请稍候…</p>

      <div class="sig-progress-block">
        <div class="sig-wait-visual sig-wait-visual--inline">
          <div class="sig-orbit" aria-hidden="true">
            <div class="sig-orbit-ring" />
            <div class="sig-orbit-core" />
          </div>
          <p class="sig-wait-file">{{ selectedFile?.name }}</p>
        </div>
      </div>
    </section>

    <section
      :key="resultPanelKey"
      v-show="phase === 'result'"
      class="sig-card sig-result-wrap"
      aria-labelledby="sig-result-title"
    >
      <div
        class="sig-result-banner"
        :class="overallPassed ? 'sig-result-banner--ok' : 'sig-result-banner--fail'"
      >
        <span class="sig-result-icon" aria-hidden="true">{{ overallPassed ? '✓' : '!' }}</span>
        <div>
          <h2 id="sig-result-title" class="sig-result-heading">
            {{ overallPassed ? '验证通过' : '验证未通过' }}
          </h2>
          <p class="sig-result-sub">
            {{
              overallPassed
                ? '该文件签名有效且软件可信，可放心使用。'
                : '该文件签名无效或软件未通过可信验证，建议从可信渠道重新下载。'
            }}
          </p>
        </div>
      </div>

      <dl class="sig-result-dl">
        <div class="sig-result-row">
          <dt>文件名称</dt>
          <dd>{{ selectedFile?.name }}</dd>
        </div>
        <div class="sig-result-row">
          <dt>验证时间</dt>
          <dd>{{ resultTimeText }}</dd>
        </div>
        <div class="sig-result-row">
          <dt>签名状态</dt>
          <dd>
            <span class="sig-status-tag" :class="signaturePassed ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
              {{ signaturePassed ? '通过' : '未通过' }}
            </span>
          </dd>
        </div>
        <div class="sig-result-row">
          <dt>可信状态</dt>
          <dd>
            <span class="sig-status-tag" :class="trusted ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
              {{ trusted ? '可信' : '不可信' }}
            </span>
          </dd>
        </div>
      </dl>

      <div class="sig-actions">
        <button type="button" class="sig-btn sig-btn--primary" @click="resetFlow">验证其他文件</button>
      </div>
    </section>

    <!-- ===== 历史签名验证记录弹窗 =====
         两个视图：列表（默认）与单条详情（detailRecord 非空时）。 -->
    <div v-if="historyOpen" class="sig-modal" @click.self="closeHistory">
      <div
        class="sig-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sig-history-title"
        @keydown.esc="closeHistory"
      >
        <header class="sig-modal-head">
          <div class="sig-modal-head-text">
            <h2 id="sig-history-title" class="sig-modal-title">
              {{ detailRecord ? '验证记录详情' : '历史签名验证记录' }}
            </h2>
            <p class="sig-modal-sub">
              {{ detailRecord ? detailRecord.fileName : `共 ${historyList.length} 条记录，按验证时间倒序` }}
            </p>
          </div>
          <button type="button" class="sig-modal-close" aria-label="关闭" @click="closeHistory">×</button>
        </header>

        <!-- 视图一：列表 -->
        <div v-if="!detailRecord" class="sig-modal-body">
          <p v-if="!historyList.length" class="sig-modal-empty">
            暂无历史验证记录。上传文件并提交验证后，记录会自动出现在这里。
          </p>
          <ul v-else class="sig-hist-list">
            <li v-for="rec in pagedHistory" :key="rec.id" class="sig-hist-item">
              <span
                class="sig-hist-mark"
                :class="recordPassed(rec) ? 'sig-hist-mark--ok' : 'sig-hist-mark--fail'"
                aria-hidden="true"
              >
                {{ recordPassed(rec) ? '✓' : '!' }}
              </span>
              <div class="sig-hist-main">
                <p class="sig-hist-file">{{ rec.fileName }}</p>
                <!-- 只展示真实验证产生的信息：文件名 / 时间 / 大小。
                     原「签名算法」为用户未提供的硬编码值，已移除。 -->
                <p class="sig-hist-meta">
                  <span class="sig-hist-time">{{ rec.verifiedAt }}</span>
                  <span class="sig-hist-sep">·</span>
                  <span>{{ formatSize(rec.fileSize) }}</span>
                </p>
              </div>
              <div class="sig-hist-tags">
                <span class="sig-status-tag" :class="rec.signaturePassed ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
                  签名{{ rec.signaturePassed ? '通过' : '未通过' }}
                </span>
                <span class="sig-status-tag" :class="rec.trusted ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
                  {{ rec.trusted ? '可信' : '不可信' }}
                </span>
              </div>
              <button type="button" class="sig-hist-detail" @click="openRecordDetail(rec)">详情</button>
            </li>
          </ul>

          <!-- 分页栏：口径与平台其它列表页一致（默认 10 条/页，可切 10/20/50） -->
          <div v-if="historyList.length" class="sig-pager">
            <span class="sig-pager-total">
              第 {{ pageRange.from }}-{{ pageRange.to }} 条 / 共 {{ historyList.length }} 条
            </span>
            <button
              type="button"
              class="sig-page-btn"
              :disabled="page <= 1"
              aria-label="上一页"
              @click="goPage(page - 1)"
            >
              ‹
            </button>
            <button
              v-for="p in pageNumbers"
              :key="p"
              type="button"
              class="sig-page-btn"
              :class="{ 'is-active': p === page }"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="sig-page-btn"
              :disabled="page >= totalPages"
              aria-label="下一页"
              @click="goPage(page + 1)"
            >
              ›
            </button>
            <SearchSelect
              :model-value="pageSize"
              class="sig-pager-size"
              :options="PAGE_SIZE_OPTIONS"
              number
              @change="onPageSizeChange"
            />
          </div>
        </div>

        <!-- 视图二：单条详情 -->
        <div v-else class="sig-modal-body">
          <div
            class="sig-hist-banner"
            :class="recordPassed(detailRecord) ? 'sig-hist-banner--ok' : 'sig-hist-banner--fail'"
          >
            <span class="sig-hist-banner-icon" aria-hidden="true">{{ recordPassed(detailRecord) ? '✓' : '!' }}</span>
            <div class="sig-hist-banner-body">
              <p class="sig-hist-banner-file">{{ detailRecord.fileName }}</p>
              <p class="sig-hist-banner-time">{{ detailRecord.verifiedAt }}</p>
            </div>
            <span
              class="sig-status-tag"
              :class="recordPassed(detailRecord) ? 'sig-status-tag--ok' : 'sig-status-tag--fail'"
            >
              {{ recordPassed(detailRecord) ? '通过' : '未通过' }}
            </span>
          </div>
          <!-- 详情只列真实验证产生的字段：
               用户上传的文件信息（名称 / 大小）+ 本次验证结论（时间 / 签名 / 可信）。
               以下字段因「用户没填、也不是验证结果」已移除：
               供应方（用户未填，原显示为「—」）、签名算法（硬编码非实测）、
               签名指纹 / 文件哈希（原为随机生成值，非真实计算）。 -->
          <dl class="sig-detail-dl">
            <div class="sig-detail-row">
              <dt>文件名称</dt>
              <dd>{{ detailRecord.fileName }}</dd>
            </div>
            <div class="sig-detail-row">
              <dt>文件大小</dt>
              <dd>{{ formatSize(detailRecord.fileSize) }}</dd>
            </div>
            <div class="sig-detail-row">
              <dt>验证时间</dt>
              <dd>{{ detailRecord.verifiedAt }}</dd>
            </div>
            <div class="sig-detail-row">
              <dt>签名状态</dt>
              <dd>
                <span class="sig-status-tag" :class="detailRecord.signaturePassed ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
                  {{ detailRecord.signaturePassed ? '通过' : '未通过' }}
                </span>
              </dd>
            </div>
            <div class="sig-detail-row">
              <dt>可信状态</dt>
              <dd>
                <span class="sig-status-tag" :class="detailRecord.trusted ? 'sig-status-tag--ok' : 'sig-status-tag--fail'">
                  {{ detailRecord.trusted ? '可信' : '不可信' }}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <footer class="sig-modal-foot">
          <button v-if="detailRecord" type="button" class="sig-btn sig-btn--ghost" @click="backToHistoryList">
            返回列表
          </button>
          <span class="sig-modal-foot-spacer" />
          <button
            v-if="!detailRecord && historyList.length"
            type="button"
            class="sig-btn sig-btn--ghost sig-btn--danger"
            @click="onClearHistory"
          >
            清空记录
          </button>
          <button type="button" class="sig-btn sig-btn--primary" @click="closeHistory">关闭</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SearchSelect from '../../components/common/SearchSelect.vue'
import {
  addVerifyRecord,
  clearVerifyRecords,
  getVerifyRecords,
  PAGE_SIZE_OPTIONS,
} from '../../data/signatureVerifyData.js'

const phase = ref('idle')
const fileInputRef = ref(null)
const selectedFile = ref(null)
const fileError = ref('')
const dragOver = ref(false)
const signaturePassed = ref(false)
const trusted = ref(false)
const resultTimeText = ref('')
/** 每次出结果递增，避免结果区复用时样式/类名偶发不刷新 */
const resultPanelKey = ref(0)
const uploadProgress = ref(0)
const uploadReady = ref(false)
const localUploading = ref(false)

/* ===== 历史验证记录 =====
   进入本页只呈现初始上传态，不展示历次结果；
   历次结果统一通过「查看历史记录」入口（标题区右侧）查看。 */
/** 历史记录弹窗开关 */
const historyOpen = ref(false)
/** 历史记录列表（时间倒序） */
const historyList = ref([])
/** 历史详情：非空时展示单条详情，为空时展示列表 */
const detailRecord = ref(null)

/* ===== 历史列表分页 =====
   与平台其它列表页一致的口径：默认 10 条/页，可切 10 / 20 / 50，
   时间倒序后按页切片展示；页码窗口最多 5 个。 */
const page = ref(1)
const pageSize = ref(10)
/** 当前页的记录（时间倒序后切片） */
const pagedHistory = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return historyList.value.slice(start, start + pageSize.value)
})
const totalPages = computed(() => Math.max(1, Math.ceil(historyList.value.length / pageSize.value)))
/** 页码窗口：总页数 ≤5 全列；否则以当前页为中心取 5 个，首尾各自贴边 */
const pageNumbers = computed(() => {
  const t = totalPages.value
  const c = page.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 3) return [1, 2, 3, 4, 5]
  if (c >= t - 2) return [t - 4, t - 3, t - 2, t - 1, t]
  return [c - 2, c - 1, c, c + 1, c + 2]
})
/** 当前页展示区间的起止序号（用于「第 X-Y 条」提示） */
const pageRange = computed(() => {
  if (!historyList.value.length) return { from: 0, to: 0 }
  const from = (page.value - 1) * pageSize.value + 1
  return { from, to: Math.min(page.value * pageSize.value, historyList.value.length) }
})

/** 切页：约束在合法范围内（页码窗口/末页数据变化后防止越界） */
function goPage(p) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
}

/** 切每页条数：回到第 1 页，避免停留在已不存在的页码上 */
function onPageSizeChange(v) {
  pageSize.value = Number(v) || 10
  page.value = 1
}

/** 历史记录条数（入口角标）。数据层首次读取即完成播种，故挂载后即有值 */
const recordCount = ref(0)

onMounted(() => {
  recordCount.value = getVerifyRecords().length
})

/** 记录的整体结论：签名与可信都通过才算通过 */
function recordPassed(r) {
  return !!(r && r.signaturePassed && r.trusted)
}

/** 打开历史记录弹窗（每次打开都重新读取，保证与最新验证同步） */
function openHistory() {
  historyList.value = getVerifyRecords()
  detailRecord.value = null
  // 每次打开回到第 1 页（否则会残留上次的页码）
  page.value = 1
  historyOpen.value = true
}

function closeHistory() {
  historyOpen.value = false
  detailRecord.value = null
}

/** 历史列表 → 单条详情 */
function openRecordDetail(rec) {
  detailRecord.value = rec
}

/** 详情 → 返回列表 */
function backToHistoryList() {
  detailRecord.value = null
}

/** 清空历史（含确认，避免误删演示数据） */
function onClearHistory() {
  if (!window.confirm('确定清空全部历史验证记录？该操作不可恢复。')) return
  clearVerifyRecords()
  historyList.value = getVerifyRecords()
  detailRecord.value = null
  // 清空后回到第 1 页，否则页码停留在旧位置会显示空列表
  page.value = 1
  // 角标须同步归零，否则清空后入口仍显示旧条数（实测踩过）
  recordCount.value = 0
}

const overallPassed = computed(() => signaturePassed.value && trusted.value)

/** 选文件后自动上传模拟：取消时递增，避免旧任务把状态置为已就绪 */
let uploadJobId = 0
/** 本地上传模拟 interval */
let uploadIntervalId = null
/** 扫描阶段等待（无进度条） */
let scanWaitTimerId = null

function clearScanWait() {
  if (scanWaitTimerId != null) {
    clearTimeout(scanWaitTimerId)
    scanWaitTimerId = null
  }
}

const step1Done = computed(
  () =>
    (phase.value === 'idle' && uploadReady.value && !localUploading.value && !!selectedFile.value) ||
    phase.value === 'scanning' ||
    phase.value === 'result',
)
const step1Active = computed(() => phase.value === 'idle' && !step1Done.value)

const line1Active = computed(
  () =>
    (phase.value === 'idle' && uploadReady.value && !localUploading.value && !!selectedFile.value) ||
    phase.value === 'scanning' ||
    phase.value === 'result',
)

const step2Active = computed(() => phase.value === 'scanning')
const step2Done = computed(() => phase.value === 'result')
const line2Active = computed(() => ['scanning', 'result'].includes(phase.value))

const step3Active = computed(() => phase.value === 'result')
const step3Done = computed(() => phase.value === 'result')

const canSubmitVerify = computed(
  () =>
    !!selectedFile.value &&
    !fileError.value &&
    uploadReady.value &&
    !localUploading.value &&
    phase.value === 'idle',
)

const uploadedBytesLabel = computed(() => {
  const f = selectedFile.value
  if (!f) return ''
  const n = Math.round((f.size * uploadProgress.value) / 100)
  return `${formatBytes(n)} / ${formatBytes(f.size)}`
})

function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  if (n >= 1024) return `${Math.round(n / 1024)} KB`
  return `${n} B`
}

function formatSize(bytes) {
  if (bytes == null) return '—'
  return formatBytes(bytes)
}

function formatNow() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 约 50% 为 true（通过）；优先用 crypto 取位，比连续 Math.random 更均匀 */
function drawBinaryResult() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint8Array(1)
      crypto.getRandomValues(buf)
      return (buf[0] & 1) === 1
    }
  } catch {
    /* 非安全上下文等 */
  }
  return Math.random() < 0.5
}

function openPicker() {
  if (localUploading.value) return
  fileInputRef.value?.click()
}

function onDropZoneClick(e) {
  if (localUploading.value) return
  const el = e.target
  if (el && typeof el.closest === 'function' && el.closest('.sig-file-clear')) return
  openPicker()
}

function onDropZoneKey() {
  if (localUploading.value) return
  openPicker()
}

function validateFile(file) {
  const max = 96 * 1024 * 1024
  if (file.size > max) return '文件超过 96 MB 上限'
  return ''
}

function onFileInput(e) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  const err = validateFile(f)
  fileError.value = err
  selectedFile.value = err ? null : f
  if (!err && f) beginLocalUpload()
}

function onDrop(e) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (!f) return
  const err = validateFile(f)
  fileError.value = err
  selectedFile.value = err ? null : f
  if (!err && f) beginLocalUpload()
}

function clearUploadInterval() {
  if (uploadIntervalId != null) {
    clearInterval(uploadIntervalId)
    uploadIntervalId = null
  }
}

function clearFile() {
  uploadJobId++
  clearUploadInterval()
  clearScanWait()
  selectedFile.value = null
  fileError.value = ''
  uploadProgress.value = 0
  uploadReady.value = false
  localUploading.value = false
}

function runLocalUploadProgress(durationMs) {
  return new Promise((resolve) => {
    clearUploadInterval()
    const start = Date.now()
    uploadIntervalId = setInterval(() => {
      const raw = Math.min(1, (Date.now() - start) / durationMs)
      const eased = 1 - (1 - raw) * (1 - raw)
      uploadProgress.value = Math.round(eased * 100)
      if (raw >= 1) {
        clearUploadInterval()
        uploadProgress.value = 100
        resolve()
      }
    }, 40)
  })
}

/** 选中合法文件后：模拟上传至平台，完成后才可提交验证 */
function beginLocalUpload() {
  const job = ++uploadJobId
  clearUploadInterval()
  uploadProgress.value = 0
  uploadReady.value = false
  localUploading.value = false
  if (!selectedFile.value) return

  localUploading.value = true
  /** 本地上传模拟时长（毫秒），略慢便于感知进度 */
  const dur = 2800 + Math.floor(Math.random() * 2600)
  runLocalUploadProgress(dur).then(() => {
    if (job !== uploadJobId) return
    localUploading.value = false
    uploadReady.value = true
  })
}

async function startVerify() {
  if (!canSubmitVerify.value) return

  phase.value = 'scanning'
  const scanMs = 1000 + Math.floor(Math.random() * 1000)
  await new Promise((resolve) => {
    clearScanWait()
    scanWaitTimerId = setTimeout(() => {
      scanWaitTimerId = null
      resolve()
    }, scanMs)
  })

  signaturePassed.value = drawBinaryResult()
  // 可信状态独立生成（可结合实际安全检查逻辑）
  trusted.value = drawBinaryResult()
  resultTimeText.value = formatNow()
  resultPanelKey.value += 1
  phase.value = 'result'

  // 落库：本次结果出现在「历史签名验证记录」中（页面不展示上次结果）。
  // 只落真实验证产生的字段 —— 用户上传的文件信息 + 本次验证结论，
  // 不再记录伪造的供应方 / 签名算法 / 指纹 / 哈希。
  addVerifyRecord({
    fileName: selectedFile.value?.name || '未命名文件',
    fileSize: selectedFile.value?.size || 0,
    signaturePassed: signaturePassed.value,
    trusted: trusted.value,
    verifiedAt: resultTimeText.value,
  })
  recordCount.value = getVerifyRecords().length
}

function resetFlow() {
  uploadJobId++
  clearUploadInterval()
  clearScanWait()
  phase.value = 'idle'
  signaturePassed.value = false
  trusted.value = false
  resultTimeText.value = ''
  selectedFile.value = null
  fileError.value = ''
  uploadProgress.value = 0
  uploadReady.value = false
  localUploading.value = false
}

onUnmounted(() => {
  uploadJobId++
  clearUploadInterval()
  clearScanWait()
})
</script>

<style scoped>
.sig-page {
  /* 主色沿用后台主题红（--admin-primary 同值），保证与平台其它页一致 */
  --sig-primary: #da203e;
  --sig-primary-soft: rgba(218, 32, 62, 0.1);
  --sig-primary-hover: #c11a35;
  --sig-text: #111827;
  --sig-text-sub: #374151;
  /* 次要文字色原为 #6b7280：在后台底色 #f4f5f7 上对比度仅 4.43，低于 WCAG AA 的 4.5。
     微调为 #626b78 后约 4.94，浅底与白底都达标，视觉上仍是明确的次要层级。 */
  --sig-muted: #626b78;
  --sig-border: #e5e7eb;
  --sig-border-soft: #eef1f5;
  --sig-card: #ffffff;
  /* 统一圆角 / 阴影 / 过渡，避免各处数值随手写导致观感不齐 */
  --sig-radius: 14px;
  --sig-radius-sm: 10px;
  --sig-shadow: 0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04);
  --sig-shadow-lg: 0 16px 40px rgba(17, 24, 39, 0.16);
  --sig-transition: 0.18s ease;
  /* 字号阶梯：收敛为 11 / 12 / 13 / 14 / 16 / 20 / 25 / 30 八档。
     原先散落 16 个值（含 11.5 / 13.5 / 14.5 这类半像素档），
     同级元素字号不一致会让版面显得「碎」而不整齐。 */
  --sig-fs-tiny: 11px;
  --sig-fs-caption: 12px;
  --sig-fs-body: 13px;
  --sig-fs-body-lg: 14px;
  --sig-fs-title: 16px;
  --sig-fs-title-lg: 20px;
  --sig-fs-page: 25px;
  /* 图标字形单独一档：选用「字符」当图标（✓ ⎗ ▣ 验）时，
     其字号随图标容器大小走，与正文字号无关，故不与上面文字阶梯混用。 */
  --sig-icon-sm: 15px;
  --sig-icon-md: 18px;
  --sig-icon-lg: 22px;
  --sig-icon-xl: 30px;
  /* 圆角三档：小方块 / 控件 / 卡片；另有 50%（圆形）与 999px（胶囊）两种形状值。 */
  --sig-radius-xs: 6px;
  max-width: 720px;
  margin: 0 auto;
}

.sig-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sig-border-soft);
}

.sig-title {
  margin: 0 0 8px;
  font-size: var(--sig-fs-page);
  font-weight: 700;
  color: var(--sig-text);
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.sig-lead {
  margin: 0;
  max-width: 520px;
  font-size: var(--sig-fs-body);
  line-height: 1.7;
  color: var(--sig-muted);
}

/* ===== 标题区右侧：历史记录入口 =====
   位于 .sig-hero 的右侧（原「验」字徽标位置），与左侧标题文案同一行。 */
.sig-hero-history {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: var(--sig-fs-body);
  /* 必须禁止换行：窄容器下按钮文字会逐字竖排（实测 390px 时成了 84×171 的竖条） */
  white-space: nowrap;
  transition:
    background var(--sig-transition),
    border-color var(--sig-transition),
    color var(--sig-transition);
}

.sig-hero-history:hover:not(:disabled) {
  border-color: var(--sig-primary);
  color: var(--sig-primary);
  background: var(--sig-primary-soft);
}

.sig-hero-history-count {
  min-width: 20px;
  padding: 0 6px;
  border-radius: var(--sig-radius-xs);
  background: var(--sig-primary-soft);
  color: var(--sig-primary);
  font-size: var(--sig-fs-caption);
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

/* ===== 记录结论横幅 =====
   仅历史记录详情视图使用。
   注：本块原为「上次验证结果面板」的样式，该面板已按需求移除；
   其中横幅（banner）部分被详情视图复用，故保留并把类名从 sig-last-*
   改为语义中性的 sig-hist-banner-*，面板专属类（卡片/收起按钮/字段列表）已删除。 */
.sig-hist-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--sig-radius-sm);
  margin-bottom: 14px;
}

.sig-hist-banner--ok {
  background: #f0fdf4;
  border: 1px solid #a7f3d0;
}

.sig-hist-banner--fail {
  background: #fffbeb;
  border: 1px solid #fcd34d;
}

.sig-hist-banner-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--sig-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sig-icon-sm);
  font-weight: 800;
  color: #fff;
}

.sig-hist-banner--ok .sig-hist-banner-icon {
  background: #10b981;
}

.sig-hist-banner--fail .sig-hist-banner-icon {
  background: #f59e0b;
}

.sig-hist-banner-body {
  min-width: 0;
  flex: 1;
}

.sig-hist-banner-file {
  margin: 0 0 3px;
  font-size: var(--sig-fs-body-lg);
  font-weight: 600;
  color: var(--sig-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-hist-banner-time {
  margin: 0;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  font-variant-numeric: tabular-nums;
}

.sig-steps {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0 0 18px;
  padding: 11px 14px;
  /* 步骤条弱化为「浅底 + 细边」，不再用纯白卡片，避免与上传卡争夺视觉重量 */
  background: #fafbfc;
  border: 1px solid var(--sig-border-soft);
  border-radius: var(--sig-radius-sm);
  gap: 0;
}

.sig-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  min-width: 0;
}

@media (min-width: 560px) {
  .sig-step {
    font-size: var(--sig-fs-body);
    gap: 8px;
  }
}

.sig-step.is-active {
  color: #374151;
  font-weight: 600;
}

.sig-step.is-done .sig-step-idx {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
  font-size: var(--sig-fs-tiny);
}

.sig-step-idx {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--sig-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sig-fs-tiny);
  font-weight: 700;
  background: #fff;
  color: var(--sig-muted);
  flex-shrink: 0;
}

.sig-step.is-active .sig-step-idx {
  border-color: var(--sig-primary);
  color: var(--sig-primary);
}

.sig-step-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sig-step-line {
  flex: 1;
  height: 2px;
  background: var(--sig-border);
  margin: 0 6px;
  min-width: 12px;
}

.sig-step-line.is-active {
  background: linear-gradient(90deg, var(--sig-primary-soft), var(--sig-primary));
  opacity: 0.55;
}

.sig-card {
  background: var(--sig-card);
  border: 1px solid var(--sig-border);
  border-radius: var(--sig-radius);
  padding: 22px 24px 24px;
  box-shadow: var(--sig-shadow);
}

.sig-card-title {
  margin: 0 0 6px;
  font-size: var(--sig-fs-title);
  font-weight: 600;
  color: var(--sig-text);
  letter-spacing: -0.01em;
}

.sig-card-desc {
  margin: 0 0 16px;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  line-height: 1.6;
}

.sig-drop {
  position: relative;
  border: 2px dashed #d5dae1;
  border-radius: var(--sig-radius-sm);
  min-height: 176px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color var(--sig-transition),
    background var(--sig-transition);
  background: #fafbfc;
}

.sig-drop:hover,
.sig-drop.is-drag {
  border-color: var(--sig-primary);
  background: var(--sig-primary-soft);
}

.sig-drop:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 2px;
}

.sig-drop.has-file {
  border-style: solid;
  border-color: var(--sig-border);
  background: #fff;
  cursor: default;
}

.sig-drop.is-busy {
  cursor: wait;
  pointer-events: none;
}

.sig-drop.is-busy .sig-file-clear {
  pointer-events: auto;
  cursor: pointer;
}

.sig-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.sig-drop-empty {
  text-align: center;
  padding: 22px 20px;
}

.sig-drop-icon {
  display: block;
  font-size: var(--sig-icon-xl);
  line-height: 1;
  color: #b9c2cd;
  margin-bottom: 12px;
}

.sig-drop-title {
  margin: 0 0 6px;
  font-size: var(--sig-fs-body-lg);
  font-weight: 600;
  color: var(--sig-text-sub);
}

.sig-drop-hint {
  margin: 0;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  line-height: 1.6;
}

.sig-drop-file {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px 20px;
}

.sig-file-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--sig-radius-sm);
  background: var(--sig-primary-soft);
  color: var(--sig-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sig-icon-md);
  flex-shrink: 0;
}

.sig-file-meta {
  flex: 1;
  min-width: 0;
}

.sig-file-name {
  margin: 0 0 4px;
  font-size: var(--sig-fs-body-lg);
  font-weight: 600;
  color: var(--sig-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-file-size {
  margin: 0;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
}

.sig-file-clear {
  flex-shrink: 0;
  border: 1px solid var(--sig-border);
  background: #fff;
  border-radius: var(--sig-radius-xs);
  padding: 7px 13px;
  font-size: var(--sig-fs-caption);
  font-weight: 600;
  cursor: pointer;
  color: var(--sig-text-sub);
  font-family: inherit;
  transition:
    background var(--sig-transition),
    border-color var(--sig-transition),
    color var(--sig-transition);
}

.sig-file-clear:hover {
  background: var(--sig-primary-soft);
  border-color: var(--sig-primary);
  color: var(--sig-primary);
}

.sig-file-upload-below {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.sig-file-upload-status {
  margin: 0 0 10px;
  font-size: var(--sig-fs-body);
  color: var(--sig-muted);
}

.sig-file-upload-status--ok {
  margin-bottom: 0;
  color: #059669;
  font-weight: 600;
}

.sig-progress-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.sig-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f87171, var(--sig-primary));
  transition: width 0.08s linear;
}

.sig-error {
  margin: 14px 0 0;
  font-size: var(--sig-fs-body);
  color: #b91c1c;
}

.sig-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.sig-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--sig-radius-sm);
  padding: 9px 18px;
  font-size: var(--sig-fs-body);
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  /* 禁止换行：否则窄容器下按钮文字会逐字竖排（实测「提交验证」成了 44×88） */
  white-space: nowrap;
  transition:
    background var(--sig-transition),
    border-color var(--sig-transition),
    color var(--sig-transition),
    box-shadow var(--sig-transition);
}

.sig-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sig-btn:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 2px;
}

.sig-btn--ghost {
  background: #fff;
  border-color: var(--sig-border);
  color: var(--sig-text-sub);
}

.sig-btn--ghost:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d5dae1;
}

.sig-btn--primary {
  background: var(--sig-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.28);
}

.sig-btn--primary:hover:not(:disabled) {
  background: var(--sig-primary-hover);
  box-shadow: 0 4px 12px rgba(218, 32, 62, 0.32);
}

.sig-card--progress {
  text-align: center;
}

.sig-progress-block {
  padding: 8px 0 4px;
}

.sig-wait-visual--inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.sig-orbit {
  position: relative;
  width: 72px;
  height: 72px;
}

.sig-orbit-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--sig-border);
  border-top-color: var(--sig-primary);
  border-radius: 50%;
  animation: sig-spin 0.9s linear infinite;
}

.sig-orbit-core {
  position: absolute;
  inset: 18px;
  background: radial-gradient(circle at 30% 30%, #fecaca, var(--sig-primary));
  border-radius: 50%;
  opacity: 0.9;
  animation: sig-pulse 1.4s ease-in-out infinite;
}

@keyframes sig-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes sig-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

.sig-wait-file {
  margin: 0;
  font-size: var(--sig-fs-body);
  color: var(--sig-muted);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: var(--sig-fs-caption);
  font-weight: 600;
  color: var(--sig-primary);
}

.sig-progress-bytes {
  font-weight: 500;
  color: var(--sig-muted);
}

.sig-result-banner {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px 20px;
  border-radius: var(--sig-radius);
  margin-bottom: 18px;
}

.sig-result-banner--ok {
  background: #f2fbf6;
  border: 1px solid #b7e8cd;
}

.sig-result-banner--fail {
  background: #fdf9ef;
  border: 1px solid #f3d99a;
}

.sig-result-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: var(--sig-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sig-icon-lg);
  font-weight: 800;
}

.sig-result-banner--ok .sig-result-icon {
  background: #10b981;
  color: #fff;
}

.sig-result-banner--fail .sig-result-icon {
  background: #f59e0b;
  color: #fff;
}

.sig-result-heading {
  margin: 0 0 5px;
  font-size: var(--sig-fs-title);
  font-weight: 700;
  color: var(--sig-text);
  letter-spacing: -0.01em;
}

.sig-result-sub {
  margin: 0;
  font-size: var(--sig-fs-caption);
  line-height: 1.6;
  color: var(--sig-muted);
}

.sig-status-tag {
  display: inline-block;
  padding: 2px 9px;
  border-radius: var(--sig-radius-xs);
  font-size: var(--sig-fs-caption);
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
}

.sig-status-tag--ok {
  background: #e7f8ef;
  color: #0f7a4a;
}

.sig-status-tag--fail {
  background: #fdecec;
  color: #b42424;
}

.sig-result-dl {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--sig-border);
}

.sig-result-row {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sig-border-soft);
  font-size: var(--sig-fs-body);
}

.sig-result-row dt {
  margin: 0;
  color: var(--sig-muted);
  font-weight: 500;
}

.sig-result-row dd {
  margin: 0;
  color: var(--sig-text-sub);
  word-break: break-all;
}

/* ===== 历史记录弹窗 ===== */
.sig-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.45);
}

.sig-modal-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  max-height: min(78vh, 680px);
  background: #fff;
  border-radius: var(--sig-radius);
  box-shadow: var(--sig-shadow-lg);
  overflow: hidden;
}

.sig-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--sig-border-soft);
}

.sig-modal-head-text {
  min-width: 0;
}

.sig-modal-title {
  margin: 0 0 4px;
  font-size: var(--sig-fs-title);
  font-weight: 700;
  color: var(--sig-text);
  letter-spacing: -0.01em;
}

.sig-modal-sub {
  margin: 0;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-modal-close {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--sig-radius-xs);
  background: transparent;
  color: var(--sig-muted);
  font-size: var(--sig-fs-title-lg);
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
  transition:
    background var(--sig-transition),
    color var(--sig-transition);
}

.sig-modal-close:hover {
  background: #f3f4f6;
  color: var(--sig-text-sub);
}

.sig-modal-close:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 2px;
}

.sig-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 22px 4px;
}

.sig-modal-empty {
  margin: 28px 0;
  text-align: center;
  font-size: var(--sig-fs-body);
  color: var(--sig-muted);
  line-height: 1.7;
}

/* --- 列表 --- */
.sig-hist-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sig-hist-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sig-border-soft);
  transition: background var(--sig-transition);
}

.sig-hist-item:hover {
  background: #fafbfc;
}

.sig-hist-mark {
  width: 24px;
  height: 24px;
  border-radius: var(--sig-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--sig-fs-caption);
  font-weight: 800;
  color: #fff;
}

.sig-hist-mark--ok {
  background: #10b981;
}

.sig-hist-mark--fail {
  background: #f59e0b;
}

.sig-hist-main {
  min-width: 0;
}

.sig-hist-file {
  margin: 0 0 3px;
  font-size: var(--sig-fs-body);
  font-weight: 600;
  color: var(--sig-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-hist-meta {
  margin: 0;
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-hist-sep {
  margin: 0 6px;
  opacity: 0.55;
}

.sig-hist-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.sig-hist-detail {
  flex-shrink: 0;
  border: 1px solid var(--sig-border);
  background: #fff;
  border-radius: var(--sig-radius-xs);
  padding: 5px 12px;
  font-size: var(--sig-fs-caption);
  font-weight: 600;
  font-family: inherit;
  color: var(--sig-text-sub);
  cursor: pointer;
  transition:
    background var(--sig-transition),
    border-color var(--sig-transition),
    color var(--sig-transition);
}

.sig-hist-detail:hover {
  border-color: var(--sig-primary);
  color: var(--sig-primary);
  background: var(--sig-primary-soft);
}

.sig-hist-detail:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 2px;
}

/* --- 分页栏 ---
   口径与平台其它列表页一致（左侧总数、中间页码、右侧每页条数），
   视觉沿用本页设计令牌，与已重做的样式保持同一套圆角/字号/主色。 */
.sig-pager {
  display: flex;
  align-items: center;
  gap: 6px;
  /* 列表每行自带 border-bottom，末行已起到分隔作用；
     此处不再加 border-top，避免两条线叠在一起 */
  padding: 12px 0 2px;
}

.sig-pager-total {
  font-size: var(--sig-fs-caption);
  color: var(--sig-muted);
  font-variant-numeric: tabular-nums;
  margin-right: auto;
}

.sig-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--sig-border);
  border-radius: var(--sig-radius-xs);
  background: #fff;
  font-family: inherit;
  font-size: var(--sig-fs-caption);
  color: var(--sig-text-sub);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background var(--sig-transition),
    border-color var(--sig-transition),
    color var(--sig-transition);
}

.sig-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: var(--sig-primary);
  color: var(--sig-primary);
}

.sig-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sig-page-btn:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 2px;
}

.sig-page-btn.is-active {
  background: var(--sig-primary);
  border-color: var(--sig-primary);
  color: #fff;
}

/* 每页条数：SearchSelect 在分页栏里按控件宽度收窄，与页码按钮等高 */
.sig-pager-size {
  width: 96px;
  flex-shrink: 0;
  margin-left: 4px;
  border: 1px solid var(--sig-border);
  border-radius: var(--sig-radius-xs);
  height: 28px;
  padding: 0 8px;
  box-sizing: border-box;
}

/* --- 详情 --- */
.sig-detail-dl {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--sig-border-soft);
}

.sig-detail-row {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sig-border-soft);
  font-size: var(--sig-fs-body);
}

.sig-detail-row dt {
  margin: 0;
  color: var(--sig-muted);
  font-weight: 500;
}

.sig-detail-row dd {
  margin: 0;
  color: var(--sig-text-sub);
  overflow-wrap: anywhere;
}

/* --- 底部 --- */
.sig-modal-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px 18px;
  border-top: 1px solid var(--sig-border);
}

.sig-modal-foot-spacer {
  flex: 1;
}

.sig-btn--danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.sig-btn--danger:hover:not(:disabled) {
  background: #fef2f2;
}

/* 窄屏：列表收起标签，避免挤压文件名 */
@media (max-width: 640px) {
  .sig-hist-item {
    grid-template-columns: 26px minmax(0, 1fr) auto;
  }

  .sig-hist-tags {
    display: none;
  }
}

/* ===== 窄屏适配 =====
   背景：本页位于后台栅格里，窄屏时侧栏仍占 220px（平台既有行为，非本页可控），
   留给内容的宽度会很小（390px 视口下约 122px）。此处按内容可用宽度收紧间距，
   保证极小宽度下仍可读、不出现文字竖排或元素错位。 */
@media (max-width: 720px) {
  .sig-hero {
    /* 标题区改为纵排：横排时右侧的历史入口按钮会把标题文案挤没 */
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
    padding-bottom: 16px;
  }

  .sig-title {
    font-size: var(--sig-fs-title-lg);
  }

  .sig-lead {
    font-size: var(--sig-fs-caption);
    line-height: 1.65;
  }

  .sig-card {
    padding: 16px 14px 18px;
    border-radius: var(--sig-radius-sm);
  }

  .sig-drop {
    min-height: 148px;
  }

  .sig-drop-empty {
    padding: 18px 12px;
  }

  .sig-drop-file {
    padding: 14px 12px;
    gap: 10px;
  }

  .sig-file-clear {
    padding: 6px 10px;
    font-size: var(--sig-fs-caption);
  }

  .sig-steps {
    padding: 9px 8px;
  }

  /* 步骤标签在极窄时也可省略号收尾（已有 overflow 规则），此处只收紧字号 */
  .sig-step-label {
    font-size: var(--sig-fs-caption);
  }

  .sig-actions {
    gap: 8px;
  }

  .sig-btn {
    padding: 8px 13px;
    font-size: var(--sig-fs-caption);
  }

  /* 结果区与详情：标签列收窄，给数值留更多空间 */
  .sig-result-row,
  .sig-detail-row {
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 10px;
    font-size: var(--sig-fs-caption);
  }

  .sig-modal {
    padding: 12px;
  }

  .sig-modal-panel {
    max-height: calc(100vh - 24px);
  }

  .sig-modal-head {
    padding: 14px 14px 12px;
  }

  .sig-modal-body {
    padding: 4px 14px 2px;
  }

  .sig-modal-foot {
    padding: 12px 14px 14px;
    gap: 8px;
  }

  .sig-hist-item {
    gap: 8px;
  }
}

/* ===== 极窄屏（≤480px）：横排放不下，改纵向堆叠 =====
   本页在后台栅格内，390px 视口时内容区仅约 122px。
   此时「三步横排」会把步骤标签压到 0 宽、「两按钮横排」会让按钮文字逐字竖排，
   故改为纵向堆叠，各占整行。 */
@media (max-width: 480px) {
  .sig-steps {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px;
  }

  /* 横排连接线在纵排下失去意义，隐藏 */
  .sig-step-line {
    display: none;
  }

  .sig-step {
    gap: 8px;
  }

  .sig-step-label {
    /* 纵排后每步独占一行，此时不再需要省略号收尾 */
    font-size: var(--sig-fs-caption);
  }

  /* 主操作放最前（DOM 中「提交验证」在后，故用 column-reverse） */
  .sig-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .sig-actions .sig-btn {
    width: 100%;
  }

  .sig-modal-foot {
    flex-wrap: wrap;
  }

  .sig-modal-foot .sig-btn {
    flex: 1;
  }
}
</style>
