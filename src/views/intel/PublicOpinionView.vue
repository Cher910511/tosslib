<template>
  <div class="opi-page">
    <div class="opi-hd">
      <h1 class="opi-title">舆情库</h1>
      <div class="opi-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="搜索软件名称或事件标题..." />
      </div>
    </div>

    <div class="opi-kpi">
      <div class="opi-kpi-item"><span class="opi-kpi-num">{{ newsList.length }}</span><span class="opi-kpi-label">舆情总数</span></div>
      <div class="opi-kpi-item opi-kpi-item--high"><span class="opi-kpi-num">{{ highCount }}</span><span class="opi-kpi-label">重要</span></div>
      <div class="opi-kpi-item opi-kpi-item--medium"><span class="opi-kpi-num">{{ normalCount }}</span><span class="opi-kpi-label">一般</span></div>
      <div class="opi-kpi-item"><span class="opi-kpi-num">{{ subscribedCount }}</span><span class="opi-kpi-label">关注中</span></div>
    </div>

    <div class="opi-card">
      <table class="opi-table">
        <thead>
          <tr>
            <th>标题</th><th>涉及软件</th><th>事件类型</th><th>严重程度</th><th>发布时间</th><th>来源</th><th>关注状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td><span class="opi-title-text">{{ item.title }}</span></td>
            <td>{{ item.software }}</td>
            <td class="opi-muted">{{ item.type }}</td>
            <td><span class="opi-badge" :class="'opi-badge--' + item.level">{{ item.levelLabel }}</span></td>
            <td class="opi-muted">{{ item.time }}</td>
            <td class="opi-muted">{{ item.source }}</td>
            <td><span class="opi-status" :class="item.subscribed ? 'opi-status--on' : 'opi-status--off'">{{ item.subscribed ? '关注中' : '未关注' }}</span></td>
            <td><button type="button" class="opi-link" @click="viewDetail(item)">详情</button></td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="8" class="opi-empty">暂无舆情数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="detailItem" class="opi-overlay" @click.self="detailItem = null">
        <div class="opi-drawer">
          <div class="opi-drawer-hd">
            <h3 class="opi-drawer-title">{{ detailItem.title }}</h3>
            <button type="button" class="opi-drawer-close" @click="detailItem = null">×</button>
          </div>
          <div class="opi-drawer-body">
            <dl class="opi-dl">
              <div class="opi-dl-row"><dt>涉及软件</dt><dd>{{ detailItem.software }}</dd></div>
              <div class="opi-dl-row"><dt>事件类型</dt><dd>{{ detailItem.type }}</dd></div>
              <div class="opi-dl-row"><dt>严重程度</dt><dd><span class="opi-badge" :class="'opi-badge--' + detailItem.level">{{ detailItem.levelLabel }}</span></dd></div>
              <div class="opi-dl-row"><dt>发布时间</dt><dd>{{ detailItem.time }}</dd></div>
              <div class="opi-dl-row"><dt>来源</dt><dd>{{ detailItem.source }}</dd></div>
            </dl>
            <section class="opi-section"><h4 class="opi-section-title">事件摘要</h4><p class="opi-section-text">{{ detailItem.summary }}</p></section>
            <section class="opi-section"><h4 class="opi-section-title">参考链接</h4><a class="opi-section-link" :href="detailItem.url" target="_blank" rel="noopener noreferrer">{{ detailItem.url }}</a></section>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const detailItem = ref(null)

const newsList = ref([
  { id: 1, title: 'Log4j 被发现新的远程代码执行漏洞（CVE-2025-6789）', software: 'Log4j', type: '安全漏洞', level: 'critical', levelLabel: '重要', time: '2025-06-10', source: 'CNNVD', subscribed: true, summary: '近日，Apache Log4j2 组件被披露存在一个新的远程代码执行漏洞（CVE-2025-6789），攻击者可利用该漏洞在未授权的情况下远程执行任意代码。建议相关用户尽快升级至最新版本。', url: 'https://example.com/news/log4j-cve-2025-6789' },
  { id: 2, title: 'Spring 框架生态多个组件存在供应链投毒风险', software: 'Spring Framework', type: '供应链风险', level: 'critical', levelLabel: '重要', time: '2025-06-08', source: 'OSCS', subscribed: true, summary: '安全研究人员发现 Spring 生态中有多个组件包被投毒，包含恶意代码。建议开发者在引入 Spring 相关组件时校验来源和签名。', url: 'https://example.com/news/spring-supply-chain' },
  { id: 3, title: 'Nginx 被曝拒绝服务漏洞，影响 1.24.x 系列版本', software: 'Nginx', type: '安全漏洞', level: 'medium', levelLabel: '一般', time: '2025-06-05', source: 'CNVD', subscribed: false, summary: 'Nginx 官方披露了一个拒绝服务漏洞，攻击者可发送特制请求导致 Nginx 服务崩溃。该漏洞影响 Nginx 1.24.x 系列版本。', url: 'https://example.com/news/nginx-dos' },
  { id: 4, title: '开源社区热议：npm 包被批量恶意篡改事件', software: 'Node.js', type: '社区动态', level: 'medium', levelLabel: '一般', time: '2025-06-03', source: '开源中国', subscribed: false, summary: '近期 npm 生态中出现多起恶意包投毒事件，攻击者通过社会工程学手段获取维护者权限后篡改包内容。建议使用 npm 包时启用完整性校验。', url: 'https://example.com/news/npm-incident' },
  { id: 5, title: 'Redis 官方发布安全公告：多个版本存在权限提升漏洞', software: 'Redis', type: '安全漏洞', level: 'high', levelLabel: '重要', time: '2025-05-28', source: 'Redis 官方', subscribed: true, summary: 'Redis 官方发布安全公告，披露了多个版本中存在的权限提升漏洞。攻击者在获得基础访问权限后，可利用该漏洞获取更高权限。建议升级至 Redis 7.2.5 及以上版本。', url: 'https://example.com/news/redis-privilege-escalation' },
  { id: 6, title: '开源许可证合规风险预警：SSPL 许可证被多家企业弃用', software: '开源软件', type: '许可证风险', level: 'medium', levelLabel: '一般', time: '2025-05-25', source: 'Linux 基金会', subscribed: false, summary: 'SSPL 许可证的争议持续升温，多家企业宣布弃用使用 SSPL 许可证的开源项目。建议团队在引入相关软件时评估许可证合规风险。', url: 'https://example.com/news/sspl-license' },
])

const highCount = computed(() => newsList.value.filter(v => v.level === 'critical' || v.level === 'high').length)
const normalCount = computed(() => newsList.value.filter(v => v.level === 'medium').length)
const subscribedCount = computed(() => newsList.value.filter(v => v.subscribed).length)

const filteredList = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return newsList.value
  return newsList.value.filter(v => v.title.toLowerCase().includes(q) || v.software.toLowerCase().includes(q))
})

function viewDetail(item) { detailItem.value = item }
</script>

<style scoped>
.opi-page { padding: 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.opi-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; }
.opi-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }
.opi-search { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; width: 280px; }
.opi-search svg { flex-shrink: 0; color: #9ca3af; }
.opi-search input { border: none; outline: none; font-size: 13px; color: #374151; width: 100%; background: transparent; }
.opi-search input::placeholder { color: #9ca3af; }

.opi-kpi { display: flex; gap: 10px; margin-bottom: 16px; }
.opi-kpi-item { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; align-items: center; }
.opi-kpi-num { font-size: 26px; font-weight: 700; color: #111827; line-height: 1.2; }
.opi-kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
.opi-kpi-item--high { border-left: 3px solid #dc2626; }
.opi-kpi-item--medium { border-left: 3px solid #f59e0b; }

.opi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.opi-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.opi-table thead th { padding: 10px 14px; text-align: left; font-weight: 500; font-size: 12px; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.opi-table tbody td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; color: #374151; max-width: 260px; }
.opi-table tbody tr:last-child td { border-bottom: none; }
.opi-table tbody tr:hover { background: #f9fafb; }
.opi-title-text { color: #111827; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.opi-muted { color: #9ca3af; font-size: 12px; }
.opi-badge { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; line-height: 20px; }
.opi-badge--critical { background: #7c1d1d; color: #fff; }
.opi-badge--high { background: #dc2626; color: #fff; }
.opi-badge--medium { background: #f59e0b; color: #fff; }
.opi-badge--low { background: #6b7280; color: #fff; }
.opi-status { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 12px; line-height: 20px; }
.opi-status--on { background: #f0fdf4; color: #166534; }
.opi-status--off { background: #f3f4f6; color: #6b7280; }
.opi-link { padding: 0; border: none; background: none; font: inherit; font-size: 13px; color: #da203e; cursor: pointer; }
.opi-link:hover { text-decoration: underline; }
.opi-empty { text-align: center; padding: 40px 0; color: #9ca3af; }

/* drawer */
.opi-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 1000; display: flex; justify-content: flex-end; }
.opi-drawer { width: 420px; background: #fff; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.opi-drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.opi-drawer-title { margin: 0; font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4; }
.opi-drawer-close { padding: 0 4px; border: none; background: none; font-size: 20px; color: #9ca3af; cursor: pointer; line-height: 1; }
.opi-drawer-close:hover { color: #374151; }
.opi-drawer-body { padding: 16px 20px; flex: 1; }
.opi-dl { margin: 0; }
.opi-dl-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.opi-dl-row dt { width: 80px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
.opi-dl-row dd { margin: 0; font-size: 13px; color: #374151; }
.opi-section { margin-top: 16px; }
.opi-section-title { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 6px; }
.opi-section-text { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
.opi-section-link { font-size: 13px; color: #da203e; word-break: break-all; }
</style>
