<template>
  <div class="ts-wrap">
    <!-- 顶部汇总 -->
    <div class="ts-summary">
      <span class="ts-summary-num">{{ data.length }}</span>
      <span class="ts-summary-label">个技术栈分类</span>
    </div>

    <!-- 按领域分组展示，避免 41 个标签平铺造成的杂乱 -->
    <div v-for="g in grouped" :key="g.id" class="ts-group">
      <div class="ts-group-hd">
        <span class="ts-group-name">{{ g.name }}</span>
        <span class="ts-group-line" aria-hidden="true"></span>
        <span class="ts-group-count">{{ g.items.length }}</span>
      </div>
      <div class="ts-tags">
        <span
          v-for="t in g.items"
          :key="t.name"
          class="ts-tag"
          :class="`ts-tag--${tierOf(t.value)}`"
          :title="`${t.name}：收录 ${formatNum(t.value)} 个组件`"
        >{{ t.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 技术栈分类展示：按领域分组 + 按收录量分级字号。
 * 41 个分类平铺会显得杂乱，分组后每组有标题与计数，标签按收录量大小形成层次。
 */
const props = defineProps({
  /** [{ name, value }]，value 为收录组件数 */
  data: { type: Array, default: () => [] },
})

/**
 * 领域分组（与数据源的 41 类一一对应）。
 * 未匹配到任何分组的分类会落到「其他」，避免数据变更后标签丢失。
 */
const GROUPS = [
  {
    id: 'base',
    name: '基础软件技术',
    members: [
      '操作系统技术', '数据库技术', '编译器与编程语言技术', '分布式中间件',
      '虚拟化技术', '云计算技术', '存储及文件系统技术', '分布式通信技术',
      '数据压缩技术', '通用开发库技术', '软件兼容性技术', '文本处理技术',
      '字体技术', '软件测试', 'Rel-MC',
    ],
  },
  {
    id: 'app',
    name: '应用与平台技术',
    members: [
      'WEB技术', '安卓应用与框架', '鸿蒙应用与框架', '桌面应用与框架技术',
      '应用多媒体', '媒体软件技术', '人工智能技术', '大数据分析技术',
      '搜索技术', '区块链技术', '通信协议应用', '研发工具',
      '安全组件', 'SOA技术', 'PaaS', 'openstack',
    ],
  },
  {
    id: 'hw',
    name: '硬件与器件',
    members: [
      '处理器', '存储器', '交换网', '器件', 'ADDA',
      '计算硬件网卡', '可编程逻辑', 'NP', '光器件', '能源',
    ],
  },
]

/** 最大值用于字号分级 */
const maxValue = computed(() => Math.max(1, ...props.data.map((d) => Number(d.value) || 0)))

/** 按分组聚合，组内按收录量倒序（大的在前，层次更清晰） */
const grouped = computed(() => {
  const byName = new Map(props.data.map((d) => [d.name, d]))
  const used = new Set()
  const list = GROUPS.map((g) => {
    const items = g.members
      .map((n) => byName.get(n))
      .filter(Boolean)
      .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    items.forEach((it) => used.add(it.name))
    return { id: g.id, name: g.name, items }
  }).filter((g) => g.items.length)
  // 未归入任何分组的分类兜底展示，确保不丢数据
  const rest = props.data.filter((d) => !used.has(d.name))
  if (rest.length) list.push({ id: 'other', name: '其他', items: rest })
  return list
})

/** 字号分级：按收录量相对最大值分三档，形成视觉层次 */
function tierOf(value) {
  const ratio = (Number(value) || 0) / maxValue.value
  if (ratio >= 0.6) return 'lg'
  if (ratio >= 0.25) return 'md'
  return 'sm'
}

function formatNum(n) {
  return Number(n || 0).toLocaleString()
}
</script>

<style scoped>
.ts-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

/* 顶部汇总 */
.ts-summary {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding-left: 2px;
}
.ts-summary-num {
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-cyan, #00d4ff);
}
.ts-summary-label {
  font-size: 11px;
  color: var(--text-secondary, #7eb8e0);
}

/* 分组 */
.ts-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 0;
}
.ts-group-hd {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ts-group-name {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-primary, #d7ecff);
}
.ts-group-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 180, 255, 0.35), rgba(0, 180, 255, 0));
}
.ts-group-count {
  flex-shrink: 0;
  min-width: 18px;
  padding: 0 5px;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  color: var(--accent-cyan, #00d4ff);
  background: rgba(0, 120, 200, 0.22);
  border-radius: 7px;
}

/* 标签：紧凑对齐，字号分级 */
.ts-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 5px;
  padding-left: 2px;
}
.ts-tag {
  padding: 2px 7px;
  line-height: 1.5;
  color: var(--text-primary, #d7ecff);
  white-space: nowrap;
  background: rgba(0, 90, 170, 0.18);
  border: 1px solid rgba(0, 180, 255, 0.24);
  border-radius: 4px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
  cursor: default;
}
.ts-tag:hover {
  color: var(--accent-cyan, #00d4ff);
  background: rgba(0, 140, 220, 0.3);
  border-color: rgba(0, 212, 255, 0.7);
}
/* 三档字号：收录量越大越突出 */
.ts-tag--lg { font-size: 12px; font-weight: 600; }
.ts-tag--md { font-size: 11px; }
.ts-tag--sm { font-size: 10px; opacity: 0.82; }
</style>
