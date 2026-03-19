<template>
  <div class="overview">
    <div class="panel-title panel-title-hero">平台规模概览</div>
    <div class="grid">
      <div class="item">
        <span class="label">代码仓库数</span>
        <CountUp :end="data.repoCount" :duration="2200" class="value" />
      </div>
      <div class="item">
        <span class="label">组件制品数</span>
        <CountUp :end="data.componentCount" :duration="2200" class="value" />
      </div>
      <div class="item">
        <span class="label">开发者人数</span>
        <CountUp :end="data.developerCount" :duration="2200" class="value" />
      </div>
      <div class="item">
        <span class="label">覆盖托管平台数</span>
        <CountUp :end="data.hostingPlatforms" :duration="1800" class="value" />
      </div>
      <div class="item">
        <span class="label">覆盖语言生态数</span>
        <CountUp :end="data.languageEcosystems" :duration="1800" class="value" />
      </div>
      <div class="item item-with-hint">
        <span class="label">覆盖华为开源中心仓</span>
        <CountUp :end="data.huaweiCenterCoverage" :duration="1800" class="value" />
        <span class="hint">覆盖华为开源中心仓库95%的开源软件</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import CountUp from './CountUp.vue'
defineProps({ data: Object })
</script>

<style scoped>
.overview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-title-hero {
  font-size: 17px !important;
  letter-spacing: 4px !important;
  margin-bottom: 14px !important;
  padding-bottom: 10px !important;
  border-bottom: 1px solid rgba(0, 212, 255, 0.25);
}
.grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
  min-height: 0;
}
.item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(145deg, rgba(0, 70, 140, 0.35) 0%, rgba(0, 30, 70, 0.45) 100%);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.28);
  box-shadow:
    inset 0 0 24px rgba(0, 80, 160, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.2);
}
.label {
  font-size: 20px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.value {
  font-size: 32px;
  color: var(--accent-cyan);
  line-height: 1.2;
}
.item-with-hint {
  gap: 6px;
}
.hint {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(126, 184, 224, 0.75);
  letter-spacing: 0.5px;
  margin-top: 2px;
}
</style>
