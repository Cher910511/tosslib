<template>
  <div class="gov-page">
    <template v-if="!detailItem">
    <!-- ===== KPI 指标条 ===== -->
    <div class="gov-kpi">
      <div class="gov-kpi-item">
        <span class="gov-kpi-num">{{ totalCount }}</span>
        <span class="gov-kpi-label">总计</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--warn">
        <span class="gov-kpi-num">{{ kpiPendingBackup }}</span>
        <span class="gov-kpi-label">待备份</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--blue">
        <span class="gov-kpi-num">{{ kpiPendingAssess }}</span>
        <span class="gov-kpi-label">待评估</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--purple">
        <span class="gov-kpi-num">{{ kpiPendingReview }}</span>
        <span class="gov-kpi-label">待评审</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--green">
        <span class="gov-kpi-num">{{ kpiPendingWarehouse }}</span>
        <span class="gov-kpi-label">待入库</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--ok">
        <span class="gov-kpi-num">{{ kpiEntered }}</span>
        <span class="gov-kpi-label">已入库</span>
      </div>
    </div>

    <!-- ===== 治理流程步骤卡片 ===== -->
    <div class="gov-step-cards">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        type="button"
        class="gov-step-card"
        :class="{ 'is-active': activeStep === index }"
        @click="activeStep = index"
      >
        <span class="gov-step-card-num">{{ index + 1 }}</span>
        <span class="gov-step-card-body">
          <span class="gov-step-card-label">{{ step.label }}</span>
        </span>
      </button>
    </div>

    <!-- ===== 当前步骤内容 ===== -->
    <div class="gov-content">
      <div class="gov-content-hd">
        <div class="gov-content-info">
          <h2 class="gov-content-title">{{ steps[activeStep].label }}</h2>
          <span class="gov-content-desc">{{ steps[activeStep].description }}</span>
        </div>
        <div class="gov-content-actions">
          <!-- 步骤1：软件获取 -->
          <template v-if="activeStep === 0">
            <div v-if="fetchingList" class="gov-fetch-hint">正在获取热门软件...</div>
            <button type="button" class="gov-btn gov-btn--primary" :disabled="fetchingList" @click="fetchSoftwareList">
              {{ fetchingList ? '获取中...' : '获取软件列表' }}
            </button>
            <label class="gov-upload-wrap">
              <input type="file" accept=".xlsx,.xls,.csv" hidden @change="handleExcelImport" />
              <span class="gov-btn">Excel 导入</span>
            </label>
            <button type="button" class="gov-btn" @click="downloadTemplate">
              下载导入模板
            </button>
            <button
              v-if="selectedAdvanceableCount > 0 && !fetchingList"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceToStep(1)"
            >
              引入选型 ({{ selectedAdvanceableCount }})
            </button>
          </template>

          <!-- 步骤2：引入选型 -->
          <template v-if="activeStep === 1">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="stepList.length === 0 || selectedCount === 0"
              @click="startBackup"
            >
              备份软件源码{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              v-if="selectedAdvanceableCount > 0"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceToStep(2)"
            >
              进入技术评估 ({{ selectedAdvanceableCount }})
            </button>
          </template>

          <!-- 步骤3：软件技术评估 -->
          <template v-if="activeStep === 2">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="selectedCount === 0"
              @click="startScan"
            >
              启动扫描{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              v-if="selectedAdvanceableCount > 0"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceToStep(3)"
            >
              进入成果验收 ({{ selectedAdvanceableCount }})
            </button>
          </template>

          <!-- 步骤4：可信开源治理成果验收 -->
          <template v-if="activeStep === 3">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="selectedCount === 0"
              @click="openBatchReviewDialog('评审通过')"
            >
              批量审核通过{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              type="button"
              class="gov-btn gov-btn--danger-fill"
              :disabled="selectedCount === 0"
              @click="openBatchReviewDialog('评审不通过')"
            >
              批量审核不通过{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              v-if="selectedApprovedCount > 0"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceApproved"
            >
              加入待入库 ({{ selectedApprovedCount }})
            </button>
          </template>

          <!-- 步骤5：软件入库 -->
          <template v-if="activeStep === 4">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="selectedCount === 0"
              @click="confirmWarehouse('已入库')"
            >
              批量入库{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
          </template>
        </div>
      </div>

      <!-- 步骤1筛选栏 -->
      <div v-if="activeStep === 0" class="gov-filter-bar">
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件名称</label>
          <span class="gov-filter-wrap">
            <input v-model="filterName" type="text" class="gov-filter-input" placeholder="输入关键词" />
            <button v-if="filterName" type="button" class="gov-filter-clear" @click="filterName = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件版本</label>
          <span class="gov-filter-wrap">
            <input v-model="filterVersion" type="text" class="gov-filter-input" placeholder="输入版本号" />
            <button v-if="filterVersion" type="button" class="gov-filter-clear" @click="filterVersion = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">获取时间</label>
          <span class="gov-filter-wrap">
            <input v-model="filterDate" type="date" class="gov-filter-input" />
            <button v-if="filterDate" type="button" class="gov-filter-clear" @click="filterDate = ''">&times;</button>
          </span>
        </div>
      </div>

      <!-- 步骤2筛选栏：引入选型 -->
      <div v-if="activeStep === 1" class="gov-filter-bar">
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件名称</label>
          <span class="gov-filter-wrap">
            <input v-model="s1Name" type="text" class="gov-filter-input" placeholder="输入关键词" />
            <button v-if="s1Name" type="button" class="gov-filter-clear" @click="s1Name = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件版本</label>
          <span class="gov-filter-wrap">
            <input v-model="s1Version" type="text" class="gov-filter-input" placeholder="输入版本号" />
            <button v-if="s1Version" type="button" class="gov-filter-clear" @click="s1Version = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">获取时间</label>
          <span class="gov-filter-wrap">
            <input v-model="s1Date" type="date" class="gov-filter-input" />
            <button v-if="s1Date" type="button" class="gov-filter-clear" @click="s1Date = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">备份状态</label>
          <span class="gov-filter-wrap">
            <select v-model="s1Backup" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待备份">待备份</option>
              <option value="备份中">备份中</option>
              <option value="备份成功">备份成功</option>
              <option value="备份失败">备份失败</option>
            </select>
          </span>
        </div>
      </div>

      <!-- 步骤3筛选栏：软件技术评估 -->
      <div v-if="activeStep === 2" class="gov-filter-bar">
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件名称</label>
          <span class="gov-filter-wrap">
            <input v-model="s2Name" type="text" class="gov-filter-input" placeholder="输入关键词" />
            <button v-if="s2Name" type="button" class="gov-filter-clear" @click="s2Name = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件版本</label>
          <span class="gov-filter-wrap">
            <input v-model="s2Version" type="text" class="gov-filter-input" placeholder="输入版本号" />
            <button v-if="s2Version" type="button" class="gov-filter-clear" @click="s2Version = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">SCA检测</label>
          <span class="gov-filter-wrap">
            <select v-model="s2Sca" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待扫描">待扫描</option>
              <option value="扫描中">扫描中</option>
              <option value="成功">成功</option>
            </select>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">Copyright检测</label>
          <span class="gov-filter-wrap">
            <select v-model="s2Copyright" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待扫描">待扫描</option>
              <option value="扫描中">扫描中</option>
              <option value="成功">成功</option>
            </select>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">恶意代码检测</label>
          <span class="gov-filter-wrap">
            <select v-model="s2Malware" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待扫描">待扫描</option>
              <option value="扫描中">扫描中</option>
              <option value="成功">成功</option>
            </select>
          </span>
        </div>
      </div>

      <!-- 步骤4筛选栏：治理成果验收 -->
      <div v-if="activeStep === 3" class="gov-filter-bar">
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件名称</label>
          <span class="gov-filter-wrap">
            <input v-model="s3Name" type="text" class="gov-filter-input" placeholder="输入关键词" />
            <button v-if="s3Name" type="button" class="gov-filter-clear" @click="s3Name = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件版本</label>
          <span class="gov-filter-wrap">
            <input v-model="s3Version" type="text" class="gov-filter-input" placeholder="输入版本号" />
            <button v-if="s3Version" type="button" class="gov-filter-clear" @click="s3Version = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">审核状态</label>
          <span class="gov-filter-wrap">
            <select v-model="s3Review" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待评审">待评审</option>
              <option value="评审通过">评审通过</option>
              <option value="评审不通过">评审不通过</option>
            </select>
          </span>
        </div>
      </div>

      <!-- 步骤5筛选栏：软件入库 -->
      <div v-if="activeStep === 4" class="gov-filter-bar">
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件名称</label>
          <span class="gov-filter-wrap">
            <input v-model="s4Name" type="text" class="gov-filter-input" placeholder="输入关键词" />
            <button v-if="s4Name" type="button" class="gov-filter-clear" @click="s4Name = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">软件版本</label>
          <span class="gov-filter-wrap">
            <input v-model="s4Version" type="text" class="gov-filter-input" placeholder="输入版本号" />
            <button v-if="s4Version" type="button" class="gov-filter-clear" @click="s4Version = ''">&times;</button>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">入库状态</label>
          <span class="gov-filter-wrap">
            <select v-model="s4Warehouse" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待入库">待入库</option>
              <option value="已入库">已入库</option>
            </select>
          </span>
        </div>
      </div>

      <div class="gov-card">
        <table class="gov-table">
          <thead>
            <tr>
              <th class="col-chk">
                <input type="checkbox" v-model="selectAll" :indeterminate="indeterminate" />
              </th>
              <th v-if="activeStep === 0">名称 *</th>
              <th v-if="activeStep === 0">版本 *</th>
              <th v-if="activeStep === 0">主语言 *</th>
              <th v-if="activeStep === 0">开源许可证 *</th>
              <th v-if="activeStep === 0">源码托管地址 *</th>
              <th v-if="activeStep === 0">获取时间</th>
              <th v-if="activeStep !== 0">名称</th>
              <th v-if="activeStep !== 0">版本</th>
              <th v-if="activeStep !== 0">主语言</th>
              <th v-if="activeStep !== 0">开源许可证</th>
              <th v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3" class="col-repo">仓库地址</th>
              <th v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3" class="col-repo">备份仓库地址</th>
              <th v-if="activeStep === 1">选型时间</th>
              <th v-if="activeStep === 2">评估时间</th>
              <th v-if="activeStep === 3">验收时间</th>
              <th v-if="activeStep === 4">入库时间</th>
              <th v-if="activeStep === 1">备份状态</th>
              <th v-if="activeStep === 2">SCA 检测</th>
              <th v-if="activeStep === 2">Copyright 检测</th>
              <th v-if="activeStep === 2">恶意代码检测</th>
              <th v-if="activeStep === 3">审核状态</th>
              <th v-if="activeStep === 3">审核意见</th>
              <th v-if="activeStep === 4">入库状态</th>
              <th class="col-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in paginatedList" :key="item.id">
              <tr>
                <td class="col-chk">
                  <input type="checkbox" v-model="item.selected" />
                </td>
                <td v-if="activeStep === 0">{{ item.name }}</td>
                <td v-if="activeStep === 0">{{ item.version }}</td>
                <td v-if="activeStep === 0">{{ item.lang || '—' }}</td>
                <td v-if="activeStep === 0">{{ item.license || '—' }}</td>
                <td v-if="activeStep === 0" class="col-repo">
                  <code class="gov-code">{{ item.repoUrl }}</code>
                </td>
                <td v-if="activeStep === 0" class="gov-muted">{{ item.createdAt }}</td>
                <td v-if="activeStep !== 0 && activeStep !== 3 && activeStep !== 4 && activeStep !== 2">
                  <button type="button" class="gov-link" @click="goDetail(item)">{{ item.name }}</button>
                </td>
                <td v-if="activeStep !== 0 && activeStep !== 3 && activeStep !== 4 && activeStep !== 2">{{ item.version }}</td>
                <td v-if="activeStep === 2">{{ item.name }}</td>
                <td v-if="activeStep === 2">
                  <button v-if="item.scanProgress !== undefined && item.scanProgress >= 33" type="button" class="gov-link" @click="goDetail(item)">{{ item.version }}</button>
                  <span v-else>{{ item.version }}</span>
                </td>
                <td v-if="activeStep === 3 || activeStep === 4">{{ item.name }}</td>
                <td v-if="activeStep === 3 || activeStep === 4">
                  <button type="button" class="gov-link" @click="goDetail(item)">{{ item.version }}</button>
                </td>
                <td v-if="activeStep !== 0">{{ item.lang || '—' }}</td>
                <td v-if="activeStep !== 0">{{ item.license || '—' }}</td>
                <td v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3" class="col-repo">
                  <code class="gov-code">{{ item.repoUrl }}</code>
                </td>
                <td v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3" class="col-repo">
                  <code class="gov-code">{{ item.backupStatus === '待备份' ? '--' : (item.mirrorUrl || '--') }}</code>
                </td>
                <td v-if="activeStep !== 0" class="gov-muted">{{ item.createdAt }}</td>
                <td v-if="activeStep === 1">
                  <span class="gov-badge" :class="badgeClass(item.backupStatus)">{{ item.backupStatus }}</span>
                </td>
                <td v-if="activeStep === 2">
                  <span class="gov-scan-sub" :class="scanBadge(item.scanProgress, 0, 33)">{{ item.scanProgress !== undefined ? (item.scanProgress >= 33 ? '成功' : '扫描中') : '待扫描' }}</span>
                </td>
                <td v-if="activeStep === 2">
                  <span class="gov-scan-sub" :class="scanBadge(item.scanProgress, 33, 66)">{{ item.scanProgress !== undefined ? (item.scanProgress >= 66 ? '成功' : '扫描中') : '待扫描' }}</span>
                </td>
                <td v-if="activeStep === 2">
                  <span class="gov-scan-sub" :class="scanBadge(item.scanProgress, 66, 100)">{{ item.scanProgress !== undefined ? (item.scanProgress >= 100 ? '成功' : '扫描中') : '待扫描' }}</span>
                </td>
              <td v-if="activeStep === 3">
                <span class="gov-badge" :class="badgeClass(item.reviewStatus)">{{ item.reviewStatus }}</span>
              </td>
              <td v-if="activeStep === 3" class="gov-review-opinion">
                <span v-if="item.reviewComment" class="gov-opinion-link" @click="openOpinionHistory(item)">{{ item.reviewComment }}</span>
                <span v-else class="gov-opinion-empty" @click="openOpinionHistory(item)">--</span>
              </td>
              <td v-if="activeStep === 4">
                <span class="gov-badge" :class="badgeClass(item.warehouseStatus)">{{ item.warehouseStatus }}</span>
              </td>
              <td class="col-op">
                <button type="button" class="gov-link-sub" @click="viewLog(item)">日志</button>
                <template v-if="activeStep === 0 || activeStep === 1">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="goDetail(item)">详情</button>
                </template>
                <span class="gov-sep">|</span>
                <button type="button" class="gov-link-sub" @click="removeItem(item)">移除</button>
                <template v-if="activeStep === 3">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="openReviewModal(item)">审核</button>
                </template>
                <template v-if="activeStep === 4">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="singleWarehouse(item, '已入库')">入库</button>
                </template>
                <template v-if="activeStep === 2">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="toggleScan(item)">{{ item._scanOpen ? '▾' : '▸' }}</button>
                </template>
              </td>
            </tr>
            <!-- 扫描进度展开行 -->
            <tr v-if="item._scanOpen && activeStep === 2" class="gov-scan-detail-row">
              <td :colspan="colSpan" style="padding: 12px 40px;">
                <div class="gov-scan-detail">
                  <div class="gov-scan-detail-bar">
                    <div class="gov-scan-detail-track">
                      <div class="gov-scan-detail-fill" :style="{ width: (item.scanProgress || 0) + '%' }" />
                    </div>
                    <div class="gov-scan-detail-node" :class="{ 'is-done': (item.scanProgress || 0) >= 33 }" style="left:16.7%">
                      <span class="gov-scan-node-label">SCA 检测</span>
                    </div>
                    <div class="gov-scan-detail-node" :class="{ 'is-done': (item.scanProgress || 0) >= 66 }" style="left:50%">
                      <span class="gov-scan-node-label">Copyright</span>
                    </div>
                    <div class="gov-scan-detail-node" :class="{ 'is-done': (item.scanProgress || 0) >= 100 }" style="left:83.3%">
                      <span class="gov-scan-node-label">恶意代码</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="stepList.length === 0">
              <td :colspan="colSpan" class="gov-empty">{{ emptyText }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="stepList.length > 0" class="gov-pagination">
          <span class="gov-page-info">共 {{ stepList.length }} 条</span>
          <div class="gov-page-controls">
            <button type="button" class="gov-page-btn" :disabled="page <= 1" @click="page--">‹</button>
            <button
              v-for="p in displayPages"
              :key="p"
              type="button"
              class="gov-page-btn"
              :class="{ 'is-active': p === page }"
              @click="page = p"
            >{{ p }}</button>
            <button type="button" class="gov-page-btn" :disabled="page >= totalPages" @click="page++">›</button>
          </div>
        </div>
      </div>
    </div>

    </template>

    <!-- ===== 日志侧栏 ===== -->
    <Teleport to="body">
      <div v-if="logItem" class="gov-overlay" @click.self="logItem = null">
        <div class="gov-drawer">
          <div class="gov-drawer-hd">
            <h3 class="gov-drawer-title">执行日志 - {{ logItem.name }}</h3>
            <button type="button" class="gov-drawer-close" @click="logItem = null">&times;</button>
          </div>
          <div class="gov-drawer-body">
            <div v-for="(log, i) in logItem.logs" :key="i" class="gov-log-row">
              <span class="gov-log-time">{{ log.time }}</span>
              <span class="gov-log-level" :class="'level--' + log.level">{{ log.level }}</span>
              <span class="gov-log-msg">{{ log.msg }}</span>
            </div>
            <p v-if="logItem.logs.length === 0" class="gov-empty-sm">暂无日志</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 详情侧栏（未扫描完成） ===== -->
    <Teleport to="body">
      <div v-if="drawerItem" class="gov-overlay" @click.self="drawerItem = null">
        <div class="gov-drawer">
          <div class="gov-drawer-hd">
            <button type="button" class="gov-drawer-back" @click="drawerItem = null">&larr; 返回</button>
            <h3 class="gov-drawer-title">{{ drawerItem.name }} v{{ drawerItem.version }}</h3>
            <button type="button" class="gov-drawer-close" @click="drawerItem = null">&times;</button>
          </div>
          <div class="gov-drawer-body">
            <h4 class="detail-section-title">版本信息</h4>
            <table class="detail-table detail-table--pairs">
              <tr><td class="dt-label">软件名称</td><td class="dt-value">{{ drawerItem.name }}</td></tr>
              <tr><td class="dt-label">版本号</td><td class="dt-value">{{ drawerItem.version }}</td></tr>
              <tr><td class="dt-label">主语言</td><td class="dt-value">{{ drawerItem.lang || '--' }}</td></tr>
              <tr><td class="dt-label">开源许可证</td><td class="dt-value">{{ drawerItem.license || '--' }}</td></tr>
              <tr><td class="dt-label">发布日期</td><td class="dt-value">{{ drawerItem.createdAt ? drawerItem.createdAt.slice(0, 10) : '--' }}</td></tr>
              <tr><td class="dt-label">开发商</td><td class="dt-value">{{ drawerItem.developer || '--' }}</td></tr>
              <tr><td class="dt-label">许可证ID</td><td class="dt-value">{{ drawerItem.licenseId || '--' }}</td></tr>
            </table>
            <div class="detail-desc-block">
              {{ drawerItem.desc || '暂无描述信息' }}
            </div>
            <h4 class="detail-section-title">参考信息</h4>
            <table class="detail-table detail-table--pairs">
              <tr><td class="dt-label">官网地址</td><td class="dt-value">{{ drawerItem.repoUrl || '--' }}</td></tr>
              <tr><td class="dt-label">分支</td><td class="dt-value">{{ drawerItem.branch || '--' }}</td></tr>
              <tr><td class="dt-label">社区标签 (Tag)</td><td class="dt-value">{{ drawerItem.tag || '--' }}</td></tr>
              <tr><td class="dt-label">Commit ID</td><td class="dt-value"><code class="gov-code">{{ drawerItem.commitId || '--' }}</code></td></tr>
              <tr><td class="dt-label">软件文件</td><td class="dt-value">{{ drawerItem.file || '--' }}</td></tr>
              <tr><td class="dt-label">代码量 (KL)</td><td class="dt-value">{{ drawerItem.codeSize || '--' }}</td></tr>
              <tr><td class="dt-label">源码托管地址</td><td class="dt-value">{{ drawerItem.repoUrl || '--' }}</td></tr>
              <tr><td class="dt-label">备份仓库地址</td><td class="dt-value">{{ drawerItem.mirrorUrl || '--' }}</td></tr>
              <tr><td class="dt-label">漏洞披露地址</td><td class="dt-value">{{ drawerItem.vulnUrl || '--' }}</td></tr>
            </table>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 软件详情页（扫描完成） ===== -->
    <div v-if="detailItem" class="gov-detail-page">
      <div class="gd-topbar">
        <button type="button" class="gd-back" @click="detailItem = null">&larr; 返回工作台</button>
      </div>

      <section class="gd-hero">
        <div class="gd-hero-lead">
          <h1 class="gd-hero-title">{{ detailItem.name }}</h1>
          <div class="gd-hero-meta-strip">
            <div class="gd-hero-meta-cell">
              <span class="gd-hero-meta-k">版本</span>
              <span class="gd-hero-meta-v gd-hero-meta-v--ver">v{{ detailItem.version }}</span>
            </div>
            <span class="gd-hero-meta-divider" />
            <div class="gd-hero-meta-cell">
              <span class="gd-hero-meta-k">语言</span>
              <span class="gd-hero-meta-v">{{ detailItem.lang || '--' }}</span>
            </div>
            <span class="gd-hero-meta-divider" />
            <div class="gd-hero-meta-cell gd-hero-meta-cell--grow">
              <span class="gd-hero-meta-k">许可证</span>
              <span class="gd-hero-meta-v">{{ detailItem.license || '--' }}</span>
            </div>
          </div>
        </div>
        <div class="gd-hero-actions">
          <span class="gd-hero-time">获取时间：{{ detailItem.createdAt || '--' }}</span>
        </div>
      </section>

      <div class="gd-tabs">
        <button
          v-for="t in detailTabs"
          :key="t.key"
          type="button"
          class="gd-tab"
          :class="{ 'is-active': detailTab === t.key }"
          @click="detailTab = t.key"
        >{{ t.label }}</button>
      </div>

      <!-- Tab: 软件介绍 -->
      <div v-show="detailTab === 'intro'" class="gd-intro-split">
        <div class="gd-readme-col">
          <section class="gd-block gd-readme-block">
            <h2 class="gd-readme-title">{{ detailItem.name }} — {{ detailItem.lang || '未知' }} 开源项目</h2>
            <div class="gd-readme-badges">
              <span class="gd-badge-sm">v{{ detailItem.version }}</span>
              <span class="gd-badge-sm gd-badge-sm--accent">{{ detailItem.license || '--' }}</span>
              <span class="gd-badge-sm">{{ detailItem.lang || '--' }}</span>
            </div>
            <p class="gd-readme-p">{{ detailItem.desc || (detailItem.name + ' 是一个开源软件项目，采用 ' + (detailItem.license || '--') + ' 许可证，由 ' + (detailItem.developer || '未知开发者') + ' 维护。') }}</p>
            <p class="gd-readme-p">本项目已在可信开源代码库中标记治理，代码量约 {{ detailItem.codeSize || '--' }} KL。</p>
            <h3 class="gd-readme-h3">仓库地址</h3>
            <div class="gd-install-box">
              <code class="gd-install-cmd">{{ detailItem.repoUrl }}</code>
              <button type="button" class="gd-install-copy" @click="copyRepo(detailItem.repoUrl)">复制</button>
            </div>
            <h3 class="gd-readme-h3">基本信息</h3>
            <pre class="gd-readme-pre"><code>名称：{{ detailItem.name }}
版本：{{ detailItem.version }}
分支：{{ detailItem.branch || '--' }}
Tag：{{ detailItem.tag || '--' }}
Commit：{{ detailItem.commitId || '--' }}
文件：{{ detailItem.file || '--' }}</code></pre>
            <p class="gd-readme-note">以上为治理流程中获取的软件信息。</p>
          </section>
        </div>

        <aside class="gd-meta-col gd-meta-col-flat">
          <div class="gd-link-stack">
            <div class="gd-link-entry">
              <div class="gd-link-label">源码地址</div>
              <a class="gd-link-row" :href="detailItem.repoUrl" target="_blank" rel="noopener noreferrer">
                <span class="gd-link-url">{{ detailItem.repoUrl || '--' }}</span>
              </a>
            </div>
            <hr class="gd-link-divider" />
            <div class="gd-link-entry">
              <div class="gd-link-label">镜像仓库</div>
              <div class="gd-link-row">
                <span class="gd-link-url">{{ detailItem.mirrorUrl || '--' }}</span>
              </div>
            </div>
            <hr class="gd-link-divider" />
            <div class="gd-link-entry">
              <div class="gd-link-label">官网地址</div>
              <a class="gd-link-row" :href="detailItem.repoUrl" target="_blank" rel="noopener noreferrer">
                <span class="gd-link-url">{{ detailItem.repoUrl || '--' }}</span>
              </a>
            </div>
          </div>

          <hr class="gd-meta-sep" />

          <section class="gd-meta-section">
            <h2 class="gd-meta-section-title">基本信息</h2>
            <dl class="gd-meta-dl">
              <div class="gd-meta-row"><dt>主语言类型</dt><dd>{{ detailItem.lang || '--' }}</dd></div>
              <div class="gd-meta-row"><dt>开发商</dt><dd>{{ detailItem.developer || '--' }}</dd></div>
              <div class="gd-meta-row"><dt>发布日期</dt><dd>{{ detailItem.createdAt ? detailItem.createdAt.slice(0, 10) : '--' }}</dd></div>
              <div class="gd-meta-row gd-meta-row-license">
                <dt>开源License</dt>
                <dd class="gd-meta-dd-license">
                  <span class="gd-license-pill">{{ detailItem.license || '--' }}</span>
                </dd>
              </div>
            </dl>
          </section>

          <hr class="gd-meta-sep" />

          <section class="gd-meta-section">
            <h2 class="gd-meta-section-title">参考信息</h2>
            <dl class="gd-meta-dl">
              <div class="gd-meta-row"><dt>代码量</dt><dd>{{ detailItem.codeSize || '--' }} KL</dd></div>
              <div class="gd-meta-row"><dt>许可证ID</dt><dd>{{ detailItem.licenseId || '--' }}</dd></div>
              <div class="gd-meta-row gd-meta-row-full"><dt>版本描述</dt><dd class="mono">{{ detailItem.desc || '暂无描述' }}</dd></div>
            </dl>
          </section>
        </aside>
      </div>

      <!-- Tab: 评估结果 -->
      <div v-show="detailTab === 'assess'" class="gd-tab-panel">
        <div class="gd-assess-grid">
          <div class="gd-assess-card" v-for="ac in assessCards" :key="ac.key">
            <div class="gd-assess-card-hd">
              <span class="gd-assess-card-name">{{ ac.name }}</span>
              <span class="gd-assess-card-status" :class="ac.ok ? 'is-ok' : 'is-pending'">{{ ac.ok ? '已完成' : '--' }}</span>
            </div>
          </div>
        </div>
        <section class="gd-block" style="margin-top:20px">
          <h2 class="gd-section-title">治理报告</h2>
          <div class="gd-report-list">
            <div class="gd-report-item"><span>SBOM 报告</span><span class="gd-badge-sm gd-badge-sm--ok">已生成</span></div>
            <div class="gd-report-item"><span>漏洞扫描报告</span><span class="gd-badge-sm gd-badge-sm--ok">已生成</span></div>
            <div class="gd-report-item"><span>许可证分析报告</span><span class="gd-badge-sm gd-badge-sm--ok">已生成</span></div>
          </div>
        </section>
      </div>

      <!-- Tab: 治理信息 -->
      <div v-show="detailTab === 'log'" class="gd-tab-panel gd-tab-panel--pad">
        <div class="gd-timeline">
          <div v-for="(t, i) in detailTimeline(detailItem)" :key="i" class="gd-timeline-item">
            <div class="gd-timeline-dot" :class="'dot--' + t.level" />
            <div class="gd-timeline-body">
              <span class="gd-timeline-action">{{ t.action }}</span>
              <span class="gd-timeline-time">{{ t.time }}</span>
            </div>
          </div>
        </div>
        <section class="gd-block" style="margin-top:24px">
          <h2 class="gd-section-title">执行日志</h2>
          <div class="gd-log-list">
            <div v-for="(l, i) in (detailItem.logs || [])" :key="i" class="gd-log-row">
              <span class="gd-log-time">{{ l.time }}</span>
              <span class="gd-log-level" :class="'level--' + l.level">{{ l.level }}</span>
              <span class="gd-log-msg">{{ l.msg }}</span>
            </div>
            <p v-if="!(detailItem.logs || []).length" class="gd-empty">暂无日志</p>
          </div>
        </section>
      </div>

      <!-- 占位 tabs -->
      <div v-show="!['intro','assess','log'].includes(detailTab)" class="gd-tab-panel gd-placeholder">
        <p class="gd-placeholder-text">「{{ detailTabs.find(t => t.key === detailTab)?.label }}」内容占位，可后续接入。</p>
      </div>
    </div>
    <!-- ===== 审核弹窗 ===== -->
    <Teleport to="body">
      <div v-if="reviewItem" class="gov-overlay" @click.self="reviewItem = null">
        <div class="review-modal">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">审核</h3>
            <button type="button" class="review-modal-close" @click="reviewItem = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <div class="review-software-bar">
              <span class="review-software-name">{{ reviewItem.name }}</span>
              <span class="review-software-ver">v{{ reviewItem.version }}</span>
              <span class="review-software-lang">{{ reviewItem.lang }}</span>
            </div>
            <div class="review-field">
              <label class="review-field-label">审核结果</label>
              <div class="review-radio-group">
                <label class="review-radio" :class="{ 'is-pass': reviewResult === '评审通过' }">
                  <input type="radio" v-model="reviewResult" value="评审通过" />
                  <span class="review-radio-dot" />
                  <span class="review-radio-text">通过</span>
                </label>
                <label class="review-radio" :class="{ 'is-fail': reviewResult === '评审不通过' }">
                  <input type="radio" v-model="reviewResult" value="评审不通过" />
                  <span class="review-radio-dot" />
                  <span class="review-radio-text">不通过</span>
                </label>
              </div>
            </div>
            <div class="review-field">
              <label class="review-field-label">审核意见</label>
              <textarea v-model="reviewComment" class="review-textarea" rows="3" placeholder="请输入审核意见..." />
            </div>
          </div>
          <div class="review-modal-ft">
            <button type="button" class="gov-btn" @click="reviewItem = null">取消</button>
            <button
              type="button"
              class="gov-btn"
              :class="reviewResult === '评审通过' ? 'gov-btn--primary' : 'gov-btn--danger-fill'"
              @click="submitReviewItem"
            >
              确认{{ reviewResult === '评审通过' ? '通过' : '不通过' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 批量审核弹窗 ===== -->
    <Teleport to="body">
      <div v-if="batchReviewTarget" class="gov-overlay" @click.self="batchReviewTarget = null">
        <div class="review-modal">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">批量{{ batchReviewTarget === '评审通过' ? '审核通过' : '审核不通过' }}</h3>
            <button type="button" class="review-modal-close" @click="batchReviewTarget = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <p class="review-modal-desc">
              确定将选中的 <strong>{{ selectedCount }}</strong> 项软件批量{{ batchReviewTarget === '评审通过' ? '通过' : '不通过' }}审核？请填写审核意见：
            </p>
            <div class="review-field">
              <label class="review-field-label">审核意见</label>
              <textarea v-model="batchReviewOpinion" class="review-textarea" rows="4" placeholder="请输入审核意见（必填）" />
            </div>
          </div>
          <div class="review-modal-ft">
            <button type="button" class="gov-btn" @click="batchReviewTarget = null">取消</button>
            <button
              type="button"
              class="gov-btn"
              :class="batchReviewTarget === '评审通过' ? 'gov-btn--primary' : 'gov-btn--danger-fill'"
              :disabled="!batchReviewOpinion.trim()"
              @click="confirmBatchReview"
            >
              确认{{ batchReviewTarget === '评审通过' ? '通过' : '不通过' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 审核意见历史弹窗 ===== -->
    <Teleport to="body">
      <div v-if="opinionHistoryItem" class="gov-overlay" @click.self="opinionHistoryItem = null">
        <div class="review-modal" style="width:560px;">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">审核意见历史</h3>
            <button type="button" class="review-modal-close" @click="opinionHistoryItem = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <p class="review-modal-desc">
              <strong>{{ opinionHistoryItem.name }} {{ opinionHistoryItem.version }}</strong> 的审核意见修改记录：
            </p>
            <div class="opinion-history-wrap">
              <table class="gov-table">
                <thead>
                  <tr>
                    <th>审核结果</th>
                    <th>审核意见</th>
                    <th>操作人</th>
                    <th>操作时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!opinionHistoryItem.reviewHistory || opinionHistoryItem.reviewHistory.length === 0">
                    <td colspan="4" class="gov-empty-sm">暂无审核记录</td>
                  </tr>
                  <tr v-for="(h, idx) in (opinionHistoryItem.reviewHistory || []).slice().reverse()" :key="idx">
                    <td>
                      <span class="gov-op-tag" :class="h.result === '评审通过' ? 'gov-op-tag--pass' : 'gov-op-tag--fail'">{{ h.result === '评审通过' ? '通过' : '不通过' }}</span>
                    </td>
                    <td class="opinion-history-opinion">{{ h.opinion || '--' }}</td>
                    <td>{{ h.operator }}</td>
                    <td class="gov-muted">{{ h.timestamp }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="review-modal-ft">
            <button type="button" class="gov-btn" @click="opinionHistoryItem = null">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const logItem = ref(null)
const detailItem = ref(null)
const drawerItem = ref(null)
const reviewItem = ref(null)
const reviewResult = ref('评审通过')
const reviewComment = ref('')
const activeStep = ref(0)
const fetchingList = ref(false)
const fetchProgress = ref(0)
const batchReviewTarget = ref(null)
const batchReviewOpinion = ref('')
const opinionHistoryItem = ref(null)

// 步骤1筛选
const filterName = ref('')
const filterVersion = ref('')
const filterDate = ref('')

// 步骤2筛选：引入选型
const s1Name = ref('')
const s1Version = ref('')
const s1Date = ref('')
const s1Backup = ref('')

// 步骤3筛选：软件技术评估
const s2Name = ref('')
const s2Version = ref('')
const s2Sca = ref('')
const s2Copyright = ref('')
const s2Malware = ref('')

// 步骤4筛选：治理成果验收
const s3Name = ref('')
const s3Version = ref('')
const s3Review = ref('')

// 步骤5筛选：软件入库
const s4Name = ref('')
const s4Version = ref('')
const s4Warehouse = ref('')

// ===== 治理流程步骤定义 =====
const steps = [
  { key: 'acquire', label: '软件获取'},
  { key: 'select', label: '引入选型'},
  { key: 'assess', label: '软件技术评估'},
  { key: 'review', label: '治理成果验收'},
  { key: 'warehouse', label: '软件入库'},
]

// ===== 数据模型：每条软件只有一条记录，currentStep 表示所处阶段 =====
const softwareList = ref([])

let nextId = 1

// 当前步骤的列表
function scanStage(progress, threshold) {
  if (progress === undefined || progress === null) return '待扫描'
  if (progress < threshold) return '扫描中'
  return '成功'
}

const stepList = computed(() => {
  let list = softwareList.value.filter(item => item.currentStep === activeStep.value + 1)

  // 步骤1：软件获取
  if (activeStep.value === 0) {
    const name = filterName.value.trim().toLowerCase()
    const version = filterVersion.value.trim().toLowerCase()
    const date = filterDate.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (date) list = list.filter(i => i.createdAt && i.createdAt.startsWith(date))
  }

  // 步骤2：引入选型
  if (activeStep.value === 1) {
    const name = s1Name.value.trim().toLowerCase()
    const version = s1Version.value.trim().toLowerCase()
    const date = s1Date.value
    const backup = s1Backup.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (date) list = list.filter(i => i.createdAt && i.createdAt.startsWith(date))
    if (backup) list = list.filter(i => i.backupStatus === backup)
  }

  // 步骤3：软件技术评估
  if (activeStep.value === 2) {
    const name = s2Name.value.trim().toLowerCase()
    const version = s2Version.value.trim().toLowerCase()
    const sca = s2Sca.value
    const copyright = s2Copyright.value
    const malware = s2Malware.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (sca) list = list.filter(i => scanStage(i.scanProgress, 33) === sca)
    if (copyright) list = list.filter(i => scanStage(i.scanProgress, 66) === copyright)
    if (malware) list = list.filter(i => scanStage(i.scanProgress, 100) === malware)
  }

  // 步骤4：治理成果验收
  if (activeStep.value === 3) {
    const name = s3Name.value.trim().toLowerCase()
    const version = s3Version.value.trim().toLowerCase()
    const review = s3Review.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (review) list = list.filter(i => i.reviewStatus === review)
  }

  // 步骤5：软件入库
  if (activeStep.value === 4) {
    const name = s4Name.value.trim().toLowerCase()
    const version = s4Version.value.trim().toLowerCase()
    const warehouse = s4Warehouse.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (warehouse) list = list.filter(i => i.warehouseStatus === warehouse)
  }

  return list
})

// ===== KPI 计算 =====
const totalCount = computed(() => softwareList.value.length)
const kpiPendingBackup = computed(() => softwareList.value.filter(i => i.currentStep === 2 && i.backupStatus !== '备份成功').length)
const kpiPendingAssess = computed(() => softwareList.value.filter(i => i.currentStep === 3 && i.assessStatus !== '评估完成').length)
const kpiPendingReview = computed(() => softwareList.value.filter(i => i.currentStep === 4 && i.reviewStatus === '待评审').length)
const kpiPendingWarehouse = computed(() => softwareList.value.filter(i => i.currentStep === 5 && i.warehouseStatus === '待入库').length)
const kpiEntered = computed(() => softwareList.value.filter(i => i.currentStep === 5 && i.warehouseStatus === '已入库').length)


// 选中相关

// 选中相关
const selectedCount = computed(() => stepList.value.filter(i => i.selected).length)

const selectAll = computed({
  get: () => paginatedList.value.length > 0 && paginatedList.value.every(i => i.selected),
  set: val => paginatedList.value.forEach(i => { i.selected = val }),
})

const indeterminate = computed(() => {
  const sel = paginatedList.value.filter(i => i.selected)
  return sel.length > 0 && sel.length < paginatedList.value.length
})

// 分页
const pageSize = 8
const page = ref(1)
watch(activeStep, () => { page.value = 1 })
const totalPages = computed(() => Math.max(1, Math.ceil(stepList.value.length / pageSize)))
const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize
  return stepList.value.slice(start, start + pageSize)
})
const displayPages = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push(0, total)
  } else if (cur >= total - 3) {
    pages.push(1, 0)
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1, 0, cur - 1, cur, cur + 1, 0, total)
  }
  return pages
})

// ===== 选中的且可推进的数量（选中 + 状态已完成） =====
const selectedAdvanceableCount = computed(() => {
  const list = stepList.value.filter(i => i.selected)
  if (list.length === 0) return 0
  if (activeStep.value === 0) return list.length
  if (activeStep.value === 1) return list.filter(i => i.backupStatus === '备份成功').length
  if (activeStep.value === 2) return list.filter(i => i.assessStatus === '评估完成').length
  if (activeStep.value === 3) return list.filter(i => i.reviewStatus === '评审通过').length
  if (activeStep.value === 4) return list.length
  return 0
})

// 步骤2：选中的待备份数
const selectedPendingBackupCount = computed(() =>
  stepList.value.filter(i => i.selected && i.backupStatus === '待备份').length,
)
const hasSelectedPendingBackup = computed(() => selectedPendingBackupCount.value > 0)

// 步骤3：选中的待评估数
const selectedPendingAssessCount = computed(() =>
  stepList.value.filter(i => i.selected && i.assessStatus === '待评估').length,
)
const hasSelectedPendingAssess = computed(() => selectedPendingAssessCount.value > 0)

// 步骤4：选中的且审核通过的数量
const selectedApprovedCount = computed(() =>
  stepList.value.filter(i => i.selected && i.reviewStatus === '评审通过').length,
)

// 表格列数
const colSpan = computed(() => {
  const counts = [9, 10, 10, 9, 10]
  return counts[activeStep.value] || 9
})

// 空提示
const emptyText = computed(() => {
  const map = [
    '暂无软件，点击「获取软件列表」或「Excel 导入」添加',
    '暂无待备份软件',
    '暂无待评估软件',
    '暂无待验收软件',
    '暂无待处理意见软件',
    '暂无待入库软件',
  ]
  return map[activeStep.value] || '暂无数据'
})

// ===== 徽标映射 =====
const statusBadgeMap = {
  '待备份': 'warn', '备份中': 'run', '备份成功': 'ok', '备份失败': 'fail',
  '待评估': 'warn', '评估中': 'run', '评估完成': 'ok', '评估失败': 'fail',
  '待评审': 'warn', '评审通过': 'ok', '评审不通过': 'fail', '有条件通过': 'warn',
  '待处理': 'warn', '已处理': 'ok',
  '待入库': 'warn', '待发布': 'ok', '不通过': 'fail', '已入库': 'ok',
}

function badgeClass(status) {
  return 'badge--' + (statusBadgeMap[status] || 'pending')
}

function fmtNow() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 筛选变化时重置分页
watch([
  filterName, filterVersion, filterDate,
  s1Name, s1Version, s1Date, s1Backup,
  s2Name, s2Version, s2Sca, s2Copyright, s2Malware,
  s3Name, s3Version, s3Review,
  s4Name, s4Version, s4Warehouse,
], () => {
  page.value = 1
})

// 步骤1：获取软件列表
function fetchSoftwareList() {
  fetchingList.value = true
  fetchProgress.value = 0
  const interval = setInterval(() => {
    fetchProgress.value += Math.floor(Math.random() * 12) + 5
    if (fetchProgress.value >= 100) {
      fetchProgress.value = 100
      clearInterval(interval)
      const mockSoftware = [
        { name: 'Vue.js', version: '3.4.21', repoUrl: 'https://github.com/vuejs/core.git', lang: 'TypeScript', license: 'MIT', file: 'vue-3.4.21.zip', developer: '尤雨溪', licenseId: 'MIT', branch: 'main', tag: 'v3.4.21', commitId: 'a1b2c3d4e5', codeSize: '285', vulnUrl: 'https://github.com/vuejs/core/security' },
        { name: 'React', version: '18.2.0', repoUrl: 'https://github.com/facebook/react.git', lang: 'JavaScript', license: 'MIT', file: 'react-18.2.0.zip', developer: 'Meta', licenseId: 'MIT', branch: 'main', tag: 'v18.2.0', commitId: 'f6e7g8h9i0', codeSize: '362', vulnUrl: 'https://github.com/facebook/react/security' },
        { name: 'Log4j', version: '2.23.1', repoUrl: 'https://github.com/apache/logging-log4j2.git', lang: 'Java', license: 'Apache-2.0', file: 'log4j-2.23.1.jar', developer: 'Apache', licenseId: 'Apache-2.0', branch: 'main', tag: 'rel/2.23.1', commitId: 'j1k2l3m4n5', codeSize: '189', vulnUrl: 'https://github.com/apache/logging-log4j2/security' },
        { name: 'Spring Framework', version: '6.1.5', repoUrl: 'https://github.com/spring-projects/spring-framework.git', lang: 'Java', license: 'Apache-2.0', file: 'spring-framework-6.1.5.jar', developer: 'VMware', licenseId: 'Apache-2.0', branch: 'main', tag: 'v6.1.5', commitId: 'o5p6q7r8s9', codeSize: '1240', vulnUrl: 'https://github.com/spring-projects/spring-framework/security' },
        { name: 'Django', version: '5.0.4', repoUrl: 'https://github.com/django/django.git', lang: 'Python', license: 'BSD-3-Clause', file: 'Django-5.0.4.tar.gz', developer: 'Django Software Foundation', licenseId: 'BSD-3-Clause', branch: 'main', tag: '5.0.4', commitId: 't0u1v2w3x4', codeSize: '98', vulnUrl: 'https://github.com/django/django/security' },
        { name: 'OpenSSL', version: '3.3.0', repoUrl: 'https://github.com/openssl/openssl.git', lang: 'C', license: 'Apache-2.0', file: 'openssl-3.3.0.tar.gz', developer: 'OpenSSL Software Foundation', licenseId: 'Apache-2.0', branch: 'master', tag: 'openssl-3.3.0', commitId: 'y5z6a7b8c9', codeSize: '512', vulnUrl: 'https://github.com/openssl/openssl/security' },
        { name: 'Redis', version: '7.2.4', repoUrl: 'https://github.com/redis/redis.git', lang: 'C', license: 'BSD-3-Clause', file: 'redis-7.2.4.tar.gz', developer: 'Redis Ltd.', licenseId: 'BSD-3-Clause', branch: 'unstable', tag: '7.2.4', commitId: 'd0e1f2g3h4', codeSize: '236', vulnUrl: 'https://github.com/redis/redis/security' },
        { name: 'Nginx', version: '1.26.0', repoUrl: 'https://github.com/nginx/nginx.git', lang: 'C', license: 'BSD-2-Clause', file: 'nginx-1.26.0.tar.gz', developer: 'NGINX, Inc.', licenseId: 'BSD-2-Clause', branch: 'main', tag: 'release-1.26.0', commitId: 'i5j6k7l8m9', codeSize: '174', vulnUrl: 'https://github.com/nginx/nginx/security' },
      ]
      const now = new Date().toLocaleString('zh-CN')
      mockSoftware.forEach(sw => {
        softwareList.value.push({
          id: nextId++,
          name: sw.name,
          version: sw.version,
          repoUrl: sw.repoUrl,
          lang: sw.lang,
          license: sw.license,
          file: sw.file,
          developer: sw.developer,
          licenseId: sw.licenseId,
          branch: sw.branch,
          tag: sw.tag,
          commitId: sw.commitId,
          codeSize: sw.codeSize,
          vulnUrl: sw.vulnUrl,
          mirrorUrl: 'https://gitcode.com/mirror/' + sw.name.toLowerCase().replace(/\s+/g, '-'),
          currentStep: 1,
          selected: false,
          createdAt: fmtNow(),
          backupStatus: '待备份',
          assessStatus: '待评估',
          reviewStatus: '待评审',
          warehouseStatus: '待入库',
          riskLevel: null,
          logs: [{ time: now, level: 'info', msg: '已获取软件列表' }],
        })
      })
      setTimeout(() => { fetchingList.value = false }, 400)
    }
  }, 250)
}

function downloadTemplate() {
  const headers = [
    '名称*', '版本*', '主语言*', '开源许可证*', '官方发布日期',
    '项目描述', '开发商', '开源许可证ID', '官网地址', '分支',
    '社区标签(Tag)', 'Commit ID', '软件文件*', '代码量(KL)',
    '开源社区源码托管地址*', '官网漏洞披露地址', '下线日期',
  ]
  const csv = '\uFEFF' + headers.join(',')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '软件导入模板.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function handleExcelImport(e) {
  const files = e.target.files
  if (!files || !files.length) return
  const now = new Date().toLocaleString('zh-CN')
  softwareList.value.push({
    id: nextId++,
    name: 'Excel-Import-' + Math.floor(Math.random() * 1000),
    version: '-',
    repoUrl: '-',
    lang: '—',
    license: '—',
    file: '—',
    currentStep: 1,
    selected: false,
    createdAt: fmtNow(),
    backupStatus: '待备份',
    assessStatus: '待评估',
    reviewStatus: '待评审',
    warehouseStatus: '待入库',
    riskLevel: null,
    logs: [{ time: now, level: 'info', msg: '通过 Excel 导入' }],
  })
  e.target.value = ''
}

// 步骤2：发起源码备份（只改状态，不推进）
function startBackup() {
  const selected = stepList.value.filter(i => i.selected && i.backupStatus === '待备份')
  const now = new Date().toLocaleString('zh-CN')
  selected.forEach(item => {
    item.selected = false
    item.backupStatus = '备份中'
    item.logs.push({ time: now, level: 'info', msg: '开始源码备份...' })
    setTimeout(() => {
      item.backupStatus = '备份成功'
      item.mirrorUrl = 'https://gitcode.com/mirror/' + item.name.toLowerCase().replace(/\s+/g, '-')
      item.logs.push({ time: new Date().toLocaleString('zh-CN'), level: 'ok', msg: '源码备份完成，镜像仓已建立' })
    }, 2000)
  })
}

// 步骤3：启动扫描（带进度条动画）
function startScan() {
  const selected = stepList.value.filter(i => i.selected)
  const now = new Date().toLocaleString('zh-CN')
  selected.forEach(item => {
    item.selected = false
    item.assessStatus = '评估中'
    item.scanProgress = 0
    item.logs.push({ time: now, level: 'info', msg: '启动 SCA 扫描、恶意代码扫描...' })
    const interval = setInterval(() => {
      if (!item.scanProgress) item.scanProgress = 0
      item.scanProgress += Math.floor(Math.random() * 10) + 3
      if (item.scanProgress >= 100) {
        item.scanProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          item.assessStatus = '评估完成'
          item.logs.push({ time: new Date().toLocaleString('zh-CN'), level: 'ok', msg: '评估完成，生成治理报告' })
        }, 500)
      }
    }, 400)
  })
}

// 步骤4：提交评审（只改状态，不推进）
function submitReview() {
  const selected = stepList.value.filter(i => i.selected && i.reviewStatus === '待评审')
  const now = new Date().toLocaleString('zh-CN')
  selected.forEach(item => {
    item.selected = false
    item.reviewStatus = '评审通过'
    item.logs.push({ time: now, level: 'ok', msg: '评审通过' })
  })
}

function handleReviewUpload(e) {
  e.target.value = ''
}

function openReviewModal(item) {
  reviewItem.value = item
  reviewResult.value = item.reviewStatus === '评审不通过' ? '评审不通过' : '评审通过'
  reviewComment.value = item.reviewComment || ''
}

function submitReviewItem() {
  if (!reviewItem.value) return
  reviewItem.value.reviewStatus = reviewResult.value
  reviewItem.value.reviewComment = reviewComment.value
  const now = fmtNow()
  if (!reviewItem.value.reviewHistory) reviewItem.value.reviewHistory = []
  reviewItem.value.reviewHistory.push({
    result: reviewResult.value,
    opinion: reviewComment.value || '无',
    operator: '当前用户',
    timestamp: now,
  })
  reviewItem.value.logs.push({ time: now, level: reviewResult.value === '评审通过' ? 'ok' : 'warn', msg: `审核结果：${reviewResult.value}，意见：${reviewComment.value || '无'}` })
  reviewItem.value = null
}

function openBatchReviewDialog(status) {
  batchReviewTarget.value = status
  batchReviewOpinion.value = ''
}

function confirmBatchReview() {
  if (!batchReviewTarget.value || !batchReviewOpinion.value.trim()) return
  const status = batchReviewTarget.value
  const opinion = batchReviewOpinion.value.trim()
  const now = fmtNow()
  stepList.value.filter(i => i.selected).forEach(item => {
    item.reviewStatus = status
    item.reviewComment = opinion
    if (!item.reviewHistory) item.reviewHistory = []
    item.reviewHistory.push({
      result: status,
      opinion,
      operator: '当前用户',
      timestamp: now,
    })
    item.logs.push({ time: now, level: status === '评审通过' ? 'ok' : 'warn', msg: `批量审核：${status}，意见：${opinion}` })
    item.selected = false
  })
  batchReviewTarget.value = null
}

function openOpinionHistory(item) {
  opinionHistoryItem.value = item
}

function advanceApproved() {
  const now = fmtNow()
  stepList.value.filter(i => i.selected && i.reviewStatus === '评审通过').forEach(item => {
    item.currentStep = 5
    item.warehouseStatus = '待入库'
    item.selected = false
    item.logs.push({ time: now, level: 'info', msg: '审核通过，进入待入库' })
  })
  activeStep.value = 4
}


function confirmWarehouse(status) {
  const selected = stepList.value.filter(i => i.selected)
  const now = fmtNow()
  selected.forEach(item => {
    item.selected = false
    item.warehouseStatus = status
    item.logs.push({ time: now, level: status === '待发布' ? 'ok' : 'warn', msg: `入库操作：${status}` })
  })
}

function singleWarehouse(item, status) {
  const now = fmtNow()
  item.warehouseStatus = status
  item.logs.push({ time: now, level: status === '待发布' ? 'ok' : 'warn', msg: `入库操作：${status}` })
}

// ===== 推进到下一步（只推进选中的且状态已完成的条目） =====
function advanceToStep(targetStepIndex) {
  const list = stepList.value.filter(i => i.selected)
  let eligible = []
  if (activeStep.value === 0) {
    eligible = list
  } else if (activeStep.value === 1) {
    eligible = list.filter(i => i.backupStatus === '备份成功')
  } else if (activeStep.value === 2) {
    eligible = list.filter(i => i.assessStatus === '评估完成')
  } else if (activeStep.value === 3) {
    eligible = list.filter(i => i.reviewStatus === '评审通过')
  }

  const now = new Date().toLocaleString('zh-CN')
  eligible.forEach(item => {
    item.currentStep = targetStepIndex + 1
    item.selected = false
    item.logs.push({ time: now, level: 'info', msg: `推进至「${steps[targetStepIndex].label}」` })
  })
  activeStep.value = targetStepIndex
}

// 日志查看
function viewLog(item) {
  logItem.value = item
}

// 详情跳转：未完成扫描 → 侧栏；已完成扫描 → 全页
function goDetail(item) {
  if (item.currentStep >= 3 && item.assessStatus === '评估完成') {
    detailItem.value = item
  } else {
    drawerItem.value = item
  }
}

// 详情页
const detailTab = ref('intro')
const detailTabs = [
  { key: 'intro', label: '软件介绍' },
  { key: 'assess', label: '评估结果' },
  { key: 'log', label: '治理信息' },
]

const assessCards = computed(() => {
  if (!detailItem.value) return []
  const p = detailItem.value.scanProgress || 0
  return [
    { key: 'sca', name: 'SCA 检测', ok: p >= 33 },
    { key: 'copyright', name: 'Copyright 检测', ok: p >= 66 },
    { key: 'malware', name: '恶意代码检测', ok: p >= 100 },
    { key: 'sbom', name: 'SBOM 分析', ok: p >= 33 },
    { key: 'vuln', name: '漏洞分析', ok: p >= 66 },
    { key: 'license', name: '许可证分析', ok: p >= 66 },
  ]
})

function copyRepo(url) {
  navigator.clipboard?.writeText(url || '').catch(() => {})
}

function detailTimeline(item) {
  return [
    { action: '软件获取', time: item.createdAt || '--', level: 'info' },
    { action: '源码备份', time: item.backupStatus === '备份成功' ? (item.lastSync || item.createdAt || '--') : '--', level: item.backupStatus === '备份成功' ? 'ok' : 'pending' },
    { action: '技术评估', time: item.assessStatus === '评估完成' ? (item.createdAt || '--') : '--', level: item.assessStatus === '评估完成' ? 'ok' : 'pending' },
    { action: '成果验收', time: item.reviewStatus && item.reviewStatus !== '待评审' ? (item.createdAt || '--') : '--', level: item.reviewStatus === '评审通过' ? 'ok' : item.reviewStatus === '评审不通过' ? 'fail' : 'pending' },
    { action: '软件入库', time: item.warehouseStatus === '已入库' ? (item.warehouseTime || '--') : '--', level: item.warehouseStatus === '已入库' ? 'ok' : 'pending' },
  ]
}

// 移除软件
function removeItem(item) {
  const idx = softwareList.value.indexOf(item)
  if (idx !== -1) softwareList.value.splice(idx, 1)
}

function toggleScan(item) {
  item._scanOpen = !item._scanOpen
}

function scanPhase(progress) {
  if (progress < 33) return 'SCA 检测...'
  if (progress < 66) return 'Copyright 检测...'
  return '恶意代码检测...'
}

function scanBadge(progress, min, max) {
  if (progress === undefined) return 'badge--warn'
  if (progress >= max) return 'badge--ok'
  return 'badge--run'
}
</script>

<style scoped>
/* ===== 页面 ===== */
.gov-page {
  padding: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ===== KPI 指标条 ===== */
.gov-kpi {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.gov-kpi-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  min-height: 48px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.gov-kpi-item:hover {
  border-color: #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.gov-kpi-num {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  font-variant-numeric: tabular-nums;
  min-width: 26px;
  line-height: 1;
}
.gov-kpi-label {
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
}
.gov-kpi-item--warn .gov-kpi-num { color: #d97706; }
.gov-kpi-item--blue .gov-kpi-num { color: #2563eb; }
.gov-kpi-item--purple .gov-kpi-num { color: #7c3aed; }
.gov-kpi-item--orange .gov-kpi-num { color: #ea580c; }
.gov-kpi-item--green .gov-kpi-num { color: #16a34a; }
.gov-kpi-item--ok .gov-kpi-num { color: #da203e; }

/* ===== 步骤卡片 ===== */
.gov-step-cards {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
}
.gov-step-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  transition: all 0.15s;
}
.gov-step-card:first-child {
  border-radius: 8px 0 0 8px;
}
.gov-step-card:last-child {
  border-radius: 0 8px 8px 0;
}
.gov-step-card + .gov-step-card {
  margin-left: -1px;
}
.gov-step-card:hover {
  border-color: #da203e;
  z-index: 1;
}
.gov-step-card.is-active {
  border-color: #da203e;
  z-index: 2;
}
.gov-step-card-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  background: #e5e7eb;
  color: #9ca3af;
  flex-shrink: 0;
  transition: all 0.2s;
}
.gov-step-card.is-active .gov-step-card-num {
  background: #da203e;
  color: #fff;
}
.gov-step-card-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.gov-step-card-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  transition: color 0.2s;
}

/* ===== 内容区域 ===== */
.gov-content { }

.gov-content-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
  flex-wrap: wrap;
}
.gov-content-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.gov-content-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.gov-content-desc {
  font-size: 13px;
  color: #9ca3af;
}
.gov-content-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ===== 筛选栏 ===== */
.gov-filter-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.gov-filter-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.gov-filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  flex-shrink: 0;
}
.gov-filter-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}
.gov-filter-input {
  width: 100%;
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
select.gov-filter-input {
  padding-right: 10px;
  cursor: pointer;
  appearance: auto;
}
.gov-filter-input:focus {
  border-color: #da203e;
}
.gov-filter-input::placeholder {
  color: #9ca3af;
}
.gov-filter-clear {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.gov-filter-clear:hover {
  background: #e5e7eb;
  color: #374151;
}

/* ===== 获取提示文字 ===== */
.gov-fetch-hint {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

/* ===== 审核意见列 ===== */
.gov-opinion-link {
  display: inline-block;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
  font-size: 12px;
}
.gov-opinion-link:hover { color: #1d4ed8; }
.gov-opinion-empty {
  color: #d1d5db;
  cursor: pointer;
  font-size: 12px;
}

/* ===== 审核意见历史 ===== */
.opinion-history-wrap {
  max-height: 300px;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}
.opinion-history-opinion {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gov-op-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
.gov-op-tag--pass { background: #dcfce7; color: #16a34a; }
.gov-op-tag--fail { background: #fee2e2; color: #dc2626; }

.review-modal-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

/* ===== 按钮 ===== */
.gov-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
  font-family: inherit;
}
.gov-btn:hover { border-color: #da203e; color: #da203e; }
.gov-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.gov-btn:disabled:hover { border-color: #e5e7eb; color: #374151; }

.gov-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.gov-btn--primary:hover { background: #b81830; border-color: #b81830; color: #fff; }
.gov-btn--primary:disabled { background: #da203e; border-color: #da203e; color: #fff; opacity: 0.4; cursor: not-allowed; }
.gov-btn--primary:disabled:hover { background: #da203e; border-color: #da203e; color: #fff; }
.gov-btn--advance {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.gov-btn--advance:hover { background: #b81830; border-color: #b81830; color: #fff; }

.gov-btn--danger {
  background: #fff;
  color: #dc2626;
  border-color: #fecaca;
}
.gov-btn--danger:hover { background: #fef2f2; border-color: #dc2626; }

.gov-upload-wrap {
  cursor: pointer;
  display: inline-flex;
}

/* ===== 卡片 ===== */
.gov-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

/* ===== 表格 ===== */
.gov-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.gov-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
/* ===== 审核编辑控件 ===== */
.gov-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  outline: none;
  cursor: pointer;
  min-width: 80px;
}
.gov-select:focus { border-color: #da203e; }
.gov-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  color: #374151;
}
.gov-textarea:focus { border-color: #da203e; }
.gov-textarea::placeholder { color: #9ca3af; }
.gov-field { margin-bottom: 4px; }
.gov-field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}
.gov-review-opinion {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
  font-size: 12px;
}

.gov-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.gov-table tbody tr:hover { background: #fafafa; }
.gov-table tbody tr:last-child td { border-bottom: none; }

.col-chk { width: 36px; text-align: center; }
.col-repo { max-width: 160px; }
.col-op { text-align: right; white-space: nowrap; }

.gov-code {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-family: inherit;
  color: #6b7280;
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 4px;
}

.gov-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
}
.gov-link:hover { text-decoration: underline; }

.gov-link-sub {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}
.gov-link-sub:hover { color: #da203e; }
.gov-link-sub--danger { color: #dc2626; }
.gov-link-sub--danger:hover { color: #b91c1c; }

.gov-sep { margin: 0 5px; color: #d1d5db; font-size: 11px; user-select: none; }
.gov-muted { color: #9ca3af; }

.gov-empty {
  text-align: center;
  color: #9ca3af;
  padding: 56px 16px !important;
  font-size: 13px;
}

/* ===== 扫描子状态徽标 ===== */
.gov-scan-sub {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.gov-scan-sub.badge--ok { background: #dcfce7; color: #16a34a; }
.gov-scan-sub.badge--run { background: #dbeafe; color: #2563eb; }
.gov-scan-sub.badge--pending { background: #f3f4f6; color: #9ca3af; }

/* ===== 扫描进度展开行 ===== */
.gov-scan-detail-row td {
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 40px !important;
}
.gov-scan-detail {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}
.gov-scan-detail-bar {
  flex: 1;
  position: relative;
  height: 24px;
}
.gov-scan-detail-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  margin-top: -2px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: visible;
}
.gov-scan-detail-fill {
  height: 100%;
  background: #da203e;
  border-radius: 2px;
  transition: width 0.3s;
}
.gov-scan-detail-node {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: 2px solid #fff;
  z-index: 1;
  transition: background 0.3s;
}
.gov-scan-detail-node.is-done {
  background: #da203e;
}
.gov-scan-node-label {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}
.gov-scan-detail-node.is-done .gov-scan-node-label {
  color: #da203e;
}

/* ===== 徽标 ===== */

/* ===== 徽标 ===== */
.gov-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.badge--ok { background: #dcfce7; color: #16a34a; }
.badge--warn { background: #fef3c7; color: #d97706; }
.badge--fail { background: #fee2e2; color: #dc2626; }
.badge--run { background: #dbeafe; color: #2563eb; }
.badge--pending { background: #f3f4f6; color: #6b7280; }

.gov-risk {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.risk--高 { background: #fee2e2; color: #dc2626; }
.risk--中 { background: #fef3c7; color: #d97706; }
.risk--低 { background: #dcfce7; color: #16a34a; }

/* ===== 分页 ===== */
.gov-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}
.gov-page-info {
  font-size: 12px;
  color: #6b7280;
}
.gov-page-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}
.gov-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.gov-page-btn:hover:not(:disabled) {
  border-color: #da203e;
  color: #da203e;
}
.gov-page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.gov-page-btn.is-active {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
  font-weight: 600;
}

/* ===== 日志侧栏 ===== */
.gov-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}
.gov-drawer {
  width: 480px;
  max-width: 90vw;
  background: #fff;
  display: flex;
  flex-direction: column;
  animation: govDrawerIn 0.2s ease;
}
.gov-drawer--wide {
  width: 640px;
}
.gov-drawer-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.gov-drawer-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.gov-drawer-close {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}
.gov-drawer-close:hover { background: #f3f4f6; color: #374151; }
.gov-drawer-back {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.gov-drawer-back:hover { border-color: #da203e; color: #da203e; }
.gov-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.gov-log-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f9fafb;
  font-size: 13px;
  align-items: flex-start;
}
.gov-log-time {
  color: #9ca3af;
  white-space: nowrap;
  font-family: inherit;
  font-size: 12px;
  min-width: 90px;
}
.gov-log-level {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  min-width: 36px;
  text-align: center;
}
.level--info { background: #f3f4f6; color: #6b7280; }
.level--ok { background: #dcfce7; color: #16a34a; }
.level--warn { background: #fef3c7; color: #d97706; }
.level--fail { background: #fee2e2; color: #dc2626; }
.gov-log-msg { color: #374151; flex: 1; }

.gov-empty-sm {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 32px 0;
  margin: 0;
}

@keyframes govDrawerIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* ===== 软件详情页 ===== */
.gov-detail-page { margin: 0 auto; }
.gd-topbar { margin-bottom: 16px; }
.gd-back {
  display: inline-flex;
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
}
.gd-back:hover { border-color: #da203e; color: #da203e; }

/* Hero 卡片 */
.gd-hero {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 12px 16px; padding: 20px 24px;
  background: #fff; border-radius: 10px; border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04); margin-bottom: 16px;
}
.gd-hero-lead { flex: 1 1 220px; min-width: 0; }
.gd-hero-title {
  margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827; line-height: 1.3;
}
.gd-hero-meta-strip { display: flex; flex-wrap: wrap; align-items: stretch; gap: 0; margin: 0; }
.gd-hero-meta-cell {
  display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 0 18px; min-width: 0;
}
.gd-hero-meta-cell:first-of-type { padding-left: 0; }
.gd-hero-meta-cell--grow { flex: 1 1 180px; }
.gd-hero-meta-k {
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; line-height: 1.2;
}
.gd-hero-meta-v { font-size: 17px; font-weight: 800; line-height: 1.25; letter-spacing: -0.02em; color: #374151; }
.gd-hero-meta-v--ver { color: #4571cf; }
.gd-hero-meta-divider {
  width: 1px; flex-shrink: 0; align-self: stretch; min-height: 2.75rem; margin: 2px 0;
  background: linear-gradient(180deg, transparent, #d1d5db 12%, #d1d5db 88%, transparent);
}
.gd-hero-actions { flex: 0 0 auto; }
.gd-hero-time { font-size: 13px; color: #9ca3af; }

/* Tabs */
.gd-tabs {
  display: flex; gap: 4px; margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb; padding: 0 2px 2px; overflow-x: auto;
}
.gd-tab {
  position: relative; flex-shrink: 0;
  padding: 10px 14px 12px; border: none; background: none;
  font-size: 13px; color: #6b7280; cursor: pointer;
  margin-bottom: -1px; white-space: nowrap; font-family: inherit;
}
.gd-tab:hover { color: #111827; }
.gd-tab.is-active { color: #da203e; font-weight: 600; }
.gd-tab.is-active::after {
  content: ''; position: absolute; left: 12px; right: 12px; bottom: 0;
  height: 3px; background: #da203e; border-radius: 2px 2px 0 0;
}

.gd-tab-panel { margin-top: 20px; }
.gd-tab-panel--pad { padding: 20px 22px 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }

/* 软件介绍 左右分栏 */
.gd-intro-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 24px; align-items: start;
}
@media (max-width: 960px) { .gd-intro-split { grid-template-columns: 1fr; } }

.gd-readme-col { min-width: 0; }
.gd-readme-block { margin-bottom: 0; }
.gd-readme-title {
  margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827; line-height: 1.35;
}
.gd-readme-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.gd-badge-sm {
  display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px;
  color: #374151; background: #f3f4f6; border: 1px solid #e5e7eb;
}
.gd-badge-sm--accent { background: rgba(218,32,62,0.08); border-color: rgba(218,32,62,0.25); color: #da203e; font-weight: 600; }
.gd-badge-sm--ok { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.gd-readme-p { margin: 0 0 12px; font-size: 14px; color: #4b5563; line-height: 1.65; }
.gd-readme-h3 { margin: 20px 0 10px; font-size: 15px; font-weight: 700; color: #111827; }
.gd-readme-h3:first-of-type { margin-top: 8px; }
.gd-readme-pre {
  margin: 0; padding: 14px 16px; background: #fafafa; border: 1px solid #e5e7eb;
  border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5; color: #374151;
}
.gd-readme-pre code { font-family: ui-monospace, monospace; }
.gd-readme-note { font-size: 13px; color: #9ca3af; margin-top: 8px; }

.gd-install-box {
  display: flex; align-items: stretch; gap: 8px;
  padding: 12px 14px; background: #fafafa; border: 1px solid #e5e7eb;
  border-radius: 8px; margin-bottom: 8px;
}
.gd-install-cmd { flex: 1; font-family: ui-monospace, monospace; font-size: 13px; color: #111827; word-break: break-all; }
.gd-install-copy {
  flex-shrink: 0; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px;
  background: #fff; font-size: 13px; color: #374151; cursor: pointer; font-family: inherit;
}
.gd-install-copy:hover { background: #f9fafb; }

/* 右侧栏 */
.gd-meta-col { min-width: 0; }
.gd-meta-col-flat { display: flex; flex-direction: column; gap: 0; padding: 4px 0 8px; }
.gd-link-stack { display: flex; flex-direction: column; }
.gd-link-entry { padding: 12px 0 14px; }
.gd-link-label {
  font-size: 14px; font-weight: 500; color: #9ca3af; letter-spacing: 0.02em; margin-bottom: 8px;
}
.gd-link-row {
  display: flex; align-items: flex-start; gap: 8px; text-decoration: none;
  color: #111827; font-size: 13px; line-height: 1.45;
}
.gd-link-row:hover .gd-link-url { text-decoration: underline; color: #da203e; }
.gd-link-url { word-break: break-all; min-width: 0; }
.gd-link-divider { border: none; border-top: 1px solid #f3f4f6; margin: 0; }
.gd-meta-sep { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0 4px; }
.gd-meta-section { padding: 12px 0 8px; }
.gd-meta-section-title { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #111827; }
.gd-meta-dl { margin: 0; }
.gd-meta-row {
  display: grid; grid-template-columns: 88px 1fr; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;
}
.gd-meta-row:last-child { border-bottom: none; }
.gd-meta-row dt { color: #9ca3af; font-weight: 500; }
.gd-meta-row dd { margin: 0; color: #111827; }
.gd-meta-row-license dd { min-width: 0; }
.gd-meta-dd-license { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; }
.gd-license-pill {
  display: inline-block; padding: 3px 9px; font-size: 13px;
  color: #374151; background: #f9fafb; border: 1px solid #e8eaed; border-radius: 6px;
}
.gd-meta-row-full { grid-template-columns: 88px 1fr; }
.mono { font-family: ui-monospace, monospace; font-size: 12px; word-break: break-all; }

.gd-block { padding: 20px 0; }
.gd-section-title { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #111827; }

/* 评估结果 */
.gd-assess-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
@media (max-width: 700px) { .gd-assess-grid { grid-template-columns: repeat(2, 1fr); } }
.gd-assess-card { border: 1px solid #e5e7eb; border-radius: 8px; transition: border-color 0.15s; }
.gd-assess-card:hover { border-color: #da203e; }
.gd-assess-card-hd {
  display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
}
.gd-assess-card-name { font-size: 13px; font-weight: 600; color: #374151; }
.gd-assess-card-status { font-size: 12px; padding: 2px 10px; border-radius: 10px; font-weight: 500; }
.gd-assess-card-status.is-ok { background: #dcfce7; color: #16a34a; }
.gd-assess-card-status.is-pending { background: #f3f4f6; color: #9ca3af; }

.gd-report-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.gd-report-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px;
}

/* 时间线 */
.gd-timeline { position: relative; padding-left: 20px; }
.gd-timeline::before {
  content: ''; position: absolute; left: 6px; top: 4px; bottom: 4px;
  width: 2px; background: #e5e7eb; border-radius: 1px;
}
.gd-timeline-item { position: relative; padding: 0 0 16px 16px; }
.gd-timeline-item:last-child { padding-bottom: 0; }
.gd-timeline-dot {
  position: absolute; left: -16px; top: 4px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #e5e7eb; border: 2px solid #fff; z-index: 1;
}
.gd-timeline-body { }
.gd-timeline-action { font-size: 13px; font-weight: 500; color: #374151; }
.gd-timeline-time { font-size: 11px; color: #9ca3af; margin-left: 8px; }

/* 日志 */
.gd-log-list { }
.gd-log-row { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f9fafb; font-size: 13px; }
.gd-log-time { color: #9ca3af; white-space: nowrap; font-size: 12px; min-width: 100px; }
.gd-log-level { font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 3px; min-width: 36px; text-align: center; }
.gd-log-msg { color: #374151; flex: 1; }
.gd-empty { color: #9ca3af; font-size: 13px; text-align: center; padding: 24px; margin: 0; }

/* 占位 */
.gd-placeholder { padding: 48px 24px; text-align: center; background: #fff; border: 1px dashed #e5e7eb; border-radius: 12px; }
.gd-placeholder-text { margin: 0; color: #9ca3af; font-size: 14px; }

/* 侧栏详情 */
.detail-section-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}
.detail-section-title:not(:first-child) { margin-top: 24px; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.detail-table--pairs tr { border-bottom: 1px solid #f3f4f6; }
.detail-table--pairs td { padding: 8px 10px; text-align: left; }
.dt-label { font-weight: 600; color: #374151; width: 120px; white-space: nowrap; vertical-align: top; }
.dt-value { color: #1f2937; word-break: break-all; }
.detail-desc-block {
  margin-top: 10px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}
.gov-drawer-back {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
}
.gov-drawer-back:hover { border-color: #da203e; color: #da203e; }

/* ===== 审核弹窗 ===== */
.review-modal {
  margin: auto;
  background: #fff;
  border-radius: 12px;
  width: 460px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  animation: reviewModalIn 0.2s ease;
}
.review-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f3f4f6;
}
.review-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.review-modal-close {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}
.review-modal-close:hover { background: #f3f4f6; color: #374151; }
.review-modal-body {
  padding: 20px 24px;
}
.review-modal-ft {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
}

.review-software-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
}
.review-software-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.review-software-ver {
  font-size: 13px;
  color: #6b7280;
}
.review-software-lang {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e5e7eb;
  color: #4b5563;
}

.review-field {
  margin-bottom: 16px;
}
.review-field:last-child {
  margin-bottom: 0;
}
.review-field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.review-radio-group {
  display: flex;
  gap: 12px;
}
.review-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
  user-select: none;
}
.review-radio input {
  display: none;
}
.review-radio:hover {
  border-color: #d1d5db;
}
.review-radio.is-pass {
  border-color: #16a34a;
  background: #f0fdf4;
}
.review-radio.is-fail {
  border-color: #dc2626;
  background: #fef2f2;
}
.review-radio-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s;
}
.review-radio.is-pass .review-radio-dot {
  border-color: #16a34a;
}
.review-radio.is-pass .review-radio-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
}
.review-radio.is-fail .review-radio-dot {
  border-color: #dc2626;
}
.review-radio.is-fail .review-radio-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
}
.review-radio-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
.review-radio.is-pass .review-radio-text { color: #16a34a; }
.review-radio.is-fail .review-radio-text { color: #dc2626; }

.review-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  color: #374151;
  transition: border-color 0.15s;
}
.review-textarea:focus { border-color: #da203e; }
.review-textarea::placeholder { color: #9ca3af; }

/* 不通过填充按钮 */
.gov-btn--danger-fill {
  background: #fff;
  color: #dc2626;
  border-color: #fecaca;
}
.gov-btn--danger-fill:hover { background: #fef2f2; border-color: #dc2626; }
.gov-btn--danger-fill:disabled { opacity: 0.4; cursor: not-allowed; }
.gov-btn--danger-fill:disabled:hover { background: #fff; border-color: #fecaca; color: #dc2626; }

@keyframes reviewModalIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
