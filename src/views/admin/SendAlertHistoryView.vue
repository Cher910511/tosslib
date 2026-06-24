<template>
  <div class="sah-page">
    <div class="sah-hd">
      <button type="button" class="sah-back" @click="router.back()">← 返回</button>
      <h1 class="sah-title">预警发送历史</h1>
    </div>

    <div class="sah-card">
      <table class="va-table">
        <thead>
          <tr>
            <th>CVE 编号</th>
            <th>标题</th>
            <th>发送时间</th>
            <th>接收范围</th>
            <th>发送方式</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(h, i) in sendHistory" :key="i">
            <td><span class="va-cve-link">{{ h.cve }}</span></td>
            <td style="text-align:left;">{{ h.title }}</td>
            <td class="va-muted">{{ h.time }}</td>
            <td>{{ h.scopeLabel }}</td>
            <td>{{ h.methodLabel }}</td>
            <td><span class="va-status va-status--sent">已发送</span></td>
          </tr>
          <tr v-if="sendHistory.length === 0">
            <td colspan="6" class="va-empty">暂无发送记录</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const sendHistory = [
  { cve: 'CVE-2025-9012', title: 'Vue.js XSS 跨站脚本漏洞预警', time: '2025-06-08 10:30', scopeLabel: '全部组织', methodLabel: '站内通知' },
  { cve: 'CVE-2025-7890', title: 'Django SQL 注入漏洞预警', time: '2025-06-02 14:00', scopeLabel: '全部组织', methodLabel: '站内+邮件' },
  { cve: 'CVE-2025-2345', title: 'Redis 信息泄露漏洞预警', time: '2025-05-26 09:15', scopeLabel: '指定组织', methodLabel: '邮件通知' },
]
</script>

<style scoped>
.sah-page { padding: 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.sah-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sah-back { padding: 4px 12px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; color: #374151; cursor: pointer; border-radius: 6px; font-family: inherit; }
.sah-back:hover { border-color: #da203e; color: #da203e; }
.sah-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }
.sah-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.va-table { width: 100%; border-collapse: collapse; font-size: 14px; background: #fff; }
.va-table thead th { padding: 12px 16px; text-align: center; font-weight: 600; font-size: 13px; color: #303133; background: #f5f7fa; border-bottom: 1px solid #ebeef5; white-space: nowrap; }
.va-table tbody td { padding: 12px 16px; border-bottom: 1px solid #ebeef5; color: #606266; text-align: center; line-height: 22px; }
.va-table tbody tr:hover { background: #f5f7fa; }
.va-cve-link { color: #da203e; cursor: pointer; font-weight: 500; }
.va-muted { color: #909399; font-size: 13px; }
.va-status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; line-height: 20px; }
.va-status--sent { background: #e1f3e1; color: #2e7d32; }
.va-empty { text-align: center; padding: 40px 0; color: #909399; font-size: 14px; }
</style>
