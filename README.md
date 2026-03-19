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
| `src/App.vue` | 大屏布局与数据注入 |
| `src/components/*.vue` | 各图表与区块组件 |
| `src/components/CountUp.vue` | 数字滚动 |
| `src/components/ParticleBackground.vue` | 粒子连线背景 |
