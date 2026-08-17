<template>
  <Teleport to="body">
    <Transition name="score-fade">
      <div v-if="visible" class="score-overlay" @click.self="close">
        <div class="score-dialog">
          <!-- 头部 -->
          <div class="score-dialog-hd">
            <div class="score-dialog-hd-info">
              <h3 class="score-dialog-title">指标评分</h3>
            </div>
            <button type="button" class="score-dialog-close" @click="close">&times;</button>
          </div>

          <!-- 汇总条 -->
          <div class="score-summary">
            <div class="score-summary-total">
              <span class="score-summary-total-label">国标评分</span>
              <span class="score-summary-total-num" :class="{ 'is-empty': totalScore === null }">
                {{ totalScore === null ? '--' : totalScore.toFixed(1) }}
              </span>
              <span class="score-summary-total-max">/ 100</span>
              <span
                v-if="totalScore !== null"
                class="score-summary-badge"
                :class="baselineEligible ? 'badge--pass' : 'badge--fail'"
              >{{ baselineEligible ? '合格' : '不合格' }}</span>
            </div>
            <div class="score-summary-meta">
              <span class="score-summary-meta-item">已评 {{ scoredCount }}/{{ INDICATORS.length }} 项</span>
              <span class="score-summary-meta-item">基线 {{ baseScoreText }}</span>
              <span class="score-summary-meta-item">增强 {{ enhancedScoreText }}</span>
            </div>
            <button type="button" class="score-auto-btn" @click="runAutoScore">
              一键自动评分
            </button>
          </div>

          <!-- tab 切换 + 筛选 -->
          <div class="score-toolbar">
            <div class="score-tabs">
              <button
                v-for="level in INDICATOR_LEVELS"
                :key="level"
                type="button"
                class="score-tab"
                :class="{ 'is-active': activeLevel === level }"
                @click="activeLevel = level"
              >
                {{ level }}指标
                <span class="score-tab-count">{{ indicatorsByLevel(level).length }}</span>
              </button>
            </div>
            <label class="score-filter">
              <input type="checkbox" v-model="onlyUnscored" />
              <span>只看未评分</span>
              <span v-if="onlyUnscored" class="score-filter-count">{{ unscoredInLevel.length }} 项未评</span>
            </label>
          </div>

          <!-- 指标表格 -->
          <div class="score-dialog-body">
            <table class="score-table">
              <thead>
                <tr>
                  <th class="col-name">指标</th>
                  <th class="col-desc">说明</th>
                  <th class="col-weight">权重</th>
                  <th class="col-ctrl">评分</th>
                  <th class="col-score">得分 / 贡献</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ind in filteredIndicators"
                  :key="ind.id"
                  :class="{ 'is-unscored': recordOf(ind).score == null }"
                >
                  <td class="col-name">
                    <div class="score-row-name">
                      <span class="score-row-name-text">{{ ind.name }}</span>
                      <span v-if="ind.capable" class="score-row-flag flag--cap">自动</span>
                    </div>
                  </td>
                  <td class="col-desc">
                    <p class="score-cell-desc" :title="ind.desc">{{ ind.desc }}</p>
                  </td>
                  <td class="col-weight">{{ ind.weight }}%</td>
                  <td class="col-ctrl">
                    <template v-if="ind.scoreType === 'formula'">
                      <div class="score-formula">
                        <div class="score-formula-params">
                          <label
                            v-for="p in ind.params"
                            :key="p.key"
                            class="score-param"
                            :title="ind.ref"
                          >
                            <span class="score-param-label">{{ p.label }}</span>
                            <input
                              type="number"
                              class="score-input score-input--sm"
                              :min="p.min"
                              :max="p.max"
                              :step="p.step"
                              :value="paramOf(ind, p.key)"
                              @input="onParamInput(ind, p.key, $event.target.value)"
                            />
                          </label>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="ind.scoreType === 'pass'">
                      <div class="score-pass">
                        <button
                          type="button"
                          class="score-pass-btn"
                          :class="{ 'is-on': recordOf(ind).score === 10 }"
                          @click="onPass(ind, true)"
                        >合格</button>
                        <button
                          type="button"
                          class="score-pass-btn"
                          :class="{ 'is-off': recordOf(ind).score === 0 }"
                          @click="onPass(ind, false)"
                        >不合格</button>
                      </div>
                    </template>
                    <template v-else-if="ind.scoreType === 'lts'">
                      <div class="score-pass">
                        <button
                          type="button"
                          class="score-pass-btn"
                          :class="{ 'is-on': recordOf(ind).score === 10 }"
                          @click="onLts(ind, true)"
                        >LTS</button>
                        <button
                          type="button"
                          class="score-pass-btn"
                          :class="{ 'is-off': recordOf(ind).score === 5 }"
                          @click="onLts(ind, false)"
                        >非 LTS</button>
                      </div>
                    </template>
                    <template v-else>
                      <div class="score-input-wrap">
                        <input
                          type="number"
                          class="score-input"
                          min="0"
                          max="10"
                          step="0.5"
                          :value="recordOf(ind).score ?? ''"
                          placeholder="0-10"
                          @input="onScoreInput(ind, $event.target.value)"
                        />
                      </div>
                    </template>
                  </td>
                  <td class="col-score">
                    <div class="score-cell-score">
                      <span class="score-cell-num" :class="{ 'is-empty': recordOf(ind).score == null }">
                        {{ scoreText(recordOf(ind).score) }}<span class="score-cell-max">/10</span>
                      </span>
                      <span class="score-cell-sub" :class="{ 'is-empty': recordOf(ind).score == null }">
                        <i class="score-cell-sub-dot"></i>贡献 {{ contributionText(ind) }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredIndicators.length === 0">
                  <td colspan="5" class="score-empty">当前筛选条件下暂无指标</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 底部 -->
          <div class="score-dialog-ft">
            <p class="score-dialog-tip">自动指标按扫描结果评分，其余指标由人工评定。</p>
            <div class="score-dialog-ft-btns">
              <button type="button" class="gov-btn" @click="close">取消</button>
              <button type="button" class="gov-btn gov-btn--primary" @click="save">保存评分</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  INDICATORS,
  INDICATOR_LEVELS,
  calcNationalScore,
  autoScoreRecord,
} from '../../data/govIndicators.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'save'])

/** { [indId]: { score, params } } */
const records = ref({})

/** 用户手动评分过的指标 id（一键自动评分时跳过，避免覆盖手动结果） */
let manuallyScored = new Set()

/** 当前 tab：基线 / 增强 */
const activeLevel = ref(INDICATOR_LEVELS[0])
/** 只看未评分 */
const onlyUnscored = ref(false)

watch(
  () => props.visible,
  (v) => {
    if (v) init()
  },
)

function init() {
  records.value = {}
  manuallyScored = new Set()
  const saved = props.item?.indicatorScores || {}
  INDICATORS.forEach((ind) => {
    const prev = saved[ind.id]
    if (prev && typeof prev.score === 'number') {
      // 已保存过的评分优先加载，视为用户已确认，一键自动评分不再覆盖
      records.value[ind.id] = { score: prev.score, params: { ...(prev.params || {}) } }
      manuallyScored.add(ind.id)
    } else {
      // 具备能力的指标自动预填，其余留空手动评分
      const auto = autoScoreRecord(ind, props.item)
      records.value[ind.id] = auto
        ? { score: auto.score, params: { ...auto.params } }
        : { score: null, params: {} }
    }
  })
}

/** 一键自动评分：仅对具备能力且未手动评分的指标重新打分（不覆盖已手动填写的指标） */
function runAutoScore() {
  INDICATORS.forEach((ind) => {
    if (!ind.capable) return
    if (manuallyScored.has(ind.id)) return
    const auto = autoScoreRecord(ind, props.item)
    if (auto) {
      records.value[ind.id] = { score: auto.score, params: { ...auto.params } }
    }
  })
}

function close() {
  emit('update:visible', false)
}

function recordOf(ind) {
  return records.value[ind.id]
}

function indicatorsByLevel(level) {
  return INDICATORS.filter((i) => i.level === level)
}

/** 当前 tab 下按筛选条件展示的指标 */
const filteredIndicators = computed(() => {
  let list = indicatorsByLevel(activeLevel.value)
  if (onlyUnscored.value) {
    list = list.filter((i) => recordOf(i).score == null)
  }
  return list
})

/** 当前 tab 下未评分指标数（供筛选计数） */
const unscoredInLevel = computed(() =>
  indicatorsByLevel(activeLevel.value).filter((i) => recordOf(i).score == null),
)

/** 指标加权贡献分文本：weight × score / 10 */
function contributionText(ind) {
  const s = recordOf(ind).score
  if (s == null) return '--'
  return ((ind.weight * s) / 10).toFixed(1)
}

function clampScore(n) {
  if (Number.isNaN(n)) return null
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10))
}
function scoreText(s) {
  return s === null || s === undefined ? '--' : s
}

function paramOf(ind, key) {
  const v = records.value[ind.id]?.params?.[key]
  return v === undefined ? '' : v
}

function onParamInput(ind, key, raw) {
  const r = records.value[ind.id]
  let val = raw === '' ? 0 : Number(raw)
  if (Number.isNaN(val)) val = 0
  // 按参数定义的 min/max 收敛越界输入
  const param = ind.params?.find(p => p.key === key)
  if (param) {
    if (val < param.min) val = param.min
    if (val > param.max) val = param.max
  }
  r.params[key] = val
  r.score = clampScore(ind.calc(r.params))
  manuallyScored.add(ind.id)
}

function onPass(ind, pass) {
  records.value[ind.id].score = pass ? 10 : 0
  manuallyScored.add(ind.id)
}

function onLts(ind, isLts) {
  records.value[ind.id].score = isLts ? 10 : 5
  manuallyScored.add(ind.id)
}

function onScoreInput(ind, raw) {
  const val = raw === '' ? null : Number(raw)
  records.value[ind.id].score = clampScore(val)
  manuallyScored.add(ind.id)
}

const scoredCount = computed(() => INDICATORS.filter((i) => records.value[i.id]?.score !== null && records.value[i.id]?.score !== undefined).length)

const totalScore = computed(() => calcNationalScore(records.value))

function levelScore(level) {
  const scored = INDICATORS.filter(
    (i) => i.level === level && records.value[i.id]?.score != null,
  )
  if (scored.length === 0) return null
  return scored.reduce((sum, i) => sum + (i.weight * records.value[i.id].score) / 10, 0)
}
const baseScoreText = computed(() => {
  const s = levelScore('基线')
  return s === null ? '--' : s.toFixed(1)
})
const enhancedScoreText = computed(() => {
  const s = levelScore('增强')
  return s === null ? '--' : s.toFixed(1)
})

// 基线准入：基线指标全部合格（每项 score > 0）+ 持续供应能力(bl-14) ≥ 6 分
const baselineEligible = computed(() => {
  const baseline = INDICATORS.filter((i) => i.level === '基线')
  const allPassed = baseline.every((ind) => {
    const s = records.value[ind.id]?.score
    return typeof s === 'number' && s > 0
  })
  if (!allPassed) return false
  const supply = records.value['bl-14']?.score
  return typeof supply === 'number' && supply >= 6
})

function save() {
  const scores = {}
  INDICATORS.forEach((ind) => {
    const r = records.value[ind.id]
    scores[ind.id] = { score: r?.score ?? null, params: { ...(r?.params || {}) } }
  })
  emit('save', scores)
  close()
}
</script>

<style scoped>
.score-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.score-dialog {
  width: 860px;
  max-width: 96vw;
  max-height: 92vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.score-dialog-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #f3f4f6;
}
.score-dialog-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.score-dialog-sub {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}
.score-dialog-ver {
  color: #9ca3af;
}
.score-dialog-close {
  flex-shrink: 0;
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}
.score-dialog-close:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 汇总条 */
.score-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fff5f6, #fef2f2);
  border-bottom: 1px solid #fde2e2;
}
.score-summary-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.score-summary-total-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.score-summary-total-num {
  font-size: 30px;
  font-weight: 800;
  color: #da203e;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.score-summary-total-num.is-empty {
  color: #d1d5db;
}
.score-summary-total-max {
  font-size: 13px;
  color: #9ca3af;
}
.score-summary-badge {
  margin-left: 8px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  align-self: center;
}
.score-summary-badge.badge--pass {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.score-summary-badge.badge--fail {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.score-summary-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.score-summary-meta-item {
  font-size: 12px;
  color: #6b7280;
  background: #fff;
  border: 1px solid #f3d6d9;
  border-radius: 999px;
  padding: 4px 10px;
}
.score-auto-btn {
  flex-shrink: 0;
  height: 30px;
  padding: 0 14px;
  border: 1px solid #da203e;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: #da203e;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.score-auto-btn:hover {
  background: #da203e;
  color: #fff;
}

/* 指标列表 */
.score-dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 24px 20px;
}

/* ===== tab 切换 + 筛选 ===== */
.score-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
}
.score-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  align-self: stretch;
}
.score-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.score-tab:hover {
  color: #374151;
}
.score-tab.is-active {
  color: #da203e;
  font-weight: 600;
  border-bottom-color: #da203e;
}
.score-tab-count {
  font-size: 11px;
  color: #9ca3af;
  background: #e5e7eb;
  padding: 0 6px;
  border-radius: 8px;
  line-height: 16px;
}
.score-tab.is-active .score-tab-count {
  background: #fde2e2;
  color: #da203e;
}
.score-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.score-filter input[type="checkbox"] {
  margin: 0;
  accent-color: #da203e;
}
.score-filter-count {
  font-size: 11px;
  color: #d97706;
  font-weight: 600;
}

/* ===== 指标表格 ===== */
.score-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
}
.score-table th {
  padding: 9px 10px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.score-table td {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
  color: #374151;
}
.score-table tbody tr:hover {
  background: #fafafa;
}
.score-table tbody tr.is-unscored .col-name-text-wrap {
  /* 未评分行通过得分列高亮即可，这里预留 */
}
.col-name {
  width: 176px;
}
.col-desc {
  width: auto;
}
.col-weight {
  width: 56px;
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}
.col-ctrl {
  width: 252px;
}
.col-score {
  width: 96px;
  text-align: center;
}
.score-table th.col-weight,
.score-table th.col-score,
.score-table th.col-ctrl {
  text-align: center;
}

.score-row-name {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.score-row-name-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.score-row-flag {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.flag--cap {
  background: #dcfce7;
  color: #16a34a;
}
.flag--manual {
  background: #fef3c7;
  color: #d97706;
}

.score-cell-desc {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.score-cell-meta {
  margin: 4px 0 0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #9ca3af;
}

.score-cell-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.score-cell-num {
  font-size: 16px;
  font-weight: 700;
  color: #16a34a;
  font-variant-numeric: tabular-nums;
}
.score-cell-num.is-empty {
  color: #d1d5db;
}
.score-cell-max {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 1px;
}
.score-cell-sub {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}
.score-cell-sub-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #da203e;
  opacity: 0.75;
  flex-shrink: 0;
}
.score-cell-sub.is-empty .score-cell-sub-dot {
  background: #d1d5db;
}

.score-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 16px !important;
  font-size: 13px;
}

/* 评分控件 */
.score-input {
  width: 90px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  outline: none;
  text-align: center;
  transition: border-color 0.15s;
}
.score-input:focus {
  border-color: #da203e;
}
.score-input--sm {
  width: 72px;
  padding: 4px 8px;
  font-size: 12px;
}
.score-input::placeholder {
  color: #c3c8cf;
}

.score-formula {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.score-formula-params {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.score-param {
  display: flex;
  align-items: center;
  gap: 6px;
}
.score-param-label {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.score-pass {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
/* 手动打分输入框：右对齐（与公式/合格按钮组一致） */
.score-input-wrap {
  display: flex;
  justify-content: flex-end;
}
.score-pass-btn {
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.score-pass-btn:hover {
  border-color: #da203e;
  color: #da203e;
}
.score-pass-btn.is-on {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}
.score-pass-btn.is-off {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

/* 底部 */
.score-dialog-ft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}
.score-dialog-tip {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.5;
}
.score-dialog-ft-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 按钮（复用治理页风格） */
.gov-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
  font-family: inherit;
}
.gov-btn:hover {
  border-color: #da203e;
  color: #da203e;
}
.gov-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.gov-btn--primary:hover {
  background: #b81830;
  border-color: #b81830;
  color: #fff;
}

/* 过渡 */
.score-fade-enter-active,
.score-fade-leave-active {
  transition: opacity 0.18s ease;
}
.score-fade-enter-from,
.score-fade-leave-to {
  opacity: 0;
}
</style>
