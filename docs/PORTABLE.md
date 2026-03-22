# 按页面搬运依赖说明

在**不改功能与样式**的前提下，代码已做整理：能内联进单页的已并入对应 `views`，报表表格与报表页同目录，壳层背景合并进 `AppShell.vue`，减少零散 `.vue` 文件数量。

## 复制清单（按场景）

### 全站壳 + 路由

- `src/layouts/AppShell.vue`（含原 `TechBackdrop` + `ParticleBackground` 逻辑与样式）
- `src/router/index.js`、`src/main.js`、`src/App.vue`
- `src/styles/global.css`、`index.html`

### 态势总览（`/`）

- `src/views/HomeView.vue`
- `src/components/`：`PlatformOverview.vue`、`VulnerabilityDonut.vue`、`VulnerabilityTrend.vue`、`CVEListTable.vue`、`SecurityNewsFeed.vue`、`LicensePie.vue`、`IndustryBar.vue`、`TagCloud.vue`、`CountryBar.vue`、`SecurityGovernance.vue`、`CountUp.vue`
- `src/data/mockData.js`（或改为接口后只保留类型/字段约定）

### 数据大屏（`/analytics/screen`）

- `src/views/analytics/DataScreenView.vue`（单文件已包含原 `analytics/` 下 KPI、活跃度折线、行业雷达、依赖图、高危滚动表）
- `src/components/`：`VulnerabilityTrend.vue`、`VulnerabilityDonut.vue`、`LicensePie.vue`、`IndustryBar.vue`、`WorldMapChart.vue`、`CountUp.vue`
- `src/utils/countryNameZh.js`（地图中文名）
- `src/data/mockData.js`

### 标准表格（`/analytics/report`）

- `src/views/analytics/report/ReportTablesView.vue`
- `src/views/analytics/report/SortableReportTable.vue`（同目录）
- `src/components/VulnerabilityTrend.vue`（年度趋势图）
- `src/utils/csvExport.js`
- `src/data/mockData.js`

## 依赖（package.json）

- `vue`、`vue-router`、`echarts`
- 地图页需要：`@surbowl/world-geo-json-zh`
