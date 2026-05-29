<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">需求反馈</h2>
      <p class="org-tab-subtitle">向平台方提交功能需求、建议或问题反馈</p>
    </div>

    <div class="feedback-form">
      <div class="feedback-field">
        <label class="feedback-label">反馈类型</label>
        <select v-model="form.type" class="feedback-select">
          <option value="feature">功能需求</option>
          <option value="bug">问题/Bug 报告</option>
          <option value="improve">改进建议</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div class="feedback-field">
        <label class="feedback-label">反馈标题</label>
        <input v-model="form.title" type="text" class="feedback-input" placeholder="请输入标题..." />
      </div>
      <div class="feedback-field">
        <label class="feedback-label">反馈内容</label>
        <textarea v-model="form.content" class="feedback-textarea" rows="5" placeholder="请详细描述您的需求、问题或建议..." />
      </div>
      <div class="feedback-actions">
        <button type="button" class="feedback-submit" @click="submitFeedback">提交反馈</button>
        <span v-if="submitted" class="feedback-success">已提交，感谢您的反馈</span>
      </div>
    </div>

    <div class="feedback-history">
      <h3 class="feedback-history-title">历史反馈</h3>
      <div v-if="history.length === 0" class="feedback-history-empty">暂无历史反馈</div>
      <div v-for="item in history" :key="item.id" class="feedback-item">
        <div class="feedback-item-head">
          <span class="feedback-item-type feedback-item-type--{{ item.type }}">{{ typeLabel(item.type) }}</span>
          <span class="feedback-item-time">{{ item.time }}</span>
          <span class="feedback-item-status" :class="'feedback-item-status--' + item.status">{{ statusLabel(item.status) }}</span>
        </div>
        <h4 class="feedback-item-title">{{ item.title }}</h4>
        <p class="feedback-item-content">{{ item.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ org: { type: Object, required: true } })

const submitted = ref(false)
const form = ref({ type: 'feature', title: '', content: '' })

const history = [
  { id: 1, type: 'feature', title: '希望支持更多的语言扫描规则', content: '当前支持的编程语言还不够全面，建议增加对 Rust、Kotlin 等的扫描支持。', time: '2026-05-20', status: 'resolved' },
  { id: 2, type: 'improve', title: '版本火车界面优化建议', content: '版本火车的软件列表建议增加批量导入功能，目前手动添加效率较低。', time: '2026-05-15', status: 'processing' },
]

function typeLabel(t) { return { feature: '功能需求', bug: 'Bug 报告', improve: '改进建议', other: '其他' }[t] || t }
function statusLabel(s) { return { resolved: '已处理', processing: '处理中', pending: '待处理' }[s] || s }

function submitFeedback() {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  submitted.value = true
  setTimeout(() => { submitted.value = false }, 3000)
}
</script>

<style scoped>
.org-tab-content {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
}

.org-tab-header {
  margin-bottom: 20px;
}

.org-tab-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.org-tab-subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 24px;
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

.feedback-input,
.feedback-select,
.feedback-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: border-color 0.2s;
}

.feedback-input:focus,
.feedback-select:focus,
.feedback-textarea:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
}

.feedback-textarea {
  resize: vertical;
  min-height: 100px;
}

.feedback-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.feedback-submit {
  padding: 8px 24px;
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

.feedback-submit:hover { filter: brightness(1.05); }

.feedback-success {
  font-size: 13px;
  color: #16a34a;
  font-weight: 500;
}

.feedback-history-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.feedback-history-empty {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.feedback-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.feedback-item:last-child { border-bottom: none; }

.feedback-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.feedback-item-type {
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #f3f4f6;
  color: #374151;
}

.feedback-item-time {
  font-size: 12px;
  color: #9ca3af;
}

.feedback-item-status {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
}

.feedback-item-status--resolved { color: #16a34a; }
.feedback-item-status--processing { color: #d97706; }
.feedback-item-status--pending { color: #6b7280; }

.feedback-item-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.feedback-item-content {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
</style>
