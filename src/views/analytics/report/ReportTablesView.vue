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
      title="1. 组件统计表"
      :columns="colsComponent"
      :rows="rowsComponent"
      export-filename="组件统计表"
    />

    <SortableReportTable
      title="2. 软件统计表"
      :columns="colsRepo"
      :rows="rowsRepo"
      export-filename="软件统计表"
    />

    <SortableReportTable
      title="3. 最新漏洞报表"
      :columns="colsVuln"
      :rows="rowsVuln"
      export-filename="最新漏洞报表"
    />

    <SortableReportTable
      title="4. 开发者分布表"
      :columns="colsDev"
      :rows="rowsDev"
      export-filename="开发者分布表"
    />

    <SortableReportTable
      title="5. 漏洞覆盖组件表"
      :columns="colsCoverage"
      :rows="rowsCoverage"
      export-filename="漏洞覆盖组件表"
    />

    <section class="annual glow-card">
      <div class="annual-head">
        <h3 class="annual-title">6. 年度趋势表</h3>
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
  reportDeveloperStats,
  reportVulnCoverage,
  reportAnnualTrends,
} from '../../../data/mockData.js'

const colsVuln = [
  { key: 'cveId', label: 'CVE ID' },
  { key: 'level', label: '漏洞级别' },
  { key: 'component', label: '影响组件' },
  { key: 'fixStatus', label: '修复状态' },
  { key: 'publishTime', label: '发布时间' },
  { key: 'description', label: '漏洞描述' },
]

const colsComponent = [
  { key: 'name', label: '组件名称' },
  { key: 'version', label: '版本' },
  { key: 'groupId', label: 'GroupID' },
  { key: 'language', label: '主语言' },
  { key: 'license', label: '许可证' },
  { key: 'industry', label: '行业分类' },
]

const colsRepo = [
  { key: 'name', label: '仓库名称' },
  { key: 'platform', label: '托管平台' },
  { key: 'country', label: '所属国家' },
  { key: 'industry', label: '行业' },
  { key: 'devCount', label: '开发者数量' },
]

const colsDev = [
  { key: 'name', label: '开发者名称' },
  { key: 'country', label: '所在国家' },
  { key: 'repoCount', label: '参与仓库数' },
  { key: 'componentCount', label: '贡献组件数' },
]

const colsCoverage = [
  { key: 'component', label: '组件名称' },
  { key: 'cves', label: '涉及漏洞' },
  { key: 'level', label: '漏洞级别' },
  { key: 'fixStatus', label: '修复状态' },
]

const colsAnnual = [
  { key: 'year', label: '年份' },
  { key: 'vulnTotal', label: '漏洞总数' },
  { key: 'high', label: '高危' },
  { key: 'medium', label: '中危' },
  { key: 'low', label: '低危' },
  { key: 'newRepos', label: '仓库新增数' },
  { key: 'newComponents', label: '组件新增数' },
]

/** 标准表格每表最多展示条数 */
const ROW_LIMIT = 10

const rowsComponent = computed(() => reportComponentStats.slice(0, ROW_LIMIT))
const rowsRepo = computed(() => reportRepoStats.slice(0, ROW_LIMIT))
const rowsVuln = computed(() => latestCVEList.slice(0, ROW_LIMIT))
const rowsDev = computed(() => reportDeveloperStats.slice(0, ROW_LIMIT))
const rowsCoverage = computed(() => reportVulnCoverage.slice(0, ROW_LIMIT))
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
