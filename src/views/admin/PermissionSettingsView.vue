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
        <div class="perm-tabs" role="tablist">
          <button
            v-for="t in TABS"
            :key="t.id"
            type="button"
            class="perm-tab"
            :class="{ 'is-active': activeTab === t.id }"
            @click="activeTab = t.id"
          >{{ t.label }}</button>
        </div>

        <div class="perm-bar-actions">
          <!-- 成员列表：搜索 + 导出 + 新建账号 -->
          <template v-if="activeTab === 'members'">
            <input v-model.trim="keyword" type="text" class="perm-input" placeholder="搜索成员姓名 / 组织" />
            <button type="button" class="perm-btn" @click="exportMembers">导出成员列表</button>
            <button type="button" class="perm-btn perm-btn--primary" @click="openCreateDialog">新建账号</button>
          </template>
          <!-- 功能权限矩阵：更新日志 + 恢复默认 -->
          <template v-else-if="activeTab === 'matrix'">
            <button type="button" class="perm-btn" @click="toggleLogPanel">
              更新日志{{ permissionLogs.length ? `（${permissionLogs.length}）` : '' }}
            </button>
            <button type="button" class="perm-btn" @click="resetMatrix">恢复默认</button>
          </template>
          <!-- 组织列表：搜索 + 新建组织 -->
          <template v-else-if="activeTab === 'orgs'">
            <input v-model.trim="orgKeyword" type="text" class="perm-input" placeholder="搜索组织名称 / 行业" />
            <button type="button" class="perm-btn perm-btn--primary" @click="openOrgCreate">新建组织</button>
          </template>
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
                  <!-- 平台管理员账号一律不可禁用/启用（含自己）：不展示该按钮，改为锁定说明 -->
                  <span v-if="isPlatformAdminRow(row)" class="perm-muted">不可禁用</span>
                  <!-- 禁用/启用：已禁用的账号显示「启用」，正常账号显示「禁用」 -->
                  <button
                    v-else-if="row.status === 'disabled'"
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

      <!-- 功能权限矩阵：列分两组（组织级 / 平台级），单元格两态 √ / 空 -->
      <div v-else-if="activeTab === 'matrix'" class="perm-matrix-wrap">
        <p class="perm-matrix-tip">
          勾选表示该角色可访问对应功能；平台管理员列恒为全部权限，不可修改。
        </p>
        <div class="perm-table-wrap">
          <table class="perm-table perm-table--matrix">
            <thead>
              <tr>
                <th class="perm-col-menu">功能菜单</th>
                <th
                  v-for="r in MATRIX_ROLES"
                  :key="r.id"
                  class="perm-col-role"
                  :class="{ 'is-group-start': r.id === 'audit-expert' }"
                  :title="r.desc"
                >
                  <!-- 两行：主标题=角色名，副标题=覆盖岗位 -->
                  <span class="perm-role-name">{{ r.name }}</span>
                  <span class="perm-role-group">{{ (r.posts || []).length ? r.posts.join('、') : '—' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in MENU_PERMISSIONS" :key="menu.id">
                <td class="perm-col-menu">
                  <span class="perm-menu-name">{{ menu.name }}</span>
                  <span class="perm-menu-desc">{{ menu.desc }}</span>
                </td>
                <td
                  v-for="r in MATRIX_ROLES"
                  :key="r.id"
                  class="perm-col-role"
                  :class="{ 'is-group-start': r.id === 'audit-expert' }"
                >
                  <!-- 平台管理员：恒为全部权限，不可改 -->
                  <input
                    v-if="isCellLocked(menu.id, r.id)"
                    type="checkbox"
                    class="perm-check"
                    checked
                    disabled
                    :title="`${r.name}恒为全部权限，不可修改`"
                    :aria-label="`${r.name} · ${menu.name}：可访问（锁定）`"
                  />
                  <!-- 其余单元格：勾选框 -->
                  <input
                    v-else
                    type="checkbox"
                    class="perm-check"
                    :checked="cellState(menu.id, r.id) === 'yes'"
                    :title="`${r.name} · ${menu.name}：${cellState(menu.id, r.id) === 'yes' ? '已授予访问权限' : '未授予访问权限'}`"
                    :aria-label="`${r.name} · ${menu.name}：${cellState(menu.id, r.id) === 'yes' ? '可访问' : '不可访问'}`"
                    @change="toggleCell(menu.id, r.id, $event.target.checked)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 组织列表：平台全部组织（含内置）的管理视角。
           与「组织管理」页的区别：那边是「我的组织」（只列自己所属），
           这里供平台管理员查看/创建/删除全平台组织。 -->
      <div v-else-if="activeTab === 'orgs'" class="perm-orgs-wrap">
        <div class="perm-table-wrap">
          <table class="perm-table">
            <thead>
              <tr>
                <th>组织名称</th>
                <th>所属行业</th>
                <th>创建人</th>
                <th class="perm-col-num">管理员</th>
                <th class="perm-col-num">成员</th>
                <th>创建时间</th>
                <th class="perm-col-ops">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in paginatedOrgs" :key="o.id">
                <td class="perm-org-name">{{ o.name }}</td>
                <td>{{ o.industry || '—' }}</td>
                <td class="perm-muted">{{ o.creatorLabel }}</td>
                <td class="perm-col-num">{{ o.adminCount }}</td>
                <td class="perm-col-num">{{ o.memberCount }}</td>
                <td class="perm-muted">{{ o.createdAt || '—' }}</td>
                <td class="perm-col-ops">
                  <!-- 仅「平台管理员创建的组织」可删；成员创建的组织由其组织管理员在
                       「组织管理」中自行删除，平台侧不越权。 -->
                  <button
                    v-if="o.canDelete"
                    type="button"
                    class="perm-link perm-link--danger"
                    @click="askDeleteOrg(o)"
                  >删除</button>
                  <span v-else class="perm-muted" :title="o.isBuiltin ? '系统预置组织，不可删除' : '由组织成员创建，请由该组织的管理员在「组织管理」中删除'">
                    {{ o.isBuiltin ? '不可删除' : '组织自管' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!orgRows.length" class="perm-block-empty">暂无组织</p>

          <!-- 组织分页（属于「组织列表」Tab，与表格同容器） -->
          <footer v-if="orgRows.length" class="perm-footer">
            <span class="perm-total">共计 {{ orgRows.length }} 条</span>
            <div class="perm-pager">
              <button type="button" class="perm-page-btn" :disabled="orgPage <= 1" aria-label="上一页" @click="orgPage = Math.max(1, orgPage - 1)">‹</button>
              <template v-for="(p, idx) in orgPageItems" :key="`${p}-${idx}`">
                <span v-if="p === '…'" class="perm-page-ellipsis">…</span>
                <button v-else type="button" class="perm-page-btn" :class="{ 'is-active': p === orgPage }" @click="orgPage = p">{{ p }}</button>
              </template>
              <button type="button" class="perm-page-btn" :disabled="orgPage >= orgTotalPages" aria-label="下一页" @click="orgPage = Math.min(orgTotalPages, orgPage + 1)">›</button>
              <label class="perm-page-size">
                <span class="visually-hidden">每页条数</span>
                <SearchSelect
                  v-model.number="orgPageSize"
                  class="perm-page-ss"
                  :options="PAGE_SIZE_OPTIONS"
                  number
                  small
                />
              </label>
            </div>
          </footer>
        </div>
      </div>
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
                  <input
                    v-model.trim="accountForm.password"
                    type="password"
                    class="perm-input perm-input--wide"
                    autocomplete="new-password"
                    placeholder="必填，即初始登录密码"
                  />
                </div>
                <div class="perm-field">
                  <label class="perm-label">确认密码 <span class="perm-req">*</span></label>
                  <input
                    v-model.trim="accountForm.confirmPassword"
                    type="password"
                    class="perm-input perm-input--wide"
                    autocomplete="new-password"
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

                <!-- 组织归属：可多条 —— 表格末行常驻「选择组织加入…」
                     交互：表格最后一行永远是待选行，直接选组织即加入（不必先点「添加组织」按钮），
                     加入后该行变为正式行、末尾自动补出新的待选行。
                     角色默认「一般人员」，需要设管理员时在该行的角色下拉里改。 -->
                <div class="perm-field perm-field--full">
                  <label class="perm-label">组织归属（可选，可多条）</label>
                  <table class="perm-table perm-table--sub">
                    <thead>
                      <tr>
                        <th>组织</th>
                        <th>组织角色</th>
                        <th class="perm-col-ops">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(m, idx) in accountForm.orgMemberships" :key="m.orgId">
                        <td>
                          {{ orgNameOf(m.orgId) }}
                          <span v-if="isInlineCreatedOrg(m.orgId)" class="perm-tag perm-tag--lock">新建</span>
                        </td>
                        <td>
                          <!-- 内嵌新建的组织锁定为「组织管理员」：需求要求新建组织必须带一名管理员，
                               而本页新建时管理员就是当前这个新账号，故不允许改角色 -->
                          <!-- ref 按 orgId 登记：选完组织后要把焦点引到这一行的角色下拉上 -->
                          <SearchSelect
                            :ref="(el) => setAccountRoleRef(m.orgId, el)"
                            v-model="m.orgRole"
                            class="perm-select"
                            :options="orgRoleSelectOptions"
                            :disabled="isInlineCreatedOrg(m.orgId)"
                            small
                          />
                        </td>
                        <td class="perm-col-ops">
                          <span v-if="isInlineCreatedOrg(m.orgId)" class="perm-lock-hint" title="新建组织必须由当前账号担任组织管理员">
                            必为管理员
                          </span>
                          <button v-else type="button" class="perm-link perm-link--danger" @click="removeAccountOrg(idx)">移除</button>
                        </td>
                      </tr>
                      <!-- 常驻待选行：选中即加入（见 addAccountOrgFromPick） -->
                      <tr class="perm-row--pending">
                        <td>
                          <SearchSelect
                            :model-value="pendingAccountOrgId"
                            class="perm-select"
                            :options="orgOptionsForPending(accountForm.orgMemberships)"
                            :placeholder="pendingAccountOrgHint"
                            :empty-text="pendingAccountOrgEmptyText"
                            small
                            @change="addAccountOrgFromPick($event)"
                          />
                        </td>
                        <td class="perm-muted">加入后可选角色</td>
                        <td class="perm-col-ops perm-muted">—</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="perm-org-actions">
                    <span class="perm-field-hint">
                      未找到目标组织？
                      <button type="button" class="perm-link perm-link--btn" @click="openOrgDialog">
                        + 新建组织
                      </button>
                      （在本页直接创建，建完自动加入下方列表）
                    </span>
                  </div>
                </div>
              </div>

              <p v-if="accountMsg" class="perm-account-msg" :class="{ 'is-error': accountMsgError }">{{ accountMsg }}</p>
            </div>

            <footer class="perm-modal-ft">
              <button type="button" class="perm-btn" @click="closeCreateDialog">取消</button>
              <button type="button" class="perm-btn perm-btn--primary" @click="doCreateAccount">创建</button>
            </footer>
          </div>

          <!-- 内嵌「新建组织」：建完直接回到建号弹窗并自动选中，不跳页、不开新标签。
               起因：原流程要跳到「组织管理」页建组织，但那边建组织时需指定「组织管理员」，
               而管理员账号正是本页下一步才创建的 —— 选不到人只能留空，
               建完还得手动切回来。内嵌后这一步不再需要（下一步就是给账号分配组织角色）。 -->
          <div v-if="orgDialogOpen" class="perm-modal-overlay perm-modal-overlay--nested" @click.self="closeOrgDialog">
            <div class="perm-modal perm-modal--sm">
              <header class="perm-modal-hd">
                <div class="perm-modal-hd-info">
                  <h3 class="perm-modal-title">新建组织</h3>
                  <p class="perm-modal-sub">创建后会自动填入上方「组织归属」列表，并可继续为其选择组织角色</p>
                </div>
                <button type="button" class="perm-dialog-close" @click="closeOrgDialog">&times;</button>
              </header>

              <div class="perm-modal-body">
                <div class="perm-invite-grid">
                  <div class="perm-field">
                    <label class="perm-label">组织名称 <span class="perm-req">*</span></label>
                    <input v-model.trim="orgForm.name" type="text" class="perm-input perm-input--wide" placeholder="请输入组织全称" />
                  </div>
                  <div class="perm-field">
                    <label class="perm-label">所属行业</label>
                    <SearchSelect v-model="orgForm.industry" class="perm-select" :options="industryOptions" />
                  </div>
                  <div class="perm-field perm-field--full">
                    <label class="perm-label">组织简介</label>
                    <input v-model.trim="orgForm.description" type="text" class="perm-input perm-input--wide" placeholder="选填，简要说明组织情况" />
                  </div>
                </div>
                <p v-if="orgMsg" class="perm-account-msg" :class="{ 'is-error': true }">{{ orgMsg }}</p>
              </div>

              <footer class="perm-modal-ft">
                <button type="button" class="perm-btn" @click="closeOrgDialog">取消</button>
                <button type="button" class="perm-btn perm-btn--primary" @click="doCreateOrgInline">创建并加入</button>
              </footer>
            </div>
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
              <!-- 平台管理员账号：仅平台角色只读（避免管理员之间互相改权）。
                   「组织归属」已放开 —— 平台角色与组织角色是两套独立体系，
                   平台管理员也可以担任某组织的管理员。 -->
              <p v-if="drawerRolesLocked" class="perm-lock-tip">
                该账号为<strong>平台管理员</strong>，其<strong>平台角色</strong>不可修改（平台管理员之间也不能互相修改）；下方组织归属可以调整。
              </p>

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
                    :class="{ 'is-checked': drawerRoles.includes(r.id), 'is-locked': drawerRolesLocked }"
                  >
                    <input
                      type="checkbox"
                      class="perm-check"
                      :checked="drawerRoles.includes(r.id)"
                      :disabled="drawerRolesLocked"
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
                  <!-- 与「新建账号」弹窗同一交互：末行常驻待选行，选中即加入 -->
                  <table class="perm-table perm-table--sub">
                    <thead>
                      <tr>
                        <th>组织</th>
                        <th>组织角色</th>
                        <th class="perm-col-ops">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(m, idx) in drawerOrgs" :key="m.orgId">
                        <!-- 组织名由 orgId 实时解析，避免草稿里存冗余副本导致显示为空/过期 -->
                        <td>{{ orgNameOf(m.orgId) }}</td>
                        <td>
                          <!-- ref 按 orgId 登记：选完组织后要把焦点引到这一行的角色下拉上 -->
                          <SearchSelect
                            :ref="(el) => setDrawerRoleRef(m.orgId, el)"
                            :model-value="m.orgRole"
                            class="perm-select"
                            :options="orgRoleSelectOptions"
                            small
                            @change="changeDrawerOrgRole(m, $event)"
                          />
                        </td>
                        <td class="perm-col-ops">
                          <button
                            type="button"
                            class="perm-link perm-link--danger"
                            @click="removeDrawerOrg(idx)"
                          >移出组织</button>
                        </td>
                      </tr>
                      <!-- 常驻待选行：选中即加入（见 addDrawerOrgFromPick） -->
                      <tr class="perm-row--pending">
                        <td>
                          <SearchSelect
                            :model-value="pendingDrawerOrgId"
                            class="perm-select"
                            :options="orgOptionsForDrawerPending(drawerOrgs)"
                            :placeholder="pendingDrawerOrgHint"
                            :empty-text="pendingDrawerOrgEmptyText"
                            small
                            @change="addDrawerOrgFromPick($event)"
                          />
                        </td>
                        <td class="perm-muted">加入后可选角色</td>
                        <td class="perm-col-ops perm-muted">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <footer class="perm-drawer-ft">
              <span v-if="drawerError" class="perm-drawer-error">{{ drawerError }}</span>
              <span v-else-if="drawerRolesLocked" class="perm-dialog-hint">平台角色只读；组织归属的变更会记录更新人为 {{ CURRENT_OPERATOR }}</span>
              <span v-else class="perm-dialog-hint">变更会记录更新人为 {{ CURRENT_OPERATOR }}</span>
              <div class="perm-dialog-ft-actions">
                <button type="button" class="perm-btn" @click="closeRoleDrawer">取消</button>
                <button
                  type="button"
                  class="perm-btn perm-btn--primary"
                  @click="saveRoleDrawer"
                >保存</button>
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

    <!-- ===== 新建组织（组织列表 Tab）=====
         与「组织管理」页的新建组织刻意不同：这里需**指定他人**当管理员，
         创建者本身不加入该组织 —— 本页是平台视角的组织管理，不是「我的组织」。 -->
    <Teleport to="body">
      <Transition name="perm-fade">
        <div v-if="orgCreateOpen" class="perm-modal-overlay" @click.self="closeOrgCreate">
          <div class="perm-modal perm-modal--sm">
            <header class="perm-modal-hd">
              <div class="perm-modal-hd-info">
                <h3 class="perm-modal-title">新建组织</h3>
                <p class="perm-modal-sub">需指定一名组织管理员；创建者不会自动加入该组织</p>
              </div>
              <button type="button" class="perm-dialog-close" @click="closeOrgCreate">&times;</button>
            </header>

            <div class="perm-modal-body">
              <div class="perm-invite-grid">
                <div class="perm-field">
                  <label class="perm-label">组织名称 <span class="perm-req">*</span></label>
                  <input v-model.trim="orgCreateForm.name" type="text" class="perm-input perm-input--wide" placeholder="请输入组织全称" />
                </div>
                <div class="perm-field">
                  <label class="perm-label">所属行业</label>
                  <SearchSelect v-model="orgCreateForm.industry" class="perm-select" :options="industryOptions" />
                </div>
                <div class="perm-field perm-field--full">
                  <label class="perm-label">组织管理员 <span class="perm-req">*</span></label>
                  <SearchSelect
                    v-model="orgCreateForm.adminUserId"
                    class="perm-select"
                    :options="orgAdminCandidates"
                    value-key="id"
                    label-key="name"
                    placeholder="请选择组织管理员…"
                  />
                  <p class="perm-field-hint">必选。指定的账号将成为本组织管理员（新建组织必须有一名管理员）</p>
                </div>
                <div class="perm-field perm-field--full">
                  <label class="perm-label">组织简介</label>
                  <input v-model.trim="orgCreateForm.description" type="text" class="perm-input perm-input--wide" placeholder="选填，简要说明组织情况" />
                </div>
              </div>
              <p v-if="orgCreateMsg" class="perm-account-msg" :class="{ 'is-error': orgCreateMsgError }">{{ orgCreateMsg }}</p>
            </div>

            <footer class="perm-modal-ft">
              <button type="button" class="perm-btn" @click="closeOrgCreate">取消</button>
              <button type="button" class="perm-btn perm-btn--primary" @click="doCreateOrgFromAdmin">创建组织</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== 删除组织二次确认（组织列表 Tab）=====
         与「组织管理」页的删除确认区分：此处仅平台管理员可达，且只允许删
         「平台管理员创建的组织」；成员创建的组织由其在「组织管理」中自行删除。
         级联清理成员关系由数据层 dissolveOrgByPlatformAdmin 完成。 -->
    <Teleport to="body">
      <Transition name="perm-fade">
        <div v-if="orgDeleteTarget" class="perm-modal-overlay" @click.self="orgDeleteTarget = null">
          <div class="perm-modal perm-modal--sm">
            <header class="perm-modal-hd">
              <div class="perm-modal-hd-info">
                <h3 class="perm-modal-title">删除组织</h3>
              </div>
              <button type="button" class="perm-dialog-close" @click="orgDeleteTarget = null">&times;</button>
            </header>

            <div class="perm-modal-body">
              <p class="perm-del-warn">确定要删除组织「<b>{{ orgDeleteTarget.name }}</b>」吗？</p>
              <ul class="perm-del-list">
                <li>该组织的成员关系将一并清除，相关人员会失去此组织的权限</li>
                <li>此操作不可恢复</li>
              </ul>
              <p v-if="orgDeleteMsg" class="perm-account-msg is-error">{{ orgDeleteMsg }}</p>
            </div>

            <footer class="perm-modal-ft">
              <button type="button" class="perm-btn" @click="orgDeleteTarget = null">取消</button>
              <button type="button" class="perm-btn perm-btn--danger" @click="confirmDeleteOrg">确认删除</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import SearchSelect from '../../components/common/SearchSelect.vue'
import { getOrgs, createOrg, deleteOrgRaw, isOrgCreatedByPlatformAdmin, INDUSTRY_OPTIONS } from '../../data/orgStore.js'
import { avatarUrl } from '../../utils/avatar.js'
import { downloadCsv } from '../../utils/csvExport.js'
import { getCurrentUsername, getCurrentUser, ORGS } from '../../data/orgData.js'
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
  guardPlatformAdminChange,
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
  getOrgAdminCount,
  getOrgMemberships,
  addOrgMember,
  removeOrgMember,
  removeOrgMemberships,
  setOrgRole,
  dissolveOrgByPlatformAdmin,
} from '../../data/orgMembershipData.js'

/** 当前操作人标识（用户名）：所有留痕统一记用户名，而非角色名 */
const CURRENT_OPERATOR = getCurrentUsername()

const TABS = [
  { id: 'members', label: '成员列表' },
  { id: 'matrix', label: '功能权限矩阵' },
  { id: 'orgs', label: '组织列表' },
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
/** 某行是否持有 platform-admin 角色（该账号的**平台角色**不可改） */
function isPlatformAdminRow(row) {
  return (row?.platformRoles || []).includes('platform-admin')
}
/**
 * 抽屉目标是平台管理员时，仅**平台角色**只读（防管理员之间互相改权）；
 * 「组织归属」不锁 —— 平台角色与组织角色是两套独立体系，
 * 平台管理员也可以担任某组织的管理员（种子数据里已有此组合）。
 */
const drawerRolesLocked = computed(() => isPlatformAdminRow(roleDrawerRow.value))
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

/* 区块B：组织角色（与「新建账号」弹窗同一交互：点按钮加行，行内选组织与角色） */

/**
 * 抽屉表格末行的**常驻待选行**（与「新建账号」弹窗同一交互）。
 * 值恒为空字符串、只接收 @change；drawerOrgs 里因此只可能存合法记录，
 * 不再需要「过滤空行」那类处理。
 */
const pendingDrawerOrgId = ref('')

/** 待选行的可选组织：排除已加入的 */
function orgOptionsForDrawerPending(list) {
  void orgVersion.value // 显式依赖：新建组织后下拉选项要刷新
  const taken = new Set(list.map((m) => m.orgId))
  return getOrgs().filter((o) => !taken.has(o.id)).map((o) => ({ value: o.id, label: o.name }))
}

const pendingDrawerOrgHint = computed(() =>
  orgOptionsForDrawerPending(drawerOrgs.value).length ? '选择组织加入…' : '无可加入的组织')
const pendingDrawerOrgEmptyText = computed(() =>
  drawerOrgs.value.length ? '已加入全部组织' : '暂无可加入的组织')

/** 抽屉各组织行的「角色」下拉实例（用途同 accountRoleRefs） */
const drawerRoleRefs = new Map()
function setDrawerRoleRef(orgId, el) {
  if (!orgId) return
  if (el) drawerRoleRefs.set(orgId, el)
  else drawerRoleRefs.delete(orgId)
}

/** 把焦点引到某组织的角色下拉上（下一帧，等新行渲染完） */
function focusDrawerRoleSelect(orgId) {
  nextTick(() => drawerRoleRefs.get(orgId)?.focus?.())
}

/** 从常驻待选行选定组织 → 直接加入（角色默认「一般人员」并把焦点引到该行角色上） */
function addDrawerOrgFromPick(orgId) {
  if (!orgId) return
  if (drawerOrgs.value.some((m) => m.orgId === orgId)) {
    drawerError.value = `该账号已加入组织「${orgNameOf(orgId)}」，请勿重复添加`
    return
  }
  drawerOrgs.value = [...drawerOrgs.value, { orgId, orgRole: 'member' }]
  drawerError.value = ''
  pendingRemoveOrg.value = ''
  focusDrawerRoleSelect(orgId)
}

/** 修改某组织的组织角色 */
function changeDrawerOrgRole(m, nextRole) {
  const idx = drawerOrgs.value.findIndex((x) => x.orgId === m.orgId)
  if (idx === -1) return
  drawerOrgs.value[idx] = { ...drawerOrgs.value[idx], orgRole: nextRole }
  drawerError.value = ''
}

/**
 * 移出组织（按行下标定位）。
 * 若移出后该账号既无平台角色、又无其他组织，则需二次确认。
 * 注：交互改为「末行常驻待选行」后，drawerOrgs 里不再存在 orgId 为空的行。
 */
function removeDrawerOrg(idx) {
  const target = drawerOrgs.value[idx]
  if (!target) return
  const rest = drawerOrgs.value.filter((x, i) => i !== idx)
  if (!drawerRoles.value.length && !rest.length) {
    if (pendingRemoveOrg.value !== idx) {
      pendingRemoveOrg.value = idx
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
  /**
   * 平台管理员的**平台角色**不可修改（含自己与其他管理员之间）——
   * 避免管理员之间互相改权、或误撤全部管理员导致无人可管。
   * 但其**组织归属**照常可改，故这里不再整体 return，
   * 而是跳过平台角色写入、继续处理组织变更。
   */
  const rolesGuard = guardPlatformAdminChange(userId)
  const rolesLocked = !rolesGuard.ok
  // 平台角色可自由叠加，无需互斥校验

  /**
   * 组织归属的校验：交互改为「末行常驻待选行」后，drawerOrgs 只存已选好的记录，
   * 这里理论上已无空行可查；保留为**接口层兜底**（数据层 addOrgMember(userId, '')
   * 会返回 ok 并写入 orgId:'' 的脏记录 —— 实测过，故宁可多一道）。
   */
  if (drawerOrgs.value.some((m) => !m.orgId)) {
    drawerError.value = '存在未选择组织的组织归属，请选择具体组织或点「移出组织」删掉该行'
    return
  }
  const validOrgs = drawerOrgs.value
  const before = memberRows.value.find((r) => r.userId === userId)?.memberships || []
  const beforeIds = before.map((m) => m.orgId)
  const afterIds = validOrgs.map((m) => m.orgId)

  // 1) 平台角色：仅非平台管理员可写。
  //    平台管理员走 setMemberRoles 会被 guardPlatformAdminChange 拒绝，
  //    若在此 return 会把下面的组织变更一并挡掉，故只跳过这一步。
  if (!rolesLocked) {
    const res = setMemberRoles(userId, { platformRoles: drawerRoles.value, operator: CURRENT_OPERATOR })
    if (!res.ok) {
      drawerError.value = res.reason
      return
    }
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
  // 3) 新增/变更的组织角色（只处理已选定组织的行，空行已在上面丢弃）
  validOrgs.forEach((m) => {
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
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  // 离开页面时，弹窗内「内嵌新建但尚未完成建号」的组织必须撤销。
  // 否则用户建完组织直接点侧栏跳走 / 刷新，就会留下一个没有任何管理员的组织
  // （实测复现过），违反「新建组织必须有一名管理员」。
  // 成功建号时标记已清空，故此处的 rollback 是空操作，不会误删已归属新账号的组织。
  rollbackInlineOrgs()
})

/** 勾选/取消某个平台角色（全部角色可自由叠加） */
function toggleAccountRole(roleId, checked) {
  const set = new Set(accountForm.platformRoles)
  if (checked) set.add(roleId)
  else set.delete(roleId)
  accountForm.platformRoles = [...set]
  accountMsg.value = ''
}

/* 组织归属（可多条） */

/**
 * 组织数据版本号（响应式）。
 * getOrgs() 直接读 localStorage，属**非响应式**数据源 —— 若 computed 只依赖
 * accountForm.orgMemberships，在本页新建组织后下拉选项不会刷新（新建的组织选不到）。
 * 故组织增删后递增本计数器，让下面依赖组织的 computed 重新求值。
 */
const orgVersion = ref(0)

/** 组织名（查不到时回落 id） */
function orgNameOf(orgId) {
  return getOrgs().find((o) => o.id === orgId)?.name || orgId || '—'
}

/* ===== 组织列表 Tab =====
   平台全部组织（含内置）的管理视角。与「组织管理」页的分工：
     - 组织管理页 = 「我的组织」，只列当前用户所属的，在那里建组织 = 创建者自己当管理员；
     - 本 Tab      = 平台全部组织，供平台管理员查看/新建/删除，
                     在那里建组织需**指定他人**当管理员，创建者不进该组织。 */
const orgKeyword = ref('')

/** 全部组织（含内置），带管理员数/成员数/创建人/可删判定，并支持搜索 */
const orgRows = computed(() => {
  void orgVersion.value // 显式依赖：新建/删除组织后触发重算
  const q = orgKeyword.value.trim().toLowerCase()
  // 账号表用于把 createdBy（用户名）还原成姓名，便于阅读
  const byUsername = new Map(getAllAccounts().map((u) => [u.username, u]))
  return getOrgs()
    .filter((o) => {
      if (!q) return true
      return String(o.name || '').toLowerCase().includes(q) || String(o.industry || '').toLowerCase().includes(q)
    })
    .map((o) => {
      // 内置组织来自 orgData 的静态 ORGS：不由任何用户创建
      const isBuiltin = ORGS.some((b) => b.id === o.id)
      const creator = o.createdBy ? byUsername.get(o.createdBy) : null
      return {
        ...o,
        adminCount: getOrgAdminCount(o.id),
        memberCount: getOrgMemberships(o.id).filter((m) => m.orgRole === 'member').length,
        isBuiltin,
        // 创建人：内置组织不由任何用户创建，显示「—」而非「系统预置」
        // （「系统预置」是数据来源说明，放在创建人列会被误读成一个人）
        creatorLabel: isBuiltin ? '—' : (creator?.name || o.createdBy || '—'),
        /**
         * 本 Tab 能否删除：仅「平台管理员创建的组织」可删。
         * 成员在「组织管理」页建的组织属于该组织自己的资产，
         * 平台管理员不越权删 —— 要删应由其组织管理员在自己那边操作。
         */
        canDelete: !isBuiltin && isOrgCreatedByPlatformAdmin(o),
      }
    })
})

/* —— 组织列表分页（与成员列表同一套交互与样式）—— */
const orgPage = ref(1)
const orgPageSize = ref(10)

const orgTotalPages = computed(() =>
  Math.max(1, Math.ceil(orgRows.value.length / orgPageSize.value)))

const paginatedOrgs = computed(() => {
  const start = (orgPage.value - 1) * orgPageSize.value
  return orgRows.value.slice(start, start + orgPageSize.value)
})

/** 页码项：超过 7 页时折叠中间部分（与成员列表一致） */
const orgPageItems = computed(() => {
  const total = orgTotalPages.value
  const cur = orgPage.value
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

// 搜索或每页条数变化后回到第 1 页，避免停留在越界页码
watch(orgKeyword, () => { orgPage.value = 1 })
watch(orgPageSize, () => { orgPage.value = 1 })
// 结果集变小（如搜索后）导致当前页越界时，自动回退到最后一页
watch(orgTotalPages, (total) => {
  if (orgPage.value > total) orgPage.value = total
})

/* —— 新建组织（本 Tab 专用：需指定他人当管理员，创建者不加入）—— */
const orgCreateOpen = ref(false)
const orgCreateMsg = ref('')
const orgCreateMsgError = ref(false)
const orgCreateForm = ref({ name: '', industry: '金融', description: '', adminUserId: '' })

/** 可作组织管理员的账号（全部账号；平台管理员已可担任组织管理员） */
const orgAdminCandidates = computed(() => getAllAccounts().map((u) => ({ id: u.id, name: u.name })))

function openOrgCreate() {
  orgCreateForm.value = { name: '', industry: '金融', description: '', adminUserId: '' }
  orgCreateMsg.value = ''
  orgCreateMsgError.value = false
  orgCreateOpen.value = true
}

function closeOrgCreate() {
  orgCreateOpen.value = false
  orgCreateMsg.value = ''
}

/**
 * 创建组织 + 指定管理员。
 * 与「组织管理」页的差异：这里创建者**不加入**该组织（管理员是指定的那个人），
 * 因为本 Tab 是平台视角的组织管理，不是「我的组织」。
 */
function doCreateOrgFromAdmin() {
  const f = orgCreateForm.value
  if (!f.name) {
    orgCreateMsgError.value = true
    orgCreateMsg.value = '请填写组织名称'
    return
  }
  if (!f.adminUserId) {
    orgCreateMsgError.value = true
    orgCreateMsg.value = '请指定组织管理员（新建组织必须有一名管理员）'
    return
  }
  const res = createOrg({
    name: f.name, industry: f.industry, description: f.description, operator: CURRENT_OPERATOR,
    // 记账创建者角色快照：本 Tab 仅平台管理员可达，故建出的组织可在本列表删除
    operatorId: getCurrentUser().id,
  })
  if (!res.ok) {
    orgCreateMsgError.value = true
    orgCreateMsg.value = res.reason
    return
  }
  const addRes = addOrgMember(f.adminUserId, res.org.id, 'admin', CURRENT_OPERATOR)
  if (!addRes.ok) {
    // 管理员未落库 → 回滚，避免留下「0 管理员」的组织
    removeOrgMemberships(res.org.id)
    deleteOrgRaw(res.org.id)
    orgCreateMsgError.value = true
    orgCreateMsg.value = `创建失败：${addRes.reason || '组织管理员未能加入'}（已回滚）`
    return
  }
  orgVersion.value += 1
  const acc = orgAdminCandidates.value.find((u) => u.id === f.adminUserId)
  showTip(`组织「${res.org.name}」已创建，组织管理员：${acc?.name || f.adminUserId}`)
  closeOrgCreate()
}

/* —— 删除组织（二次确认）—— */
const orgDeleteTarget = ref(null)
const orgDeleteMsg = ref('')

function askDeleteOrg(org) {
  orgDeleteTarget.value = org
  orgDeleteMsg.value = ''
}

/** 确认删除：走 dissolveOrgByPlatformAdmin（平台视角口径 + 级联清理成员关系） */
function confirmDeleteOrg() {
  const o = orgDeleteTarget.value
  if (!o) return
  /**
   * 用平台视角的删除函数：仅平台管理员可调用，且只允许删「平台管理员创建的组织」。
   * 不能复用 dissolveOrg —— 那个的口径是「本组织的管理员才能删」，
   * 而本页是平台管理入口，平台管理员通常不是这些组织的成员。
   */
  const res = dissolveOrgByPlatformAdmin(o.id, getCurrentUser().id)
  if (!res.ok) {
    orgDeleteMsg.value = res.reason || '删除失败'
    return
  }
  orgVersion.value += 1
  showTip(`组织「${o.name}」已删除`)
  orgDeleteTarget.value = null
}

/**
 * 本页内嵌新建的组织 id 集合。
 * 需求：新建组织必须有一名组织管理员，而在本页新建时「管理员」就是当前这个新账号 ——
 * 所以这些组织的角色被锁定为「组织管理员」，既不可改成普通成员，也不可移除该行。
 * 与「从已有组织下拉里添加」的归属区分开：后者是可选、可改、可移除的。
 */
const inlineCreatedOrgIds = ref([])
function isInlineCreatedOrg(orgId) {
  return inlineCreatedOrgIds.value.includes(orgId)
}

/**
 * 表格末行的**常驻待选行**：值恒为空字符串，只接收 @change。
 *
 * 为什么不做成 orgMemberships 里的一条占位记录：
 *   那样会在取消/提交等路径上留下 orgId 为空的行，必须处处过滤，
 *   历史上已经踩过「空行被静默丢弃」「空行写脏数据」两个坑
 *   （见 doCreateAccount 的校验注释）。做成纯 UI 行后，orgMemberships
 *   里**只可能存合法记录**，这些坑从结构上消失。
 */
const pendingAccountOrgId = ref('')

/** 待选行的可选组织：排除已加入的（避免重复） */
function orgOptionsForPending(list) {
  void orgVersion.value // 显式依赖：本页新建组织后选项要刷新
  const taken = new Set(list.map((m) => m.orgId))
  return getOrgs().filter((o) => !taken.has(o.id)).map((o) => ({ value: o.id, label: o.name }))
}

/** 待选行占位文案：无可加入组织时明确说明原因，避免「点了没反应」的困惑 */
const pendingAccountOrgHint = computed(() =>
  orgOptionsForPending(accountForm.orgMemberships).length ? '选择组织加入…' : '无可加入的组织')
const pendingAccountOrgEmptyText = computed(() =>
  accountForm.orgMemberships.length ? '已加入全部组织' : '暂无可加入的组织')

/**
 * 各组织行的「角色」下拉实例：orgId → 组件实例。
 *
 * 用途：选中组织即加入后，把焦点**引到刚加入那一行的角色下拉**上 ——
 * 用户若想设成组织管理员，直接就能改；不想管就继续选下一个组织，角色保持默认
 * 「一般人员」。这样「组织选完 → 角色就在手边」，不必回头找那一行再点一次。
 *
 * 用 :ref 回调而非 ref 数组：行会随增删挪位，按下标存会在删除一行后错位。
 * 组件卸载时回调收到 null，据此清除登记，避免持有失效实例。
 */
const accountRoleRefs = new Map()
function setAccountRoleRef(orgId, el) {
  if (!orgId) return
  if (el) accountRoleRefs.set(orgId, el)
  else accountRoleRefs.delete(orgId)
}

/** 把焦点引到某组织的角色下拉上（下一帧，等新行渲染完） */
function focusAccountRoleSelect(orgId) {
  nextTick(() => accountRoleRefs.get(orgId)?.focus?.())
}

/**
 * 从常驻待选行选定组织 → 直接加入列表。
 * 角色默认「一般人员」并**把焦点引到该行的角色下拉**（见上），需要管理员就地可改。
 */
function addAccountOrgFromPick(orgId) {
  if (!orgId) return
  if (accountForm.orgMemberships.some((m) => m.orgId === orgId)) {
    accountMsgError.value = true
    accountMsg.value = `已加入组织「${orgNameOf(orgId)}」，请勿重复添加`
    return
  }
  accountForm.orgMemberships.push({ orgId, orgRole: 'member' })
  accountMsg.value = ''
  accountMsgError.value = false
  focusAccountRoleSelect(orgId)
}

/** 移除一条组织归属 */
function removeAccountOrg(idx) {
  const target = accountForm.orgMemberships[idx]
  // 内嵌新建的组织必须由本账号担任管理员，属新建组织的硬约束，不允许移除
  if (target && isInlineCreatedOrg(target.orgId)) {
    accountMsgError.value = true
    accountMsg.value = `组织「${orgNameOf(target.orgId)}」是在本页新建的，必须由当前账号担任组织管理员，不可移除`
    return
  }
  accountForm.orgMemberships.splice(idx, 1)
  accountMsg.value = ''
}

/* ===== 内嵌「新建组织」=====
   在本页直接建组织并把结果填进「组织归属」，避免跳到组织管理页后再切回来。
   与原跳转方案的关键差异：这里**不需要**指定组织管理员 ——
   管理员账号正是本次要创建的，建完号在同一步里给账号选组织角色即可。 */
const orgDialogOpen = ref(false)
const orgMsg = ref('')
const orgForm = ref({ name: '', industry: '金融', description: '' })

const industryOptions = computed(() => INDUSTRY_OPTIONS.map((i) => ({ value: i, label: i })))

function openOrgDialog() {
  orgForm.value = { name: '', industry: '金融', description: '' }
  orgMsg.value = ''
  orgDialogOpen.value = true
}

function closeOrgDialog() {
  orgDialogOpen.value = false
  orgMsg.value = ''
}

/** 创建组织 → 自动加入「组织归属」草稿 → 关闭内嵌窗 */
function doCreateOrgInline() {
  const f = orgForm.value
  const res = createOrg({
    name: f.name,
    industry: f.industry,
    description: f.description,
    operator: CURRENT_OPERATOR,
    // 记账创建者角色快照：本入口位于权限设置页（仅平台管理员可达）
    operatorId: getCurrentUser().id,
  })
  if (!res.ok) {
    orgMsg.value = res.reason || '创建失败'
    return
  }
  // 新建的组织直接落到「组织归属」草稿，并**锁定为组织管理员**：
  // 需求要求新建组织必须带一名管理员，而在本页新建时管理员就是当前这个新账号，
  // 故登记其 id —— 该行角色下拉会被禁用、移除按钮不显示（见模板与 removeAccountOrg）。
  accountForm.orgMemberships.push({ orgId: res.org.id, orgRole: 'admin' })
  inlineCreatedOrgIds.value = [...inlineCreatedOrgIds.value, res.org.id]
  // 让依赖组织的 computed 重新求值（下拉选项、组织名解析）
  orgVersion.value += 1
  closeOrgDialog()
  accountMsg.value = ''
  showTip(`组织「${res.org.name}」已创建并加入组织归属（组织角色默认「组织管理员」，可调整）`)
}

/** 打开新建账号弹窗：清掉上一次的草稿与提示 */
function openCreateDialog() {
  resetAccountForm()
  createOpen.value = true
}

/**
 * 回滚本次在本页内嵌新建的组织（含其成员关系）。
 *
 * 为什么需要：内嵌建组织是「立即落库」，而管理员是「建号成功后才写入」——
 * 两者之间若用户取消建号、或建号失败，组织就已经落库但**没有任何管理员**，
 * 直接违反「新建组织必须有一名管理员」这条硬约束（实测复现过）。
 * 故在这些「未完成」路径上把本次新建的组织一并撤销。
 *
 * 用 deleteOrgRaw 而非 dissolveOrg：这是当前操作人的补偿操作，
 * 不应再被「仅平台管理员/组织管理员」的口径二次拦截。
 */
function rollbackInlineOrgs() {
  const ids = inlineCreatedOrgIds.value
  if (!ids.length) return
  ids.forEach((orgId) => {
    // 先清成员关系再删组织：反之会留下指向已删组织的孤儿记录
    removeOrgMemberships(orgId)
    deleteOrgRaw(orgId)
  })
  inlineCreatedOrgIds.value = []
  orgVersion.value += 1
}

/** 关闭新建账号弹窗（属「放弃」路径，需回滚未完成的内嵌新建组织） */
function closeCreateDialog() {
  createOpen.value = false
  roleMsOpen.value = false
  rollbackInlineOrgs()
}

function resetAccountForm() {
  accountForm.username = ''
  accountForm.password = ''
  accountForm.confirmPassword = ''
  accountForm.platformRoles = []
  accountForm.orgMemberships = []
  // 清掉上一轮的「内嵌新建组织」标记，避免下次建号时误锁无关组织
  inlineCreatedOrgIds.value = []
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
  /**
   * 校验：组织归属里不允许存在未选组织的行。
   * 交互改为「末行常驻待选行」后，orgMemberships 只存已选好的记录，
   * 这条理论上已不可触发；保留为**接口层兜底**（数据层 createAccount 会静默过滤
   * 空 orgId，若哪天又引入空行，这里能给出与界面一致的提示，而不是报
   * 「必须至少分配平台角色或加入一个组织」这种对不上的错）。
   */
  if (accountForm.orgMemberships.some((m) => !m.orgId)) {
    accountMsgError.value = true
    accountMsg.value = '存在未选择组织的组织归属，请选择具体组织或点「移除」删掉该行'
    return
  }
  /**
   * 兜底校验：本页新建的组织必须由本账号担任组织管理员。
   * 界面上已通过「角色下拉禁用 + 移除按钮隐藏 + removeAccountOrg 守卫」三重限制，
   * 但提交前再验一次 —— 需求是硬约束（新建组织必须带一名管理员），
   * 不该因为将来改动 UI 就悄悄失效。
   */
  const missingAdmin = inlineCreatedOrgIds.value.find((orgId) => {
    const m = accountForm.orgMemberships.find((x) => x.orgId === orgId)
    return !m || m.orgRole !== 'admin'
  })
  if (missingAdmin) {
    accountMsgError.value = true
    accountMsg.value = `组织「${orgNameOf(missingAdmin)}」是在本页新建的，必须由本账号担任组织管理员才能创建`
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
  /**
   * 账号已创建成功 → 先清空「内嵌新建组织」标记再关弹窗。
   * 否则 closeCreateDialog 会把这些组织当成「未完成」回滚掉 ——
   * 而它们此刻已正式归属于刚建好的账号（账号就是它们的组织管理员）。
   */
  inlineCreatedOrgIds.value = []
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
/* Tab 按钮组（成员列表 / 功能权限矩阵） */
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
/* 删除组织确认弹窗：警示文案与后果列表 */
.perm-del-warn {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #111827;
}
.perm-del-warn b { color: #dc2626; }
.perm-del-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12.5px;
  line-height: 1.75;
  color: #6b7280;
}

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

/* 常驻待选行：视觉上弱化，表明「这行是入口、不是已加入的记录」 */
.perm-row--pending td {
  background: #fcfcfd;
  border-top: 1px dashed #e5e7eb;
}
.perm-row--pending .perm-muted { font-size: 12px; }

/* 平台管理员锁定提示：抽屉顶部整条说明 */
.perm-lock-tip {
  margin: 0 0 16px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.7;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
}
/* 锁定的角色选项：整行置灰、不可点 */
.perm-role-opt.is-locked {
  cursor: not-allowed;
  opacity: 0.75;
}

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
/* 组织列表 Tab：表格容器（与成员列表同样的排版约束） */
.perm-orgs-wrap { display: flex; flex-direction: column; }
.perm-org-name { font-weight: 500; color: #111827; }
/* 组织列表的操作列只需容纳「删除」或「不可删除」，比成员列表（两个按钮）窄得多；
   收窄后多余宽度会自动让给「组织名称」，避免表格右侧大片留白。 */
.perm-orgs-wrap .perm-col-ops { width: 110px; }
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

/* 「新建」标记：标出该组织是在本页刚创建的（其角色被锁定为组织管理员） */
.perm-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  vertical-align: 1px;
  white-space: nowrap;
}
/* 修饰类必须与 .perm-tag 一起用 —— .perm-tag 本身只定义尺寸，
   配色全靠修饰类；只写 .perm-tag 会渲染成透明背景的裸文字。 */
.perm-tag--lock {
  color: #b45309;
  background: #fef3c7;
}
/* 锁定提示：替代「移除」按钮的位置，说明为何不可改 */
.perm-lock-hint {
  font-size: 12px;
  color: #9ca3af;
  cursor: help;
}

/* 链接样式的按钮（用于「+ 新建组织」这类动作，与 RouterLink 外观一致） */
.perm-link--btn {
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.perm-link--btn:hover { color: #b01830; }

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

/* 嵌套在「新建账号」弹窗内的次级弹窗（新建组织）：
   与父遮罩同为 fixed，但 z-index 高一档，保证压在父弹窗之上。 */
.perm-modal-overlay--nested {
  z-index: 1100;
  background: rgba(15, 23, 42, 0.35);
}

/* 次级弹窗收窄：内容比建号表单少得多，用 720px 会显得空旷 */
.perm-modal--sm {
  max-width: 460px;
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

/* 组织归属的「+ 添加组织」区（表格下方） */
.perm-org-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eef0f3;
}
/* 行内的组织/角色下拉：撑满单元格，保持与其他输入控件同高 */
.perm-table--sub .perm-select { width: 100%; }

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
