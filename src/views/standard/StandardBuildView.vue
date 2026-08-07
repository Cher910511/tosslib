<template>
  <div class="standard-page">
    <!-- ===== 使用引导 ===== -->
    <div class="guide-banner">
      <div class="guide-banner-content">
        <strong>使用步骤：</strong>
        ① 创建模板 → ② 配置每个指标的权重（%）→ ③ 确认计算公式 → ④ 保存模板
        <br />
        <small>每个组织可以创建自己的模板，权重可自由调整。</small>
      </div>
      <button class="guide-close" @click="showGuide = false" v-if="showGuide"></button>
    </div>

    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">选型指标模板配置</h1>
      </div>
      <div class="page-header-actions">
        <button type="button" class="btn btn-outline" @click="showNewTemplateDialog = true">+ 新建模板</button>
        <button type="button" class="btn btn-outline" @click="exportTemplate">导出模板</button>
        <button type="button" class="btn btn-primary" @click="handleSave">保存模板</button>
      </div>
    </div>

    <!-- 模板选择 -->
    <div class="template-bar">
      <span class="template-bar-label">当前模板：</span>
      <select v-model="activeTemplateId" class="template-select" @change="loadTemplate">
        <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}（{{ t.orgName }}）</option>
      </select>
      <button type="button" class="template-delete" @click="deleteTemplate" :disabled="templates.length <= 1">删除</button>
    </div>

    <!-- 组织与基本信息 -->
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">适用组织</span>
        <input v-model="currentTemplate.orgName" class="info-input" placeholder="例：平安科技、中国工商银行" />
      </div>
      <div class="info-row">
        <span class="info-label">模板说明</span>
        <input v-model="currentTemplate.desc" class="info-input" placeholder="例：适用于金融场景的开源软件选型评估" />
      </div>
      <div class="info-row">
        <span class="info-label">总分计算方式</span>
        <select v-model="currentTemplate.scoreMethod" class="info-input info-select">
          <option value="weighted_sum">加权求和 — 每个指标得分×权重，累加得总分</option>
          <option value="weighted_avg">加权平均 — 总分归一化到 0-10 分</option>
          <option value="min_pass">一票否决 — 任一指标不合格则总分为 0</option>
        </select>
      </div>
    </div>

    <!-- 级别标签页 -->
    <div class="level-tabs">
      <button
          v-for="lv in LEVELS"
          :key="lv.key"
          class="level-tab"
          :class="{ 'is-active': activeLevel === lv.key }"
          @click="activeLevel = lv.key"
        >{{ lv.label }}</button>
    </div>

    <!-- 指标权重配置 -->
    <div class="indicator-section" v-for="cat in CATEGORIES" :key="cat.key">
      <div class="category-header">
        <h2 class="category-title">{{ cat.label }}</h2>
        <span class="category-summary">
          {{ indicatorsByGroup[activeLevel]?.[cat.key]?.length || 0 }} 项指标 |
          本类权重合计：<strong>{{ categoryWeightSum(cat.key) }}%</strong>
        </span>
      </div>

      <div class="indicator-card" v-for="ind in indicatorsByGroup[activeLevel]?.[cat.key] || []" :key="ind.id">
        <div class="indicator-head">
          <span class="indicator-tag">{{ ind.l1 }}</span>
          <span class="indicator-title">{{ ind.l2 }}</span>
        </div>
        <p class="indicator-desc">{{ ind.desc }}</p>

        <!-- 权重和公式配置 -->
        <div class="indicator-config">
          <div class="config-item">
            <label class="config-label">权重（%） <span class="tip" data-tip="这个指标占总分的百分比。所有指标的权重加起来应=100%。例如：超危漏洞权重15%，表示它在总分中占15%的权重。">ⓘ</span></label>
            <div class="config-weight-wrap">
              <input
                type="number"
                class="config-weight-input"
                :value="getWeight(ind.id)"
                @input="setWeight(ind.id, $event)"
                min="0"
                max="100"
                step="0.5"
              />
              <span class="config-weight-unit">%</span>
            </div>
          </div>
          <div class="config-item">
            <label class="config-label">计算公式 <span class="tip" :data-tip="explainFormula(ind.formula)">ⓘ</span></label>
            <input
              type="text"
              class="config-formula-input"
              :value="formatFormula(getFormula(ind.id))"
              @input="setFormula(ind.id, $event)"
              :title="'默认公式：' + ind.formula"
            />
          </div>
          <div class="config-item config-item--wide">
            <label class="config-label">评分范围</label>
            <span class="config-score-range">{{ ind.score_range }}</span>
          </div>
          <div class="config-item config-item--full">
            <div class="config-row-2col">
              <div class="config-sub-col">
                <label class="config-label-bold">测评方法：</label>
                <span class="config-eval-method">{{ charSpacing(ind.eval_method) }}</span>
              </div>
              <div class="config-sub-col">
                <label class="config-label-bold">打分参考：</label>
                <span class="config-eval-method">{{ charSpacing(ind.remark) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!(indicatorsByGroup[activeLevel]?.[cat.key]?.length)" class="empty-category">
        该分类下暂无指标
      </div>
    </div>

    <!-- 底部权重合计 -->
    <div class="total-bar">
      <span class="total-bar-label">全部指标权重合计：</span>
      <span class="total-bar-value" :class="{ 'is-ok': totalWeightSum === 100, 'is-warn': totalWeightSum !== 100 }">
        {{ totalWeightSum }}%
      </span>
      <span class="total-bar-hint" v-if="totalWeightSum !== 100">
        权重合计应等于 100%，当前 {{ totalWeightSum > 100 ? '超出' : '不足' }} {{ Math.abs(100 - totalWeightSum).toFixed(1) }}%
      </span>
      <span class="total-bar-hint is-ok" v-else>权重合计为100%，配置正确</span>
    </div>

    <!-- 新建模板弹窗 -->
    <div v-if="showNewTemplateDialog" class="dialog-overlay" @click.self="showNewTemplateDialog = false">
      <div class="dialog" role="dialog">
        <div class="dialog-header">
          <h2>新建模板</h2>
          <button class="dialog-close" @click="showNewTemplateDialog = false"></button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>模板名称</label>
            <input v-model="newTemplateName" class="form-input" placeholder="请输入模版名称..." />
          </div>
          <div class="form-group">
            <label>适用组织</label>
            <input v-model="newTemplateOrg" class="form-input" placeholder="请输入组织名称..." />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-ghost" @click="showNewTemplateDialog = false">取消</button>
          <button class="btn btn-primary" @click="createTemplate" :disabled="!newTemplateName.trim()">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  STANDARD_LEVELS,
  CATEGORIES,
  STANDARD_INDICATORS,
  groupByLevelAndCategory,
} from '../../data/standardIndicators.js'
import { downloadCsv } from '../../utils/csvExport.js'

const LEVELS = STANDARD_LEVELS
const activeLevel = ref('baseline')
const showNewTemplateDialog = ref(false)
const newTemplateName = ref('')
const newTemplateOrg = ref('')
const showGuide = ref(true)

const indicatorsByGroup = computed(() => groupByLevelAndCategory())

const STORAGE_KEY = 'tosslib.standardTemplates'

const templates = ref([])
const activeTemplateId = ref('')

/** 公式字符间加空格 */
function formatFormula(f) {
  if (!f) return ''
  return f.replace(/([a-zA-Z0-9])([^a-zA-Z0-9\s])/g, '$1 $2')
         .replace(/([^a-zA-Z0-9\s])([a-zA-Z0-9])/g, '$1 $2')
         .replace(/\s{2,}/g, ' ')
         .trim()
}

/** 字母/数字/符号与汉字之间加空格，连续汉字不加 */
function charSpacing(s) {
  if (!s) return ''
  // 在汉字与字母/数字/符号之间加空格
  return s.replace(/([\u4e00-\u9fff])([a-zA-Z0-9])/g, '$1 $2')
          .replace(/([a-zA-Z0-9])([\u4e00-\u9fff])/g, '$1 $2')
          .replace(/([\u4e00-\u9fff])([^a-zA-Z0-9\u4e00-\u9fff\s])/g, '$1 $2')
          .replace(/([^a-zA-Z0-9\u4e00-\u9fff\s])([\u4e00-\u9fff])/g, '$1 $2')
}

function explainFormula(formula) {
  const map = {
    'w*(1 - min(n/8, 1))': { text: '权重 × (1 - 超危漏洞数÷8)，漏洞数≥8时该项得0分', vars: ['w=权重', 'n=超危漏洞数'] },
    'w*max(0, 1 - d/0.7)': { text: '权重 × (1 - 漏洞密度÷0.7)，密度≥0.7时该项得0分', vars: ['w=权重', 'd=漏洞密度(个/KLOC)'] },
    'w*max(0, 1 - t/30)': { text: '权重 × (1 - 修复天数÷30)，超过30天得0分', vars: ['w=权重', 't=超危漏洞平均修复天数'] },
    'w*max(0, 1 - t/90)': { text: '权重 × (1 - 修复天数÷90)，超过90天得0分', vars: ['w=权重', 't=高危漏洞平均修复天数'] },
    'w * (合格 ? 10 : 0)': { text: '合格得满分(10分)×权重，不合格得0分', vars: ['w=权重'] },
    'w * max(0, score/10)': { text: '权重 × (得分÷10)，得分越高越好', vars: ['w=权重', 'score=评估打分(0-10)'] },
    'w*max(0, min(1, (8-n)/8))': { text: '权重 × (1 - 漏洞数÷8)，漏洞≥8时得0分', vars: ['w=权重', 'n=高危漏洞数'] },
    'w*max(0, 1 - d/0.5)': { text: '权重 × (1 - 漏洞密度÷0.5)，密度≥0.5时得0分', vars: ['w=权重', 'd=漏洞密度(个/KLOC)'] },
    'w*max(0, 1 - t/7)': { text: '权重 × (1 - 修复天数÷7)，超过7天得0分', vars: ['w=权重', 't=超危漏洞平均修复天数'] },
    'w * score/10': { text: '权重 × (实际得分÷10)', vars: ['w=权重', 'score=评估打分(0-10)'] },
    'w * max(0, 1 - months/12)': { text: '权重 × (1 - 距今月数÷12)，超过12个月得0分', vars: ['w=权重', 'months=距今月数'] },
    'w * (LTS ? 10 : 5)': { text: '选择LTS版本得满分，非LTS版本得5分', vars: ['w=权重'] },
  }
  const entry = map[formula]
  if (entry) {
    return '含义：' + entry.text + '。变量：' + entry.vars.join('，')
  }
  const vars = formula.match(/[a-zA-Z_]+/g) || []
  const unique = [...new Set(vars.filter(v => v !== 'w' && isNaN(v)))]
  const parts = unique.map(v => {
    const m = { n: 'n=数量', d: 'd=密度', t: 't=天数', score: 'score=打分', months: 'months=月数', x: 'x=打分值' }
    return m[v] || v + '=?'
  })
  return '自定义公式。w=权重。' + (parts.length ? '变量：' + parts.join('，') : '')
}

/** 将权重缩放至合计精确等于 100%（若已是整数且合计 100 则原样返回） */
function scaleWeightsTo100(rawWeights) {
  const totalRaw = STANDARD_INDICATORS.reduce((s, i) => s + i.weight, 0)
  // 如果原始权重合计已经是 100 且为整数，直接返回不加缩放
  if (totalRaw === 100) {
    const allInt = STANDARD_INDICATORS.every((ind) => {
      const v = rawWeights[ind.id] ?? ind.weight
      return Number.isInteger(v)
    })
    if (allInt) return { ...rawWeights }
  }
  const scale = 100 / totalRaw
  const result = {}
  let sum = 0
  STANDARD_INDICATORS.forEach((ind) => {
    const v = rawWeights[ind.id] ?? ind.weight
    const scaled = Math.round(v * scale * 10) / 10
    result[ind.id] = scaled
    sum += scaled
  })
  const diff = Math.round((100 - sum) * 10) / 10
  if (Math.abs(diff) > 0.01) {
    let maxId = STANDARD_INDICATORS[0].id
    let maxVal = -1
    STANDARD_INDICATORS.forEach((ind) => {
      if (result[ind.id] > maxVal) { maxVal = result[ind.id]; maxId = ind.id }
    })
    result[maxId] = Math.round((result[maxId] + diff) * 10) / 10
  }
  return result
}

function loadTemplatesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length > 0) {
        // 对每个模板重新应用最新权重（如果检测到非整数权重的旧模板）
        arr.forEach((tpl) => {
          if (tpl.weights) {
            const sample = STANDARD_INDICATORS[0]
            const oldVal = tpl.weights[sample.id]
            // 检测是否为旧模板（值不等于最新整数权重），是则重新生成
            if (oldVal === undefined || Math.abs(oldVal - sample.weight) > 0.01) {
              const rawWeights = {}
              STANDARD_INDICATORS.forEach((ind) => {
                rawWeights[ind.id] = ind.weight
              })
              tpl.weights = scaleWeightsTo100(rawWeights)
            }
          }
        })
        templates.value = arr
        return
      }
    }
  } catch { /* ignore */ }
  const defaultTpl = createDefaultTemplate()
  templates.value = [defaultTpl]
}

function saveTemplatesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
  } catch { /* ignore */ }
}

function createDefaultTemplate() {
  const id = `tpl-${Date.now()}`
  const rawWeights = {}
  const formulas = {}
  STANDARD_INDICATORS.forEach((ind) => {
    rawWeights[ind.id] = ind.weight
    formulas[ind.id] = ind.formula
  })
  return {
    id,
    name: '默认模板',
    orgName: '全局默认',
    desc: '基于国标草案的默认配置，权重已归一化至合计 100%',
    scoreMethod: 'weighted_sum',
    weights: scaleWeightsTo100(rawWeights),
    formulas,
  }
}

const currentTemplate = computed(() => {
  return templates.value.find((t) => t.id === activeTemplateId.value) || templates.value[0] || {}
})

watch(activeTemplateId, () => {
  saveTemplatesToStorage()
})

function loadTemplate() {
  saveTemplatesToStorage()
}

function getWeight(indId) {
  const t = currentTemplate.value
  return t.weights?.[indId] ?? 0
}

function setWeight(indId, e) {
  const val = parseFloat(e.target.value)
  if (isNaN(val)) return
  const t = templates.value.find((x) => x.id === activeTemplateId.value)
  if (t) {
    if (!t.weights) t.weights = {}
    t.weights[indId] = val
  }
}

function getFormula(indId) {
  const t = currentTemplate.value
  return t.formulas?.[indId] ?? ''
}

function setFormula(indId, e) {
  const val = e.target.value
  const t = templates.value.find((x) => x.id === activeTemplateId.value)
  if (t) {
    if (!t.formulas) t.formulas = {}
    t.formulas[indId] = val
  }
}

function categoryWeightSum(catKey) {
  const inds = indicatorsByGroup.value[activeLevel.value]?.[catKey] || []
  let sum = 0
  inds.forEach((ind) => {
    const w = getWeight(ind.id)
    sum += w || 0
  })
  return sum.toFixed(1)
}

const totalWeightSum = computed(() => {
  let sum = 0
  STANDARD_INDICATORS.forEach((ind) => {
    sum += getWeight(ind.id) || 0
  })
  return Math.round(sum * 10) / 10
})

function handleSave() {
  saveTemplatesToStorage()
  const btn = document.querySelector('.btn-primary')
  if (btn) {
    const orig = btn.textContent
    btn.textContent = '已保存'
    setTimeout(() => { btn.textContent = orig }, 1500)
  }
}

function exportTemplate() {
  const t = templates.value.find((x) => x.id === activeTemplateId.value) || templates.value[0]
  if (!t) return
  const columns = [
    { key: 'level', label: '级别' },
    { key: 'category', label: '分类' },
    { key: 'l1', label: '1级指标' },
    { key: 'l2', label: '2级指标' },
    { key: 'desc', label: '指标说明' },
    { key: 'requirement', label: '要求' },
    { key: 'weight', label: '权重(%)' },
    { key: 'formula', label: '计算公式' },
    { key: 'score_range', label: '评分范围' },
    { key: 'eval_method', label: '测评方法' },
    { key: 'remark', label: '打分参考' },
  ]
  const levelMap = { baseline: '基线', enhanced: '增强' }
  const catMap = { code_security: '代码技术安全', legal_compliance: '合法合规', supply_resilience: '供应韧性' }
  const rows = STANDARD_INDICATORS.map((ind) => ({
    level: levelMap[ind.level] || ind.level,
    category: catMap[ind.category] || ind.category,
    l1: ind.l1,
    l2: ind.l2,
    desc: ind.desc,
    requirement: ind.requirement,
    weight: getWeight(ind.id),
    formula: t.formulas?.[ind.id] || ind.formula,
    score_range: ind.score_range,
    eval_method: ind.eval_method,
    remark: ind.remark,
  }))
  const filename = `${t.name}-${t.orgName}.csv`.replace(/[\\/:*?"<>|]/g, '_')
  downloadCsv(filename, columns, rows)
}

function createTemplate() {
  const id = `tpl-${Date.now()}`
  const rawWeights = {}
  const formulas = {}
  STANDARD_INDICATORS.forEach((ind) => {
    rawWeights[ind.id] = ind.weight
    formulas[ind.id] = ind.formula
  })
  templates.value.push({
    id,
    name: newTemplateName.value.trim(),
    orgName: newTemplateOrg.value.trim() || '未指定',
    desc: '',
    scoreMethod: 'weighted_sum',
    weights: scaleWeightsTo100(rawWeights),
    formulas,
  })
  activeTemplateId.value = id
  newTemplateName.value = ''
  newTemplateOrg.value = ''
  showNewTemplateDialog.value = false
  saveTemplatesToStorage()
}

function deleteTemplate() {
  if (templates.value.length <= 1) return
  const idx = templates.value.findIndex((t) => t.id === activeTemplateId.value)
  if (idx !== -1) {
    templates.value.splice(idx, 1)
    activeTemplateId.value = templates.value[0].id
    saveTemplatesToStorage()
  }
}

onMounted(() => {
  loadTemplatesFromStorage()
  activeTemplateId.value = templates.value[0]?.id || ''
})
</script>

<style scoped>
.standard-page {
  min-height: 100%;
}

/* ===== 引导横幅 ===== */
.guide-banner {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  margin-bottom: 16px;
  position: relative;
  line-height: 1.6;
  font-size: 13px;
  color: #1e40af;
}
.guide-banner-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}
.guide-banner-content {
  flex: 1;
  min-width: 0;
}
.guide-banner-content strong {
  color: #1e3a8a;
}
.guide-banner-content small {
  color: #3b82f6;
}
.guide-close {
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

/* ===== 顶部 ===== */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.page-header-left {
  flex: 1;
  min-width: 0;
}
.page-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: var(--admin-text, #1a1a1a);
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--admin-muted, #6b7280);
}
.page-header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-primary {
  background: var(--admin-primary, #da203e);
  color: #fff;
  border-color: var(--admin-primary, #da203e);
}
.btn-primary:hover { background: #b81830; }
.btn-outline {
  background: #fff;
  color: #374151;
  border-color: #e5e7eb;
}
.btn-outline:hover { border-color: #da203e; color: #da203e; }
.btn-ghost {
  background: transparent;
  color: #374151;
  border-color: #e5e7eb;
}
.btn-ghost:hover { background: #f3f4f6; }

/* ===== 模板选择栏 ===== */
.template-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}
.template-bar-label {
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}
.template-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  max-width: 320px;
}
.template-delete {
  padding: 6px 14px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff;
  color: #dc2626;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.template-delete:hover:not(:disabled) { background: #fef2f2; }
.template-delete:disabled { opacity: 0.4; cursor: not-allowed; }
.template-hint {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

/* ===== 通用提示 ===== */
.info-hint {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
  margin-left: 6px;
}

/* CSS 纯 hover 工具提示 */
.tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  cursor: help;
  margin-left: 4px;
  position: relative;
  flex-shrink: 0;
  vertical-align: middle;
  font-style: normal;
}
.tip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
  width: 260px;
  text-align: left;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
  font-style: normal;
  font-weight: 400;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.tip:hover::after {
  opacity: 1;
}
.tip::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.tip:hover::before {
  opacity: 1;
}
.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  cursor: help;
  margin-left: 3px;
  flex-shrink: 0;
  vertical-align: middle;
}

/* ===== 基本信息卡片 ===== */
.info-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.info-label {
  font-size: 13px;
  color: #6b7280;
  width: 90px;
  flex-shrink: 0;
  font-weight: 500;
}
.info-input {
  flex: 1;
  max-width: 440px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
}
.info-select {
  cursor: pointer;
}

/* ===== 级别标签页 ===== */
.level-tab-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.level-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}
.level-tab {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.level-tab:hover { color: #374151; }
.level-tab.is-active {
  color: var(--admin-primary, #da203e);
  border-bottom-color: var(--admin-primary, #da203e);
  font-weight: 600;
}
.level-hint {
  font-size: 12px;
  color: #9ca3af;
}

/* ===== 统一字段说明 ===== */
.field-guide {
  background: #fafbfc;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}
.field-guide-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
.field-guide-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}
.field-guide-item {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}
.field-guide-item strong {
  color: #374151;
}

/* ===== 分类区块 ===== */
.indicator-section {
  margin-bottom: 24px;
}
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
}
.category-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.category-summary {
  font-size: 12px;
  color: #9ca3af;
}

/* ===== 指标卡片 ===== */
.indicator-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: none;
  padding: 14px 18px;
}
.indicator-card:last-child {
  border-radius: 0 0 8px 8px;
}
.indicator-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.indicator-tag {
  display: inline-block;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #224ebf;
  background: rgba(34, 78, 191, 0.08);
  border-radius: 4px;
  white-space: nowrap;
}
.indicator-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.indicator-desc {
  margin: 4px 0 10px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
.indicator-config {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.config-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}
.config-item--wide {
  min-width: 140px;
  flex: 1;
}
.config-item--full {
  width: 100%;
  flex: none;
}
.config-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}
.config-label-bold {
  font-size: 12px;
  color: #374151;
  font-weight: 700;
}
.config-weight-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}
.config-weight-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #da203e;
  text-align: center;
}
.config-weight-input:focus {
  outline: none;
  border-color: #da203e;
}
.config-weight-unit {
  font-size: 13px;
  color: #6b7280;
}
.config-formula-input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  color: #374151;
  width: 100%;
  box-sizing: border-box;
}
.config-formula-input:focus {
  outline: none;
  border-color: #224ebf;
}
.config-score-range {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: fit-content;
}
.config-eval-method {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

/* 测评方法和打分参考同一行 */
.config-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.empty-category {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

/* ===== 底部权重合计 ===== */
.total-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 8px;
}
.total-bar-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.total-bar-value {
  font-size: 18px;
  font-weight: 800;
}
.total-bar-value.is-ok { color: #16a34a; }
.total-bar-value.is-warn { color: #dc2626; }
.total-bar-hint {
  font-size: 13px;
  color: #dc2626;
}
.total-bar-hint.is-ok {
  color: #16a34a;
}

/* ===== 弹窗 ===== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
}
.dialog {
  margin: auto;
  background: #fff;
  border-radius: 12px;
  width: 460px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.dialog-header h2 { margin: 0; font-size: 16px; color: #111827; }
.dialog-close {
  border: none; background: none; font-size: 18px; cursor: pointer; color: #9ca3af;
}
.dialog-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}
</style>