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
        <span class="gov-kpi-num">{{ kpiPendingScore }}</span>
        <span class="gov-kpi-label">待评分</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--purple">
        <span class="gov-kpi-num">{{ kpiPendingAssess }}</span>
        <span class="gov-kpi-label">待评估</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--green">
        <span class="gov-kpi-num">{{ kpiPendingWarehouse }}</span>
        <span class="gov-kpi-label">待审批</span>
      </div>
      <div class="gov-kpi-item gov-kpi-item--ok">
        <span class="gov-kpi-num">{{ kpiEntered }}</span>
        <span class="gov-kpi-label">已入库</span>
      </div>
    </div>

    <!-- ===== 治理流程步骤卡片 ===== -->
    <div class="gov-step-cards">
      <button
        v-for="step in steps"
        :key="step.key"
        type="button"
        class="gov-step-card"
        :class="{ 'is-active': activeStep === step.step }"
        @click="activeStep = step.step"
      >
        <span class="gov-step-card-num">{{ step.step }}</span>
        <span class="gov-step-card-body">
          <span class="gov-step-card-label">{{ step.label }}</span>
        </span>
      </button>
    </div>

    <!-- ===== 当前步骤内容 ===== -->
    <div class="gov-content">
      <div class="gov-content-hd">
        <div class="gov-content-info">
          <h2 class="gov-content-title">{{ currentStepMeta.label }}</h2>
          <span v-if="currentStepMeta.description" class="gov-content-desc">{{ currentStepMeta.description }}</span>
        </div>
        <div class="gov-content-actions">
          <!-- 步骤1：源码备份（治理结果由「我的待治理清单」回传后进入本步骤） -->
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
              进入软件评分 ({{ selectedAdvanceableCount }})
            </button>
          </template>

          <!-- 步骤2：软件评分 -->
          <template v-if="activeStep === 2">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="selectedCount === 0"
              @click="startScan"
            >
              开始评分{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              v-if="selectedAdvanceableCount > 0"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceToStep(3)"
            >
              进入治理成果评估 ({{ selectedAdvanceableCount }})
            </button>
          </template>

          <!-- 步骤3：治理成果评估 -->
          <template v-if="activeStep === 3">
            <button
              type="button"
              class="gov-btn gov-btn--primary"
              :disabled="selectedCount === 0"
              @click="openBatchReviewDialog('评审通过')"
            >
              批量评审通过{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              type="button"
              class="gov-btn gov-btn--danger-fill"
              :disabled="selectedCount === 0"
              @click="openBatchReviewDialog('评审不通过')"
            >
              批量评审不通过{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}
            </button>
            <button
              v-if="selectedApprovedCount > 0"
              type="button"
              class="gov-btn gov-btn--advance"
              @click="advanceApproved"
            >
              提交入库审核 ({{ selectedApprovedCount }})
            </button>
          </template>
        </div>
      </div>

      <!-- 步骤1筛选栏：源码备份 -->
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
          <label class="gov-filter-label">导入时间</label>
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

      <!-- 步骤2筛选栏：软件评分 -->
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
          <label class="gov-filter-label">导入时间</label>
          <span class="gov-filter-wrap">
            <input v-model="s2Date" type="date" class="gov-filter-input" />
            <button v-if="s2Date" type="button" class="gov-filter-clear" @click="s2Date = ''">&times;</button>
          </span>
        </div>
      </div>

      <!-- 步骤3筛选栏：治理成果评估 -->
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
          <label class="gov-filter-label">评审状态</label>
          <span class="gov-filter-wrap">
            <select v-model="s3Review" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待评审">待评审</option>
              <option value="评审通过">评审通过</option>
              <option value="评审不通过">评审不通过</option>
            </select>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">验收时间</label>
          <span class="gov-filter-wrap">
            <input v-model="s3Date" type="date" class="gov-filter-input" />
            <button v-if="s3Date" type="button" class="gov-filter-clear" @click="s3Date = ''">&times;</button>
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
          <label class="gov-filter-label">审核状态</label>
          <span class="gov-filter-wrap">
            <select v-model="s4Warehouse" class="gov-filter-input">
              <option value="">全部</option>
              <option value="待审批">待审批</option>
              <option value="已入库">已入库</option>
            </select>
          </span>
        </div>
        <div class="gov-filter-field">
          <label class="gov-filter-label">审核时间</label>
          <span class="gov-filter-wrap">
            <input v-model="s4Date" type="date" class="gov-filter-input" />
            <button v-if="s4Date" type="button" class="gov-filter-clear" @click="s4Date = ''">&times;</button>
          </span>
        </div>
      </div>

      <!-- 源码备份结果提示（校验国内备份地址 + 拉包结果） -->
      <div v-if="backupMsg" class="gov-upload-msg gov-upload-msg--bar">{{ backupMsg }}</div>

      <!-- 全选行 -->
      <div v-if="stepList.length > 0" class="gov-select-all-hint">
        <label class="gov-select-all-label">
          <input type="checkbox" :checked="selectedCount === stepList.length" :indeterminate="selectedCount > 0 && selectedCount < stepList.length" @change="toggleSelectAll" />
          <span>全选所有 <strong>{{ stepList.length }}</strong> 条</span>
        </label>
        <span v-if="selectedCount > 0" class="gov-select-all-count">已选 {{ selectedCount }} 项</span>
      </div>

      <div class="gov-card">
        <table class="gov-table">
          <thead>
            <tr>
              <th class="col-chk">
                <input type="checkbox" v-model="selectAll" :indeterminate="indeterminate" />
              </th>
              <th>名称</th>
              <th>版本</th>
              <th>主语言</th>
              <th>开源许可证</th>
              <th v-if="activeStep === 4">漏洞数</th>
              <th v-if="activeStep === 4">国标评分</th>
              <th v-if="activeStep === 2">国标评分</th>
              <th v-if="activeStep === 2">漏洞数</th>
              <th v-if="activeStep === 2">软件物料清单总数</th>
              <th v-if="activeStep === 3">国标评分</th>
              <th v-if="activeStep !== 2 && activeStep !== 3" class="col-repo">源码地址</th>
              <th v-if="activeStep !== 2 && activeStep !== 3 && activeStep !== 4" class="col-repo">国内备份地址</th>
              <th v-if="activeStep === 1">导入时间</th>
              <th v-if="activeStep === 3">验收时间</th>
              <th v-if="activeStep === 4">审核时间</th>
              <th v-if="activeStep === 1">备份状态</th>
              <th v-if="activeStep === 3">评审状态</th>
              <th v-if="activeStep === 3">评审意见</th>
              <th v-if="activeStep === 4">审核状态</th>
              <th class="col-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in paginatedList" :key="item.id">
              <tr>
                <td class="col-chk">
                  <input type="checkbox" v-model="item.selected" />
                </td>
                <td v-if="activeStep !== 3 && activeStep !== 4 && activeStep !== 2">{{ item.name }}</td>
                <td v-if="activeStep !== 3 && activeStep !== 4 && activeStep !== 2">
                  <button type="button" class="gov-link" @click="goDetail(item)">{{ item.version }}</button>
                </td>
                <td v-if="activeStep === 2">{{ item.name }}</td>
                <td v-if="activeStep === 2">
                  <button type="button" class="gov-link" @click="goDetail(item)">{{ item.version }}</button>
                </td>
                <td v-if="activeStep === 3 || activeStep === 4">{{ item.name }}</td>
                <td v-if="activeStep === 3 || activeStep === 4">
                  <button type="button" class="gov-link" @click="goDetail(item)">{{ item.version }}</button>
                </td>
                <td>{{ item.lang || '—' }}</td>
                <td>{{ item.license || '—' }}</td>
                <td v-if="activeStep === 2">
                  <button
                    type="button"
                    class="gov-link"
                    :class="scoreToneClass(item)"
                    @click="openScoreDialog(item)"
                  >
                    {{ item.nationalScore == null ? '未评分' : item.nationalScore.toFixed(1) }}
                  </button>
                </td>
                <td v-if="activeStep === 2">
                  <span class="gov-vuln-badge" :class="(item.vulnCount || 0) > 0 ? 'vuln--has' : 'vuln--none'">{{ item.vulnCount ?? 0 }}</span>
                </td>
                <td v-if="activeStep === 2" class="gov-muted">{{ item.sbomCount ?? '—' }}</td>
                <td v-if="activeStep === 4">
                  <span class="gov-vuln-badge" :class="(item.vulnCount || 0) > 0 ? 'vuln--has' : 'vuln--none'">{{ item.vulnCount ?? 0 }}</span>
                </td>
                <td v-if="activeStep === 4">
                  <span class="gov-score-readonly" :class="scoreToneClass(item)">
                    {{ item.nationalScore == null ? '未评分' : item.nationalScore.toFixed(1) }}
                  </span>
                </td>
                <td v-if="activeStep === 3">
                  <button
                    type="button"
                    class="gov-link"
                    :class="scoreToneClass(item)"
                    @click="openScoreDialog(item, true)"
                  >
                    {{ item.nationalScore == null ? '未评分' : item.nationalScore.toFixed(1) }}
                  </button>
                </td>
                <td v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3" class="col-repo">
                  <code class="gov-code">{{ item.repoUrl }}</code>
                </td>
                <td v-if="activeStep !== 0 && activeStep !== 2 && activeStep !== 3 && activeStep !== 4" class="col-repo">
                  <code class="gov-code">{{ item.mirrorUrl || '--' }}</code>
                </td>
                <td v-if="activeStep !== 0 && activeStep !== 2" class="gov-muted">{{ item.createdAt }}</td>
                <td v-if="activeStep === 1">
                  <span class="gov-badge" :class="badgeClass(item.backupStatus)">{{ item.backupStatus }}</span>
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
                <template v-if="activeStep === 1">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="goDetail(item)">详情</button>
                </template>
                <template v-if="!(activeStep === 4 && item.warehouseStatus === '已入库')">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub gov-link-sub--danger" @click="openRemoveConfirm(item)">作废</button>
                </template>
                <template v-if="activeStep === 3">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="openReviewModal(item)">评审</button>
                </template>
                <template v-if="activeStep === 2">
                  <span class="gov-sep">|</span>
                  <button type="button" class="gov-link-sub" @click="openScoreDialog(item)">评分</button>
                </template>
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
              <tbody>
              <tr><td class="dt-label">软件名称</td><td class="dt-value">{{ drawerItem.name }}</td></tr>
              <tr><td class="dt-label">版本号</td><td class="dt-value">{{ drawerItem.version }}</td></tr>
              <tr><td class="dt-label">主语言</td><td class="dt-value">{{ drawerItem.lang || '--' }}</td></tr>
              <tr><td class="dt-label">开源许可证</td><td class="dt-value">{{ drawerItem.license || '--' }}</td></tr>
              <tr><td class="dt-label">发布日期</td><td class="dt-value">{{ drawerItem.createdAt ? drawerItem.createdAt.slice(0, 10) : '--' }}</td></tr>
              <tr><td class="dt-label">开发商</td><td class="dt-value">{{ drawerItem.developer || '--' }}</td></tr>
              <tr><td class="dt-label">许可证ID</td><td class="dt-value">{{ drawerItem.licenseId || '--' }}</td></tr>
              </tbody>
            </table>
            <div class="detail-desc-block">
              {{ drawerItem.desc || '暂无描述信息' }}
            </div>
            <h4 class="detail-section-title">参考信息</h4>
            <table class="detail-table detail-table--pairs">
              <tbody>
              <tr><td class="dt-label">官网地址</td><td class="dt-value">{{ drawerItem.repoUrl || '--' }}</td></tr>
              <tr><td class="dt-label">分支</td><td class="dt-value">{{ drawerItem.branch || '--' }}</td></tr>
              <tr><td class="dt-label">社区标签 (Tag)</td><td class="dt-value">{{ drawerItem.tag || '--' }}</td></tr>
              <tr><td class="dt-label">Commit ID</td><td class="dt-value"><code class="gov-code">{{ drawerItem.commitId || '--' }}</code></td></tr>
              <tr><td class="dt-label">软件文件</td><td class="dt-value">{{ drawerItem.file || '--' }}</td></tr>
              <tr><td class="dt-label">代码量 (KL)</td><td class="dt-value">{{ drawerItem.codeSize || '--' }}</td></tr>
              <tr><td class="dt-label">源码托管地址</td><td class="dt-value">{{ drawerItem.repoUrl || '--' }}</td></tr>
              <tr><td class="dt-label">国内备份地址</td><td class="dt-value">{{ drawerItem.mirrorUrl || '--' }}<span class="dt-hint">仅支持 AtomGit</span></td></tr>
              <tr><td class="dt-label">漏洞披露地址</td><td class="dt-value">{{ drawerItem.vulnUrl || '--' }}</td></tr>
              </tbody>
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
          <span class="gd-hero-time">导入时间：{{ detailItem.createdAt || '--' }}</span>
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
                <dt>开源许可证</dt>
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
            <div class="gd-report-item"><span>软件物料清单报告</span><span class="gd-badge-sm gd-badge-sm--ok">已生成</span></div>
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
    <!-- ===== 评审弹窗 ===== -->
    <Teleport to="body">
      <div v-if="reviewItem" class="gov-overlay" @click.self="reviewItem = null">
        <div class="review-modal">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">评审</h3>
            <button type="button" class="review-modal-close" @click="reviewItem = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <div class="review-software-bar">
              <span class="review-software-name">{{ reviewItem.name }}</span>
              <span class="review-software-ver">v{{ reviewItem.version }}</span>
              <span class="review-software-lang">{{ reviewItem.lang }}</span>
            </div>
            <!-- 国标评分：作为验收依据展示（评分未完成时提示） -->
            <div class="review-score">
              <span class="review-score-label">国标评分</span>
              <span class="review-score-val" :class="{ 'is-empty': reviewItem.nationalScore == null }">
                {{ reviewItem.nationalScore == null ? '未评分' : reviewItem.nationalScore.toFixed(1) }}
              </span>
              <span class="review-score-hint" v-if="reviewItem.nationalScore == null">该软件尚未完成评分，建议先评分再验收</span>
            </div>
            <div class="review-field">
              <label class="review-field-label">评审结果</label>
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
              <label class="review-field-label">评审意见</label>
              <textarea v-model="reviewComment" class="review-textarea" rows="3" placeholder="请输入评审意见..." />
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

    <!-- ===== 批量评审弹窗 ===== -->
    <Teleport to="body">
      <div v-if="batchReviewTarget" class="gov-overlay" @click.self="batchReviewTarget = null">
        <div class="review-modal">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">批量{{ batchReviewTarget === '评审通过' ? '评审通过' : '评审不通过' }}</h3>
            <button type="button" class="review-modal-close" @click="batchReviewTarget = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <p class="review-modal-desc">
              确定将选中的 <strong>{{ selectedCount }}</strong> 项软件批量{{ batchReviewTarget === '评审通过' ? '通过' : '不通过' }}评审？请填写评审意见：
            </p>
            <div class="review-field">
              <label class="review-field-label">评审意见</label>
              <textarea v-model="batchReviewOpinion" class="review-textarea" rows="4" placeholder="请输入评审意见（必填）" />
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

    <!-- ===== 作废确认弹窗 ===== -->
    <Teleport to="body">
      <div v-if="removeConfirmItem" class="gov-overlay" @click.self="cancelRemove">
        <div class="review-modal" style="width:480px;">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">作废软件</h3>
            <button type="button" class="review-modal-close" @click="cancelRemove">&times;</button>
          </div>
          <div class="review-modal-body">
            <p class="review-modal-desc">
              确定作废 <strong>{{ removeConfirmItem.name }} v{{ removeConfirmItem.version }}</strong> 吗？作废后将从治理流程中移除，且<strong>不可恢复</strong>。
            </p>
            <div class="review-field">
              <label class="review-field-label">作废原因 <span style="color:#da203e;">*</span></label>
              <textarea v-model="removeReason" class="review-textarea" rows="3" placeholder="请填写作废原因" />
              <p class="review-modal-desc" style="margin:6px 0 0;color:#d97706;">
                作废原因将展示给提交该软件的用户，请如实填写。
              </p>
            </div>
          </div>
          <div class="review-modal-ft">
            <button type="button" class="gov-btn" @click="cancelRemove">取消</button>
            <button
              type="button"
              class="gov-btn gov-btn--danger-fill"
              :disabled="!removeReason.trim()"
              @click="confirmRemove"
            >确认作废</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== 评审意见历史弹窗 ===== -->
    <Teleport to="body">
      <div v-if="opinionHistoryItem" class="gov-overlay" @click.self="opinionHistoryItem = null">
        <div class="review-modal" style="width:560px;">
          <div class="review-modal-hd">
            <h3 class="review-modal-title">评审意见历史</h3>
            <button type="button" class="review-modal-close" @click="opinionHistoryItem = null">&times;</button>
          </div>
          <div class="review-modal-body">
            <p class="review-modal-desc">
              <strong>{{ opinionHistoryItem.name }} {{ opinionHistoryItem.version }}</strong> 的评审意见修改记录：
            </p>
            <div class="opinion-history-wrap">
              <table class="gov-table">
                <thead>
                  <tr>
                    <th>评审结果</th>
                    <th>评审意见</th>
                    <th>操作人</th>
                    <th>操作时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!opinionHistoryItem.reviewHistory || opinionHistoryItem.reviewHistory.length === 0">
                    <td colspan="4" class="gov-empty-sm">暂无评审记录</td>
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

    <!-- ===== 指标评分弹窗 ===== -->
    <IndicatorScoreDialog
      :visible="!!scoreItem"
      :item="scoreItem"
      :readonly="scoreReadonly"
      @update:visible="(v) => { if (!v) scoreItem = null }"
      @save="saveScore"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import IndicatorScoreDialog from '../../components/gov/IndicatorScoreDialog.vue'
import { INDICATORS, calcNationalScore, autoScoreRecord } from '../../data/govIndicators.js'
import { getInboundRequests, updateInboundStatus } from '../../data/inboundRequests.js'

const logItem = ref(null)
const detailItem = ref(null)
const drawerItem = ref(null)
const reviewItem = ref(null)
const reviewResult = ref('评审通过')
const reviewComment = ref('')
const activeStep = ref(1)
const batchReviewTarget = ref(null)
const batchReviewOpinion = ref('')
const opinionHistoryItem = ref(null)
const scoreItem = ref(null)
const scoreReadonly = ref(false)
const backupMsg = ref('')

// 步骤1筛选：源码备份
const s1Name = ref('')
const s1Version = ref('')
const s1Date = ref('')
const s1Backup = ref('')

// 步骤2筛选：软件评分
const s2Name = ref('')
const s2Version = ref('')
const s2Date = ref('')

// 步骤3筛选：治理成果评估
const s3Name = ref('')
const s3Version = ref('')
const s3Date = ref('')
const s3Review = ref('')

// 步骤4筛选：提交入库
const s4Name = ref('')
const s4Version = ref('')
const s4Date = ref('')
const s4Warehouse = ref('')

// ===== 治理流程步骤定义 =====
// step 为内部阶段号，与软件条目的 currentStep 一一对应。「软件获取」不再单列一步：
// 治理结果回传后软件直接进入第一步（源码备份）。
const steps = [
  { key: 'backup', label: '源码备份', step: 1 },
  { key: 'score', label: '软件评分', step: 2 },
  { key: 'assess', label: '治理成果评估', step: 3 },
  { key: 'warehouse', label: '提交入库', step: 4 },
]

/** 当前步骤定义（页头标题/描述用） */
const currentStepMeta = computed(() => steps.find(s => s.step === activeStep.value) || steps[0])

/** 阶段号 → 步骤名（日志文案用） */
function stepLabel(step) {
  const hit = steps.find(s => s.step === step)
  return hit ? hit.label : '—'
}

// ===== 数据模型：使用共享 store（审批入库页复用同一份软件列表） =====
import { softwareList, genId, voidSoftware } from '../../data/governanceStore.js'

// 当前步骤的列表
const stepList = computed(() => {
  // 阶段号与步骤一一对应：1 源码备份 / 2 软件评分 / 3 治理成果评估 / 4 提交入库
  let list = softwareList.value.filter(item => item.currentStep === activeStep.value)

  // 步骤1：源码备份
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

  // 步骤2：软件评分
  if (activeStep.value === 2) {
    const name = s2Name.value.trim().toLowerCase()
    const version = s2Version.value.trim().toLowerCase()
    const date = s2Date.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (date) list = list.filter(i => i.createdAt && i.createdAt.startsWith(date))
  }

  // 步骤3：治理成果评估
  if (activeStep.value === 3) {
    const name = s3Name.value.trim().toLowerCase()
    const version = s3Version.value.trim().toLowerCase()
    const date = s3Date.value
    const review = s3Review.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (date) list = list.filter(i => i.createdAt && i.createdAt.startsWith(date))
    if (review) list = list.filter(i => i.reviewStatus === review)
  }

  // 步骤4：提交入库
  if (activeStep.value === 4) {
    const name = s4Name.value.trim().toLowerCase()
    const version = s4Version.value.trim().toLowerCase()
    const date = s4Date.value
    const warehouse = s4Warehouse.value
    if (name) list = list.filter(i => i.name.toLowerCase().includes(name))
    if (version) list = list.filter(i => i.version.toLowerCase().includes(version))
    if (warehouse) list = list.filter(i => i.warehouseStatus === warehouse)
  }

  return list
})

// ===== KPI 计算 =====
const totalCount = computed(() => softwareList.value.length)
// ===== KPI 口径（与四步一一对应）=====
// 待备份 = 处于步骤1（源码备份）；待评分 = 步骤2（软件评分）；待评估 = 步骤3（治理成果评估）
const kpiPendingBackup = computed(() => softwareList.value.filter(i => i.currentStep === 1).length)
const kpiPendingScore = computed(() => softwareList.value.filter(i => i.currentStep === 2).length)
const kpiPendingAssess = computed(() => softwareList.value.filter(i => i.currentStep === 3).length)
const kpiPendingWarehouse = computed(() => softwareList.value.filter(i => i.currentStep === 4 && i.warehouseStatus === '待审批').length)
const kpiEntered = computed(() => softwareList.value.filter(i => i.currentStep === 4 && i.warehouseStatus === '已入库').length)


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

// 本页已全选，且还有未选中的条目时，显示全选所有页的提示
const showSelectAllHint = computed(() =>
  paginatedList.value.length > 0
  && paginatedList.value.every(i => i.selected)
  && selectedCount.value < stepList.value.length
)

function toggleSelectAll() {
  if (selectedCount.value === stepList.value.length) {
    stepList.value.forEach(i => { i.selected = false })
  } else {
    stepList.value.forEach(i => { i.selected = true })
  }
}

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
  if (activeStep.value === 1) return list.filter(i => i.backupStatus === '备份成功').length
  // 步骤3 → 4：需评估完成且已完成国标评分（评分是准入必要条件）
  if (activeStep.value === 2) return list.filter(i => i.assessStatus === '评估完成' && isBaselineEligible(i)).length
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

// 表格列数（步骤2 含国标评分/漏洞数/软件物料清单总数；步骤4 含漏洞数/国标评分）
const colSpan = computed(() => {
  const counts = { 1: 10, 2: 9, 3: 10, 4: 11 }
  return counts[activeStep.value] || 9
})

// 空提示
const emptyText = computed(() => {
  const map = {
    1: '暂无软件，请到「我的待治理清单」下载治理模板、维护后回传清单，软件将进入本列表',
    2: '暂无待评分软件',
    3: '暂无待评估软件',
    4: '暂无待审批软件',
  }
  return map[activeStep.value] || '暂无数据'
})

// ===== 徽标映射 =====
const statusBadgeMap = {
  '待备份': 'warn', '备份中': 'run', '备份成功': 'ok', '备份失败': 'fail',
  '待评估': 'warn', '评估中': 'run', '评估完成': 'ok', '评估失败': 'fail',
  '待评审': 'warn', '评审通过': 'ok', '评审不通过': 'fail', '有条件通过': 'warn',
  '待处理': 'warn', '已处理': 'ok',
  '待审批': 'warn', '已入库': 'ok', '已拒绝': 'fail', '已作废': 'fail', '待发布': 'ok', '不通过': 'fail',
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
  s1Name, s1Version, s1Date, s1Backup,
  s2Name, s2Version, s2Date,
  s3Name, s3Version, s3Date, s3Review,
  s4Name, s4Version, s4Date, s4Warehouse,
], () => {
  page.value = 1
})


// 步骤1：发起源码备份（只改状态，不推进）
// 国内备份地址由治理负责人在回传的治理结果里填写，此处只做校验并据此拉包，不生成/改写地址。
function startBackup() {
  const selected = stepList.value.filter(i => i.selected && i.backupStatus === '待备份')
  if (selected.length === 0) return
  const now = new Date().toLocaleString('zh-CN')
  let failed = 0
  selected.forEach(item => {
    item.selected = false
    const url = (item.mirrorUrl || '').trim()
    // 校验 1：地址必须已随治理结果回传
    if (!url) {
      failed += 1
      item.backupStatus = '备份失败'
      item.logs.push({ time: now, level: 'warn', msg: '备份失败：未回传国内备份地址，请先在治理结果中补充后重新回传' })
      return
    }
    // 校验 2：国内备份地址当前仅支持 AtomGit 平台
    if (!/^https?:\/\/atomgit\.com\//i.test(url)) {
      failed += 1
      item.backupStatus = '备份失败'
      item.logs.push({ time: now, level: 'warn', msg: `备份失败：国内备份地址仅支持 AtomGit 平台（当前：${url}）` })
      return
    }
    item.backupStatus = '备份中'
    item.logs.push({ time: now, level: 'info', msg: `国内备份地址校验通过，开始从 ${url} 拉取源码包...` })
    setTimeout(() => {
      item.backupStatus = '备份成功'
      item.lastSync = new Date().toLocaleString('zh-CN')
      item.logs.push({ time: item.lastSync, level: 'ok', msg: '源码备份完成，备份状态已更新为「备份成功」' })
    }, 2000)
  })
  const total = selected.length
  const ok = total - failed
  backupMsg.value = failed === 0
    ? `已校验国内备份地址并拉取源码包：${ok} 条备份成功`
    : `${ok} 条已发起备份，${failed} 条校验未通过（国内备份地址缺失或非 AtomGit 地址），已置为「备份失败」`
  setTimeout(() => { backupMsg.value = '' }, 5000)
}

// 步骤2：启动扫描（带进度条动画）
function startScan() {
  const selected = stepList.value.filter(i => i.selected)
  const now = new Date().toLocaleString('zh-CN')

  selected.forEach((item) => {
    item.selected = false
    item.assessStatus = '评估中'
    item.scaProgress = 0
    item.copyrightProgress = 0
    item.malwareProgress = 0
    item.logs.push({ time: now, level: 'info', msg: '启动 SCA 扫描、恶意代码扫描...' })

    // 三个并行扫描（不同速度模拟）
    const intervals = []
    intervals.push(setInterval(() => {
      if (item.scaProgress < 100) {
        item.scaProgress = Math.min(100, (item.scaProgress || 0) + Math.floor(Math.random() * 12) + 5)
      } else {
        clearInterval(intervals[0])
      }
    }, 300 + Math.random() * 200))

    intervals.push(setInterval(() => {
      if (item.copyrightProgress < 100) {
        item.copyrightProgress = Math.min(100, (item.copyrightProgress || 0) + Math.floor(Math.random() * 10) + 3)
      } else {
        clearInterval(intervals[1])
      }
    }, 300 + Math.random() * 200))

    intervals.push(setInterval(() => {
      if (item.malwareProgress < 100) {
        item.malwareProgress = Math.min(100, (item.malwareProgress || 0) + Math.floor(Math.random() * 8) + 2)
      } else {
        clearInterval(intervals[2])
      }
    }, 300 + Math.random() * 200))

    // 监听全部完成后更新状态
    const checkDone = setInterval(() => {
      if ((item.scaProgress || 0) >= 100 && (item.copyrightProgress || 0) >= 100 && (item.malwareProgress || 0) >= 100) {
        clearInterval(checkDone)
        intervals.forEach(i => clearInterval(i))
        setTimeout(() => {
          item.assessStatus = '评估完成'
          // 扫描完成：自动指标自动算分并汇总国标评分
          applyAutoScores(item)
          item.logs.push({ time: new Date().toLocaleString('zh-CN'), level: 'ok', msg: '评估完成，生成治理报告' })
        }, 500)
      }
    }, 200)
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
  reviewItem.value.logs.push({ time: now, level: reviewResult.value === '评审通过' ? 'ok' : 'warn', msg: `评审结果：${reviewResult.value}，意见：${reviewComment.value || '无'}` })
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
    item.logs.push({ time: now, level: status === '评审通过' ? 'ok' : 'warn', msg: `批量评审：${status}，意见：${opinion}` })
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
    item.currentStep = 4
    item.warehouseStatus = '待审批'
    item.selected = false
    item.logs.push({ time: now, level: 'info', msg: '已提交入库审核，等待平台管理员审批' })
  })
  activeStep.value = 4
}


/** 按软件名回写入库需求清单状态：该清单中任一软件被同意入库 → 清单标记已入库 */
function syncInboundStatusBySoftware(item) {
  const list = getInboundRequests()
  list.forEach((r) => {
    if (r.status === '已入库') return
    const hit = (r.items || []).some((x) => x.name && x.name.toLowerCase() === (item.name || '').toLowerCase())
    if (hit) updateInboundStatus(r.id, '已入库')
  })
}

/** 库主：批量提交平台审批（待审批） */
function confirmSubmitApproval() {
  const selected = stepList.value.filter(i => i.selected)
  const now = fmtNow()
  selected.forEach(item => {
    item.selected = false
    item.warehouseStatus = '待审批'
    item.logs.push({ time: now, level: 'info', msg: '已提交平台审批，等待平台管理员审批' })
  })
}

/** 库主：单条提交平台审批（待审批） */
function singleSubmitApproval(item) {
  const now = fmtNow()
  item.warehouseStatus = '待审批'
  item.logs.push({ time: now, level: 'info', msg: '已提交平台审批，等待平台管理员审批' })
}

/** 平台管理员：批量同意入库（回写清单状态） */
function confirmWarehouse(status) {
  const selected = stepList.value.filter(i => i.selected)
  const now = fmtNow()
  selected.forEach(item => {
    // 入库前校验：未完成国标评分的软件不允许入库
    if (item.nationalScore == null) {
      item.logs.push({ time: now, level: 'warn', msg: '未完成国标评分，无法入库' })
      return
    }
    item.selected = false
    item.warehouseStatus = status
    item.logs.push({ time: now, level: status === '待发布' ? 'ok' : 'ok', msg: `平台管理员同意入库：${status}` })
    syncInboundStatusBySoftware(item)
  })
}

/** 平台管理员：单条同意入库（回写清单状态） */
function singleWarehouse(item, status) {
  const now = fmtNow()
  // 入库前校验：未完成国标评分的软件不允许入库
  if (item.nationalScore == null) {
    item.logs.push({ time: now, level: 'warn', msg: '未完成国标评分，无法入库' })
    return
  }
  item.warehouseStatus = status
  item.logs.push({ time: now, level: 'ok', msg: `平台管理员同意入库：${status}` })
  syncInboundStatusBySoftware(item)
}

// ===== 指标评分 =====
// readonly = true：查看评分细则（治理成果评估步骤已不能重新评分，评分由系统按治理结果自动完成）
function openScoreDialog(item, readonly = false) {
  scoreReadonly.value = readonly
  scoreItem.value = item
}

function saveScore(scores) {
  if (!scoreItem.value || scoreReadonly.value) return
  const item = scoreItem.value
  item.indicatorScores = scores
  item.nationalScore = calcNationalScore(scores)
  item.logs.push({
    time: fmtNow(),
    level: 'ok',
    msg: `国标评分完成：${item.nationalScore == null ? '未评分' : item.nationalScore.toFixed(1)} 分`,
  })
}

// ===== 基线准入判断：基线指标全部合格 + 持续供应能力(bl-14) ≥ 6 分 =====
// 基线指标全部合格 = 每项基线指标均已评分且得分 > 0（0 分视为不合格）
function isBaselineEligible(item) {
  const scores = item?.indicatorScores || {}
  const baseline = INDICATORS.filter(i => i.level === '基线')
  const allPassed = baseline.every(ind => {
    const s = scores[ind.id]?.score
    return typeof s === 'number' && s > 0
  })
  if (!allPassed) return false
  // 持续供应能力（bl-14）需 ≥ 6 分
  const supplyScore = scores['bl-14']?.score
  return typeof supplyScore === 'number' && supplyScore >= 6
}

// 国标评分列色调：达标（基线合格 + bl-14≥6）绿 / 未达标红 / 未评分置灰
function scoreToneClass(item) {
  if (item.nationalScore == null) return 'gov-score-empty'
  return isBaselineEligible(item) ? 'gov-score-ok' : 'gov-score-bad'
}

// 扫描完成后自动算分：仅对具备自动评分能力的指标按扫描数据打分，并汇总国标评分。
// 非自动（人工）指标保持未评分（null），需在评分弹窗中手动评定后方可满足基线准入。
function applyAutoScores(item) {
  const scores = { ...(item.indicatorScores || {}) }
  INDICATORS.forEach((ind) => {
    if (!ind.capable) return
    const auto = autoScoreRecord(ind, item)
    if (auto) {
      scores[ind.id] = { score: auto.score, params: { ...auto.params } }
    }
  })
  item.indicatorScores = scores
  item.nationalScore = calcNationalScore(scores)
  item.logs.push({
    time: fmtNow(),
    level: 'info',
    msg: '扫描完成，自动指标已评分',
  })
}

// ===== 推进到下一步（只推进选中的且状态已完成的条目） =====
function advanceToStep(targetStepIndex) {
  const list = stepList.value.filter(i => i.selected)
  let eligible = []
  if (activeStep.value === 1) {
    eligible = list.filter(i => i.backupStatus === '备份成功')
  } else if (activeStep.value === 2) {
    // 步骤3 → 4：需评估完成且基线准入通过（基线全部合格 + bl-14 ≥ 6）
    eligible = list.filter(i => i.assessStatus === '评估完成' && isBaselineEligible(i))
  } else if (activeStep.value === 3) {
    eligible = list.filter(i => i.reviewStatus === '评审通过')
  }

  const now = new Date().toLocaleString('zh-CN')
  eligible.forEach(item => {
    item.currentStep = targetStepIndex
    item.selected = false
    item.logs.push({ time: now, level: 'info', msg: `推进至「${stepLabel(targetStepIndex)}」` })
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
    { key: 'copyright', name: '版权检测', ok: p >= 66 },
    { key: 'malware', name: '恶意代码检测', ok: p >= 100 },
    { key: 'sbom', name: '软件物料清单分析', ok: p >= 33 },
    { key: 'vuln', name: '漏洞分析', ok: p >= 66 },
    { key: 'license', name: '许可证分析', ok: p >= 66 },
  ]
})

function copyRepo(url) {
  navigator.clipboard?.writeText(url || '').catch(() => {})
}

function detailTimeline(item) {
  return [
    { action: '治理结果回传', time: item.createdAt || '--', level: 'info' },
    { action: '源码备份', time: item.backupStatus === '备份成功' ? (item.lastSync || item.createdAt || '--') : '--', level: item.backupStatus === '备份成功' ? 'ok' : 'pending' },
    { action: '软件评分', time: item.assessStatus === '评估完成' ? (item.createdAt || '--') : '--', level: item.assessStatus === '评估完成' ? 'ok' : 'pending' },
    { action: '治理成果评估', time: item.reviewStatus && item.reviewStatus !== '待评审' ? (item.createdAt || '--') : '--', level: item.reviewStatus === '评审通过' ? 'ok' : item.reviewStatus === '评审不通过' ? 'fail' : 'pending' },
    { action: '提交入库', time: item.warehouseStatus === '已入库' ? (item.warehouseTime || '--') : '--', level: item.warehouseStatus === '已入库' ? 'ok' : 'pending' },
  ]
}

// ===== 作废软件（二次确认 + 必填原因 + 审计记录，不可逆） =====
const removeConfirmItem = ref(null)
const removeReason = ref('')

function openRemoveConfirm(item) {
  removeConfirmItem.value = item
  removeReason.value = ''
}

function cancelRemove() {
  removeConfirmItem.value = null
  removeReason.value = ''
}

function confirmRemove() {
  const item = removeConfirmItem.value
  const reason = removeReason.value.trim()
  if (!item || !reason) return
  // 作废：从软件治理列表移除，记录到已作废清单（审核入库不再可见，原因保留展示）
  voidSoftware(item, reason)
  const now = fmtNow()
  removedAudit.value.unshift({
    time: now,
    name: item.name,
    version: item.version,
    action: '作废',
    reason,
  })
  removeConfirmItem.value = null
  removeReason.value = ''
}

/** 审计记录列表（仅本次会话，前端演示） */
const removedAudit = ref([])

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

/* 行内动作的结果提示 */
.gov-upload-msg {
  font-size: 12px;
  color: #16a34a;
  white-space: nowrap;
}
.gov-upload-msg--bar {
  display: block;
  margin: 0 0 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  white-space: normal;
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

/* ===== 评审意见列 ===== */
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

/* ===== 评审意见历史 ===== */
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

/* 工具栏按钮统一宽度，避免切换步骤时按钮宽度跳动 */
.gov-content-actions .gov-btn {
  justify-content: center;
  min-width: 108px;
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
/* ===== 评审编辑控件 ===== */
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
.gov-link.is-empty { color: #d1d5db; font-weight: 400; }
.gov-link.is-empty:hover { color: #da203e; }

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

/* 软件入库：审核状态（拒绝原因记录在日志中） */

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
.gov-page-selected {
  font-size: 12px;
  color: #da203e;
  font-weight: 500;
  margin-left: 8px;
}
.gov-page-select-all {
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid #da203e;
  background: #fff;
  font: inherit;
  font-size: 12px;
  color: #da203e;
  cursor: pointer;
  border-radius: 4px;
  line-height: 20px;
}
.gov-page-select-all:hover {
  background: #da203e;
  color: #fff;
}

/* 全选行 */
.gov-select-all-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  margin-bottom: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.gov-select-all-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}
.gov-select-all-label input[type="checkbox"] {
  margin: 0;
  accent-color: #da203e;
}
.gov-select-all-count {
  font-size: 12px;
  color: #da203e;
  font-weight: 500;
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
.gov-log-msg { color: #374151; flex: 1;margin-left: 10px; }

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
.dt-hint { margin-left: 8px; font-size: 12px; color: #9ca3af; }
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

/* ===== 评审弹窗 ===== */
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

/* 评审弹窗：国标评分展示 */
.review-score {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #eceef2;
  border-left: 3px solid #da203e;
  border-radius: 8px;
}
.review-score-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.review-score-val {
  font-size: 18px;
  font-weight: 800;
  color: #16a34a;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.review-score-val.is-empty {
  color: #d1d5db;
}
.review-score-hint {
  margin-left: auto;
  font-size: 11px;
  color: #d97706;
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

/* 漏洞数徽标 */
.gov-vuln-badge {
  display: inline-block;
  min-width: 24px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  line-height: 20px;
}
.gov-vuln-badge.vuln--none {
  background: #dcfce7;
  color: #166534;
}
.gov-vuln-badge.vuln--has {
  background: #fee2e2;
  color: #991b1b;
}
/* 国标评分只读展示（入库阶段不允许修改评分） */
.gov-score-readonly {
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
  font-variant-numeric: tabular-nums;
  cursor: default;
}
.gov-score-readonly.is-empty {
  color: #d1d5db;
  font-weight: 500;
}
/* 国标评分列色调：达标绿 / 不达标红 / 未评分置灰 */
.gov-link.gov-score-ok,
.gov-score-readonly.gov-score-ok {
  color: #16a34a;
}
.gov-link.gov-score-bad,
.gov-score-readonly.gov-score-bad {
  color: #dc2626;
}
.gov-link.gov-score-empty,
.gov-score-readonly.gov-score-empty {
  color: #d1d5db;
  font-weight: 500;
}
</style>
