<template>
  <div class="st">
    <!-- 表头固定，不随内容滚动 -->
    <div class="st-head" :style="gridStyle">
      <span v-for="c in columns" :key="c.key" class="st-th" :class="c.align ? `is-${c.align}` : ''">{{ c.label }}</span>
    </div>

    <!-- 表体：仅在内容溢出容器时才滚动 -->
    <div ref="bodyRef" class="st-body">
      <div
        class="st-track"
        :class="{ 'is-scrolling': overflowing }"
        :style="{ '--st-duration': `${duration}s` }"
      >
        <div v-for="pass in 2" :key="pass" :aria-hidden="pass === 2 ? 'true' : 'false'">
          <div v-for="(row, i) in rows" :key="`${pass}-${i}`" class="st-row" :style="gridStyle">
            <span
              v-for="c in columns"
              :key="c.key"
              class="st-td"
              :class="c.align ? `is-${c.align}` : ''"
              :title="String(row[c.key] ?? '')"
            >
              <span v-if="c.tag" class="st-tag" :class="tagClass(row[c.key])">{{ row[c.key] }}</span>
              <template v-else>{{ row[c.key] }}</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 滚动表格：表头固定 + 表体无缝滚动。
 * 用于「最新漏洞动态」「恶意代码检测动态」等实时列表。
 *
 * 滚动条件：仅当内容实际高于容器时才滚动。
 * 若容器比内容还高（如面板较高、行数较少），滚动会露出空白，故不启用。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  /** 列定义 [{ key, label, width?, align?, tag? }] */
  columns: { type: Array, default: () => [] },
  /** 行数据 */
  rows: { type: Array, default: () => [] },
  /** 一轮滚动秒数 */
  duration: { type: Number, default: 30 },
})

/** 按列宽定义生成 grid-template-columns，保证表头与内容对齐 */
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: props.columns.map((c) => c.width || 'minmax(0, 1fr)').join(' '),
  gap: '0 8px',
}

/* ===== 溢出检测：内容高于容器才滚动 ===== */
const bodyRef = ref(null)
const overflowing = ref(false)
let ro = null

function measure() {
  const el = bodyRef.value
  if (!el) return
  // track 渲染两遍用于无缝衔接，故实际内容高度取一半
  const track = el.firstElementChild
  const contentH = track ? track.scrollHeight / 2 : 0
  // 留 4px 容差，避免临界抖动
  overflowing.value = contentH > el.clientHeight + 4
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && bodyRef.value) {
    ro = new ResizeObserver(measure)
    ro.observe(bodyRef.value)
  }
})

watch(() => props.rows, () => {
  // 行数变化后等 DOM 更新再测
  requestAnimationFrame(measure)
}, { deep: true })

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})

/** 风险等级 / 检测结果等标签配色 */
const TAG_TONES = {
  严重: 'danger',
  高危: 'danger',
  中危: 'warn',
  低危: 'ok',
  确认恶意: 'danger',
  疑似恶意: 'warn',
  误报排除: 'muted',
}

function tagClass(value) {
  return `st-tag--${TAG_TONES[String(value)] || 'muted'}`
}
</script>

<style scoped>
.st {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.st-head {
  flex-shrink: 0;
  padding: 7px 10px;
  background: rgba(0, 91, 203, 0.14);
  border-bottom: 1px solid rgba(0, 91, 203, 0.3);
}
.st-th {
  font-weight: 600;
  color: #7C93B0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.st-th.is-center, .st-td.is-center { text-align: center; }
.st-th.is-right, .st-td.is-right { text-align: right; }

.st-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* 上下渐隐，滚动更自然 */
  mask-image: linear-gradient(180deg, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
}
/* 仅在内容溢出时滚动：容器比内容高时滚动会露白 */
.st-track.is-scrolling {
  animation: st-scroll var(--st-duration, 30s) linear infinite;
}
.st:hover .st-track.is-scrolling { animation-play-state: paused; }
@keyframes st-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

.st-row {
  padding: 6px 10px;
  border-bottom: 1px solid rgba(0, 91, 203, 0.1);
  transition: background 0.15s;
}
.st-row:hover { background: rgba(0, 91, 203, 0.12); }
.st-td {
  color: #C8D8EC;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 标签 */
.st-tag {
  display: inline-block;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  white-space: nowrap;
}
.st-tag--danger { color: #FF8A8A; background: rgba(239, 68, 68, 0.18); }
.st-tag--warn { color: #FBBF6E; background: rgba(249, 115, 22, 0.2); }
.st-tag--ok { color: #6EE7A8; background: rgba(34, 197, 94, 0.18); }
.st-tag--muted { color: #94A9C4; background: rgba(100, 116, 139, 0.2); }
</style>
