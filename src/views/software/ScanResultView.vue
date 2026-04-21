<template>
  <div class="result-page">
    <div class="result-header">
      <div class="result-header-left">
        <button type="button" class="result-back-btn" @click="goBack">
          ← 返回
        </button>
        <div class="result-title-wrap">
          <h1 class="result-title">{{ softwareName }} v{{ version }}</h1>
          <span class="result-subtitle">扫描结果详情</span>
        </div>
      </div>
      <div class="result-meta">
        <span class="meta-item">
          <span class="meta-label">扫描时间：</span>
          <span class="meta-value">{{ scanTime }}</span>
        </span>
        <span class="meta-item" :class="'status-' + status">
          <span class="meta-label">状态：</span>
          <span class="meta-value">{{ statusText }}</span>
        </span>
      </div>
    </div>

    <div class="result-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="result-tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count" :class="{ danger: tab.danger }">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <div class="result-content">
      <!-- 基本信息 -->
          <div v-show="activeTab === 'basic'" class="content-section">
            <!-- 无扫描结果的提示 -->
            <div v-if="!hasScanResult" class="scan-tip">
              <div class="scan-tip-icon">ℹ️</div>
              <div class="scan-tip-content">
                <div class="scan-tip-title">暂无扫描结果</div>
                <div class="scan-tip-desc">以下展示该软件的版本信息和参考信息</div>
              </div>
            </div>

            <div class="basic-info">
              <!-- 版本信息 -->
              <div class="info-section">
                <h3 class="info-section-title">版本信息</h3>
                <div class="info-row">
                  <span class="info-label">名称</span>
                  <span class="info-value">{{ softwareName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">发布日期</span>
                  <span class="info-value">{{ releaseDate || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">版本</span>
                  <span class="info-value">{{ version }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">描述</span>
                  <span class="info-value info-value--desc">{{ description || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">主语言</span>
                  <span class="info-value">{{ language }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">开发商</span>
                  <span class="info-value">{{ vendor || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">开源许可证</span>
                  <span class="info-value">
                    <span v-if="license" class="license-tag">{{ license }}</span>
                    <span v-else>-</span>
                  </span>
                </div>
              </div>

              <!-- 参考信息 -->
              <div class="info-section">
                <h3 class="info-section-title">参考信息</h3>
                <div class="info-row">
                  <span class="info-label">官网地址</span>
                  <span class="info-value">
                    <a v-if="homepage" :href="homepage" target="_blank" class="info-link">{{ homepage }}</a>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">代码量（KL）</span>
                  <span class="info-value">{{ codeSize || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">分支</span>
                  <span class="info-value">{{ branch || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">开源社区源码托管地址</span>
                  <span class="info-value">
                    <a v-if="repoUrl" :href="repoUrl" target="_blank" class="info-link">{{ repoUrl }}</a>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">社区Tag</span>
                  <span class="info-value">
                    <span v-if="tags && tags.length" class="info-tags">
                      <span v-for="tag in tags" :key="tag" class="info-tag">{{ tag }}</span>
                    </span>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">官网漏洞披露地址</span>
                  <span class="info-value">
                    <a v-if="vulnDisclosure" :href="vulnDisclosure" target="_blank" class="info-link">{{ vulnDisclosure }}</a>
                    <span v-else>-</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Commit ID</span>
                  <span class="info-value commit-id">{{ commitId || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">下线日期</span>
                  <span class="info-value">{{ eolDate || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- 扫描结果详情（仅在有扫描结果时显示） -->
            <div v-if="hasScanResult" class="scan-details">
              <div class="info-section">
                <h3 class="info-section-title">扫描结果</h3>
                <div class="info-row">
                  <span class="info-label">扫描时间</span>
                  <span class="info-value">{{ scanTime }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">扫描状态</span>
                  <span class="info-value status-tag" :class="'status-' + status">{{ statusText }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">扫描耗时</span>
                  <span class="info-value">{{ scanDuration }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">组件总数</span>
                  <span class="info-value">{{ sbomList.length }}</span>
                </div>
              </div>
            </div>
          </div>

      <!-- SBOM信息 -->
      <div v-show="activeTab === 'sbom'" class="content-section">
        <table v-if="sbomList.length" class="result-table">
          <thead>
            <tr>
              <th>组件名称</th>
              <th>版本</th>
              <th>GroupId</th>
              <th>类型</th>
              <th>许可证</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sbomList" :key="item.name + item.version">
              <td class="comp-name">{{ item.name }}</td>
              <td>{{ item.version }}</td>
              <td>{{ item.groupId || '-' }}</td>
              <td>
                <span class="type-tag">{{ item.type }}</span>
              </td>
              <td>
                <span class="license-tag">{{ item.license }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <p>暂无 SBOM 数据</p>
        </div>
      </div>

      <!-- 许可证信息 -->
      <div v-show="activeTab === 'license'" class="content-section">
        <table v-if="licenseList.length" class="result-table">
          <thead>
            <tr>
              <th>许可证</th>
              <th>组件数</th>
              <th>是否高风险</th>
              <th>风险等级</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in licenseList" :key="item.name">
              <td>
                <span class="license-tag license-tag--full">{{ item.name }}</span>
              </td>
              <td>{{ item.count }}</td>
              <td>
                <span v-if="item.highRisk" class="risk-badge risk-badge--high">是</span>
                <span v-else class="risk-badge risk-badge--low">否</span>
              </td>
              <td>
                <span class="risk-level" :class="'risk-level--' + item.riskLevel">
                  {{ item.riskLevel === 'high' ? '高风险' : item.riskLevel === 'medium' ? '中风险' : '低风险' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <p>暂无许可证数据</p>
        </div>
      </div>

      <!-- 漏洞信息 -->
      <div v-show="activeTab === 'vuln'" class="content-section">
        <table v-if="vulnList.length" class="result-table">
          <thead>
            <tr>
              <th>CVE编号</th>
              <th>漏洞名称</th>
              <th>严重程度</th>
              <th>CVSS评分</th>
              <th>影响组件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in vulnList" :key="item.cveId">
              <td>
                <span class="cve-id">{{ item.cveId }}</span>
              </td>
              <td>{{ item.name }}</td>
              <td>
                <span class="severity-badge" :class="'severity-badge--' + item.severity">
                  {{ item.severity }}
                </span>
              </td>
              <td>
                <span class="cvss-score" :class="'cvss-score--' + item.cvssLevel">
                  {{ item.cvss }}
                </span>
              </td>
              <td class="comp-name">{{ item.component }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <p>🎉 暂无漏洞数据，该版本安全状态良好</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 基本信息
const softwareName = ref('')
const version = ref('')
const language = ref('')
const scanTime = ref('')
const status = ref('pending')
const scanDuration = ref('')

// 版本信息
const releaseDate = ref('')
const description = ref('')
const vendor = ref('')
const license = ref('')

// 参考信息
const homepage = ref('')
const codeSize = ref('')
const branch = ref('')
const repoUrl = ref('')
const tags = ref([])
const vulnDisclosure = ref('')
const commitId = ref('')
const eolDate = ref('')

// 是否有扫描结果
const hasScanResult = computed(() => {
  return status.value === 'completed' || status.value === 'scanning'
})

// Tab数据
const activeTab = ref('basic')

// SBOM数据
const sbomList = ref([])

// 许可证数据
const licenseList = ref([])

// 漏洞数据
const vulnList = ref([])

const statusText = computed(() => {
  const map = { pending: '待扫描', scanning: '扫描中', completed: '已完成', failed: '失败' }
  return map[status.value] || status.value
})

const tabs = computed(() => [
  { key: 'basic', label: '基本信息' },
  { key: 'sbom', label: 'SBOM信息', count: sbomList.value.length },
  { key: 'license', label: '许可证信息', count: licenseList.value.length, danger: licenseList.value.some(l => l.highRisk) },
  { key: 'vuln', label: '漏洞信息', count: vulnList.value.length, danger: vulnList.value.length > 0 },
])

onMounted(() => {
  // 从路由参数获取软件名和版本
  softwareName.value = route.query.name || route.params.name || '未知软件'
  version.value = route.query.version || route.params.version || '1.0.0'
  language.value = route.query.language || 'Java'
  
  // 版本信息
  releaseDate.value = route.query.releaseDate || '2024-01-15'
  description.value = route.query.description || '一个功能强大的开源软件框架，提供全面的基础设施支持。'
  vendor.value = route.query.vendor || 'Apache Software Foundation'
  license.value = route.query.license || 'Apache-2.0'
  
  // 参考信息
  homepage.value = route.query.homepage || 'https://example.com/software'
  codeSize.value = route.query.codeSize || '125'
  branch.value = route.query.branch || 'main'
  repoUrl.value = route.query.repoUrl || 'https://github.com/example/software'
  tags.value = route.query.tags ? route.query.tags.split(',') : ['开源', '跨平台', '高性能']
  vulnDisclosure.value = route.query.vulnDisclosure || 'https://example.com/security'
  commitId.value = route.query.commitId || 'a1b2c3d4e5f6'
  eolDate.value = route.query.eolDate || ''
  
  // 生成模拟数据
  scanTime.value = new Date().toLocaleString('zh-CN')
  scanDuration.value = '2分34秒'
  
  sbomList.value = [
    { name: 'spring-core', version: '5.3.20', groupId: 'org.springframework', type: 'Maven', license: 'Apache-2.0' },
    { name: 'spring-beans', version: '5.3.20', groupId: 'org.springframework', type: 'Maven', license: 'Apache-2.0' },
    { name: 'spring-context', version: '5.3.20', groupId: 'org.springframework', type: 'Maven', license: 'Apache-2.0' },
    { name: 'log4j-api', version: '2.17.1', groupId: 'org.apache.logging.log4j', type: 'Maven', license: 'Apache-2.0' },
    { name: 'commons-lang3', version: '3.12.0', groupId: 'org.apache.commons', type: 'Maven', license: 'Apache-2.0' },
  ]
  
  licenseList.value = [
    { name: 'Apache-2.0', count: 20, highRisk: false, riskLevel: 'low' },
    { name: 'MIT', count: 15, highRisk: false, riskLevel: 'low' },
    { name: 'GPL-3.0', count: 3, highRisk: true, riskLevel: 'high' },
    { name: 'LGPL-2.1', count: 2, highRisk: false, riskLevel: 'medium' },
  ]
  
  vulnList.value = [
    { cveId: 'CVE-2021-44228', name: 'Log4j远程代码执行漏洞', severity: 'Critical', cvss: 10.0, cvssLevel: 'high', component: 'log4j-api@2.17.1' },
    { cveId: 'CVE-2022-22965', name: 'Spring Framework远程代码执行', severity: 'Critical', cvss: 9.8, cvssLevel: 'high', component: 'spring-beans@5.3.20' },
    { cveId: 'CVE-2023-12345', name: '敏感信息泄露漏洞', severity: 'Medium', cvss: 5.3, cvssLevel: 'medium', component: 'commons-lang3@3.12.0' },
  ]
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'software-scan' })
  }
}
</script>

<style scoped>
.result-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.result-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.result-back-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.result-back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.result-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.result-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.result-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  font-size: 13px;
}

.meta-label {
  color: #6b7280;
}

.meta-value {
  color: #111827;
  font-weight: 500;
}

.meta-item.status-completed .meta-value { color: #059669; }
.meta-item.status-failed .meta-value { color: #dc2626; }
.meta-item.status-scanning .meta-value { color: #0369a1; }

.result-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
}

.result-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  font-size: 14px;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: -2px;
}

.result-tab:hover {
  color: #111827;
}

.result-tab.is-active {
  color: #da203e;
  border-bottom-color: #da203e;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 10px;
  color: #374151;
}

.tab-count.danger {
  background: #fee2e2;
  color: #dc2626;
}

.result-content {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.content-section {
  min-height: 400px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.info-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #3b82f6;
}

.info-row {
  display: flex;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  align-items: flex-start;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 120px;
  color: #6b7280;
  font-size: 14px;
  flex-shrink: 0;
}

.info-value {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}

.info-value--desc {
  max-width: 600px;
  line-height: 1.6;
  color: #6b7280;
  font-weight: 400;
}

.info-link {
  color: #3b82f6;
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.commit-id {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 4px;
}

.scan-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
}

.scan-tip-icon {
  font-size: 20px;
}

.scan-tip-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e40af;
}

.scan-tip-desc {
  font-size: 13px;
  color: #3b82f6;
}

.scan-details {
  margin-top: 8px;
}

.status-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.status-tag.status-completed {
  background: #d1fae5;
  color: #059669;
}

.status-tag.status-failed {
  background: #fee2e2;
  color: #dc2626;
}

.status-tag.status-scanning {
  background: #dbeafe;
  color: #0369a1;
}

.status-tag.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.result-table th {
  text-align: left;
  padding: 12px 16px;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
}

.result-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.result-table tr:last-child td {
  border-bottom: none;
}

.result-table tr:hover td {
  background: #fafafa;
}

.comp-name {
  font-weight: 500;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 4px;
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
  padding: 4px 12px;
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
  padding: 4px 8px;
  border-radius: 4px;
}

.severity-badge {
  display: inline-block;
  padding: 4px 10px;
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
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.cvss-score--high { background: #fee2e2; color: #dc2626; }
.cvss-score--medium { background: #fef3c7; color: #d97706; }
.cvss-score--low { background: #d1fae5; color: #059669; }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #9ca3af;
  font-size: 15px;
}
</style>