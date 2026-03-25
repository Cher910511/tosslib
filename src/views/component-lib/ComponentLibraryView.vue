<template>
  <div class="lib-page">
    <h1 class="h1">组件库</h1>
    <p v-if="keyword" class="lead">当前搜索：<span class="kw">{{ keyword }}</span></p>
    <p v-else class="lead muted">未输入关键词，以下为演示列表。在顶部搜索框选择「组件」并搜索可带关键词跳转至此。</p>
    <ul class="list" role="list">
      <li v-for="name in filtered" :key="name" class="li">
        <span class="name">{{ name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { COMPONENT_CATALOG } from '../../composables/useAdminSearch'

const route = useRoute()

const keyword = computed(() => {
  const q = route.query.q
  const s = Array.isArray(q) ? q[0] : q
  return typeof s === 'string' ? s.trim() : ''
})

const filtered = computed(() => {
  const k = keyword.value.toLowerCase()
  if (!k) return COMPONENT_CATALOG
  return COMPONENT_CATALOG.filter((n) => n.toLowerCase().includes(k))
})
</script>

<style scoped>
.lib-page {
  max-width: 720px;
}
.h1 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
}
.lead {
  margin: 0 0 20px;
  font-size: 14px;
  color: #374151;
}
.lead.muted {
  color: #6b7280;
}
.kw {
  font-weight: 600;
  color: #da203e;
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.li {
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}
.name {
  color: #1f2937;
}
</style>
