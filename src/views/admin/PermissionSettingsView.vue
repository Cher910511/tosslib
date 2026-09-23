<template>
  <div class="perm-page">
    <!-- 概览：各平台角色成员数 -->
    <section class="perm-card">
      <header class="perm-card-hd perm-overview-hd">
        <div>
          <h2 class="perm-title">平台权限设置</h2>
          <p class="perm-desc">
            平台管理员为平台上的任意成员分配<strong>平台角色</strong>（平台级能力），并配置各角色可用的功能菜单。
          </p>
        </div>
      </header>
      <div class="perm-kpi-row">
        <button
          v-for="r in roleStats"
          :key="r.id"
          type="button"
          class="perm-kpi"
          :class="{ 'is-active': memberFilter === r.id }"
          @click="toggleRoleFilter(r.id)"
        >
          <span class="perm-kpi-num">{{ r.count }}</span>
          <span class="perm-kpi-label">{{ r.name }}</span>
        </button>
      </div>
    </section>

    <!-- 成员角色 / 功能权限矩阵 -->
    <section class="perm-card">
      <header class="perm-card-hd perm-hd-bar">
        <!-- 原「成员列表 / 功能权限矩阵」Tab 已改为标题（矩阵 Tab 已移除，恢复时改回按钮组即可） -->
        <h3 class="perm-title perm-title--bar">成员列表</h3>

        <div class="perm-bar-actions">
          <input v-model.trim="keyword" type="text" class="perm-input" placeholder="搜索成员姓名 / 组织" />
          <button type="button" class="perm-btn" @click="exportMembers">导出成员列表</button>
          <button type="button" class="perm-btn perm-btn--primary" @click="openCreateDialog">新建账号</button>
        </div>
      </header>

      <p v-if="tip" class="perm-tip">{{ tip }}</p>

      <!-- 成员列表：主行账号级信息，组织角色列平铺展示 -->
      <div v-if="activeTab === 'members'">
        <!-- 筛选栏：平台角色 / 组织 / 账号状态 -->
        <div class="perm-filter-bar">
          <SearchSelect
            v-model="memberFilter"
            class="perm-filter-ss"
            :options="platformRoleFilterOptions"
            placeholder="全部平台角色"
            clearable
          />
          <SearchSelect
            v-model="orgFilter"
            class="perm-filter-ss"
            :options="orgFilterSelectOptions"
            placeholder="全部组织"
            clearable
          />
          <SearchSelect
            v-model="statusFilter"
            class="perm-filter-ss"
            :options="statusFilterOptions"
            placeholder="全部状态"
            clearable
          />
          <button
            v-if="memberFilter || orgFilter || statusFilter || keyword"
            type="button"
            class="perm-btn"
            @click="clearMemberFilters"
          >清空筛选</button>
        </div>

        <div class="perm-table-wrap">
        <table class="perm-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>平台角色</th>
              <th class="perm-col-orgrole">组织角色</th>
              <th class="perm-col-status">状态</th>
              <th>更新人</th>
              <th>更新时间</th>
              <th class="perm-col-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in paginatedMembers" :key="row.userId">
              <tr>
                <td class="perm-user">
                  <img class="perm-avatar perm-avatar--img" :src="avatarUrl(row)" :alt="row.name" />
                  <span class="perm-user-name">{{ row.name }}</span>
                </td>
                <td>
                  <!-- 铁律：此列只出现平台角色；没有则显示「—」 -->
                  <span v-if="row.platformRoles.length" class="perm-role-tags">
                    <span v-for="rid in row.platformRoles" :key="rid" class="perm-role-tag">{{ roleNameOf(rid) }}</span>
                  </span>
                  <span v-else class="perm-muted">—</span>
                </td>
                <td class="perm-col-orgrole">
                  <!-- 组织角色：按「组织名（组织角色名）」顿号分隔平铺展示 -->
                  <span v-if="row.memberships.length" class="perm-orgrole-text">
                    {{ orgRoleTextOf(row) }}
                  </span>
                  <span v-else class="perm-muted">—</span>
                </td>
                <!-- 顺序必须与表头一致：状态 在 更新人 之前 -->
                <td class="perm-col-status">
                  <span class="perm-status" :class="'perm-status--' + row.status">{{ row.statusName }}</span>
                </td>
                <td>
                  <span class="perm-role-tag perm-role-tag--current">{{ row.updatedBy }}</span>
                </td>
                <td class="perm-muted">{{ row.updatedAt }}</td>
                <td class="perm-col-ops">
                  <button type="button" class="perm-link" @click="openRoleDrawer(row.userId)">设置角色</button>
                  <!-- 禁用/启用：已禁用的账号显示「启用」，正常账号显示「禁用」 -->
                  <button
                    v-if="row.status === 'disabled'"
                    type="button"
                    class="perm-link"
                    @click="toggleAccountDisabled(row, false)"
                  >启用</button>
                  <button
                    v-else
                    type="button"
                    class="perm-link perm-link--danger"
                    @click="toggleAccountDisabled(row, true)"
                  >禁用</button>
                </td>
              </tr>
            </template>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="7" class="perm-empty">没有匹配的成员</td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- 成员分页（属于「成员列表」Tab，须与表格同容器，避免打断 v-if/v-else-if 链） -->
        <footer v-if="filteredMembers.length" class="perm-footer">
          <span class="perm-total">共计 {{ filteredMembers.length }} 条</span>
          <div class="perm-pager">
            <button type="button" class="perm-page-btn" :disabled="memberPage <= 1" aria-label="上一页" @click="memberPage = Math.max(1, memberPage - 1)">‹</button>
            <template v-for="(p, idx) in memberPageItems" :key="`${p}-${idx}`">
              <span v-if="p === '…'" class="perm-page-ellipsis">…</span>
              <button v-else type="button" class="perm-page-btn" :class="{ 'is-active': p === memberPage }" @click="memberPage = p">{{ p }}</button>
            </template>
            <button type="button" class="perm-page-btn" :disabled="memberPage >= memberTotalPages" aria-label="下一页" @click="memberPage = Math.min(memberTotalPages, memberPage + 1)">›</button>
            <label class="perm-page-size">
              <span class="visually-hidden">每页条数</span>
              <SearchSelect
                v-model.number="memberPageSize"
                class="perm-page-ss"
                :options="PAGE_SIZE_OPTIONS"
                number
                small
              />
            </label>
          </div>
        </footer>
      </div>

      <!-- 功能权限矩阵区块已从页面移除（数据层与脚本逻辑保留，便于后续恢复） -->
    </section>

    <!-- 新建账号弹窗：基本信息 + 权限分配（平台角色与组织归属至少填一项） -->
    <Teleport to="body">
      <Transition name="perm-fade">
        <div v-if="createOpen" class="perm-modal-overlay" @click.self="closeCreateDialog">
          <div class="perm-modal">
            <header class="perm-modal-hd">
              <div class="perm-modal-hd-info">
                <h3 class="perm-modal-title">新建账号</h3>
                <p class="perm-modal-sub">平台级角色在此直接建号并设置角色；组织一般成员可由组织管理员发送邀请链接自助注册</p>
              </div>
              <button type="button" class="perm-dialog-close" @click="closeCreateDialog">&times;</button>
            </header>

            <div class="perm-modal-body">
              <!-- 基本信息 -->
              <h4 class="perm-form-group">基本信息</h4>
              <div class="perm-invite-grid">
                <div class="perm-field">
                  <label class="perm-label">用户名 <span class="perm-req">*</span></label>
                  <input v-model.trim="accountForm.username" type="text" class="perm-input perm-input--wide" placeholder="即登录账号，平台唯一" />
                </div>
                <div class="perm-field">
                  <label class="perm-label">密码 <span class="perm-req">*</span></label>
                  <input v-model.trim="accountForm.password" type="text" class="perm-input perm-input--wide" placeholder="必填，即初始登录密码" />
                </div>
                <div class="perm-field">
                  <label class="perm-label">确认密码 <span class="perm-req">*</span></label>
                  <input
                    v-model.trim="accountForm.confirmPassword"
                    type="text"
                    class="perm-input perm-input--wide"
                    :class="{ 'is-invalid': passwordMismatch }"
                    placeholder="请再次输入密码"
                  />
                  <span v-if="passwordMismatch" class="perm-field-error">两次输入的密码不一致</span>
                </div>
              </div>

              <!-- 权限分配：至少填一项 -->
              <h4 class="perm-form-group">
                权限分配
                <span class="perm-form-group-hint">平台角色与组织归属至少填一项</span>
              </h4>
              <div class="perm-invite-grid">
                <div class="perm-field perm-field--full">
                  <label class="perm-label">平台角色（可选，可多选）</label>
                  <div ref="roleMsRef" class="perm-ms">
                    <button
                      type="button"
                      class="perm-ms-trigger"
                      :class="{ 'is-open': roleMsOpen }"
                      @click="roleMsOpen = !roleMsOpen"
                    >
                      <span v-if="accountForm.platformRoles.length" class="perm-ms-tags">
                        <span v-for="rid in accountForm.platformRoles" :key="rid" class="perm-role-tag">{{ roleNameOf(rid) }}</span>
                      </span>
                      <span v-else class="perm-ms-placeholder">请选择平台角色</span>
                      <span class="perm-ms-arrow" aria-hidden="true">⌄</span>
                    </button>
                    <div v-if="roleMsOpen" class="perm-ms-panel">
                      <label v-for="r in PLATFORM_ROLES" :key="r.id" class="perm-ms-item">
                        <input
                          type="checkbox"
                          class="perm-check"
                          :checked="accountForm.platformRoles.includes(r.id)"
                          @change="toggleAccountRole(r.id, $event.target.checked)"
                        />
                        <span class="perm-ms-item-name">{{ r.name }}</span>
                        <span class="perm-ms-item-posts">{{ (r.posts || []).length ? r.posts.join('、') : '—' }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- 组织归属：可多条 -->
                <div class="perm-field perm-field--full">
                  <label class="perm-label">组织归属（可选，可多条）</label>
                  <table v-if="accountForm.orgMemberships.length" class="perm-table perm-table--sub">
                    <thead>
                      <tr>
                        <th>添加组织</th>
                        <th>组织角色</th>
                        <th class="perm-col-ops">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(m, idx) in accountForm.orgMemberships" :key="idx">
                        <td>{{ orgNameOf(m.orgId) }}</td>
                        <td>
                          <SearchSelect v-model="m.orgRole" class="perm-select" :options="orgRoleSelectOptions" small />
                        </td>
                        <td class="perm-col-ops">
                          <button type="button" class="perm-link perm-link--danger" @click="removeAccountOrg(idx)">移除</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else class="perm-block-empty">暂未加入任何组织</p>

                  <div class="perm-join-row">
                    <SearchSelect
                      v-model="accountJoinOrgId"
                      class="perm-select"
                      :options="accountJoinOrgSelectOptions"
                      placeholder="选择已有组织…"
                    />
                    <SearchSelect v-model="accountJoinOrgRole" class="perm-select" :options="orgRoleSelectOptions" />
                    <button type="button" class="perm-btn" :disabled="!accountJoinOrgId" @click="addAccountOrg">+ 添加组织</button>
                  </div>
                  <p class="perm-field-hint">
                    未找到目标组织？
                    <RouterLink class="perm-link" :to="{ name: 'org-list' }" target="_blank">前往组织管理新建组织</RouterLink>
                    ，建好后回到本页即可选择。
                  </p>
                </div>
              </div>

              <p v-if="accountMsg" class="perm-account-msg" :class="{ 'is-error': accountMsgError }">{{ accountMsg }}</p>
            </div>

            <footer class="perm-modal-ft">
              <button type="button" class="perm-btn" @click="closeCreateDialog">取消</button>
              <button type="button" class="perm-btn perm-btn--primary" @click="doCreateAccount">创建</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 设置角色抽屉：平台角色区 + 组织角色区，两个区块互不干扰 -->
    <Teleport to="body">
      <Transition name="perm-fade">
        <div v-if="roleDrawerRow" class="perm-drawer-overlay" @click.self="closeRoleDrawer">
          <aside class="perm-drawer">
            <header class="perm-drawer-hd">
              <div class="perm-drawer-hd-info">
                <h3 class="perm-drawer-title">设置角色</h3>
                <p class="perm-drawer-sub">
                  {{ roleDrawerRow.name }}
                  <span class="perm-drawer-login">{{ roleDrawerRow.username }}</span>
                  <span class="perm-status" :class="'perm-status--' + roleDrawerRow.status">{{ roleDrawerRow.statusName }}</span>
                </p>
              </div>
              <button type="button" class="perm-dialog-close" @click="closeRoleDrawer">&times;</button>
            </header>

            <div class="perm-drawer-body">
              <!-- 区块A：平台角色 -->
              <section class="perm-block">
                <header class="perm-block-hd">
                  <h4 class="perm-block-title">平台角色</h4>
                  <span class="perm-block-hint">可多选；各角色权限取并集</span>
                </header>
                <div class="perm-block-body">
                  <label
                    v-for="r in PLATFORM_ROLES"
                    :key="r.id"
                    class="perm-role-opt"
                    :class="{ 'is-checked': drawerRoles.includes(r.id) }"
                  >
                    <input
                      type="checkbox"
                      class="perm-check"
                      :checked="drawerRoles.includes(r.id)"
                      @change="toggleDrawerRole(r.id, $event.target.checked)"
                    />
                    <span class="perm-role-opt-info">
                      <span class="perm-role-opt-name">{{ r.name }}</span>
                      <span class="perm-role-opt-desc">{{ r.desc }}</span>
                    </span>
                  </label>
                  <p v-if="drawerRoles.length === 0" class="perm-block-empty">
                    未分配平台角色（若下方也无组织角色，则账号不合法）
                  </p>
                </div>
              </section>

              <!-- 区块B：组织角色 -->
              <section class="perm-block">
                <header class="perm-block-hd">
                  <h4 class="perm-block-title">组织角色</h4>
                  <span class="perm-block-hint">同一账号在不同组织可有不同角色</span>
                </header>
                <div class="perm-block-body">
                  <table v-if="drawerOrgs.length" class="perm-table perm-table--sub">
                    <thead>
                      <tr>
                        <th>所属组织</th>
                        <th>组织角色</th>
                        <th class="perm-col-ops">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="m in drawerOrgs" :key="m.orgId">
                        <!-- 组织名由 orgId 实时解析，避免草稿里存冗余副本导致显示为空/过期 -->
                        <td>{{ orgNameOf(m.orgId) }}</td>
                        <td>
                          <SearchSelect
                            :model-value="m.orgRole"
                            class="perm-select"
                            :options="orgRoleSelectOptions"
                            small
                            @change="changeDrawerOrgRole(m, $event)"
                          />
                        </td>
                        <td class="perm-col-ops">
                          <button type="button" class="perm-link perm-link--danger" @click="removeDrawerOrg(m)">移出组织</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else class="perm-block-empty">该账号未加入任何组织</p>

                  <!-- 添加组织 -->
                  <div class="perm-join-row">
                    <SearchSelect
                      v-model="joinOrgId"
                      class="perm-select"
                      :options="joinOrgSelectOptions"
                      placeholder="选择组织…"
                    />
                    <SearchSelect v-model="joinOrgRole" class="perm-select" :options="orgRoleSelectOptions" />
                    <button type="button" class="perm-btn" :disabled="!joinOrgId" @click="joinDrawerOrg">添加组织</button>
                  </div>
                </div>
              </section>
            </div>

            <footer class="perm-drawer-ft">
              <span v-if="drawerError" class="perm-drawer-error">{{ drawerError }}</span>
              <span v-else class="perm-dialog-hint">变更会记录更新人为 {{ CURRENT_OPERATOR }}</span>
              <div class="perm-dialog-ft-actions">
                <button type="button" class="perm-btn" @click="closeRoleDrawer">取消</button>
                <button type="button" class="perm-btn perm-btn--primary" @click="saveRoleDrawer">保存</button>
              </div>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <!-- 权限矩阵更新日志弹窗 -->
    <Teleport to="body">
      <Transition name="perm-fade">
        <div v-if="logOpen" class="perm-modal-overlay" @click.self="closeLogPanel">
          <div class="perm-modal">
            <header class="perm-modal-hd">
              <div class="perm-modal-hd-info">
                <h3 class="perm-modal-title">权限矩阵更新日志</h3>
                <p class="perm-modal-sub">共 {{ permissionLogs.length }} 条，最新在前</p>
              </div>
              <button type="button" class="perm-dialog-close" @click="closeLogPanel">&times;</button>
            </header>
            <div class="perm-modal-body">
              <table v-if="permissionLogs.length" class="perm-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>操作人</th>
                    <th>变更内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, idx) in permissionLogs" :key="`${log.at}-${idx}`">
                    <td class="perm-muted">{{ log.at }}</td>
                    <td>
                      <span class="perm-role-tag perm-role-tag--current">{{ log.operator }}</span>
                    </td>
                    <td>{{ log.summary }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="perm-block-empty">暂无变更记录</p>
            </div>
            <footer class="perm-modal-ft">
              <button type="button" class="perm-btn perm-btn--primary" @click="closeLogPanel">关闭</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import SearchSelect from '../../components/common/SearchSelect.vue'
import { getOrgs } from '../../data/orgStore.js'
import { avatarUrl } from '../../utils/avatar.js'
import { downloadCsv } from '../../utils/csvExport.js'
import { getCurrentUsername } from '../../data/orgData.js'
import {
  getAllAccounts,
  accountSourceName,
  createAccount,
  setAccountDisabled,
} from '../../data/accountData.js'
import {
  PLATFORM_ROLES,
  ORG_ROLE_OPTIONS,
  MATRIX_ROLES,
  MENU_PERMISSIONS,
  getMemberRoles,
  setMemberRoles,
  guardSelfPlatformAdminChange,
  getPermissionMatrix,
  setPermissionMatrix,
  resetPermissionMatrix,
  isMatrixCellLocked,
  matrixCellState,
  getPermissionLogs,
  logPermissionCell,
  logPermissionReset,
  clearPermissionLogs,
  countMatrixOverrides,
  getRole,
} from '../../data/permissionData.js'
import {
  getMembershipDetails,
  addOrgMember,
  removeOrgMember,
  setOrgRole,
} from '../../data/orgMembershipData.js'

/** 当前操作人标识（用户名）：所有留痕统一记用户名，而非角色名 */
const CURRENT_OPERATOR = getCurrentUsername()

const TABS = [
  { id: 'members', label: '成员列表' },
  // 「功能权限矩阵」Tab 已从页面移除（数据层与逻辑保留在 permissionData.js / 本文件脚本中，便于后续恢复）
]
const activeTab = ref('members')
const tip = ref('')
let tipTimer = null
function showTip(text) {
  tip.value = text
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => { tip.value = '' }, 4000)
}

/* ===== 概览：各平台角色成员数 ===== */
const bindings = ref(getMemberRoles())
// 筛选：平台角色 / 组织 / 账号状态
const memberFilter = ref('')
const orgFilter = ref('')
const statusFilter = ref('')

/* ===== 可搜索下拉的选项（替换原生 select，支持输入过滤） ===== */
/** 分页器选项 */
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10条/页' },
  { value: 20, label: '20条/页' },
  { value: 50, label: '50条/页' },
]
/** 账号状态选项 */
const STATUS_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'unassigned', label: '未分配' },
  { value: 'disabled', label: '已禁用' },
]
/** 平台角色筛选：带「全部」空值项 */
const platformRoleFilterOptions = computed(() => [
  { value: '', label: '全部平台角色' },
  ...PLATFORM_ROLES.map((r) => ({ value: r.id, label: r.name })),
])
/** 账号状态筛选：带「全部」空值项 */
const statusFilterOptions = computed(() => [
  { value: '', label: '全部状态' },
  ...STATUS_OPTIONS,
])
/** 组织角色选项（组织级角色，2 项） */
const orgRoleSelectOptions = computed(() => ORG_ROLE_OPTIONS.map((o) => ({ value: o.id, label: o.name })))

/** 组织筛选标签（只列有账号归属的组织，避免出现空选项） */
const orgFilterOptions = computed(() => {
  const used = new Set(memberRows.value.flatMap((r) => r.memberships.map((m) => m.orgId)))
  return getOrgs().filter((o) => used.has(o.id))
})
/** 组织筛选：带「全部」空值项 */
const orgFilterSelectOptions = computed(() => [
  { value: '', label: '全部组织' },
  ...orgFilterOptions.value.map((o) => ({ value: o.id, label: o.name })),
])
// 概览只统计各平台角色人数（多角色者分别计入）
const roleStats = computed(() => PLATFORM_ROLES.map((r) => ({
  ...r,
  count: bindings.value.filter((m) => (m.platformRoles || []).includes(r.id)).length,
})))

/** 概览卡片点击：按该平台角色筛选成员列表 */
function toggleRoleFilter(id) {
  memberFilter.value = memberFilter.value === id ? '' : id
}

/* ===== 成员列表 ===== */
const keyword = ref('')
/** 账号数据刷新触发器（getAllAccounts 读 localStorage，非响应式，需显式依赖） */
const accountVersion = ref(0)
/** 平台全部账号（含平台角色 / 组织数 / 状态），见 accountData.getAllAccounts */
const allUsers = computed(() => {
  void accountVersion.value
  return getAllAccounts()
})

/* ===== 成员列表：组织角色列 ===== */
/** 组织角色列文案：多条按「组织名（组织角色名）」顿号分隔 */
function orgRoleTextOf(row) {
  return (row.memberships || []).map((m) => `${m.orgName}（${m.orgRoleName}）`).join('、')
}

/** 成员行：主行账号级信息，memberships 用于组织角色列展示 */
const memberRows = computed(() => {
  const bindingById = new Map(bindings.value.map((m) => [m.userId, m]))
  const rows = allUsers.value.map((u) => {
    const b = bindingById.get(u.id)
    const memberships = getMembershipDetails(u.id)
    return {
      userId: u.id,
      // 姓名可能为空（新建账号只填用户名），回落显示用户名
      name: u.name || u.username || u.email || u.id,
      username: u.username || u.email || '—',
      memberships,
      orgNames: memberships.length ? memberships.map((m) => m.orgName).join('、') : '—',
      // 平台角色只含平台角色（组织角色在 memberships 里）
      platformRoles: u.platformRoles || b?.platformRoles || [],
      // 账号状态：正常 / 未分配 / 已禁用
      status: u.status || 'normal',
      statusName: u.statusName || '正常',
      accountSource: u.accountSource || 'builtin',
      accountSourceName: accountSourceName(u.accountSource || 'builtin'),
      // 最新一次更新：优先取角色绑定的留痕，其次取账号自身的留痕
      updatedBy: b?.updatedBy || u.updatedBy || '—',
      updatedAt: b?.updatedAt || u.updatedAt || '—',
    }
  })
  // 兜底：绑定表中存在但账号列表里没有的记录也展示，避免数据丢失后看不到
  const known = new Set(allUsers.value.map((u) => u.id))
  bindings.value.filter((b) => !known.has(b.userId)).forEach((b) => {
    rows.push({
      ...b, name: b.userId, username: '—', memberships: [], orgNames: '—',
      platformRoles: b.platformRoles || [], status: 'normal', statusName: '正常',
      accountSource: 'builtin', accountSourceName: '—',
      updatedBy: b.updatedBy || '—', updatedAt: b.updatedAt || '—',
    })
  })
  return rows
})

/** 禁用 / 启用账号（禁用后该账号无法登录，角色与组织归属保留） */
function toggleAccountDisabled(row, disabled) {
  const res = setAccountDisabled(row.userId, disabled, CURRENT_OPERATOR)
  if (!res.ok) {
    showTip(res.reason || '操作失败')
    return
  }
  accountVersion.value += 1
  showTip(disabled ? `已禁用账号「${row.username}」` : `已启用账号「${row.username}」`)
}

function clearMemberFilters() {
  memberFilter.value = ''
  orgFilter.value = ''
  statusFilter.value = ''
  keyword.value = ''
}

/** 导出成员列表：导出当前筛选结果，组织角色按「组织名（组织角色名）」多条合并 */
function exportMembers() {
  const columns = [
    { key: 'name', label: '用户名' },
    { key: 'platformRoleNames', label: '平台角色' },
    { key: 'orgRoleText', label: '组织角色' },
    { key: 'statusName', label: '状态' },
    { key: 'updatedBy', label: '更新人' },
    { key: 'updatedAt', label: '更新时间' },
  ]
  const rows = filteredMembers.value.map((row) => ({
    name: row.name,
    // 平台角色列只含平台角色，无则「—」（与表格一致）
    platformRoleNames: row.platformRoles.length
      ? row.platformRoles.map(roleNameOf).join('、')
      : '—',
    orgRoleText: row.memberships.length
      ? row.memberships.map((m) => `${m.orgName}（${m.orgRoleName}）`).join('、')
      : '—',
    statusName: row.statusName,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  }))
  downloadCsv('成员列表.csv', columns, rows)
  showTip(`已导出 ${rows.length} 条成员记录`)
}

const filteredMembers = computed(() => {
  const kw = keyword.value.toLowerCase()
  return memberRows.value.filter((row) => {
    if (memberFilter.value && !row.platformRoles.includes(memberFilter.value)) return false
    if (orgFilter.value && !row.memberships.some((m) => m.orgId === orgFilter.value)) return false
    if (statusFilter.value && row.status !== statusFilter.value) return false
    if (!kw) return true
    // 搜索支持：用户名
    return row.name.toLowerCase().includes(kw)
  })
})

/* ===== 成员分页 ===== */
const memberPage = ref(1)
const memberPageSize = ref(10)

const memberTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / memberPageSize.value)))

const paginatedMembers = computed(() => {
  const start = (memberPage.value - 1) * memberPageSize.value
  return filteredMembers.value.slice(start, start + memberPageSize.value)
})

/** 页码项：超过 7 页时折叠中间部分（与治理清单页一致） */
const memberPageItems = computed(() => {
  const total = memberTotalPages.value
  const cur = memberPage.value
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

// 筛选、搜索或每页条数变化后回到第 1 页，避免停留在越界页码
watch([keyword, memberFilter], () => { memberPage.value = 1 })
watch(memberPageSize, () => { memberPage.value = 1 })
// 结果集变小（如筛选后）导致当前页越界时，自动回退到最后一页
watch(memberTotalPages, (total) => {
  if (memberPage.value > total) memberPage.value = total
})

/** 角色名（未分配时返回「未分配」） */
function roleNameOf(roleId) {
  return getRole(roleId)?.name || '未分配'
}

/** 角色覆盖的岗位文案（仅作说明展示，不参与权限计算） */
function postsOf(roleId) {
  const posts = getRole(roleId)?.posts || []
  return posts.length ? posts.join('、') : '—'
}

/** 多个角色的覆盖岗位：合并去重后展示 */
function postsOfRoles(roleIds) {
  const all = (roleIds || []).flatMap((id) => getRole(id)?.posts || [])
  const uniq = [...new Set(all)]
  return uniq.length ? uniq.join('、') : '—'
}

/** 角色职责说明 */
function roleDescOf(roleId) {
  return getRole(roleId)?.desc || ''
}

/** 账号数据刷新：账号状态与角色绑定都读 localStorage，需显式触发重算 */
function refreshAccounts() {
  accountVersion.value += 1
  bindings.value = getMemberRoles()
}

/* ===== 设置角色抽屉：区块A 平台角色 + 区块B 组织角色 ===== */
/** 当前打开抽屉的账号 id（空串表示未打开） */
const roleDrawerUserId = ref('')
/** 抽屉内正在编辑的账号行 */
const roleDrawerRow = computed(() =>
  memberRows.value.find((r) => r.userId === roleDrawerUserId.value) || null)
/** 抽屉草稿：平台角色（本地编辑，保存时落库） */
const drawerRoles = ref([])
/** 抽屉草稿：组织归属 [{ orgId, orgRole }] */
const drawerOrgs = ref([])
/** 保存校验错误 */
const drawerError = ref('')
/** 待二次确认的移出组织（移出后账号将失去全部权限时） */
const pendingRemoveOrg = ref('')

/** 打开抽屉：把该账号当前的角色/组织归属读入草稿 */
function openRoleDrawer(userId) {
  roleDrawerUserId.value = userId
  const row = memberRows.value.find((r) => r.userId === userId)
  drawerRoles.value = [...(row?.platformRoles || [])]
  drawerOrgs.value = (row?.memberships || []).map((m) => ({ orgId: m.orgId, orgRole: m.orgRole }))
  drawerError.value = ''
  pendingRemoveOrg.value = ''
  joinOrgId.value = ''
  joinOrgRole.value = 'member'
}

function closeRoleDrawer() {
  roleDrawerUserId.value = ''
  drawerError.value = ''
  pendingRemoveOrg.value = ''
}

/** 勾选/取消某个平台角色（全部角色可自由叠加） */
function toggleDrawerRole(roleId, checked) {
  const set = new Set(drawerRoles.value)
  if (checked) set.add(roleId)
  else set.delete(roleId)
  drawerRoles.value = [...set]
  drawerError.value = ''
}

/* 区块B：组织角色 */
const joinOrgId = ref('')
const joinOrgRole = ref('member')

/** 可加入的组织：排除已在草稿里的 */
const joinableOrgs = computed(() =>
  getOrgs().filter((o) => !drawerOrgs.value.some((m) => m.orgId === o.id)))

/** 可加入的组织（角色设置抽屉的下拉选项） */
const joinOrgSelectOptions = computed(() =>
  joinableOrgs.value.map((o) => ({ value: o.id, label: o.name })))

/** 修改某组织的组织角色 */
function changeDrawerOrgRole(m, nextRole) {
  const idx = drawerOrgs.value.findIndex((x) => x.orgId === m.orgId)
  if (idx === -1) return
  drawerOrgs.value[idx] = { ...drawerOrgs.value[idx], orgRole: nextRole }
  drawerError.value = ''
}

/** 添加组织（草稿，保存时落库） */
function joinDrawerOrg() {
  if (!joinOrgId.value) return
  if (drawerOrgs.value.some((m) => m.orgId === joinOrgId.value)) return
  drawerOrgs.value = [...drawerOrgs.value, { orgId: joinOrgId.value, orgRole: joinOrgRole.value || 'member' }]
  joinOrgId.value = ''
  drawerError.value = ''
}

/**
 * 移出组织。
 * 若移出后该账号既无平台角色、又无其他组织，则需二次确认。
 */
function removeDrawerOrg(m) {
  const rest = drawerOrgs.value.filter((x) => x.orgId !== m.orgId)
  if (!drawerRoles.value.length && !rest.length) {
    if (pendingRemoveOrg.value !== m.orgId) {
      pendingRemoveOrg.value = m.orgId
      drawerError.value = '移出后该账号将既无平台角色也无组织角色，账号将不合法。请再次点击「移出组织」确认。'
      return
    }
  }
  drawerOrgs.value = rest
  pendingRemoveOrg.value = ''
  drawerError.value = ''
}

/** 保存：校验「至少一个平台角色或组织角色」，并落库（留痕记为当前平台管理员） */
function saveRoleDrawer() {
  const userId = roleDrawerUserId.value
  if (!userId) return
  // 铁律：两者皆空则不合法，禁止保存
  if (!drawerRoles.value.length && !drawerOrgs.value.length) {
    drawerError.value = '账号必须至少拥有一个平台角色或一个组织角色'
    return
  }
  // 平台管理员不能修改自己的平台角色
  const guard = guardSelfPlatformAdminChange(userId)
  if (!guard.ok) {
    drawerError.value = guard.reason
    return
  }
  // 平台角色可自由叠加，无需互斥校验

  const before = memberRows.value.find((r) => r.userId === userId)?.memberships || []
  const beforeIds = before.map((m) => m.orgId)
  const afterIds = drawerOrgs.value.map((m) => m.orgId)

  // 1) 平台角色
  const res = setMemberRoles(userId, { platformRoles: drawerRoles.value, operator: CURRENT_OPERATOR })
  if (!res.ok) {
    drawerError.value = res.reason
    return
  }
  // 2) 移出的组织
  let blocked = ''
  beforeIds.filter((id) => !afterIds.includes(id)).forEach((orgId) => {
    if (blocked) return
    const r = removeOrgMember(userId, orgId)
    if (!r.ok) blocked = r.reason
  })
  if (blocked) {
    refreshAccounts()
    drawerError.value = blocked
    return
  }
  // 3) 新增/变更的组织角色
  drawerOrgs.value.forEach((m) => {
    const prev = before.find((b) => b.orgId === m.orgId)
    if (!prev) addOrgMember(userId, m.orgId, m.orgRole, CURRENT_OPERATOR)
    else if (prev.orgRole !== m.orgRole) setOrgRole(userId, m.orgId, m.orgRole, CURRENT_OPERATOR)
  })

  refreshAccounts()
  closeRoleDrawer()
  showTip(`已保存「${roleDrawerRow.value?.name || ''}」的角色变更（更新人：${CURRENT_OPERATOR}）`)
}

/* ===== 功能权限矩阵（可编辑；平台管理员列锁定） ===== */
// 默认值来自「角色-功能」配置表（permissionData），手工调整落库为布尔值覆盖；
// 平台管理员列恒为全部权限，不接受修改。
const matrix = ref(getPermissionMatrix())

/** 单元格两态：'yes' 可访问(√) / 'no' 不可访问(空) */
function cellState(menuId, roleId) {
  return matrixCellState(matrix.value[menuId]?.[roleId])
}

/** 该单元格是否锁定（仅平台管理员列） */
function isCellLocked(menuId, roleId) {
  return isMatrixCellLocked(menuId, roleId)
}

/** 勾选/取消勾选：切换该角色对该菜单的访问权限（锁定单元格不响应），并写入更新日志 */
function toggleCell(menuId, roleId, checked) {
  if (isMatrixCellLocked(menuId, roleId)) return
  const before = cellState(menuId, roleId) === 'yes'
  const after = !!checked
  if (before === after) return
  matrix.value[menuId][roleId] = after
  setPermissionMatrix(matrix.value)
  logPermissionCell({ menuId, roleId, before, after, operator: CURRENT_OPERATOR })
  permissionLogs.value = getPermissionLogs()
}

/** 恢复默认：清除全部手工覆盖，回到配置表定义，并记录日志 */
function resetMatrix() {
  const count = countMatrixOverrides()
  matrix.value = resetPermissionMatrix()
  if (count > 0) {
    logPermissionReset({ count, operator: CURRENT_OPERATOR })
    permissionLogs.value = getPermissionLogs()
  }
  showTip(count > 0 ? `已恢复默认权限矩阵（清除 ${count} 项手工调整）` : '当前已是默认权限矩阵')
}

/* ===== 权限矩阵更新日志（弹窗） ===== */
const permissionLogs = ref(getPermissionLogs())
/** 日志弹窗开关 */
const logOpen = ref(false)

function toggleLogPanel() {
  logOpen.value = !logOpen.value
  if (logOpen.value) permissionLogs.value = getPermissionLogs()
}

function closeLogPanel() {
  logOpen.value = false
}

function doClearLogs() {
  clearPermissionLogs()
  permissionLogs.value = []
  showTip('权限矩阵更新日志已清空')
}

/* ===== 新建账号弹窗：基本信息 + 权限分配（平台角色与组织归属至少一项） ===== */
const createOpen = ref(false)
const accountMsg = ref('')
const accountMsgError = ref(false)
const accountForm = reactive({
  // 新建账号只填用户名 + 密码；姓名/手机邮箱为可选，表单未提供
  username: '',
  password: '',
  // 二次确认密码：仅前端校验，不落库
  confirmPassword: '',
  // 平台角色与组织归属至少填一项（账号合法性铁律）
  platformRoles: [],
  // 组织归属可多条：[{ orgId, orgRole }]
  orgMemberships: [],
})

/** 两次密码是否不一致（任一为空时不提示，由提交时的必填校验负责） */
const passwordMismatch = computed(() =>
  Boolean(accountForm.confirmPassword) && accountForm.password !== accountForm.confirmPassword)

/** 表单：平台角色下拉（面板内勾选） */
const roleMsOpen = ref(false)
const roleMsRef = ref(null)

/** 点击下拉外部时收起面板 */
function onDocClick(e) {
  if (!roleMsOpen.value) return
  if (roleMsRef.value && !roleMsRef.value.contains(e.target)) {
    roleMsOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

/** 勾选/取消某个平台角色（全部角色可自由叠加） */
function toggleAccountRole(roleId, checked) {
  const set = new Set(accountForm.platformRoles)
  if (checked) set.add(roleId)
  else set.delete(roleId)
  accountForm.platformRoles = [...set]
  accountMsg.value = ''
}

/* 组织归属（可多条） */
const accountJoinOrgId = ref('')
const accountJoinOrgRole = ref('member')

/** 可加入的组织：排除已添加的 */
const accountJoinableOrgs = computed(() =>
  getOrgs().filter((o) => !accountForm.orgMemberships.some((m) => m.orgId === o.id)))

/** 可加入的组织（新建账号表单的下拉选项） */
const accountJoinOrgSelectOptions = computed(() =>
  accountJoinableOrgs.value.map((o) => ({ value: o.id, label: o.name })))

/** 组织名（查不到时回落 id） */
function orgNameOf(orgId) {
  return getOrgs().find((o) => o.id === orgId)?.name || orgId || '—'
}

/** 加入一条组织归属（草稿，创建时一并落库） */
function addAccountOrg() {
  if (!accountJoinOrgId.value) return
  if (accountForm.orgMemberships.some((m) => m.orgId === accountJoinOrgId.value)) return
  accountForm.orgMemberships.push({ orgId: accountJoinOrgId.value, orgRole: accountJoinOrgRole.value || 'member' })
  accountJoinOrgId.value = ''
  accountMsg.value = ''
}

/** 移除一条组织归属 */
function removeAccountOrg(idx) {
  accountForm.orgMemberships.splice(idx, 1)
  accountMsg.value = ''
}

/** 打开新建账号弹窗：清掉上一次的草稿与提示 */
function openCreateDialog() {
  resetAccountForm()
  createOpen.value = true
}

/** 关闭新建账号弹窗 */
function closeCreateDialog() {
  createOpen.value = false
  roleMsOpen.value = false
}

function resetAccountForm() {
  accountForm.username = ''
  accountForm.password = ''
  accountForm.confirmPassword = ''
  accountForm.platformRoles = []
  accountForm.orgMemberships = []
  accountJoinOrgId.value = ''
  accountJoinOrgRole.value = 'member'
  accountMsg.value = ''
}

/** 创建账号：基本信息 + 平台角色 + 组织归属（至少一项） */
function doCreateAccount() {
  // 密码必填且两次一致（createAccount 侧仍保留留空自动生成的能力，仅本表单强制填写）
  if (!accountForm.password) {
    accountMsgError.value = true
    accountMsg.value = '请填写密码'
    return
  }
  if (accountForm.password !== accountForm.confirmPassword) {
    accountMsgError.value = true
    accountMsg.value = '两次输入的密码不一致，请重新确认'
    return
  }
  const res = createAccount({
    username: accountForm.username,
    password: accountForm.password,
    platformRoles: accountForm.platformRoles,
    orgMemberships: accountForm.orgMemberships,
    operator: CURRENT_OPERATOR,
  })
  accountMsgError.value = !res.ok
  if (!res.ok) {
    accountMsg.value = res.reason
    return
  }
  const roleText = res.user.platformRoles.length
    ? res.user.platformRoles.map(roleNameOf).join('、')
    : '无平台角色'
  const orgText = res.user.orgIds.length ? `，已加入 ${res.user.orgIds.map(orgNameOf).join('、')}` : ''

  // 平台角色已由 createAccount 写入共享角色存储，此处刷新成员列表即可
  bindings.value = getMemberRoles()
  accountVersion.value += 1
  closeCreateDialog()
  showTip(`账号「${res.user.name}」已创建（${roleText}）${orgText}`)
}
</script>

<style scoped>
.perm-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 外层 .admin-content 已有 24px padding，此处只补上下留白，避免左右叠加过宽 */
  padding: 0 0 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== 卡片 ===== */
.perm-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.perm-card-hd {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f3;
}
.perm-overview-hd { border-bottom: none; padding-bottom: 8px; }
.perm-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}
.perm-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b7280;
}

/* ===== 角色概览 KPI ===== */
.perm-kpi-row {
  display: grid;
  /* auto-fit + 1fr：卡片等宽铺满整行，数量变化时自动均分；窗口变窄才折行 */
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  padding: 4px 20px 18px;
}
.perm-kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 10px 14px;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.perm-kpi:hover { border-color: #bfdbfe; background: #f8fafc; }
.perm-kpi.is-active { border-color: #2563eb; background: #eff6ff; }
.perm-kpi-num {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.perm-kpi-label { font-size: 13px; font-weight: 500; color: #374151; }

/* ===== 工具条 ===== */
.perm-hd-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
/* 工具条左侧标题（原 Tab 按钮组位置） */
.perm-title--bar {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
/* 原 Tab 按钮组样式：矩阵 Tab 已移除，保留以便恢复 */
.perm-tabs { display: flex; gap: 6px; }
.perm-tab {
  padding: 7px 16px;
  font-size: 13px;
  font-family: inherit;
  color: #4b5563;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.perm-tab:hover { background: #e5e7eb; }
.perm-tab.is-active {
  color: #da203e;
  background: #fff;
  border-color: #da203e;
  font-weight: 600;
}
.perm-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.perm-hint { font-size: 12px; color: #9ca3af; }
.perm-dirty {
  padding: 3px 10px;
  font-size: 12px;
  color: #b45309;
  background: #fef3c7;
  border-radius: 10px;
}
.perm-input {
  width: 220px;
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s;
}
.perm-input:focus { border-color: #da203e; }
.perm-input::placeholder { color: #9ca3af; }
.perm-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.perm-btn:hover:not(:disabled) { border-color: #9ca3af; background: #f9fafb; }
.perm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.perm-btn--primary {
  color: #fff;
  background: #da203e;
  border-color: #da203e;
}
.perm-btn--primary:hover:not(:disabled) { background: #c11b36; border-color: #c11b36; }
/* 危险操作（删除确认） */
.perm-btn--danger {
  color: #fff;
  background: #dc2626;
  border-color: #dc2626;
}
.perm-btn--danger:hover:not(:disabled) { background: #b91c1c; border-color: #b91c1c; }

.perm-tip {
  margin: 0;
  padding: 10px 20px;
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;
}

/* ===== 表格 ===== */
.perm-table-wrap { overflow-x: auto; }
.perm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.perm-table th {
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  white-space: nowrap;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.perm-table td {
  padding: 10px 16px;
  color: #1f2937;
  border-bottom: 1px solid #f0f1f3;
  vertical-align: middle;
}
.perm-table tbody tr:hover { background: #fafbfc; }
.perm-table tbody tr.is-dirty { background: #fffbeb; }
.perm-table tbody tr.is-dirty:hover { background: #fef9e7; }
.perm-muted { color: #6b7280; }

/* ===== 成员列表：筛选栏 ===== */
.perm-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f1f3;
}
/* 三个筛选项一行展示：给定宽度而非撑满（组件根元素默认 width:100%） */
.perm-filter-ss { flex: 0 0 180px; width: 180px; }
.perm-filter-bar .perm-btn { flex-shrink: 0; }


/* ===== 成员列表：列宽 ===== */
.perm-col-num { width: 72px; text-align: center !important; }
.perm-col-status { width: 88px; text-align: center !important; }
/* 组织角色列：纯文字，多条顿号分隔 */
.perm-col-orgrole { min-width: 200px; }
.perm-orgrole-text {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}
.perm-col-ops { width: 200px; white-space: nowrap; }

/* ===== 成员列表：账号状态 ===== */
.perm-status {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 10px;
  white-space: nowrap;
}
.perm-status--normal { color: #166534; background: #dcfce7; }
.perm-status--unassigned { color: #b91c1c; background: #fee2e2; }
.perm-status--disabled { color: #6b7280; background: #f3f4f6; }

/* 子表格（抽屉/弹窗内的组织归属表共用） */
.perm-table--sub { font-size: 12px; }
.perm-table--sub th {
  padding: 8px 12px;
  font-size: 12px;
  background: #f9fafb;
}
.perm-table--sub td { padding: 8px 12px; }

.perm-empty {
  padding: 40px 0 !important;
  text-align: center;
  color: #9ca3af;
}

/* ===== 邀请表单：平台角色多选下拉 ===== */
.perm-ms { position: relative; }
.perm-ms-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 10px;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.perm-ms-trigger:hover { border-color: #9ca3af; }
.perm-ms-trigger.is-open { border-color: #da203e; }
.perm-ms-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.perm-ms-placeholder { flex: 1; color: #9ca3af; }
.perm-ms-arrow {
  flex-shrink: 0;
  font-size: 14px;
  color: #9ca3af;
  transition: transform 0.15s;
}
.perm-ms-trigger.is-open .perm-ms-arrow { transform: rotate(180deg); }

.perm-ms-panel {
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);
}
.perm-ms-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.perm-ms-item:hover { background: #f9fafb; }
.perm-ms-item-name { font-size: 13px; color: #1f2937; white-space: nowrap; }
.perm-ms-item-posts {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 成员列表：平台角色标签（多角色时并排展示多个卡片） */
.perm-role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.perm-role-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 10px;
  white-space: nowrap;
}
/* 弹窗候选行：展示成员当前已有角色（次要信息，弱化显示） */
.perm-role-tag--current {
  color: #6b7280;
  background: #f3f4f6;
}
/* 组织标签：与平台角色标签区分（绿色系） */
.perm-role-tag--org {
  color: #0f766e;
  background: #f0fdfa;
}

/* ===== 表格通用 ===== */
.perm-user { display: flex; align-items: center; gap: 8px; }
.perm-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #9ca3af;
  border-radius: 50%;
  flex-shrink: 0;
}
/* 真实头像图片：裁成圆形，保留底色避免透明缝隙 */
.perm-avatar--img {
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #eef0f3;
}
.perm-user-name { font-weight: 500; color: #111827; }

.perm-select {
  min-width: 132px;
  /* 与 .perm-btn / .perm-input 统一为 32px，避免同一行控件高度参差 */
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.perm-select:focus { border-color: #da203e; }

/* ===== 权限矩阵 ===== */
.perm-table--matrix th,
.perm-table--matrix td { border-right: 1px solid #f0f1f3; }
.perm-table--matrix th:last-child,
.perm-table--matrix td:last-child { border-right: none; }
.perm-col-menu { min-width: 300px; }
.perm-col-role {
  width: 96px;
  text-align: center !important;
}
.perm-table--matrix thead th.perm-col-role {
  display: table-cell;
  vertical-align: bottom;
}
.perm-role-name { display: block; font-weight: 600; color: #111827; }
.perm-role-group { display: block; margin-top: 2px; font-size: 11px; font-weight: 400; color: #9ca3af; }
.perm-menu-name { display: block; font-weight: 500; color: #111827; }
.perm-menu-desc {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.5;
  color: #9ca3af;
}
.perm-check {
  width: 15px;
  height: 15px;
  accent-color: #da203e;
  cursor: pointer;
}
.perm-check:disabled { cursor: not-allowed; opacity: 0.6; }

/* ===== 功能权限矩阵（只读三态） ===== */
.perm-matrix-wrap { display: flex; flex-direction: column; }
.perm-matrix-tip {
  margin: 0;
  padding: 10px 20px;
  font-size: 12px;
  line-height: 1.8;
  color: #6b7280;
  background: #fafbfc;
  border-bottom: 1px solid #f0f1f3;
}
/* 列分组：组织级 → 平台级，用左侧分隔线区分 */
.perm-table--matrix th.is-group-start,
.perm-table--matrix td.is-group-start {
  border-left: 2px solid #e5e7eb;
}

/* 单元格：勾选框居中 */
.perm-table--matrix td.perm-col-role { text-align: center; }

/* ===== 新建账号弹窗 ===== */
/* 必填星号 */
.perm-req { color: #da203e; }
/* 校验失败：输入框描红 + 字段级错误提示 */
.perm-input.is-invalid {
  border-color: #da203e;
  background: #fff5f6;
}
.perm-field-error {
  font-size: 12px;
  line-height: 1.6;
  color: #da203e;
}
/* 表单分组标题：基本信息 / 权限分配 */
.perm-form-group {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 12px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #f0f1f3;
}
.perm-form-group:not(:first-of-type) { margin-top: 22px; }
.perm-form-group-hint {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}
/* 字段下方辅助说明 */
.perm-field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #9ca3af;
}
/* 建号结果提示 */
.perm-account-msg {
  margin: 14px 0 0;
  padding: 9px 12px;
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 6px;
}
.perm-account-msg.is-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}
.perm-invite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.perm-field { display: flex; flex-direction: column; gap: 6px; }
.perm-field--full { grid-column: 1 / -1; }
.perm-label { font-size: 13px; font-weight: 500; color: #374151; }
.perm-select--wide,
.perm-input--wide { width: 100%; min-width: 0; }

/* 行内文字操作 */
.perm-link {
  padding: 0;
  margin-right: 10px;
  font-size: 13px;
  font-family: inherit;
  color: #da203e;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
/* 最后一个不再留右边距，避免单元格右侧出现多余空白 */
.perm-link:last-child { margin-right: 0; }
.perm-link:hover { text-decoration: underline; }
.perm-link--danger { color: #dc2626; }

/* ===== 分页 ===== */
.perm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-top: 1px solid #f0f1f3;
}
.perm-total { font-size: 13px; color: #6b7280; }
.perm-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.perm-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.perm-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}
.perm-page-btn.is-active {
  color: #fff;
  background: #da203e;
  border-color: #da203e;
}
.perm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.perm-page-ellipsis {
  padding: 0 4px;
  font-size: 13px;
  color: #9ca3af;
}
.perm-page-size { display: inline-flex; align-items: center; }
/* 分页器下拉：给定宽度（组件根元素默认 width:100%），外观沿用原 select 的设定 */
.perm-page-ss {
  width: 96px;
  height: 32px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}
.perm-page-ss.is-open { border-color: #da203e; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ===== 组织归属弹窗 ===== */
.perm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(15, 23, 42, 0.45);
}
.perm-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  max-height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}
.perm-modal-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f3;
}
.perm-modal-hd-info { min-width: 0; }
.perm-modal-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.perm-modal-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 13px;
  color: #374151;
}
.perm-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 20px 16px;
}
.perm-modal-ft {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #f0f1f3;
}

/* ===== 设置角色抽屉 ===== */
.perm-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.45);
}
.perm-drawer {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  height: 100%;
  background: #fff;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}
.perm-drawer-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f3;
}
.perm-drawer-hd-info { min-width: 0; }
.perm-drawer-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.perm-drawer-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 13px;
  color: #374151;
}
.perm-drawer-login { font-size: 12px; color: #9ca3af; }

.perm-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 区块：平台角色 / 组织角色，互不干扰 */
.perm-block {
  border: 1px solid #eef0f3;
  border-radius: 10px;
  overflow: hidden;
}
.perm-block-hd {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 14px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f1f3;
}
.perm-block-title { margin: 0; font-size: 14px; font-weight: 600; color: #111827; }
.perm-block-hint { font-size: 12px; color: #9ca3af; }
.perm-block-body { padding: 10px 14px 14px; }
.perm-block-empty {
  margin: 6px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

/* 平台角色可选项 */
.perm-role-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.perm-role-opt:hover { background: #f9fafb; }
.perm-role-opt.is-checked { background: #fef2f2; }
.perm-role-opt .perm-check { margin-top: 2px; }
.perm-role-opt-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.perm-role-opt-name { font-size: 13px; font-weight: 500; color: #111827; }
.perm-role-opt-desc { font-size: 12px; line-height: 1.5; color: #9ca3af; }

/* 添加组织一行 */
.perm-join-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eef0f3;
}
.perm-join-row .perm-select { flex: 1; min-width: 130px; }

.perm-drawer-ft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border-top: 1px solid #f0f1f3;
}
.perm-drawer-error {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #b91c1c;
}

.perm-dialog-close {
  padding: 0 4px;
  font-size: 22px;
  line-height: 1;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}
.perm-dialog-close:hover { color: #4b5563; }
.perm-dialog-hint { font-size: 12px; color: #9ca3af; }
.perm-dialog-ft-actions { display: flex; gap: 8px; }

/* 抽屉淡入淡出 */
.perm-fade-enter-active,
.perm-fade-leave-active { transition: opacity 0.18s ease; }
.perm-fade-enter-from,
.perm-fade-leave-to { opacity: 0; }
</style>
