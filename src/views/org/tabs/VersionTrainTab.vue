<template>
  <div class="vt-tab-page">
    <!-- 主布局：左侧侧栏 + 右侧内容 -->
    <div class="vt-tab-layout">
      <!-- 左侧：火车列表 -->
      <aside class="vt-tab-sidebar">
        <div class="vt-tab-sidebar-header">
          <div class="vt-tab-sidebar-title-row">
            <h3 class="vt-tab-sidebar-title">版本火车</h3>
            <span class="vt-tab-count-badge">{{ filteredTrains.length }}</span>
          </div>
          <div class="vt-tab-sidebar-actions">
            <button type="button" class="vt-tab-pill-btn vt-tab-pill-btn--primary" @click="showNewTrainModal = true">+ 新增</button>
            <button type="button" class="vt-tab-pill-btn vt-tab-pill-btn--ghost" @click="showHistory = true">发车历史</button>
          </div>
          <div class="vt-tab-sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="trainSearch" type="text" class="vt-tab-sidebar-input" placeholder="搜索火车号或名称..." />
          </div>
        </div>
        <div class="vt-tab-sidebar-list">
          <button
            v-for="train in filteredTrains"
            :key="train.id"
            type="button"
            class="vt-tab-sidebar-item"
            :class="{ 'vt-tab-sidebar-item--active': activeTrainId === train.id }"
            @click="activeTrainId = train.id"
          >
            <div class="vt-tab-sidebar-item-main">
              <span class="vt-tab-sidebar-name">{{ train.name }}</span>
              <span class="vt-tab-dot-badge">{{ train.softwareList.length }}</span>
            </div>
            <div class="vt-tab-sidebar-item-meta">
              <span class="vt-tab-sidebar-status" :class="'vt-tab-sidestatus--' + train.status">{{ train.status }}</span>
              <span class="vt-tab-sidebar-id">{{ train.id }}</span>
              <span class="vt-tab-sidebar-ver">{{ train.versionNum }}</span>
              <div class="vt-tab-dot-wrap" @click.stop="openMenuTrainId = openMenuTrainId === train.id ? null : train.id">
                <span class="vt-tab-dot-btn">···</span>
                <ul v-if="openMenuTrainId === train.id" class="vt-tab-dot-menu">
                  <li class="vt-tab-dot-menu-item vt-tab-dot-menu-item--danger" @click.stop="confirmDeleteTrain(train)">删除</li>
                </ul>
              </div>
            </div>
          </button>
          <div v-if="filteredTrains.length === 0" class="vt-tab-sidebar-empty">
            <span class="vt-tab-text-muted">{{ orgTrains.length === 0 ? '暂无版本火车' : '没有匹配的结果' }}</span>
          </div>
        </div>
      </aside>

      <!-- 右侧：主内容 -->
      <main class="vt-tab-content">

        <!-- ====== 版本信息树 ====== -->
        <section v-if="showVersionInfo && activeTrain">
          <div class="vt-tab-tree-card">
            <div class="vt-tab-tree">
              <div class="vt-tab-tree-train-header">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="9" height="9" rx="1.5" transform="rotate(0 1 1)"/><path d="M4 5.5h3M5.5 4v3"/></svg>
                <span class="vt-tab-tree-train-id">{{ activeTrain.id }}</span>
                <span class="vt-tab-tree-train-name">{{ activeTrain.name }}</span>
              <span class="vt-tab-tree-train-status" :class="'vt-tab-sidestatus--' + activeTrain.status">{{ activeTrain.status }}</span>
              <span class="vt-tab-dot-badge">{{ activeTrain.softwareList.length }}</span>
            </div>
            <div class="vt-tab-tree-toolbar">
              <button type="button" class="vt-tab-tree-toolbar-btn" @click="treeExpandAll">全部展开</button>
              <button type="button" class="vt-tab-tree-toolbar-btn" @click="treeCollapseAll">全部收起</button>
            </div>
            <div class="vt-tab-tree-children">
              <div v-for="group in groupedBySoftware" :key="group.name" class="vt-tab-tree-group">
                <div class="vt-tab-tree-soft-row" @click="toggleSwName(group.name)">
                  <span class="vt-tab-tree-expand-icon">
                    <svg v-if="isSwNameOpen(group.name)" width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512.790674 713.142857L55.647817 256a32.182857 32.182857 0 1 0-45.641143 45.348571l457.142857 457.142858a64.365714 64.365714 0 0 0 90.989715 0l457.142857-457.142858a32.182857 32.182857 0 0 0-45.348572-45.348571l-457.142857 457.142857z"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512.790674 713.142857L55.647817 256a32.182857 32.182857 0 1 0-45.641143 45.348571l457.142857 457.142858a64.365714 64.365714 0 0 0 90.989715 0l457.142857-457.142858a32.182857 32.182857 0 0 0-45.348572-45.348571l-457.142857 457.142857z" transform="rotate(-90 512 512)"/></svg>
                  </span>
                  <span class="vt-tab-tree-soft-name">{{ group.name }}</span>
                  <span class="vt-tab-dot-badge">{{ group.versions.length }}</span>
                </div>
                <div v-if="isSwNameOpen(group.name)" class="vt-tab-tree-soft-children">
                  <div v-for="sw in group.versions" :key="sw.id" class="vt-tab-tree-version">
                    <div class="vt-tab-tree-ver-row" @click="toggleSwComp(sw.id)">
                          <span class="vt-tab-tree-expand-icon vt-tab-tree-expand-icon--sub">
                        <svg v-if="isSwOpen(sw.id)" width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512.790674 713.142857L55.647817 256a32.182857 32.182857 0 1 0-45.641143 45.348571l457.142857 457.142858a64.365714 64.365714 0 0 0 90.989715 0l457.142857-457.142858a32.182857 32.182857 0 0 0-45.348572-45.348571l-457.142857 457.142857z"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512.790674 713.142857L55.647817 256a32.182857 32.182857 0 1 0-45.641143 45.348571l457.142857 457.142858a64.365714 64.365714 0 0 0 90.989715 0l457.142857-457.142858a32.182857 32.182857 0 0 0-45.348572-45.348571l-457.142857 457.142857z" transform="rotate(-90 512 512)"/></svg>
                      </span>
                      <span class="vt-tab-tree-sw-version vt-tab-version-link" @click.stop="router.push({ name: 'software-detail', query: { v: sw.version, tab: 'intro' } })">v{{ sw.version }}</span>
                    </div>
                    <div v-if="isSwOpen(sw.id)" class="vt-tab-tree-ver-children">
                      <div v-if="getComponentsForSw(activeTrain, sw.name).length === 0" class="vt-tab-tree-comp-empty">── 暂无组件</div>
                      <div v-for="(comp, compIdx) in getComponentsForSw(activeTrain, sw.name)" :key="comp.id" class="vt-tab-tree-component">
                        <div class="vt-tab-tree-comp-row">
                          <span class="vt-tab-tree-comp-connector">{{ compIdx === getComponentsForSw(activeTrain, sw.name).length - 1 ? '└' : '├' }}</span>
                          <span class="vt-tab-tree-comp-name">{{ comp.name.split(' / ')[1] || comp.name }}</span>
                          <span class="vt-tab-tree-comp-version vt-tab-version-link" @click.stop="router.push({ name: 'software-detail', query: { v: comp.version, tab: 'intro' } })">v{{ comp.version }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="group.versions.length === 0" class="vt-tab-tree-empty-sub">暂无版本</div>
                </div>
              </div>
              <div v-if="groupedBySoftware.length === 0" class="vt-tab-tree-empty-row">暂无软件</div>
            </div>
          </div>
          </div>
        </section>
        <section v-else-if="!activeTrain" class="vt-tab-card vt-tab-card--empty">
          <div class="vt-tab-empty-state">
            <span class="vt-tab-empty-icon" aria-hidden="true"></span>
            <p class="vt-tab-empty-text">请从左侧列表选择一个版本火车</p>
            <p class="vt-tab-empty-hint">选择火车后，可查看其软件列表、管理评审状态并执行发车操作</p>
          </div>
        </section>

          <section v-else class="vt-tab-card">
            <div class="vt-tab-card-header">
              <div class="vt-tab-card-header-row">
                <h2 class="vt-tab-card-title">
                  {{ activeTrain.id }} — {{ activeTrain.name }}
                  <span class="vt-tab-title-status" :class="'vt-tab-sidestatus--' + activeTrain.status">{{ activeTrain.status }}</span>
                  <span v-if="activeTrain.releaseTime" class="vt-tab-title-time">发布时间：{{ activeTrain.releaseTime }}</span>
                  <span v-if="activeTrain.endTime" class="vt-tab-title-time vt-tab-title-time--end">结束时间：{{ activeTrain.endTime }}</span>
                </h2>
                <div class="vt-tab-card-header-actions">
                  <template v-if="activeTrain.status === '待发车'">
                    <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" @click="showSelectSoftware = true">从软件/组件库导入</button>
                  </template>
                  <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" @click="toggleVersionInfo">
                    {{ showVersionInfo ? '收起信息树' : '版本火车信息树' }}
                  </button>
                  <button v-if="activeTrain.status === '待发车'" type="button" class="vt-tab-btn vt-tab-btn-primary vt-tab-btn-xs" @click="openReleaseForm(activeTrain)">发车</button>
                </div>
              </div>
              <div v-if="activeTrain.remark" class="vt-tab-card-remark">
                <span class="vt-tab-card-remark-text">{{ activeTrain.remark }}</span>
              </div>
              <!-- 工具栏 -->
              <div class="vt-tab-card-toolbar">
                <div class="vt-tab-card-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="softwareNameSearch" type="text" class="vt-tab-card-input" placeholder="搜索软件名称..." />
                </div>
                <div class="vt-tab-card-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="softwareVersionSearch" type="text" class="vt-tab-card-input" placeholder="搜索版本号..." />
                </div>
                <!-- 批量操作 -->
                <div v-if="selectedSoftwareForBatch.length > 0 && (activeTrain.status === '待发车' || activeTrain.status === '已发车')" class="vt-tab-batch-bar">
                  <span class="vt-tab-batch-count">已选 {{ selectedSoftwareForBatch.length }} 项</span>
                  <template v-if="activeTrain.status === '待发车'">
                    <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" @click="batchRemoveSoftware">批量移除</button>
                  </template>
                  <template v-if="activeTrain.status === '已发车'">
                    <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" @click="batchOnline">批量上架</button>
                    <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" @click="batchOffline">批量下架</button>
                  </template>
                  <button type="button" class="vt-tab-btn vt-tab-btn-ghost vt-tab-btn-xs" @click="selectedSoftwareForBatch = []">取消</button>
                </div>
              </div>
            </div>

            <!-- 软件列表表格 -->
            <div class="vt-tab-table-wrap">
              <table class="vt-tab-table">
                <thead>
                  <tr>
                    <th class="vt-tab-th-chk" v-if="canBatch">
                      <input type="checkbox" :checked="isAllSelected" :indeterminate="isIndeterminate" @change="toggleAll" />
                    </th>
                    <th>软件名称</th>
                    <th>版本号</th>
                    <th>语言</th>
                    <th>许可证</th>
                    <th>状态</th>
                    <th class="vt-tab-th-op">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sw in paginatedSoftware" :key="sw.id">
                    <td class="vt-tab-td-chk" v-if="canBatch">
                      <input type="checkbox" :checked="selectedSoftwareForBatch.includes(sw.id)" @change="toggleSoftwareSelection(sw.id)" />
                    </td>
                    <td><span class="vt-tab-soft-name">{{ sw.name }}</span></td>
                    <td><span class="vt-tab-code vt-tab-version-link" @click="router.push({ name: 'software-detail', query: { v: sw.version, tab: 'intro' } })">{{ sw.version }}</span></td>
                    <td>{{ sw.lang }}</td>
                    <td>{{ sw.license }}</td>
                    <td>
                      <template v-if="activeTrain.status === '待发车'">
                        <span class="vt-tab-badge vt-tab-badge--muted">待上架</span>
                      </template>
                      <template v-else-if="activeTrain.status === '已发车'">
                        <span class="vt-tab-badge" :class="sw.published ? 'vt-tab-badge--active' : 'vt-tab-badge--muted'">{{ sw.published ? '已上架' : '已下架' }}</span>
                      </template>
                    </td>
                    <td class="vt-tab-td-op">
                      <template v-if="activeTrain.status === '待发车'">
                        <button type="button" class="vt-tab-linkish vt-tab-linkish--danger" @click="removeSoftwareFromTrain(sw.id)">移除</button>
                      </template>
                      <template v-if="activeTrain.status === '已发车'">
                        <button type="button" class="vt-tab-linkish" @click="toggleShelf(sw)">{{ sw.published ? '下架' : '上架' }}</button>
                      </template>
                    </td>
                  </tr>
                  <tr v-if="paginatedSoftware.length === 0">
                    <td :colspan="colspanCount" class="vt-tab-empty-cell">暂无软件数据</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div v-if="activeTrainSoftwareItems.length > 0" class="vt-tab-pagination">
              <button class="vt-tab-page-btn" :disabled="page <= 1" @click="page = 1">«</button>
              <button class="vt-tab-page-btn" :disabled="page <= 1" @click="page--">‹</button>
              <button v-for="p in pageNumbers" :key="p" class="vt-tab-page-btn" :class="{ 'vt-tab-page-btn--active': p === page }" @click="page = p">{{ p }}</button>
              <button class="vt-tab-page-btn" :disabled="page >= totalPages" @click="page++">›</button>
              <button class="vt-tab-page-btn" :disabled="page >= totalPages" @click="page = totalPages">»</button>
              <span class="vt-tab-page-info">{{ page }}/{{ totalPages }} 页，共 {{ activeTrainSoftwareItems.length }} 项</span>
            </div>
          </section>
      </main>
    </div>

    <!-- ====== 发车历史弹窗 ====== -->
    <div v-if="showHistory" class="vt-tab-overlay" @click.self="showHistory = false">
      <div class="vt-tab-modal vt-tab-modal--xl">
        <div class="vt-tab-modal-header">
          <h3 class="vt-tab-modal-title">发车历史</h3>
          <button type="button" class="vt-tab-modal-close" @click="showHistory = false">×</button>
        </div>
        <div class="vt-tab-modal-body">
          <!-- 搜索框 -->
          <div class="vt-tab-card-search" style="margin-bottom:14px;max-width:100%">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="histSearch" type="text" class="vt-tab-card-input" placeholder="搜索版本火车名..." />
          </div>
          <table class="vt-tab-table">
            <thead>
              <tr>
                <th>火车编号</th>
                <th>名称</th>
                <th>发布时间</th>
                <th>结束时间</th>
                <th>状态</th>
                <th>软件数</th>
                <th>组件数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in paginatedHistory" :key="h.id">
                <td class="vt-tab-code">{{ h.id }}</td>
                <td>{{ h.name }}</td>
                <td>{{ h.releaseTime }}</td>
                <td>{{ h.endTime }}</td>
                <td><span class="vt-tab-badge" :class="'vt-tab-badge--' + h.status">{{ h.status }}</span></td>
                <td>{{ h.softwareCount }}</td>
                <td>{{ h.componentCount }}</td>
              </tr>
              <tr v-if="paginatedHistory.length === 0">
                <td colspan="7" class="vt-tab-empty-cell">{{ filteredHistory.length === 0 ? '暂无发车历史' : '没有匹配的结果' }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 分页器 -->
          <div v-if="filteredHistory.length > 0" class="vt-tab-pagination" style="border-top:none;padding:12px 0 0">
            <button class="vt-tab-page-btn" :disabled="histPage <= 1" @click="histPage = 1">«</button>
            <button class="vt-tab-page-btn" :disabled="histPage <= 1" @click="histPage--">‹</button>
            <button v-for="p in histPageNumbers" :key="p" class="vt-tab-page-btn" :class="{ 'vt-tab-page-btn--active': p === histPage }" @click="histPage = p">{{ p }}</button>
            <button class="vt-tab-page-btn" :disabled="histPage >= histTotalPages" @click="histPage++">›</button>
            <button class="vt-tab-page-btn" :disabled="histPage >= histTotalPages" @click="histPage = histTotalPages">»</button>
            <span class="vt-tab-page-info">{{ histPage }}/{{ histTotalPages }} 页，共 {{ filteredHistory.length }} 项</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 新增火车弹窗 ====== -->
    <div v-if="showNewTrainModal" class="vt-tab-overlay" @click.self="showNewTrainModal = false">
      <div class="vt-tab-modal">
        <div class="vt-tab-modal-header">
          <h3 class="vt-tab-modal-title">新增版本火车</h3>
          <button type="button" class="vt-tab-modal-close" @click="showNewTrainModal = false">×</button>
        </div>
        <div class="vt-tab-modal-body">
          <div class="vt-tab-form">
            <div class="vt-tab-form-group">
              <label class="vt-tab-form-label">版本火车名<span class="vt-tab-form-required">*</span></label>
              <input v-model="newTrainForm.name" type="text" class="vt-tab-input" placeholder="如：2026年Q3首次发车" />
            </div>
            <div class="vt-tab-form-group">
              <label class="vt-tab-form-label">版本号 <span class="vt-tab-form-required">*</span></label>
              <input v-model="newTrainForm.versionNum" type="text" class="vt-tab-input" placeholder="如：v5.0.0" />
            </div>
          </div>
        </div>
        <div class="vt-tab-modal-footer">
          <button type="button" class="vt-tab-btn vt-tab-btn-ghost" @click="showNewTrainModal = false">取消</button>
          <button type="button" class="vt-tab-btn vt-tab-btn-primary" @click="createNewTrain" :disabled="!newTrainForm.name.trim() || !newTrainForm.versionNum.trim()">确认创建</button>
        </div>
      </div>
    </div>

    <!-- ====== 发车弹窗 ====== -->
    <div v-if="showReleaseModal" class="vt-tab-overlay" @click.self="showReleaseModal = false">
      <div class="vt-tab-modal">
        <div class="vt-tab-modal-header">
          <h3 class="vt-tab-modal-title">确认发车</h3>
          <button type="button" class="vt-tab-modal-close" @click="showReleaseModal = false">×</button>
        </div>
        <div class="vt-tab-modal-body">
          <p class="vt-tab-release-info">即将发车：<strong>{{ releaseTrain?.id }} — {{ releaseTrain?.name }}</strong></p>
          <p class="vt-tab-release-info">包含软件数：<strong>{{ releaseTrain?.softwareList?.length || 0 }}</strong> 项</p>
          <p class="vt-tab-release-info">包含组件数：<strong>{{ (releaseTrain?.softwareList?.filter(s => s.type === 'component') || []).length }}</strong> 项</p>
          <div class="vt-tab-form-group">
            <label class="vt-tab-form-label">开始时间</label>
            <input v-model="releaseStartTime" type="datetime-local" class="vt-tab-input" />
          </div>
          <div class="vt-tab-form-group">
            <label class="vt-tab-form-label">结束时间</label>
            <input v-model="releaseEndTime" type="datetime-local" class="vt-tab-input" />
          </div>
          <div class="vt-tab-form-group">
            <label class="vt-tab-form-label">发车备注</label>
            <textarea v-model="releaseRemark" class="vt-tab-textarea" rows="3" placeholder="发车说明..." />
          </div>
        </div>
        <div class="vt-tab-modal-footer">
          <button type="button" class="vt-tab-btn vt-tab-btn-ghost" @click="showReleaseModal = false">取消</button>
          <button type="button" class="vt-tab-btn vt-tab-btn-primary" @click="confirmRelease">确认发车</button>
        </div>
      </div>
    </div>

    <!-- ====== 选择软件弹窗 ====== -->
    <div v-if="showSelectSoftware" class="vt-tab-overlay" @click.self="showSelectSoftware = false">
      <div class="vt-tab-modal vt-tab-modal--wide">
        <div class="vt-tab-modal-header">
          <h3 class="vt-tab-modal-title">从软件/组件库选择</h3>
          <button type="button" class="vt-tab-modal-close" @click="showSelectSoftware = false">×</button>
        </div>
        <div class="vt-tab-modal-body">
          <!-- 搜索框 -->
          <div class="vt-tab-card-search" style="margin-bottom:12px;max-width:100%">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="importSearch" type="text" class="vt-tab-card-input" :placeholder="importTab === 'software' ? '搜索软件名称...' : '搜索组件名称...'" />
          </div>
          <!-- Tab 切换栏 -->
          <div class="vt-tab-im-tabs">
            <button
              class="vt-tab-im-tab"
              :class="{ active: importTab === 'software' }"
              @click="importTab = 'software'"
            >
              软件
              <span class="vt-tab-im-tab-count">{{ filteredImportSoftware.length }}</span>
            </button>
            <button
              class="vt-tab-im-tab"
              :class="{ active: importTab === 'component' }"
              @click="importTab = 'component'"
            >
              组件
              <span class="vt-tab-im-tab-count">{{ filteredImportComponent.length }}</span>
            </button>
          </div>
          <!-- 列表 -->
          <div class="vt-tab-form-software-list-wrap">
            <template v-if="importTab === 'software'">
              <table class="vt-tab-table vt-tab-table--import">
                <thead>
                  <tr>
                    <th style="width:28px;text-align:center">
                      <span class="vt-tab-im-check" @click.stop="toggleAllSoftwarePage">
                        <span v-if="allSoftwarePageSelected" class="vt-tab-im-check--on">✓</span>
                        <span v-else class="vt-tab-im-check--off">○</span>
                      </span>
                    </th>
                    <th>软件名称</th>
                    <th>版本</th>
                    <th>编程语言</th>
                    <th>开源许可证</th>
                    <th style="text-align:center">漏洞数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in paginatedImportSoftware"
                    :key="r.id"
                    class="vt-tab-im-row"
                    @click="toggleNewSoftware(r.id)"
                  >
                    <td style="text-align:center">
                      <span class="vt-tab-im-check">
                        <span v-if="selectedNewSoftwareIds.includes(r.id)" class="vt-tab-im-check--on">✓</span>
                        <span v-else class="vt-tab-im-check--off">○</span>
                      </span>
                    </td>
                    <td class="vt-tab-im-name">{{ r.name }}</td>
                    <td class="vt-tab-im-cell">{{ r.version }}</td>
                    <td class="vt-tab-im-cell"><span class="vt-tab-im-lang">{{ r.lang }}</span></td>
                    <td class="vt-tab-im-cell"><span class="vt-tab-im-license">{{ r.license }}</span></td>
                    <td class="vt-tab-im-cell" style="text-align:center">
                      <span v-if="r.vulnCount > 0" class="vt-tab-im-vuln">{{ r.vulnCount }}</span>
                      <span v-else class="vt-tab-im-safe">0</span>
                    </td>
                  </tr>
                  <tr v-if="filteredImportSoftware.length === 0">
                    <td colspan="6" class="vt-tab-empty-cell">暂无可用软件</td>
                  </tr>
                </tbody>
              </table>
            </template>
            <template v-else>
              <table class="vt-tab-table vt-tab-table--import">
                <thead>
                  <tr>
                    <th style="width:28px;text-align:center">
                      <span class="vt-tab-im-check" @click.stop="toggleAllComponentPage">
                        <span v-if="allComponentPageSelected" class="vt-tab-im-check--on">✓</span>
                        <span v-else class="vt-tab-im-check--off">○</span>
                      </span>
                    </th>
                    <th>组件名称</th>
                    <th>组件版本</th>
                    <th>编程语言</th>
                    <th>开源许可证</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in paginatedImportComponent"
                    :key="r.id"
                    class="vt-tab-im-row"
                    @click="toggleNewSoftware(r.id)"
                  >
                    <td style="text-align:center">
                      <span class="vt-tab-im-check">
                        <span v-if="selectedNewSoftwareIds.includes(r.id)" class="vt-tab-im-check--on">✓</span>
                        <span v-else class="vt-tab-im-check--off">○</span>
                      </span>
                    </td>
                    <td class="vt-tab-im-name">{{ r.name }}</td>
                    <td class="vt-tab-im-cell">{{ r.version }}</td>
                    <td class="vt-tab-im-cell"><span class="vt-tab-im-lang">{{ r.lang }}</span></td>
                    <td class="vt-tab-im-cell"><span class="vt-tab-im-license">{{ r.license }}</span></td>
                  </tr>
                  <tr v-if="filteredImportComponent.length === 0">
                    <td colspan="5" class="vt-tab-empty-cell">暂无可用组件</td>
                  </tr>
                </tbody>
              </table>
            </template>
          </div>
          <!-- 分页器 -->
          <div class="vt-tab-import-pager">
            <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" :disabled="importPage <= 1" @click="importPage = Math.max(1, importPage - 1)">‹</button>
            <span class="vt-tab-import-page-current">{{ importPage }}</span>
            <button type="button" class="vt-tab-btn vt-tab-btn-outline vt-tab-btn-xs" :disabled="importPage >= importTotalPages" @click="importPage = Math.min(importTotalPages, importPage + 1)">›</button>
            <span class="vt-tab-import-page-size">
              <select v-model.number="importPageSize" style="height:28px;padding:0 20px 0 8px;border:1px solid #e5e7eb;border-radius:4px;font-size:12px;color:#374151;background:#fff;cursor:pointer;margin-left:4px;">
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
                <option :value="50">50条/页</option>
              </select>
            </span>
          </div>
        </div>
        <div class="vt-tab-modal-footer">
          <div class="vt-tab-footer-left">
            <span class="vt-tab-form-soft-count">已选 {{ selectedNewSoftwareIds.length }} 项</span>
          </div>
          <button type="button" class="vt-tab-btn vt-tab-btn-ghost" @click="showSelectSoftware = false">取消</button>
          <button type="button" class="vt-tab-btn vt-tab-btn-primary" @click="confirmAddSoftware" :disabled="selectedNewSoftwareIds.length === 0">确认添加 ({{ selectedNewSoftwareIds.length }})</button>
        </div>
      </div>
    </div>

    <!-- ====== Toast ====== -->
    <div v-if="toast.show" class="vt-tab-toast" :class="'vt-tab-toast--' + toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { versionTrains, reviewResults, releaseHistory } from '../../../data/versionTrainData'

const router = useRouter()

const props = defineProps({ org: { type: Object, required: true } })

// ====== 状态 ======
const trainSearch = ref('')
const activeTrainId = ref(null)
const softwareNameSearch = ref('')
const softwareVersionSearch = ref('')
const showVersionInfo = ref(false)
const showHistory = ref(false)
const selectedSoftwareForBatch = ref([])
const openMenuTrainId = ref(null)
const page = ref(1)
const pageSize = ref(10)

// 弹窗
const showNewTrainModal = ref(false)
const showReleaseModal = ref(false)
const showSelectSoftware = ref(false)
const releaseTrain = ref(null)
const releaseRemark = ref('')
const releaseStartTime = ref('')
const releaseEndTime = ref('')
const importSearch = ref('')
const importTab = ref('software')
const importPage = ref(1)
const importPageSize = ref(10)
const selectedNewSoftwareIds = ref([])

const newTrainForm = reactive({ name: '', versionNum: '', remark: '' })

// Toast
const toast = reactive({ show: false, type: 'info', message: '' })
let toastTimer = null
function showToast(msg, type = 'info') {
  toast.show = true; toast.message = msg; toast.type = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}

// 树展开状态
const openSwNames = ref([])  // Level 1: 软件名称展开
const openSwIds = ref([])    // Level 2: 版本展开
const allExpanded = ref(false)

// ====== Computed ======

// 本组织的火车（模拟数据，暂时全部显示，后续可加 orgId 筛选）
const orgTrains = computed(() => versionTrains)

const filteredTrains = computed(() => {
  const q = trainSearch.value.trim().toLowerCase()
  if (!q) return orgTrains.value
  return orgTrains.value.filter(t => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
})

// 进入时自动选中第一个版本火车
function autoSelectFirstTrain() {
  if (!activeTrainId.value && filteredTrains.value.length > 0) {
    activeTrainId.value = filteredTrains.value[0].id
  }
}
onMounted(() => { setTimeout(autoSelectFirstTrain, 0) })
watch(filteredTrains, autoSelectFirstTrain)

const activeTrain = computed(() =>
  activeTrainId.value ? orgTrains.value.find(t => t.id === activeTrainId.value) || null : null
)

const activeTrainSoftwareItems = computed(() => {
  if (!activeTrain.value) return []
  return activeTrain.value.softwareList.filter(s => (s.type || 'software') !== 'component')
})

const activeTrainSwItems = computed(() => {
  if (!activeTrain.value) return []
  return activeTrain.value.softwareList.filter(s => (s.type || 'software') !== 'component')
})

const groupedBySoftware = computed(() => {
  const map = {}
  activeTrainSwItems.value.forEach(sw => {
    if (!map[sw.name]) map[sw.name] = { name: sw.name, versions: [] }
    map[sw.name].versions.push(sw)
  })
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
})

const filteredSoftware = computed(() => {
  let items = [...activeTrainSoftwareItems.value]
  const nameQ = softwareNameSearch.value.trim().toLowerCase()
  const verQ = softwareVersionSearch.value.trim().toLowerCase()
  if (nameQ) items = items.filter(s => s.name.toLowerCase().includes(nameQ))
  if (verQ) items = items.filter(s => s.version.toLowerCase().includes(verQ))
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSoftware.value.length / pageSize.value)))

const paginatedSoftware = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredSoftware.value.slice(start, start + pageSize.value)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total]
  return [current - 2, current - 1, current, current + 1, current + 2]
})

const canBatch = computed(() => activeTrain.value && (activeTrain.value.status === '待发车' || activeTrain.value.status === '已发车'))

const isAllSelected = computed(() =>
  paginatedSoftware.value.length > 0 && paginatedSoftware.value.every(s => selectedSoftwareForBatch.value.includes(s.id))
)

const isIndeterminate = computed(() => {
  const selected = paginatedSoftware.value.filter(s => selectedSoftwareForBatch.value.includes(s.id))
  return selected.length > 0 && selected.length < paginatedSoftware.value.length
})

const colspanCount = computed(() => {
  let n = 6 // 软件名称 + 版本号 + 语言 + 许可证 + 扫描状态 + 状态
  if (canBatch.value) n += 1
  return n + 1 // + 操作
})

// 模拟组件数据
const mockImportComponents = [
  { id: 201, name: 'vue-router', version: '4.3.0', software: 'Vue.js', lang: 'JavaScript', license: 'MIT' },
  { id: 202, name: 'react-dom', version: '18.2.0', software: 'React', lang: 'JavaScript', license: 'MIT' },
  { id: 203, name: 'react-native', version: '0.73.6', software: 'React', lang: 'JavaScript', license: 'MIT' },
  { id: 204, name: 'spring-boot-starter-web', version: '3.2.3', software: 'Spring Boot', lang: 'Java', license: 'Apache-2.0' },
  { id: 205, name: '@angular/core', version: '17.3.4', software: 'Angular', lang: 'TypeScript', license: 'MIT' },
  { id: 206, name: '@angular/router', version: '17.3.4', software: 'Angular', lang: 'TypeScript', license: 'MIT' },
  { id: 207, name: '@nestjs/common', version: '10.3.8', software: 'NestJS', lang: 'TypeScript', license: 'MIT' },
  { id: 208, name: 'tensorflow-core', version: '2.16.1', software: 'TensorFlow', lang: 'Python', license: 'Apache-2.0' },
  { id: 209, name: 'nuxt', version: '3.12.0', software: 'Nuxt.js', lang: 'JavaScript', license: 'MIT' },
  { id: 210, name: 'next', version: '14.2.3', software: 'Next.js', lang: 'JavaScript', license: 'MIT' },
]

// 弹窗 - 软件列表（已过滤通过）
const filteredImportSoftware = computed(() => {
  const q = importSearch.value.trim().toLowerCase()
  let items = reviewResults.filter(r => r.reviewResult === '通过')
  if (q) items = items.filter(r => r.name.toLowerCase().includes(q))
  return items
})

// 弹窗 - 组件列表（按搜索过滤）
const filteredImportComponent = computed(() => {
  const q = importSearch.value.trim().toLowerCase()
  if (!q) return mockImportComponents
  return mockImportComponents.filter(
    r => r.name.toLowerCase().includes(q) || r.software.toLowerCase().includes(q),
  )
})

// 弹窗分页
const importTotalPages = computed(() => {
  const list = importTab.value === 'software' ? filteredImportSoftware.value : filteredImportComponent.value
  return Math.max(1, Math.ceil(list.length / importPageSize.value))
})

const paginatedImportSoftware = computed(() => {
  const start = (importPage.value - 1) * importPageSize.value
  return filteredImportSoftware.value.slice(start, start + importPageSize.value)
})

const paginatedImportComponent = computed(() => {
  const start = (importPage.value - 1) * importPageSize.value
  return filteredImportComponent.value.slice(start, start + importPageSize.value)
})

// 全选本页
const allSoftwarePageSelected = computed(() =>
  paginatedImportSoftware.value.length > 0 &&
  paginatedImportSoftware.value.every(r => selectedNewSoftwareIds.value.includes(r.id))
)
const allComponentPageSelected = computed(() =>
  paginatedImportComponent.value.length > 0 &&
  paginatedImportComponent.value.every(r => selectedNewSoftwareIds.value.includes(r.id))
)
function toggleAllSoftwarePage() {
  const ids = paginatedImportSoftware.value.map(r => r.id)
  if (allSoftwarePageSelected.value) {
    selectedNewSoftwareIds.value = selectedNewSoftwareIds.value.filter(id => !ids.includes(id))
  } else {
    const existing = new Set(selectedNewSoftwareIds.value)
    ids.forEach(id => existing.add(id))
    selectedNewSoftwareIds.value = [...existing]
  }
}
function toggleAllComponentPage() {
  const ids = paginatedImportComponent.value.map(r => r.id)
  if (allComponentPageSelected.value) {
    selectedNewSoftwareIds.value = selectedNewSoftwareIds.value.filter(id => !ids.includes(id))
  } else {
    const existing = new Set(selectedNewSoftwareIds.value)
    ids.forEach(id => existing.add(id))
    selectedNewSoftwareIds.value = [...existing]
  }
}

watch(importSearch, () => { importPage.value = 1 })
watch(importTab, () => { importPage.value = 1 })
watch(importPageSize, () => { importPage.value = 1 })

// 发车历史
const histSearch = ref('')
const histPage = ref(1)
const HIST_PAGE_SIZE = 8

const filteredHistory = computed(() => {
  const q = histSearch.value.trim().toLowerCase()
  if (!q) return releaseHistory
  return releaseHistory.filter(h =>
    h.id.toLowerCase().includes(q) ||
    h.name.toLowerCase().includes(q)
  )
})

const histTotalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / HIST_PAGE_SIZE)))

const paginatedHistory = computed(() => {
  const start = (histPage.value - 1) * HIST_PAGE_SIZE
  return filteredHistory.value.slice(start, start + HIST_PAGE_SIZE)
})

const histPageNumbers = computed(() => {
  const total = histTotalPages.value
  const current = histPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total]
  return [current - 2, current - 1, current, current + 1, current + 2]
})

watch(histSearch, () => { histPage.value = 1 })

// ====== 方法 ======
function getComponentsForSw(train, swName) {
  if (!train) return []
  return train.softwareList.filter(s => s.type === 'component' && s.software === swName)
}

function toggleSwName(name) {
  const idx = openSwNames.value.indexOf(name)
  if (idx >= 0) openSwNames.value.splice(idx, 1)
  else openSwNames.value.push(name)
}

function isSwNameOpen(name) {
  return openSwNames.value.includes(name)
}

function toggleSwComp(id) {
  const idx = openSwIds.value.indexOf(id)
  if (idx >= 0) openSwIds.value.splice(idx, 1)
  else openSwIds.value.push(id)
}

function isSwOpen(id) {
  return openSwIds.value.includes(id)
}

function treeExpandAll() {
  openSwNames.value = groupedBySoftware.value.map(g => g.name)
  openSwIds.value = activeTrainSwItems.value.map(s => s.id)
  allExpanded.value = true
}

function treeCollapseAll() {
  openSwNames.value = []
  openSwIds.value = []
  allExpanded.value = false
}


function toggleVersionInfo() {
  showVersionInfo.value = !showVersionInfo.value
}

function toggleAll() {
  if (isAllSelected.value) {
    selectedSoftwareForBatch.value = selectedSoftwareForBatch.value.filter(s => !paginatedSoftware.value.some(p => p.id === s))
  } else {
    paginatedSoftware.value.forEach(s => {
      if (!selectedSoftwareForBatch.value.includes(s.id)) selectedSoftwareForBatch.value.push(s.id)
    })
  }
}

function toggleSoftwareSelection(id) {
  const idx = selectedSoftwareForBatch.value.indexOf(id)
  if (idx >= 0) selectedSoftwareForBatch.value.splice(idx, 1)
  else selectedSoftwareForBatch.value.push(id)
}

function batchUpdateStatus(status) {
  paginatedSoftware.value.forEach(s => {
    if (selectedSoftwareForBatch.value.includes(s.id)) {
      s.reviewResult = status
    }
  })
  selectedSoftwareForBatch.value = []
  showToast(`已批量更新为「${status}」`)
}

function batchOnline() {
  paginatedSoftware.value.forEach(s => {
    if (selectedSoftwareForBatch.value.includes(s.id)) s.published = true
  })
  selectedSoftwareForBatch.value = []
  showToast('批量上架成功')
}

function batchOffline() {
  paginatedSoftware.value.forEach(s => {
    if (selectedSoftwareForBatch.value.includes(s.id)) s.published = false
  })
  selectedSoftwareForBatch.value = []
  showToast('批量下架成功')
}

function batchRemoveSoftware() {
  if (!activeTrain.value) return
  selectedSoftwareForBatch.value.forEach(id => {
    const idx = activeTrain.value.softwareList.findIndex(s => s.id === id)
    if (idx >= 0) activeTrain.value.softwareList.splice(idx, 1)
  })
  const count = selectedSoftwareForBatch.value.length
  selectedSoftwareForBatch.value = []
  showToast(`已批量移除 ${count} 项`)
}

function toggleShelf(sw) {
  sw.published = !sw.published
  showToast(sw.published ? '已上架' : '已下架')
}

function removeSoftwareFromTrain(id) {
  if (!activeTrain.value) return
  const idx = activeTrain.value.softwareList.findIndex(s => s.id === id)
  if (idx >= 0) {
    activeTrain.value.softwareList.splice(idx, 1)
    showToast('已从版本火车中移除')
  }
}

function confirmDeleteTrain(train) {
  const idx = orgTrains.value.indexOf(train)
  if (idx >= 0) {
    orgTrains.value.splice(idx, 1)
    if (activeTrainId.value === train.id) activeTrainId.value = null
    showToast(`已删除版本火车 ${train.id}`)
  }
  openMenuTrainId.value = null
}

function createNewTrain() {
  const name = newTrainForm.name.trim()
  const versionNum = newTrainForm.versionNum.trim()
  if (!name || !versionNum) return
  const count = orgTrains.value.length + 1
  const newTrain = {
    id: `VT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`,
    name,
    versionNum,
    status: '待发车',
    createdAt: new Date().toISOString().slice(0, 10),
    softwareList: [],
    remark: newTrainForm.remark.trim() || '',
  }
  orgTrains.value.unshift(newTrain)
  activeTrainId.value = newTrain.id
  showNewTrainModal.value = false
  newTrainForm.name = ''
  newTrainForm.versionNum = ''
  newTrainForm.remark = ''
  showToast('版本火车创建成功')
}

function openReleaseForm(train) {
  releaseTrain.value = train
  releaseRemark.value = ''
  releaseStartTime.value = ''
  releaseEndTime.value = ''
  showReleaseModal.value = true
}

function confirmRelease() {
  if (!releaseTrain.value) return
  if (!releaseStartTime.value) { showToast('请填写开始时间'); return }
  if (!releaseEndTime.value) { showToast('请填写结束时间'); return }
  releaseTrain.value.status = '已发车'
  releaseTrain.value.releaseTime = releaseStartTime.value.replace('T', ' ')
  releaseTrain.value.endTime = releaseEndTime.value.replace('T', ' ')
  releaseTrain.value.remark = releaseRemark.value || releaseTrain.value.remark
  releaseTrain.value.softwareList.forEach(s => {
    if ((s.type || 'software') !== 'component') s.published = true
  })
  showReleaseModal.value = false
  showToast(`版本火车 ${releaseTrain.value.id} 已成功发车`)
}

function toggleNewSoftware(id) {
  const idx = selectedNewSoftwareIds.value.indexOf(id)
  if (idx >= 0) selectedNewSoftwareIds.value.splice(idx, 1)
  else selectedNewSoftwareIds.value.push(id)
}

function confirmAddSoftware() {
  if (!activeTrain.value) return
  selectedNewSoftwareIds.value.forEach(id => {
    const r = reviewResults.find(r => r.id === id)
    if (r && !activeTrain.value.softwareList.some(s => s.name === r.name)) {
      const existingIds = activeTrain.value.softwareList.map(s => s.id)
      const newId = Math.max(...existingIds, 1000) + 1
      activeTrain.value.softwareList.push({
        id: newId,
        name: r.name,
        type: 'software',
        version: '1.0.0',
        lang: r.lang,
        license: r.license,
        scanStatus: r.scanStatus || '未扫描',
        reviewResult: r.reviewResult || '待定',
        reviewOpinion: r.reviewOpinion || '',
        status: '待发布',
        scanned: r.scanStatus === '已扫描',
      })
    }
  })
  selectedNewSoftwareIds.value = []
  showSelectSoftware.value = false
  showToast('软件已添加到版本火车')
}

// 监听 activeTrainId 变化重置选择
watch(activeTrainId, () => {
  selectedSoftwareForBatch.value = []
  softwareNameSearch.value = ''
  softwareVersionSearch.value = ''
  page.value = 1
  openSwIds.value = []
  showVersionInfo.value = false
})
</script>

<style scoped>
/* ====== Layout ====== */
.vt-tab-page {
  position: relative;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.vt-tab-layout {
  display: flex;
  gap: 18px;
  min-height: 480px;
}

/* ====== Sidebar ====== */
.vt-tab-sidebar {
  flex-shrink: 0;
  width: 280px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.vt-tab-sidebar-header {
  padding: 14px 14px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.vt-tab-sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vt-tab-sidebar-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.vt-tab-count-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
}

.vt-tab-sidebar-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.vt-tab-pill-btn {
  flex: 1;
  padding: 5px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
}

.vt-tab-pill-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

.vt-tab-pill-btn--primary:hover { filter: brightness(1.05); }
.vt-tab-pill-btn--ghost:hover { border-color: #da203e; color: #da203e; }

.vt-tab-sidebar-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #9ca3af;
}

.vt-tab-sidebar-search:focus-within {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
}

.vt-tab-sidebar-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  background: transparent;
  color: #374151;
}

.vt-tab-sidebar-input::placeholder { color: #9ca3af; }

.vt-tab-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.vt-tab-sidebar-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  margin-bottom: 4px;
  font-family: inherit;
  transition: all 0.15s;
}

.vt-tab-sidebar-item:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.vt-tab-sidebar-item--active {
  background: #fef2f2;
  border-color: #fecaca;
}

.vt-tab-sidebar-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.vt-tab-sidebar-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vt-tab-dot-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  flex-shrink: 0;
}

.vt-tab-sidebar-item--active .vt-tab-dot-badge {
  background: #fecaca;
  color: #da203e;
}

.vt-tab-sidebar-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 11px;
}

.vt-tab-sidebar-status {
  padding: 0 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}

.vt-tab-sidestatus--待发车 { background: #fef3c7; color: #92400e; }
.vt-tab-sidestatus--已发车 { background: #dcfce7; color: #15803d; }
.vt-tab-sidestatus--已过期 { background: #f3f4f6; color: #6b7280; }

.vt-tab-sidebar-id {
  color: #9ca3af;
  font-size: 10px;
}

.vt-tab-sidebar-empty {
  padding: 30px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.vt-tab-text-muted { color: #9ca3af; }

/* ====== Dot menu ====== */
.vt-tab-dot-wrap {
  position: relative;
  margin-left: auto;
}

.vt-tab-dot-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.15s;
}

.vt-tab-dot-btn:hover { background: #f3f4f6; color: #374151; }

.vt-tab-dot-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin: 2px 0 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 20;
  min-width: 100px;
}

.vt-tab-dot-menu-item {
  padding: 6px 14px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
}

.vt-tab-dot-menu-item:hover { background: #f3f4f6; }
.vt-tab-dot-menu-item--danger { color: #dc2626; }

/* ====== Main Content ====== */
.vt-tab-content {
  flex: 1;
  min-width: 0;
}

.vt-tab-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.vt-tab-card--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.vt-tab-empty-state {
  text-align: center;
  padding: 40px;
}

.vt-tab-empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.vt-tab-empty-text {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.vt-tab-empty-hint {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.vt-tab-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.vt-tab-card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.vt-tab-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.vt-tab-title-status {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.vt-tab-title-time {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 4px;
}

.vt-tab-title-time--end { color: #dc2626; }

.vt-tab-card-header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vt-tab-card-remark {
  margin-top: 8px;
}

.vt-tab-card-remark-text {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.vt-tab-card-toolbar {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.vt-tab-card-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #9ca3af;
  max-width: 200px;
  background: #fff;
}

.vt-tab-card-search:focus-within {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
}

.vt-tab-card-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  background: transparent;
  color: #374151;
}

.vt-tab-card-input::placeholder { color: #9ca3af; }

.vt-tab-batch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vt-tab-batch-count {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* ====== Table ====== */
.vt-tab-table-wrap {
  overflow-x: auto;
}

.vt-tab-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.vt-tab-table th {
  padding: 10px 14px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.vt-tab-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.vt-tab-th-chk, .vt-tab-td-chk { width: 40px; text-align: center; }
.vt-tab-th-op { text-align: right; }
.vt-tab-td-op { text-align: right; white-space: nowrap; }

.vt-tab-soft-name { font-weight: 500; }

.vt-tab-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #6b7280;
}

.vt-tab-version-link {
  color: #dc2626 !important;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-style: dotted;
}
.vt-tab-version-link:hover {
  color: #b91c1c !important;
  text-decoration-style: solid;
}

.vt-tab-empty-cell {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
}

/* ====== Badges ====== */
.vt-tab-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.vt-tab-badge--pass { background: #dcfce7; color: #15803d; }
.vt-tab-badge--fail { background: #fef2f2; color: #dc2626; }
.vt-tab-badge--pending { background: #fef3c7; color: #92400e; }
.vt-tab-badge--muted { background: #f3f4f6; color: #6b7280; }
.vt-tab-badge--active { background: #dcfce7; color: #15803d; }
.vt-tab-badge--已发车 { background: #dcfce7; color: #15803d; }
.vt-tab-badge--已过期 { background: #f3f4f6; color: #6b7280; }
.vt-tab-badge--已发车 { background: #dcfce7; color: #15803d; }

/* ====== Pagination ====== */
.vt-tab-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}

.vt-tab-page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.vt-tab-page-btn:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.vt-tab-page-btn:disabled { opacity: 0.35; cursor: default; }
.vt-tab-page-btn--active { background: #da203e; color: #fff; border-color: #da203e; }
.vt-tab-page-page-btn--active:hover { background: #b91c1c; }

.vt-tab-page-info {
  margin-left: 8px;
  font-size: 12px;
  color: #9ca3af;
}

/* ====== Buttons ====== */
.vt-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.vt-tab-btn:hover { border-color: #da203e; color: #da203e; }
.vt-tab-btn-xs { padding: 5px 14px; font-size: 12px; }
.vt-tab-btn-primary { background: #da203e; color: #fff; border-color: #da203e; }
.vt-tab-btn-primary:hover { filter: brightness(1.05); color: #fff; }
.vt-tab-btn-outline { background: transparent; color: #da203e; border-color: #da203e; }
.vt-tab-btn-outline:hover { background: #fef2f2; color: #b91c1c; }
.vt-tab-btn-danger { background: transparent; color: #b91c1c; border-color: #fca5a5; }
.vt-tab-btn-danger:hover { background: #fef2f2; color: #991b1b; border-color: #f87171; }
.vt-tab-btn-ghost { background: transparent; color: #6b7280; border-color: transparent; }
.vt-tab-btn-ghost:hover { color: #da203e; }

.vt-tab-linkish {
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: #da203e;
  cursor: pointer;
}

.vt-tab-linkish:hover { text-decoration: underline; }
.vt-tab-linkish--danger { color: #dc2626; }

/* ====== Tree Card ====== */
.vt-tab-tree-card {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ====== Tree ====== */
.vt-tab-tree {
  padding: 0;
}

.vt-tab-tree-train-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;
}

.vt-tab-tree-train-id { font-weight: 700; color: #da203e; font-size: 13px; }
.vt-tab-tree-train-name { font-size: 14px; font-weight: 600; color: #111827; flex: 1; }
.vt-tab-tree-train-status { font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; }

.vt-tab-tree-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.vt-tab-tree-toolbar-btn {
  padding: 2px 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 12px;
  color: #da203e;
  cursor: pointer;
}

.vt-tab-tree-toolbar-btn:hover { opacity: 0.7; }

/* ====== Tree - Level 1: Software Group ====== */
.vt-tab-tree-group { }

.vt-tab-tree-soft-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  transition: background 0.15s;
}

.vt-tab-tree-soft-row:hover { background: #f5f5f5; }

.vt-tab-tree-soft-name {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  flex: 1;
}

.vt-tab-tree-soft-children {
  padding-left: 20px;
  border-left: 1px solid #e5e7eb;
  margin-left: 7px;
}

/* ====== Tree - Level 2: Version ====== */
.vt-tab-tree-version { }

.vt-tab-tree-ver-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  cursor: pointer;
  transition: background 0.15s;
}

.vt-tab-tree-ver-row:hover { background: #f5f5f5; }

.vt-tab-tree-expand-icon--sub { width: 14px; margin-left: 2px; }

.vt-tab-tree-sw-version { color: #2563eb; font-size: 13px; font-weight: 500; min-width: 80px; }

.vt-tab-tree-ver-children {
  padding-left: 20px;
  border-left: 1px solid #e5e7eb;
  margin-left: 7px;
}

/* ====== Tree - Level 3: Component ====== */
.vt-tab-tree-component {
  padding: 4px 0;
}

.vt-tab-tree-comp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.vt-tab-tree-comp-connector { color: #d1d5db; font-size: 13px; }
.vt-tab-tree-comp-name { font-weight: 500; color: #374151; font-size: 13px; }
.vt-tab-tree-comp-version { color: #6b7280; }
.vt-tab-tree-comp-empty { padding: 6px 0; color: #d1d5db; font-size: 12px; }
.vt-tab-tree-empty-sub { padding: 6px 0; color: #d1d5db; font-size: 12px; }

/* ====== Tree shared ====== */
.vt-tab-tree-expand-icon {
  width: 16px;
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}


.vt-tab-tree-empty-row { padding: 20px 0; text-align: center; color: #9ca3af; }
/* ====== History Card ====== */
.vt-tab-card--history { margin-bottom: 16px; }

/* ====== Modal ====== */
.vt-tab-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.vt-tab-modal {
  width: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: modalIn 0.2s ease;
}

.vt-tab-modal--wide { width: 720px; }
.vt-tab-modal--xl { width: 960px; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.vt-tab-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.vt-tab-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.vt-tab-modal-close {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vt-tab-modal-close:hover { background: #f3f4f6; color: #374151; }

.vt-tab-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.vt-tab-modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.vt-tab-footer-left { margin-right: auto; }

/* ====== Form ====== */
.vt-tab-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vt-tab-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.vt-tab-form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.vt-tab-form-required {
  color: #dc2626;
  margin-left: 2px;
}

.vt-tab-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  color: #374151;
  outline: none;
  box-sizing: border-box;
}

.vt-tab-input:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }
.vt-tab-input::placeholder { color: #9ca3af; }

.vt-tab-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  color: #374151;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.vt-tab-textarea:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }

.vt-tab-release-info {
  margin: 0 0 12px;
  font-size: 14px;
  color: #374151;
}

/* ====== Software Select ====== */
.vt-tab-form-software-list-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  max-height: 260px;
  overflow-y: auto;
}

/* ====== 导入弹窗列表（表格模式） ====== */
.vt-tab-table--import { font-size: 13px; table-layout: fixed; }
.vt-tab-table--import th {
  padding: 8px 10px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
  font-size: 12px;
}
/* 表头多选框列：铺满整格方便点击 */
.vt-tab-table--import th:first-child { padding: 0; }
.vt-tab-table--import th:first-child .vt-tab-im-check { width: 28px; height: 36px; }
.vt-tab-table--import td { padding: 8px 10px; }
.vt-tab-table--import .vt-tab-im-cell { white-space: nowrap; width:1%; overflow: hidden; text-overflow: ellipsis; }

.vt-tab-im-row { cursor: pointer; transition: background 0.15s; }
.vt-tab-im-row:hover { background: #f9fafb; }
/* 选中行仅展示复选框对勾，不加背景色 */

.vt-tab-im-check { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; user-select: none; }
.vt-tab-im-check--on { color: #da203e; font-weight: 700; font-size: 15px; }
.vt-tab-im-check--off { color: #d1d5db; font-size: 17px; line-height: 1; font-family: 'Segoe UI', Arial, sans-serif; }

.vt-tab-im-name { font-weight: 500; font-size: 13px; color: #111827; }
.vt-tab-im-cell { font-size: 12px; color: #374151; }
.vt-tab-im-lang {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 11px;
  background: #f3f4f6;
  color: #6b7280;
}
.vt-tab-im-license {
  font-size: 11px;
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.vt-tab-im-vuln {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 10px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  background: #fef2f2;
  color: #dc2626;
}
.vt-tab-im-safe {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 10px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  background: #ecfdf5;
  color: #059669;
}
.vt-tab-form-soft-count { font-size: 12px; color: #6b7280; }

/* ====== Toast ====== */
.vt-tab-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 2000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: toastIn 0.25s ease;
}

.vt-tab-toast--info { background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; }
.vt-tab-toast--success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ====== 导入弹窗 Tab 栏 ====== */
.vt-tab-im-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.vt-tab-im-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px 10px;
  margin-bottom: -1px;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s;
}

.vt-tab-im-tab.active {
  color: #da203e;
}

.vt-tab-im-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #da203e;
}

.vt-tab-im-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #f3f4f6;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.vt-tab-im-tab.active .vt-tab-im-tab-count {
  background: #fef2f2;
  color: #da203e;
}

/* ====== 导入弹窗分页 ====== */
.vt-tab-import-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.vt-tab-import-page-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #da203e;
}

.vt-tab-import-page-size {
  margin-left: 4px;
}
</style>
