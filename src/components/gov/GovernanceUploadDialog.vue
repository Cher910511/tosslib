<template>
  <Teleport to="body">
    <div v-if="open" class="upload-overlay" @click.self="emit('close')">
      <div class="upload-modal">
        <div class="upload-modal-hd">
          <h3 class="upload-modal-title">上传治理结果</h3>
          <button type="button" class="upload-modal-close" @click="emit('close')">&times;</button>
        </div>

        <!-- 回传完成态 -->
        <div v-if="importedCount != null" class="upload-modal-body">
          <div class="upload-done">
            <p class="upload-done-title">✓ 治理结果已回传</p>
            <p class="upload-done-hint">
              「{{ importedLabel }}」的 {{ importedCount }} 条软件已导入源码备份列表，该清单状态已置为「已回传，待审批」，系统已按治理结果自动完成国标评分。
            </p>
          </div>
        </div>

        <!-- 选清单 + 选文件 + 解析校验 -->
        <div v-else class="upload-modal-body">
          <!-- 形态一（「软件治理」页）：需先选定本次回传对应的清单 -->
          <div v-if="!targetLocked" class="upload-target">
            <label class="upload-target-label" for="govUploadTarget">待治理清单</label>
            <select id="govUploadTarget" v-model="targetId" class="upload-target-select" :disabled="parsing">
              <option value="">请选择本次上传对应的清单</option>
              <option v-for="r in targetOptions" :key="r.id" :value="r.id">{{ optionLabel(r) }}</option>
            </select>
            <span v-if="target" class="upload-target-hint">须包含该清单全部 {{ (target.items || []).length }} 条软件</span>
            <span v-else-if="!targetOptions.length" class="upload-target-hint is-warn">当前没有待回传的清单</span>
          </div>

          <!-- 形态二（「我的待治理清单」页行内回传）：清单已由行内动作确定，弹窗内不提供清单选择 -->
          <p v-else-if="target" class="upload-context">
            本次回传：<strong>{{ targetLabel }}</strong>
          </p>

          <div class="upload-row">
            <input ref="fileRef" type="file" accept=".xlsx,.xls,.csv" class="visually-hidden" @change="onFile" />
            <button type="button" class="gov-btn" :disabled="!target" @click="fileRef?.click()">选择治理结果文件</button>
            <button type="button" class="gov-btn" :disabled="!target" @click="downloadTargetTemplate">下载该清单模板</button>
            <span v-if="fileName" class="upload-file-name" :title="fileName">{{ fileName }}</span>
            <span v-if="parsing" class="upload-muted">解析中…</span>
          </div>

          <p class="upload-tip">
            <strong>一次上传对应一份清单，且须覆盖该清单全部软件。</strong>{{ targetLocked ? '' : '先选定清单 → ' }}下载「该清单模板」→ 填好治理结果 → 上传。
            <br />
            校验规则：必填项齐全、枚举列取值合法、名称+版本须落在清单内且不多不少、表格内不重复、未与已入库软件重复；任一不通过则整份无法导入。
          </p>

          <!-- 国内备份地址平台要求（模板说明行内也有同样提示） -->
          <p class="upload-mirror-tip">
            <strong>国内备份地址仅支持 AtomGit：</strong>源码本就在 AtomGit 则两个地址相同；仅在 GitHub 等境外仓库的，请先手动上传至 AtomGit 再填其地址。
          </p>
          <p v-if="error" class="upload-error">{{ error }}</p>

          <div v-if="rows.length" class="upload-result">
            <p class="upload-summary">
              「{{ target?.org }}」清单应有 <strong>{{ (target?.items || []).length }}</strong> 条 · 文件解析 {{ rows.length }} 条 · 通过 <strong class="is-ok">{{ passedRows.length }}</strong> 条 · 未通过 <strong :class="failedRows.length ? 'is-bad' : ''">{{ failedRows.length }}</strong> 条
            </p>
            <p v-if="missing.length" class="upload-error">
              缺少清单中的 {{ missing.length }} 条软件：{{ missing.map((i) => `${i.name} ${i.version}`).join('、') }}——一次上传须包含该清单全部软件，请补全后重新上传。
            </p>
            <div class="upload-table-wrap">
              <table class="upload-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>软件名称</th>
                    <th>版本</th>
                    <th>校验结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in rows" :key="i">
                    <td class="upload-muted">{{ i + 1 }}</td>
                    <td>{{ row.name || '—' }}</td>
                    <td>{{ row.version || '—' }}</td>
                    <td class="upload-check">
                      <span v-if="row.errors.length" class="upload-fail">✗ {{ row.errors.join('；') }}</span>
                      <span v-else class="upload-pass">✓ 通过</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="upload-modal-ft">
          <template v-if="importedCount != null">
            <button type="button" class="gov-btn" @click="emit('close')">关闭</button>
          </template>
          <template v-else>
            <button type="button" class="gov-btn" @click="emit('close')">取消</button>
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="!canImport || importing"
              @click="confirmImport"
            >{{ importing ? '导入中…' : '确认导入（' + passedRows.length + ' 条）' }}</button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import {
  parseGovernanceSheet, validateGovernanceRows, writePrefilledTemplate, sameSoftware,
} from '../../data/governanceTemplate.js'
import { getInboundRequests, updateInboundStatus, updateInboundReturn } from '../../data/inboundRequests.js'
import { importFromInbound, softwareList } from '../../data/governanceStore.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  // 由「待治理清单」页点「回传清单」进入时传入清单 ID：清单已确定，弹窗内不再提供清单选择
  presetListId: { type: String, default: '' },
})
// close：父页面关闭弹窗；imported：回传完成（父页面可据此刷新列表）
const emit = defineEmits(['close', 'imported'])

const fileRef = ref(null)
const fileName = ref('')
const parsing = ref(false)
const error = ref('')
const rows = ref([])
const importing = ref(false)
const importedCount = ref(null)
const importedLabel = ref('')
const targetOptions = ref([]) // 可回传的待治理清单：已分配给治理负责人且尚未回传
const targetId = ref('')
const targetLocked = ref(false) // 清单由父页面指定，弹窗内只读展示
const missing = ref([]) // 所选清单中未出现在上传文件里的软件（完整性校验）

const optionLabel = (r) => `${r.org}（${r.fileName}） ${r.itemCount} 条`

const target = computed(() => targetOptions.value.find((r) => r.id === targetId.value) || null)
const targetLabel = computed(() => (target.value ? optionLabel(target.value) : ''))
const passedRows = computed(() => rows.value.filter((row) => row.errors.length === 0))
const failedRows = computed(() => rows.value.filter((row) => row.errors.length > 0))
// 可导入条件：已选清单 + 至少一行 + 行级校验全通过 + 覆盖清单全部软件
const canImport = computed(() => !!target.value && rows.value.length > 0
  && failedRows.value.length === 0 && missing.value.length === 0 && !parsing.value)

/** 清空本次解析/回传结果（保留已选清单） */
function resetResultState() {
  fileName.value = ''
  parsing.value = false
  error.value = ''
  rows.value = []
  importing.value = false
  importedCount.value = null
  importedLabel.value = ''
  missing.value = []
}

/**
 * 每次打开弹窗初始化。两个入口对应两种弹窗形态：
 * 1)「软件治理」页（不传 presetListId）：拉取可回传清单，由使用者在弹窗内选定本次回传的清单；
 * 2)「我的待治理清单」页行内回传（传 presetListId）：清单已由行内动作确定，弹窗内不提供清单选择，直接锁定该清单。
 */
function initDialog() {
  resetResultState()
  const all = getInboundRequests()
  const id = props.presetListId || ''
  if (id) {
    const picked = all.find((r) => r.id === id)
    targetOptions.value = picked ? [picked] : []
    targetId.value = picked ? id : ''
    targetLocked.value = !!picked
    return
  }
  targetOptions.value = all.filter((r) => r.assignedOrgId && r.status === '已分配')
  targetId.value = ''
  targetLocked.value = false
}

watch(() => props.open, (open) => {
  if (open) initDialog()
})

/** 下载当前所选清单的预填模板：22 列表头 + 该清单全部软件的名称/版本 */
function downloadTargetTemplate() {
  const t = target.value
  if (!t) return
  const base = String(t.fileName || '软件导入模板').replace(/\.(xlsx|xls|csv)$/i, '')
  writePrefilledTemplate(`${base}-治理结果.xlsx`, t.items || [])
}

/** 选择治理结果文件：解析 + 校验（复用共享模板解析/校验逻辑） */
async function onFile(e) {
  const file = e.target?.files?.[0]
  if (e.target) e.target.value = ''
  if (!file) return
  const ext = file.name.toLowerCase()
  if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
    resetResultState()
    error.value = '仅支持 .xlsx / .xls / .csv 格式文件'
    return
  }
  parsing.value = true
  error.value = ''
  rows.value = []
  missing.value = []
  importedCount.value = null
  try {
    const buf = await file.arrayBuffer()
    const workbook = XLSX.read(buf, { type: 'array' })
    const parsed = parseGovernanceSheet(workbook)
    if (!parsed.length) {
      error.value = '未解析到有效数据，请确认使用软件导入模板（表头需含治理模板列）'
      return
    }
    // 校验上下文：本次上传绑定唯一清单，名称+版本须落在该清单内（多于清单的软件会判不匹配）
    const t = target.value
    if (!t) {
      error.value = '请先选择本次上传对应的待治理清单'
      return
    }
    rows.value = validateGovernanceRows(parsed, { items: t.items || [], softwareList: softwareList.value })
    // 完整性校验：一次上传必须覆盖该清单全部软件，缺失的逐条列出
    missing.value = (t.items || []).filter((it) => !parsed.some((row) => sameSoftware(row, it)))
    fileName.value = file.name
    // 回传结果回写清单：本次文件读不出可导入结果时记为「失败」（成功条数 0，失败条数=行校验未通过+清单缺失的条数）。
    // 清单状态不变，仍为「待回传」，可修正后重传；重传成功会把该结果覆盖为「成功」。
    const failedCount = failedRows.value.length + missing.value.length
    if (failedCount > 0) updateInboundReturn(t.id, { status: '失败', okCount: 0, failCount: failedCount })
  } catch (err) {
    error.value = '文件解析失败，请确认是有效的 Excel / CSV 文件'
  } finally {
    parsing.value = false
  }
}

/** 确认导入：全部通过后写入源码备份列表，同时将对应清单状态置为「待审核」（已提交平台审批） */
async function confirmImport() {
  if (!canImport.value) return
  importing.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400)) // 模拟提交
    // 本次上传绑定唯一清单：整批导入该清单（带入提交人/提交组织），并回写该清单状态
    const t = target.value
    if (!t) return
    const created = importFromInbound(passedRows.value, t)
    if (t.status === '已分配') updateInboundStatus(t.id, '待审核')
    // 回传结果回写清单：整份校验通过才可导入，故成功条数=本次导入条数、失败条数 0
    updateInboundReturn(t.id, { status: '成功', okCount: created.length, failCount: 0 })
    importedCount.value = created.length
    importedLabel.value = t.org || t.fileName || '该清单'
    emit('imported', { count: created.length, label: importedLabel.value, targetId: t.id })
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
/* 说明：本组件自带按钮/表格/遮罩样式。父页面（如 AdminGovernanceView）的 <style scoped>
   不会作用到组件内部元素，故此处与父页面保持同一套视觉规范。 */
.upload-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
}

.upload-modal {
  background: #fff;
  border-radius: 12px;
  width: 720px;
  max-width: 92vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  animation: uploadModalIn 0.2s ease;
  overflow: hidden;
}
@keyframes uploadModalIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.upload-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.upload-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.upload-modal-close {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}
.upload-modal-close:hover { background: #f3f4f6; color: #374151; }
.upload-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.upload-modal-ft {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

/* ===== 待治理清单 ===== */
.upload-target {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.upload-target-label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}
.upload-target-select {
  min-width: 320px;
  max-width: 520px;
  padding: 6px 10px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.upload-target-select:disabled { opacity: 0.6; cursor: not-allowed; }
/* 形态二：清单已由「我的待治理清单」行内动作确定，只提示本次回传的是哪份清单，不提供选择 */
.upload-context {
  margin: 0;
  font-size: 13px;
  color: #374151;
}
.upload-context strong { font-weight: 600; color: #111827; }
.upload-target-hint {
  font-size: 12px;
  color: #9ca3af;
}
.upload-target-hint.is-warn { color: #b45309; }

/* ===== 选文件 ===== */
.upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.upload-file-name {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 10px;
}
.upload-muted { color: #9ca3af; }

.upload-tip {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}
/* 国内备份地址仅支持 AtomGit：强调提示 */
.upload-mirror-tip {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.6;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
}
.upload-mirror-tip strong { font-weight: 600; }
.upload-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

/* ===== 校验结果 ===== */
.upload-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upload-summary {
  margin: 0;
  font-size: 13px;
  color: #374151;
}
.upload-summary .is-ok { color: #16a34a; }
.upload-summary .is-bad { color: #dc2626; }
.upload-table-wrap {
  overflow-x: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}
.upload-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.upload-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.upload-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.upload-table tbody tr:last-child td { border-bottom: none; }
.upload-check { white-space: normal; min-width: 220px; }
.upload-pass {
  color: #16a34a;
  font-size: 12px;
}
.upload-fail {
  color: #dc2626;
  font-size: 12px;
  line-height: 1.5;
}

/* ===== 回传完成态 ===== */
.upload-done {
  padding: 40px 16px;
  text-align: center;
}
.upload-done-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #16a34a;
}
.upload-done-hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

/* ===== 按钮 ===== */
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
.gov-btn:hover { border-color: #da203e; color: #da203e; }
.gov-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.gov-btn:disabled:hover { border-color: #e5e7eb; color: #374151; }
.gov-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.gov-btn--primary:hover { background: #b81830; border-color: #b81830; color: #fff; }
.gov-btn--primary:disabled { background: #da203e; border-color: #da203e; color: #fff; opacity: 0.4; cursor: not-allowed; }
.gov-btn--primary:disabled:hover { background: #da203e; border-color: #da203e; color: #fff; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
