<template>
  <div class="feed" :style="{ '--feed-duration': `${duration}s` }">
    <div class="feed-track" :class="{ 'is-scrolling': needScroll }">
      <!-- 渲染两遍实现无缝滚动 -->
      <div v-for="pass in 2" :key="pass" :aria-hidden="pass === 2 ? 'true' : 'false'">
        <div v-for="(item, i) in items" :key="`${pass}-${i}`" class="feed-row">
          <span class="feed-dot" aria-hidden="true" />
          <span class="feed-text" :title="textOf(item)">{{ textOf(item) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 最新数据动态：无缝自动滚动列表（浅色主题）。
 * items 支持字符串数组，或 [{ text }] 形式。
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  /** 一轮滚动秒数 */
  duration: { type: Number, default: 22 },
})

function textOf(item) {
  if (item === null || item === undefined) return ''
  return typeof item === 'object' ? String(item.text ?? item.name ?? '') : String(item)
}

/** 数据太少时不需要滚动 */
const needScroll = computed(() => props.items.length > 4)
</script>

<style scoped>
.feed {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
/* 仅在条目足够时滚动：数据太少滚动会显得跳动。
   注意：不能用 :only-child 判断——track 恒为 feed 的唯一子元素，会永久禁用动画。 */
.feed-track.is-scrolling {
  animation: feed-scroll var(--feed-duration, 22s) linear infinite;
}
.feed:hover .feed-track.is-scrolling {
  animation-play-state: paused;
}
@keyframes feed-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

.feed-row {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  font-size: 12px;
}
.feed-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22D3EE;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
}
.feed-text {
  min-width: 0;
  color: #A8BEDA;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
