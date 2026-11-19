<template>
  <div class="pass-toggle">
    <button
      type="button"
      class="pass-toggle-btn"
      :class="{ 'is-on': modelValue === 'pass' }"
      :disabled="disabled"
      @click="emit('update:modelValue', 'pass')"
    >合格</button>
    <button
      type="button"
      class="pass-toggle-btn"
      :class="{ 'is-off': modelValue === 'fail' }"
      :disabled="disabled"
      @click="emit('update:modelValue', 'fail')"
    >不合格</button>
  </div>
</template>

<script setup>
/**
 * 合格 / 不合格 两态按钮组。
 * 样式与「指标评分」弹窗（IndicatorScoreDialog）中的合格判定按钮保持一致：
 * 选中合格=绿底，选中不合格=红底，未选中为白底灰字。
 */
defineProps({
  /** 'pass' | 'fail' | 其它（如 'pending'）表示两者均未选中 */
  modelValue: { type: String, default: 'pending' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.pass-toggle {
  display: inline-flex;
  white-space: nowrap;
}
.pass-toggle-btn {
  position: relative;
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  border-radius: 0;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.4;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  word-break: keep-all;
  transition: all 0.15s;
}
/* 连成按钮组：相邻按钮共用一条描边 */
.pass-toggle-btn + .pass-toggle-btn {
  margin-left: -1px;
}
.pass-toggle-btn:first-child {
  border-radius: 6px 0 0 6px;
}
.pass-toggle-btn:last-child {
  border-radius: 0 6px 6px 0;
}
.pass-toggle-btn:hover:not(:disabled) {
  border-color: #c8ccd2;
  color: #374151;
  z-index: 1;
}
.pass-toggle-btn.is-on {
  background: #dcf0e5;
  border-color: #a9d5bd;
  color: #26694a;
  font-weight: 600;
  z-index: 1;
}
.pass-toggle-btn.is-off {
  background: #f9dfe3;
  border-color: #e3aeb7;
  color: #93313e;
  font-weight: 600;
  z-index: 1;
}
.pass-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
