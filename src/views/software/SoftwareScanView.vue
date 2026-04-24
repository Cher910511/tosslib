<template>
  <div class="manage-page">
    <div class="manage-toolbar">
      <div class="manage-title-row">
        <div class="manage-tabs" role="tablist" aria-label="列表类型">
          <button
            type="button"
            role="tab"
            class="manage-tab"
            :class="{ 'is-active': scanListTab === 'software' }"
            :aria-selected="scanListTab === 'software'"
            @click="setScanListTab('software')"
          >
            软件
          </button>
          <button
            type="button"
            role="tab"
            class="manage-tab"
            :class="{ 'is-active': scanListTab === 'component' }"
            :aria-selected="scanListTab === 'component'"
            @click="setScanListTab('component')"
          >
            组件
          </button>
        </div>
      </div>
      <div class="manage-actions">
        <button type="button" class="manage-add-btn manage-add-btn--primary" @click="showScanModal = true">
          开始扫描
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
              <th>扫描时间</th>
              <th>扫描状态</th>
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
              <td>{{ row.scanTime }}</td>
              <td>
                <span class="scan-status" :class="'scan-status--' + row.status">
                  {{ statusText[row.status] }}
                </span>
              </td>
              <td class="manage-td-op">
                <button v-if="row.status === 'scanning'" type="button" class="scan-btn scan-btn--scanning">
                  <span class="scan-btn-spinner"></span>
                  扫描中
                </button>
                <button v-else type="button" class="scan-btn" :class="row.status === 'success' ? 'scan-btn--rescan' : 'scan-btn--start'" @click="handleScan(row)">
                  <svg v-if="row.status === 'success'" viewBox="0 0 20 20" fill="currentColor" class="scan-btn-icon">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else viewBox="0 0 20 20" fill="currentColor" class="scan-btn-icon">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  {{ row.status === 'success' ? '再次扫描' : '开始扫描' }}
                </button>
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
                扫描软件
              </button>
              <button
                type="button"
                class="scan-mode-tab"
                :class="{ 'is-active': scanMode === 'fetch-component' }"
                @click="scanMode = 'fetch-component'"
              >
                扫描组件
              </button>
            </div>

<!-- 扫描软件 -->
            <div v-if="scanMode === 'fetch-software'" class="scan-form">
              <div class="form-group form-group--full">
                <label class="form-label">选择软件及版本</label>
                <div class="software-card-list">
                  <template v-if="softwareList.length > 0">
                    <div
                      v-for="sw in softwareList"
                      :key="sw.name"
                      class="software-card"
                      :class="{ 'is-selected': isSoftwareSelected(sw.name) }"
                    >
                      <div class="software-card-header" @click="toggleSoftware(sw.name)">
                                              <div class="software-card-left">
                                                <span class="software-card-check">
                                                  <span class="check-icon">{{ isSoftwareSelected(sw.name) ? '✓' : '' }}</span>
                                                </span>
                                                <div class="software-card-info">
                                                <span class="software-card-name">{{ sw.name }}</span>
                                                <span class="software-card-lang">{{ sw.lang }}</span>
                                              </div>
                                              </div>
                                            </div>
                                            <div class="version-tags">
                        <label
                          v-for="ver in getSoftwareVersions(sw.name)"
                          :key="ver"
                          class="version-tag"
                          :class="{ 'is-selected': isVersionSelected(sw.name, ver) }"
                        >
                          <input
                            type="checkbox"
                            :checked="isVersionSelected(sw.name, ver)"
                            @click.stop
                            @change="toggleVersion(sw.name, ver)"
                          />
                          {{ ver }}
                        </label>
                        <span v-if="getSoftwareVersions(sw.name).length === 0" class="version-empty">暂无版本</span>
                      </div>
                    </div>
                  </template>
                  <div v-else class="software-empty">暂无软件</div>
                </div>
              </div>
            </div>

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

    <!-- Toast 提示 -->
    <Teleport to="body">
      <div v-if="toastVisible" class="toast-notification">
        <svg viewBox="0 0 20 20" fill="currentColor" class="toast-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Teleport>
  </div>
</template>

      <script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const showScanModal = ref(false)
const scanMode = ref('fetch-software') // 'fetch-software' | 'fetch-component'

// 表单数据
const formData = ref({
  // 拉取已有软件
  softwareId: [],   // 支持多选软件
  selectedVersions: {}, // 软件名 -> 版本数组
  // 拉取已有组件
  componentId: '',
})

const page = ref(1)
const pageSize = ref(10)

// 软件/组件 tab 切换
const scanListTab = ref('software')

function setScanListTab(tab) {
  scanListTab.value = tab
  page.value = 1
}

const router = useRouter()

const statusText = {
  scanning: '扫描中',
  success: '扫描成功',
  failed: '扫描失败',
}

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastTimer = ref(null)

function showToast(msg) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer.value)
  toastTimer.value = setTimeout(() => {
    toastVisible.value = false
  }, 2500)
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
  { name: 'Vue.js', version: '3.4.21', status: 'success', progress: 100, scanTime: '2024-03-20 14:32:15' },
  { name: 'React', version: '18.2.0', status: 'success', progress: 100, scanTime: '2024-03-20 14:28:03' },
  { name: 'TensorFlow', version: '2.16.1', status: 'scanning', progress: 65, scanTime: '2024-03-20 14:25:47' },
  { name: 'Spring Boot', version: '3.2.3', status: 'failed', progress: 0, scanTime: '2024-03-20 14:20:00' },
  { name: 'FastAPI', version: '0.110.0', status: 'failed', progress: 0, scanTime: '2024-03-20 14:18:22' },
])

// 组件扫描演示数据
const componentScanList = ref([
  { name: 'vue', version: '3.4.21', groupId: 'org.vuejs', status: 'completed', progress: 100, scanTime: '2024-03-20 14:35:10' },
  { name: 'vue-router', version: '4.3.0', groupId: 'org.vuejs.router', status: 'completed', progress: 100, scanTime: '2024-03-20 14:33:42' },
  { name: 'react', version: '18.2.0', groupId: 'org.facebook.react', status: 'scanning', progress: 42, scanTime: '2024-03-20 14:30:00' },
  { name: 'spring-boot-starter-web', version: '3.2.3', groupId: 'org.springframework.boot', status: 'pending', progress: 0, scanTime: '2024-03-20 14:25:00' },
  { name: '@angular/core', version: '17.3.4', groupId: 'org.angular.core', status: 'failed', progress: 0, scanTime: '2024-03-20 14:20:30' },
])

// 根据 tab 返回对应列表
const currentScanList = computed(() => {
  return scanListTab.value === 'component' ? componentScanList.value : scanList.value
})

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return currentScanList.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(currentScanList.value.length / pageSize.value)))

const componentList = ref([
  { id: 1, name: 'vue', softwareId: 'Vue', softwareName: 'Vue', version: '3.4.21', lang: 'JavaScript', license: 'MIT' },
  { id: 2, name: 'vue-router', softwareId: 'Vue', softwareName: 'Vue', version: '4.3.0', lang: 'JavaScript', license: 'MIT' },
  { id: 3, name: 'lodash', softwareId: 'Lodash', softwareName: 'Lodash', version: '4.17.21', lang: 'JavaScript', license: 'MIT' },
  { id: 4, name: 'axios', softwareId: 'Axios', softwareName: 'Axios', version: '1.6.8', lang: 'JavaScript', license: 'MIT' },
  { id: 5, name: 'react', softwareId: 'React', softwareName: 'React', version: '18.2.0', lang: 'JavaScript', license: 'MIT' },
  { id: 6, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '18.2.0', lang: 'JavaScript', license: 'MIT' },
  { id: 7, name: 'react', softwareId: 'React', softwareName: 'React', version: '18.1.0', lang: 'JavaScript', license: 'MIT' },
  { id: 8, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '18.1.0', lang: 'JavaScript', license: 'MIT' },
  { id: 9, name: 'react', softwareId: 'React', softwareName: 'React', version: '18.0.0', lang: 'JavaScript', license: 'MIT' },
  { id: 10, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '18.0.0', lang: 'JavaScript', license: 'MIT' },
  { id: 11, name: 'react', softwareId: 'React', softwareName: 'React', version: '17.0.2', lang: 'JavaScript', license: 'MIT' },
  { id: 12, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '17.0.2', lang: 'JavaScript', license: 'MIT' },
  { id: 13, name: 'react', softwareId: 'React', softwareName: 'React', version: '17.0.1', lang: 'JavaScript', license: 'MIT' },
  { id: 14, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '17.0.1', lang: 'JavaScript', license: 'MIT' },
  { id: 15, name: 'react', softwareId: 'React', softwareName: 'React', version: '16.14.0', lang: 'JavaScript', license: 'MIT' },
  { id: 16, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '16.14.0', lang: 'JavaScript', license: 'MIT' },
  { id: 17, name: 'react', softwareId: 'React', softwareName: 'React', version: '16.13.1', lang: 'JavaScript', license: 'MIT' },
  { id: 18, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '16.13.1', lang: 'JavaScript', license: 'MIT' },
  { id: 19, name: 'react', softwareId: 'React', softwareName: 'React', version: '16.8.6', lang: 'JavaScript', license: 'MIT' },
  { id: 20, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '16.8.6', lang: 'JavaScript', license: 'MIT' },
  { id: 21, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.22.0', lang: 'JavaScript', license: 'MIT' },
  { id: 22, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.21.0', lang: 'JavaScript', license: 'MIT' },
  { id: 23, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.20.0', lang: 'JavaScript', license: 'MIT' },
  { id: 24, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.19.0', lang: 'JavaScript', license: 'MIT' },
  { id: 25, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.18.0', lang: 'JavaScript', license: 'MIT' },
  { id: 26, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.17.0', lang: 'JavaScript', license: 'MIT' },
  { id: 27, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.16.0', lang: 'JavaScript', license: 'MIT' },
  { id: 28, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.15.0', lang: 'JavaScript', license: 'MIT' },
  { id: 29, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.14.0', lang: 'JavaScript', license: 'MIT' },
  { id: 30, name: 'react-router-dom', softwareId: 'React', softwareName: 'React', version: '6.13.0', lang: 'JavaScript', license: 'MIT' },
  { id: 31, name: 'react', softwareId: 'React', softwareName: 'React', version: '16.8.0', lang: 'JavaScript', license: 'MIT' },
  { id: 32, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '16.8.0', lang: 'JavaScript', license: 'MIT' },
  { id: 33, name: 'react', softwareId: 'React', softwareName: 'React', version: '16.8.4', lang: 'JavaScript', license: 'MIT' },
  { id: 34, name: 'react-dom', softwareId: 'React', softwareName: 'React', version: '16.8.4', lang: 'JavaScript', license: 'MIT' },
])

const softwareList = ref([
  { name: 'React', type: 'framework', lang: 'JavaScript' },
  { name: 'Vue', type: 'framework', lang: 'JavaScript' },
  { name: 'Lodash', type: 'library', lang: 'JavaScript' },
  { name: 'Axios', type: 'library', lang: 'JavaScript' },
  { name: 'Express', type: 'framework', lang: 'JavaScript' },
])

// 根据 componentList 聚合软件 -> 版本列表
const softwareVersionsMap = computed(() => {
  const map = {}
  componentList.value.forEach(comp => {
    if (!map[comp.softwareName]) {
      map[comp.softwareName] = new Set()
    }
    map[comp.softwareName].add(comp.version)
  })
  // 转换为排序后的数组
  Object.keys(map).forEach(k => {
    map[k] = Array.from(map[k]).sort()
  })
  return map
})

function getSoftwareVersions(swName) {
  return softwareVersionsMap.value[swName] || []
}

function isSoftwareSelected(name) {
  return formData.value.softwareId.includes(name)
}

function isVersionSelected(swName, ver) {
  return formData.value.selectedVersions[swName]?.includes(ver) || false
}

const isAllSelected = computed(() => {
  return softwareList.value.length > 0 &&
    softwareList.value.every(sw => formData.value.softwareId.includes(sw.name))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    // 取消全选
    formData.value.softwareId = []
    formData.value.selectedVersions = {}
  } else {
    // 全选所有软件 + 默认全选每个软件的版本
    formData.value.softwareId = softwareList.value.map(sw => sw.name)
    softwareList.value.forEach(sw => {
      formData.value.selectedVersions[sw.name] = [...getSoftwareVersions(sw.name)]
    })
  }
}

function toggleSoftware(name) {
  const arr = formData.value.softwareId
  const idx = arr.indexOf(name)
  if (idx === -1) {
    arr.push(name)
    // 新增软件时默认全选版本
    formData.value.selectedVersions[name] = [...getSoftwareVersions(name)]
  } else {
    arr.splice(idx, 1)
    delete formData.value.selectedVersions[name]
  }
}

function toggleVersion(swName, ver) {
  let arr = formData.value.selectedVersions[swName]
  if (!arr) {
    arr = []
    formData.value.selectedVersions[swName] = arr
  }
  const idx = arr.indexOf(ver)
  if (idx === -1) {
    arr.push(ver)
    // 选中版本时自动把软件加入 softwareId
    if (!formData.value.softwareId.includes(swName)) {
      formData.value.softwareId.push(swName)
    }
  } else {
    arr.splice(idx, 1)
  }
}

const canStartScan = computed(() => {
  if (scanMode.value === 'fetch-software') {
    // 拉取已有软件：需要选择软件，且至少选了一个软件的一个版本
    const hasSelectedVersion = Object.values(formData.value.selectedVersions).some(v => v && v.length > 0)
    return formData.value.softwareId.length > 0 && hasSelectedVersion
  } else if (scanMode.value === 'fetch-component') {
    // 拉取已有组件：只需要选择组件（文件已在创建时上传）
    return formData.value.componentId !== ''
  }
  return false
})

watch(pageSize, () => { page.value = 1 })

function closeModal() {
  showScanModal.value = false
  formData.value.softwareId = []
  formData.value.selectedVersions = {}
  formData.value.componentId = ''
}

function startScan() {
  let name = ''
  let version = '待检测'

  if (scanMode.value === 'fetch-software') {
    // 扫描已有软件的多个版本
    const versions = []
    formData.value.softwareId.forEach(swName => {
      (formData.value.selectedVersions[swName] || []).forEach(ver => {
        versions.push({ name: swName, version: ver })
      })
    })
    versions.forEach(({ name, version }) => {
      scanList.value.unshift({ name, version, status: 'scanning', progress: 0, scanTime: new Date().toLocaleString('zh-CN') })
    })
    showToast(`扫描任务已开始，共 ${versions.length} 个`)
  } else if (scanMode.value === 'fetch-component') {
    // 扫描已有组件
    const comp = componentList.value.find(c => c.id === formData.value.componentId)
    scanList.value.unshift({ name: comp.name, version: comp.version, status: 'scanning', progress: 0, scanTime: new Date().toLocaleString('zh-CN') })
    showToast('扫描任务已开始')
  }

  closeModal()
  page.value = 1
}

// 表格行内重新扫描
function handleScan(row) {
  const idx = scanList.value.findIndex(r => r === row)
  if (idx !== -1) {
    scanList.value[idx].status = 'scanning'
    scanList.value[idx].progress = 0
    scanList.value[idx].scanTime = new Date().toLocaleString('zh-CN')
    showToast('扫描任务已开始')
  }
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

.manage-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
}

.manage-tab {
  position: relative;
  padding: 10px 20px 12px;
  margin-bottom: -1px;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
}

.manage-tab::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 16px;
  background: #e5e7eb;
}

.manage-tabs .manage-tab:last-child::after {
  display: none;
}

.manage-tab.is-active {
  color: #da203e;
}

.manage-tab.is-active::after {
  display: none;
}

.manage-tab.is-active::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #da203e;
}

.manage-tab:hover:not(.is-active) {
  color: #374151;
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

/* 扫描状态进度条 */
.scan-status-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scan-status-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.scan-status-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.scan-status-progress .progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
}

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

/* 软件卡片列表 */
.software-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.software-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.15s;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.software-card:hover {
  border-color: #da203e;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.08);
}
.software-card.is-selected {
  border-color: #da203e;
  background: #fff8f8;
}

.software-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  user-select: none;
}

.software-card-left {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #fff;
  flex-shrink: 0;
  transition: all 0.12s;
}
.software-card.is-selected .software-card-check {
  background: #da203e;
  border-color: #da203e;
}

.software-card-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.software-card-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  flex-shrink: 0;
}
.software-card.is-selected .software-card-name { color: #da203e; }

.software-card-lang {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.software-card-expand {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.expand-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}
.software-card.is-expanded .expand-arrow { transform: rotate(180deg); }

.software-card-expand {
  display: none;
}

.expand-arrow {
  display: none;
}
.software-card.is-expanded .expand-arrow { transform: rotate(180deg); }

.version-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 14px 12px;
  max-height: 120px;
  overflow-y: auto;
}

.version-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  transition: all 0.12s;
}
.version-tag:hover {
  border-color: #da203e;
  color: #da203e;
}
.version-tag.is-selected {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.version-tag input[type="checkbox"] {
  width: 13px;
  height: 13px;
  accent-color: currentColor;
  cursor: pointer;
  margin: 0;
}

.version-empty {
  font-size: 13px;
  color: #9ca3af;
  padding: 4px 0;
}

.software-empty {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

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

/* ===== Toast ===== */
.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #111827;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: toastIn 0.25s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: #34d399;
  flex-shrink: 0;
}

/* ===== 操作列按钮 ===== */
.scan-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scan-btn--start {
  background: linear-gradient(135deg, #da203e, #c41835);
  color: #fff;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.3);
}

.scan-btn--start:hover {
  background: linear-gradient(135deg, #c41835, #a8102c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(218, 32, 62, 0.4);
}

.scan-btn--rescan {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.scan-btn--rescan:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.scan-btn--scanning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 1px solid #f59e0b;
  cursor: default;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.scan-btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.scan-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #f59e0b;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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