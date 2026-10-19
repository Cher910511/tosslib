<template>
  <div class="sig-page">
    <header class="sig-hero">
      <!-- 标题与小字同排：小字改为动作说明并紧贴标题右侧，基线对齐；
           历史记录按钮放在同一行的最右端（.sig-hero 用 flex + space-between）。 -->
      <div class="sig-hero-text">
        <h1 class="sig-title">签名认证</h1>
        <p class="sig-lead">上传待验证的源码包或组件包，查验签名的有效性</p>
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
            <!-- 副标题只在列表视图显示（条数说明）。
                 详情视图下原本重复显示文件名，与下方横幅里的文件名重复，已按要求去掉。 -->
            <p v-if="!detailRecord" class="sig-modal-sub">
              共 {{ historyList.length }} 条记录，按验证时间倒序
            </p>
          </div>
          <button type="button" class="sig-modal-close" aria-label="关闭" @click="closeHistory">×</button>
        </header>

        <!-- 视图一：列表 -->
        <div v-if="!detailRecord" class="sig-modal-body">
          <!-- 搜索框：按文件名过滤。仅在存在记录时显示 —— 一条都没有时搜索无意义。 -->
          <div v-if="historyList.length" class="sig-hist-search">
            <svg class="sig-search-icon" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M10.4 10.4 L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <input
              v-model="keyword"
              type="text"
              class="sig-search-input"
              placeholder="搜索文件名"
              aria-label="按文件名搜索验证记录"
              autocomplete="off"
            />
            <!-- 有关键字时才出现清空按钮，避免常态多一个无效控件 -->
            <button
              v-if="keyword"
              type="button"
              class="sig-search-clear"
              aria-label="清空搜索"
              @click="clearKeyword"
            >
              ×
            </button>
          </div>

          <!-- 三种空态：无记录 / 搜索无匹配 / 正常列表 -->
          <p v-if="!historyList.length" class="sig-modal-empty">
            暂无历史验证记录。上传文件并提交验证后，记录会自动出现在这里。
          </p>
          <p v-else-if="!filteredHistory.length" class="sig-modal-empty">
            未找到文件名含「{{ keyword.trim() }}」的记录，请换个关键字试试。
          </p>
          <ul v-else class="sig-hist-list">
            <!-- 整行点击即进详情（原先行尾有个「详情」按钮，已按要求去掉）。
                 li 本身不可聚焦，故补 role=button + tabindex + 键盘事件，保证键盘可达。 -->
            <li
              v-for="rec in pagedHistory"
              :key="rec.id"
              class="sig-hist-item"
              role="button"
              tabindex="0"
              :aria-label="`查看「${rec.fileName}」的验证详情`"
              @click="openRecordDetail(rec)"
              @keydown.enter.prevent="openRecordDetail(rec)"
              @keydown.space.prevent="openRecordDetail(rec)"
            >
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
            </li>
          </ul>

          <!-- 分页栏：口径与平台其它列表页一致（默认 10 条/页，可切 10/20/50）。
               条件用 filteredHistory：搜索无匹配时不应出现「第 0-0 条」这种空分页栏；
               总数用 filteredCount（过滤后条数），否则搜索命中 2 条却显示「共 24 条」。 -->
          <div v-if="filteredHistory.length" class="sig-pager">
            <span class="sig-pager-total">
              第 {{ pageRange.from }}-{{ pageRange.to }} 条 / 共 {{ filteredCount }} 条
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
              <!-- 文件名下方原有一行验证时间，已按要求去掉：
                   验证时间在下方字段列表里已有独立一行，此处属重复展示。 -->
              <p class="sig-hist-banner-file">{{ detailRecord.fileName }}</p>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

/* ===== 历史列表搜索 =====
   按文件名过滤（不区分大小写）。搜索只影响弹窗内的列表展示：
   - 入口角标 recordCount 仍是总记录数，不随搜索变化
   - 列表里的「共 N 条」显示的是过滤后的数量，避免搜索结果数与提示不一致 */
/** 搜索关键字（仅作用于历史列表） */
const keyword = ref('')
/** 过滤后的记录（未输入关键字时等于全量） */
const filteredHistory = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return historyList.value
  return historyList.value.filter((r) => String(r.fileName || '').toLowerCase().includes(kw))
})
/** 是否处于搜索态（用于空态文案区分「无记录」与「无匹配」） */
const searching = computed(() => keyword.value.trim().length > 0)

/* ===== 历史列表分页 =====
   与平台其它列表页一致的口径：默认 10 条/页，可切 10 / 20 / 50，
   时间倒序后按页切片展示；页码窗口最多 5 个。
   分页基于 filteredHistory（搜索结果），而非全量 historyList。 */
const page = ref(1)
const pageSize = ref(10)
/** 当前页的记录（过滤后按页切片） */
const pagedHistory = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredHistory.value.slice(start, start + pageSize.value)
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / pageSize.value)))
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
  if (!filteredHistory.value.length) return { from: 0, to: 0 }
  const from = (page.value - 1) * pageSize.value + 1
  return { from, to: Math.min(page.value * pageSize.value, filteredHistory.value.length) }
})
/** 过滤后条数（模板「共 N 条」用；搜索时与结果一致） */
const filteredCount = computed(() => filteredHistory.value.length)

/** 搜索关键字变化：回到第 1 页，否则可能停留在已不存在的页码上而显示空白 */
watch(keyword, () => {
  page.value = 1
})

/** 清空搜索关键字 */
function clearKeyword() {
  keyword.value = ''
}

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
  /* 按钮靠最右，标题+小字在左 */
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sig-border-soft);
}

/* 标题与小字同一行：横向排列、基线对齐（字号不同时基线对齐才不显得错位）。
   min-width:0 让长文案可收缩，配合 .sig-lead 的省略号，避免把右侧按钮挤出容器。 */
.sig-hero-text {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.sig-title {
  margin: 0;
  font-size: var(--sig-fs-page);
  font-weight: 700;
  color: var(--sig-text);
  letter-spacing: -0.02em;
  line-height: 1.25;
  /* 标题不换行、不被压缩 */
  flex-shrink: 0;
  white-space: nowrap;
}

.sig-lead {
  margin: 0;
  font-size: var(--sig-fs-body);
  line-height: 1.7;
  color: var(--sig-muted);
  /* 与标题同排时不再限宽，改为可收缩 + 超长省略，保证按钮始终贴右 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  /* 下行的验证时间已去掉，故不再需要 3px 下间距 */
  margin: 0;
  font-size: var(--sig-fs-body-lg);
  font-weight: 600;
  color: var(--sig-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 注：原 .sig-hist-banner-time（横幅内文件名下的验证时间）样式已随之删除 ——
   该行已按要求去掉，验证时间在下方字段列表里有独立一行。 */

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
/* --- 搜索框：按文件名过滤 ---
   位置固定在列表上方（.sig-modal-body 内第一个元素），不随列表滚动 ——
   body 本身是滚动容器，故给搜索框加吸顶与底色，滚列表时不会与行内容重叠。 */
.sig-hist-search {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  /* 与 .sig-hist-item 用同一组负外边距 + 内边距：
     列表行是 margin:0 -8px / padding:12px 8px，若搜索框不加同样的 -8px，
     其白底会比行窄 16px，吸顶滚动时行内容会从两侧透出来（实测框 676px / 行 692px）。
     内边距补回 8px 保证框内内容与行内容左对齐。 */
  padding: 8px 8px 10px;
  margin: 0 -8px 2px;
  background: #fff;
  border-bottom: 1px solid var(--sig-border-soft);
}

.sig-search-icon {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  color: var(--sig-muted);
}

.sig-search-input {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--sig-fs-body);
  color: var(--sig-text);
  outline: none;
}

.sig-search-input::placeholder {
  color: #9aa4b2;
}

/* 清空按钮：仅在有关键字时出现 */
.sig-search-clear {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #eceff3;
  color: var(--sig-text-sub);
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--sig-transition),
    color var(--sig-transition);
}

.sig-search-clear:hover {
  background: #dfe4ea;
  color: var(--sig-text);
}

.sig-search-clear:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: 1px;
}

.sig-hist-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 列表行：整行可点击进详情（原行尾「详情」按钮已去掉），故：
   - 网格由 4 列收为 3 列（标记 / 主体 / 标签）
   - 左右补内边距并加负外边距，让 hover 底色铺满而不改变行内对齐
   - cursor: pointer 明确可点，hover 底色加深以示可交互 */
.sig-hist-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  margin: 0 -8px;
  border-bottom: 1px solid var(--sig-border-soft);
  cursor: pointer;
  transition: background var(--sig-transition);
}

.sig-hist-item:hover {
  background: #f5f8fc;
}

/* 键盘聚焦时给出与 hover 同等的可见反馈（整行是 role=button） */
.sig-hist-item:focus-visible {
  outline: 2px solid var(--sig-primary);
  outline-offset: -2px;
  background: #f5f8fc;
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

/* 注：原先此处有 .sig-hist-detail（行尾「详情」按钮）三组样式，
   按钮已按要求去掉、改为整行点击，样式随之删除。 */

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

/* 窄屏：列表收起标签，避免挤压文件名。
   标签一隐藏，第三列就没有内容了 —— 若仍保留 3 条轨道，会多出一条 0 宽轨道
   外加 12px 列间距（白白占宽），故这里直接降为 2 列。 */
@media (max-width: 640px) {
  .sig-hist-item {
    grid-template-columns: 26px minmax(0, 1fr);
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
    /* 纵排后按钮不再贴右，改为跟随文字左对齐 */
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
    padding-bottom: 16px;
  }

  /* 标题与小字也回到纵排：窄屏宽度放不下两个并排文本块，
     继续横排会触发 .sig-lead 的省略号，把说明文字截成半句。 */
  .sig-hero-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .sig-title {
    font-size: var(--sig-fs-title-lg);
  }

  .sig-lead {
    font-size: var(--sig-fs-caption);
    line-height: 1.65;
    /* 纵排后允许换行，避免说明被省略号截断 */
    white-space: normal;
    overflow: visible;
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

  /* 极窄屏（本页在后台栅格内，390px 视口时内容区仅约 122px）：
     历史入口按钮的「查看历史记录 + 角标」在 13px 字号下需约 134px，会溢出容器被裁
     （实测按钮 134px / 容器 122px）。此处收紧字号与内边距使其适配；
     max-width 兜底，避免不同字体渲染下再次溢出。 */
  .sig-hero-history {
    font-size: 11.5px;
    padding: 6px 8px;
    gap: 5px;
    max-width: 100%;
  }

  .sig-hero-history-count {
    min-width: 15px;
    padding: 0 3px;
    font-size: 10px;
    line-height: 15px;
  }

  /* 搜索框在极窄屏收紧：390px 视口时弹窗内容区仅约 94px，
     图标 15 + 两处 gap 8 + 清空按钮 20 会占掉 51px，输入框只剩约 43px，
     placeholder 完全显示不下。故缩小图标与间距、清空按钮一并收窄。 */
  .sig-hist-search {
    gap: 5px;
    padding: 6px 0 8px;
  }

  .sig-search-icon {
    width: 12px;
    height: 12px;
  }

  .sig-search-input {
    height: 26px;
    font-size: var(--sig-fs-caption);
  }

  .sig-search-clear {
    width: 17px;
    height: 17px;
    font-size: 12px;
  }
}
</style>
