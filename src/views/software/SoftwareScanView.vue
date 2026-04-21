<template>
  <div class="manage-page">
    <div class="manage-toolbar">
      <div class="manage-title">
        <h2>软件扫描</h2>
      </div>
      <div class="manage-actions">
        <button type="button" class="manage-add-btn manage-add-btn--primary" @click="showScanModal = true">
          开始扫描
        </button>
        <button type="button" class="manage-add-btn" @click="refreshList">
          刷新列表
        </button>
      </div>
    </div>

    <section class="manage-card" aria-labelledby="manage-card-title">
      <h2 id="manage-card-title" class="manage-card-title">扫描记录</h2>

      <div class="manage-table-wrap">
        <table class="manage-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>软件名称</th>
              <th>版本</th>
              <th>扫描状态</th>
              <th>扫描时间</th>
              <th class="manage-th-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="scanList.length === 0" class="manage-empty-row">
              <td colspan="6">
                <div class="manage-empty">
                  <div class="manage-empty-art" aria-hidden="true">
                    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z" />
                      <path fill="#fff" stroke="#e5e7eb" d="M32 36h20v8H32zM48 48h24v6H48zM32 58h40v6H32z" />
                      <circle cx="88" cy="40" r="4" fill="#fee2e2" stroke="#fecaca" />
                    </svg>
                  </div>
                  <p class="manage-empty-text">暂无扫描记录</p>
                </div>
              </td>
            </tr>
            <tr v-for="(row, i) in paginatedList" :key="i">
              <td>{{ (page - 1) * pageSize + i + 1 }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.version }}</td>
              <td>
                <span class="scan-status" :class="'scan-status--' + row.status">
                  {{ statusText[row.status] }}
                </span>
              </td>
              <td>{{ row.scanTime }}</td>
              <td class="manage-td-op">
                <button type="button" class="manage-linkish" @click="goToDetail(row)">查看详情</button>
                <span class="manage-op-sep">|</span>
                <button type="button" class="manage-linkish danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="manage-footer">
        <span class="manage-total">共计 {{ scanList.length }} 条</span>
        <div class="manage-pager">
          <button type="button" class="manage-page-btn" :disabled="page <= 1" @click="page = Math.max(1, page - 1)">‹</button>
          <span class="manage-page-current">{{ page }}</span>
          <button type="button" class="manage-page-btn" :disabled="page >= totalPages" @click="page = Math.min(totalPages, page + 1)">›</button>
          <label class="manage-page-size">
            <select v-model.number="pageSize" class="manage-page-select">
              <option :value="10">10 / 页</option>
              <option :value="20">20 / 页</option>
              <option :value="50">50 / 页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <!-- 扫描弹窗 -->
    <Teleport to="body">
      <div v-if="showScanModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>开始扫描</h3>
            <button type="button" class="modal-close" @click="closeModal">×</button>
          </div>

          <div class="modal-body">
            <!-- 操作类型切换 -->
            <div class="scan-mode-tabs">
              <button
                type="button"
                class="scan-mode-tab"
                :class="{ 'is-active': scanMode === 'fetch-software' }"
                @click="scanMode = 'fetch-software'"
              >
                拉取已有软件
              </button>
              <button
                type="button"
                class="scan-mode-tab"
                :class="{ 'is-active': scanMode === 'fetch-component' }"
                @click="scanMode = 'fetch-component'"
              >
                拉取已有组件
              </button>
              <button
                type="button"
                class="scan-mode-tab"
                :class="{ 'is-active': scanMode === 'upload' }"
                @click="scanMode = 'upload'"
              >
                上传新包扫描
              </button>
            </div>

            <!-- 拉取已有软件 -->
            <div v-if="scanMode === 'fetch-software'" class="scan-form">
              <div class="form-group form-group--full">
                <label class="form-label">选择软件 <span class="required">*</span></label>
                <select v-model="formData.softwareId" class="form-input form-select">
                  <option value="">请选择要扫描的软件</option>
                  <option v-for="sw in softwareList" :key="sw.name" :value="sw.name">
                    {{ sw.name }} ({{ sw.type }})
                  </option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label class="form-label">版本号</label>
                <input
                  v-model="formData.version"
                  type="text"
                  class="form-input"
                  placeholder="如 1.0.0"
                />
              </div>
              <div class="form-group form-group--full">
                <label class="form-label">上传软件包 <span class="required">*</span></label>
                <div
                  class="upload-dropzone"
                  :class="{ 'is-dragover': isDragover }"
                  @dragover.prevent="isDragover = true"
                  @dragleave="isDragover = false"
                  @drop.prevent="handleDrop"
                  @click="$refs.fileInput.click()"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".zip,.tar,.tar.gz,.tgz"
                    hidden
                    @change="handleFileChange"
                  />
                  <div class="upload-icon">↑</div>
                  <p class="upload-hint">拖拽文件到此处，或<span class="upload-link">点击上传</span></p>
                  <p class="upload-formats">支持 .zip、.tar、.tar.gz、.tgz 格式</p>
                </div>
                <div v-if="selectedFile" class="upload-file-info">
                  <span class="file-icon">📦</span>
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
                  <button type="button" class="file-remove" @click="selectedFile = null">×</button>
                </div>
              </div>
            </div>

            <!-- 拉取已有组件（无需上传文件） -->
            <div v-if="scanMode === 'fetch-component'" class="scan-form">
              <div class="form-group form-group--full">
                <label class="form-label">选择组件 <span class="required">*</span></label>
                <div class="component-list">
                  <div
                    v-for="comp in componentList"
                    :key="comp.id"
                    class="component-item"
                    :class="{ 'is-selected': formData.componentId === comp.id }"
                    @click="formData.componentId = comp.id; formData.softwareId = comp.softwareId"
                  >
                    <div class="component-main">
                      <span class="component-name">{{ comp.name }}</span>
                      <span class="component-software">→ {{ comp.softwareName }}</span>
                    </div>
                    <div class="component-meta">
                      <span>v{{ comp.version }}</span>
                      <span>{{ comp.lang }}</span>
                      <span>{{ comp.license }}</span>
                    </div>
                  </div>
                  <div v-if="componentList.length === 0" class="component-empty">
                    暂无组件，请先创建
                  </div>
                </div>
              </div>
              <div class="form-tip">
                将使用组件创建时上传的文件进行扫描，无需重新上传
              </div>
            </div>

            <!-- 上传新包扫描 -->
            <div v-if="scanMode === 'upload'" class="scan-form">
              <div class="form-group">
                <label class="form-label">软件名称 <span class="required">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  placeholder="请输入软件名称"
                />
              </div>
              <div class="form-group">
                <label class="form-label">软件类型 <span class="required">*</span></label>
                <select v-model="formData.type" class="form-input form-select">
                  <option value="">请选择软件类型</option>
                  <option value="library">开源库</option>
                  <option value="framework">框架</option>
                  <option value="tool">工具软件</option>
                  <option value="application">应用程序</option>
                  <option value="sdk">SDK</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label class="form-label">上传软件包 <span class="required">*</span></label>
                <div
                  class="upload-dropzone"
                  :class="{ 'is-dragover': isDragover }"
                  @dragover.prevent="isDragover = true"
                  @dragleave="isDragover = false"
                  @drop.prevent="handleDrop"
                  @click="$refs.fileInput.click()"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".zip,.tar,.tar.gz,.tgz"
                    hidden
                    @change="handleFileChange"
                  />
                  <div class="upload-icon">↑</div>
                  <p class="upload-hint">拖拽文件到此处，或<span class="upload-link">点击上传</span></p>
                  <p class="upload-formats">支持 .zip、.tar、.tar.gz、.tgz 格式</p>
                </div>
                <div v-if="selectedFile" class="upload-file-info">
                  <span class="file-icon">📦</span>
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
                  <button type="button" class="file-remove" @click="selectedFile = null">×</button>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="manage-add-btn" @click="closeModal">取消</button>
            <button
              type="button"
              class="manage-add-btn manage-add-btn--primary"
              :disabled="!canStartScan"
              @click="startScan"
            >
              开始扫描
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

      <script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const showScanModal = ref(false)
const scanMode = ref('fetch-software') // 'fetch-software' | 'fetch-component' | 'upload'
const selectedFile = ref(null)
const isDragover = ref(false)

// 表单数据
const formData = ref({
  // 拉取已有软件
  softwareId: '',
  version: '',
  // 拉取已有组件
  componentId: '',
  // 上传新包
  name: '',
  type: '',
})

const page = ref(1)
const pageSize = ref(10)

const router = useRouter()

const statusText = {
  pending: '待扫描',
  scanning: '扫描中',
  completed: '已完成',
  failed: '失败',
}



// 跳转到详情页
function goToDetail(row) {
  router.push({
    name: 'scan-result',
    query: {
      name: row.name,
      version: row.version,
    }
  })
}

// 演示数据
const scanList = ref([
  { name: 'Vue.js', version: '3.4.21', status: 'completed', scanTime: '2024-03-20 14:32:15' },
  { name: 'React', version: '18.2.0', status: 'completed', scanTime: '2024-03-20 14:28:03' },
  { name: 'TensorFlow', version: '2.16.1', status: 'scanning', scanTime: '2024-03-20 14:25:47' },
  { name: 'Spring Boot', version: '3.2.3', status: 'pending', scanTime: '2024-03-20 14:20:00' },
  { name: 'FastAPI', version: '0.110.0', status: 'failed', scanTime: '2024-03-20 14:18:22' },
])

const softwareList = ref([
  { name: 'React', type: 'framework' },
  { name: 'Vue', type: 'framework' },
  { name: 'Lodash', type: 'library' },
  { name: 'Axios', type: 'library' },
  { name: 'Express', type: 'framework' },
])

const componentList = ref([
  { id: 1, name: 'vue', softwareId: 'Vue', softwareName: 'Vue', version: '3.4.21', lang: 'JavaScript', license: 'MIT' },
  { id: 2, name: 'vue-router', softwareId: 'Vue', softwareName: 'Vue', version: '4.3.0', lang: 'JavaScript', license: 'MIT' },
  { id: 3, name: 'lodash', softwareId: 'Lodash', softwareName: 'Lodash', version: '4.17.21', lang: 'JavaScript', license: 'MIT' },
  { id: 4, name: 'axios', softwareId: 'Axios', softwareName: 'Axios', version: '1.6.8', lang: 'JavaScript', license: 'MIT' },
])

const canStartScan = computed(() => {
  if (scanMode.value === 'fetch-software') {
    // 拉取已有软件：需要选择软件 + 上传文件
    return formData.value.softwareId !== '' && selectedFile.value !== null
  } else if (scanMode.value === 'fetch-component') {
    // 拉取已有组件：只需要选择组件（文件已在创建时上传）
    return formData.value.componentId !== ''
  } else if (scanMode.value === 'upload') {
    // 上传新包：需要名称、类型、文件
    return formData.value.name.trim() !== '' && formData.value.type !== '' && selectedFile.value !== null
  }
  return false
})

const totalPages = computed(() => Math.max(1, Math.ceil(scanList.value.length / pageSize.value)))

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return scanList.value.slice(start, start + pageSize.value)
})

watch(pageSize, () => { page.value = 1 })

function closeModal() {
  showScanModal.value = false
  selectedFile.value = null
  // 重置所有表单字段
  formData.value.name = ''
  formData.value.type = ''
  formData.value.softwareId = ''
  formData.value.componentId = ''
  formData.value.version = ''
}

function handleDrop(e) {
  isDragover.value = false
  const file = e.dataTransfer.files[0]
  if (file) validateAndSetFile(file)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) validateAndSetFile(file)
}

function validateAndSetFile(file) {
  const validExts = ['.zip', '.tar', '.tar.gz', '.tgz']
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!validExts.some(e => file.name.toLowerCase().endsWith(e))) {
    alert('仅支持 .zip、.tar、.tar.gz、.tgz 格式')
    return
  }
  selectedFile.value = file
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function startScan() {
  let name = ''
  let version = '待检测'

  if (scanMode.value === 'new-software') {
    // 新建软件
    name = formData.value.name
  } else if (scanMode.value === 'add-component') {
    // 新增组件
    name = formData.value.softwareId + ' / ' + formData.value.componentName
    version = formData.value.version || '待检测'
  } else if (scanMode.value === 'upload') {
    // 扫描新包
    name = formData.value.name
  }

  scanList.value.unshift({
    name,
    version,
    status: 'pending',
    scanTime: new Date().toLocaleString('zh-CN'),
  })

  closeModal()
  page.value = 1
}

function refreshList() {
  page.value = 1
}
</script>

<style scoped>
.manage-page {
  padding: 24px;
  min-height: 100%;
  margin: 0 auto;
}

.manage-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.manage-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.manage-actions {
  display: flex;
  gap: 12px;
}

.manage-add-btn {
  height: 36px;
  padding: 0 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.manage-add-btn:hover:not(:disabled) {
  border-color: #da203e;
  color: #da203e;
}

.manage-add-btn--primary {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}

.manage-add-btn--primary:hover:not(:disabled) {
  background: #b91c2d;
  border-color: #b91c2d;
  color: #fff;
}

.manage-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.manage-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.manage-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.manage-table-wrap { overflow-x: auto; }

.manage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.manage-table th,
.manage-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.manage-table th {
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}

.manage-table tbody tr:hover { background: #f9fafb; }

.manage-th-op, .manage-td-op { text-align: right; white-space: nowrap; }

.scan-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.scan-status--pending { background: #fef3c7; color: #92400e; }
.scan-status--scanning { background: #dbeafe; color: #1e40af; }
.scan-status--completed { background: #d1fae5; color: #065f46; }
.scan-status--failed { background: #fee2e2; color: #991b1b; }

/* 详情弹窗 */
.detail-body {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-info-item {
  display: flex;
  gap: 12px;
}

.detail-info-label {
  color: #6b7280;
  font-size: 13px;
  flex-shrink: 0;
}

.detail-info-value {
  color: #111827;
  font-size: 13px;
  font-weight: 500;
}

.detail-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.detail-tab {
  padding: 10px 16px;
  font-size: 14px;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: -1px;
}

.detail-tab:hover {
  color: #111827;
}

.detail-tab.is-active {
  color: #da203e;
  border-bottom-color: #da203e;
}

.detail-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 6px;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 10px;
  color: #374151;
}

.detail-tab-count.danger {
  background: #fee2e2;
  color: #dc2626;
}

.detail-content {
  padding: 4px 0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.detail-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.detail-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.detail-table tr:last-child td {
  border-bottom: none;
}

.detail-table-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

.license-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
}

.license-tag--full {
  background: #f0f9ff;
}

.risk-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.risk-badge--high {
  background: #fee2e2;
  color: #dc2626;
}

.risk-badge--low {
  background: #d1fae5;
  color: #059669;
}

.risk-level {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.risk-level--high {
  background: #fee2e2;
  color: #dc2626;
}

.risk-level--medium {
  background: #fef3c7;
  color: #d97706;
}

.risk-level--low {
  background: #d1fae5;
  color: #059669;
}

.cve-id {
  font-family: monospace;
  font-size: 12px;
  color: #0369a1;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.severity-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.severity-badge--Critical { background: #7f1d1d; color: #fff; }
.severity-badge--High { background: #fee2e2; color: #dc2626; }
.severity-badge--Medium { background: #fef3c7; color: #d97706; }
.severity-badge--Low { background: #d1fae5; color: #059669; }

.cvss-score {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.cvss-score--high { background: #fee2e2; color: #dc2626; }
.cvss-score--medium { background: #fef3c7; color: #d97706; }
.cvss-score--low { background: #d1fae5; color: #059669; }

.manage-empty-row td { padding: 60px 16px; }
.manage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.manage-empty-art { width: 120px; height: 100px; opacity: 0.95; }
.manage-empty-art svg { width: 100%; height: 100%; }
.manage-empty-text { margin: 0; font-size: 14px; color: #9ca3af; }

.manage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.manage-total { font-size: 13px; color: #6b7280; }
.manage-pager { display: flex; align-items: center; gap: 8px; }

.manage-page-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 18px;
  line-height: 1;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.manage-page-btn:hover:not(:disabled) {
  border-color: #da203e;
  color: #da203e;
}

.manage-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.manage-page-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #da203e;
}

.manage-page-size { margin-left: 4px; }
.manage-page-select {
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  cursor: pointer;
}

.manage-linkish {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  color: #da203e;
  cursor: pointer;
  text-decoration: none;
}

.manage-linkish:hover { text-decoration: underline; }
.manage-linkish.danger { color: #dc2626; }
.manage-op-sep { margin: 0 6px; color: #d1d5db; font-size: 12px; user-select: none; }

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  width: 520px;
  max-height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  line-height: 1;
  transition: background 0.15s;
}

.modal-close:hover { background: #f3f4f6; color: #374151; }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

/* 基本信息表单 */
.scan-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #dc2626;
  margin-left: 2px;
}

.form-input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* 扫描模式切换 */
.scan-mode-tabs {
  display: flex;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.scan-mode-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: #f9fafb;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.scan-mode-tab:first-child { border-right: 1px solid #e5e7eb; }
.scan-mode-tab.is-active { background: #da203e; color: #fff; }

/* 组件列表 */
.component-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.component-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
}

.component-item:last-child {
  border-bottom: none;
}

.component-item:hover {
  background: #f9fafb;
}

.component-item.is-selected {
  background: #fef2f2;
  border-left: 3px solid #da203e;
}

.component-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.component-name {
  font-weight: 500;
  color: #111827;
}

.component-software {
  font-size: 13px;
  color: #6b7280;
}

.component-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.component-empty {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
}

/* 上传区域 */
.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.upload-dropzone:hover,
.upload-dropzone.is-dragover {
  border-color: #da203e;
  background: #fef2f2;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  font-size: 32px;
  color: #9ca3af;
}

.upload-hint {
  margin: 0 0 4px;
  font-size: 14px;
  color: #374151;
}

.upload-link { color: #da203e; font-weight: 500; }

.upload-formats {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
}

.file-icon { font-size: 16px; }
.file-name { font-weight: 500; color: #111827; }
.file-size { color: #6b7280; }
.file-remove {
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
}

.file-remove:hover { color: #dc2626; }

/* 拉取模式 */
.fetch-tabs {
  display: flex;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.fetch-tab {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: #f9fafb;
  font: inherit;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.fetch-tab:first-child { border-right: 1px solid #e5e7eb; }
.fetch-tab.is-active { background: #da203e; color: #fff; }

.fetch-search { margin-bottom: 12px; }

.fetch-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  box-sizing: border-box;
}

.fetch-input:focus {
  outline: none;
  border-color: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.1);
}

.fetch-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.fetch-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 0.15s;
}

.fetch-item:last-child { border-bottom: none; }
.fetch-item:hover { background: #f9fafb; }
.fetch-item.is-selected { background: #fef2f2; }

.fetch-item-name { font-weight: 500; color: #111827; font-size: 14px; }
.fetch-item-info { font-size: 12px; color: #6b7280; }

.fetch-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.fetch-selected {
  margin-top: 12px;
  padding: 10px 12px;
  background: #d1fae5;
  border-radius: 6px;
  font-size: 13px;
  color: #065f46;
}
</style>