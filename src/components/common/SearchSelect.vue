<template>
  <div
    ref="rootRef"
    class="ss"
    :class="[{ 'is-open': open, 'is-disabled': disabled }, small ? 'ss--sm' : '']"
  >
    <!-- 触发器：既显示当前值，也可直接输入搜索 -->
    <div class="ss-control" @click="onControlClick">
      <input
        ref="inputRef"
        class="ss-input"
        type="text"
        role="combobox"
        :value="displayText"
        :placeholder="selected ? '' : placeholder"
        :disabled="disabled"
        :aria-expanded="open ? 'true' : 'false'"
        autocomplete="off"
        @input="onInput"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <!-- 有值且允许清空时显示清空按钮 -->
      <button
        v-if="clearable && hasValue && !disabled"
        type="button"
        class="ss-clear"
        title="清空"
        @mousedown.prevent
        @click.stop="clearValue"
      >&times;</button>
      <span class="ss-arrow" :class="{ 'is-open': open }" @mousedown.prevent @click.stop="toggle">▾</span>
    </div>

    <!-- 选项面板：Teleport 到 body 并用 fixed 定位。
         若留在组件内，会被抽屉/表格等滚动容器（overflow: hidden/auto）裁剪遮挡。 -->
    <Teleport to="body">
      <div v-if="open" ref="panelRef" class="ss-panel" :style="panelStyle">
        <ul v-if="filtered.length" class="ss-list" role="listbox">
          <li
            v-for="(opt, idx) in filtered"
            :key="`${opt.value}-${idx}`"
            class="ss-option"
            :class="{
              'is-active': idx === activeIndex,
              'is-selected': isSelected(opt),
              'is-disabled': opt.disabled,
            }"
            role="option"
            :aria-selected="isSelected(opt) ? 'true' : 'false'"
            @mouseenter="activeIndex = idx"
            @mousedown.prevent
            @click="select(opt)"
          >
            <span class="ss-option-label">{{ opt.label }}</span>
            <span v-if="isSelected(opt)" class="ss-check">✓</span>
          </li>
        </ul>
        <p v-else class="ss-empty">{{ emptyText }}</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 可搜索下拉：点击展开、直接输入过滤、支持键盘导航。
 * 用于替换原生 <select>（原生下拉无法输入搜索）。
 *
 * options 支持三种写法：
 *   ['a', 'b']                                  → 值即标签
 *   [{ value: 'a', label: '甲' }]                → 标准写法
 *   [{ value: 'a', label: '甲', disabled: true }] → 单项禁用
 */
const props = defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  /** 值以数字形式抛出（等价原生 v-model.number） */
  number: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** 紧凑尺寸（用于表格工具条、分页器等场景） */
  small: { type: Boolean, default: false },
  /** 允许清空已选值 */
  clearable: { type: Boolean, default: false },
  emptyText: { type: String, default: '无匹配项' },
  /** 对象数组里取「值」的字段名，默认 value */
  valueKey: { type: String, default: 'value' },
  /** 对象数组里取「标签」的字段名，默认 label */
  labelKey: { type: String, default: 'label' },
  /**
   * 置顶的「全部/不限」项文案。设置后会在选项头部插入一个 value='' 的选项，
   * 用于替代原生 `<option value="">全部X</option>` 的写法。
   */
  allLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const rootRef = ref(null)
const inputRef = ref(null)
/** 面板被 Teleport 到 body，需单独持有引用（用于定位与外部点击判定） */
const panelRef = ref(null)
const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)

/**
 * 面板定位：fixed + 按触发器位置计算。
 * 因为面板已 Teleport 到 body，不再受父级 overflow 裁剪，所以位置必须自己算。
 */
const panelStyle = ref({})
/** 面板与触发器之间的间距 */
const PANEL_GAP = 4
/** 面板最大高度（与样式中的 max-height 保持一致，用于判断是否需要向上翻转） */
const PANEL_MAX_H = 240

function updatePanelPosition() {
  const el = rootRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const spaceBelow = window.innerHeight - r.bottom - PANEL_GAP
  const spaceAbove = r.top - PANEL_GAP
  // 下方空间不足且上方更宽裕时向上翻转，避免面板溢出视口
  const flipUp = spaceBelow < Math.min(PANEL_MAX_H, spaceAbove)
  const style = {
    left: `${r.left}px`,
    width: `${r.width}px`,
    maxHeight: `${Math.max(120, Math.min(PANEL_MAX_H, flipUp ? spaceAbove : spaceBelow))}px`,
  }
  if (flipUp) style.bottom = `${window.innerHeight - r.top + PANEL_GAP}px`
  else style.top = `${r.bottom + PANEL_GAP}px`
  panelStyle.value = style
}

/** 面板打开期间的滚动/缩放跟随 */
function onPanelViewportChange() {
  if (open.value) updatePanelPosition()
}

/**
 * 归一化选项，统一为 { value, label, disabled }。
 * 支持：基本类型数组 / {value,label} 数组 / 自定义 valueKey·labelKey 的对象数组。
 */
const normOptions = computed(() => {
  const list = props.options.map((o) => {
    if (o === null || o === undefined) return { value: o, label: String(o), disabled: false }
    if (typeof o === 'object') {
      const rawVal = o[props.valueKey] !== undefined ? o[props.valueKey] : o.value
      let rawLabel = o[props.labelKey] !== undefined ? o[props.labelKey] : o.label
      if (rawLabel === undefined) rawLabel = rawVal
      return {
        value: rawVal,
        label: rawLabel === undefined || rawLabel === null ? String(rawVal) : String(rawLabel),
        disabled: !!o.disabled,
      }
    }
    return { value: o, label: String(o), disabled: false }
  })
  // 「全部/不限」置顶项（value 为空串，与筛选类下拉的「全部X」语义一致）
  if (props.allLabel) list.unshift({ value: '', label: props.allLabel, disabled: false })
  return list
})

/** 按字符串比较值（兼容数字/字符串混用） */
function sameValue(a, b) {
  return String(a) === String(b)
}

const selected = computed(() => normOptions.value.find((o) => sameValue(o.value, props.modelValue)))
const hasValue = computed(() => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined)

/** 关闭时显示已选标签；展开时显示输入框内容（即搜索词） */
const displayText = computed(() => (open.value ? query.value : (selected.value?.label ?? '')))

/** 过滤后的选项：展开且有关键词时才过滤 */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!open.value || !q) return normOptions.value
  return normOptions.value.filter(
    (o) => o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q),
  )
})

function isSelected(opt) {
  return sameValue(opt.value, props.modelValue)
}

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  query.value = ''
  // 展开时高亮当前选中项，便于键盘操作
  const idx = filtered.value.findIndex((o) => isSelected(o))
  activeIndex.value = idx
  // 先按当前触发器位置定位，再聚焦（面板已 Teleport 到 body，必须自己算位置）
  nextTick(() => {
    updatePanelPosition()
    inputRef.value?.focus()
  })
}

function closePanel() {
  open.value = false
  query.value = ''
  activeIndex.value = -1
}

function toggle() {
  if (open.value) closePanel()
  else openPanel()
}

function onControlClick() {
  if (props.disabled) return
  if (open.value) inputRef.value?.focus()
  else openPanel()
}

function select(opt) {
  if (!opt || opt.disabled) return
  const val = props.number ? Number(opt.value) : opt.value
  emit('update:modelValue', val)
  emit('change', val)
  closePanel()
  nextTick(() => inputRef.value?.focus())
}

function clearValue() {
  emit('update:modelValue', props.number ? null : '')
  emit('change', props.number ? null : '')
  closePanel()
}

function onInput(e) {
  if (props.disabled) return
  if (!open.value) open.value = true
  query.value = e.target.value
  // 输入后默认高亮第一项，回车即可选中
  activeIndex.value = filtered.value.length ? 0 : -1
}

function onKeydown(e) {
  if (props.disabled) return
  const key = e.key
  if (key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) return openPanel()
    if (filtered.value.length) activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
  } else if (key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) return openPanel()
    if (filtered.value.length) activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (key === 'Enter') {
    e.preventDefault()
    if (!open.value) return openPanel()
    const opt = filtered.value[activeIndex.value]
    if (opt) select(opt)
  } else if (key === 'Escape') {
    if (open.value) {
      e.preventDefault()
      closePanel()
    }
  } else if (key === 'Tab') {
    closePanel()
  }
}

/** 失焦：输入未选中任何项时放弃搜索词，恢复显示已选值 */
function onBlur() {
  // 延迟关闭，避免点击面板项时先触发 blur 导致选不中
  window.setTimeout(() => {
    if (!rootRef.value?.contains(document.activeElement)) closePanel()
  }, 120)
}

/** 点击组件外部时关闭（面板已 Teleport 到 body，需同时判断 root 与 panel） */
function onDocMousedown(e) {
  if (!open.value) return
  const inRoot = rootRef.value?.contains(e.target)
  const inPanel = panelRef.value?.contains(e.target)
  if (!inRoot && !inPanel) closePanel()
}

onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown)
  // 面板为 fixed 定位，需在滚动/缩放时跟随触发器（capture 以捕获内层滚动容器）
  window.addEventListener('scroll', onPanelViewportChange, true)
  window.addEventListener('resize', onPanelViewportChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMousedown)
  window.removeEventListener('scroll', onPanelViewportChange, true)
  window.removeEventListener('resize', onPanelViewportChange)
})
</script>

<style scoped>
.ss {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 13px;
}
/* 默认外观放在根元素上，并用 :where() 归零优先级 —— 各页原有的 .xxx-select 样式
   （高度/内边距/边框/圆角）可直接覆盖根元素，无需逐处改样式，也不会出现双层边框。 */
:where(.ss) {
  height: 32px;
  padding: 0 8px 0 10px;
  background: #fff;
  border: 1px solid #d9dde3;
  border-radius: 4px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
:where(.ss):hover { border-color: #c2c8d0; }
.ss.is-open { box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.1); }
:where(.ss.is-disabled) { background: #f5f6f8; cursor: not-allowed; }
/* 内层只负责布局，不再画边框，避免与根元素形成双层边框 */
.ss-control {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}
.ss-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: 13px;
  font-family: inherit;
  color: #1f2937;
  background: transparent;
  border: none;
  outline: none;
  cursor: inherit;
  text-overflow: ellipsis;
}
.ss-input::placeholder { color: #9ca3af; }
.ss-input:disabled { cursor: not-allowed; }

.ss-clear {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: #9ca3af;
  background: #eef0f3;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.ss-clear:hover { color: #4b5563; background: #e2e5ea; }

.ss-arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.15s;
}
.ss-arrow.is-open { transform: rotate(180deg); }

/* 面板：fixed 定位（位置由 panelStyle 计算），Teleport 到 body 以避免被父级 overflow 裁剪 */
.ss-panel {
  position: fixed;
  z-index: 3000;
  overflow-y: auto;
  padding: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}
.ss-list { margin: 0; padding: 0; list-style: none; }
.ss-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}
.ss-option-label { overflow: hidden; text-overflow: ellipsis; }
.ss-option.is-active { background: #f5f6f8; }
.ss-option.is-selected { color: #da203e; font-weight: 500; }
.ss-option.is-disabled { color: #c4c9d0; cursor: not-allowed; }
.ss-check { flex-shrink: 0; font-size: 12px; }
.ss-empty {
  margin: 0;
  padding: 10px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

/* 紧凑尺寸 */
.ss--sm .ss-control { height: 28px; padding: 0 6px 0 8px; }
.ss--sm .ss-input { font-size: 12px; }
.ss--sm .ss-panel { max-height: 200px; }
</style>
