<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">个人设置</h1>
      </div>
    </div>

    <!-- ========== 标签页导航 ========== -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="settings-tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="settings-card">
      <!-- ========== 个人信息 ========== -->
      <div v-if="activeTab === 'profile'" class="settings-form">
        <!-- 头像 -->
        <div class="form-row">
          <span class="form-label">头像</span>
          <div class="form-control">
            <div class="avatar-upload">
              <div class="avatar-preview">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <button type="button" class="btn btn-sm btn-ghost">上传头像</button>
            </div>
          </div>
        </div>

        <!-- 昵称 -->
        <div class="form-row">
          <span class="form-label">昵称 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.nickname"
                type="text"
                class="form-input"
                placeholder="请输入昵称"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑昵称" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 邮件 -->
        <div class="form-row">
          <span class="form-label">邮件 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑邮箱" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 电话 -->
        <div class="form-row">
          <span class="form-label">电话 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.phone"
                type="tel"
                class="form-input"
                placeholder="请输入电话号码"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑电话" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-row">
          <span class="form-label">密码</span>
          <div class="form-control">
            <button type="button" class="btn-link" @click="handleResetPwd">重置密码</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-primary" @click="handleSave">保存修改</button>
        </div>
      </div>

      <!-- ========== 订阅列表 ========== -->
      <div v-if="activeTab === 'subscription'" class="settings-empty">
        <p class="empty-text">暂无订阅列表内容</p>
      </div>

      <!-- ========== 预警信息 ========== -->
      <div v-if="activeTab === 'alert'" class="settings-empty">
        <p class="empty-text">暂无预警信息</p>
      </div>

      <!-- ========== 预警信息设置 ========== -->
      <div v-if="activeTab === 'alert-settings'" class="settings-empty">
        <p class="empty-text">暂无预警信息设置</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: '个人信息' },
  { key: 'subscription', label: '订阅列表' },
  { key: 'alert', label: '预警信息' },
  { key: 'alert-settings', label: '预警信息设置' },
]

const form = reactive({
  nickname: '会饮篇',
  email: 'xluo6019@gmail.com',
  phone: '137****8230',
})

function handleResetPwd() {
  // 后续集成重置密码逻辑
}

function handleSave() {
  // 后续集成保存逻辑
}
</script>

<style scoped>
.settings-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--admin-text, #1a1a1a);
}

/* ========== 标签页 ========== */
.settings-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--admin-border, #e5e7eb);
  margin-bottom: 24px;
}

.settings-tab {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-muted, #6b7280);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
  letter-spacing: 0.5px;
}

.settings-tab:hover {
  color: var(--admin-text, #1a1a1a);
}

.settings-tab.is-active {
  color: var(--admin-primary, #da203e);
  border-bottom-color: var(--admin-primary, #da203e);
}

/* ========== 卡片容器 ========== */
.settings-card {
  background: var(--admin-card, #fff);
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 12px;
  padding: 8px 28px 28px;
}

/* ========== 表单 ========== */
.settings-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-border, #e5e7eb);
}

.form-row:last-of-type {
  border-bottom: none;
}

.form-label {
  width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text, #1a1a1a);
  line-height: 36px;
}

.required {
  color: #dc2626;
  margin-left: 2px;
}

.form-control {
  flex: 1;
  min-width: 0;
}

.form-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-input {
  flex: 1;
  min-width: 0;
  max-width: 360px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 6px;
  background: var(--admin-bg, #fafafa);
  color: var(--admin-text, #1a1a1a);
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--admin-primary, #da203e);
  background: #fff;
}

/* ========== 编辑图标按钮 ========== */
.btn-edit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.btn-edit-icon:hover {
  color: var(--admin-primary, #da203e);
  border-color: var(--admin-primary, #da203e);
}

/* ========== 头像上传 ========== */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--admin-bg, #f3f4f6);
  border: 1px solid var(--admin-border, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  overflow: hidden;
}

/* ========== 按钮（复用项目已有 btn 体系） ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-primary {
  background: var(--admin-primary, #da203e);
  color: #fff;
  border-color: var(--admin-primary, #da203e);
}

.btn-primary:hover {
  background: #b81830;
  border-color: #b81830;
}

.btn-ghost {
  background: transparent;
  color: var(--admin-muted, #6b7280);
  border-color: var(--admin-border, #e5e7eb);
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: var(--admin-text, #1a1a1a);
}

/* ========== 链接样式按钮 ========== */
.btn-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--admin-primary, #da203e);
  cursor: pointer;
  font-family: inherit;
  line-height: 36px;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.form-actions {
  padding-top: 24px;
  display: flex;
  gap: 12px;
}

/* ========== 空状态 ========== */
.settings-empty {
  padding: 48px 0;
  text-align: center;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: var(--admin-muted, #9ca3af);
}
</style>