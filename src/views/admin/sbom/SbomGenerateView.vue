<template>
  <div class="sbom-gen">
    <div class="sbg-page-hd">
      <h1 class="sbg-title">SBOM生成</h1>
      <p class="sbg-desc">上传源代码压缩包或二进制文件，配置输出标准与文件格式，自动解析依赖并生成软件物料清单。</p>
    </div>

    <form class="sbg-form" @submit.prevent="handleSubmit">
      <div class="sbg-card">
        <!-- 上传方式切换 -->
        <div class="sbg-tabs">
          <button
            v-for="m in UPLOAD_MODES"
            :key="m.value"
            type="button"
            class="sbg-tab"
            :class="{ 'is-active': uploadMode === m.value }"
            @click="switchMode(m.value)"
          >
            {{ m.label }}
          </button>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          :accept="currentMode.accept"
          hidden
          @change="handleFileChange"
        />

        <!-- 二进制文件：路径输入 + 上传 -->
        <div v-if="uploadMode === 'binary'" class="sbg-field">
          <label class="sbg-label" for="sbg-bin-path">二进制文件路径</label>
          <input
            id="sbg-bin-path"
            v-model="binaryPath"
            type="text"
            class="sbg-input"
            placeholder="/path/to/app.jar 或通过下方上传"
          />
          <p class="sbg-hint">支持 JAR、WAR、APK、EXE、DLL、DEB、RPM、Docker 镜像等</p>

          <div
            class="sbg-bin-drop"
            :class="{ 'is-drag': dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="handleDrop"
          >
            <button type="button" class="sbg-bin-add" title="选择文件" @click="fileInputRef?.click()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <p class="sbg-bin-tip">或将二进制文件拖拽到此处</p>
            <div v-if="fileName" class="sbg-bin-file">
              <span class="sbg-file-name">{{ fileName }}</span>
              <span class="sbg-file-size">{{ fileSize }}</span>
              <button type="button" class="sbg-file-del" @click.stop="clearFile">移除</button>
            </div>
          </div>
        </div>

        <!-- 源码包：拖拽上传 -->
        <div
          v-else
          class="sbg-drop"
          :class="{ 'is-drag': dragging, 'has-file': fileName }"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <template v-if="!fileName">
            <span class="sbg-drop-ico">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </span>
            <p class="sbg-drop-main">{{ currentMode.placeholder }}</p>
            <p class="sbg-drop-sub">{{ currentMode.hint }}</p>
          </template>
          <template v-else>
            <span class="sbg-file-ico">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
            </span>
            <div class="sbg-file-info">
              <p class="sbg-file-name">{{ fileName }}</p>
              <p class="sbg-file-size">{{ fileSize }}</p>
            </div>
            <button type="button" class="sbg-file-del" @click.stop="clearFile">移除</button>
          </template>
        </div>

        <!-- 项目基本信息 -->
        <div class="sbg-fields">
          <div class="sbg-field">
            <label class="sbg-label" for="sbg-name">项目名称</label>
            <input
              id="sbg-name"
              v-model="form.name"
              type="text"
              class="sbg-input"
              placeholder="自动检测或手动输入"
            />
          </div>

          <div class="sbg-field">
            <label class="sbg-label" for="sbg-version">
              版本<span class="sbg-opt">（可选）</span>
            </label>
            <div class="sbg-input-wrap">
              <span class="sbg-input-ico sbg-input-ico--danger" aria-hidden="true">✕</span>
              <input
                id="sbg-version"
                v-model="form.version"
                type="text"
                class="sbg-input sbg-input--icon"
                placeholder="如: v1.0.0, 2.3.1"
              />
            </div>
          </div>

          <div class="sbg-field sbg-field--full">
            <label class="sbg-label" for="sbg-intro">
              简介<span class="sbg-opt">（可选）</span>
            </label>
            <div class="sbg-input-wrap">
              <span class="sbg-input-ico" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              </span>
              <input
                id="sbg-intro"
                v-model="form.intro"
                type="text"
                class="sbg-input sbg-input--icon"
                placeholder="简要描述项目功能和用途"
              />
            </div>
          </div>

          <div class="sbg-field sbg-field--full">
            <label class="sbg-label" for="sbg-tags">
              分类标签<span class="sbg-opt">（可选，逗号分隔）</span>
            </label>
            <div class="sbg-input-wrap">
              <span class="sbg-input-ico" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </span>
              <input
                id="sbg-tags"
                v-model="form.tags"
                type="text"
                class="sbg-input sbg-input--icon"
                placeholder="如: 生产环境, Java, AI模型"
              />
            </div>
          </div>

          <div class="sbg-field sbg-field--full">
            <label class="sbg-label" for="sbg-company">
              所属企业<span class="sbg-opt">（可选，园区统计维度）</span>
            </label>
            <div class="sbg-input-wrap">
              <span class="sbg-input-ico" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/></svg>
              </span>
              <input
                id="sbg-company"
                v-model="form.company"
                type="text"
                class="sbg-input sbg-input--icon"
                placeholder="如: 园区内企业名称，用于园区风险一张图"
              />
            </div>
          </div>
        </div>

        <!-- 输出配置 -->
        <div class="sbg-divider"><span class="sbg-divider-label">输出配置</span></div>

        <div class="sbg-field sbg-field--full">
          <label class="sbg-label">输出标准</label>
          <div class="sbg-chips">
            <button
              v-for="s in STANDARDS"
              :key="s.value"
              type="button"
              class="sbg-chip"
              :class="{ 'is-active': form.standard === s.value }"
              @click="form.standard = s.value"
            >
              {{ s.label }}
              <span v-if="s.ai" class="sbg-ai-badge">AI</span>
            </button>
          </div>
        </div>

        <div class="sbg-field sbg-field--full">
          <label class="sbg-label">文件格式</label>
          <div class="sbg-chips">
            <button
              v-for="f in FORMATS"
              :key="f.value"
              type="button"
              class="sbg-chip"
              :class="{ 'is-active': form.format === f.value }"
              @click="form.format = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="sbg-field sbg-field--full">
          <label class="sbg-label">附加选项</label>
          <div class="sbg-checks">
            <label class="sbg-check">
              <input v-model="form.withVuln" type="checkbox" hidden />
              <span class="sbg-check-box">✓</span>
              <span class="sbg-check-text">包含漏洞信息</span>
            </label>
            <label class="sbg-check">
              <input v-model="form.withLicense" type="checkbox" hidden />
              <span class="sbg-check-box">✓</span>
              <span class="sbg-check-text">包含许可证合规信息</span>
            </label>
            <label class="sbg-check">
              <input v-model="form.withSource" type="checkbox" hidden />
              <span class="sbg-check-box">✓</span>
              <span class="sbg-check-text">包含文件来源与代码片段分析</span>
            </label>
          </div>
        </div>
      </div>

      <button type="submit" class="sbg-submit" :disabled="!canSubmit || generating">
        <span v-if="generating" class="sbg-spinner" />
        <span v-else class="sbg-play">▶</span>
        {{ generating ? '生成中…' : '生成 SBOM' }}
      </button>
      <p v-if="errorMsg" class="sbg-error">{{ errorMsg }}</p>
    </form>

    <!-- 生成进度卡片 -->
    <Transition name="sbg-fade">
      <div v-if="task.visible" class="sbg-task">
        <div class="sbg-task-hd">
          <span class="sbg-task-status" :class="'is-' + task.state">
            <span v-if="task.state === 'running'" class="sbg-task-dot" />
            {{ task.state === 'running' ? '正在生成 SBOM...' : task.state === 'done' ? 'SBOM 生成完成' : '任务已取消' }}
          </span>
          <button v-if="task.state === 'running'" type="button" class="sbg-cancel" @click="cancelTask">
            取消任务
          </button>
        </div>

        <div class="sbg-progress">
          <div class="sbg-progress-track">
            <div class="sbg-progress-fill" :style="{ width: task.progress + '%' }" />
          </div>
          <span class="sbg-progress-num">{{ task.progress }}%</span>
        </div>
        <p class="sbg-progress-hint">{{ task.hint }}</p>

        <div ref="logRef" class="sbg-log">
          <div v-for="(l, i) in task.logs" :key="i" class="sbg-log-line">
            <span class="sbg-log-ico">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </span>
            <span class="sbg-log-text">{{ l }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 生成结果 -->
    <Transition name="sbg-fade">
      <div v-if="lastRecord" class="sbg-result">
        <div class="sbg-result-hd">
          <span class="sbg-result-badge">✓ 生成完成</span>
          <span class="sbg-result-id">{{ lastRecord.id }}</span>
        </div>
        <div class="sbg-result-grid">
          <div class="sbg-result-item">
            <span class="sbg-result-label">项目</span>
            <span class="sbg-result-value">{{ lastRecord.name }} {{ lastRecord.version }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">标准</span>
            <span class="sbg-result-value">{{ lastRecord.spec }} {{ lastRecord.specVersion }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">格式</span>
            <span class="sbg-result-value">{{ lastRecord.outputFormat }}</span>
          </div>
          <div class="sbg-result-item">
            <span class="sbg-result-label">组件数</span>
            <span class="sbg-result-value">{{ lastRecord.components.length }}</span>
          </div>
        </div>
        <div class="sbg-result-actions">
          <RouterLink
            class="sbg-btn sbg-btn--primary"
            :to="{ name: 'sbom-analysis', query: { id: lastRecord.id } }"
          >
            查看详情分析
          </RouterLink>
          <button type="button" class="sbg-btn sbg-btn--ghost" @click="lastRecord = null">
            继续生成
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { addSbomRecord } from '../../../data/sbomStore.js'

const router = useRouter()

/* 输出标准：BOM-SW 1.0 为默认选项 */
const STANDARDS = [
  { value: 'BOM-SW', label: 'BOM-SW 1.0', ai: false },
  { value: 'SPDX', label: 'SPDX', ai: false },
  { value: 'CycloneDX', label: 'CycloneDX', ai: false },
]

const FORMATS = [
  { value: 'JSON', label: 'JSON' },
  { value: 'XML', label: 'XML' },
  { value: 'XLS', label: 'XLS' },
]

/* 上传方式：源码包 / 二进制文件 */
const UPLOAD_MODES = [
  {
    value: 'source',
    label: '源码包上传',
    accept: '.zip,.tar.gz,.tgz,.tar,.7z,.deb,.rpm,.cpio,.ar',
    placeholder: '将源代码压缩包拖拽到此处，或点击浏览选择文件',
    hint: '支持 ZIP、TAR.GZ、7z、DEB、RPM、CPIO、AR 等格式',
  },
  {
    value: 'binary',
    label: '二进制文件',
    accept: '.exe,.dll,.so,.dylib,.a,.lib,.bin,.elf,.apk,.jar,.whl,.nupkg,.deb,.rpm',
    placeholder: '将二进制文件拖拽到此处，或点击浏览选择文件',
    hint: '支持 EXE、DLL、SO、DYLIB、JAR、APK、DEB、RPM 等格式',
  },
]

const uploadMode = ref('source')
const currentMode = computed(
  () => UPLOAD_MODES.find((m) => m.value === uploadMode.value) || UPLOAD_MODES[0],
)

const form = reactive({
  name: '',
  version: '',
  intro: '',
  tags: '',
  company: '',
  standard: 'BOM-SW',
  format: 'JSON',
  withVuln: true,
  withLicense: false,
  withSource: false,
})

const fileName = ref('')
const fileSize = ref('')
const binaryPath = ref('')
const dragging = ref(false)
const fileInputRef = ref(null)
const errorMsg = ref('')
const lastRecord = ref(null)

/* 生成任务进度 */
const logRef = ref(null)
const task = reactive({
  visible: false,
  state: 'idle',
  progress: 0,
  hint: '',
  logs: [],
})
let timer = null

const generating = computed(() => task.state === 'running')
const canSubmit = computed(() =>
  uploadMode.value === 'binary'
    ? !!(binaryPath.value.trim() || fileName.value) && !generating.value
    : !!fileName.value && !generating.value,
)

/* 语言检测顺序（与日志逐条对应） */
const LANG_LIST = [
  'Fortran', 'Ada', 'PowerShell', 'Groovy', 'QML', 'SciLab', 'Zig',
  'C/C++', 'C/C++', 'Prolog', 'Java', 'Python', 'JavaScript', 'TypeScript',
  'Go', 'Rust', 'Ruby', 'PHP', 'C#', 'Kotlin', 'Swift', 'Lua', 'Perl',
  'Erlang', 'Elixir', 'Haskell', 'OCaml', 'R', 'Julia', 'Dart', 'Scala',
  'Clojure', 'Objective-C', 'Shell', 'SQL',
]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/* 从文件名推断项目名称与版本：xxx-1.2.0.tar.gz */
function applyFile(file) {
  if (!file) return
  errorMsg.value = ''
  fileName.value = file.name
  fileSize.value = formatSize(file.size)

  const base = file.name.replace(/\.(tar\.gz|tgz|zip|tar|7z|deb|rpm|cpio|ar)$/i, '')
  const m = base.match(/^(.*?)[-_]v?(\d+(?:\.\d+)*)$/)
  if (m) {
    form.name = m[1]
    form.version = m[2]
  } else {
    form.name = base
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
  fileName.value = ''
  fileSize.value = ''
}

/* 切换上传方式时清空已选文件，避免两种来源混用 */
function switchMode(mode) {
  if (uploadMode.value === mode) return
  uploadMode.value = mode
  clearFile()
  binaryPath.value = ''
  errorMsg.value = ''
}

/* 日志自动滚动到底部 */
function scrollLogToEnd() {
  const el = logRef.value
  if (el) el.scrollTop = el.scrollHeight
}

function stopTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function cancelTask() {
  stopTimer()
  task.state = 'cancelled'
  task.hint = '任务已取消'
  task.logs.push('用户取消了生成任务')
}

/* 任务收尾：写入记录并展示结果 */
function finishTask() {
  stopTimer()
  task.state = 'done'
  task.progress = 100
  task.hint = 'SBOM 生成完成'
  task.logs.push(`SBOM 文档生成完毕（${form.standard} / ${form.format}）`)

  try {
    lastRecord.value = addSbomRecord({
      name: form.name || fileName.value.replace(/\.[^.]+$/, ''),
      version: form.version || '1.0.0',
      fileName: fileName.value,
      fileSize: fileSize.value,
      spec: form.standard,
      outputFormat: form.format,
    })
    clearFile()
    form.name = ''
    form.version = ''

    /* 生成完成后自动跳转到 SBOM 详情页 */
    const targetId = lastRecord.value.id
    window.setTimeout(() => {
      router.push({ name: 'sbom-analysis', query: { id: targetId } })
    }, 600)
  } catch {
    errorMsg.value = '生成失败，请重试'
    task.state = 'cancelled'
  }
}

function handleSubmit() {
  const isBinary = uploadMode.value === 'binary'
  if (isBinary) {
    if (!binaryPath.value.trim() && !fileName.value) {
      errorMsg.value = '请输入二进制文件路径或上传文件'
      return
    }
  } else if (!fileName.value) {
    errorMsg.value = '请先上传源代码压缩包'
    return
  }
  if (generating.value) return

  errorMsg.value = ''
  lastRecord.value = null

  /* 初始化任务卡片 */
  task.visible = true
  task.state = 'running'
  task.progress = 0
  task.hint = isBinary ? '正在解析二进制文件...' : '正在解压源代码包...'
  task.logs = [isBinary ? '开始解析二进制文件...' : '开始解析源代码包...']

  let step = 0
  const langTotal = LANG_LIST.length

  stopTimer()
  timer = window.setInterval(() => {
    if (task.state !== 'running') {
      stopTimer()
      return
    }

    if (step < langTotal) {
      task.logs.push(`分析 ${LANG_LIST[step]} 依赖...`)
      task.hint = '正在检测项目语言...'
      task.progress = Math.min(70, Math.round(4 + ((step + 1) / langTotal) * 66))
      step += 1
    } else if (step === langTotal) {
      task.logs.push('语言检测完成，正在解析组件依赖关系...')
      task.hint = '正在解析依赖关系...'
      task.progress = 80
      step += 1
    } else if (step === langTotal + 1) {
      task.logs.push('依赖解析完成，共识别 34 个组件')
      task.hint = '正在匹配许可证与漏洞库...'
      task.progress = 90
      step += 1
    } else if (step === langTotal + 2) {
      task.logs.push(`正在生成 ${form.standard} 文档（${form.format}）...`)
      task.hint = '正在生成 SBOM 文档...'
      task.progress = 97
      step += 1
    } else {
      finishTask()
    }

    scrollLogToEnd()
  }, 320)
}

onUnmounted(stopTimer)
</script>

<style scoped>
.sbom-gen { display: flex; flex-direction: column; gap: 18px; }

/* 页头 */
.sbg-page-hd { margin-bottom: 0; }
.sbg-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sbg-desc { font-size: 13px; color: #8b919b; margin: 0; line-height: 1.6; }

/* 表单容器 */
.sbg-form { display: flex; flex-direction: column; gap: 16px; }
.sbg-card { display: flex; flex-direction: column; gap: 18px; padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; }

/* 上传方式 Tab（下划线形式） */
.sbg-tabs { display: flex; gap: 4px; margin: -6px 0 2px; border-bottom: 1px solid #e5e7eb; }
.sbg-tab { padding: 10px 18px; margin-bottom: -1px; font-size: 13px; font-weight: 500; color: #8b919b; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s; }
.sbg-tab:hover { color: #374151; }
.sbg-tab.is-active { color: #da203e; border-bottom-color: #da203e; font-weight: 600; }

/* 拖拽上传区 */
.sbg-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; padding: 34px 22px; border: 1.5px dashed #d8dce3; border-radius: 9px; background: #fafbfc; cursor: pointer; transition: border-color .2s, background .2s; }
.sbg-drop:hover, .sbg-drop.is-drag { border-color: #da203e; background: rgba(218,32,62,0.025); }
.sbg-drop-ico { color: #b9bfc9; transition: color .2s; }
.sbg-drop:hover .sbg-drop-ico, .sbg-drop.is-drag .sbg-drop-ico { color: #da203e; }
.sbg-drop-main { font-size: 13px; font-weight: 500; color: #4b5563; margin: 2px 0 0; }
.sbg-drop-sub { font-size: 11px; color: #a8aeb8; margin: 0; }
.sbg-drop.has-file { flex-direction: row; justify-content: flex-start; gap: 12px; padding: 16px 18px; border-style: solid; border-color: #e0e3e8; background: #fff; }
.sbg-file-ico { color: #da203e; display: flex; flex-shrink: 0; }
.sbg-file-info { flex: 1; min-width: 0; }
.sbg-file-name { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sbg-file-size { font-size: 11px; color: #9ca3af; margin: 0; }
.sbg-file-del { padding: 4px 12px; font-size: 12px; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s; }
.sbg-file-del:hover { color: #dc2626; border-color: #fca5a5; }

/* 二进制文件上传区 */
.sbg-bin-drop { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 4px; padding: 22px 20px; border: 1.5px dashed #d8dce3; border-radius: 9px; background: #fafbfc; transition: border-color .2s, background .2s; }
.sbg-bin-drop.is-drag { border-color: #da203e; background: rgba(218,32,62,0.025); }
.sbg-bin-add { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; padding: 0; color: #9ca3af; background: #fff; border: 1px dashed #d8dce3; border-radius: 8px; cursor: pointer; transition: color .2s, border-color .2s; }
.sbg-bin-add:hover { color: #da203e; border-color: #da203e; }
.sbg-bin-tip { font-size: 12px; color: #a8aeb8; margin: 0; }
.sbg-bin-file { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 4px; padding: 10px 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 7px; }
.sbg-bin-file .sbg-file-name { flex: 1; min-width: 0; margin: 0; }
.sbg-bin-file .sbg-file-size { flex-shrink: 0; }

/* 字段 */
.sbg-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.sbg-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.sbg-field--full { grid-column: 1 / -1; }
.sbg-label { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #374151; }
.sbg-opt { font-size: 11px; font-weight: 400; color: #b0b5bd; }
.sbg-hint { font-size: 11px; color: #a8aeb8; margin: 0; line-height: 1.6; }

/* 带前置图标的输入框 */
.sbg-input-wrap { position: relative; display: flex; align-items: center; }
.sbg-input-ico { position: absolute; left: 11px; display: flex; align-items: center; justify-content: center; color: #b0b5bd; pointer-events: none; font-size: 13px; line-height: 1; }
.sbg-input-ico--danger { color: #da203e; font-size: 10px; font-weight: 700; }
.sbg-input { width: 100%; padding: 9px 12px; font-size: 13px; color: #111827; background: #fff; border: 1px solid #e1e4e8; border-radius: 7px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; }
.sbg-input--icon { padding-left: 33px; }
.sbg-input:focus { border-color: #da203e; box-shadow: 0 0 0 3px rgba(218,32,62,0.08); }
.sbg-input::placeholder { color: #c4c9d1; }

/* 输出配置分隔 */
.sbg-divider { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.sbg-divider::after { content: ''; flex: 1; height: 1px; background: #f0f1f3; }
.sbg-divider-label { font-size: 12px; font-weight: 700; color: #da203e; letter-spacing: .04em; }

/* 标签式单选 */
.sbg-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.sbg-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 12.5px; font-weight: 500; color: #4b5563; background: #fff; border: 1px solid #e1e4e8; border-radius: 7px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s, background .2s; }
.sbg-chip:hover { border-color: #c9cdd4; }
.sbg-chip.is-active { color: #da203e; background: rgba(218,32,62,0.06); border-color: #da203e; font-weight: 600; }
.sbg-ai-badge { padding: 0 4px; border-radius: 3px; font-size: 9px; font-weight: 700; color: #fff; background: #da203e; letter-spacing: .04em; }

/* 复选框：默认一行展示，容器变窄时自动换行 */
.sbg-checks { display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px 28px; }
.sbg-check { display: flex; align-items: center; gap: 9px; cursor: pointer; white-space: nowrap; }
.sbg-check-box { width: 15px; height: 15px; flex-shrink: 0; border-radius: 3px; border: 1px solid #d8dce3; color: transparent; font-size: 10px; line-height: 1; display: flex; align-items: center; justify-content: center; background: #fff; transition: background .2s, border-color .2s, color .2s; }
.sbg-check input:checked + .sbg-check-box { background: #da203e; border-color: #da203e; color: #fff; }
.sbg-check-text { font-size: 12.5px; color: #4b5563; }

/* 生成按钮 */
.sbg-submit { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 20px; font-size: 14px; font-weight: 600; color: #fff; background: #da203e; border: none; border-radius: 9px; cursor: pointer; font-family: inherit; letter-spacing: .02em; transition: background .2s, opacity .2s, box-shadow .2s; }
.sbg-submit:hover:not(:disabled) { background: #c01b36; box-shadow: 0 6px 20px rgba(218,32,62,0.22); }
.sbg-submit:disabled { opacity: .5; cursor: not-allowed; }
.sbg-play { font-size: 11px; }
.sbg-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: sbg-spin .7s linear infinite; }
@keyframes sbg-spin { to { transform: rotate(360deg); } }
.sbg-error { font-size: 12px; color: #dc2626; text-align: center; margin: -6px 0 0; }

/* ===== 生成进度卡片 ===== */
.sbg-task { display: flex; flex-direction: column; gap: 12px; padding: 20px 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; }
.sbg-task-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sbg-task-status { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; letter-spacing: -.01em; }
.sbg-task-status.is-done { color: #2f9e57; }
.sbg-task-status.is-cancelled { color: #9ca3af; }
.sbg-task-dot { width: 7px; height: 7px; border-radius: 50%; background: #da203e; flex-shrink: 0; animation: sbg-pulse 1.2s ease-in-out infinite; }
@keyframes sbg-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.8); } }
.sbg-cancel { padding: 6px 14px; font-size: 12px; font-weight: 600; color: #da203e; background: #fff; border: 1px solid rgba(218,32,62,0.45); border-radius: 6px; cursor: pointer; font-family: inherit; transition: background .2s; flex-shrink: 0; }
.sbg-cancel:hover { background: rgba(218,32,62,0.06); }

/* 进度条 */
.sbg-progress { display: flex; align-items: center; gap: 12px; }
.sbg-progress-track { flex: 1; height: 8px; border-radius: 4px; background: #f0f1f3; overflow: hidden; }
.sbg-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #da203e, #e8536b); transition: width .3s ease; }
.sbg-progress-num { min-width: 36px; text-align: right; font-size: 12px; font-weight: 700; color: #da203e; font-variant-numeric: tabular-nums; }
.sbg-progress-hint { font-size: 11.5px; color: #9ca3af; margin: -4px 0 0; }

/* 日志输出区 */
.sbg-log { max-height: 220px; overflow-y: auto; padding: 12px 14px; background: #1e2430; border: 1px solid #2b3240; border-radius: 8px; font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace; font-size: 11.5px; line-height: 1.9; }
.sbg-log-line { display: flex; align-items: center; gap: 8px; color: #b9c2d0; white-space: nowrap; }
.sbg-log-ico { display: flex; align-items: center; color: #7f8a9e; flex-shrink: 0; }
.sbg-log-text { min-width: 0; }
.sbg-log::-webkit-scrollbar { width: 8px; }
.sbg-log::-webkit-scrollbar-track { background: transparent; }
.sbg-log::-webkit-scrollbar-thumb { background: #3a4354; border-radius: 4px; }
.sbg-log::-webkit-scrollbar-thumb:hover { background: #4a5568; }

/* 生成结果 */
.sbg-result { background: #fff; border: 1px solid rgba(218,32,62,0.25); border-radius: 10px; padding: 20px 24px; }
.sbg-result-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sbg-result-badge { padding: 3px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #2f9e57; background: rgba(47,158,87,0.08); }
.sbg-result-id { font-size: 11px; color: #b0b5bd; font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.sbg-result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #f2f3f5; }
.sbg-result-item { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sbg-result-label { font-size: 11px; color: #b0b5bd; }
.sbg-result-value { font-size: 13px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sbg-result-actions { display: flex; gap: 8px; margin-top: 16px; }
.sbg-btn { padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; font-family: inherit; border: 1px solid transparent; transition: background .2s, border-color .2s; }
.sbg-btn--primary { background: #da203e; color: #fff; }
.sbg-btn--primary:hover { background: #c01b36; }
.sbg-btn--ghost { background: #fff; color: #6b7280; border-color: #e5e7eb; }
.sbg-btn--ghost:hover { color: #da203e; border-color: #da203e; }

.sbg-fade-enter-active, .sbg-fade-leave-active { transition: opacity .25s, transform .25s; }
.sbg-fade-enter-from, .sbg-fade-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 820px) {
  .sbg-fields { grid-template-columns: 1fr; }
  .sbg-result-grid { grid-template-columns: repeat(2, 1fr); }
  .sbg-card { padding: 18px; }
}
</style>
