<template>
  <Teleport to="body">
    <div v-if="visible" class="bl-overlay" @click.self="close">
      <div class="bl-modal" role="dialog" aria-modal="true" aria-labelledby="bl-title">
        <header class="bl-hd">
          <div class="bl-hd-main">
            <h3 id="bl-title" class="bl-title">基线指标核查</h3>
            <p class="bl-sub">提示：需全部合格方可提交入库</p>
          </div>
          <div class="bl-hd-side">
            <button type="button" class="bl-close" aria-label="关闭" @click="close">✕</button>
          </div>
        </header>

        <!-- 核查状态条：合格数 + 未达标项 + 一键判定 -->
        <div class="bl-progress">
          <span class="bl-progress-labels" :class="summaryClass">
            <span class="bl-progress-label">已合格</span>
            <strong>{{ stats.pass }} / {{ stats.total }}</strong>
          </span>
          <span class="bl-progress-divider" />
          <span v-if="stats.fail" class="bl-chip bl-chip--bad">{{ stats.fail }} 项不合格</span>
          <span v-if="stats.pending" class="bl-chip bl-chip--pending">{{ stats.pending }} 项待判定</span>
          <span v-if="allPassed" class="bl-chip bl-chip--ok">基线全部合格，可提交入库</span>
          <button
            v-if="!readonly"
            type="button"
            class="bl-oneclick"
            title="按扫描结论一键判定所有自动项为合格"
            @click="oneClickAuto"
          >一键判定自动项</button>
        </div>

        <div class="bl-body">
          <!-- 分类 Tab：按代码技术安全 / 合法合规 / 供应韧性切换，避免弹窗过长 -->
          <div class="bl-tabs" role="tablist">
            <button
              v-for="g in grouped"
              :key="g.category"
              type="button"
              class="bl-tab"
              :class="{ 'is-active': g.category === activeCategory }"
              role="tab"
              :aria-selected="g.category === activeCategory"
              @click="activeCategory = g.category"
            >
              <span class="bl-tab-label">{{ g.category }}</span>
              <span class="bl-tab-count">{{ g.items.length }}</span>
            </button>
            <label class="bl-check">
              <input v-model="onlyTodo" type="checkbox" />
              <span>只看未判定</span>
            </label>
          </div>

          <section v-if="activeGroup" class="bl-group">
            <table class="bl-table">
              <thead>
                <tr>
                  <th class="bl-col-name">指标</th>
                  <th class="bl-col-mode">判定方式</th>
                  <th class="bl-col-result">结论</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in activeRows" :key="row.id">
                  <tr>
                    <td class="bl-col-name">
                      <span class="bl-ind-name">{{ row.name }}</span>
                      <span class="bl-ind-desc" :title="row.desc">{{ row.desc }}</span>
                    </td>
                    <td class="bl-col-mode">
                      <span class="bl-mode" :class="row.auto ? 'bl-mode--auto' : 'bl-mode--manual'">
                        {{ row.auto ? '自动' : '人工' }}
                      </span>
                      <span v-if="row.auto && row.engineName" class="bl-engine">{{ row.engineName }}</span>
                      <span v-if="row.auto && row.edited" class="bl-engine bl-edited">已人工改判</span>
                    </td>
                    <td class="bl-col-result">
                      <PassToggle
                        :model-value="row.result"
                        :disabled="readonly"
                        @update:model-value="(v) => onResultChange(row.id, v)"
                      />
                    </td>
                  </tr>
                </template>
                <tr v-if="!activeRows.length">
                  <td colspan="3" class="bl-empty">该筛选下没有需要处理的指标</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <footer class="bl-ft">
          <div class="bl-ft-actions">
            <button type="button" class="bl-btn" @click="close">取消</button>
            <button v-if="!readonly" type="button" class="bl-btn bl-btn--primary" @click="save">保存结果</button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { INDICATORS } from '../../data/govIndicators.js'
import { BASELINE_IDS, INDICATOR_CAPABILITY, engineOfConfig } from '../../data/scanEngines.js'
import PassToggle from './PassToggle.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible', 'save'])

const records = reactive({})

/** 筛选：全部 / 仅未合格·未判定 */
const filterMode = ref('all')

/** 复选框「只看未判定」：勾选时只展示未合格/未判定的指标 */
const onlyTodo = computed({
  get: () => filterMode.value === 'todo',
  set: (v) => { filterMode.value = v ? 'todo' : 'all' },
})

const rows = computed(() => {
  const byId = new Map(INDICATORS.map((i) => [i.id, i]))
  return BASELINE_IDS.map((id) => {
    const ind = byId.get(id) || {}
    const cap = INDICATOR_CAPABILITY[id] || {}
    const engine = cap.type ? engineOfConfig(props.item?.scanConfig, cap.type) : null
    return {
      id,
      name: ind.name || id,
      desc: ind.desc || '',
      category: ind.category || '其他',
      auto: !!cap.auto,
      engineName: cap.auto ? engine?.name || '' : '',
      result: records[id]?.result || 'pending',
      // 自动项被人工改判过的标记
      edited: !!records[id]?.edited,
    }
  })
})

const grouped = computed(() => {
  const order = ['代码技术安全', '合法合规', '供应韧性', '其他']
  const map = new Map()
  rows.value.forEach((r) => {
    if (!map.has(r.category)) map.set(r.category, [])
    map.get(r.category).push(r)
  })
  return order.filter((c) => map.has(c)).map((c) => {
    const items = map.get(c)
    const pass = items.filter((r) => r.result === 'pass').length
    const fail = items.filter((r) => r.result === 'fail').length
    let tone = 'is-pending'
    if (pass === items.length) tone = 'is-ok'
    else if (fail) tone = 'is-bad'
    return { category: c, items, pass, tone }
  })
})

/** 当前 Tab 的分类（默认第一个：代码技术安全） */
const activeCategory = ref('')
const activeGroup = computed(() => {
  const list = grouped.value
  if (!list.length) return null
  return list.find((g) => g.category === activeCategory.value) || list[0]
})

/** 打开时默认落到第一个分类 */
watch(grouped, (list) => {
  if (!list.length) return
  if (!list.some((g) => g.category === activeCategory.value)) {
    activeCategory.value = list[0].category
  }
}, { immediate: true })

const stats = computed(() => {
  const total = rows.value.length
  const pass = rows.value.filter((r) => r.result === 'pass').length
  const fail = rows.value.filter((r) => r.result === 'fail').length
  return { total, pass, fail, pending: total - pass - fail }
})

const allPassed = computed(() => stats.value.pass === stats.value.total)
const summaryClass = computed(() => {
  if (allPassed.value) return 'is-ok'
  if (stats.value.fail) return 'is-bad'
  return 'is-pending'
})

/** 当前 Tab 展示的行（按筛选条件过滤） */
const activeRows = computed(() => {
  const items = activeGroup.value?.items || []
  if (filterMode.value === 'todo') {
    return items.filter((r) => r.result !== 'pass')
  }
  return items
})

/**
 * 一键判定：把「自动判定项」按扫描结论批量置为合格。
 * 人工判定项不参与——必须逐项判定，避免一键糊弄失去治理意义。
 */
function oneClickAuto() {
  const now = new Date().toLocaleString('zh-CN')
  rows.value.forEach((r) => {
    if (!r.auto) return
    const rec = records[r.id]
    if (!rec || rec.result === 'pass') return
    rec.result = 'pass'
    rec.at = now
  })
}

/** 打开时把条目里的基线判定载入本地编辑态 */
watch(
  () => [props.visible, props.item],
  ([visible]) => {
    if (!visible || !props.item) return
    Object.keys(records).forEach((k) => delete records[k])
    const checks = props.item.baselineChecks || {}
    BASELINE_IDS.forEach((id) => {
      const c = checks[id] || {}
      const cap = INDICATOR_CAPABILITY[id] || {}
      const engine = cap.type ? engineOfConfig(props.item.scanConfig, cap.type) : null
      records[id] = {
        result: c.result || 'pending',
        source: cap.auto ? 'auto' : 'manual',
        engine: cap.auto ? engine?.id || '' : '',
        edited: c.source === 'auto' && !!c.edited,
        at: c.at || '',
      }
    })
  },
  { immediate: true },
)

function onResultChange(id, value) {
  const rec = records[id]
  if (!rec) return
  rec.result = value
  // 自动判定项被人工改判时打标记，界面显示「已人工改判」，便于审批方识别
  if (rec.source === 'auto') rec.edited = true
}

function close() {
  emit('update:visible', false)
}

function save() {
  const payload = {}
  BASELINE_IDS.forEach((id) => {
    payload[id] = { ...records[id] }
  })
  emit('save', payload)
  close()
}
</script>

<style scoped>
.bl-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.45);
}
.bl-modal {
  display: flex;
  flex-direction: column;
  width: min(900px, calc(100vw - 48px));
  max-height: 86vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.bl-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f4;
}
.bl-hd-main { min-width: 0; }
.bl-hd-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.bl-title {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.bl-sub {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}
.bl-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f2f4;
  background: #fcfcfd;
  line-height: 1.5;
}
.bl-progress-labels {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.bl-progress-label { font-size: 13px; }
.bl-progress-labels strong {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.5px;
}
.bl-progress-labels.is-ok strong { color: #059669; }
.bl-progress-labels.is-bad strong { color: #dc2626; }
.bl-progress-labels.is-pending strong { color: #b45309; }
.bl-progress-divider {
  width: 1px;
  height: 16px;
  background: #eef0f3;
}
.bl-chip {
  padding: 2px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12.5px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.bl-chip--bad {
  border-color: #f3d3d7;
  background: #fdf6f7;
  color: #b03641;
}
.bl-chip--pending {
  border-color: #f2dfc0;
  background: #fffbf2;
  color: #9a6516;
}
.bl-chip--ok {
  border-color: #cfe8db;
  background: #f4fbf7;
  color: #2f7a55;
}
.bl-progress .bl-oneclick { margin-left: auto; }
.bl-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}
.bl-close:hover { background: #f3f4f6; color: #374151; }
.bl-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 20px 16px;
}
.bl-group { margin-top: 12px; }

.bl-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding-bottom: 2px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}
.bl-check input[type="checkbox"] {
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: #da203e;
  cursor: pointer;
}
.bl-oneclick {
  padding: 5px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.bl-oneclick:hover:not(:disabled) { background: #f7f8fa; }
.bl-oneclick:disabled {
  border-color: #e5e7eb;
  color: #b8bec7;
  cursor: not-allowed;
}
/* 自动项被人工改判的标记 */
.bl-edited { color: #9ca3af; }
.bl-empty {
  padding: 18px 8px;
  text-align: center;
  font-size: 12.5px;
  color: #9ca3af;
}
/* 分类 Tab：三段切换，弹窗只渲染当前分类，整体高度大幅收窄 */
.bl-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 14px;
  border-bottom: 1px solid #eef0f3;
}
.bl-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  font-size: 12.5px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.bl-tab:hover { color: #111827; }
.bl-tab.is-active {
  color: #111827;
  font-weight: 600;
  border-bottom-color: #da203e;
}
.bl-tab-label { white-space: nowrap; }
.bl-tab-count {
  padding: 0 6px;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  background: #f7f8fa;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.bl-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.bl-table th {
  padding: 6px 8px;
  border-bottom: 1px solid #eef0f3;
  font-size: 11.5px;
  font-weight: 500;
  color: #9ca3af;
  text-align: left;
}
.bl-table td {
  padding: 8px;
  border-bottom: 1px solid #f5f6f8;
  vertical-align: top;
}
.bl-col-name { width: 44%; }
.bl-col-mode { width: 22%; }
.bl-col-result { width: 34%; white-space: nowrap; vertical-align: middle; }
/* 表格内按钮组压缩内边距，避免挤出结论列压到备注列 */
.bl-col-result :deep(.pass-toggle) { flex-wrap: nowrap; }
.bl-col-result :deep(.pass-toggle-btn) {
  padding: 4px 10px;
  font-size: 12px;
}
.bl-ind-name {
  display: block;
  font-size: 12.5px;
  color: #111827;
  font-weight: 500;
}
.bl-ind-desc {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  line-height: 1.5;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.bl-mode {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}
.bl-mode--auto {
  background: #f4f8ff;
  color: #1d4ed8;
  border: 1px solid #e0ebfb;
}
.bl-mode--manual {
  background: #fffaef;
  color: #b45309;
  border: 1px solid #fdf0d1;
}
.bl-engine {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
}
.bl-input {
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: 1px solid #dfe3e8;
  border-radius: 5px;
  font-size: 12px;
  color: #374151;
}
.bl-input:disabled { background: #f9fafb; }
.bl-ft {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #f0f2f4;
  background: #fcfcfd;
}
.bl-ft-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.bl-btn {
  padding: 7px 16px;
  border: 1px solid #dfe3e8;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}
.bl-btn--primary {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.bl-btn--primary:hover { background: #c01b36; }
</style>
