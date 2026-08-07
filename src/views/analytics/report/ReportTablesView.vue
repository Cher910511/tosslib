<template>
  <div class="tables-page">
    <!-- <section class="map-block glow-card">
      <div class="panel-title">开发者与仓库地理分布（世界地图）</div>
      <WorldMapChart
        class="map-chart"
        :developer-data="developerCountryData"
        :repo-data="repoCountryData"
      />
    </section> -->

    <SortableReportTable
      title="1. 制品统计表"
      :columns="colsComponent"
      :rows="rowsComponent"
      export-filename="制品统计表"
      no-export
    />

    <SortableReportTable
      title="2. 软件统计表"
      :columns="colsRepo"
      :rows="rowsRepo"
      export-filename="软件统计表"
      no-export
    />

    <SortableReportTable
      title="3. 最新漏洞报表"
      :columns="colsVuln"
      :rows="rowsVuln"
      export-filename="最新漏洞报表"
    />

    <section class="annual glow-card">
      <div class="annual-head">
        <h3 class="annual-title">4. 年度趋势表</h3>
        <span class="annual-hint">附：近五年漏洞总数趋势</span>
      </div>
      <div class="annual-chart">
        <VulnerabilityTrend :data="annualVulnTrend" />
      </div>
      <SortableReportTable
        embedded
        :columns="colsAnnual"
        :rows="rowsAnnual"
        export-filename="年度趋势表"
      />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SortableReportTable from './SortableReportTable.vue'
import VulnerabilityTrend from '../../../components/VulnerabilityTrend.vue'
import {
  latestCVEList,
  reportComponentStats,
  reportRepoStats,
  reportAnnualTrends,
} from '../../../data/mockData.js'

const colsVuln = [
  { key: 'vuln_public_id', label: '漏洞编号' },
  { key: 'comp_name', label: '软件名称' },
  { key: 'version_number', label: '版本号' },
  { key: 'comp_vendor', label: '厂商' },
  { key: 'comp_platform', label: '平台' },
  { key: 'vuln_score', label: '风险评分' },
  { key: 'vuln_created_at', label: '发布时间' },
  { key: 'vuln_cwe_id', label: 'CWE 弱点类型' },
]

const colsComponent = [
  { key: 'name', label: '制品名称' },
  { key: 'version', label: '制品版本' },
  { key: 'groupId', label: '组织编号' },
  { key: 'language', label: '编程语言' },
  { key: 'license', label: '开源许可证' },
]

const colsRepo = [
  { key: 'name', label: '软件名称' },
  { key: 'score', label: '最新版本评分' },
  { key: 'industry', label: '行业分类' },
  { key: 'vulnCount', label: '最新版本漏洞数' },
  { key: 'developer', label: '开发商' },
  { key: 'lang', label: '编程语言' },
]

const colsAnnual = [
  { key: 'year', label: '年份' },
  { key: 'vulnTotal', label: '漏洞总数' },
  { key: 'high', label: '高危' },
  { key: 'medium', label: '中危' },
  { key: 'low', label: '低危' },
]

/** 标准表格每表最多展示条数 */
const ROW_LIMIT = 5

const rowsComponent = computed(() => reportComponentStats.slice(0, ROW_LIMIT))
const rowsRepo = computed(() => reportRepoStats.slice(0, ROW_LIMIT))
const rowsVuln = computed(() => latestCVEList.slice(0, ROW_LIMIT))
const rowsAnnual = computed(() => reportAnnualTrends.slice(0, ROW_LIMIT))

const annualVulnTrend = computed(() =>
  rowsAnnual.value.map((d) => ({ year: d.year, count: d.vulnTotal }))
)
</script>

<style scoped>
.tables-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
  background: transparent;
}
.map-block {
  padding: 12px 14px 16px;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.map-chart {
  flex: 1;
  min-height: 360px;
}
/* 与报表卡片一致：避免 glow-card 默认 overflow:hidden 影响整页滚动体验 */
.annual.glow-card {
  overflow: visible;
}
.lead {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.annual {
  padding: 14px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.annual-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
}
.annual-title {
  margin: 0;
  font-size: 15px;
  color: var(--accent-cyan);
  letter-spacing: 2px;
}
.annual-hint {
  font-size: 12px;
  color: var(--text-secondary);
}
.annual-chart {
  height: 220px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  padding: 8px 10px 4px;
}
</style>
