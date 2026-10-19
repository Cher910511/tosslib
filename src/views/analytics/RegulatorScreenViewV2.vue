<script setup>
/**
 * 数据大屏 V2 · /screen/regulator-v2
 *
 * 与 V1（/screen/regulator，RegulatorScreenView.vue）此前是两份结构完全一致的拷贝，
 * 每次布局调整都要同步改两遍、极易走样。现统一为「V2 复用 V1」：
 * 页面结构、样式、数据口径只有一份实现，两个路由都指向同一套大屏。
 *
 * 若后续 V2 需要独立演进，把 RegulatorScreenView.vue 的内容复制回来单独改即可。
 */
import RegulatorScreenView from './RegulatorScreenView.vue'
</script>

<template>
  <RegulatorScreenView />
</template>
