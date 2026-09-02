<template>
  <div class="fa-page">
    <!-- Tab 切换 -->
    <div class="fa-tabs">
      <button
        v-for="t in TABS"
        :key="t.key"
        type="button"
        class="fa-tab"
        :class="{ 'is-active': activeTab === t.key }"
        @click="setTab(t.key)"
      >{{ t.label }}</button>
    </div>

    <!-- 筛选信息 -->
    <section class="fa-card fa-filter-card">
      <header class="fa-card-hd fa-filter-hd">
        <button type="button" class="fa-filter-toggle" :aria-expanded="filterOpen" @click="filterOpen = !filterOpen">
          <span class="fa-caret" :class="{ 'is-open': filterOpen }" aria-hidden="true" />
          <span class="fa-filter-title">筛选信息</span>
        </button>
        <div class="fa-filter-actions">
          <button type="button" class="fa-btn-shelf fa-btn-shelf--outline" @click="clearFilter">清空</button>
          <button type="button" class="fa-btn-shelf fa-btn-shelf--primary" @click="doFilter">筛选</button>
        </div>
      </header>
      <div v-show="filterOpen" class="fa-filter-body">
        <div class="fa-filter-grid">
          <!-- 需求反馈 筛选项 -->
          <template v-if="activeTab === 'feedback'">
            <div class="fa-field">
              <label class="fa-label">反馈人</label>
              <input v-model.trim="feedbackFilters.reporter" type="text" class="fa-input" placeholder="请输入反馈人" />
            </div>
            <div class="fa-field">
              <label class="fa-label">反馈类型</label>
              <select v-model="feedbackFilters.type" class="fa-select">
                <option value="">全部</option>
                <option v-for="t in FEEDBACK_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="fa-field">
              <label class="fa-label">状态</label>
              <select v-model="feedbackFilters.status" class="fa-select">
                <option value="">全部</option>
                <option v-for="s in FEEDBACK_STATUS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </template>
          <!-- 企业认证审核 筛选项 -->
          <template v-else-if="activeTab === 'cert'">
            <div class="fa-field">
              <label class="fa-label">企业名称</label>
              <input v-model.trim="certFilters.name" type="text" class="fa-input" placeholder="请输入企业名称" />
            </div>
            <div class="fa-field">
              <label class="fa-label">状态</label>
              <select v-model="certFilters.status" class="fa-select">
                <option value="">全部</option>
                <option v-for="s in CERT_STATUS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </template>
          <!-- 开源软件入库需求清单 筛选项 -->
          <template v-else>
            <div class="fa-field">
              <label class="fa-label">反馈组织</label>
              <input v-model.trim="inboundFilters.org" type="text" class="fa-input" placeholder="请输入反馈组织" />
            </div>
            <div class="fa-field">
              <label class="fa-label">反馈人</label>
              <input v-model.trim="inboundFilters.reporter" type="text" class="fa-input" placeholder="请输入反馈人" />
            </div>
            <div class="fa-field">
              <label class="fa-label">联系方式</label>
              <input v-model.trim="inboundFilters.contact" type="text" class="fa-input" placeholder="请输入联系方式" />
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- 列表 -->
    <section class="fa-card fa-table-card">
      <header class="fa-card-hd fa-table-hd">
        <h2 class="fa-table-title">{{ listTitle }}</h2>
        <span class="fa-card-badge">共计 {{ filteredList.length }} 条</span>
      </header>

      <!-- ===== Tab1：需求反馈 ===== -->
      <template v-if="activeTab === 'feedback'">
        <div class="fa-table-wrap">
          <table class="fa-table">
            <thead>
              <tr>
                <th>反馈人</th>
                <th>联系方式</th>
                <th>反馈类型</th>
                <th>反馈内容</th>
                <th>反馈时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in paginatedList" :key="f.id">
                <td class="fa-name">{{ f.reporter }}</td>
                <td>{{ f.contact }}</td>
                <td>{{ f.type }}</td>
                <td class="fa-cell-ellipsis" :title="f.content">{{ f.content }}</td>
                <td>{{ f.time }}</td>
                <td><span class="fa-status" :class="'fa-status--' + f.status">{{ f.status }}</span></td>
              </tr>
              <tr v-if="!paginatedList.length">
                <td colspan="6" class="fa-empty">暂无匹配的需求反馈</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ===== Tab2：企业认证审核 ===== -->
      <template v-else-if="activeTab === 'cert'">
        <div class="fa-table-wrap">
          <table class="fa-table">
            <thead>
              <tr>
                <th>企业名称</th>
                <th>统一社会信用代码</th>
                <th>法人代表</th>
                <th>联系电话</th>
                <th>申请时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in paginatedList" :key="c.id">
                <td class="fa-name">{{ c.name }}</td>
                <td>{{ c.creditCode }}</td>
                <td>{{ c.legalPerson }}</td>
                <td>{{ c.phone }}</td>
                <td>{{ c.time }}</td>
                <td><span class="fa-status" :class="'fa-status--' + c.status">{{ c.status }}</span></td>
                <td>
                  <button v-if="c.status === '待审核'" type="button" class="fa-op" @click="auditCert(c.id, '已通过')">通过</button>
                  <button v-if="c.status === '待审核'" type="button" class="fa-op fa-op--off" @click="auditCert(c.id, '已驳回')">驳回</button>
                  <span v-else class="fa-muted">—</span>
                </td>
              </tr>
              <tr v-if="!paginatedList.length">
                <td colspan="7" class="fa-empty">暂无匹配的企业认证申请</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ===== Tab3：开源软件入库需求清单 ===== -->
      <template v-else>
        <div class="fa-table-wrap">
          <table class="fa-table">
            <thead>
              <tr>
                <th>反馈组织</th>
                <th>反馈人</th>
                <th>联系方式</th>
                <th>清单文件</th>
                <th>软件条数</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in paginatedList" :key="r.id">
                <td class="fa-name">{{ r.org }}</td>
                <td>{{ r.reporter }}</td>
                <td>{{ r.contact }}</td>
                <td class="fa-file-name" :title="r.fileName">{{ r.fileName }}</td>
                <td>{{ r.itemCount }} 条</td>
                <td>{{ r.createdAt }}</td>
                <td>
                  <button type="button" class="fa-op" @click="openDetail(r)">查看详情</button>
                </td>
              </tr>
              <tr v-if="!paginatedList.length">
                <td colspan="7" class="fa-empty">暂无入库需求清单，用户提交后将在此展示</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- 分页器 -->
      <footer v-if="filteredList.length" class="fa-footer">
        <span class="fa-total">共计 {{ filteredList.length }} 条</span>
        <div class="fa-pager">
          <button type="button" class="fa-page-btn" :disabled="page <= 1" aria-label="上一页" @click="page = Math.max(1, page - 1)">‹</button>
          <template v-for="(p, idx) in pageItems" :key="`${p}-${idx}`">
            <span v-if="p === '…'" class="fa-page-ellipsis">…</span>
            <button v-else type="button" class="fa-page-btn" :class="{ 'is-active': p === page }" @click="page = p">{{ p }}</button>
          </template>
          <button type="button" class="fa-page-btn" :disabled="page >= totalPages" aria-label="下一页" @click="page = Math.min(totalPages, page + 1)">›</button>
          <label class="fa-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="fa-page-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <!-- ===== 查看详情弹窗（解析后的四列表格 + 下载） ===== -->
    <div v-if="detailTarget" class="fa-overlay" @click.self="closeDetail">
      <div class="fa-modal" role="dialog" aria-modal="true" aria-labelledby="fa-modal-title">
        <header class="fa-modal-hd">
          <h3 id="fa-modal-title" class="fa-modal-title">
            {{ detailTarget.org }} · 入库需求清单
          </h3>
          <button type="button" class="fa-modal-close" aria-label="关闭" @click="closeDetail">✕</button>
        </header>
        <div class="fa-modal-meta">
          <span>反馈人：{{ detailTarget.reporter }}</span>
          <span>联系方式：{{ detailTarget.contact }}</span>
          <span>清单文件：{{ detailTarget.fileName }}</span>
          <span>提交时间：{{ detailTarget.createdAt }}</span>
        </div>
        <div class="fa-table-wrap fa-modal-table">
          <table class="fa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>开源软件名称</th>
                <th>版本号</th>
                <th>开源网站地址</th>
                <th>主要应用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in detailPagedItems" :key="i">
                <td class="fa-table-num">{{ (detailPage - 1) * detailPageSize + i + 1 }}</td>
                <td class="fa-name">{{ row.name }}</td>
                <td>{{ row.version }}</td>
                <td class="fa-cell-ellipsis" :title="row.url">{{ row.url }}</td>
                <td>{{ row.scene }}</td>
              </tr>
              <tr v-if="!detailTarget.items.length">
                <td colspan="5" class="fa-empty">该清单无解析数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="detailTarget.items.length" class="fa-modal-pager">
          <span class="fa-total">共 {{ detailTarget.items.length }} 条</span>
          <div class="fa-pager">
            <button type="button" class="fa-page-btn" :disabled="detailPage <= 1" aria-label="上一页" @click="goDetailPage(detailPage - 1)">‹</button>
            <template v-for="(p, idx) in detailPageItems" :key="`${p}-${idx}`">
              <span v-if="p === '…'" class="fa-page-ellipsis">…</span>
              <button v-else type="button" class="fa-page-btn" :class="{ 'is-active': p === detailPage }" @click="goDetailPage(p)">{{ p }}</button>
            </template>
            <button type="button" class="fa-page-btn" :disabled="detailPage >= detailPageCount" aria-label="下一页" @click="goDetailPage(detailPage + 1)">›</button>
            <label class="fa-page-size">
              <span class="visually-hidden">每页条数</span>
              <select v-model.number="detailPageSize" class="fa-page-select">
                <option :value="5">5条/页</option>
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
              </select>
            </label>
          </div>
        </footer>
        <footer class="fa-modal-ft">
          <button type="button" class="fa-btn-shelf fa-btn-shelf--primary" @click="downloadDetail(detailTarget)">下载清单</button>
          <button type="button" class="fa-btn-shelf fa-btn-shelf--outline" @click="closeDetail">关闭</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { getInboundRequests } from '../../data/inboundRequests.js'

const TABS = [
  { key: 'feedback', label: '需求反馈' },
  { key: 'cert', label: '企业认证审核' },
  { key: 'inbound', label: '开源软件入库需求清单' },
]

const FEEDBACK_TYPES = ['代码、制品需求', '功能需求', '使用体验', '异常反馈', '权限安全', '账号登录', '其他']
const FEEDBACK_STATUS = ['待处理', '处理中', '已处理']
const CERT_STATUS = ['待审核', '已通过', '已驳回']

const activeTab = ref('feedback')
const filterOpen = ref(true)

const listTitle = computed(() => {
  const t = TABS.find((x) => x.key === activeTab.value)
  return t ? `${t.label}列表` : ''
})

function setTab(key) {
  activeTab.value = key
  page.value = 1
}

/* —— 数据源 —— */
const feedbackList = ref([
  { id: 'f1', reporter: '赵小明', contact: '13800000001', type: '功能需求', content: '希望软件库支持按行业分类筛选软件。', time: '2026-08-28 10:23', status: '待处理' },
  { id: 'f2', reporter: '钱丽华', contact: '13800000002', type: '异常反馈', content: '下载软件包时偶发超时，请排查。', time: '2026-08-25 15:41', status: '已处理' },
  { id: 'f3', reporter: '孙一鸣', contact: '13800000003', type: '代码、制品需求', content: '缺少 spring-cloud 相关组件，申请入库。', time: '2026-08-22 09:12', status: '处理中' },
  { id: 'f4', reporter: '周雅琴', contact: '13800000004', type: '使用体验', content: '详情页加载偏慢，建议优化图片资源。', time: '2026-08-20 14:05', status: '待处理' },
  { id: 'f5', reporter: '吴浩然', contact: '13800000005', type: '权限安全', content: '子账号权限粒度较粗，希望支持按目录授权。', time: '2026-08-18 11:30', status: '处理中' },
  { id: 'f6', reporter: '郑子轩', contact: '13800000006', type: '功能需求', content: '建议增加 SBOM 导出为 SPDX 格式。', time: '2026-08-15 16:44', status: '待处理' },
  { id: 'f7', reporter: '冯雨萱', contact: '13800000007', type: '账号登录', content: '企业微信扫码登录偶发失败。', time: '2026-08-12 09:02', status: '已处理' },
  { id: 'f8', reporter: '王逸飞', contact: '13800000008', type: '异常反馈', content: '漏洞详情页 CVE 链接打不开。', time: '2026-08-10 13:26', status: '已处理' },
  { id: 'f9', reporter: '李梦涵', contact: '13800000009', type: '代码、制品需求', content: '希望引入 jwt 相关组件库。', time: '2026-08-08 10:15', status: '待处理' },
  { id: 'f10', reporter: '刘子涵', contact: '13800000010', type: '使用体验', content: '软件卡片希望展示更多评分信息。', time: '2026-08-05 17:38', status: '处理中' },
  { id: 'f11', reporter: '杨思琪', contact: '13800000011', type: '功能需求', content: '建议支持订阅邮件的日报推送。', time: '2026-08-03 09:50', status: '待处理' },
  { id: 'f12', reporter: '张建国', contact: '13800000012', type: '权限安全', content: '组织管理员无法查看成员操作日志。', time: '2026-08-01 15:20', status: '已处理' },
  { id: 'f13', reporter: '李慧敏', contact: '13800000013', type: '功能需求', content: '希望支持批量导出软件清单。', time: '2026-07-30 10:40', status: '待处理' },
  { id: 'f14', reporter: '王强', contact: '13800000014', type: '异常反馈', content: '搜索结果偶尔不准确，疑似索引未更新。', time: '2026-07-28 16:12', status: '处理中' },
  { id: 'f15', reporter: '陈静', contact: '13800000015', type: '使用体验', content: '希望表格支持自定义列显示。', time: '2026-07-25 11:05', status: '待处理' },
  { id: 'f16', reporter: '刘洋', contact: '13800000016', type: '代码、制品需求', content: '缺少 nestjs 相关组件，申请入库。', time: '2026-07-22 09:30', status: '已处理' },
  { id: 'f17', reporter: '黄丽', contact: '13800000017', type: '权限安全', content: '希望支持基于角色的细粒度权限。', time: '2026-07-20 14:55', status: '处理中' },
  { id: 'f18', reporter: '赵磊', contact: '13800000018', type: '功能需求', content: '建议增加软件对比功能。', time: '2026-07-18 10:10', status: '待处理' },
  { id: 'f19', reporter: '孙芳', contact: '13800000019', type: '账号登录', content: '忘记密码找回流程复杂，希望简化。', time: '2026-07-15 15:35', status: '已处理' },
  { id: 'f20', reporter: '周涛', contact: '13800000020', type: '异常反馈', content: '下载大文件时进度条不更新。', time: '2026-07-12 11:20', status: '待处理' },
  { id: 'f21', reporter: '吴敏', contact: '13800000021', type: '使用体验', content: '暗色模式下部分图表看不清。', time: '2026-07-10 09:15', status: '处理中' },
  { id: 'f22', reporter: '郑伟', contact: '13800000022', type: '代码、制品需求', content: '希望补充 k8s 客户端组件。', time: '2026-07-08 16:50', status: '待处理' },
  { id: 'f23', reporter: '冯雪', contact: '13800000023', type: '功能需求', content: '建议支持订阅通知的站内信提醒。', time: '2026-07-05 10:45', status: '已处理' },
  { id: 'f24', reporter: '王静', contact: '13800000024', type: '权限安全', content: 'API 密钥过期提醒不明显。', time: '2026-07-03 14:20', status: '处理中' },
  { id: 'f25', reporter: '李强', contact: '13800000025', type: '异常反馈', content: '扫描结果导出后部分字段乱码。', time: '2026-07-01 09:55', status: '待处理' },
])

const certList = ref([
  { id: 'c1', name: '重庆渝高科技发展有限公司', creditCode: '91500106MA60XXXX1A', legalPerson: '刘强', phone: '023-88880001', time: '2026-08-30 11:02', status: '待审核' },
  { id: 'c2', name: '成都锦程信息技术有限公司', creditCode: '91510100MA6XXXX2B', legalPerson: '陈琳', phone: '028-66660002', time: '2026-08-29 16:20', status: '待审核' },
  { id: 'c3', name: '北京云启数据服务有限公司', creditCode: '91110108MA0XXXX3C', legalPerson: '周涛', phone: '010-55550003', time: '2026-08-25 14:05', status: '已通过' },
  { id: 'c4', name: '上海星河网络科技有限公司', creditCode: '91310115MA1XXXX4D', legalPerson: '林芳', phone: '021-66660004', time: '2026-08-22 10:10', status: '待审核' },
  { id: 'c5', name: '深圳前海智云科技有限公司', creditCode: '91440300MA5XXXX5E', legalPerson: '黄磊', phone: '0755-88880005', time: '2026-08-18 09:30', status: '已驳回' },
  { id: 'c6', name: '杭州云帆信息技术有限公司', creditCode: '91330106MA2XXXX6F', legalPerson: '徐静', phone: '0571-88880006', time: '2026-08-15 14:45', status: '已通过' },
  { id: 'c7', name: '南京智联软件有限公司', creditCode: '91320100MA1XXXX7G', legalPerson: '马超', phone: '025-88880007', time: '2026-08-12 11:08', status: '待审核' },
  { id: 'c8', name: '武汉光谷云数科技有限公司', creditCode: '91420100MA4XXXX8H', legalPerson: '胡雪', phone: '027-88880008', time: '2026-08-08 16:32', status: '已通过' },
])

const inboundList = computed(() => getInboundRequests())

/* —— 筛选项 —— */
const feedbackFilters = reactive({ reporter: '', type: '', status: '' })
const certFilters = reactive({ name: '', status: '' })
const inboundFilters = reactive({ org: '', reporter: '', contact: '' })

/* —— 筛选结果 —— */
function filterFeedback() {
  let list = feedbackList.value
  const n = feedbackFilters.reporter.trim().toLowerCase()
  if (n) list = list.filter((s) => s.reporter.toLowerCase().includes(n))
  if (feedbackFilters.type) list = list.filter((s) => s.type === feedbackFilters.type)
  if (feedbackFilters.status) list = list.filter((s) => s.status === feedbackFilters.status)
  return list
}

function filterCert() {
  let list = certList.value
  const n = certFilters.name.trim().toLowerCase()
  if (n) list = list.filter((s) => s.name.toLowerCase().includes(n))
  if (certFilters.status) list = list.filter((s) => s.status === certFilters.status)
  return list
}

function filterInbound() {
  let list = inboundList.value
  const org = inboundFilters.org.trim().toLowerCase()
  const rep = inboundFilters.reporter.trim().toLowerCase()
  const con = inboundFilters.contact.trim().toLowerCase()
  if (org) list = list.filter((s) => s.org.toLowerCase().includes(org))
  if (rep) list = list.filter((s) => s.reporter.toLowerCase().includes(rep))
  if (con) list = list.filter((s) => s.contact.toLowerCase().includes(con))
  return list
}

const filteredList = computed(() => {
  if (activeTab.value === 'feedback') return filterFeedback()
  if (activeTab.value === 'cert') return filterCert()
  return filterInbound()
})

function doFilter() {
  page.value = 1
}

function clearFilter() {
  if (activeTab.value === 'feedback') {
    feedbackFilters.reporter = ''
    feedbackFilters.type = ''
    feedbackFilters.status = ''
  } else if (activeTab.value === 'cert') {
    certFilters.name = ''
    certFilters.status = ''
  } else {
    inboundFilters.org = ''
    inboundFilters.reporter = ''
    inboundFilters.contact = ''
  }
  page.value = 1
}

/* —— 分页 —— */
const page = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize.value)))

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const pageItems = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items = [1]
  if (cur > 3) items.push('…')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (cur < total - 2) items.push('…')
  items.push(total)
  return items
})

watch(pageSize, () => {
  page.value = 1
})

/* —— 企业认证审核操作 —— */
function auditCert(id, status) {
  const c = certList.value.find((x) => x.id === id)
  if (c) c.status = status
}

/* —— 查看详情弹窗 —— */
const detailTarget = ref(null)
const detailPage = ref(1)
const detailPageSize = ref(5)

const detailPageCount = computed(() => {
  const n = detailTarget.value?.items?.length || 0
  return Math.max(1, Math.ceil(n / detailPageSize.value))
})

const detailPagedItems = computed(() => {
  const items = detailTarget.value?.items || []
  const start = (detailPage.value - 1) * detailPageSize.value
  return items.slice(start, start + detailPageSize.value)
})

const detailPageItems = computed(() => {
  const total = detailPageCount.value
  const cur = detailPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items = [1]
  if (cur > 3) items.push('…')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (cur < total - 2) items.push('…')
  items.push(total)
  return items
})

function goDetailPage(p) {
  if (p < 1 || p > detailPageCount.value) return
  detailPage.value = p
}

watch(detailPageSize, () => {
  detailPage.value = 1
})

function openDetail(r) {
  detailTarget.value = r
  detailPage.value = 1
}
function closeDetail() {
  detailTarget.value = null
}

/* —— 下载：导出 CSV（支持解析的四列 + 头部信息） —— */
function downloadDetail(r) {
  const header = ['开源软件名称', '版本号', '开源网站地址', '主要应用场景']
  const rows = r.items.map((row) => [row.name, row.version, row.url, row.scene])
  const lines = [header.join(',')]
  rows.forEach((row) => {
    lines.push(row.map((cell) => {
      const s = String(cell == null ? '' : cell)
      return `"${s.replace(/"/g, '""')}"`
    }).join(','))
  })
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${r.org}-入库需求清单-${r.createdAt.replace(/[: ]/g, '-')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.fa-page {
  padding: 0;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== Tab 切换 ===== */
.fa-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  padding: 0;
}

.fa-tab {
  position: relative;
  padding: 12px 24px 14px;
  margin-bottom: -1px;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
}

.fa-tab.is-active {
  color: #da203e;
}

.fa-tab.is-active::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #da203e;
}

/* ===== 卡片 ===== */
.fa-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.fa-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.fa-table-hd {
  border-bottom: none;
  padding-bottom: 12px;
}

.fa-table-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.fa-card-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
  background: #f3f4f6;
  color: #6b7280;
}

/* ===== 筛选卡 ===== */
.fa-filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
  color: #111827;
}

.fa-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}

.fa-caret.is-open {
  transform: rotate(180deg);
}

.fa-filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.fa-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fa-filter-body {
  padding: 16px 20px 20px;
}

.fa-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
}

.fa-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.fa-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.fa-input,
.fa-select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  color: #111827;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.fa-input::placeholder {
  color: #9ca3af;
}

.fa-input:focus,
.fa-select:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.fa-select {
  cursor: pointer;
  color: #6b7280;
}

/* ===== 按钮 ===== */
.fa-btn-shelf {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.fa-btn-shelf--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

.fa-btn-shelf--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}

.fa-btn-shelf--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}

.fa-btn-shelf--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

/* ===== 表格 ===== */
.fa-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}

.fa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.fa-table th,
.fa-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.fa-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
  white-space: nowrap;
}

.fa-table tbody tr:hover {
  background: #fafafa;
}

.fa-name {
  color: #111827;
  font-weight: 500;
}

.fa-cell-ellipsis {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 清单文件：完整展示文件名称，过长时换行 */
.fa-file-name {
  max-width: 280px;
  overflow-wrap: anywhere;
  word-break: break-all;
  color: #374151;
}

.fa-table-num {
  color: #9ca3af;
}

.fa-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 12px;
}

.fa-muted {
  color: #9ca3af;
}

/* 状态徽标 */
.fa-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.fa-status--待审核,
.fa-status--待处理,
.fa-status--处理中 {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.fa-status--已通过,
.fa-status--已处理 {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.fa-status--已驳回 {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

/* 操作按钮 */
.fa-op {
  padding: 4px 14px;
  border: 0 solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
  transition: all 0.15s;
}

.fa-op:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.fa-op--off {
  color: #6b7280;
}

.fa-op--off:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* ===== 分页器 ===== */
.fa-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
}

.fa-total {
  font-size: 12px;
  color: #6b7280;
}

.fa-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fa-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.fa-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}

.fa-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}

.fa-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fa-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 12px;
  user-select: none;
}

.fa-page-size {
  margin-left: 4px;
}

.fa-page-select {
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
}

/* ===== 弹窗 ===== */
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

.fa-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.fa-modal {
  width: min(860px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.fa-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.fa-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.fa-modal-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

.fa-modal-close:hover {
  color: #dc2626;
}

.fa-modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}

.fa-modal-table {
  flex: 1;
  overflow: auto;
  padding: 4px 20px;
}

.fa-modal-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}

.fa-modal-ft {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}
</style>
