<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">预警信息设置</h2>
    </div>
    <p class="org-tab-hint">配置漏洞预警通知的接收方式、频率和范围。当前为演示配置，将在接入后端后生效。</p>

    <div class="alert-form">
      <div class="alert-form-section">
        <h3 class="alert-form-section-title">通知方式</h3>
        <label class="alert-form-row">
          <input type="checkbox" checked />
          <span>邮件通知</span>
        </label>
        <label class="alert-form-row">
          <input type="checkbox" checked />
          <span>站内消息</span>
        </label>
        <label class="alert-form-row">
          <input type="checkbox" />
          <span>企业微信</span>
        </label>
        <label class="alert-form-row">
          <input type="checkbox" />
          <span>钉钉</span>
        </label>
      </div>

      <div class="alert-form-section">
        <h3 class="alert-form-section-title">预警等级</h3>
        <label class="alert-form-row">
          <input type="checkbox" checked />
          <span class="alert-level-dot alert-level-dot--critical" /> 严重漏洞
        </label>
        <label class="alert-form-row">
          <input type="checkbox" checked />
          <span class="alert-level-dot alert-level-dot--high" /> 高危漏洞
        </label>
        <label class="alert-form-row">
          <input type="checkbox" checked />
          <span class="alert-level-dot alert-level-dot--medium" /> 中危漏洞
        </label>
        <label class="alert-form-row">
          <input type="checkbox" />
          <span class="alert-level-dot alert-level-dot--low" /> 低危漏洞
        </label>
      </div>

      <div class="alert-form-section">
        <h3 class="alert-form-section-title">通知频率</h3>
        <label class="alert-form-row">
          <input type="radio" name="freq" checked />
          <span>实时通知</span>
        </label>
        <label class="alert-form-row">
          <input type="radio" name="freq" />
          <span>每日汇总</span>
        </label>
        <label class="alert-form-row">
          <input type="radio" name="freq" />
          <span>每周汇总</span>
        </label>
      </div>

      <div class="alert-form-actions">
        <button type="button" class="alert-save-btn">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ org: { type: Object, required: true } })
</script>

<style scoped>
.org-tab-content {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
}

.org-tab-header {
  margin-bottom: 8px;
}

.org-tab-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.org-tab-hint {
  margin: 0 0 24px;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
}

.alert-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.alert-form-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.alert-form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.alert-form-section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.alert-form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.alert-form-row input[type="checkbox"],
.alert-form-row input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #da203e;
}

.alert-level-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.alert-level-dot--critical { background: #dc2626; }
.alert-level-dot--high { background: #ea580c; }
.alert-level-dot--medium { background: #2563eb; }
.alert-level-dot--low { background: #16a34a; }

.alert-form-actions {
  padding-top: 8px;
}

.alert-save-btn {
  padding: 8px 28px;
  border: none;
  border-radius: 8px;
  background: #da203e;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s;
}

.alert-save-btn:hover {
  filter: brightness(1.05);
}
</style>
