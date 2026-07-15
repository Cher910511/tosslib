<template>
  <div class="apikey-page">
    <!-- ========== 页面标题 ========== -->
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">密钥管理</h1>
        <p class="page-desc">管理你的 API 密钥，用于调用 OpenAPI 接口进行身份认证。</p>
      </div>
      <button type="button" class="btn btn-primary" @click="openCreateDialog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        创建密钥
      </button>
    </div>

    <!-- ========== 密钥列表 ========== -->
    <div class="apikey-card">
      <div v-if="keys.length === 0" class="empty-state">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
        <p class="empty-text">暂无 API 密钥</p>
        <p class="empty-sub">点击上方「创建密钥」按钮生成你的第一个密钥</p>
      </div>

      <table v-else class="apikey-table">
        <thead>
          <tr>
            <th class="col-name">名称</th>
            <th class="col-key">密钥</th>
            <th class="col-created">创建时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in keys" :key="key.id">
            <td class="col-name">
              <span class="key-name">{{ key.name }}</span>
            </td>
            <td class="col-key">
              <code class="key-value">{{ maskKey(key.value) }}</code>
            </td>
            <td class="col-created">{{ key.createdAt }}</td>
            <td class="col-actions">
              <div class="action-btns">
                <button
                  type="button"
                  class="btn btn-sm btn-ghost"
                  @click="confirmEdit(key)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline"
                  @click="confirmDelete(key)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 创建密钥弹窗 ========== -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="closeCreateDialog">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="create-dialog-title">
        <div class="dialog-header">
          <h2 id="create-dialog-title">创建 API 密钥</h2>
          <button type="button" class="dialog-close" aria-label="关闭" @click="closeCreateDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 第一步：输入名称 -->
        <template v-if="!generatedKey">
          <div class="dialog-body">
            <div class="form-group">
              <label class="form-label" for="key-name-input">密钥名称</label>
              <input
                id="key-name-input"
                v-model="newKeyName"
                type="text"
                class="form-input"
                placeholder="例如：开发环境、CI/CD 流水线"
                maxlength="50"
                @keyup.enter="doGenerate"
              />
            </div>
            <p class="form-hint">密钥名称帮助你在多个密钥之间区分用途，最多 50 个字符。</p>
          </div>
          <div class="dialog-footer">
            <button type="button" class="btn btn-ghost" @click="closeCreateDialog">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!newKeyName.trim()"
              @click="doGenerate"
            >
              生成密钥
            </button>
          </div>
        </template>

        <!-- 第二步：展示密钥，无复制按钮 -->
        <template v-else>
          <div class="dialog-body">
            <div class="generated-notice">
              <svg class="generated-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p class="generated-text">
                密钥已生成！<strong>请手动选中并复制</strong>，关闭此窗口后将无法再次查看完整密钥。
              </p>
            </div>
            <div class="generated-key-box">
              <code class="generated-key-value" @click="selectAll">{{ generatedKey }}</code>
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" class="btn btn-ghost" @click="closeCreateDialog">关闭</button>
            <button type="button" class="btn btn-primary" @click="copyGeneratedKey">
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== 编辑密钥弹窗 ========== -->
    <div v-if="showEditDialog" class="dialog-overlay" @click.self="closeEditDialog">
      <div class="dialog dialog-sm" role="dialog" aria-modal="true">
        <div class="dialog-header">
          <h2>编辑密钥名称</h2>
          <button type="button" class="dialog-close" aria-label="关闭" @click="closeEditDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label" for="edit-key-name-input">密钥名称</label>
            <input
              id="edit-key-name-input"
              v-model="editKeyName"
              type="text"
              class="form-input"
              placeholder="请输入新的密钥名称"
              maxlength="50"
              @keyup.enter="doEdit"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button type="button" class="btn btn-ghost" @click="closeEditDialog">取消</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!editKeyName.trim()"
            @click="doEdit"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 确认删除弹窗 ========== -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="showDeleteDialog = false">
      <div class="dialog dialog-sm" role="dialog" aria-modal="true">
        <div class="dialog-header">
          <h2>确认删除</h2>
          <button type="button" class="dialog-close" aria-label="关闭" @click="showDeleteDialog = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="dialog-body">
          <p>确定要删除密钥「{{ deleteTarget?.name }}」吗？</p>
          <p class="dialog-warning">使用该密钥的应用将立即无法调用 OpenAPI 接口，此操作不可撤销。</p>
        </div>
        <div class="dialog-footer">
          <button type="button" class="btn btn-ghost" @click="showDeleteDialog = false">取消</button>
          <button type="button" class="btn btn-danger" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- ========== Toast ========== -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="'toast--' + toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/* ==================== 密钥数据 ==================== */
const keys = ref([])
const STORAGE_KEY = 'tosslib_apikeys'

function loadKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    keys.value = raw ? JSON.parse(raw) : []
  } catch {
    keys.value = []
  }
}

function saveKeys() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys.value))
}

/* ==================== 创建密钥 ==================== */
const showCreateDialog = ref(false)
const newKeyName = ref('')
const generatedKey = ref('')
const copied = ref(false)

function openCreateDialog() {
  newKeyName.value = ''
  generatedKey.value = ''
  copied.value = false
  showCreateDialog.value = true
}

function closeCreateDialog() {
  showCreateDialog.value = false
  generatedKey.value = ''
}

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let random = ''
  for (let i = 0; i < 40; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `sk_live_${random}`
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function doGenerate() {
  const name = newKeyName.value.trim()
  if (!name) return

  const value = generateApiKey()

  keys.value.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    value,
    createdAt: formatDate(new Date()),
  })
  saveKeys()
  generatedKey.value = value
}

function selectAll(e) {
  const el = e.currentTarget
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

function copyGeneratedKey() {
  navigator.clipboard.writeText(generatedKey.value).then(() => {
    copied.value = true
  }).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = generatedKey.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
  })
}

/* ==================== 编辑密钥 ==================== */
const showEditDialog = ref(false)
const editTarget = ref(null)
const editKeyName = ref('')

function confirmEdit(key) {
  editTarget.value = key
  editKeyName.value = key.name
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editTarget.value = null
}

function doEdit() {
  const name = editKeyName.value.trim()
  if (!name || !editTarget.value) return
  editTarget.value.name = name
  saveKeys()
  showToast('success', `密钥名称已更新为「${name}」`)
  showEditDialog.value = false
  editTarget.value = null
}

/* ==================== 删除密钥 ==================== */
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)

function confirmDelete(key) {
  deleteTarget.value = key
  showDeleteDialog.value = true
}

function doDelete() {
  const target = deleteTarget.value
  if (!target) return
  keys.value = keys.value.filter(item => item.id !== target.id)
  saveKeys()
  showToast('success', `密钥「${target.name}」已删除`)
  showDeleteDialog.value = false
  deleteTarget.value = null
}

/* ==================== 工具函数 ==================== */
function maskKey(key) {
  if (key.length <= 12) return key
  return key.slice(0, 8) + '••••••••••••' + key.slice(-4)
}

/* ==================== Toast ==================== */
const toast = ref(null)
let toastTimer = null

function showToast(type, message) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { type, message }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3000)
}

onMounted(() => {
  loadKeys()
})
</script>

<style scoped>
.apikey-page {
  padding: 0 4px 32px;
}

/* ——— 页面标题 ——— */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}
.page-header-text {
  flex: 1;
  min-width: 0;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #111827;
}
.page-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* ——— 按钮 ——— */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  line-height: 1.4;
  font-family: inherit;
}
.btn-primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.btn-primary:hover {
  background: #b81830;
  border-color: #b81830;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-outline {
  background: transparent;
  color: #da203e;
  border-color: #da203e;
}
.btn-outline:hover {
  background: #fef2f3;
}
.btn-ghost {
  background: transparent;
  color: #6b7280;
  border-color: transparent;
}
.btn-ghost:hover {
  background: #f3f4f6;
}
.btn-danger {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
}
.btn-danger:hover {
  background: #b91c1c;
}
.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

/* ——— 密钥卡片（表格容器） ——— */
.apikey-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* ——— 空状态 ——— */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
}
.empty-icon {
  margin-bottom: 16px;
  color: #d1d5db;
}
.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px;
}
.empty-sub {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* ——— 表格 ——— */
.apikey-table {
  width: 100%;
  border-collapse: collapse;
}
.apikey-table th {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.apikey-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.apikey-table tr:last-child td {
  border-bottom: none;
}
.key-name {
  font-weight: 500;
}
.key-value {
  font-size: 13px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 6px;
  user-select: all;
}

.col-name { width: 18%; }
.col-key { width: 42%; }
.col-created { width: 22%; }
.col-actions { width: 18%; }
.action-btns {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ——— 弹窗 ——— */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.dialog {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.dialog-sm {
  max-width: 400px;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}
.dialog-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}
.dialog-close:hover {
  background: #f3f4f6;
  color: #374151;
}
.dialog-body {
  padding: 20px 24px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 24px 20px;
}
.dialog-warning {
  margin: 8px 0 0;
  font-size: 13px;
  color: #dc2626;
  line-height: 1.5;
}

/* ——— 表单 ——— */
.form-group {
  margin-bottom: 8px;
}
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;
  background: #fff;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.1);
}
.form-hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

/* ——— 生成后提示 ——— */
.generated-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-bottom: 16px;
}
.generated-icon {
  flex-shrink: 0;
  color: #d97706;
  margin-top: 1px;
}
.generated-text {
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}
.generated-key-box {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
}
.generated-key-value {
  display: block;
  font-size: 13px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  color: #374151;
  word-break: break-all;
  line-height: 1.6;
  cursor: text;
  user-select: all;
}

/* ——— Toast ——— */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  pointer-events: none;
}
.toast--success {
  background: #059669;
  color: #fff;
}
.toast--error {
  background: #dc2626;
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* ——— 响应式 ——— */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
  .apikey-table th,
  .apikey-table td {
    padding: 10px 12px;
  }
  .col-key { width: auto; }
  .col-created { display: none; }
}
</style>
