<template>
  <Teleport to="body">
    <Transition name="od-fade">
      <div v-if="open" class="od-overlay" @click.self="emit('close')">
        <div class="od-dialog" role="dialog" aria-modal="true" :aria-label="`${resolvedTitle} · 用户级统计`">
          <header class="od-hd">
            <div class="od-hd-info">
              <h3 class="od-title">{{ resolvedTitle }}</h3>
              <p class="od-sub">
                {{ subtitle || '数据已脱敏：用户姓名按「首尾保留、中间打码」处理，仅用于组织内活跃度分析' }}
              </p>
            </div>
            <button type="button" class="od-close" aria-label="关闭" @click="emit('close')">&times;</button>
          </header>

          <div class="od-body">
            <!-- 组织汇总 -->
            <div class="od-sum">
              <div v-for="s in summary" :key="s.label" class="od-sum-card">
                <span class="od-sum-label">{{ s.label }}</span>
                <span class="od-sum-value">{{ s.value.toLocaleString() }}<em v-if="s.unit">{{ s.unit }}</em></span>
              </div>
            </div>

            <!-- 用户级明细（姓名已脱敏） -->
            <div class="od-table-wrap">
              <table class="od-table">
                <thead>
                  <tr>
                    <th class="od-col-no">#</th>
                    <th>用户</th>
                    <!-- 跨组织视角（按指标下钻）时才显示所属组织 -->
                    <th v-if="showOrg">所属组织</th>
                    <th class="od-col-num" :class="{ 'is-metric': metricKey === 'pv' }">页面浏览</th>
                    <th class="od-col-num" :class="{ 'is-metric': metricKey === 'download' }">下载</th>
                    <th class="od-col-num" :class="{ 'is-metric': metricKey === 'ai' }">AI 对话</th>
                    <th class="od-col-num" :class="{ 'is-metric': metricKey === 'api' }">接口调用</th>
                    <th>最近活跃</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, i) in users" :key="u.name + i">
                    <td class="od-col-no">{{ i + 1 }}</td>
                    <td class="od-name">{{ u.name }}</td>
                    <td v-if="showOrg" class="od-org" :title="u.org">{{ u.org }}</td>
                    <td class="od-col-num" :class="{ 'is-metric': metricKey === 'pv' }">{{ u.pv.toLocaleString() }}</td>
                    <td class="od-col-num" :class="{ 'is-metric': metricKey === 'download' }">{{ u.download }}</td>
                    <td class="od-col-num" :class="{ 'is-metric': metricKey === 'ai' }">{{ u.ai }}</td>
                    <td class="od-col-num" :class="{ 'is-metric': metricKey === 'api' }">{{ u.api.toLocaleString() }}</td>
                    <td class="od-time">{{ u.last }}</td>
                  </tr>
                  <tr v-if="!users.length">
                    <td class="od-empty" :colspan="showOrg ? 8 : 7">暂无相关用户级统计数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 组织下钻弹窗：展示某组织内**已脱敏**的用户级统计数据。
 *
 * 复用场景（两处）：
 *   1. 左栏「平台使用情况」（月报统计量）——点击指标卡看该指标的组织下钻；
 *   2. 左栏「组织活跃度 Top10」——点击某个组织看该组织内用户活跃分布。
 * 故做成受控组件：open 由父级控制，数据由父级按点击对象传入。
 *
 * 需求原话：若想统计用户使用情况还可点击组织数据，弹窗展示该组织内脱敏用户级的统计数据。
 * 脱敏由数据层 maskUserName 统一处理，本组件只负责展示，不再做二次加工。
 */
const props = defineProps({
  /** 是否打开 */
  open: { type: Boolean, default: false },
  /** 组织名（单组织视角时用于拼接标题） */
  orgName: { type: String, default: '' },
  /** 弹窗标题（不传则由 orgName 拼「XX · 用户级统计」） */
  title: { type: String, default: '' },
  /** 副标题（不传则用默认的脱敏说明） */
  subtitle: { type: String, default: '' },
  /** 该组织内用户级数据（姓名应已脱敏）[{ name, org?, pv, download, ai, api, last }] */
  users: { type: Array, default: () => [] },
  /** 是否显示「所属组织」列（按指标跨组织下钻时为 true） */
  showOrg: { type: Boolean, default: false },
  /** 当前聚焦的指标 key（pv/download/ai/api），用于高亮对应列 */
  metricKey: { type: String, default: '' },
})

const emit = defineEmits(['close'])

/** 标题：显式传入优先，否则由组织名拼接 */
const resolvedTitle = computed(() => props.title || (props.orgName ? `${props.orgName} · 用户级统计` : '用户级统计'))

/** 组织汇总：由用户级数据求和，避免与明细不一致 */
const summary = computed(() => {
  const sum = (k) => props.users.reduce((s, u) => s + (Number(u[k]) || 0), 0)
  return [
    { label: '活跃用户', value: props.users.length, unit: '人' },
    { label: '页面浏览', value: sum('pv'), unit: '' },
    { label: '下载次数', value: sum('download'), unit: '' },
    { label: 'AI 对话', value: sum('ai'), unit: '' },
  ]
})
</script>

<style scoped>
/* 与大屏深色科技风一致（弹窗挂在 body 下，故不能依赖大屏的 CSS 变量，这里取字面值） */
.od-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vh 4vw;
  background: rgba(2, 10, 22, 0.72);
  backdrop-filter: blur(3px);
}
.od-dialog {
  display: flex;
  flex-direction: column;
  width: min(880px, 92vw);
  max-height: 86vh;
  background: linear-gradient(160deg, rgba(10, 40, 78, 0.98), rgba(5, 22, 46, 0.98));
  border: 1px solid rgba(0, 145, 255, 0.45);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 91, 203, 0.18);
  overflow: hidden;
}

.od-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 145, 255, 0.28);
}
.od-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #F5FAFF;
}
.od-sub {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: #9DC0E4;
}
.od-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  font-size: 20px;
  line-height: 1;
  color: #9DC0E4;
  background: transparent;
  border: 1px solid rgba(0, 145, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.od-close:hover { color: #F5FAFF; border-color: rgba(0, 145, 255, 0.7); background: rgba(0, 91, 203, 0.25); }

.od-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 18px 18px;
}

/* 组织汇总 */
.od-sum {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.od-sum-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 9px 12px;
  background: rgba(6, 34, 70, 0.7);
  border: 1px solid rgba(0, 145, 255, 0.24);
  border-radius: 6px;
}
.od-sum-label { font-size: 11px; color: #9DC0E4; }
.od-sum-value {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: 20px;
  font-weight: 700;
  color: #7DDCFF;
  font-variant-numeric: tabular-nums;
}
.od-sum-value em { margin-left: 2px; font-style: normal; font-size: 11px; color: #6F94BC; }

/* 明细表 */
.od-table-wrap { overflow-x: auto; }
.od-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.od-table thead th {
  padding: 8px 10px;
  font-weight: 600;
  color: #9DC0E4;
  text-align: left;
  white-space: nowrap;
  background: rgba(0, 91, 203, 0.2);
  border-bottom: 1px solid rgba(0, 145, 255, 0.32);
}
.od-table tbody td {
  padding: 8px 10px;
  color: #D6E7FA;
  white-space: nowrap;
  border-bottom: 1px solid rgba(0, 145, 255, 0.12);
}
.od-table tbody tr:hover td { background: rgba(0, 91, 203, 0.16); }
.od-col-no { width: 40px; text-align: center; color: #6F94BC; }
.od-col-num { text-align: right; font-variant-numeric: tabular-nums; }
/* 脱敏名：等宽 + 略暗，避免被误读为真实姓名 */
.od-name {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.5px;
  color: #A8C6E6;
}
.od-time { font-size: 11.5px; color: #6F94BC; }
.od-empty { text-align: center; color: #6F94BC; padding: 22px 0 !important; }
/* 所属组织列（按指标跨组织下钻时出现） */
.od-org {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #9DC0E4;
}
/* 当前聚焦指标的列高亮 —— 点击哪个指标，弹窗里就突出哪一列 */
.od-col-num.is-metric {
  color: #7DDCFF;
  font-weight: 700;
  background: rgba(0, 91, 203, 0.22);
}
.od-table thead th.od-col-num.is-metric { color: #7DDCFF; }

/* 进场 */
.od-fade-enter-active, .od-fade-leave-active { transition: opacity 0.2s; }
.od-fade-enter-from, .od-fade-leave-to { opacity: 0; }
.od-fade-enter-active .od-dialog { transition: transform 0.22s; }
.od-fade-enter-from .od-dialog { transform: translateY(12px) scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .od-fade-enter-active, .od-fade-leave-active,
  .od-fade-enter-active .od-dialog { transition: none; }
}
</style>
