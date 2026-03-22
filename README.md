# 可信开源代码库数据大屏

Vue 3 + Vite + ECharts，固定 **1920×1080** 大屏布局，深色科技风、动效与 Mock 数据，便于后续替换为真实接口。

## 运行

```bash
cd trusted-opensource-dashboard
npm install
npm run dev
```

浏览器访问终端提示的本地地址。

**屏幕适配**：以 1920×1080 为设计稿，整页按 `min(视口宽/1920, 视口高/1080)` 等比缩放并居中，普通电脑显示器可完整显示；背景为全屏科技风图层（不随缩放裁切）。

## 构建

```bash
npm run build
npm run preview
```

## 世界地图

默认从 jsDelivr 加载 ECharts 官方 `world.json`。**离线环境**可将同文件保存为 `public/world.json`，页面会自动回退加载本地文件。

## 接入真实数据

- Mock 集中在 `src/data/mockData.js`。
- 建议在 `src/services/api.js` 中封装 `fetch`，在 `App.vue` 的 `onMounted` 中请求并赋值给响应式数据（可逐步替换各模块 props）。

## 结构说明

| 路径 | 说明 |
|------|------|
| `src/App.vue` | 根组件 |
| `src/layouts/AppShell.vue` | 侧栏 + 路由出口 + **科技底图与粒子背景（已内联）** |
| `src/views/HomeView.vue` | 态势总览页 |
| `src/views/analytics/DataScreenView.vue` | 数据大屏（KPI、活跃度/雷达/依赖图、高危列表等已内联） |
| `src/views/analytics/report/ReportTablesView.vue` | 标准表格报表页 |
| `src/views/analytics/report/SortableReportTable.vue` | 可排序/筛选/导出表格（与报表页同目录，便于整页搬运） |
| `src/components/*.vue` | 首页与多页共用的图表、表格等 |
| `src/components/CountUp.vue` | 数字滚动 |
| `src/data/mockData.js` | Mock 数据 |

**整页搬到别的项目**：可优先复制 `layouts/AppShell.vue`、`views/` 下对应页面、`components/` 里该页 `import` 到的文件、`data/mockData.js`、`styles/global.css`、`utils/`，并保留 `echarts`、`@surbowl/world-geo-json-zh` 等依赖。详见 `docs/PORTABLE.md`。
