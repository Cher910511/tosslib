<template>
  <div class="approval-page">
    <div class="approval-toolbar">
      <div class="approval-tabs" role="tablist" aria-label="审核状态">
        <button
          type="button"
          role="tab"
          class="approval-tab"
          :class="{ 'is-active': filter === 'pending' }"
          :aria-selected="filter === 'pending'"
          @click="filter = 'pending'"
        >
          待审核
          <span class="approval-badge">{{ pendingCount }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="approval-tab"
          :class="{ 'is-active': filter === 'approved' }"
          :aria-selected="filter === 'approved'"
          @click="filter = 'approved'"
        >
          已上架
        </button>
        <button
          type="button"
          role="tab"
          class="approval-tab"
          :class="{ 'is-active': filter === 'rejected' }"
          :aria-selected="filter === 'rejected'"
          @click="filter = 'rejected'"
        >
          已下架
        </button>
      </div>
    </div>

    <section class="approval-card" aria-labelledby="approval-card-title">
      <h2 id="approval-card-title" class="approval-card-title">
        {{ filter === 'pending' ? '待审核软件' : filter === 'approved' ? '已上架软件' : '已下架软件' }}
      </h2>

      <div class="approval-table-wrap">
        <table class="approval-table">
          <thead>
            <tr>
              <th>软件名称</th>
              <th>版本</th>
              <th>提交人</th>
              <th>编程语言</th>
              <th>开源许可证</th>
              <th>提交时间</th>
              <th>{{ filter === 'pending' ? '申请类型' : '操作人' }}</th>
              <th class="approval-th-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredList.length === 0" class="approval-empty-row">
              <td colspan="8">
                <div class="approval-empty">
                  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="10" y="8" width="60" height="40" rx="4" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" />
                    <path d="M24 18h32M24 26h24M24 34h28" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" />
                    <circle cx="60" cy="44" r="3" fill="#dbeafe" stroke="#93c5fd" />
                  </svg>
                  <p class="approval-empty-text">
                    {{ filter === 'pending' ? '暂无待审核的软件申请' : filter === 'approved' ? '暂无已上架软件' : '暂无已下架软件' }}
                  </p>
                </div>
              </td>
            </tr>
            <tr v-for="item in filteredList" :key="item.id">
              <td>
                <button type="button" class="approval-link" @click="viewDetail(item)">
                  {{ item.name }}
                </button>
              </td>
              <td>{{ item.version }}</td>
              <td>{{ item.submitter }}</td>
              <td>{{ item.lang }}</td>
              <td>{{ item.license }}</td>
              <td>{{ item.submittedAt }}</td>
              <td>
                <span v-if="filter === 'pending'" class="approval-type-badge" :class="item.type === '上架' ? 'type-on' : 'type-off'">
                  {{ item.type }}
                </span>
                <span v-else>{{ item.operator || '—' }}</span>
              </td>
              <td class="approval-td-op">
                <template v-if="filter === 'pending'">
                  <button type="button" class="approval-btn approval-btn--approve" @click="approve(item)">
                    通过
                  </button>
                  <button type="button" class="approval-btn approval-btn--reject" @click="openRejectDialog(item)">
                    驳回
                  </button>
                </template>
                <template v-else-if="filter === 'approved'">
                  <button type="button" class="approval-btn approval-btn--reject" @click="openOffShelfDialog(item)">
                    下架
                  </button>
                </template>
                <template v-else>
                  <button type="button" class="approval-btn approval-btn--approve" @click="approve(item)">
                    重新上架
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 驳回（拒绝上架）对话框 -->
    <div v-if="showRejectModal" class="approval-overlay" @click.self="showRejectModal = false">
      <div class="approval-modal" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
        <h3 id="reject-modal-title" class="approval-modal-title">驳回申请</h3>
        <p class="approval-modal-desc">确定驳回 <strong>{{ rejectTarget?.name }}</strong> 的{{ rejectTarget?.type === '上架' ? '上架' : '下架' }}申请？请填写驳回原因：</p>
        <textarea
          v-model="rejectReason"
          class="approval-textarea"
          rows="4"
          placeholder="请输入驳回原因（选填）"
        ></textarea>
        <div class="approval-modal-actions">
          <button type="button" class="approval-btn approval-btn--cancel" @click="showRejectModal = false">取消</button>
          <button type="button" class="approval-btn approval-btn--reject" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>

    <!-- 下架确认对话框 -->
    <div v-if="showOffShelfModal" class="approval-overlay" @click.self="showOffShelfModal = false">
      <div class="approval-modal" role="dialog" aria-modal="true" aria-labelledby="offshelf-modal-title">
        <h3 id="offshelf-modal-title" class="approval-modal-title">确认下架</h3>
        <p class="approval-modal-desc">确定将 <strong>{{ offShelfTarget?.name }}</strong> 下架？下架后该软件将从软件库中移除，用户无法检索和查看。</p>
        <textarea
          v-model="offShelfReason"
          class="approval-textarea"
          rows="4"
          placeholder="请输入下架原因（选填）"
        ></textarea>
        <div class="approval-modal-actions">
          <button type="button" class="approval-btn approval-btn--cancel" @click="showOffShelfModal = false">取消</button>
          <button type="button" class="approval-btn approval-btn--reject" @click="confirmOffShelf">确认下架</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = ref('pending')

// 模拟数据
const items = ref([
  { id: 1, name: 'Apache Tomcat', version: '10.1.19', submitter: '张建国', lang: 'Java', license: 'Apache-2.0', submittedAt: '2025-03-20 10:30', type: '上架', status: 'pending', operator: null },
  { id: 2, name: 'Nginx', version: '1.25.4', submitter: '王明远', lang: 'C', license: 'BSD-2-Clause', submittedAt: '2025-03-19 14:20', type: '上架', status: 'pending', operator: null },
  { id: 3, name: 'Redis', version: '7.2.4', submitter: '李思远', lang: 'C', license: 'BSD-3-Clause', submittedAt: '2025-03-18 09:15', type: '上架', status: 'pending', operator: null },
  { id: 4, name: 'RabbitMQ', version: '3.13.0', submitter: '陈晓峰', lang: 'Erlang', license: 'MPL-2.0', submittedAt: '2025-03-17 16:45', type: '下架', status: 'pending', operator: null },
  { id: 5, name: 'Vue.js', version: '3.4.21', submitter: '赵小明', lang: 'TypeScript', license: 'MIT', submittedAt: '2025-03-15 11:00', type: '上架', status: 'approved', operator: 'admin' },
  { id: 6, name: 'Spring Boot', version: '3.2.3', submitter: '钱丽华', lang: 'Java', license: 'Apache-2.0', submittedAt: '2025-03-14 08:30', type: '上架', status: 'approved', operator: 'admin' },
  { id: 7, name: 'Django', version: '5.0.3', submitter: '孙一鸣', lang: 'Python', license: 'BSD-3-Clause', submittedAt: '2025-03-12 13:20', type: '上架', status: 'rejected', operator: 'admin' },
  { id: 8, name: 'Log4j 1.x', version: '1.2.17', submitter: '周雅琴', lang: 'Java', license: 'Apache-2.0', submittedAt: '2025-03-10 10:00', type: '下架', status: 'rejected', operator: 'admin' },
])

const filteredList = computed(() => items.value.filter((i) => i.status === filter.value))
const pendingCount = computed(() => items.value.filter((i) => i.status === 'pending').length)

// 通过 / 上架
function approve(item) {
  const idx = items.value.findIndex((i) => i.id === item.id)
  if (idx === -1) return
  items.value[idx] = { ...items.value[idx], status: 'approved', operator: 'admin' }
}

// 驳回对话框
const showRejectModal = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')

function openRejectDialog(item) {
  rejectTarget.value = item
  rejectReason.value = ''
  showRejectModal.value = true
}

function confirmReject() {
  if (!rejectTarget.value) return
  const idx = items.value.findIndex((i) => i.id === rejectTarget.value.id)
  if (idx === -1) return
  items.value[idx] = { ...items.value[idx], status: 'rejected', operator: 'admin' }
  showRejectModal.value = false
  rejectTarget.value = null
}

// 下架对话框
const showOffShelfModal = ref(false)
const offShelfTarget = ref(null)
const offShelfReason = ref('')

function openOffShelfDialog(item) {
  offShelfTarget.value = item
  offShelfReason.value = ''
  showOffShelfModal.value = true
}

function confirmOffShelf() {
  if (!offShelfTarget.value) return
  const idx = items.value.findIndex((i) => i.id === offShelfTarget.value.id)
  if (idx === -1) return
  items.value[idx] = { ...items.value[idx], status: 'rejected', operator: 'admin' }
  showOffShelfModal.value = false
  offShelfTarget.value = null
}

function viewDetail(item) {
  router.push({
    name: 'software-detail',
    query: { name: item.name, version: item.version },
  })
}
</script>

<style scoped>
.approval-page {
  padding: 0;
}

.approval-toolbar {
  margin-bottom: 20px;
}

.approval-tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
  width: fit-content;
}

.approval-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.approval-tab:hover {
  color: #374151;
}

.approval-tab.is-active {
  background: #fff;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.approval-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.approval-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px 0 0;
}

.approval-card-title {
  margin: 0 20px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.approval-table-wrap {
  overflow-x: auto;
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.approval-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  background: #fafafa;
}

.approval-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.approval-th-op {
  text-align: center;
  width: 130px;
}

.approval-td-op {
  text-align: center;
  white-space: nowrap;
}

.approval-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
}

.approval-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.approval-type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-on {
  background: #dcfce7;
  color: #16a34a;
}

.type-off {
  background: #fee2e2;
  color: #dc2626;
}

.approval-btn {
  padding: 5px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  color: #374151;
  transition: all 0.15s;
}

.approval-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.approval-btn--approve {
  color: #16a34a;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.approval-btn--approve:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.approval-btn--reject {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.approval-btn--reject:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.approval-btn--cancel {
  color: #6b7280;
  background: #fff;
}

.approval-btn + .approval-btn {
  margin-left: 8px;
}

/* 空状态 */
.approval-empty-row td {
  padding: 40px 14px;
}

.approval-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.approval-empty-text {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
}

/* 模态对话框 */
.approval-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.approval-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 440px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.approval-modal-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

.approval-modal-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.approval-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.approval-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.approval-modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}
</style>
