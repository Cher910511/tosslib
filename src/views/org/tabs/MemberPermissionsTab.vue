<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">成员权限</h2>
    </div>
    <p class="org-tab-hint">管理组织内各角色的权限范围。当前为演示版本，权限配置将在接入后端后生效。</p>

    <div class="perm-table-wrap">
      <table class="perm-table">
        <thead>
          <tr>
            <th>权限项</th>
            <th>超级管理员</th>
            <th>组织管理员</th>
            <th>组织成员</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in permMatrix" :key="row.label">
            <td class="perm-label">{{ row.label }}</td>
            <td><span class="perm-check" :class="row.superadmin ? 'perm-check--yes' : 'perm-check--no'">{{ row.superadmin ? '是' : '否' }}</span></td>
            <td><span class="perm-check" :class="row.admin ? 'perm-check--yes' : 'perm-check--no'">{{ row.admin ? '是' : '否' }}</span></td>
            <td><span class="perm-check" :class="row.member ? 'perm-check--yes' : 'perm-check--no'">{{ row.member ? '是' : '否' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({ org: { type: Object, required: true } })

const permMatrix = [
  { label: '查看软件库', superadmin: true, admin: true, member: true },
  { label: '查看已发车版本火车中的软件', superadmin: true, admin: true, member: true },
  { label: '查看未发车软件', superadmin: true, admin: true, member: false },
  { label: '软件入库与技术评审', superadmin: true, admin: true, member: false },
  { label: '创建/编辑版本火车', superadmin: true, admin: true, member: false },
  { label: '版本火车发车', superadmin: true, admin: true, member: false },
  { label: '创建软件出入库', superadmin: true, admin: true, member: false },
  { label: '跨组织数据查看', superadmin: true, admin: false, member: false },
  { label: '创建/管理组织', superadmin: true, admin: false, member: false },
  { label: '管理用户账号', superadmin: true, admin: false, member: false },
  { label: '使用 AI 助手', superadmin: true, admin: true, member: true },
  { label: '查看数据大屏', superadmin: true, admin: true, member: false },
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
  margin-bottom: 8px;
}

.org-tab-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.org-tab-hint {
  margin: 0 0 20px;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
}

.perm-table-wrap {
  overflow-x: auto;
}

.perm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.perm-table th {
  text-align: left;
  padding: 10px 14px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.perm-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.perm-label {
  font-weight: 500;
}

.perm-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}

.perm-check--yes {
  background: #f0fdf4;
  color: #16a34a;
}

.perm-check--no {
  background: #f3f4f6;
  color: #d1d5db;
}
</style>
