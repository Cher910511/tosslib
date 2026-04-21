<template>
  <div class="version-page">
    <div class="version-header">
      <div class="version-header-left">
        <button type="button" class="version-back-btn" @click="goBack">
          ← 返回列表
        </button>
        <div class="version-title-wrap">
          <h1 class="version-title">{{ softwareName }}</h1>
          <span class="version-count">共 {{ versionList.length }} 个版本</span>
        </div>
      </div>
      <button type="button" class="version-scan-btn" @click="goToScan">
        📋 查看扫描记录
      </button>
    </div>

    <section class="version-card">
      <div class="version-table-wrap">
        <table class="version-table">
          <thead>
            <tr>
              <th>版本号</th>
              <th>发布时间</th>
              <th>漏洞数</th>
              <th>许可证</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="versionList.length === 0" class="version-empty-row">
              <td colspan="5">
                <div class="version-empty">
                  <p>暂无版本数据</p>
                </div>
              </td>
            </tr>
            <tr v-for="row in versionList" :key="row.version">
              <td>
                <span class="version-num version-link" @click="goToScanResult(row)">
                  {{ row.version }}
                </span>
              </td>
              <td>{{ row.releaseDate }}</td>
              <td>
                <span class="vuln-count" :class="getVulnClass(row.vulnCount)">
                  {{ row.vulnCount }} 个漏洞
                </span>
              </td>
              <td>
                <span class="license-tag">{{ row.license }}</span>
              </td>
              <td>
                <button type="button" class="version-action-btn" @click="goToScanResult(row)">
                  查看扫描结果
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const softwareName = ref('')
const softwareId = ref('')
const versionList = ref([])

// 演示数据
const mockVersionData = {
  'werkzeug': [
    { version: '3.0.0', releaseDate: '2024-01-01', vulnCount: 2, license: 'BSD-3-Clause' },
    { version: '2.3.7', releaseDate: '2023-08-14', vulnCount: 3, license: 'BSD-3-Clause' },
    { version: '2.3.6', releaseDate: '2023-07-01', vulnCount: 4, license: 'BSD-3-Clause' },
    { version: '2.3.5', releaseDate: '2023-05-15', vulnCount: 5, license: 'BSD-3-Clause' },
  ],
  'vue': [
    { version: '3.4.21', releaseDate: '2024-02-15', vulnCount: 1, license: 'MIT' },
    { version: '3.4.0', releaseDate: '2024-01-10', vulnCount: 2, license: 'MIT' },
    { version: '3.3.0', releaseDate: '2023-12-01', vulnCount: 0, license: 'MIT' },
  ],
  'react': [
    { version: '18.2.0', releaseDate: '2024-01-15', vulnCount: 0, license: 'MIT' },
    { version: '18.1.0', releaseDate: '2024-01-01', vulnCount: 1, license: 'MIT' },
  ],
}

onMounted(() => {
  softwareName.value = route.query.name || '未知软件'
  softwareId.value = route.params.softwareId || ''
  
  // 根据软件名获取版本列表
  const key = softwareName.value.toLowerCase()
  versionList.value = mockVersionData[key] || [
    { version: '1.0.0', releaseDate: '2023-06-01', vulnCount: 0, license: 'MIT' },
    { version: '0.9.0', releaseDate: '2023-03-01', vulnCount: 1, license: 'MIT' },
  ]
})

function goBack() {
  router.push({ name: 'software-manage' })
}

function goToScanResult(row) {
  router.push({
    name: 'scan-result',
    query: {
      name: softwareName.value,
      version: row.version,
      groupId: softwareId.value
    }
  })
}

function goToScan() {
  router.push({
    name: 'software-scan',
    query: { softwareName: softwareName.value }
  })
}

function getVulnClass(count) {
  if (count === 0) return 'vuln-none'
  if (count <= 2) return 'vuln-low'
  if (count <= 4) return 'vuln-mid'
  return 'vuln-high'
}
</script>

<style scoped>
.version-page {
  padding: 24px;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.version-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.version-back-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.version-back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.version-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.version-count {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 12px;
}

.version-scan-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #da203e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.version-scan-btn:hover {
  background: #c41a35;
}

.version-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.version-table-wrap {
  overflow-x: auto;
}

.version-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.version-table th {
  text-align: left;
  padding: 14px 16px;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
}

.version-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.version-table tr:last-child td {
  border-bottom: none;
}

.version-table tr:hover td {
  background: #fafafa;
}

.version-num {
  font-weight: 600;
  color: #111827;
}

.version-link {
  color: #da203e;
  cursor: pointer;
  transition: opacity 0.15s;
}

.version-link:hover {
  opacity: 0.7;
}

.vuln-count {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.vuln-count.vuln-none {
  background: #d1fae5;
  color: #059669;
}

.vuln-count.vuln-low {
  background: #fef3c7;
  color: #d97706;
}

.vuln-count.vuln-mid {
  background: #fed7aa;
  color: #ea580c;
}

.vuln-count.vuln-high {
  background: #fee2e2;
  color: #dc2626;
}

.license-tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
}

.version-action-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: #da203e;
  background: #fff;
  border: 1px solid #fecdd3;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.version-action-btn:hover {
  background: #fef2f2;
}

.version-empty-row td {
  padding: 60px 16px;
  text-align: center;
}

.version-empty {
  color: #9ca3af;
  font-size: 14px;
}
</style>