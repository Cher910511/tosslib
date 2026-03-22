<template>
  <section class="report-block" :class="{ 'glow-card': !embedded }">
    <div class="toolbar">
      <h3 v-if="title" class="title">{{ title }}</h3>
      <div v-else class="title-spacer" aria-hidden="true" />
      <div class="actions">
        <input
          v-model="filterText"
          type="search"
          class="filter"
          placeholder="筛选（全文）"
          aria-label="筛选"
        />
        <button type="button" class="btn" @click="exportCsv">导出 CSV</button>
        <button type="button" class="btn ghost" @click="printBlock">打印</button>
      </div>
    </div>
    <div ref="printRef" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="{ sortable: col.sortable !== false }"
              @click="col.sortable === false ? null : toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key" class="sort-ind">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in displayedRows" :key="idx">
            <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!displayedRows.length" class="empty">无匹配数据</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { downloadCsv } from '../../../utils/csvExport.js'

const props = defineProps({
  title: { type: String, default: '' },
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  exportFilename: { type: String, default: 'export' },
  /** 嵌套在外层卡片内时不重复套 glow-card */
  embedded: { type: Boolean, default: false },
})

const filterText = ref('')
const sortKey = ref('')
const sortDir = ref('asc')
const printRef = ref(null)

const filteredRows = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return [...props.rows]
  return props.rows.filter((row) =>
    props.columns.some((c) => String(row[c.key] ?? '').toLowerCase().includes(q))
  )
})

const displayedRows = computed(() => {
  const list = filteredRows.value
  if (!sortKey.value) return list
  const k = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const va = a[k]
    const vb = b[k]
    const na = Number(va)
    const nb = Number(vb)
    if (!Number.isNaN(na) && !Number.isNaN(nb) && String(va).trim() !== '' && String(vb).trim() !== '') {
      return (na - nb) * dir
    }
    return String(va ?? '').localeCompare(String(vb ?? ''), 'zh') * dir
  })
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function exportCsv() {
  downloadCsv(props.exportFilename, props.columns, displayedRows.value)
}

function printBlock() {
  const el = printRef.value
  if (!el) return
  const w = window.open('', '_blank')
  if (!w) return
  const docTitle = props.title || props.exportFilename || '报表'
  w.document.write(
    `<html><head><title>${docTitle}</title><style>
      body{font-family:system-ui,sans-serif;padding:16px;color:#111}
      table{border-collapse:collapse;width:100%;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f0f4f8}
      h1{font-size:16px;margin:0 0 12px}
    </style></head><body><h1>${docTitle}</h1>${el.innerHTML}</body></html>`
  )
  w.document.close()
  w.focus()
  w.print()
  w.close()
}
</script>

<style scoped>
.report-block {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
/* 避免全局 .glow-card { overflow:hidden } 把主区域滚动「锁死」在卡片内 */
.report-block.glow-card {
  overflow: visible;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-cyan);
  letter-spacing: 2px;
}
.title-spacer {
  flex: 1;
  min-width: 8px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.filter {
  width: 200px;
  max-width: 46vw;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 13px;
}
.filter::placeholder {
  color: var(--text-faint);
}
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
}
.btn:hover {
  background: var(--btn-bg-hover);
}
.btn.ghost {
  background: transparent;
}
/* 纵向随页面滚动（由外层 .shell-main 承担）；仅横向防撑破布局 */
.table-wrap {
  overflow-x: auto;
  overflow-y: visible;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  -webkit-overflow-scrolling: touch;
}
.table-wrap::-webkit-scrollbar {
  height: 8px;
}
.table-wrap::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 4px;
}
.table-wrap::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}
table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead th {
  /* 随主内容区滚动时，表头贴在视口顶部（滚动容器为侧栏右侧主区域） */
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--table-header-bg);
  color: var(--accent-cyan);
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--table-header-border);
  white-space: nowrap;
}
thead th.sortable {
  cursor: pointer;
  user-select: none;
}
.sort-ind {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.85;
}
tbody td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--table-cell-border);
  color: var(--text-primary);
}
tbody tr:nth-child(even) {
  background: var(--table-row-alt);
}
tbody tr:hover {
  background: var(--table-row-hover);
}
.empty {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  margin: 0;
}
</style>
