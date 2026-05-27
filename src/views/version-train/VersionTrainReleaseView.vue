<template>
  <div class="vt-page">
    <!-- 主布局：左侧边栏 + 右侧内容 -->
    <div class="vt-layout">
      <aside class="vt-sidebar">
        <div class="vt-sidebar-header">
          <div class="vt-sidebar-title-row">
            <h3 class="vt-sidebar-title">版本火车</h3>
          </div>
          <div class="vt-sidebar-actions-row">
            <button type="button" class="vt-pill-btn vt-pill-btn--primary" @click="showNewTrainModal = true">+ 新增</button>
            <button type="button" class="vt-pill-btn vt-pill-btn--ghost" @click="showHistory = !showHistory">发车历史</button>
          </div>
          <div class="vt-sidebar-search">
            <svg class="vt-sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="trainSearch" type="text" class="vt-sidebar-input" placeholder="搜索火车号或名称..." />
          </div>
        </div>
        <div class="vt-sidebar-list" v-if="filteredTrains.length > 0" @click.self="closeAllMenus">
          <button
            v-for="train in filteredTrains"
            :key="train.id"
            type="button"
            class="vt-sidebar-item"
            :class="{ 'vt-sidebar-item--active': activeTrainId === train.id }"
            @click="activeTrainId = train.id"
          >
            <div class="vt-sidebar-item-main">
              <span class="vt-sidebar-name">{{ train.name }}</span>
              <span class="vt-dot-badge">{{ train.softwareList.length }}</span>
            </div>
            <div class="vt-sidebar-item-meta">
              <span class="vt-sidebar-item-status" :class="'vt-sidestatus--' + train.status">{{ train.status }}</span>
              <span class="vt-sidebar-id">{{ train.id }}</span>
              <div class="vt-dot-wrap" @click.stop="toggleTrainMenu(train.id)">
                <span class="vt-dot-btn">···</span>
                <ul v-if="openMenuTrainId === train.id" class="vt-dot-menu">
                  <li class="vt-dot-menu-item vt-dot-menu-item--danger" @click.stop="closeAllMenus(); confirmDeleteTrain(train)">删除</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
        <div v-else class="vt-sidebar-empty">
          <span class="vt-text-muted">{{ versionTrains.length === 0 ? '暂无版本火车' : '没有匹配的结果' }}</span>
        </div>
      </aside>

      <main class="vt-content">
        <!-- ====== 版本信息树视图（当前选中火车） ====== -->
        <section v-if="showVersionInfo" class="vt-card">
          <div class="vt-back-bar">
            <button type="button" class="vt-linkish" @click="showVersionInfo = false">← 返回</button>
            <span class="vt-back-title">版本火车信息树</span>
          </div>
          <div class="vt-tree">
            <template v-if="activeTrain">
              <div class="vt-tree-train-header vt-tree-train-header--active">
                <span class="vt-tree-train-arrow">▼</span>
                <span class="vt-tree-train-id">{{ activeTrain.id }}</span>
                <span class="vt-tree-train-name">{{ activeTrain.name }}</span>
                <span class="vt-tree-train-status" :class="'vt-sidestatus--' + activeTrain.status">{{ activeTrain.status }}</span>
                <span class="vt-dot-badge">{{ activeTrain.softwareList.length }}</span>
              </div>
              <div class="vt-tree-toolbar">
                <button type="button" class="vt-tree-toolbar-btn" @click="expandAll">全部展开</button>
                <button type="button" class="vt-tree-toolbar-btn" @click="collapseAll">全部收起</button>
              </div>
              <div class="vt-tree-children">
                <div v-for="sw in activeTrain.softwareList.filter(s => (s.type || 'software') !== 'component')" :key="sw.id" class="vt-tree-software is-active">
                  <div class="vt-tree-sw-row" @click="toggleSwComp(sw.id)">
                    <span class="vt-tree-expand-icon">{{ isSwOpen(sw.id) ? '▼' : '▶' }}</span>
                    <span class="vt-tree-sw-name">{{ sw.name }}</span>
                    <span class="vt-tree-sw-version">v{{ sw.version }}</span>
                    <span class="vt-badge vt-badge--sm" :class="reviewResultClass(sw.reviewResult)">{{ sw.reviewResult || '未评审' }}</span>
                    <span v-if="sw.scanStatus === '已扫描'" class="vt-tree-meta scan-ok">✓ 已扫描</span>
                    <span v-else class="vt-tree-meta scan-none">○ 未扫描</span>
                    <span class="vt-tree-sw-opinion" :title="sw.reviewOpinion">{{ sw.reviewOpinion ? sw.reviewOpinion : '' }}</span>
                  </div>
                  <!-- 组件子节点 -->
                  <div v-if="isSwOpen(sw.id)" class="vt-tree-sw-children">
                    <div v-if="getComponentsForSw(activeTrain, sw.name).length === 0" class="vt-tree-comp-empty">── 暂无组件</div>
                    <div
                      v-for="(comp, compIdx) in getComponentsForSw(activeTrain, sw.name)"
                      :key="comp.id"
                      class="vt-tree-component"
                    >
                      <div class="vt-tree-comp-row">
                        <span class="vt-tree-comp-connector">{{ compIdx === getComponentsForSw(activeTrain, sw.name).length - 1 ? '└' : '├' }}</span>
                        <strong class="vt-tree-comp-tag">组件</strong>
                        <span class="vt-tree-comp-name">{{ comp.name.split(' / ')[1] || comp.name }}</span>
                        <span class="vt-tree-comp-version">v{{ comp.version }}</span>
                        <span class="vt-tree-comp-lang">{{ comp.lang }}</span>
                        <span class="vt-badge vt-badge--sm" :class="reviewResultClass(comp.reviewResult)">{{ comp.reviewResult || '未评审' }}</span>
                        <span v-if="comp.scanStatus === '已扫描'" class="vt-tree-meta scan-ok">✓ 已扫描</span>
                        <span v-else class="vt-tree-meta scan-none">○ 未扫描</span>
                        <span class="vt-tree-sw-opinion" :title="comp.reviewOpinion">{{ comp.reviewOpinion ? comp.reviewOpinion : '' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="activeTrain.softwareList.filter(s => (s.type || 'software') !== 'component').length === 0" class="vt-tree-empty-row">暂无软件</div>
              </div>
            </template>
            <div v-else class="vt-tree-empty">
              <span class="vt-text-muted">请从左侧列表选择一个版本火车</span>
            </div>
          </div>
        </section>

        <!-- ====== 普通列表视图 ====== -->
        <template v-if="!showVersionInfo">
        <!-- 当前火车软件列表表格 -->
        <section class="vt-card">
          <div class="vt-card-header" v-if="activeTrain">
            <div class="vt-card-header-row">
              <h2 class="vt-card-title">{{ activeTrain.id }} — {{ activeTrain.name }} <span class="vt-title-status" :class="'vt-sidestatus--' + activeTrain.status">{{ activeTrain.status }}</span>
                <span v-if="activeTrain.releaseTime" class="vt-title-time">发布时间：{{ activeTrain.releaseTime }}</span>
                <span v-if="activeTrain.endTime" class="vt-title-time vt-title-time--end">结束时间：{{ activeTrain.endTime }}</span>
              </h2>
              <div class="vt-card-header-actions">
                <template v-if="activeTrain.status === '待发车'">
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="showImportExcelModal = true">
                    导入 Excel
                  </button>
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="showSelectSoftware = true">
                    从软件管理导入
                  </button>
                </template>
                <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="toggleVersionInfo">
                  {{ showVersionInfo ? '收起信息树' : '版本火车信息树' }}
                </button>
                <button v-if="activeTrain.status === '待发车'" type="button" class="vt-btn vt-btn-primary vt-btn-xs" @click="openReleaseForm(activeTrain)">
                  发车
                </button>
              </div>
            </div>
            <div class="vt-card-header-footer">
            <!-- 第一行：发车备注 -->
            <div class="vt-card-remark-row">
              <div v-if="activeTrain && activeTrain.remark" class="vt-card-remark-block" :title="activeTrain.remark">
                <span class="vt-card-remark-text">{{ activeTrain.remark }}</span>
              </div>
            </div>
            <!-- 第二行：搜索框 + 批量操作 -->
            <div class="vt-card-toolbar">
              <div class="vt-card-search">
                <svg class="vt-card-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="softwareNameSearch" type="text" class="vt-card-input" placeholder="搜索软件名称..." />
              </div>
              <div class="vt-card-search">
                <svg class="vt-card-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="softwareVersionSearch" type="text" class="vt-card-input" placeholder="搜索版本号..." />
              </div>
              <div v-if="activeTrain && (activeTrain.status === '待发车' || activeTrain.status === '已发车') && selectedSoftwareForBatch.length > 0" class="vt-batch-bar">
                <span class="vt-batch-count">已选 {{ selectedSoftwareForBatch.length }} 项</span>
                <div class="vt-batch-actions" v-if="activeTrain.status === '待发车'">
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="batchUpdateStatus('通过')">批量通过</button>
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="batchUpdateStatus('不通过')">批量不通过</button>
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="batchUpdateStatus('待定')">批量待定</button>
                </div>
                <div class="vt-batch-actions" v-if="activeTrain.status === '已发车'">
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="batchOnline">批量上架</button>
                  <button type="button" class="vt-btn vt-btn-outline vt-btn-xs" @click="batchOffline">批量下架</button>
                </div>
                <button type="button" class="vt-linkish vt-linkish--muted" @click="selectedSoftwareForBatch = []">取消选择</button>
              </div>
            </div>
            </div>
          </div>
          <div class="vt-card-notrain" v-else>
            <div class="vt-empty">请从左侧列表选择一个版本火车</div>
          </div>
          <div class="vt-table-wrap">
            <table class="vt-table">
              <thead>
                <tr>
                  <th class="vt-th-chk" v-if="activeTrain.status === '待发车' || activeTrain.status === '已发车'">
                    <input type="checkbox" :checked="isAllSoftwareSelected" :indeterminate.prop="isSoftwareIndeterminate" @change="toggleAllSoftware">
                  </th>
                  <th>名称</th>
                  <th>类型</th>
                  <th>版本号</th>
                  <th>扫描状态</th>
                  <th>评审结果</th>
                  <th>审核意见</th>
                  <th>导入日期</th>
                  <th class="vt-th-op">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sw in paginatedSoftwareInTrain" :key="sw.id">
                  <td class="vt-td-chk" v-if="activeTrain.status === '待发车' || activeTrain.status === '已发车'">
                    <input
                      type="checkbox"
                      :checked="selectedSoftwareForBatch.includes(sw.id)"
                      @change="toggleSoftware(sw)"
                    >
                  </td>
                  <td>
                    {{ sw.name }}
                  </td>
                  <td>
                    <span class="vt-badge" :class="(sw.type || 'software') === 'component' ? 'vt-badge--muted' : 'vt-badge--primary'">{{ (sw.type || 'software') === 'component' ? '组件' : '软件' }}</span>
                  </td>
                  <td><span class="vt-code vt-link" @click="onViewDetail(sw)" style="cursor:pointer">{{ sw.version }}</span></td>
                  <td>
                    <span class="vt-badge" :class="sw.scanStatus === '已扫描' ? 'vt-badge--success' : 'vt-badge--muted'">
                      {{ sw.scanStatus || '--' }}
                    </span>
                  </td>
                  <td>
                    <template v-if="activeTrain.status === '待发车'">
                      <span class="vt-badge" :class="reviewResultClass(sw.reviewResult)">
                        {{ sw.reviewResult === '通过' ? '待发布' : sw.reviewResult === '不通过' ? '未通过' : sw.reviewResult || '--' }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="vt-badge" :class="sw.published ? 'vt-badge--success' : 'vt-badge--muted'">
                        {{ sw.published ? '已发布' : '已下架' }}
                      </span>
                    </template>
                  </td>
                  <td>
                    <span class="vt-cell-opinion" :title="sw.reviewOpinion">{{ sw.reviewOpinion || '--' }}</span>
                  </td>
                  <td>{{ sw.reviewedAt || '--' }}</td>
                  <td class="vt-td-op">
                    <template v-if="activeTrain.status === '待发车'">
                      <button type="button" class="vt-linkish vt-linkish--muted" @click="openEditModal(sw)">编辑</button>
                      <span class="vt-op-sep"></span>
                      <button type="button" class="vt-linkish vt-linkish--danger" @click="removeSoftware(sw)">移除</button>
                    </template>
                    <template v-else>
                      <button type="button" class="vt-linkish" :class="sw.published ? 'vt-linkish--warning' : ''" @click="togglePublish(sw)">
                        {{ sw.published ? '下架' : '重新上架' }}
                      </button>
                    </template>
                  </td>
                </tr>
                <tr v-if="activeTrain && currentSoftwareList.length === 0">
                  <td colspan="9" class="vt-empty-cell">
                    <div class="vt-empty">该版本火车暂无软件</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- 分页控件 -->
            <div v-if="activeTrain && swTotalPages > 1" class="vt-pagination">
              <button class="vt-page-btn" :disabled="swPage <= 1" @click="swPage--">‹</button>
              <span class="vt-page-info">{{ swPage }} / {{ swTotalPages }}</span>
              <button class="vt-page-btn" :disabled="swPage >= swTotalPages" @click="swPage++">›</button>
              <span class="vt-page-total">共 {{ filteredSoftwareInTrain.length }} 项</span>
            </div>
          </div>
        </section>

        <!-- 这里不再有内联历史模块，改成弹窗 -->
      </template>
      </main>
    </div>

    <!-- ========== 发车历史弹窗 ========== -->
    <div v-if="showHistory" class="vt-modal-overlay" @click.self="showHistory = false">
      <div class="vt-modal vt-modal--xl">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">发车历史记录</h3>
          <button type="button" class="vt-modal-close" @click="showHistory = false">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <!-- 搜索 -->
            <div class="vt-form-group vt-form-group--search">
              <div class="vt-card-search">
                <svg class="vt-card-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="histSearch" type="text" class="vt-card-input" placeholder="搜索版本火车号或名称..." />
              </div>
            </div>
          </div>
          <div class="vt-table-wrap vt-table-wrap--history">
            <table class="vt-table">
              <thead>
                <tr>
                  <th>版本火车号</th>
                  <th>名称</th>
                  <th>发车时间</th>
                  <th>结束时间</th>
                  <th>软件数量</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rec in paginatedHistory" :key="rec.id">
                  <td><span class="vt-code">{{ rec.id }}</span></td>
                  <td>{{ rec.name }}</td>
                  <td>{{ rec.releaseTime }}</td>
                  <td>{{ rec.endTime }}</td>
                  <td>{{ rec.softwareCount }}</td>
                  <td>
                    <span class="vt-badge" :class="rec.status === '已发车' ? 'vt-badge--success' : 'vt-badge--muted'">
                      {{ rec.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="filteredHistory.length === 0">
                  <td colspan="7" class="vt-empty-cell">
                    <div class="vt-empty">没有匹配的历史记录</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- 分页 -->
            <div v-if="filteredHistory.length > 0" class="vt-pagination">
              <button class="vt-page-btn" :disabled="histPage <= 1" @click="histPage--">‹</button>
              <span class="vt-page-info">{{ histPage }} / {{ histTotalPages }}</span>
              <button class="vt-page-btn" :disabled="histPage >= histTotalPages" @click="histPage++">›</button>
              <span class="vt-page-total">共 {{ filteredHistory.length }} 条</span>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <button type="button" class="vt-btn vt-btn-outline" @click="showHistory = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ========== 编辑软件评审弹窗 ========== -->
    <div v-if="showEditModal" class="vt-modal-overlay" @click.self="closeEditModal">
      <div class="vt-modal">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">编辑评审 — {{ editSoftwareData?.name || '' }}</h3>
          <button type="button" class="vt-modal-close" @click="closeEditModal">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <div class="vt-form-group">
              <label class="vt-form-label">软件/组件名称</label>
              <div class="vt-form-value">{{ editSoftwareData?.name }} <span class="vt-code">v{{ editSoftwareData?.version }}</span></div>
            </div>
            <div class="vt-form-row">
              <div class="vt-form-group">
                <label class="vt-form-label">评审结果</label>
                <select v-model="editForm.reviewResult" class="vt-input">
                  <option value="">-- 请选择 --</option>
                  <option value="通过">待发布</option>
                  <option value="不通过">未通过</option>
                  <option value="待定">待定</option>
                </select>
              </div>
            </div>
            <div class="vt-form-group">
              <label class="vt-form-label">审核意见</label>
              <textarea v-model="editForm.reviewOpinion" class="vt-input vt-textarea" rows="4" placeholder="输入审核意见..."></textarea>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <button type="button" class="vt-btn vt-btn-outline" @click="closeEditModal">取消</button>
          <button type="button" class="vt-btn vt-btn-primary" @click="saveEditModal">保存</button>
        </div>
      </div>
    </div>

    <!-- ========== 导入 Excel 弹窗 ========== -->
    <div v-if="showImportExcelModal" class="vt-modal-overlay" @click.self="showImportExcelModal = false">
      <div class="vt-modal vt-modal--wide">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">导入 Excel 软件列表</h3>
          <button type="button" class="vt-modal-close" @click="showImportExcelModal = false">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <div class="vt-form-group">
              <label class="vt-form-label">选择 Excel 文件</label>
              <div class="vt-file-upload" @click="fileInputRef?.click()">
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".xlsx,.xls"
                  class="vt-file-input"
                  @change="onFileSelected"
                />
                <svg class="vt-file-upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <p class="vt-file-upload-text">{{ importFileName || '点击选择 .xlsx / .xls 文件' }}</p>
              </div>
            </div>

            <div v-if="excelPreview.length > 0" class="vt-form-group">
              <label class="vt-form-label">预览（共 {{ excelPreview.length }} 条）</label>
              <div class="vt-import-preview-wrap">
                <table class="vt-table vt-table--compact">
                  <thead>
                    <tr>
                      <th>软件名称</th>
                      <th>版本号</th>
                      <th>编程语言</th>
                      <th>开源许可证</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in excelPreview" :key="idx">
                      <td>{{ item.name }}</td>
                      <td><span class="vt-code">{{ item.version }}</span></td>
                      <td>{{ item.lang || '--' }}</td>
                      <td>{{ item.license || '--' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <button type="button" class="vt-btn vt-btn-outline" @click="showImportExcelModal = false">取消</button>
          <button
            type="button"
            class="vt-btn vt-btn-primary"
            :disabled="excelPreview.length === 0"
            @click="importFromExcel"
          >
            确认导入（{{ excelPreview.length }} 条）
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 从软件管理导入 弹窗 ========== -->
    <div v-if="showSelectSoftware" class="vt-modal-overlay" @click.self="showSelectSoftware = false">
      <div class="vt-modal vt-modal--xl">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">从软件管理中选择已扫描软件</h3>
          <button type="button" class="vt-modal-close" @click="showSelectSoftware = false">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <div class="vt-form-row">
              <div class="vt-form-group" style="flex:1;">
                <label class="vt-form-label">搜索</label>
                <input v-model="softwareSearch" type="text" class="vt-input" placeholder="输入软件名称或组件名搜索...">
              </div>
            </div>

            <!-- Tab 切换栏 -->
            <div class="vt-im-tabs">
              <button
                class="vt-im-tab"
                :class="{ active: softwareImportTab === 'software' }"
                @click="softwareImportTab = 'software'"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                软件
                <span class="vt-im-tab-count">{{ scannedSourceList.filter(i => i.type === 'software').length }}</span>
              </button>
              <button
                class="vt-im-tab"
                :class="{ active: softwareImportTab === 'component' }"
                @click="softwareImportTab = 'component'"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                组件
                <span class="vt-im-tab-count">{{ scannedSourceList.filter(i => i.type === 'component').length }}</span>
              </button>
            </div>

            <div class="vt-form-group">
              <label class="vt-form-label">
                已选 <strong>{{ selectedSoftwareIds.length }}</strong> 项
              </label>
              <div class="vt-import-preview-wrap">
                <!-- 软件表格 -->
                <table v-if="softwareImportTab === 'software'" class="vt-table vt-table--compact">
                  <thead>
                    <tr>
                      <th class="vt-th-chk">
                        <input type="checkbox" :checked="isAllPageSelected" :indeterminate.prop="isIndeterminate" @change="togglePageAll">
                      </th>
                      <th>软件名称</th>
                      <th>版本</th>
                      <th>编程语言</th>
                      <th>开源许可证</th>
                      <th>扫描状态</th>
                      <th>漏洞数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredSoftwareList" :key="item.id">
                      <td class="vt-td-chk">
                        <input
                          type="checkbox"
                          :checked="selectedSoftwareIds.includes(item.id)"
                          @change="toggleItem(item)"
                        >
                      </td>
                      <td><span class="vt-link">{{ item.name }}</span></td>
                      <td><span class="vt-code">{{ item.version }}</span></td>
                      <td>{{ item.lang || '--' }}</td>
                      <td>{{ item.license || '--' }}</td>
                      <td><span class="vt-badge vt-badge--success">已扫描</span></td>
                      <td>
                        <span v-if="item.vulnCount > 0" class="vt-badge vt-badge--danger">{{ item.vulnCount }}</span>
                        <span v-else class="vt-text-muted">{{ item.vulnCount }}</span>
                      </td>
                    </tr>
                    <tr v-if="filteredSoftwareList.length === 0">
                      <td colspan="7" class="vt-empty-cell">
                        <div class="vt-empty">没有找到匹配的已扫描软件</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <!-- 组件表格 -->
                <table v-if="softwareImportTab === 'component'" class="vt-table vt-table--compact">
                  <thead>
                    <tr>
                      <th class="vt-th-chk">
                        <input type="checkbox" :checked="isAllPageSelected" :indeterminate.prop="isIndeterminate" @change="togglePageAll">
                      </th>
                      <th>组件名称</th>
                      <th>组件版本</th>
                      <th>编程语言</th>
                      <th>开源许可证</th>
                      <th>扫描状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredSoftwareList" :key="item.id">
                      <td class="vt-td-chk">
                        <input
                          type="checkbox"
                          :checked="selectedSoftwareIds.includes(item.id)"
                          @change="toggleItem(item)"
                        >
                      </td>
                      <td>
                        <span class="vt-text">{{ item.name }}</span>
                        <span v-if="item.software" class="vt-text-muted" style="font-size:12px;margin-left:4px;">（{{ item.software }}）</span>
                      </td>
                      <td><span class="vt-code">{{ item.version }}</span></td>
                      <td>{{ item.lang || '--' }}</td>
                      <td>{{ item.license || '--' }}</td>
                      <td><span class="vt-badge vt-badge--success">已扫描</span></td>
                    </tr>
                    <tr v-if="filteredSoftwareList.length === 0">
                      <td colspan="6" class="vt-empty-cell">
                        <div class="vt-empty">没有找到匹配的已扫描组件</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <div class="vt-footer-left">
            <span class="vt-text-muted">仅显示扫描成功的软件和组件</span>
          </div>
          <button type="button" class="vt-btn vt-btn-outline" @click="showSelectSoftware = false">取消</button>
          <button
            type="button"
            class="vt-btn vt-btn-primary"
            :disabled="selectedSoftwareIds.length === 0"
            @click="importSelectedSoftware"
          >
            导入选中（{{ selectedSoftwareIds.length }} 项）
          </button>
        </div>
      </div>
    </div>

    <!-- 发车弹窗 -->
    <div v-if="showReleaseForm" class="vt-modal-overlay" @click.self="closeReleaseForm">
      <div class="vt-modal">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">版本火车发车 — {{ formData.trainId || '待填写' }}</h3>
          <button type="button" class="vt-modal-close" @click="closeReleaseForm">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <div class="vt-form-row">
              <div class="vt-form-group">
                <label class="vt-form-label">版本火车号 <span class="vt-form-required">*</span></label>
                <input v-model="formData.trainId" type="text" class="vt-input" placeholder="例如：VT-2026-005">
              </div>
              <div class="vt-form-group">
                <label class="vt-form-label">版本火车名 <span class="vt-form-required">*</span></label>
                <input v-model="formData.trainName" type="text" class="vt-input" placeholder="例如：安全功能迭代版">
              </div>
            </div>
            <div class="vt-form-row">
              <div class="vt-form-group">
                <label class="vt-form-label">发车时间 <span class="vt-form-required">*</span></label>
                <input v-model="formData.startTime" type="datetime-local" class="vt-input">
              </div>
              <div class="vt-form-group">
                <label class="vt-form-label">结束时间 <span class="vt-form-required">*</span></label>
                <input v-model="formData.endTime" type="datetime-local" class="vt-input">
              </div>
            </div>
            <div class="vt-form-soft-count">包含软件 {{ modalSwCount }} 个，组件 {{ modalCompCount }} 个</div>
            <div class="vt-form-group">
              <label class="vt-form-label">发车备注</label>
              <textarea v-model="formData.remark" class="vt-textarea" rows="2" maxlength="200" placeholder="可选：填写本次发车说明（限200字）"></textarea>
              <div class="vt-form-hint">{{ (formData.remark || '').length }}/200</div>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <button type="button" class="vt-btn vt-btn-outline" @click="closeReleaseForm">取消</button>
          <button type="button" class="vt-btn vt-btn-primary" :disabled="!canRelease" @click="doRelease">确认发车</button>
        </div>
      </div>
    </div>

    <!-- ========== 新增版本火车弹窗 ========== -->
    <div v-if="showNewTrainModal" class="vt-modal-overlay" @click.self="showNewTrainModal = false">
      <div class="vt-modal">
        <div class="vt-modal-header">
          <h3 class="vt-modal-title">新增版本火车</h3>
          <button type="button" class="vt-modal-close" @click="showNewTrainModal = false">&times;</button>
        </div>
        <div class="vt-modal-body">
          <div class="vt-form">
            <div class="vt-form-row">
              <div class="vt-form-group">
                <label class="vt-form-label">版本火车号 <span class="vt-form-required">*</span></label>
                <input v-model="newTrainForm.trainId" type="text" class="vt-input" placeholder="例如 VT-2026-005" />
              </div>
              <div class="vt-form-group">
                <label class="vt-form-label">火车名称 <span class="vt-form-required">*</span></label>
                <input v-model="newTrainForm.name" type="text" class="vt-input" placeholder="例如 2026年Q3框架升级包" />
              </div>
            </div>
          </div>
        </div>
        <div class="vt-modal-footer">
          <button type="button" class="vt-btn vt-btn-outline" @click="showNewTrainModal = false">取消</button>
          <button type="button" class="vt-btn vt-btn-primary" :disabled="!newTrainForm.name.trim()" @click="createNewTrain">确认新增</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { versionTrains as _versionTrains, reviewResults, releaseHistory as historyData } from '../../data/versionTrainData.js'

const versionTrains = reactive(_versionTrains)

const router = useRouter()

// ------- 关联 review 数据 -------
const reviewMap = new Map()
reviewResults.forEach(r => reviewMap.set(r.name, r))

// ------- 状态 -------
const showHistory = ref(false)
const showVersionInfo = ref(false)
const showReleaseForm = ref(false)
const editingTrain = ref(null)
const activeTrainId = ref(versionTrains.find(t => t.status === '待发车')?.id || '')

// ------- 三点菜单 -------
const openMenuTrainId = ref(null)
function toggleTrainMenu(trainId) {
  openMenuTrainId.value = openMenuTrainId.value === trainId ? null : trainId
}
function closeAllMenus() {
  openMenuTrainId.value = null
}

// ------- 删除确认 -------
function confirmDeleteTrain(train) {
  if (confirm(`确定要删除版本火车「${train.id} — ${train.name}」吗？删除后不可恢复。`)) {
    const idx = versionTrains.findIndex(t => t.id === train.id)
    if (idx !== -1) {
      versionTrains.splice(idx, 1)
      if (activeTrainId.value === train.id) {
        activeTrainId.value = versionTrains.length > 0 ? versionTrains[0].id : ''
      }
    }
  }
}

// ------- 新增版本火车 -------
const showNewTrainModal = ref(false)
const newTrainForm = reactive({
  trainId: '',
  name: '',
})

function createNewTrain() {
  const id = newTrainForm.trainId.trim()
  const name = newTrainForm.name.trim()
  if (!id || !name) return
  const newTrain = {
    id,
    name,
    status: '待发车',
    createdAt: new Date().toISOString().slice(0, 10),
    softwareList: [],
  }
  versionTrains.push(newTrain)
  activeTrainId.value = id
  showNewTrainModal.value = false
  newTrainForm.trainId = ''
  newTrainForm.name = ''
}

// ------- 版本信息树切换 -------

// ------- 信息树：展开/收起组件 -------
const openSwIds = ref(new Set())

/** 获取当前火车的纯软件列表（排除组件类型） */
function getSoftwareItems(train) {
  if (!train) return []
  return train.softwareList.filter(s => (s.type || 'software') !== 'component')
}

/** 初始化/刷新展开状态：全部展开 */
function refreshOpenSwSet() {
  if (activeTrain.value) {
    openSwIds.value = new Set(getSoftwareItems(activeTrain.value).map(s => s.id))
  }
}
/** 全部展开 */
function expandAll() { refreshOpenSwSet() }
/** 全部收起 */
function collapseAll() { openSwIds.value = new Set() }

function toggleSwComp(swId) {
  const s = new Set(openSwIds.value)
  if (s.has(swId)) s.delete(swId); else s.add(swId)
  openSwIds.value = s
}
function isSwOpen(swId) {
  return openSwIds.value.has(swId)
}
function getComponentsForSw(train, swName) {
  if (!train) return []
  return train.softwareList.filter(item => item.type === 'component' && item.software === swName)
}

function toggleVersionInfo() {
  refreshOpenSwSet()
  showVersionInfo.value = !showVersionInfo.value
}

// ------- 发车表单 -------
const formData = ref({
  trainId: '',
  trainName: '',
  versionNum: '',
  startTime: '',
  endTime: '',
  remark: '',
})

const allTrains = computed(() => versionTrains)

const trainSearch = ref('')
const filteredTrains = computed(() => {
  const q = trainSearch.value.trim().toLowerCase()
  if (!q) return allTrains.value
  return allTrains.value.filter(t =>
    t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  )
})

const activeTrain = computed(() =>
  versionTrains.find(t => t.id === activeTrainId.value) || null
)

const currentSoftwareList = computed(() => {
  if (!activeTrain.value) return []
  return activeTrain.value.softwareList.map(sw => {
    const review = reviewMap.get(sw.name) || {}
    return { ...sw, ...review }
  })
})

// ------- 软件列表搜索（名称 + 版本） -------
const softwareNameSearch = ref('')
const softwareVersionSearch = ref('')
const filteredSoftwareInTrain = computed(() => {
  const list = currentSoftwareList.value
  const nameQ = softwareNameSearch.value.trim().toLowerCase()
  const verQ = softwareVersionSearch.value.trim().toLowerCase()
  return list.filter(sw => {
    if (nameQ && !sw.name.toLowerCase().includes(nameQ)) return false
    if (verQ && !sw.version.toLowerCase().includes(verQ)) return false
    return true
  })
})

// -======= 表格分页 ========
const swPage = ref(1)
const SW_PAGE_SIZE = 10

function resetSwPage() {
  swPage.value = 1
}

const paginatedSoftwareInTrain = computed(() => {
  const list = filteredSoftwareInTrain.value
  const start = (swPage.value - 1) * SW_PAGE_SIZE
  return list.slice(start, start + SW_PAGE_SIZE)
})

const swTotalPages = computed(() => {
  return Math.ceil(filteredSoftwareInTrain.value.length / SW_PAGE_SIZE) || 1
})

// 切换火车或搜索时重置到第一页
const activeTrainIdPrev = ref(activeTrainId.value)
watch(activeTrainId, () => {
  swPage.value = 1
})
watch(softwareNameSearch, () => { swPage.value = 1 })
watch(softwareVersionSearch, () => { swPage.value = 1 })

// -======= 批量修改状态 -=======
const selectedSoftwareForBatch = ref([])

const isAllSoftwareSelected = computed(() => {
  const list = filteredSoftwareInTrain.value
  if (list.length === 0) return false
  return list.every(sw => selectedSoftwareForBatch.value.includes(sw.id))
})

const isSoftwareIndeterminate = computed(() => {
  const list = filteredSoftwareInTrain.value
  if (list.length === 0) return false
  const some = list.some(sw => selectedSoftwareForBatch.value.includes(sw.id))
  return some && !isAllSoftwareSelected.value
})

function toggleAllSoftware() {
  const list = filteredSoftwareInTrain.value
  if (isAllSoftwareSelected.value) {
    selectedSoftwareForBatch.value = selectedSoftwareForBatch.value.filter(
      id => !list.some(sw => sw.id === id)
    )
  } else {
    const allIds = list.map(sw => sw.id)
    selectedSoftwareForBatch.value = [...new Set([...selectedSoftwareForBatch.value, ...allIds])]
  }
}

function toggleSoftware(sw) {
  const idx = selectedSoftwareForBatch.value.indexOf(sw.id)
  if (idx === -1) {
    selectedSoftwareForBatch.value.push(sw.id)
  } else {
    selectedSoftwareForBatch.value.splice(idx, 1)
  }
}

function batchUpdateStatus(status) {
  if (!activeTrain.value) return
  activeTrain.value.softwareList.forEach(sw => {
    if (selectedSoftwareForBatch.value.includes(sw.id)) {
      sw.reviewResult = status
    }
  })
  // 同步到 reviewMap
  selectedSoftwareForBatch.value.forEach(id => {
    const sw = activeTrain.value.softwareList.find(s => s.id === id)
    if (sw && reviewMap.has(sw.name)) {
      reviewMap.set(sw.name, { ...reviewMap.get(sw.name), reviewResult: status })
    }
  })
  selectedSoftwareForBatch.value = []
}

function batchOnline() {
  if (!activeTrain.value) return
  activeTrain.value.softwareList.forEach(sw => {
    if (selectedSoftwareForBatch.value.includes(sw.id)) {
      sw.published = true
    }
  })
  selectedSoftwareForBatch.value = []
}

function batchOffline() {
  if (!activeTrain.value) return
  activeTrain.value.softwareList.forEach(sw => {
    if (selectedSoftwareForBatch.value.includes(sw.id)) {
      sw.published = false
    }
  })
  selectedSoftwareForBatch.value = []
}

// ------- 弹窗内软件列表分页 -------
const modalSwPage = ref(1)
const MODAL_SW_PAGE_SIZE = 10
const modalSwList = computed(() => {
  if (!editingTrain.value) return []
  const start = (modalSwPage.value - 1) * MODAL_SW_PAGE_SIZE
  return editingTrain.value.softwareList.slice(start, start + MODAL_SW_PAGE_SIZE)
})
const modalSwPageTotal = computed(() => {
  if (!editingTrain.value) return 0
  return Math.ceil(editingTrain.value.softwareList.length / MODAL_SW_PAGE_SIZE)
})

const modalSwCount = computed(() => editingTrain.value?.softwareList.filter(s => s.type === 'software').length ?? 0)
const modalCompCount = computed(() => editingTrain.value?.softwareList.filter(s => s.type === 'component').length ?? 0)

const releaseHistory = ref(historyData)

// -======= 发车历史搜索 + 分页 ========
const histSearch = ref('')
const histPage = ref(1)
const HIST_PAGE_SIZE = 5

const filteredHistory = computed(() => {
  const q = histSearch.value.trim().toLowerCase()
  if (!q) return releaseHistory.value
  return releaseHistory.value.filter(r =>
    r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
  )
})

const paginatedHistory = computed(() => {
  const start = (histPage.value - 1) * HIST_PAGE_SIZE
  return filteredHistory.value.slice(start, start + HIST_PAGE_SIZE)
})

const histTotalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / HIST_PAGE_SIZE) || 1
})

watch(histSearch, () => { histPage.value = 1 })
const canRelease = computed(() =>
  formData.value.trainId.trim() && formData.value.trainName.trim() && formData.value.startTime && formData.value.endTime
)

// ------- 辅助 -------
function reviewResultClass(result) {
  if (result === '通过') return 'vt-badge--success'
  if (result === '不通过') return 'vt-badge--danger'
  if (result === '待定') return 'vt-badge--warn'
  return 'vt-badge--muted'
}

// ------- 弹窗编辑 -------
const showEditModal = ref(false)
const editSoftwareData = ref(null)
const editForm = ref({ reviewResult: '', reviewOpinion: '' })

function openEditModal(sw) {
  editSoftwareData.value = sw
  editForm.value = {
    reviewResult: sw.reviewResult || '',
    reviewOpinion: sw.reviewOpinion || '',
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editSoftwareData.value = null
}

function saveEditModal() {
  const sw = editSoftwareData.value
  if (sw) {
    sw.reviewResult = editForm.value.reviewResult
    sw.reviewOpinion = editForm.value.reviewOpinion
  }
  closeEditModal()
}

// ------- 发车操作 -------
function openReleaseForm(train) {
  editingTrain.value = train
  const now = new Date()
  const end = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
  formData.value = {
    trainId: train.id,
    trainName: train.name,
    versionNum: '',
    startTime: now.toISOString().slice(0, 16),
    endTime: end.toISOString().slice(0, 16),
    remark: '',
  }
  showReleaseForm.value = true
}

function closeReleaseForm() {
  showReleaseForm.value = false
  editingTrain.value = null
}

function doRelease() {
  const now = new Date().toLocaleString('zh-CN')
  releaseHistory.value.unshift({
    id: formData.value.trainId,
    name: formData.value.trainName,
    versionNum: formData.value.versionNum,
    releaseTime: formData.value.startTime.replace('T', ' '),
    endTime: formData.value.endTime.replace('T', ' '),
    status: '已发车',
    softwareCount: editingTrain.value.softwareList.length,
  })
  // 将火车标记为已发车，所有软件标记为已发布
  editingTrain.value.status = '已发车'
  editingTrain.value.releasedVersion = formData.value.versionNum
  editingTrain.value.releaseTime = formData.value.startTime.replace('T', ' ')
  editingTrain.value.endTime = formData.value.endTime.replace('T', ' ')
  editingTrain.value.remark = formData.value.remark || ''
  editingTrain.value.softwareList.forEach(sw => {
    sw.published = true
  })
  closeReleaseForm()
  showHistory.value = true
}

function removeSoftware(sw) {
  if (!activeTrain.value) return
  const idx = activeTrain.value.softwareList.findIndex(s => s.id === sw.id)
  if (idx !== -1) {
    activeTrain.value.softwareList.splice(idx, 1)
  }
}

function togglePublish(sw) {
  if (!activeTrain.value) return
  const item = activeTrain.value.softwareList.find(s => s.id === sw.id)
  if (item) {
    item.published = !item.published
  }
}

function onViewDetail(sw) {
  // 跳转到扫描结果页
  router.push({ name: 'scan-result', query: { name: sw.name, version: sw.version, language: sw.lang, license: sw.license } })
}

// ================================================================
// 1. Excel 导入
// ================================================================
const fileInputRef = ref(null)
const showImportExcelModal = ref(false)
const importFileName = ref('')
const excelPreview = ref([])

/** 模拟 XLSX 解析 —— 正式场景接入 xlsx 库 */
const mockExcelComponents = [
  { name: 'Apache Log4j', version: '2.24.0', lang: 'Java', license: 'Apache-2.0' },
  { name: 'Jackson Databind', version: '2.17.2', lang: 'Java', license: 'Apache-2.0' },
  { name: 'Guava', version: '33.2.0', lang: 'Java', license: 'Apache-2.0' },
  { name: 'SLF4J', version: '2.0.13', lang: 'Java', license: 'MIT' },
  { name: 'Hibernate ORM', version: '6.5.2', lang: 'Java', license: 'LGPL-2.1' },
  { name: 'Bouncy Castle', version: '1.78', lang: 'Java', license: 'MIT' },
  { name: 'Netty', version: '4.1.110', lang: 'Java', license: 'Apache-2.0' },
  { name: 'Lombok', version: '1.18.34', lang: 'Java', license: 'MIT' },
  { name: 'JUnit Jupiter', version: '5.10.3', lang: 'Java', license: 'EPL-2.0' },
  { name: 'Mockito', version: '5.12.0', lang: 'Java', license: 'MIT' },
]

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  importFileName.value = file.name
  // 模拟解析结果
  excelPreview.value = mockExcelComponents.map((item, i) => ({
    ...item,
    id: Date.now() + i,
    scanStatus: '已扫描',
  }))
}

function importFromExcel() {
  if (!activeTrain.value || excelPreview.value.length === 0) return
  const existingNames = new Set(activeTrain.value.softwareList.map(s => s.name))
  const newItems = excelPreview.value.filter(item => !existingNames.has(item.name))
  const startId = Date.now()
  newItems.forEach((item, i) => {
    activeTrain.value.softwareList.push({
      id: startId + i,
      name: item.name,
      type: item.type || 'software',
      version: item.version,
      status: '待发布',
      scanned: true,
      lang: item.lang,
      license: item.license,
      scanStatus: '已扫描',
    })
  })
  showImportExcelModal.value = false
  excelPreview.value = []
  importFileName.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ================================================================
// 2. 从软件管理选择已扫描软件
// ================================================================
const showSelectSoftware = ref(false)
const softwareSearch = ref('')
const softwareImportTab = ref('software') // 'software' | 'component'
const selectedSoftwareIds = ref([])

/** 软件管理中的已扫描数据（合并软件 + 组件） */
const scannedSourceList = [
  // 已扫描的软件
  { id: 101, name: 'Vue.js', type: 'software', version: '3.4.21', lang: 'JavaScript', license: 'MIT', scanned: true, vulnCount: 2 },
  { id: 102, name: 'React', type: 'software', version: '18.2.0', lang: 'JavaScript', license: 'MIT', scanned: true, vulnCount: 0 },
  { id: 103, name: 'Spring Boot', type: 'software', version: '3.2.3', lang: 'Java', license: 'Apache-2.0', scanned: true, vulnCount: 5 },
  { id: 104, name: 'FastAPI', type: 'software', version: '0.111.0', lang: 'Python', license: 'MIT', scanned: true, vulnCount: 1 },
  { id: 105, name: 'Angular', type: 'software', version: '17.3.4', lang: 'TypeScript', license: 'MIT', scanned: true, vulnCount: 3 },
  { id: 106, name: 'NestJS', type: 'software', version: '10.3.8', lang: 'TypeScript', license: 'MIT', scanned: true, vulnCount: 0 },
  { id: 107, name: 'Next.js', type: 'software', version: '14.2.3', lang: 'JavaScript', license: 'MIT', scanned: true, vulnCount: 4 },
  // 已扫描的组件
  { id: 201, name: 'vue-router', type: 'component', version: '4.3.0', lang: 'JavaScript', license: 'MIT', scanned: true, software: 'Vue.js' },
  { id: 202, name: 'react-dom', type: 'component', version: '18.2.0', lang: 'JavaScript', license: 'MIT', scanned: true, software: 'React' },
  { id: 203, name: 'react-native', type: 'component', version: '0.73.6', lang: 'JavaScript', license: 'MIT', scanned: true, software: 'React' },
  { id: 204, name: 'spring-boot-starter-data-jpa', type: 'component', version: '3.2.3', lang: 'Java', license: 'Apache-2.0', scanned: true, software: 'Spring Boot' },
  { id: 205, name: '@angular/core', type: 'component', version: '17.3.4', lang: 'TypeScript', license: 'MIT', scanned: true, software: 'Angular' },
  { id: 206, name: '@angular/router', type: 'component', version: '17.3.4', lang: 'TypeScript', license: 'MIT', scanned: true, software: 'Angular' },
  { id: 207, name: '@nestjs/common', type: 'component', version: '10.3.8', lang: 'TypeScript', license: 'MIT', scanned: true, software: 'NestJS' },
]

const filteredSoftwareList = computed(() => {
  let list = scannedSourceList.filter(i => i.type === softwareImportTab.value)
  const q = softwareSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(i => i.name.toLowerCase().includes(q) || (i.software || '').toLowerCase().includes(q))
  }
  return list
})

const isAllPageSelected = computed(() => {
  if (filteredSoftwareList.value.length === 0) return false
  return filteredSoftwareList.value.every(item => selectedSoftwareIds.value.includes(item.id))
})

const isIndeterminate = computed(() => {
  if (filteredSoftwareList.value.length === 0) return false
  const some = filteredSoftwareList.value.some(item => selectedSoftwareIds.value.includes(item.id))
  return some && !isAllPageSelected.value
})

function togglePageAll() {
  if (isAllPageSelected.value) {
    selectedSoftwareIds.value = selectedSoftwareIds.value.filter(
      id => !filteredSoftwareList.value.some(item => item.id === id)
    )
  } else {
    const pageIds = filteredSoftwareList.value.map(item => item.id)
    selectedSoftwareIds.value = [...new Set([...selectedSoftwareIds.value, ...pageIds])]
  }
}

function toggleItem(item) {
  const idx = selectedSoftwareIds.value.indexOf(item.id)
  if (idx === -1) {
    selectedSoftwareIds.value.push(item.id)
  } else {
    selectedSoftwareIds.value.splice(idx, 1)
  }
}

function importSelectedSoftware() {
  if (!activeTrain.value || selectedSoftwareIds.value.length === 0) return
  const selectedItems = scannedSourceList.filter(item => selectedSoftwareIds.value.includes(item.id))
  const existingNames = new Set(activeTrain.value.softwareList.map(s => s.name))
  const startId = Date.now()
  let added = 0
  selectedItems.forEach((item, i) => {
    const displayName = item.type === 'component' ? `${item.software} / ${item.name}` : item.name
    if (!existingNames.has(displayName)) {
      activeTrain.value.softwareList.push({
        id: startId + i,
        name: displayName,
        type: item.type || 'software',
        version: item.version,
        status: '待发布',
        scanned: true,
        lang: item.lang,
        license: item.license,
        scanStatus: '已扫描',
      })
      existingNames.add(displayName)
      added++
    }
  })
  showSelectSoftware.value = false
  selectedSoftwareIds.value = []
  softwareSearch.value = ''
}
</script>

<style scoped>
/* ========== Page ========== */
.vt-page { min-height: 100vh; display: flex; flex-direction: column; }
.vt-page-title {
  font-size: 20px; font-weight: 700;
  color: #111827; margin: 0;
}

/* ========== Layout ========== */
.vt-layout { display: flex; gap: 10px; flex: 1; min-height: 0; }

/* ========== Sidebar ========== */
.vt-sidebar {
  width: 230px;
  min-width: 230px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
}
.vt-sidebar-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e5e7eb;
}
.vt-sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}
.vt-sidebar-title-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
  min-height: 24px;
}
.vt-sidebar-actions-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.vt-sidebar-actions-row .vt-pill-btn {
  flex: 1;
  justify-content: center;
}
.vt-pill-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  background: none;
  font-family: inherit;
  white-space: nowrap;
}
.vt-pill-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.vt-pill-btn--primary:hover {
  background: #c01a34;
  border-color: #c01a34;
}
.vt-pill-btn--ghost {
  color: #6b7280;
  border-color: #d1d5db;
}
.vt-pill-btn--ghost:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}
.vt-sidebar-search { position: relative; }
.vt-sidebar-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.vt-sidebar-input {
  width: 100%;
  padding: 7px 10px 7px 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 13px;
  color: #374151;
  outline: none;
  transition: all 0.15s;
}
.vt-sidebar-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
  background: #fff;
}
.vt-sidebar-input::placeholder { color: #9ca3af; }
.vt-sidebar-list { flex: 1; overflow-y: auto; }
.vt-sidebar-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  font-family: inherit;
  position: relative;
}
.vt-sidebar-item:last-child { border-bottom: none; }
.vt-sidebar-item:hover { background: #f9fafb; }
.vt-sidebar-item--active {
  background: #fef2f2 !important;
  border-left: 3px solid #da203e;
  padding-left: 13px;
}

.vt-sidebar-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}
.vt-dot-wrap {
  margin-left: auto;
  position: relative;
}
.vt-dot-btn {
  line-height: 1;
  letter-spacing: 1px;
  color: #6b7280;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  user-select: none;
  transition: background 0.1s;
}
.vt-dot-btn:hover { background: #f3f4f6; }
.vt-dot-menu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 20;
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 80px;
}
.vt-dot-menu-item {
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  color: #374151;
  transition: background 0.1s;
}
.vt-dot-menu-item:hover { background: #f3f4f6; }
.vt-dot-menu-item--danger { color: #dc2626; }
.vt-dot-menu-item--danger:hover { background: #fef2f2; }
.vt-sidebar-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vt-sidebar-item--active .vt-sidebar-name { color: #da203e; font-weight: 600; }
.vt-sidebar-id {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}
.vt-sidebar-item-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.vt-sidebar-empty .vt-text-muted { font-size: 13px; }

/* ========== Sidebar Status ========== */
.vt-sidebar-item-status { font-size: 11px; padding: 1px 8px; border-radius: 8px; font-weight: 500; }
.vt-sidestatus--待发车 { background: #f0fdf4; color: #16a34a; }
.vt-sidestatus--已发车 { background: #eef2ff; color: #4f46e5; }
.vt-sidestatus--已结束 { background: #f3f4f6; color: #6b7280; }

/* ========== Back Bar ========== */
.vt-back-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.vt-back-title { font-size: 14px; font-weight: 600; color: #374151; }

/* ========== Tree View ========== */
.vt-tree { padding: 8px 0; }
.vt-tree-train-header {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid #f3f4f6;
}
.vt-tree-train-header:hover { background: #f9fafb; }
.vt-tree-train-header--active {
  background: #f8fafc;
  border-radius: 6px;
  margin: 0 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
}
.vt-tree-train-arrow { font-size: 10px; color: #9ca3af; width: 16px; text-align: center; }
.vt-tree-train-id { font-size: 12px; font-weight: 600; color: #4f46e5; }
.vt-tree-train-name { font-size: 14px; font-weight: 500; color: #111827; flex: 1; }
.vt-tree-train-status { font-size: 11px; padding: 1px 8px; border-radius: 8px; font-weight: 500; }
.vt-tree-train-toggle { font-size: 12px; color: #da203e; cursor: pointer; white-space: nowrap; }
.vt-tree-train-toggle:hover { text-decoration: underline; }
.vt-tree-toolbar {
  display: flex; gap: 8px;
  padding: 6px 16px;
}
.vt-tree-toolbar-btn {
  font-size: 12px; color: #da203e; background: none; border: none;
  cursor: pointer; padding: 2px 4px;
}
.vt-tree-toolbar-btn:hover { text-decoration: underline; }
.vt-tree-children { padding: 4px 0 4px 28px; }
.vt-tree-software {
  padding: 0;
  font-size: 13px;
}
.vt-tree-software.is-active { background: transparent; }
.vt-tree-software:last-child { border-bottom: none; }
.vt-tree-sw-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px dashed #e5e7eb;
  cursor: pointer;
  transition: background 0.1s;
}
.vt-tree-sw-row:hover { background: #f3f4f6; }
.vt-tree-expand-icon { font-size: 10px; color: #9ca3af; width: 14px; text-align: center; flex-shrink: 0; }
.vt-tree-sw-name { font-weight: 500; color: #111827; min-width: 120px; }
.vt-tree-sw-version { font-size: 12px; color: #da203e; font-weight: 600; min-width: 80px; }
.vt-tree-meta { font-size: 12px; }
.vt-tree-meta.scan-ok { color: #16a34a; }
.vt-tree-meta.scan-none { color: #9ca3af; }
.vt-tree-sw-opinion { font-size: 12px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }

/* ── 组件子节点树 ── */
.vt-tree-sw-children {
  padding: 6px 8px 6px 32px;
  margin: 0 12px 6px;
}
.vt-tree-component { padding: 3px 0; }
.vt-tree-comp-row {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 6px;
  border-radius: 3px;
}
.vt-tree-comp-connector { color: #9ca3af; font-family: monospace; font-weight: 700; width: 16px; text-align: center; flex-shrink: 0; }
.vt-tree-comp-tag { font-size: 10px; color: #1e40af; padding: 1px 6px; border-radius: 3px; font-weight: 600; }
.vt-tree-comp-name { color: #1e293b; font-weight: 600; }
.vt-tree-comp-version { font-size: 12px; color: #3b82f6; font-weight: 600; }
.vt-tree-comp-lang { font-size: 11px; color: #94a3b8; }
.vt-tree-comp-empty { color: #9ca3af; font-size: 12px; padding: 6px 8px; }
.vt-tree-empty-row { padding: 12px 16px; color: #9ca3af; font-size: 13px; }
.vt-tree-empty { padding: 40px 16px; text-align: center; }
.vt-title-status {
  font-size: 12px; padding: 1px 10px; border-radius: 8px; font-weight: 500;
  margin-left: 6px; vertical-align: middle;
}

/* ========== Content ========== */
.vt-content { flex: 1; min-width: 0; }
.vt-card-notrain { padding: 24px; }

/* ========== Buttons ========== */
.vt-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: 1px solid #d1d5db;
  border-radius: 6px; font-family: inherit; font-size: 14px;
  cursor: pointer; transition: all 0.15s;
  background: #fff; color: #374151;
}
.vt-btn:hover { border-color: #da203e; color: #da203e; }
.vt-btn-outline { background: transparent; color: #da203e; border-color: #da203e; }
.vt-btn-outline:hover { background: #fef2f2; color: #b91c1c; }
.vt-btn-primary { background: #da203e; color: #fff; border-color: #da203e; }
.vt-btn-primary:hover { background: #b91c1c; border-color: #b91c1c; color: #fff; }
.vt-btn-primary:disabled { opacity: 0.5; cursor: default; }
.vt-btn-sm { padding: 6px 14px; font-size: 13px; }

/* ========== Card ========== */
.vt-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.vt-card--secondary { opacity: 0.9; border-color: #f0f0f0; }
.vt-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap; gap: 6px;
}
.vt-card-title {
  font-size: 15px; font-weight: 600;
  color: #111827;
  padding-left: 10px; border-left: 3px solid #da203e;
  margin: 0;
}
.vt-title-time {
  font-size: 12px; font-weight: 400; color: #6b7280; margin-left: 12px; white-space: nowrap;
}
.vt-title-time--end { margin-left: 8px; }
.vt-card-header-footer {
  display: flex; flex-direction: column;
  padding: 0 14px 8px;
}
.vt-card-remark-block {
  display: flex; align-items: center;
  padding: 8px 14px; margin: 8px 0 8px;
  background: #f3f4f6; border-left: 3px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px; color: #6b7280; line-height: 1.5;
  cursor: default;
}
.vt-card-remark-text {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
}
.vt-card-header-row {
  display: flex; align-items: center;
  justify-content: space-between; width: 100%;
}
.vt-card-header-actions { display: flex; align-items: center; gap: 8px; }
.vt-card-header-actions .vt-btn { height: 30px; }
.vt-card-toolbar {
  display: flex; align-items: center;
  gap: 12px; width: 100%; flex-wrap: wrap;
}
.vt-card-search {
  position: relative; flex: 1; min-width: 160px; max-width: 200px;
}
.vt-card-search-icon {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%); color: #9ca3af;
  pointer-events: none;
}
.vt-card-input {
  width: 100%; padding: 7px 12px 7px 32px;
  border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; font-family: inherit;
  background: #f9fafb; outline: none;
  transition: all 0.15s;
}
.vt-card-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
  background: #fff;
}
.vt-card-input::placeholder { color: #9ca3af; }

/* ========== Pagination ========== */
.vt-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 14px 0 10px;
}
.vt-page-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border: 1px solid #d1d5db; border-radius: 6px;
  background: #fff; color: #374151;
  font-size: 16px; cursor: pointer;
  transition: all 0.15s; font-family: inherit;
}
.vt-page-btn:hover:not(:disabled) { border-color: #da203e; color: #da203e; background: #fef2f2; }
.vt-page-btn:disabled { opacity: 0.35; cursor: default; }
.vt-page-info {
  font-size: 13px; font-weight: 500; color: #374151;
  min-width: 48px; text-align: center;
}
.vt-page-total { font-size: 12px; color: #9ca3af; margin-left: 4px; }
.vt-page-btn--xs { width: 26px; height: 26px; font-size: 14px; }

/* ========== Inline Edit ========== */
.vt-clickable { cursor: pointer; }
.vt-clickable:hover { opacity: 0.7; }
.vt-inline-edit-group {
  display: flex; align-items: center; gap: 4px;
}
.vt-inline-input {
  flex: 1; min-width: 100px;
  padding: 4px 8px; border: 1px solid #d1d5db;
  border-radius: 4px; font-size: 13px; font-family: inherit;
  outline: none; background: #fff;
  transition: border-color 0.15s;
}
.vt-inline-input:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }
.vt-inline-select {
  padding: 4px 6px; border: 1px solid #d1d5db;
  border-radius: 4px; font-size: 13px; font-family: inherit;
  outline: none; background: #fff; cursor: pointer;
}
.vt-inline-select:focus { border-color: #da203e; }

.vt-batch-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}
.vt-batch-count { font-size: 13px; font-weight: 500; color: #da203e; white-space: nowrap; }
.vt-batch-actions { display: flex; align-items: center; gap: 6px; }
.vt-btn-xs { padding: 4px 10px; font-size: 12px; }

/* ========== Table ========== */
.vt-table-wrap { overflow-x: auto; padding: 0 4px; }
.vt-table-wrap--history { margin-top: 12px; }
.vt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.vt-table th, .vt-table td { padding: 7px 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.vt-table th { font-weight: 600; color: #374151; background: #f9fafb; font-size: 12px; letter-spacing: 1px; white-space: nowrap; position: sticky; top: 0; }
.vt-table tbody tr:hover { background: #f9fafb; }
.vt-th-op { text-align: right; }
.vt-td-op { text-align: right; white-space: nowrap; }
.vt-op-sep { display: inline-block; width: 8px; }
.vt-th-chk { width: 44px; text-align: center; }
.vt-td-chk { width: 44px; text-align: center; }
.vt-th-chk input[type="checkbox"],
.vt-td-chk input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #da203e; }
.vt-code { font-size: 12px; color: #da203e; font-weight: 600; }
.vt-cell-opinion {
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: #6b7280;
}
.vt-empty-cell { text-align: center !important; }
.vt-empty { padding: 40px 0; color: #9ca3af; font-size: 14px; }
.vt-text-muted { color: #9ca3af; font-size: 12px; }

/* ========== Dot Badge（圆形锚点） ========== */
.vt-dot-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  box-sizing: border-box;
}

/* ========== Badge ========== */
.vt-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 10px; font-size: 12px; font-weight: 500;
}
.vt-badge--success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.vt-badge--warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.vt-badge--danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.vt-badge--primary { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
.vt-badge--muted { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
.vt-badge--outline { background: transparent; color: #6b7280; border: 1px solid #d1d5db; font-size: 11px; padding: 1px 8px; }

/* ========== Link ========== */
.vt-link {
  color: #da203e; cursor: pointer; font-weight: 500;
}
.vt-link:hover { text-decoration: underline; }
.vt-linkish {
  padding: 0; border: none; background: none;
  font-family: inherit; font-size: 13px;
  color: #da203e; cursor: pointer;
}
.vt-linkish:hover { text-decoration: underline; }
.vt-linkish--danger { color: #ef4444 !important; }
.vt-linkish--danger:hover { color: #dc2626 !important; }
.vt-linkish--muted { color: #9ca3af !important; }
.vt-linkish--muted:hover { color: #6b7280 !important; }
.vt-linkish--warning { color: #d97706 !important; }
.vt-linkish--warning:hover { color: #b45309 !important; }

/* ========== Modal ========== */
.vt-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.vt-modal {
  background: #fff; border-radius: 12px;
  width: 520px; max-width: 94vw; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.2s ease;
}
.vt-modal--wide { width: 640px; }
.vt-modal--xl { width: 800px; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.vt-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #e5e7eb;
}
.vt-modal-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
.vt-modal-close {
  width: 32px; height: 32px; border: none; background: transparent;
  font-size: 22px; color: #9ca3af; cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
}
.vt-modal-close:hover { background: #f3f4f6; color: #374151; }
.vt-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.vt-modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid #e5e7eb;
}
.vt-footer-left { margin-right: auto; }

/* ========== Form ========== */
.vt-form { display: flex; flex-direction: column; gap: 16px; }
.vt-form-group { display: flex; flex-direction: column; gap: 6px; }
.vt-form-label { font-size: 13px; font-weight: 600; color: #374151; }
.vt-form-required { color: #dc2626; margin-left: 2px; }
.vt-form-hint { font-size: 12px; color: #9ca3af; text-align: right; margin-top: -2px; }
.vt-form-row { display: flex; gap: 12px; }
.vt-form-row .vt-form-group { flex: 1; }
.vt-form-value { font-size: 14px; color: #111827; padding: 8px 0; }
.vt-input {
  width: 100%; padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-family: inherit; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
.vt-input:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }
.vt-input::placeholder { color: #9ca3af; }
.vt-textarea {
  width: 100%; padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-family: inherit; font-size: 14px;
  outline: none; transition: border-color 0.2s;
  resize: vertical;
}
.vt-textarea:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }

/* ========== File Upload ========== */
.vt-file-upload {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 32px; border: 2px dashed #d1d5db; border-radius: 8px;
  cursor: pointer; transition: all 0.15s; background: #f9fafb;
}
.vt-file-upload:hover { border-color: #da203e; background: #fef2f2; }
.vt-file-input { display: none; }
.vt-file-upload-icon { color: #9ca3af; }
.vt-file-upload:hover .vt-file-upload-icon { color: #da203e; }
.vt-file-upload-text { color: #6b7280; font-size: 14px; margin: 0; }

/* ========== Import modal tabs ========== */
.vt-im-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 12px;
  gap: 0;
}
.vt-im-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.vt-im-tab:hover { color: #374151; }
.vt-im-tab.active {
  color: #da203e;
  border-bottom-color: #da203e;
}
.vt-im-tab svg { width: 15px; height: 15px; flex-shrink: 0; }
.vt-im-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #9ca3af;
  border-radius: 9px;
  line-height: 1;
}
.vt-im-tab.active .vt-im-tab-count {
  background: #da203e;
}

/* ========== Import preview table ========== */
.vt-import-preview-wrap {
  max-height: 260px; overflow-y: auto;
  border: 1px solid #e5e7eb; border-radius: 6px;
}
.vt-table--compact th,
.vt-table--compact td { padding: 8px 12px; font-size: 12px; }
.vt-th-chk,
.vt-td-chk { width: 36px; text-align: center !important; }

/* ========== Software list in modal ========== */
.vt-form-software-list-wrap {
  border: 1px solid #e5e7eb; border-radius: 6px;
  max-height: 200px; overflow-y: auto;
}

/* ========== Software count text ========== */
.vt-form-soft-count { font-size: 12px; color: #6b7280; margin-bottom: 6px; }

/* ========== Modal pagination ========== */
.vt-modal-pagination {
  display: flex; align-items: center; gap: 6px;
  justify-content: center; margin-top: 8px;
}
.vt-page-btn--xs {
  min-width: 26px; height: 26px; padding: 0; font-size: 14px;
  border: 1px solid #e5e7eb; border-radius: 4px; background: #fff;
  color: #374151; cursor: pointer; display: inline-flex;
  align-items: center; justify-content: center; transition: all 0.15s;
  line-height: 1;
}
.vt-page-btn--xs:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.vt-page-btn--xs:disabled { opacity: 0.35; cursor: default; }
</style>
