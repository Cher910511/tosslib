<template>
  <div class="glow-card footer-inner">
    <div class="panel-title panel-title-bar">安全与治理能力</div>
    <div class="metrics">
      <div class="metric">
        <span class="label">检测漏洞总数</span>
        <CountUp :end="data.totalDetected" :duration="2500" class="value" />
      </div>
      <div class="metric">
        <span class="label">未修复漏洞数</span>
        <CountUp :end="data.unfixed" :duration="2200" class="value warn" />
      </div>
      <div class="metric">
        <span class="label">漏洞修复率</span>
        <CountUp :end="data.fixRate" :decimals="1" :duration="2000" suffix="%" class="value ok" :use-locale="true" />
      </div>
      <div class="metric">
        <span class="label">SBOM 覆盖率</span>
        <CountUp :end="data.sbomCoverage" :decimals="1" :duration="2000" suffix="%" class="value ok" :use-locale="true" />
      </div>
      <div class="metric">
        <span class="label">高风险组件数量</span>
        <CountUp :end="data.highRiskComponents" :duration="2200" class="value danger" />
      </div>
    </div>
  </div>
</template>

<script setup>
import CountUp from './CountUp.vue'
defineProps({ data: Object })
</script>

<style scoped>
.footer-inner {
  height: 100%;
  padding: 14px 22px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-title-bar {
  font-size: 17px !important;
  letter-spacing: 4px !important;
  margin-bottom: 12px !important;
  flex-shrink: 0;
}
.metrics {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
  gap: 14px;
  min-height: 0;
}
.metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  background: linear-gradient(180deg, rgba(0, 60, 120, 0.4) 0%, rgba(0, 25, 55, 0.55) 100%);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow:
    0 0 20px rgba(0, 150, 255, 0.08),
    inset 0 0 20px rgba(0, 80, 160, 0.1);
}
.label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: center;
  line-height: 1.3;
}
.value {
  font-family: 'Orbitron', sans-serif;
  font-size: 34px;
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 24px rgba(0, 212, 255, 0.45);
  line-height: 1.1;
}
.value.warn { color: var(--warning); }
.value.ok { color: var(--success); }
.value.danger { color: var(--danger); }
</style>
