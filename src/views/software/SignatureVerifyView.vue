<template>
  <div class="sig-page">
    <header class="sig-hero">
      <div class="sig-hero-text">
        <h1 class="sig-title">签名认证</h1>
        <p class="sig-lead">上传待验证的源码包或组件包，通过签名校验验证下载来源真实性，并结合安全检测评估软件可信度。</p>
      </div>
      <div class="sig-hero-badge" aria-hidden="true">
        <span class="sig-hero-badge-inner">验</span>
      </div>
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

    <section v-show="phase === 'idle'" class="sig-card" aria-labelledby="sig-upload-title">
      <h2 id="sig-upload-title" class="sig-card-title">上传文件</h2>
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
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

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
  --sig-primary: #da203e;
  --sig-primary-soft: rgba(218, 32, 62, 0.1);
  --sig-text: #111827;
  --sig-muted: #6b7280;
  --sig-border: #e5e7eb;
  --sig-card: #ffffff;
  max-width: 720px;
  margin: 0 auto;
}

.sig-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.sig-title {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 700;
  color: var(--sig-text);
  letter-spacing: -0.02em;
}

.sig-lead {
  margin: 0;
  max-width: 520px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--sig-muted);
}

.sig-hero-badge {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(145deg, #fef2f2, #fff);
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(218, 32, 62, 0.12);
}

.sig-hero-badge-inner {
  font-size: 18px;
  font-weight: 800;
  color: var(--sig-primary);
}

.sig-steps {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0 0 20px;
  padding: 12px 12px;
  background: var(--sig-card);
  border: 1px solid var(--sig-border);
  border-radius: 12px;
  gap: 0;
}

.sig-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sig-muted);
  min-width: 0;
}

@media (min-width: 560px) {
  .sig-step {
    font-size: 13px;
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
  font-size: 11px;
}

.sig-step-idx {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--sig-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
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
  border-radius: 14px;
  padding: 22px 24px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.sig-card-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--sig-text);
}

.sig-card-desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--sig-muted);
  line-height: 1.55;
}

.sig-drop {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  background: #fafafa;
}

.sig-drop:hover,
.sig-drop.is-drag {
  border-color: var(--sig-primary);
  background: #fff5f5;
}

.sig-drop.has-file {
  border-style: solid;
  border-color: var(--sig-border);
  background: #fff;
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
  padding: 20px;
}

.sig-drop-icon {
  display: block;
  font-size: 36px;
  color: #d1d5db;
  margin-bottom: 8px;
}

.sig-drop-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.sig-drop-hint {
  margin: 0;
  font-size: 12px;
  color: var(--sig-muted);
  line-height: 1.5;
}

.sig-drop-file {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
}

.sig-file-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--sig-primary-soft);
  color: var(--sig-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.sig-file-meta {
  flex: 1;
  min-width: 0;
}

.sig-file-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sig-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig-file-size {
  margin: 0;
  font-size: 12px;
  color: var(--sig-muted);
}

.sig-file-clear {
  flex-shrink: 0;
  border: 1px solid var(--sig-border);
  background: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}

.sig-file-clear:hover {
  background: #f3f4f6;
}

.sig-file-upload-below {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.sig-file-upload-status {
  margin: 0 0 10px;
  font-size: 13px;
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
  font-size: 13px;
  color: #b91c1c;
}

.sig-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.sig-btn {
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.sig-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sig-btn--ghost {
  background: #fff;
  border: 1px solid var(--sig-border);
  color: #374151;
}

.sig-btn--ghost:hover:not(:disabled) {
  background: #f9fafb;
}

.sig-btn--primary {
  background: var(--sig-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.35);
}

.sig-btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
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
  font-size: 13px;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--sig-primary);
}

.sig-progress-bytes {
  font-weight: 500;
  color: var(--sig-muted);
}

.sig-result-banner {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 18px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.sig-result-banner--ok {
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border: 1px solid #a7f3d0;
}

.sig-result-banner--fail {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fcd34d;
}

.sig-result-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
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
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--sig-text);
}

.sig-result-sub {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--sig-muted);
}

.sig-status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.sig-status-tag--ok {
  background: #dcfce7;
  color: #16a34a;
}

.sig-status-tag--fail {
  background: #fee2e2;
  color: #dc2626;
}

.sig-result-dl {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--sig-border);
}

.sig-result-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.sig-result-row dt {
  margin: 0;
  color: var(--sig-muted);
  font-weight: 500;
}

.sig-result-row dd {
  margin: 0;
  color: #374151;
  word-break: break-all;
}
</style>
