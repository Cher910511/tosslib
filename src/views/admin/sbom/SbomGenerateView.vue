<template>
  <div class="sbom-gen">
    <div class="sbg-page-hd">
      <h1 class="sbg-title">SBOM 生成</h1>
      <p class="sbg-desc">上传源码包，选择 SBOM 标准与输出格式，自动解析依赖并生成软件物料清单。</p>
    </div>

    <!-- 表单 -->
    <form class="sbg-card" @submit.prevent="handleSubmit">
      <!-- 源码包上传 -->
      <div class="sbg-field">
        <label class="sbg-label">
          源码包上传
          <span class="sbg-req">*</span>
        </label>
        <p class="sbg-hint">支持 .tar.gz / .tgz / .zip / .tar 格式，单个文件不超过 500 MB</p>

        <div
          class="sbg-drop"
          :class="{ 'is-drag': dragging, 'has-file': upload.file }"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".tar.gz,.tgz,.zip,.tar,.gz"
            hidden
            @change="handleFileChange"
          />
          <template v-if="!upload.file">
            <span class="sbg-drop-ico">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </span>
            <p class="sbg-drop-main">点击选择文件，或将源码包拖拽到此处</p>
            <p class="sbg-drop-sub">支持 tar.gz、tgz、zip、tar 格式</p>
          </template>
          <template v-else>
            <span class="sbg-file-ico">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
            </span>
            <div class="sbg-file-info">
              <p class="sbg-file-name">{{ upload.file.name }}</p>
              <p class="sbg-file-size">{{ upload.fileSize }}</p>
            </div>
            <button type="button" class="sbg-file-del" @click.stop="clearFile">移除</button>
          </template>
        </div>
      </div>

      <!-- 软件名称 / 版本 -->
      <div class="sbg-row">
        <div class="sbg-field">
          <label class="sbg-label" for="sbg-name">软件名称</label>
          <input id="sbg-name" v-model="upload.name" type="text" class="sbg-input" placeholder="如 tosslib-web" />
        </div>
        <div class="sbg-field">
          <label class="sbg-label" for="sbg-version">版本号</label>
          <input id="sbg-version" v-model="upload.version" type="text" class="sbg-input" placeholder="如 1.2.0" />
        </div>
      </div>

      <!-- SBOM 标准 -->
      <div class="sbg-field">
        <label class="sbg-label">SBOM 标准</label>
        <div class="sbg-options">
          <label
            v-for="opt in SPEC_OPTIONS"
            :key="opt.value"
            class="sbg-option"
            :class="{ 'is-active': form.spec === opt.value }"
          >
            <input v-model="form.spec" type="radio" name="sbom-spec" :value="opt.value" hidden />
            <span class="sbg-option-title">{{ opt.label }}</span>
            <span class="sbg-option-desc">{{ opt.desc }}</span>
          </label>
        </div>
      </div>

      <!-- 输出格式 -->
      <div class="sbg-field">
        <label class="sbg-label">输出格式</label>
        <p class="sbg-hint">可多选，一次生成多种格式的物料清单</p>
        <div class="sbg-formats">
          <label
            v-for="fmt in availableFormats"
            :key="fmt.value"
            class="sbg-format"
            :class="{ 'is-active': form.formats.includes(fmt.value) }"
          >
            <input v-model="form.formats" type="checkbox" :value="fmt.value" hidden />
            <span class="sbg-format-check">✓</span>
            <span class="sbg-format-name">{{ fmt.label }}</span>
            <span class="sbg-format-ext">.{{ fmt.ext }}</span>
          </label>
        </div>
      </div>

      <!-- 选项 -->
      <div class="sbg-field">
        <label class="sbg-label">生成选项</label>
        <div class="sbg-switches">
          <label class="sbg-switch">
            <input v-model="form.withLicense" type="checkbox" hidden />
            <span class="sbg-switch-box" />
            <span class="sbg-switch-text">
              许可证分析
              <small>识别组件许可证并检测冲突</small>
            </span>
          </label>
          <label class="sbg-switch">
            <input v-model="form.withVuln" type="checkbox" hidden />
            <span class="sbg-switch-box" />
            <span class="sbg-switch-text">
              漏洞关联
              <small>匹配 CVE / NVD 漏洞库</small>
            </span>
          </label>
        </div>
      </div>

      <!-- 提交 -->
      <div class="sbg-actions">
        <span v-if="errorMsg" class="sbg-error">{{ errorMsg }}</span>
        <span v-else-if="form.formats.length === 0" class="sbg-error">请至少选择一种输出格式</span>
        <span v-else class="sbg-actions-hint">将生成 {{ form.formats.length }} 种格式的 SBOM 文件</span>
        <button
          type="submit"
          class="sbg-submit"
          :disabled="!canSubmit || generating"
        >
          <span v-if="generating" class="sbg-spinner" />
          {{ generating ? '生成中…' : '开始生成' }}
        </button>
      </div>
    </form>

    <!-- 生成结果 -->
    <Transition name="sbg-fade">
      <div v-if="lastRecord" class="sbg-result">
        <div class="sbg-result-hd">
          <span class="sbg-result-badge">✓ 生成完成</span>
          <span class="sbg-result-id">{{ lastRecord.id }}</span>
        </div>
        <div class="sbg-result-grid">
          <div class="sbg-result-item">
            <span class="sbg-result-label">软件</span>
            <span class="sbg-result-value">{{ lastRecord.name }} {{ lastRecord.version }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">标准</span>
            <span class="sbg-result-value">{{ lastRecord.spec }} {{ lastRecord.specVersion }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">组件数</span>
            <span class="sbg-result-value">{{ lastRecord.components.length }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">漏洞</span>
            <span class="sbg-result-value sbg-result-value--warn">{{ lastRecord.vulnerabilities.length }}</span>
          </div>
        </div>
        <div class="sbg-result-actions">
          <RouterLink class="sbg-btn sbg-btn--primary" :to="{ name: 'sbom-analysis', query: { id: lastRecord.id } }">
            查看详情分析
          </RouterLink>
          <button type="button" class="sbg-btn sbg-btn--ghost" @click="lastRecord = null">继续生成</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { addSbomRecord } from '../../../data/sbomStore.js'

const SPEC_OPTIONS = [
  { value: 'SPDX', label: 'SPDX', desc: 'Linux 基金会标准，供应链通用' },
  { value: 'CycloneDX', label: 'CycloneDX', desc: 'OWASP 标准，安全场景优先' },
]

const FORMAT_MAP = {
  SPDX: [
    { value: 'spdx-json', label: 'JSON', ext: 'spdx.json' },
    { value: 'spdx-tag', label: 'Tag-Value', ext: 'spdx' },
    { value: 'spdx-yaml', label: 'YAML', ext: 'spdx.yaml' },
  ],
  CycloneDX: [
    { value: 'cyclonedx-json', label: 'JSON', ext: 'cdx.json' },
    { value: 'cyclonedx-xml', label: 'XML', ext: 'cdx.xml' },
  ],
}

const availableFormats = computed(() => FORMAT_MAP[form.spec] || [])

const upload = reactive({
  file: null,
  fileName: '',
  fileSize: '',
  name: '',
  version: '',
})

const form = reactive({
  spec: 'SPDX',
  formats: ['spdx-json'],
  withLicense: true,
  withVuln: true,
})

const dragging = ref(false)
const fileInputRef = ref(null)
const generating = ref(false)
const errorMsg = ref('')
const lastRecord = ref(null)

const canSubmit = computed(
  () => !!upload.fileName && form.formats.length > 0 && !errorMsg.value,
)

/* 切换标准时，重置为该标准下的默认格式 */
function syncFormats() {
  const valid = availableFormats.value.map((f) => f.value)
  const kept = form.formats.filter((f) => valid.includes(f))
  form.formats = kept.length ? kept : valid.length ? [valid[0]] : []
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function applyFile(file) {
  if (!file) return
  errorMsg.value = ''
  upload.file = file
  upload.fileName = file.name
  upload.fileSize = formatSize(file.size)

  /* 从文件名推断软件名与版本：xxx-1.2.0.tar.gz */
  const base = file.name.replace(/\.(tar\.gz|tgz|zip|tar|gz)$/i, '')
  const m = base.match(/^(.*?)[-_]v?(\d+(?:\.\d+)*)$/)
  if (m) {
    upload.name = m[1]
    upload.version = m[2]
  } else {
    upload.name = base
    upload.version = ''
  }
}

function handleFileChange(e) {
  applyFile(e.target.files?.[0])
  e.target.value = ''
}

function handleDrop(e) {
  dragging.value = false
  applyFile(e.dataTransfer?.files?.[0])
}

function clearFile() {
  upload.file = null
  upload.fileName = ''
  upload.fileSize = ''
}

/* spec 变化时校正格式选择 */
watch(() => form.spec, syncFormats)
watch(
  () => form.formats,
  (v) => {
    if (v.length === 0) errorMsg.value = ''
  },
)

function handleSubmit() {
  if (!canSubmit.value || generating.value) return
  generating.value = true
  errorMsg.value = ''

  /* 演示：模拟解析与生成耗时 */
  window.setTimeout(() => {
    try {
      const record = addSbomRecord({
        name: upload.name || upload.fileName,
        version: upload.version || '1.0.0',
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        spec: form.spec,
        outputFormat: form.formats.map((f) => f.toUpperCase()).join(' / '),
      })
      lastRecord.value = record
      clearFile()
      upload.name = ''
      upload.version = ''
    } catch (e) {
      errorMsg.value = '生成失败，请重试'
    } finally {
      generating.value = false
    }
  }, 900)
}
</script>

<style scoped>
.sbom-gen { display: flex; flex-direction: column; gap: 20px; }
.sbg-page-hd { margin-bottom: 0; }
.sbg-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sbg-desc { font-size: 13px; color: #8b919b; margin: 0; line-height: 1.6; }

.sbg-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; display: flex; flex-direction: column; gap: 22px; }
.sbg-field { display: flex; flex-direction: column; gap: 8px; }
.sbg-label { font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 4px; }
.sbg-req { color: #da203e; }
.sbg-hint { font-size: 11px; color: #b0b5bd; margin: -2px 0 2px; }

/* 上传区 */
.sbg-drop { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 30px 20px; border: 1.5px dashed #dfe2e7; border-radius: 9px; background: #fafbfc; cursor: pointer; transition: border-color .2s, background .2s; }
.sbg-drop:hover, .sbg-drop.is-drag { border-color: #da203e; background: rgba(218,32,62,0.025); }
.sbg-drop.has-file { flex-direction: row; justify-content: flex-start; gap: 12px; padding: 16px 18px; border-style: solid; background: #fff; }
.sbg-drop-ico { color: #c4c9d1; }
.sbg-drop-main { font-size: 13px; font-weight: 500; color: #4b5563; margin: 0; }
.sbg-drop-sub { font-size: 11px; color: #b0b5bd; margin: 0; }
.sbg-file-ico { color: #da203e; display: flex; flex-shrink: 0; }
.sbg-file-info { flex: 1; min-width: 0; }
.sbg-file-name { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sbg-file-size { font-size: 11px; color: #9ca3af; margin: 0; }
.sbg-file-del { padding: 4px 12px; font-size: 12px; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s; }
.sbg-file-del:hover { color: #da203e; border-color: #da203e; }

/* 输入行 */
.sbg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sbg-input { width: 100%; padding: 9px 12px; font-size: 13px; color: #111827; background: #fff; border: 1px solid #e1e4e8; border-radius: 7px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; }
.sbg-input:focus { border-color: #da203e; box-shadow: 0 0 0 3px rgba(218,32,62,0.08); }
.sbg-input::placeholder { color: #c4c9d1; }

/* 标准选择 */
.sbg-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.sbg-option { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: border-color .2s, background .2s; }
.sbg-option:hover { border-color: #d3d7dd; }
.sbg-option.is-active { border-color: #da203e; background: rgba(218,32,62,0.03); }
.sbg-option-title { font-size: 13px; font-weight: 700; color: #111827; }
.sbg-option.is-active .sbg-option-title { color: #da203e; }
.sbg-option-desc { font-size: 11px; color: #9ca3af; }

/* 输出格式 */
.sbg-formats { display: flex; flex-wrap: wrap; gap: 8px; }
.sbg-format { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border: 1px solid #e5e7eb; border-radius: 7px; cursor: pointer; transition: border-color .2s, background .2s; }
.sbg-format:hover { border-color: #d3d7dd; }
.sbg-format.is-active { border-color: #da203e; background: rgba(218,32,62,0.04); }
.sbg-format-check { width: 14px; height: 14px; border-radius: 3px; border: 1px solid #d3d7dd; color: transparent; font-size: 10px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: background .2s, border-color .2s, color .2s; }
.sbg-format.is-active .sbg-format-check { background: #da203e; border-color: #da203e; color: #fff; }
.sbg-format-name { font-size: 12px; font-weight: 600; color: #374151; }
.sbg-format.is-active .sbg-format-name { color: #da203e; }
.sbg-format-ext { font-size: 10px; color: #b0b5bd; font-family: 'SF Mono', 'JetBrains Mono', monospace; }

/* 开关 */
.sbg-switches { display: flex; flex-direction: column; gap: 10px; }
.sbg-switch { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.sbg-switch-box { position: relative; width: 32px; height: 18px; border-radius: 9px; background: #e1e4e8; flex-shrink: 0; margin-top: 1px; transition: background .2s; }
.sbg-switch-box::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.15); transition: transform .2s; }
.sbg-switch input:checked + .sbg-switch-box { background: #da203e; }
.sbg-switch input:checked + .sbg-switch-box::after { transform: translateX(14px); }
.sbg-switch-text { display: flex; flex-direction: column; gap: 2px; font-size: 12px; font-weight: 600; color: #374151; }
.sbg-switch-text small { font-size: 11px; font-weight: 400; color: #b0b5bd; }

/* 提交 */
.sbg-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; padding-top: 18px; border-top: 1px solid #f2f3f5; }
.sbg-actions-hint { font-size: 11px; color: #b0b5bd; margin-right: auto; }
.sbg-error { font-size: 11px; color: #da203e; margin-right: auto; }
.sbg-submit { display: inline-flex; align-items: center; gap: 7px; padding: 9px 24px; font-size: 13px; font-weight: 600; color: #fff; background: #da203e; border: none; border-radius: 7px; cursor: pointer; font-family: inherit; transition: background .2s, opacity .2s; }
.sbg-submit:hover:not(:disabled) { background: #c01b36; }
.sbg-submit:disabled { opacity: .45; cursor: not-allowed; }
.sbg-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: sbg-spin .7s linear infinite; }
@keyframes sbg-spin { to { transform: rotate(360deg); } }

/* 结果 */
.sbg-result { background: #fff; border: 1px solid rgba(218,32,62,0.25); border-radius: 10px; padding: 20px 24px; }
.sbg-result-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sbg-result-badge { padding: 3px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #2f9e57; background: rgba(47,158,87,0.08); }
.sbg-result-id { font-size: 11px; color: #b0b5bd; font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.sbg-result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #f2f3f5; }
.sbg-result-item { display: flex; flex-direction: column; gap: 4px; }
.sbg-result-label { font-size: 11px; color: #b0b5bd; }
.sbg-result-value { font-size: 13px; font-weight: 600; color: #111827; }
.sbg-result-value--warn { color: #e5a850; }
.sbg-result-actions { display: flex; gap: 8px; margin-top: 16px; }
.sbg-btn { padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; font-family: inherit; border: 1px solid transparent; transition: background .2s, border-color .2s; }
.sbg-btn--primary { background: #da203e; color: #fff; }
.sbg-btn--primary:hover { background: #c01b36; }
.sbg-btn--ghost { background: #fff; color: #6b7280; border-color: #e5e7eb; }
.sbg-btn--ghost:hover { color: #da203e; border-color: #da203e; }

.sbg-fade-enter-active, .sbg-fade-leave-active { transition: opacity .25s, transform .25s; }
.sbg-fade-enter-from, .sbg-fade-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 820px) {
  .sbg-row, .sbg-options { grid-template-columns: 1fr; }
  .sbg-result-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
