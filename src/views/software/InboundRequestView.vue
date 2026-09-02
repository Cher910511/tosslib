<template>
  <div class="ir-page">
    <form class="ir-form-card" novalidate @submit.prevent="submitRequest">
      <!-- 标题 -->
      <div class="ir-page-header">
        <h1 class="ir-page-title">开源软件项目入库需求清单</h1>
        <button type="button" class="ir-template-btn" @click="downloadTemplate">下载模板</button>
      </div>

      <!-- 反馈组织 -->
      <div class="ir-field">
        <label class="ir-label" for="ir-org">
          反馈组织
          <span class="ir-required" aria-hidden="true">*</span>
        </label>
        <input
          id="ir-org"
          v-model.trim="form.org"
          type="text"
          class="ir-input"
          placeholder="请输入反馈组织名称"
          :class="{ 'is-invalid': shouldValidate && errors.org }"
          @blur="touch"
        />
        <p v-if="shouldValidate && errors.org" class="ir-error">{{ errors.org }}</p>
      </div>

      <!-- 反馈人 -->
      <div class="ir-field">
        <label class="ir-label" for="ir-reporter">
          反馈人
          <span class="ir-required" aria-hidden="true">*</span>
        </label>
        <input
          id="ir-reporter"
          v-model.trim="form.reporter"
          type="text"
          class="ir-input"
          placeholder="请输入反馈人姓名"
          :class="{ 'is-invalid': shouldValidate && errors.reporter }"
          @blur="touch"
        />
        <p v-if="shouldValidate && errors.reporter" class="ir-error">{{ errors.reporter }}</p>
      </div>

      <!-- 联系方式 -->
      <div class="ir-field">
        <label class="ir-label" for="ir-contact">
          联系方式
          <span class="ir-required" aria-hidden="true">*</span>
        </label>
        <input
          id="ir-contact"
          v-model.trim="form.contact"
          type="text"
          class="ir-input"
          placeholder="请输入手机号或邮箱"
          :class="{ 'is-invalid': shouldValidate && errors.contact }"
          @blur="touch"
        />
        <p v-if="shouldValidate && errors.contact" class="ir-error">{{ errors.contact }}</p>
      </div>

      <!-- 上传 Excel -->
      <div class="ir-field">
        <label class="ir-label" for="ir-file">上传 Excel 清单</label>
        <div
          class="ir-upload"
          :class="{ 'is-dragover': isDragOver }"
          @dragover.prevent="onDragOver(true)"
          @dragleave.prevent="onDragOver(false)"
          @drop.prevent="onDrop"
        >
          <input
            id="ir-file"
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            class="ir-upload-input"
            @change="onFileChange"
          />
          <button type="button" class="ir-upload-btn" @click="fileInputRef?.click()">
            点击选择 Excel 文件
          </button>
          <p class="ir-upload-hint">每次限传一个文件，选择后点击“解析”生成表格。单个文件≤100MB，表格须含“开源软件名称、版本号、开源网站地址、主要应用场景”四列。</p>
        </div>
        <div v-if="fileName" class="ir-file-item">
          <span class="ir-file-name" :title="fileName">{{ fileName }}</span>
          <span class="ir-file-size">{{ formatSize(fileSize) }}</span>
          <button type="button" class="ir-parse-btn" :disabled="parsing" @click="parseFile">
            {{ parsing ? '解析中…' : (items.length ? '重新解析' : '解析') }}
          </button>
          <button type="button" class="ir-file-remove" title="移除文件并清空结果" @click="clearAll">✕</button>
        </div>
        <p v-if="errors.file" class="ir-error">{{ errors.file }}</p>
      </div>

      <!-- 解析结果表格 -->
      <div v-if="items.length" class="ir-parse-block">
        <div class="ir-parse-hd">
          <h3 class="ir-parse-title">解析结果（共 {{ items.length }} 条）</h3>
          <button type="button" class="ir-parse-clear" @click="clearAll">清空</button>
        </div>
        <div class="ir-table-wrap">
          <table class="ir-table">
            <thead>
              <tr>
                <th>#</th>
                <th>开源软件名称</th>
                <th>版本号</th>
                <th>开源网站地址</th>
                <th>主要应用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in pagedItems" :key="i">
                <td class="ir-table-num">{{ (parsePage - 1) * PARSE_PAGE_SIZE + i + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.version }}</td>
                <td class="ir-table-url" :title="row.url">{{ row.url }}</td>
                <td>{{ row.scene }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="parsePageCount > 1" class="ir-pager">
          <span class="ir-pager-total">共 {{ items.length }} 条 · 第 {{ parsePage }}/{{ parsePageCount }} 页</span>
          <div class="ir-pager-btns">
            <button type="button" class="ir-page-btn" :disabled="parsePage <= 1" @click="goParsePage(parsePage - 1)">上一页</button>
            <button
              v-for="p in parsePageCount"
              :key="p"
              type="button"
              class="ir-page-btn"
              :class="{ 'is-active': p === parsePage }"
              @click="goParsePage(p)"
            >{{ p }}</button>
            <button type="button" class="ir-page-btn" :disabled="parsePage >= parsePageCount" @click="goParsePage(parsePage + 1)">下一页</button>
          </div>
        </footer>
      </div>

      <!-- 提交按钮 -->
      <div class="ir-actions">
        <button type="submit" class="ir-submit" :disabled="!canSubmit">
          {{ submitting ? '提交中…' : '提交清单' }}
        </button>
        <Transition name="ir-msg">
          <span v-if="submitted" class="ir-success">已提交，等待后台审核</span>
        </Transition>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue'
import * as XLSX from 'xlsx'
import { addInboundRequest } from '../../data/inboundRequests.js'

// 必填四列的表头关键词（兼容轻微差异）
const COLUMN_MAP = {
  name: ['开源软件名称', '软件名称', '名称'],
  version: ['版本号', '版本'],
  url: ['开源网站地址', '网站地址', '开源地址', '地址'],
  scene: ['主要应用场景', '应用场景', '场景'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const CONTACT_PHONE_RE = /^1[3-9]\d{9}$/
const CONTACT_EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/

const DEFAULT_FORM = () => ({ org: '', reporter: '', contact: '' })

const submitting = ref(false)
const submitted = ref(false)
const touched = ref(false)
const fileInputRef = ref(null)
const isDragOver = ref(false)
const fileName = ref('')
const fileSize = ref(0)
const items = ref([])

/* —— 解析结果表格分页（每页 10 条） —— */
const PARSE_PAGE_SIZE = 10
const parsePage = ref(1)
const parsePageCount = computed(() => Math.max(1, Math.ceil(items.value.length / PARSE_PAGE_SIZE)))
const pagedItems = computed(() => {
  const start = (parsePage.value - 1) * PARSE_PAGE_SIZE
  return items.value.slice(start, start + PARSE_PAGE_SIZE)
})
function goParsePage(p) {
  if (p < 1 || p > parsePageCount.value) return
  parsePage.value = p
}

const form = reactive(DEFAULT_FORM())

const shouldValidate = computed(() => touched.value || submitting.value)

const errors = computed(() => {
  const err = {}
  if (!form.org) err.org = '请输入反馈组织'
  if (!form.reporter) err.reporter = '请输入反馈人'
  if (!form.contact) {
    err.contact = '请输入联系方式'
  } else if (!CONTACT_PHONE_RE.test(form.contact) && !CONTACT_EMAIL_RE.test(form.contact)) {
    err.contact = '请输入正确的手机号或邮箱'
  }
  if (shouldValidate.value && !fileName.value) err.file = '请上传 Excel 清单文件'
  else if (fileName.value && fileError.value) err.file = fileError.value
  return err
})

const canSubmit = computed(() => !submitting.value && items.value.length > 0 && Object.keys(errors.value).length === 0)

/* ===== 文件上传 ===== */
function onDragOver(over) {
  isDragOver.value = over
}
function onDrop(e) {
  isDragOver.value = false
  if (e.dataTransfer?.files?.length) handleFile(e.dataTransfer.files[0])
}
function onFileChange(e) {
  if (e.target.files?.length) handleFile(e.target.files[0])
  if (fileInputRef.value) fileInputRef.value.value = ''
}
/* ===== 文件选择与解析 ===== */
const parsing = ref(false)
const pickedFile = ref(null)

/** 选择文件：仅校验并暂存，点击「解析」后才生成表格（一次一个文件） */
function handleFile(file) {
  if (!file) return
  clearAll()
  if (file.size > MAX_FILE_SIZE) {
    touched.value = true
    setFileError(`文件大小 ${formatSize(file.size)} 超过 100MB 限制`)
    return
  }
  const ext = file.name.toLowerCase()
  if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
    touched.value = true
    setFileError('仅支持 .xlsx / .xls 格式文件')
    return
  }
  pickedFile.value = file
  fileName.value = file.name
  fileSize.value = file.size
  touched.value = true
}

/** 解析当前暂存文件 */
async function parseFile() {
  if (!fileName.value || parsing.value) return
  const file = pickedFile.value
  if (!file) {
    setFileError('未找到文件，请重新选择')
    return
  }
  parsing.value = true
  try {
    const buf = await file.arrayBuffer()
    const workbook = XLSX.read(buf, { type: 'array' })
    const parsed = parseWorkbook(workbook)
    items.value = parsed
    parsePage.value = 1
    if (!parsed.length) setFileError('未解析到有效数据，请检查表头是否包含四列')
  } catch (e) {
    setFileError('文件解析失败，请确认是有效的 Excel 文件')
  } finally {
    parsing.value = false
  }
}

/** 清空：连文件带解析结果一起移除 */
function clearAll() {
  pickedFile.value = null
  fileName.value = ''
  fileSize.value = 0
  items.value = []
  parsePage.value = 1
  fileError.value = ''
}

function formatSize(size) {
  if (size == null) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

/** 下载示例表格：生成含四列表头的空白模板 xlsx */
function downloadTemplate() {
  const rows = [
    ['开源软件名称', '版本号', '开源网站地址', '主要应用场景'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 55 }, { wch: 42 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '入库需求清单')
  XLSX.writeFile(wb, '开源软件入库需求清单-模板.xlsx')
}

/** 从 SheetJS 单元格对象取值（兼容公式/富文本等） */
function cellText(v) {
  if (v == null) return ''
  if (typeof v === 'object') {
    if (v.w != null) return String(v.w).trim()
    if (v.v != null) return String(v.v).trim()
    return ''
  }
  return String(v).trim()
}

/** 匹配表头单元格属于哪一列，返回列 key 或 null */
function matchColumnKey(headerText) {
  const t = String(headerText).trim()
  for (const [key, keywords] of Object.entries(COLUMN_MAP)) {
    if (keywords.some((k) => t.includes(k))) return key
  }
  return null
}

/**
 * 解析 Excel：定位表头行（含四列关键词）→ 逐行提取四列数据
 */
function parseWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (!rows.length) return []

  // 找表头行：包含 ≥2 个目标列关键词
  let headerRow = -1
  let colIdx = {}
  for (let r = 0; r < rows.length && r < 50; r++) {
    const found = {}
    let hit = 0
    rows[r].forEach((cell, c) => {
      const key = matchColumnKey(cell)
      if (key && !(key in found)) {
        found[key] = c
        hit += 1
      }
    })
    if (hit >= 2) {
      headerRow = r
      colIdx = found
      break
    }
  }
  if (headerRow === -1) return []

  const list = []
  for (let r = headerRow + 1; r < rows.length; r++) {
    const name = cellText(rows[r][colIdx.name])
    const version = cellText(rows[r][colIdx.version])
    const url = cellText(rows[r][colIdx.url])
    const scene = cellText(rows[r][colIdx.scene])
    if (!name && !version && !url && !scene) continue // 跳过空行
    list.push({ name, version, url, scene })
  }
  return list
}

const fileError = ref('')
function setFileError(msg) {
  fileError.value = msg
}

/* ===== 提交 ===== */
let dismissTimer = null
function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}
onUnmounted(clearDismissTimer)

function touch() {
  touched.value = true
}

async function submitRequest() {
  touched.value = true
  if (!canSubmit.value) return

  submitting.value = true
  try {
    // 模拟提交：写入共享数据（后台「反馈与审核 → 开源软件入库需求清单」可查看）
    await new Promise((resolve) => setTimeout(resolve, 600))
    addInboundRequest({
      org: form.org,
      reporter: form.reporter,
      contact: form.contact,
      fileName: fileName.value,
      items: items.value.map((r) => ({ ...r })),
    })
    submitted.value = true
    Object.assign(form, DEFAULT_FORM())
    clearAll()
    touched.value = false
    clearDismissTimer()
    dismissTimer = setTimeout(() => {
      submitted.value = false
      dismissTimer = null
    }, 3000)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ir-page {
  width: 100%;
  padding: 8px 24px 32px;
}

.ir-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
}

.ir-page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
}

.ir-page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
}

.ir-page-subtitle strong {
  color: #374151;
}

.ir-form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ir-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ir-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.ir-required {
  margin-left: 2px;
  color: #da203e;
}

.ir-input {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1a1a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ir-input::placeholder {
  color: #9ca3af;
}

.ir-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.ir-input.is-invalid {
  border-color: #dc2626;
}

.ir-error {
  margin: 0;
  font-size: 12px;
  color: #dc2626;
}

/* 上传区 */
.ir-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 16px;
  border: 1.5px dashed #d1d5db;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s, background 0.2s;
}

.ir-upload.is-dragover {
  border-color: #da203e;
  background: #fef2f2;
}

.ir-upload-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.ir-upload-btn {
  position: relative;
  padding: 8px 22px;
  border: 1px solid #da203e;
  border-radius: 6px;
  background: #da203e;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  pointer-events: none;
  transition: background 0.15s;
}

.ir-upload-btn:hover {
  background: #c01e38;
}

.ir-upload-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

/* 下载模板按钮（位于标题右侧） */
.ir-template-btn {
  flex-shrink: 0;
  padding: 6px 16px;
  border: 1px solid #da203e;
  border-radius: 4px;
  background: #fff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #da203e;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.ir-template-btn:hover {
  background: #da203e;
  color: #fff;
}

.ir-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
}

.ir-file-ico {
  font-size: 15px;
}

.ir-file-name {
  flex: 1;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ir-file-size {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.ir-file-remove {
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
}

.ir-file-remove:hover {
  color: #dc2626;
}

/* 解析按钮 */
.ir-parse-btn {
  flex-shrink: 0;
  padding: 4px 14px;
  border: 1px solid #da203e;
  border-radius: 4px;
  background: #fff;
  color: #da203e;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.ir-parse-btn:hover:not(:disabled) {
  background: #da203e;
  color: #fff;
}

.ir-parse-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 解析表格 */
.ir-parse-block {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.ir-parse-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.ir-parse-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.ir-parse-clear {
  border: none;
  background: none;
  font-family: inherit;
  font-size: 12px;
  color: #da203e;
  cursor: pointer;
}

.ir-parse-clear:hover {
  text-decoration: underline;
}

.ir-table-wrap {
  overflow-x: auto;
}

.ir-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 720px;
}

.ir-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.ir-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f9fafb;
  color: #374151;
}

.ir-table tbody tr:hover {
  background: #fafafa;
}

.ir-table-num {
  color: #9ca3af;
}

/* 解析表格分页器 */
.ir-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  flex-wrap: wrap;
}
.ir-pager-total { font-size: 12px; color: #9ca3af; }
.ir-pager-btns { display: flex; align-items: center; gap: 6px; }
.ir-page-btn {
  min-width: 30px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.ir-page-btn:hover:not(:disabled):not(.is-active) { border-color: #da203e; color: #da203e; }
.ir-page-btn.is-active { background: #da203e; border-color: #da203e; color: #fff; font-weight: 600; }
.ir-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.ir-table-url {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #2563eb;
}

/* 提交 */
.ir-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ir-submit {
  padding: 9px 28px;
  border: none;
  border-radius: 6px;
  background: #da203e;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.ir-submit:hover:not(:disabled) {
  background: #c01e38;
}

.ir-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ir-success {
  font-size: 13px;
  color: #16a34a;
}

.ir-msg-enter-active,
.ir-msg-leave-active {
  transition: opacity 0.25s;
}

.ir-msg-enter-from,
.ir-msg-leave-to {
  opacity: 0;
}
</style>
