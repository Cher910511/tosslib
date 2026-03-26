<template>
  <div class="lib-page">
    <h1 class="h1">组件库</h1>
    <p v-if="keyword" class="lead">当前搜索：<span class="kw">{{ keyword }}</span></p>
    <p v-else class="lead muted">
      以下为可查看详情的开源组件演示列表（每项对应一种语言的依赖引入示例）。在顶部搜索框选择「组件」并搜索可带关键词筛选。
    </p>
    <ul class="list" role="list">
      <li v-for="row in filteredRows" :key="row.id" class="li">
        <RouterLink
          class="row-link"
          :to="{ name: 'component-detail', params: { id: row.id } }"
        >
          <span class="row-title">{{ row.name }}</span>
          <span class="row-hint">{{ langLabels[row.detailLang] || row.language }}</span>
        </RouterLink>
      </li>
    </ul>
    <p v-if="keyword && !filteredRows.length" class="empty">无匹配组件，请尝试其他关键词。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { COMPONENT_MOCKS, COMPONENT_LIBRARY_IDS } from '../../data/componentDetailMocks.js'
import { DETAIL_LANG_LABELS } from '../../data/componentDetailLang.js'

const route = useRoute()

const langLabels = DETAIL_LANG_LABELS

const keyword = computed(() => {
  const q = route.query.q
  const s = Array.isArray(q) ? q[0] : q
  return typeof s === 'string' ? s.trim() : ''
})

const rows = computed(() =>
  COMPONENT_LIBRARY_IDS.map((id) => {
    const m = COMPONENT_MOCKS[id]
    return {
      id,
      name: m.name,
      detailLang: m.detailLang,
      language: m.language,
    }
  }),
)

const filteredRows = computed(() => {
  const k = keyword.value.toLowerCase()
  if (!k) return rows.value
  return rows.value.filter(
    (r) =>
      r.name.toLowerCase().includes(k) ||
      r.id.toLowerCase().includes(k) ||
      (langLabels[r.detailLang] && langLabels[r.detailLang].toLowerCase().includes(k)),
  )
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
.empty {
  margin: 16px 0 0;
  font-size: 14px;
  color: #6b7280;
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
  padding: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  overflow: hidden;
}
.row-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.12s ease;
}
.row-link:hover {
  background: #f9fafb;
}
.row-title {
  color: #2563eb;
  word-break: break-word;
}
.row-link:hover .row-title {
  color: #da203e;
  text-decoration: underline;
}
.row-hint {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
}
</style>
