<template>
  <div class="manage-page">
    <div class="manage-toolbar">
      <div class="manage-tabs" role="tablist" aria-label="列表类型">
        <button
          type="button"
          role="tab"
          class="manage-tab"
          :class="{ 'is-active': tab === 'software' }"
          :aria-selected="tab === 'software'"
          @click="setTab('software')"
        >
          软件
        </button>
        <button
          type="button"
          role="tab"
          class="manage-tab"
          :class="{ 'is-active': tab === 'component' }"
          :aria-selected="tab === 'component'"
          @click="setTab('component')"
        >
          组件
        </button>
      </div>
      <button type="button" class="manage-add-btn" @click="onAddClick">
        {{ tab === 'software' ? '+ 新增软件' : '+ 新增组件' }}
      </button>
    </div>

    <section class="manage-card" aria-labelledby="manage-card-title">
      <h2 id="manage-card-title" class="manage-card-title">
        {{ tab === 'software' ? '软件列表' : '组件列表' }}
      </h2>

      <div class="manage-table-wrap">
        <table class="manage-table">
          <thead>
            <tr>
              <template v-if="tab === 'software'">
                <th>软件名称</th>
                <th>编程语言</th>
                <th>开源许可证</th>
                <th>版本数量</th>
                <th>更新时间</th>
                <th class="manage-th-op">操作</th>
              </template>
              <template v-else>
                <th>所属软件</th>
                <th>组件名称</th>
                <th>版本</th>
                <th>groupId</th>
                <th>编程语言</th>
                <th>开源许可证</th>
                <th class="manage-th-op">操作</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <!-- 软件列表 -->
            <template v-if="tab === 'software'">
              <tr v-if="softwareRows.length === 0" class="manage-empty-row">
                <td colspan="6">
                  <div class="manage-empty">
                    <div class="manage-empty-art" aria-hidden="true">
                      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z" />
                        <path fill="#fff" stroke="#e5e7eb" d="M32 36h20v8H32zM48 48h24v6H48zM32 58h40v6H32z" />
                        <circle cx="88" cy="40" r="4" fill="#fee2e2" stroke="#fecaca" />
                      </svg>
                    </div>
                    <p class="manage-empty-text">暂无软件数据</p>
                  </div>
                </td>
              </tr>
              <tr v-for="row in softwareRows" :key="row.name">
                <td>
                  <button type="button" class="manage-link" @click="goToVersions(row)">
                    {{ row.name }}
                  </button>
                </td>
                <td>{{ row.lang }}</td>
                <td>{{ row.license }}</td>
                <td>{{ row.versionCount }}</td>
                <td>{{ row.updatedAt }}</td>
                <td class="manage-td-op">
                  <button type="button" class="manage-linkish">编辑</button>
                  <span class="manage-op-sep">|</span>
                  <button type="button" class="manage-linkish danger">删除</button>
                </td>
              </tr>
            </template>

            <!-- 组件列表 -->
            <template v-else>
              <tr v-if="componentRows.length === 0" class="manage-empty-row">
                <td colspan="7">
                  <div class="manage-empty">
                    <div class="manage-empty-art" aria-hidden="true">
                      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z" />
                        <path fill="#fff" stroke="#e5e7eb" d="M32 36h20v8H32zM48 48h24v6H48zM32 58h40v6H32z" />
                        <circle cx="88" cy="40" r="4" fill="#fee2e2" stroke="#fecaca" />
                      </svg>
                    </div>
                    <p class="manage-empty-text">暂无组件数据</p>
                  </div>
                </td>
              </tr>
              <tr v-for="row in componentRows" :key="row.id">
                <td>{{ row.software }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.version }}</td>
                <td>{{ row.groupId }}</td>
                <td>{{ row.lang }}</td>
                <td>{{ row.license }}</td>
                <td class="manage-td-op">
                  <button type="button" class="manage-linkish">编辑</button>
                  <span class="manage-op-sep">|</span>
                  <button type="button" class="manage-linkish danger">删除</button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer class="manage-footer">
        <span class="manage-total">共计 {{ tab === 'software' ? softwareRows.length : componentRows.length }} 条</span>
        <div class="manage-pager">
          <button
            type="button"
            class="manage-page-btn"
            :disabled="page <= 1"
            aria-label="上一页"
            @click="page = Math.max(1, page - 1)"
          >
            ‹
          </button>
          <span class="manage-page-current">{{ page }}</span>
          <button
            type="button"
            class="manage-page-btn"
            :disabled="page >= totalPages"
            aria-label="下一页"
            @click="page = Math.min(totalPages, page + 1)"
          >
            ›
          </button>
          <label class="manage-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="manage-page-select">
              <option :value="10">10 / 页</option>
              <option :value="20">20 / 页</option>
              <option :value="50">50 / 页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tab = ref(route.query.tab === 'component' ? 'component' : 'software')
const page = ref(1)
const pageSize = ref(10)

// 软件数据
const softwareRows = [
  { id: 1, name: 'Vue.js', lang: 'JavaScript', license: 'MIT', versionCount: 5, updatedAt: '2024-03-20' },
  { id: 2, name: 'React', lang: 'JavaScript', license: 'MIT', versionCount: 3, updatedAt: '2024-03-19' },
  { id: 3, name: 'TensorFlow', lang: 'Python', license: 'Apache-2.0', versionCount: 8, updatedAt: '2024-03-18' },
  { id: 4, name: 'Spring Boot', lang: 'Java', license: 'Apache-2.0', versionCount: 12, updatedAt: '2024-03-17' },
  { id: 5, name: 'Django', lang: 'Python', license: 'BSD', versionCount: 4, updatedAt: '2024-03-16' },
  { id: 6, name: 'FastAPI', lang: 'Python', license: 'MIT', versionCount: 2, updatedAt: '2024-03-15' },
  { id: 7, name: 'Express', lang: 'JavaScript', license: 'MIT', versionCount: 6, updatedAt: '2024-03-14' },
  { id: 8, name: 'Angular', lang: 'TypeScript', license: 'MIT', versionCount: 7, updatedAt: '2024-03-13' },
  { id: 9, name: 'Flask', lang: 'Python', license: 'BSD', versionCount: 3, updatedAt: '2024-03-12' },
  { id: 10, name: 'NestJS', lang: 'TypeScript', license: 'MIT', versionCount: 4, updatedAt: '2024-03-11' },
  { id: 11, name: 'PyTorch', lang: 'Python', license: 'BSD', versionCount: 9, updatedAt: '2024-03-10' },
  { id: 12, name: 'Next.js', lang: 'JavaScript', license: 'MIT', versionCount: 5, updatedAt: '2024-03-09' },
]

// 组件数据
const componentRows = [
  { id: 1, software: 'Vue.js', name: 'vue', version: '3.4.21', groupId: 'org.vuejs', lang: 'JavaScript', license: 'MIT' },
  { id: 2, software: 'Vue.js', name: 'vue-router', version: '4.3.0', groupId: 'org.vuejs.router', lang: 'JavaScript', license: 'MIT' },
  { id: 3, software: 'Vue.js', name: 'vuex', version: '4.1.0', groupId: 'org.vuejs.vuex', lang: 'JavaScript', license: 'MIT' },
  { id: 4, software: 'React', name: 'react', version: '18.2.0', groupId: 'org.facebook.react', lang: 'JavaScript', license: 'MIT' },
  { id: 5, software: 'React', name: 'react-dom', version: '18.2.0', groupId: 'org.facebook.react-dom', lang: 'JavaScript', license: 'MIT' },
  { id: 6, software: 'React', name: 'react-native', version: '0.73.6', groupId: 'org.facebook.react-native', lang: 'JavaScript', license: 'MIT' },
  { id: 7, software: 'Spring Boot', name: 'spring-boot-starter-web', version: '3.2.3', groupId: 'org.springframework.boot', lang: 'Java', license: 'Apache-2.0' },
  { id: 8, software: 'Spring Boot', name: 'spring-boot-starter-data-jpa', version: '3.2.3', groupId: 'org.springframework.boot', lang: 'Java', license: 'Apache-2.0' },
  { id: 9, software: 'Angular', name: '@angular/core', version: '17.3.4', groupId: 'org.angular.core', lang: 'TypeScript', license: 'MIT' },
  { id: 10, software: 'Angular', name: '@angular/router', version: '17.3.4', groupId: 'org.angular.router', lang: 'TypeScript', license: 'MIT' },
  { id: 11, software: 'NestJS', name: '@nestjs/core', version: '10.3.8', groupId: 'org.nestjs.core', lang: 'TypeScript', license: 'MIT' },
  { id: 12, software: 'NestJS', name: '@nestjs/common', version: '10.3.8', groupId: 'org.nestjs.common', lang: 'TypeScript', license: 'MIT' },
]

const total = computed(() => tab.value === 'software' ? softwareRows.length : componentRows.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value) || 1))

watch(pageSize, () => {
  page.value = 1
})

function setTab(next) {
  tab.value = next
  page.value = 1
  router.replace({
    name: 'software-manage',
    query: { ...route.query, tab: next === 'component' ? 'component' : undefined },
  })
}

watch(
  () => route.query.tab,
  (t) => {
    tab.value = t === 'component' ? 'component' : 'software'
  },
)

function onAddClick() {
  // 占位：接入创建流程后打开抽屉或跳转
}

// 点击软件名称进入版本列表
function goToVersions(software) {
  router.push({
    name: 'software-version',
    params: { softwareId: software.id },
    query: { name: software.name },
  })
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
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
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

.manage-add-btn {
  height: 36px;
  padding: 0 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.manage-add-btn:hover {
  border-color: #da203e;
  color: #da203e;
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

.manage-table-wrap {
  overflow-x: auto;
}

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

.manage-table tbody tr:hover {
  background: #f9fafb;
}

.manage-th-op,
.manage-td-op {
  text-align: right;
  white-space: nowrap;
}

.manage-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 14px;
  color: #da203e;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.manage-link:hover {
  text-decoration: underline;
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

.manage-linkish:hover {
  text-decoration: underline;
}

.manage-linkish.danger {
  color: #dc2626;
}

.manage-op-sep {
  margin: 0 6px;
  color: #d1d5db;
  font-size: 12px;
  user-select: none;
}

.manage-empty-row td {
  padding: 60px 16px;
}

.manage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.manage-empty-art {
  width: 120px;
  height: 100px;
  opacity: 0.95;
}

.manage-empty-art svg {
  width: 100%;
  height: 100%;
}

.manage-empty-text {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

.manage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 4px;
}

.manage-total {
  font-size: 13px;
  color: #6b7280;
}

.manage-pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

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

.manage-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

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

.manage-page-size {
  margin-left: 4px;
}

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