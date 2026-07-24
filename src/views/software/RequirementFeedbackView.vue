<template>
  <div class="feedback-page">
    <div class="feedback-page-header">
      <h1 class="feedback-page-title">需求反馈</h1>
      <p class="feedback-page-subtitle">
        向我们提交您在使用过程中遇到的问题、缺失的资源或改进建议，我们会尽快处理您的反馈
      </p>
    </div>

    <form class="feedback-form-card" novalidate @submit.prevent="submitFeedback">
      <!-- 联系方式 -->
      <div class="feedback-field">
        <label class="feedback-label" for="feedback-contact">
          联系方式
          <span class="feedback-required" aria-hidden="true">*</span>
        </label>
        <input
          id="feedback-contact"
          v-model.trim="form.contact"
          type="text"
          class="feedback-input"
          placeholder="请输入您的手机号或邮箱"
          :class="{ 'is-invalid': shouldValidate && errors.contact }"
          @blur="touch"
        />
        <p v-if="shouldValidate && errors.contact" class="feedback-error">{{ errors.contact }}</p>
      </div>

      <!-- 反馈类型 -->
      <div class="feedback-field">
        <label class="feedback-label" for="feedback-type">
          反馈类型
          <span class="feedback-required" aria-hidden="true">*</span>
        </label>
        <select
          id="feedback-type"
          v-model="form.type"
          class="feedback-select"
          :class="{ 'is-invalid': shouldValidate && errors.type }"
          @change="touch"
        >
          <option v-for="item in FEEDBACK_TYPES" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
        <p v-if="shouldValidate && errors.type" class="feedback-error">{{ errors.type }}</p>
      </div>

      <!-- 缺失资源名称（仅「资源缺失」时出现） -->
      <Transition name="feedback-collapse">
        <div v-if="isResourceMissing" class="feedback-field">
          <label class="feedback-label" for="feedback-res-name">
            缺失资源名称
            <span class="feedback-required" aria-hidden="true">*</span>
          </label>
          <input
            id="feedback-res-name"
            v-model.trim="form.resourceName"
            type="text"
            class="feedback-input"
            placeholder="请输入名称"
            :class="{ 'is-invalid': shouldValidate && errors.resourceName }"
            @blur="touch"
          />
          <p v-if="shouldValidate && errors.resourceName" class="feedback-error">
            {{ errors.resourceName }}
          </p>
        </div>
      </Transition>

      <!-- 缺失资源开源社区托管地址（仅「资源缺失」时出现） -->
      <Transition name="feedback-collapse">
        <div v-if="isResourceMissing" class="feedback-field">
          <label class="feedback-label" for="feedback-res-url">
            缺失资源开源社区托管地址
            <span class="feedback-required" aria-hidden="true">*</span>
          </label>
          <input
            id="feedback-res-url"
            v-model.trim="form.resourceUrl"
            type="url"
            inputmode="url"
            class="feedback-input"
            placeholder="请输入地址"
            :class="{ 'is-invalid': shouldValidate && errors.resourceUrl }"
            @blur="touch"
          />
          <p v-if="shouldValidate && errors.resourceUrl" class="feedback-error">
            {{ errors.resourceUrl }}
          </p>
        </div>
      </Transition>

      <!-- 反馈内容 -->
      <div class="feedback-field">
        <label class="feedback-label" for="feedback-content">
          反馈内容
          <span class="feedback-required" aria-hidden="true">*</span>
        </label>
        <div class="feedback-textarea-wrap">
          <textarea
            id="feedback-content"
            v-model="form.content"
            class="feedback-textarea"
            rows="5"
            maxlength="300"
            placeholder="请输入内容"
            :class="{ 'is-invalid': shouldValidate && errors.content }"
            @blur="touch"
          ></textarea>
          <span class="feedback-counter" :class="{ 'is-max': isContentMax }" aria-hidden="true">
            {{ contentLength }}/300
          </span>
        </div>
        <p v-if="shouldValidate && errors.content" class="feedback-error">{{ errors.content }}</p>
      </div>

      <!-- 提交按钮 -->
      <div class="feedback-actions">
        <button type="submit" class="feedback-submit" :disabled="!canSubmit">
          {{ submitting ? '提交中…' : '提交反馈' }}
        </button>
        <Transition name="feedback-msg">
          <span v-if="submitted" class="feedback-success">已提交，感谢您的反馈</span>
        </Transition>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue'

// 反馈类型：集中维护，模板与校验共用，避免魔法字符串
const FEEDBACK_TYPES = [
  { value: 'resource-missing', label: '资源缺失' },
  { value: 'feature', label: '功能需求' },
  { value: 'experience', label: '使用体验' },
  { value: 'exception', label: '异常反馈' },
  { value: 'permission', label: '权限安全' },
  { value: 'account', label: '账号登录' },
  { value: 'other', label: '其他' },
]

const RESOURCE_MISSING = 'resource-missing'

// 联系方式：手机号或邮箱
const CONTACT_PHONE_RE = /^1[3-9]\d{9}$/
const CONTACT_EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/
// URL：http:// 或 https://
const URL_RE = /^https?:\/\/.+/i

const MAX_CONTENT = 300

const DEFAULT_FORM = () => ({
  contact: '',
  type: 'feature',
  resourceName: '',
  resourceUrl: '',
  content: '',
})

const submitting = ref(false)
const submitted = ref(false)
const touched = ref(false)

const form = reactive(DEFAULT_FORM())

// 用 computed 而非内联表达式，模板更干净、响应式更精确
const isResourceMissing = computed(() => form.type === RESOURCE_MISSING)
const contentLength = computed(() => form.content.length)
const isContentMax = computed(() => contentLength.value >= MAX_CONTENT)
// 表单被blur/提交过才显示错误，避免字段一出现就标红
const shouldValidate = computed(() => touched.value || submitting.value)

const errors = computed(() => {
  const err = {}
  // 联系方式
  if (!form.contact) {
    err.contact = '请输入联系方式'
  } else if (!CONTACT_PHONE_RE.test(form.contact) && !CONTACT_EMAIL_RE.test(form.contact)) {
    err.contact = '请输入正确的手机号或邮箱'
  }
  // 反馈类型
  if (!form.type) err.type = '请选择反馈类型'
  // 缺失资源相关字段（仅资源缺失）
  if (isResourceMissing.value) {
    if (!form.resourceName) err.resourceName = '请输入缺失资源名称'
    if (!form.resourceUrl) {
      err.resourceUrl = '请输入缺失资源开源社区托管地址'
    } else if (!URL_RE.test(form.resourceUrl)) {
      err.resourceUrl = '请输入有效的 URL 地址（以 http:// 或 https:// 开头）'
    }
  }
  // 反馈内容：trim 后为空才算未填，避免与计数器割裂
  if (!form.content.trim()) err.content = '请输入反馈内容'
  return err
})

// 校验未通过时按钮也禁用，避免点击无效提交
const canSubmit = computed(
  () => !submitting.value && Object.keys(errors.value).length === 0,
)

// 复用定时器：切换页/连续提交时只保留一个，避免残留定时器误清状态
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

function resetForm() {
  Object.assign(form, DEFAULT_FORM())
  touched.value = false
}

async function submitFeedback() {
  // 提交前先触发完整校验
  touched.value = true
  if (!canSubmit.value) return

  submitting.value = true
  try {
    // 模拟提交：后续接入 services/api.js 的真实接口
    await new Promise((resolve) => setTimeout(resolve, 600))
    submitted.value = true
    resetForm()
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
.feedback-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 8px 4px 32px;
}

.feedback-page-header {
  margin-bottom: 24px;
}

.feedback-page-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
}

.feedback-page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
}

.feedback-form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.feedback-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feedback-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.feedback-required {
  margin-left: 2px;
  color: #da203e;
}

.feedback-input,
.feedback-select,
.feedback-textarea {
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

.feedback-input::placeholder,
.feedback-textarea::placeholder {
  color: #9ca3af;
}

.feedback-input:focus,
.feedback-select:focus,
.feedback-textarea:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.feedback-input.is-invalid,
.feedback-select.is-invalid,
.feedback-textarea.is-invalid {
  border-color: #dc2626;
}

.feedback-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
}

.feedback-textarea-wrap {
  position: relative;
}

.feedback-textarea {
  resize: vertical;
  min-height: 120px;
  width: 100%;
  display: block;
}

.feedback-counter {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.feedback-counter.is-max {
  color: #dc2626;
}

.feedback-error {
  margin: 0;
  font-size: 12px;
  color: #dc2626;
  line-height: 1.4;
}

.feedback-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 4px;
}

.feedback-submit {
  padding: 9px 28px;
  border: none;
  border-radius: 8px;
  background: #da203e;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, background 0.15s;
}

.feedback-submit:hover:not(:disabled) {
  filter: brightness(1.08);
}

.feedback-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.feedback-success {
  font-size: 13px;
  color: #16a34a;
  font-weight: 500;
}

/* 字段折叠动画 */
.feedback-collapse-enter-active,
.feedback-collapse-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.feedback-collapse-enter-from,
.feedback-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.feedback-msg-enter-active,
.feedback-msg-leave-active {
  transition: opacity 0.2s ease;
}
.feedback-msg-enter-from,
.feedback-msg-leave-to {
  opacity: 0;
}

/* �响应式 */
@media (max-width: 640px) {
  .feedback-page {
    padding: 0 0 24px;
  }
  .feedback-form-card {
    padding: 18px 16px;
    gap: 14px;
  }
}
</style>
