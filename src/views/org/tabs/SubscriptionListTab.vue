<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">订阅列表</h2>
      <button type="button" class="org-tab-action">+ 新增订阅</button>
    </div>

    <table class="sub-table">
      <thead>
        <tr>
          <th>订阅类型</th>
          <th>订阅名称</th>
          <th>订阅时间</th>
          <th>到期时间</th>
          <th>状态</th>
          <th class="sub-th-op">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sub in subscriptions" :key="sub.id">
          <td>{{ sub.type }}</td>
          <td class="sub-name">{{ sub.name }}</td>
          <td>{{ sub.startTime }}</td>
          <td>{{ sub.endTime }}</td>
          <td>
            <span class="sub-badge" :class="'sub-badge--' + sub.status">{{ sub.statusLabel }}</span>
          </td>
          <td class="sub-td-op">
            <button type="button" class="sub-linkish">续费</button>
            <span class="sub-op-sep">|</span>
            <button type="button" class="sub-linkish sub-linkish--danger">取消订阅</button>
          </td>
        </tr>
        <tr v-if="subscriptions.length === 0">
          <td colspan="6" class="sub-empty">暂无订阅数据</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ org: { type: Object, required: true } })

const subscriptions = [
  { id: 1, type: '版本火车年度订阅', name: '企业基础版', startTime: '2026-01-15', endTime: '2027-01-15', status: 'active', statusLabel: '进行中' },
  { id: 2, type: '安全扫描服务', name: '高级安全包', startTime: '2026-03-01', endTime: '2026-09-01', status: 'active', statusLabel: '进行中' },
]
</script>

<style scoped>
.org-tab-content {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
}

.org-tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.org-tab-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.org-tab-action {
  padding: 6px 16px;
  border: 1px solid #da203e;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
  transition: all 0.15s;
}

.org-tab-action:hover {
  background: #da203e;
  color: #fff;
}

.sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sub-table th {
  text-align: left;
  padding: 10px 14px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.sub-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.sub-name { font-weight: 500; }

.sub-badge {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.sub-badge--active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.sub-badge--expired {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.sub-th-op { text-align: right; }
.sub-td-op { text-align: right; white-space: nowrap; }

.sub-linkish {
  padding: 0; border: none; background: none;
  font-family: inherit; font-size: 13px;
  color: #da203e; cursor: pointer;
}

.sub-linkish:hover { text-decoration: underline; }
.sub-linkish--danger { color: #dc2626; }

.sub-op-sep { color: #d1d5db; margin: 0 6px; }

.sub-empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}
</style>
