<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">组织信息</h2>
    </div>
    <div class="info-sections">
      <section class="info-section">
        <h3 class="info-section-title">基本信息</h3>
        <dl class="info-dl">
          <div class="info-row">
            <dt>组织名称</dt>
            <dd>{{ org.name }}</dd>
          </div>
          <div class="info-row">
            <dt>行业领域</dt>
            <dd>{{ org.industry }}</dd>
          </div>
          <div class="info-row">
            <dt>组织简介</dt>
            <dd class="info-dd-text">{{ org.description }}</dd>
          </div>
          <div class="info-row">
            <dt>创建时间</dt>
            <dd>{{ org.createdAt }}</dd>
          </div>
        </dl>
      </section>

      <section class="info-section">
        <h3 class="info-section-title">联系信息</h3>
        <dl class="info-dl">
          <div class="info-row">
            <dt>联系邮箱</dt>
            <dd>{{ org.contactEmail || '—' }}</dd>
          </div>
          <div class="info-row">
            <dt>联系电话</dt>
            <dd>{{ org.contactPhone || '—' }}</dd>
          </div>
        </dl>
      </section>
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
  margin-bottom: 20px;
}

.org-tab-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.info-section-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.info-dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 14px;
}

.info-row dt {
  min-width: 90px;
  color: #9ca3af;
  flex-shrink: 0;
  padding-top: 1px;
}

.info-row dd {
  margin: 0;
  color: #374151;
  font-weight: 500;
}

.info-dd-text {
  line-height: 1.6;
}
</style>
