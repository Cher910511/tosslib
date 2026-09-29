# 大屏科技素材（背景底纹）

本目录存放数据大屏（`src/views/analytics/RegulatorScreenView.vue`）背景使用的透明底 SVG 素材。

## 用途

作为大屏背景底纹，以低透明度（0.08 ~ 0.16）散布在屏幕左右边缘与下方，
避开中央能量球与四角指标卡。在页面中通过 **CSS mask** 着色后渲染：

```css
.rs-bg-tech {
  background-color: rgba(125, 220, 255, 0.9);
  mask-image: url(<素材>);   /* 取 SVG 的 alpha 通道 */
  mask-size: contain;
}
```

> 为什么用 mask 而不是 `<img>`：这些图标统一以 `currentColor` 描边/填充，
> 用 `<img>` 直接引用会被浏览器当作默认色（黑色）渲染，在深色底上完全不可见。
> mask 只取形状（alpha 通道），再以 `background-color` 填充，因此既能显示又能自由着色。

## 来源与许可

全部取自 [Iconify](https://iconify.design/) 上**可商用**的开源图标集，均为透明底 SVG：

| 图标集 | 数量 | 许可证 | SPDX | 许可证地址 |
|---|---:|---|---|---|
| [Tabler Icons](https://github.com/tabler/tabler-icons) | 20 | MIT | `MIT` | https://github.com/tabler/tabler-icons/blob/master/LICENSE |
| [Lucide](https://github.com/lucide-icons/lucide) | 1 | ISC | `ISC` | https://github.com/lucide-icons/lucide/blob/main/LICENSE |
| [Phosphor Icons](https://github.com/phosphor-icons/core) | 1 | MIT | `MIT` | https://github.com/phosphor-icons/core/blob/main/LICENSE |
| [Carbon Icons](https://github.com/carbon-design-system/carbon) | 1 | Apache-2.0 | `Apache-2.0` | https://github.com/carbon-design-system/carbon/blob/main/LICENSE |
| [Iconoir](https://github.com/iconoir-icons/iconoir) | 1 | MIT | `MIT` | https://github.com/iconoir-icons/iconoir/blob/main/LICENSE |

合计 **24 个**。均为 MIT / ISC / Apache-2.0，**允许商用与修改**，仅需保留版权与许可声明（本文件即为留痕）。

### 已刻意规避的素材源

未使用千图网、觅知网、包图网等付费素材站的 PNG 素材 —— 那些多为付费授权，
直接纳入客户交付物存在法务风险。后续如需扩充素材，请沿用「开源可商用图标集」这一来源。

## 文件清单

| 图标集 | 文件名（不含 `.svg` 后缀） |
|---|---|
| tabler | `circuit-diode` `cpu` `network` `server` `database` `cloud` `shield-check` `binary` `hexagon` `radar-2` `satellite` `terminal-2` `code` `lock` `chart-line` `git-branch` `package` `bug` `fingerprint` `topology-star-3` |
| lucide | `circuit-board` |
| ph | `circuitry` |
| carbon | `chip` |
| iconoir | `cpu` |

## 维护说明

**新增素材**：从 Iconify API 下载即可（务必确认目标图标集许可证为 MIT / ISC / Apache-2.0 / CC0）：

```bash
cd src/assets/tech
curl -o tabler-<icon>.svg "https://api.iconify.design/tabler/<icon>.svg"
```

**素材如何被加载**：视图通过 `import.meta.glob('../../assets/tech/*.svg')` 自动收集本目录全部
SVG，按文件名顺序与代码中的 `TECH_SLOTS` 散布位一一对应（取模循环）。
因此**新增/删除文件会改变现有素材的位置映射**，调整时请同步检查 `TECH_SLOTS`。

**窄屏行为**：≤1024px 时（单栏滚动布局）素材层整体 `display: none`。
原因：该布局下背景容器高度随内容增长到数千 px，按百分比散布的图标会被摊得极稀疏，
且贴边位（x = 3.2% / 95.5%）叠加半个图标宽度后会溢出屏幕。
