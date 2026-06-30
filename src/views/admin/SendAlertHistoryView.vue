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
            <th>风险等级</th>
            <th>预警标题</th>
            <th>影响版本数</th>
            <th>发送时间</th>
            <th>发送人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(h, i) in sendHistory" :key="i">
            <td><span class="va-cve-link">{{ h.cve }}</span></td>
            <td><span class="va-level" :class="'va-level--' + h.level">{{ h.levelLabel }}</span></td>
            <td style="text-align:left;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" :title="h.title">{{ h.title }}</td>
            <td><span class="va-count-badge">{{ h.affectCount }}</span></td>
            <td class="va-muted">{{ h.time }}</td>
            <td>{{ h.sender }}</td>
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
  { cve: 'CVE-2025-9012', level: 'medium', levelLabel: '中危', title: 'Vue.js XSS 跨站脚本漏洞预警', affectCount: 42, time: '2025-06-08 10:30', sender: '张三' },
  { cve: 'CVE-2025-7890', level: 'high', levelLabel: '高危', title: 'Django SQL 注入漏洞预警', affectCount: 89, time: '2025-06-02 14:00', sender: '李四' },
  { cve: 'CVE-2025-2345', level: 'low', levelLabel: '低危', title: 'Redis 信息泄露漏洞预警', affectCount: 34, time: '2025-05-26 09:15', sender: '张三' },
  { cve: 'CVE-2025-1234', level: 'critical', levelLabel: '超危', title: 'Log4j 远程代码执行漏洞预警', affectCount: 156, time: '2025-05-20 14:30', sender: '王五' },
  { cve: 'CVE-2025-5678', level: 'high', levelLabel: '高危', title: 'Spring Framework 路径遍历漏洞预警', affectCount: 78, time: '2025-05-15 11:00', sender: '张三' },
  { cve: 'CVE-2025-3456', level: 'critical', levelLabel: '超危', title: 'OpenSSL 缓冲区溢出漏洞预警', affectCount: 203, time: '2025-05-10 08:45', sender: '李四' },
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
.va-level { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; line-height: 20px; }
.va-level--critical { background: #fef0f0; color: #f56c6c; }
.va-level--high { background: #fef0f0; color: #e6a23c; }
.va-level--medium { background: #fdf6ec; color: #e6a23c; }
.va-level--low { background: #f5f7fa; color: #909399; }
.va-status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; line-height: 20px; }
.va-status--sent { background: #e1f3e1; color: #2e7d32; }
.va-empty { text-align: center; padding: 40px 0; color: #909399; font-size: 14px; }
</style>
